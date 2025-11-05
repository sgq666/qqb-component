import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col,
  Input,
  List,
  Select,
  Divider,
  Progress,
  message,
  Upload,
  UploadProps,
  Spin,
  Tabs
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 定义数据类型
interface ItemA {
  name: string;
  code?: string;
}

interface ItemB {
  name: string;
  code: string;
}

interface MatchResult {
  itemA: ItemA;
  itemB: ItemB | null;
  similarity: number;
  status: 'matched' | 'pending' | 'manual';
}

// 本地存储的键名
const LOCAL_STORAGE_KEY = 'dataMatcher_matches';

// 保存匹配结果到本地存储
const saveMatchesToLocalStorage = (matches: MatchResult[]) => {
  try {
    const dataToSave = matches.map(match => ({
      itemA: match.itemA,
      itemB: match.itemB,
      similarity: match.similarity,
      status: match.status
    }));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.error('保存匹配结果到本地存储失败:', e);
  }
};

// 从本地存储加载匹配结果
const loadMatchesFromLocalStorage = (): MatchResult[] | null => {
  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // 确保数据结构正确
      if (Array.isArray(parsedData)) {
        return parsedData.map(item => ({
          itemA: { name: item.itemA.name, code: item.itemA.code },
          itemB: item.itemB,
          similarity: item.similarity,
          status: item.status
        }));
      }
    }
  } catch (e) {
    console.error('从本地存储加载匹配结果失败:', e);
  }
  return null;
};

// 清除本地存储的匹配结果
const clearMatchesFromLocalStorage = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error('清除本地存储的匹配结果失败:', e);
  }
};

// 计算两个字符串的相似度（使用优化的算法）
const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  // 如果完全相同，直接返回1
  if (str1 === str2) return 1;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  // 对于很长的字符串，使用简化算法
  if (len1 > 100 || len2 > 100) {
    // 使用包含检查作为快速近似
    if (str1.includes(str2) || str2.includes(str1)) {
      return Math.min(len1, len2) / Math.max(len1, len2);
    }
    return 0;
  }
  
  // 创建较小的矩阵以节省内存
  const maxLength = Math.max(len1, len2);
  if (maxLength > 1000) {
    // 对于非常长的字符串，使用简化算法
    const commonChars = str1.split('').filter(char => str2.includes(char)).length;
    return commonChars / maxLength;
  }
  
  // 使用Levenshtein距离算法
  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  // 填充矩阵
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // 删除
        matrix[i][j - 1] + 1, // 插入
        matrix[i - 1][j - 1] + cost // 替换
      );
    }
  }
  
  // 计算相似度（0-1之间）
  const distance = matrix[len1][len2];
  const maxLength2 = Math.max(len1, len2);
  return 1 - distance / maxLength2;
};



const DataMatcher: React.FC = () => {
  // 状态管理
  const [arrayA, setArrayA] = useState<ItemA[]>([]);
  const [arrayB, setArrayB] = useState<ItemB[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [arrayAType, setArrayAType] = useState<'string' | 'object'>('string'); // 数组A的类型
  const [showMatched, setShowMatched] = useState(true); // 是否显示已匹配数据
  const [showUnmatched, setShowUnmatched] = useState(true); // 是否显示未匹配数据
  const [recommendedItems, setRecommendedItems] = useState<{ item: ItemB; similarity: number }[]>([]); // 推荐匹配项
  const [recommendedOffset, setRecommendedOffset] = useState(0); // 推荐匹配项偏移量
  const [recommendedLimit] = useState(5); // 推荐匹配项每次加载数量（改为5条）
  
  // 已匹配数据分页和搜索状态
  const [matchedPagination, setMatchedPagination] = useState({ current: 1, pageSize: 10 });
  const [matchedSearch, setMatchedSearch] = useState('');
  const [matchedFilter, setMatchedFilter] = useState<'all' | 'code' | 'name' | 'manual'>('all');
  
  // 未匹配数据分页状态
  const [unmatchedPagination, setUnmatchedPagination] = useState({ current: 1, pageSize: 10 });
  const [unmatchedSearch, setUnmatchedSearch] = useState('');
  
  // 权重设置
  const [fieldLimit, setFieldLimit] = useState(0); // 前x个字段
  const [weightPercentage, setWeightPercentage] = useState(100); // 权重百分比
  
  // 组件加载时尝试从本地存储恢复数据
  useEffect(() => {
    const savedMatches = loadMatchesFromLocalStorage();
    if (savedMatches) {
      setMatches(savedMatches);
      message.info('已从本地存储恢复之前的匹配进度');
    }
  }, []);
  
  // 当匹配结果发生变化时，保存到本地存储
  useEffect(() => {
    if (matches.length > 0) {
      saveMatchesToLocalStorage(matches);
    }
  }, [matches]);
  
  // 查找最佳匹配项（支持权重设置）
  const findBestMatches = (itemA: ItemA, arrayB: ItemB[], threshold: number = 0.6): { item: ItemB; similarity: number }[] => {
    const matches = arrayB.map(itemB => {
      // 如果设置了字段限制
      if (fieldLimit > 0) {
        // 只考虑前fieldLimit个字符
        const itemAName = itemA.name.substring(0, fieldLimit);
        const itemBName = itemB.name.substring(0, fieldLimit);
        
        // 计算前fieldLimit个字符的相似度
        const limitedSimilarity = calculateSimilarity(itemAName, itemBName);
        
        // 如果权重是100%，只使用前x个字段的相似度
        if (weightPercentage === 100) {
          return {
            item: itemB,
            similarity: limitedSimilarity
          };
        }
        
        // 计算完整字段的相似度
        const fullSimilarity = calculateSimilarity(itemA.name, itemB.name);
        
        // 按权重计算综合相似度
        const weightedSimilarity = (limitedSimilarity * weightPercentage + fullSimilarity * (100 - weightPercentage)) / 100;
        
        return {
          item: itemB,
          similarity: weightedSimilarity
        };
      }
      
      // 默认情况：计算完整字段的相似度
      return {
        item: itemB,
        similarity: calculateSimilarity(itemA.name, itemB.name)
      };
    });
    
    // 过滤掉低于阈值的匹配
    const filteredMatches = matches.filter(match => match.similarity >= threshold);
    
    // 按相似度降序排序，只返回前10个
    return filteredMatches.sort((a, b) => b.similarity - a.similarity).slice(0, 10);
  };
  
  // 清除本地存储的匹配结果
  const clearLocalStorage = () => {
    clearMatchesFromLocalStorage();
    setMatches([]);
    setCurrentMatchIndex(0);
    message.success('已清除本地存储的匹配结果');
  };
  
  // 处理数组A的JSON输入
  const handleArrayAChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        // 检查数组元素类型
        if (parsed.every(item => typeof item === 'string')) {
          // 字符串数组
          setArrayAType('string');
          const result: ItemA[] = parsed.map(item => ({ name: item }));
          setArrayA(result);
        } else if (parsed.every(item => 
          typeof item === 'object' && item !== null && 'name' in item
        )) {
          // 对象数组
          setArrayAType('object');
          const result: ItemA[] = parsed.map(item => ({
            name: typeof item.name === 'string' ? item.name : '',
            code: 'code' in item && typeof item.code === 'string' ? item.code : undefined
          }));
          setArrayA(result);
        } else {
          message.error('数组A格式不正确，应为字符串数组或包含name字段的对象数组');
        }
      } else {
        message.error('数组A必须是数组格式');
      }
    } catch (e) {
      message.error('无效的JSON格式');
    }
  };
  
  // 处理数组B的JSON输入
  const handleArrayBChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.every(item => 
        typeof item === 'object' && item !== null && 'name' in item && 'code' in item
      )) {
        setArrayB(parsed);
      } else {
        message.error('数组B必须是包含name和code字段的对象数组');
      }
    } catch (e) {
      message.error('无效的JSON格式');
    }
  };
  
  // 处理Excel文件上传
  const handleExcelUpload = (file: File, arrayType: 'A' | 'B') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        // 获取第一个工作表
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // 将工作表转换为JSON格式
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 1) {
          message.error("Excel文件为空");
          return;
        }
        
        if (arrayType === 'A') {
          // 处理数组A（可以是字符串数组或对象数组）
          const headers = jsonData[0] as string[];
          let nameIndex = -1;
          let codeIndex = -1;
          
          // 查找name和code列
          headers.forEach((header, index) => {
            if (header && header.toLowerCase().includes("name")) {
              nameIndex = index;
            }
            if (header && header.toLowerCase().includes("code")) {
              codeIndex = index;
            }
          });
          
          const rows = jsonData.slice(1); // 跳过标题行
          const result: ItemA[] = [];
          
          if (nameIndex === -1) {
            // 如果没有找到name列，假设第一列是name
            nameIndex = 0;
          }
          
          rows.forEach((row: any[]) => {
            if (row && row.length > nameIndex) {
              const name = row[nameIndex] ? String(row[nameIndex]).trim() : "";
              const code = codeIndex !== -1 && row[codeIndex] ? String(row[codeIndex]).trim() : undefined;
              
              if (name) {
                result.push({ name, code });
              }
            }
          });
          
          setArrayA(result);
          setArrayAType('object'); // Excel上传的数组A默认为对象数组
          message.success(`成功读取数组A，共${result.length}条记录`);
        } else {
          // 处理数组B（对象数组）
          const headers = jsonData[0] as string[];
          let nameIndex = -1;
          let codeIndex = -1;
          
          // 查找name和code列
          headers.forEach((header, index) => {
            if (header && header.toLowerCase().includes("name")) {
              nameIndex = index;
            }
            if (header && header.toLowerCase().includes("code")) {
              codeIndex = index;
            }
          });
          
          if (nameIndex === -1 || codeIndex === -1) {
            message.error("未找到name或code列，请确保Excel文件包含这两个列");
            return;
          }
          
          const rows = jsonData.slice(1); // 跳过标题行
          const result: ItemB[] = [];
          
          rows.forEach((row: any[]) => {
            if (row && row.length > Math.max(nameIndex, codeIndex)) {
              const name = row[nameIndex] ? String(row[nameIndex]).trim() : "";
              const code = row[codeIndex] ? String(row[codeIndex]).trim() : "";
              
              if (name || code) {
                result.push({ name, code });
              }
            }
          });
          
          setArrayB(result);
          message.success(`成功读取数组B，共${result.length}条记录`);
        }
      } catch (error) {
        console.error("解析Excel文件时出错:", error);
        message.error("解析Excel文件时出错，请确保文件格式正确");
      }
    };
    
    reader.onerror = () => {
      message.error("文件读取失败");
    };
    
    reader.readAsArrayBuffer(file);
    return false;
  };
  
  // 数组A上传配置
  const uploadPropsA: UploadProps = {
    beforeUpload: (file) => {
      handleExcelUpload(file, 'A');
      return false;
    },
    maxCount: 1,
    accept: ".xlsx,.xls",
    showUploadList: false
  };
  
  // 数组B上传配置
  const uploadPropsB: UploadProps = {
    beforeUpload: (file) => {
      handleExcelUpload(file, 'B');
      return false;
    },
    maxCount: 1,
    accept: ".xlsx,.xls",
    showUploadList: false
  };
  
  // 批量处理匹配
  const processBatchMatching = useCallback(async () => {
    if (arrayA.length === 0 || arrayB.length === 0) {
      message.warning('请先输入数组A和数组B的数据');
      return;
    }
    
    setIsBatchProcessing(true);
    setProgress(0);
    
    // 使用setTimeout让UI有机会更新
    await new Promise(resolve => setTimeout(resolve, 0));
    
    try {
      // 初始化匹配结果
      let initialMatches: MatchResult[] = [];
      
      // 检查是否已有匹配结果（可能是从本地存储加载的）
      if (matches.length > 0 && matches.length === arrayA.length) {
        // 如果已有匹配结果且数量匹配，保持现有结果
        initialMatches = [...matches];
        message.info('继续处理之前的匹配任务');
      } else {
        // 否则重新初始化匹配结果
        // 分批处理以避免阻塞UI
        const batchSize = Math.max(10, Math.floor(arrayA.length / 100));
        for (let i = 0; i < arrayA.length; i += batchSize) {
          const batch = arrayA.slice(i, i + batchSize);
          
          batch.forEach(itemA => {
            let matchedItem: ItemB | null = null;
            let similarity = 0;
            let status: 'matched' | 'pending' | 'manual' = 'pending';
            
            // 新的匹配规则：
            // 1. 如果数组A中有code，则直接使用code进行精确匹配
            if (itemA.code) {
              const foundItem = arrayB.find(itemB => itemB.code === itemA.code);
              if (foundItem) {
                matchedItem = foundItem;
                similarity = 1;
                status = 'matched';
              }
            }
            
            // 2. 如果code没有匹配到数据，则走原先的文本相似度匹配逻辑
            if (!matchedItem) {
              // 首先查找完全匹配的项（name完全相同）
              const foundItem = arrayB.find(itemB => itemB.name === itemA.name);
              if (foundItem) {
                matchedItem = foundItem;
                similarity = 1;
                status = 'matched';
              } else {
                // 查找相似度最高的项（使用0阈值，确保返回所有匹配项）
                const bestMatches = findBestMatches(itemA, arrayB, 0);
                if (bestMatches.length > 0) {
                  matchedItem = bestMatches[0].item;
                  similarity = bestMatches[0].similarity;
                  status = 'pending'; // 需要手动确认
                } else {
                  matchedItem = null;
                  similarity = 0;
                  status = 'pending'; // 需要手动确认
                }
              }
            }
            
            initialMatches.push({
              itemA,
              itemB: matchedItem,
              similarity,
              status
            });
          });
          
          // 更新进度
          const progressPercent = Math.round(((i + batch.length) / arrayA.length) * 100);
          setProgress(progressPercent);
          
          // 每处理一批就让出控制权，避免UI冻结
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }
      
      setMatches(initialMatches);
      setCurrentMatchIndex(0);
      message.success(`匹配完成！共处理${arrayA.length}条记录`);
    } catch (error) {
      console.error("批量处理出错:", error);
      message.error("处理过程中出现错误");
    } finally {
      setIsBatchProcessing(false);
      setProgress(0);
    }
  }, [arrayA, arrayB, matches]);
  
  // 开始匹配过程
  const startMatching = () => {
    processBatchMatching();
  };
  
  // 手动选择匹配项
  const handleManualMatch = (itemA: ItemA, selectedB: ItemB | null) => {
    const newMatches = matches.map(match => 
      match.itemA === itemA 
        ? { ...match, itemB: selectedB, status: selectedB ? ('manual' as const) : ('pending' as const) } 
        : match
    );
    
    setMatches(newMatches);
    
    // 移动到下一个未匹配项
    const currentIndex = matches.findIndex(match => match.itemA === itemA);
    const nextIndex = matches.findIndex(
      (match, index) => index > currentIndex && match.status === 'pending'
    );
    
    if (nextIndex !== -1) {
      setCurrentMatchIndex(nextIndex);
    } else {
      // 如果没有更多未匹配项，检查是否所有项都已处理
      const allMatched = newMatches.every(match => match.status !== 'pending');
      if (allMatched) {
        message.success('所有匹配已完成！');
      }
    }
  };
  
  // 获取当前需要手动匹配的项
  const currentPendingMatch = useMemo(() => {
    return matches.find((match, index) => index >= currentMatchIndex && match.status === 'pending');
  }, [matches, currentMatchIndex]);
  
  // 获取推荐的匹配项（懒加载）
  const loadRecommendedMatches = useCallback((offset: number, limit: number) => {
    if (currentPendingMatch) {
      // 计算所有匹配项的相似度（使用0阈值，确保返回所有匹配项）
      const allMatches = findBestMatches(currentPendingMatch.itemA, arrayB, 0);
      
      // 返回指定范围的匹配项
      const newMatches = allMatches.slice(offset, offset + limit);
      return newMatches;
    }
    return [];
  }, [currentPendingMatch, arrayB, fieldLimit, weightPercentage, findBestMatches]);
  
  // 加载更多推荐匹配项
  const loadMoreRecommendedMatches = () => {
    const newOffset = recommendedOffset + recommendedLimit;
    const newMatches = loadRecommendedMatches(newOffset, recommendedLimit);
    setRecommendedItems(prev => [...prev, ...newMatches]);
    setRecommendedOffset(newOffset);
  };
  
  // 当当前待匹配项改变时，重置推荐匹配项
  useEffect(() => {
    if (currentPendingMatch) {
      const initialMatches = loadRecommendedMatches(0, recommendedLimit);
      setRecommendedItems(initialMatches);
      setRecommendedOffset(0);
    } else {
      setRecommendedItems([]);
      setRecommendedOffset(0);
    }
  }, [currentPendingMatch, loadRecommendedMatches, recommendedLimit]);
  
  // 导出匹配结果为Excel
  const exportResultsToExcel = () => {
    if (matches.length === 0) {
      message.warning('没有匹配结果可以导出');
      return;
    }
    
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 转换数据格式为JSON数组
    const exportData = matches.map(match => ({
      "aCode": match.itemA.code || '',
      "aName": match.itemA.name,
      "bCode": match.itemB?.code || '',
      "bName": match.itemB?.name || '',
      "score": match.similarity
    }));
    
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "匹配结果");
    
    // 导出文件
    XLSX.writeFile(wb, "数据匹配结果.xlsx");
    message.success("匹配结果导出成功");
  };
  
  // 导出匹配结果为JSON
  const exportResultsToJson = () => {
    if (matches.length === 0) {
      message.warning('没有匹配结果可以导出');
      return;
    }
    
    // 转换数据格式为JSON数组
    const exportData = matches.map(match => ({
      "aCode": match.itemA.code || '',
      "aName": match.itemA.name,
      "bCode": match.itemB?.code || '',
      "bName": match.itemB?.name || '',
      "score": match.similarity
    }));
    
    // 创建JSON文件
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '数据匹配结果.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    message.success("匹配结果JSON导出成功");
  };
  
  return (
    <div style={{ padding: "20px" }}>
      <Card>
        <Title level={3}>数据匹配工具 - 智能文本匹配与数据对比系统</Title>
        <Text>此工具用于精确匹配两个数据集：数组A（字符串数组或包含name/code字段的对象数组）与数组B（包含name和code字段的对象数组）。</Text>
        <Text>匹配规则：1. 如果数组A中有code字段，则直接使用code进行精确匹配；2. 如果code未匹配到数据，则使用文本相似度算法进行匹配。</Text>
        
        <Row gutter={16} style={{ marginTop: "20px" }}>
          {/* 数组A输入区域 */}
          <Col span={12}>
            <Card title="数组A (字符串数组)" size="small">
              <Upload {...uploadPropsA}>
                <Button icon={<UploadOutlined />} style={{ marginBottom: "10px" }}>
                  上传Excel文件 (数组A)
                </Button>
              </Upload>
              <TextArea
                rows={6}
                placeholder='请输入数组A的JSON格式数据，例如：["张三", "李四", "王五"]'
                onChange={(e) => handleArrayAChange(e.target.value)}
              />
              <div style={{ marginTop: "10px" }}>
                <Text type="secondary">数组A共有 {arrayA.length} 条记录</Text>
              </div>
            </Card>
          </Col>
          
          {/* 数组B输入区域 */}
          <Col span={12}>
            <Card title="数组B (对象数组)" size="small">
              <Upload {...uploadPropsB}>
                <Button icon={<UploadOutlined />} style={{ marginBottom: "10px" }}>
                  上传Excel文件 (数组B)
                </Button>
              </Upload>
              <TextArea
                rows={6}
                placeholder='请输入数组B的JSON格式数据，例如：[{"name": "张三", "code": "001"}, {"name": "李四", "code": "002"}]'
                onChange={(e) => handleArrayBChange(e.target.value)}
              />
              <div style={{ marginTop: "10px" }}>
                <Text type="secondary">数组B共有 {arrayB.length} 条记录</Text>
              </div>
            </Card>
          </Col>
        </Row>
        
        {/* 操作按钮 */}
        <Row justify="center" style={{ marginTop: "20px" }}>
          <Col>
            <Button 
              type="primary" 
              size="large"
              onClick={startMatching}
              disabled={arrayA.length === 0 || arrayB.length === 0}
              loading={isBatchProcessing}
            >
              开始匹配
            </Button>
            <Button 
              type="default" 
              size="large"
              onClick={exportResultsToExcel}
              style={{ marginLeft: "10px" }}
              disabled={matches.length === 0}
            >
              导出Excel
            </Button>
            <Button 
              type="default" 
              size="large"
              onClick={exportResultsToJson}
              style={{ marginLeft: "10px" }}
              disabled={matches.length === 0}
            >
              导出JSON
            </Button>
            <Button 
              type="default" 
              size="large"
              onClick={clearLocalStorage}
              style={{ marginLeft: "10px" }}
              disabled={matches.length === 0}
            >
              清除缓存
            </Button>
          </Col>
        </Row>
        
        {/* 匹配进度 */}
        {isBatchProcessing && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Spin tip="正在处理匹配..." />
            <Progress percent={progress} style={{ marginTop: "10px" }} />
            <Text type="secondary">处理中，请稍候...</Text>
          </div>
        )}
        
        {/* 手动匹配区域 */}
        {currentPendingMatch && (
          <Card title="手动匹配" style={{ marginTop: "20px" }}>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>数组A值: </Text>
                <Text>{currentPendingMatch.itemA.name}{currentPendingMatch.itemA.code ? ` (${currentPendingMatch.itemA.code})` : ''}</Text>
              </Col>
              <Col span={12}>
                <Text strong>推荐匹配项: </Text>
                <Row gutter={16} style={{ marginBottom: "10px" }}>
                  <Col span={12}>
                    <Text>前</Text>
                    <Input
                      type="number"
                      min={0}
                      value={fieldLimit}
                      onChange={(e) => setFieldLimit(Number(e.target.value))}
                      style={{ width: "60px", margin: "0 5px" }}
                    />
                    <Text>个字段</Text>
                  </Col>
                  <Col span={12}>
                    <Text>权重</Text>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={weightPercentage}
                      onChange={(e) => setWeightPercentage(Number(e.target.value))}
                      style={{ width: "60px", margin: "0 5px" }}
                    />
                    <Text>%</Text>
                  </Col>
                </Row>
                <Select
                  style={{ width: "100%", marginTop: "10px" }}
                  placeholder="请选择匹配项"
                  onChange={(value) => {
                    const selectedItem = arrayB.find(item => `${item.name} (${item.code})` === value);
                    handleManualMatch(currentPendingMatch.itemA, selectedItem || null);
                  }}
                  allowClear
                >
                  {recommendedItems.map((match, index) => (
                    <Option 
                      key={index} 
                      value={`${match.item.name} (${match.item.code})`}
                    >
                      {match.item.name} ({match.item.code}) - 相似度: {(match.similarity * 100).toFixed(1)}%
                    </Option>
                  ))}
                  <Option value="">不匹配</Option>
                </Select>
                <Button 
                  type="link" 
                  onClick={loadMoreRecommendedMatches}
                  style={{ marginTop: "10px" }}
                >
                  加载更多推荐项
                </Button>
              </Col>
            </Row>
          </Card>
        )}
        
        {/* 匹配结果查看区域 */}
        {matches.length > 0 && (
          <Card title="匹配结果查看" style={{ marginTop: "20px" }}>
            <Row gutter={16} style={{ marginBottom: "20px" }}>
              <Col>
                <Button 
                  type={showMatched ? "primary" : "default"}
                  onClick={() => setShowMatched(!showMatched)}
                >
                  {showMatched ? "隐藏" : "显示"}已匹配数据
                </Button>
                <Button 
                  type={showUnmatched ? "primary" : "default"}
                  onClick={() => setShowUnmatched(!showUnmatched)}
                  style={{ marginLeft: "10px" }}
                >
                  {showUnmatched ? "隐藏" : "显示"}未匹配数据
                </Button>
              </Col>
            </Row>
            
            {/* 已匹配数据 */}
            {showMatched && (
              <div>
                <Title level={5}>已匹配数据</Title>
                <Row gutter={16} style={{ marginBottom: "20px" }}>
                  <Col span={8}>
                    <Input
                      placeholder="搜索数组A或数组B的值"
                      value={matchedSearch}
                      onChange={(e) => {
                        setMatchedSearch(e.target.value);
                        setMatchedPagination({ ...matchedPagination, current: 1 });
                      }}
                    />
                  </Col>
                  <Col span={8}>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="筛选匹配类型"
                      value={matchedFilter}
                      onChange={(value) => {
                        setMatchedFilter(value);
                        setMatchedPagination({ ...matchedPagination, current: 1 });
                      }}
                    >
                      <Option value="all">全部类型</Option>
                      <Option value="code">Code匹配</Option>
                      <Option value="name">Name匹配</Option>
                      <Option value="manual">手动匹配</Option>
                    </Select>
                  </Col>
                </Row>
                <List
                  dataSource={(() => {
                    // 过滤已匹配数据
                    let filteredData = matches.filter(match => match.status !== 'pending');
                    
                    // 应用搜索过滤
                    if (matchedSearch) {
                      const searchLower = matchedSearch.toLowerCase();
                      filteredData = filteredData.filter(match => 
                        match.itemA.name.toLowerCase().includes(searchLower) ||
                        (match.itemA.code && match.itemA.code.toLowerCase().includes(searchLower)) ||
                        (match.itemB && (
                          match.itemB.name.toLowerCase().includes(searchLower) ||
                          match.itemB.code.toLowerCase().includes(searchLower)
                        ))
                      );
                    }
                    
                    // 应用类型过滤
                    if (matchedFilter !== 'all') {
                      filteredData = filteredData.filter(match => {
                        if (matchedFilter === 'code') {
                          // Code匹配：通过code字段精确匹配的数据
                          return match.status === 'matched' && match.similarity === 1 && 
                                 match.itemA.code && match.itemB && match.itemA.code === match.itemB.code;
                        } else if (matchedFilter === 'name') {
                          // Name匹配：通过name字段精确匹配但code不匹配的数据
                          return match.status === 'matched' && match.similarity === 1 && 
                                 (!match.itemA.code || !match.itemB || match.itemA.code !== match.itemB.code);
                        } else if (matchedFilter === 'manual') {
                          // 手动匹配：用户手动选择的数据
                          return match.status === 'manual';
                        }
                        return true;
                      });
                    }
                    
                    // 应用分页
                    const start = (matchedPagination.current - 1) * matchedPagination.pageSize;
                    const end = start + matchedPagination.pageSize;
                    return filteredData.slice(start, end);
                  })()}
                  pagination={{
                    current: matchedPagination.current,
                    pageSize: matchedPagination.pageSize,
                    total: (() => {
                      // 计算过滤后的总数
                      let filteredData = matches.filter(match => match.status !== 'pending');
                      
                      // 应用搜索过滤
                      if (matchedSearch) {
                        const searchLower = matchedSearch.toLowerCase();
                        filteredData = filteredData.filter(match => 
                          match.itemA.name.toLowerCase().includes(searchLower) ||
                          (match.itemA.code && match.itemA.code.toLowerCase().includes(searchLower)) ||
                          (match.itemB && (
                            match.itemB.name.toLowerCase().includes(searchLower) ||
                            match.itemB.code.toLowerCase().includes(searchLower)
                          ))
                        );
                      }
                      
                      // 应用类型过滤
                      if (matchedFilter !== 'all') {
                        filteredData = filteredData.filter(match => {
                          if (matchedFilter === 'code') {
                            return match.status === 'matched' && match.similarity === 1 && 
                                   match.itemA.code && match.itemB && match.itemA.code === match.itemB.code;
                          } else if (matchedFilter === 'name') {
                            return match.status === 'matched' && match.similarity === 1 && 
                                   (!match.itemA.code || !match.itemB || match.itemA.code !== match.itemB.code);
                          } else if (matchedFilter === 'manual') {
                            return match.status === 'manual';
                          }
                          return true;
                        });
                      }
                      
                      return filteredData.length;
                    })(),
                    onChange: (page, pageSize) => {
                      setMatchedPagination({ current: page, pageSize: pageSize || matchedPagination.pageSize });
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                  }}
                  renderItem={(match) => {
                    // 确定匹配类型
                    let matchType = '';
                    if (match.status === 'manual') {
                      matchType = '手动匹配';
                    } else if (match.similarity === 1) {
                      if (match.itemA.code && match.itemB && match.itemA.code === match.itemB.code) {
                        matchType = 'Code匹配';
                      } else {
                        matchType = 'Name匹配';
                      }
                    } else {
                      matchType = '相似度匹配';
                    }
                    
                    return (
                      <List.Item>
                        <Row style={{ width: "100%" }}>
                          <Col span={6}>
                            <Text strong>{match.itemA.name}</Text>
                            {match.itemA.code && <Text type="secondary"> ({match.itemA.code})</Text>}
                          </Col>
                          <Col span={6}>
                            <Text>{match.itemB?.name}</Text>
                            <Text type="secondary"> ({match.itemB?.code})</Text>
                          </Col>
                          <Col span={6}>
                            <Text>相似度: {(match.similarity * 100).toFixed(1)}%</Text>
                          </Col>
                          <Col span={6}>
                            <Text type={match.status === 'matched' ? "success" : "warning"}>
                              {matchType}
                            </Text>
                          </Col>
                        </Row>
                      </List.Item>
                    );
                  }}
                />
              </div>
            )}
            
            {/* 未匹配数据 */}
            {showUnmatched && (
              <div style={{ marginTop: "20px" }}>
                <Title level={5}>未匹配数据</Title>
                <Row gutter={16} style={{ marginBottom: "20px" }}>
                  <Col span={8}>
                    <Input
                      placeholder="搜索数组A的值"
                      value={unmatchedSearch}
                      onChange={(e) => {
                        setUnmatchedSearch(e.target.value);
                        setUnmatchedPagination({ ...unmatchedPagination, current: 1 });
                      }}
                    />
                  </Col>
                </Row>
                <List
                  dataSource={(() => {
                    // 过滤未匹配数据
                    let filteredData = matches.filter(match => match.status === 'pending');
                    
                    // 应用搜索过滤
                    if (unmatchedSearch) {
                      const searchLower = unmatchedSearch.toLowerCase();
                      filteredData = filteredData.filter(match => 
                        match.itemA.name.toLowerCase().includes(searchLower) ||
                        (match.itemA.code && match.itemA.code.toLowerCase().includes(searchLower))
                      );
                    }
                    
                    // 应用分页
                    const start = (unmatchedPagination.current - 1) * unmatchedPagination.pageSize;
                    const end = start + unmatchedPagination.pageSize;
                    return filteredData.slice(start, end);
                  })()}
                  pagination={{
                    current: unmatchedPagination.current,
                    pageSize: unmatchedPagination.pageSize,
                    total: (() => {
                      // 计算过滤后的总数
                      let filteredData = matches.filter(match => match.status === 'pending');
                      
                      // 应用搜索过滤
                      if (unmatchedSearch) {
                        const searchLower = unmatchedSearch.toLowerCase();
                        filteredData = filteredData.filter(match => 
                          match.itemA.name.toLowerCase().includes(searchLower) ||
                          (match.itemA.code && match.itemA.code.toLowerCase().includes(searchLower))
                        );
                      }
                      
                      return filteredData.length;
                    })(),
                    onChange: (page, pageSize) => {
                      setUnmatchedPagination({ current: page, pageSize: pageSize || unmatchedPagination.pageSize });
                    },
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100']
                  }}
                  renderItem={(match) => (
                    <List.Item>
                      <Row style={{ width: "100%" }}>
                        <Col span={8}>
                          <Text strong>{match.itemA.name}</Text>
                          {match.itemA.code && <Text type="secondary"> ({match.itemA.code})</Text>}
                        </Col>
                        <Col span={8}>
                          <Text type="secondary">未匹配</Text>
                        </Col>
                        <Col span={8}>
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={() => {
                              // 跳转到该匹配项进行手动匹配
                              const index = matches.findIndex(m => m === match);
                              if (index !== -1) {
                                setCurrentMatchIndex(index);
                              }
                            }}
                          >
                            手动匹配
                          </Button>
                        </Col>
                      </Row>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </Card>
        )}
        
        {/* 匹配统计 */}
        {matches.length > 0 && (
          <Card title="匹配统计" style={{ marginTop: "20px" }}>
            <Row gutter={16}>
              <Col span={6}>
                <Text>总数: {matches.length}</Text>
              </Col>
              <Col span={6}>
                <Text type="success">自动匹配: {matches.filter(m => m.status === 'matched').length}</Text>
              </Col>
              <Col span={6}>
                <Text type="warning">手动匹配: {matches.filter(m => m.status === 'manual').length}</Text>
              </Col>
              <Col span={6}>
                <Text type="secondary">待处理: {matches.filter(m => m.status === 'pending').length}</Text>
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: "10px" }}>
              <Col span={6}>
                <Text type="secondary">匹配率: {((matches.filter(m => m.status !== 'pending').length / matches.length) * 100).toFixed(1)}%</Text>
              </Col>
            </Row>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default DataMatcher;
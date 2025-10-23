import React, { useState, useEffect, useRef } from "react";
import { 
  Card, 
  Upload, 
  message, 
  Table, 
  Button, 
  Typography, 
  Pagination, 
  Input, 
  Row, 
  Col,
  Tabs,
  Progress,
  Tag,
  Switch
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import ldrkService, { ImportRecord, ImportDetail } from "../../services/ldrkService";

// 定义localStorage键名
const LDRK_VIEW_TIMES_KEY = "ldrk_view_times";

const { Title, Text } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

interface PersonData {
  idCardNo: string;
  sourceName: string; // 姓名字段改为sourceName
}

const Ldrk: React.FC = () => {
  // Excel数据相关状态
  const [allData, setAllData] = useState<PersonData[]>([]);
  const [displayData, setDisplayData] = useState<PersonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchText, setSearchText] = useState("");
  const [fileName, setFileName] = useState(""); // 存储文件名

  // 导入记录相关状态
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  
  // 导入详情相关状态
  const [importDetails, setImportDetails] = useState<ImportDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedRecordUuid, setSelectedRecordUuid] = useState("");
  const [showMismatchOnly, setShowMismatchOnly] = useState(false); // 只显示姓名不匹配的数据
  const [detailDisplayData, setDetailDisplayData] = useState<ImportDetail[]>([]);
  const [detailCurrentPage, setDetailCurrentPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(50);
  const [detailSearchText, setDetailSearchText] = useState("");

  // 添加查看详情的时间限制状态
  const [lastViewTimes, setLastViewTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LDRK_VIEW_TIMES_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  
  // 当查看时间记录变化时，保存到localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LDRK_VIEW_TIMES_KEY, JSON.stringify(lastViewTimes));
    } catch (e) {
      console.error("保存查看时间记录失败:", e);
    }
  }, [lastViewTimes]);
  
  // 添加新状态：是否只显示身份证姓名不为空的数据
  const [showNonEmptyNameOnly, setShowNonEmptyNameOnly] = useState(false);

  // 分页数据 - Excel数据
  useEffect(() => {
    let filteredData = allData;
    
    // 如果有搜索文本，进行过滤
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
      filteredData = allData.filter(
        item => 
          item.sourceName.toLowerCase().includes(lowerSearchText) || 
          item.idCardNo.includes(searchText)
      );
    }
    
    // 计算分页数据
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayData(filteredData.slice(startIndex, endIndex));
  }, [allData, currentPage, pageSize, searchText]);

  // 分页数据 - 导入详情
  useEffect(() => {
    let filteredData = importDetails;
    
    // 如果只显示不匹配数据
    if (showMismatchOnly) {
      filteredData = importDetails.filter(
        item => item.sourceName !== item.name
      );
    }
    
    // 如果只显示身份证姓名不为空的数据
    if (showNonEmptyNameOnly) {
      filteredData = filteredData.filter(
        item => item.name && item.name.trim() !== ""
      );
    }
    
    // 如果有搜索文本，进行过滤
    if (detailSearchText) {
      const lowerSearchText = detailSearchText.toLowerCase();
      filteredData = filteredData.filter(
        item => 
          item.sourceName.toLowerCase().includes(lowerSearchText) || 
          item.name.toLowerCase().includes(lowerSearchText) ||
          item.idCardNo.includes(detailSearchText)
      );
    }
    
    // 计算分页数据
    const startIndex = (detailCurrentPage - 1) * detailPageSize;
    const endIndex = startIndex + detailPageSize;
    setDetailDisplayData(filteredData.slice(startIndex, endIndex));
  }, [importDetails, detailCurrentPage, detailPageSize, detailSearchText, showMismatchOnly, showNonEmptyNameOnly]);

  // 处理文件上传
  const handleUpload = (file: File) => {
    setLoading(true);
    setFileName(file.name);
    
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
          setLoading(false);
          return;
        }
        
        // 获取标题行
        const headers = jsonData[0] as string[];
        
        // 查找姓名和身份证号码列的索引
        let nameIndex = -1;
        let idCardIndex = -1;
        
        headers.forEach((header, index) => {
          // 支持多种可能的列名
          if (header && header.includes("姓名")) {
            nameIndex = index;
          }
          if (header && (header.includes("身份证") || header.includes("证件"))) {
            idCardIndex = index;
          }
        });
        
        if (nameIndex === -1) {
          message.error("未找到姓名列，请确保Excel文件包含'姓名'列");
          setLoading(false);
          return;
        }
        
        if (idCardIndex === -1) {
          message.error("未找到身份证号码列，请确保Excel文件包含'身份证'或'证件'列");
          setLoading(false);
          return;
        }
        
        // 提取数据行
        const rows = jsonData.slice(1);
        const result: PersonData[] = [];
        
        rows.forEach((row: any[]) => {
          if (row && row.length > Math.max(nameIndex, idCardIndex)) {
            const sourceName = row[nameIndex] ? String(row[nameIndex]).trim() : "";
            const idCardNo = row[idCardIndex] ? String(row[idCardIndex]).trim() : "";
            
            // 只添加非空数据
            if (sourceName || idCardNo) {
              result.push({ sourceName, idCardNo });
            }
          }
        });
        
        setAllData(result);
        setCurrentPage(1);
        setSearchText("");
        message.success(`成功读取 ${result.length} 条记录`);
      } catch (error) {
        console.error("解析Excel文件时出错:", error);
        message.error("解析Excel文件时出错，请确保文件格式正确");
      } finally {
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      message.error("文件读取失败");
      setLoading(false);
    };
    
    reader.readAsArrayBuffer(file);
    return false;
  };

  // 导入数据到后端
  const handleImport = async () => {
    if (allData.length === 0) {
      message.warning("没有数据可以导入");
      return;
    }
    
    setLoading(true);
    try {
      // 调用后端接口导入数据
      await ldrkService.importExcelData({
        data: allData,
        fileName: fileName
      });
      
      message.success("数据导入成功");
      // 导入成功后刷新导入记录
      fetchImportRecords();
    } catch (error) {
      console.error("导入数据时出错:", error);
      message.error("数据导入失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取导入记录
  const fetchImportRecords = async () => {
    setRecordsLoading(true);
    try {
      const response = await ldrkService.getImportRecords();
      setImportRecords(response.data || []);
    } catch (error) {
      console.error("获取导入记录时出错:", error);
      message.error("获取导入记录失败");
    } finally {
      setRecordsLoading(false);
    }
  };

  // 获取导入详情
  const fetchImportDetails = async (uuid: string) => {
    // 检查是否在20分钟限制期内
    const now = Date.now();
    const lastViewTime = lastViewTimes[uuid] || 0;
    const timeDiff = now - lastViewTime;
    const twentyMinutes = 20 * 60 * 1000; // 20分钟毫秒数
    
    if (timeDiff < twentyMinutes) {
      const remainingTime = Math.ceil((twentyMinutes - timeDiff) / 60 / 1000);
      message.warning(`请等待 ${remainingTime} 分钟后再查看此批次的详情`);
      return;
    }
    
    setSelectedRecordUuid(uuid);
    setDetailsLoading(true);
    try {
      const response = await ldrkService.getImportDetails(uuid);
      setImportDetails(response.data || []);
      setDetailCurrentPage(1);
      setDetailSearchText("");
      setShowMismatchOnly(false);
      setShowNonEmptyNameOnly(false); // 重置新的筛选条件
      
      // 更新查看时间
      setLastViewTimes(prev => ({
        ...prev,
        [uuid]: now
      }));
    } catch (error) {
      console.error("获取导入详情时出错:", error);
      message.error("获取导入详情失败");
    } finally {
      setDetailsLoading(false);
    }
  };

  // 表格列定义 - Excel数据
  const excelColumns = [
    {
      title: "姓名",
      dataIndex: "sourceName",
      key: "sourceName",
      width: "40%",
    },
    {
      title: "身份证号码",
      dataIndex: "idCardNo",
      key: "idCardNo",
      width: "60%",
    },
  ];

  // 表格列定义 - 导入记录
  const recordColumns = [
    {
      title: "导入批次号",
      dataIndex: "uuid",
      key: "uuid",
    },
    {
      title: "文件名",
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: "总记录数",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "成功数",
      dataIndex: "successCount",
      key: "successCount",
    },
    {
      title: "导入进度",
      key: "progress",
      render: (_: any, record: ImportRecord) => {
        const percent = record.total > 0 ? Math.round((record.successCount / record.total) * 100) : 0;
        return (
          <Progress 
            percent={percent} 
            size="small" 
            status={percent === 100 ? "success" : "active"} 
          />
        );
      },
    },
    {
      title: "操作",
      key: "action",
      render: (_: any, record: ImportRecord) => {
        const isCompleted = record.total > 0 && record.successCount === record.total;
        // 检查是否在20分钟限制期内
        const now = Date.now();
        const lastViewTime = lastViewTimes[record.uuid] || 0;
        const timeDiff = now - lastViewTime;
        const twentyMinutes = 20 * 60 * 1000; // 20分钟毫秒数
        const isViewDisabled = timeDiff < twentyMinutes;
        const remainingTime = isViewDisabled ? Math.ceil((twentyMinutes - timeDiff) / 60 / 1000) : 0;
        
        return (
          <>
            <Button 
              type="link" 
              onClick={() => fetchImportDetails(record.uuid)}
              disabled={isViewDisabled}
            >
              {isViewDisabled ? `查看中...(${remainingTime}分钟)` : "查看详情"}
            </Button>
            {isCompleted && (
              <Button 
                type="link" 
                onClick={() => handleExport(record.uuid, record.fileName)}
              >
                导出数据
              </Button>
            )}
          </>
        );
      },
    },
  ];

  // 表格列定义 - 导入详情
  const detailColumns = [
    {
      title: "姓名",
      dataIndex: "sourceName",
      key: "sourceName",
    },
    {
      title: "身份证号码",
      dataIndex: "idCardNo",
      key: "idCardNo",
    },
    {
      title: "户籍地区",
      dataIndex: "hjdQu",
      key: "hjdQu",
    },
    {
      title: "户籍地地址",
      dataIndex: "hjdFullAddr",
      key: "hjdFullAddr",
    },
    {
      title: "身份证姓名",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "姓名匹配",
      key: "match",
      render: (_: any, record: ImportDetail) => {
        return record.sourceName === record.name ? (
          <Tag color="green">匹配</Tag>
        ) : (
          <Tag color="red">不匹配</Tag>
        );
      },
    },
  ];

  // 处理分页变化 - Excel数据
  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) {
      setPageSize(size);
    }
  };

  // 处理分页变化 - 导入详情
  const handleDetailPageChange = (page: number, size?: number) => {
    setDetailCurrentPage(page);
    if (size) {
      setDetailPageSize(size);
    }
  };

  // 处理搜索 - Excel数据
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  // 处理搜索 - 导入详情
  const handleDetailSearch = (value: string) => {
    setDetailSearchText(value);
    setDetailCurrentPage(1);
  };

  // 处理导出功能
  const handleExport = async (uuid: string, fileName: string) => {
    try {
      // 调用后台接口获取数据
      const response = await ldrkService.getImportDetails(uuid);
      
      if (response.data) {
        // 使用前端xlsx库导出数据
        ldrkService.exportDetailsToExcel(response.data, fileName);
        message.success("数据导出成功");
      } else {
        message.error("导出数据失败，未获取到数据");
      }
    } catch (error) {
      console.error("导出数据时出错:", error);
      message.error("数据导出失败，请重试");
    }
  };

  // 处理导出功能 - 根据当前过滤条件导出数据
  const handleExportFilteredData = async () => {
    if (detailDisplayData.length === 0) {
      message.warning("没有数据可以导出");
      return;
    }

    try {
      // 使用当前显示的数据进行导出
      ldrkService.exportDetailsToExcel(detailDisplayData, importRecords.find(r => r.uuid === selectedRecordUuid)?.fileName || "导出数据");
      message.success("数据导出成功");
    } catch (error) {
      console.error("导出数据时出错:", error);
      message.error("数据导出失败，请重试");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card>
        <Title level={3}>流动人口信息导入工具</Title>
        
        <Tabs defaultActiveKey="1">
          {/* Excel数据导入 Tab */}
          <TabPane tab="数据导入" key="1">
            <p>上传包含姓名和身份证号码的Excel文件，系统将自动提取数据并导入</p>
            
            <Upload
              beforeUpload={handleUpload}
              maxCount={1}
              accept=".xlsx,.xls"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} loading={loading}>
                选择Excel文件
              </Button>
            </Upload>
            
            {allData.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: "10px" }}>
                  <Col>
                    <Text>共读取到 {allData.length} 条记录</Text>
                    {searchText && (
                      <Text type="secondary" style={{ marginLeft: "10px" }}>
                        搜索到 {displayData.length} 条匹配记录
                      </Text>
                    )}
                  </Col>
                  <Col>
                    <Search
                      placeholder="搜索姓名或身份证号码"
                      onSearch={handleSearch}
                      style={{ width: 300, marginRight: "10px" }}
                      allowClear
                    />
                    <Button 
                      type="primary" 
                      onClick={handleImport}
                      loading={loading}
                    >
                      导入数据
                    </Button>
                  </Col>
                </Row>
                
                <Table
                  dataSource={displayData}
                  columns={excelColumns}
                  rowKey={(record, index) => `${currentPage}-${index}`}
                  pagination={false}
                  scroll={{ y: 500 }}
                  loading={loading}
                />
                
                <div style={{ marginTop: "10px", textAlign: "right" }}>
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={searchText ? displayData.length : allData.length}
                    onChange={handlePageChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 条记录`}
                    pageSizeOptions={['10', '20', '50', '100']}
                  />
                </div>
              </div>
            )}
          </TabPane>
          
          {/* 导入记录 Tab */}
          <TabPane tab="导入记录" key="2">
            <Row justify="space-between" style={{ marginBottom: "10px" }}>
              <Col>
                <Text>导入记录列表</Text>
              </Col>
              <Col>
                <Button 
                  onClick={fetchImportRecords}
                  loading={recordsLoading}
                >
                  刷新记录
                </Button>
              </Col>
            </Row>
            
            <Table
              dataSource={importRecords}
              columns={recordColumns}
              rowKey="uuid"
              loading={recordsLoading}
              pagination={{ pageSize: 10 }}
            />
            
            {/* 导入详情 */}
            {selectedRecordUuid && (
              <Card 
                title={`导入详情 - ${importRecords.find(r => r.uuid === selectedRecordUuid)?.fileName || selectedRecordUuid}`}
                style={{ marginTop: "20px" }}
              >
                <Row justify="space-between" align="middle" style={{ marginBottom: "10px" }}>
                  <Col>
                    <Text>共 {importDetails.length} 条记录</Text>
                    <Switch
                      checked={showMismatchOnly}
                      onChange={setShowMismatchOnly}
                      checkedChildren="只看不匹配"
                      unCheckedChildren="只看不匹配"
                      style={{ marginLeft: "10px" }}
                    />
                    <Switch
                      checked={showNonEmptyNameOnly}
                      onChange={setShowNonEmptyNameOnly}
                      checkedChildren="只看姓名非空"
                      unCheckedChildren="只看姓名非空"
                      style={{ marginLeft: "10px" }}
                    />
                  </Col>
                  <Col>
                    <Search
                      placeholder="搜索姓名或身份证号码"
                      onSearch={handleDetailSearch}
                      style={{ width: 300, marginRight: "10px" }}
                      allowClear
                    />
                    <Button 
                      type="primary" 
                      onClick={handleExportFilteredData}
                      disabled={detailDisplayData.length === 0}
                    >
                      导出数据
                    </Button>
                  </Col>
                </Row>
                
                <Table
                  dataSource={detailDisplayData}
                  columns={detailColumns}
                  rowKey={(record, index) => `${detailCurrentPage}-${index}`}
                  pagination={false}
                  scroll={{ y: 400 }}
                  loading={detailsLoading}
                />
                
                <div style={{ marginTop: "10px", textAlign: "right" }}>
                  <Pagination
                    current={detailCurrentPage}
                    pageSize={detailPageSize}
                    total={
                      (() => {
                        let filteredData = importDetails;
                        
                        // 应用不匹配过滤器
                        if (showMismatchOnly) {
                          filteredData = filteredData.filter(item => item.sourceName !== item.name);
                        }
                        
                        // 应用姓名非空过滤器
                        if (showNonEmptyNameOnly) {
                          filteredData = filteredData.filter(item => item.name && item.name.trim() !== "");
                        }
                        
                        // 应用搜索过滤器
                        if (detailSearchText) {
                          const lowerSearchText = detailSearchText.toLowerCase();
                          filteredData = filteredData.filter(
                            item => 
                              item.sourceName.toLowerCase().includes(lowerSearchText) || 
                              item.name.toLowerCase().includes(lowerSearchText) ||
                              item.idCardNo.includes(detailSearchText)
                          );
                        }
                        
                        return filteredData.length;
                      })()
                    }
                    onChange={handleDetailPageChange}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total) => `共 ${total} 条记录`}
                    pageSizeOptions={['10', '20', '50', '100']}
                  />
                </div>
              </Card>
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Ldrk;
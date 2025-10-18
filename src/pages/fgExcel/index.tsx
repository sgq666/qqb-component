// src/pages/fgExcel/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Typography,
  Upload,
  message,
  Table,
  Button,
  Tabs,
  Select,
  Row,
  Col,
  Checkbox,
  Input,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { FixedType } from "rc-table/lib/interface";
import type { ColumnsType } from "antd/es/table";
import pcsTarget from "./pcsTarget";

import * as XLSX from "xlsx";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface ExcelData {
  registerTime: string;
  registerUnit: string;
}

interface ProcessedReportData {
  pcsName: string;
  [key: string]: string | number | undefined;
}

// 单位合并规则接口
interface UnitMergeRule {
  target: string; // 合并后的单位名称
  sources: string[]; // 要合并的源单位名称
}

const FgExcel: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedReportData[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [filteredData, setFilteredData] = useState<ExcelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [filters, setFilters] = useState({
    unit: [] as string[], // 修改为数组支持多选
    date: "",
  });
  const [searchText, setSearchText] = useState({
    unit: "",
    date: "",
  });

  // 单位合并规则状态
  const defaultMergeRules: UnitMergeRule[] = pcsTarget.map((rule: any) => ({
    target: rule.targetName || "",
    sources: Array.isArray(rule.sourceName) ? rule.sourceName : [],
  }));
  const [mergeRules, setMergeRules] =
    useState<UnitMergeRule[]>(defaultMergeRules);
  const [selectedMergeRules, setSelectedMergeRules] = useState<number[]>(() =>
    defaultMergeRules.map((_, index) => index)
  );
  const [customMergeRule, setCustomMergeRule] = useState<{
    target: string;
    source: string;
  }>({
    target: "",
    source: "",
  });

  // 添加自定义合并规则
  const addCustomMergeRule = () => {
    if (customMergeRule.target && customMergeRule.source) {
      const newRule: UnitMergeRule = {
        target: customMergeRule.target,
        sources: [customMergeRule.source],
      };

      setMergeRules((prev) => {
        // 检查是否已存在相同目标的规则
        const existingRuleIndex = prev.findIndex(
          (rule) => rule.target === customMergeRule.target
        );
        if (existingRuleIndex >= 0) {
          // 如果存在，添加到现有规则中
          const updated = [...prev];
          updated[existingRuleIndex] = {
            ...updated[existingRuleIndex],
            sources: [
              ...updated[existingRuleIndex].sources,
              customMergeRule.source,
            ],
          };
          return updated;
        } else {
          // 如果不存在，创建新规则
          return [...prev, newRule];
        }
      });

      // 默认选中新添加的规则（如果是新规则）
      const existingRuleIndex = mergeRules.findIndex(
        (rule) => rule.target === customMergeRule.target
      );
      if (existingRuleIndex === -1) {
        setSelectedMergeRules((prev) => [...prev, mergeRules.length]);
      }

      setCustomMergeRule({ target: "", source: "" });
    }
  };

  // 切换规则选择状态
  const toggleRuleSelection = (index: number) => {
    setSelectedMergeRules((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const parseUnitName = useCallback(
    (unit: string): string => {
      // 去掉前缀"海口市公安局"
      const unitWithoutPrefix = unit.replace("海口市公安局", "");

      // 去掉分局前所有字符（包括分局）
      const pcsName = unitWithoutPrefix.replace(/.*分局/, "");

      // 去掉"派出"二字
      let finalName = pcsName.replace("派出所", "所");

      // 应用合并规则
      selectedMergeRules.forEach((ruleIndex) => {
        const rule = mergeRules[ruleIndex];
        if (rule.sources.includes(finalName)) {
          finalName = rule.target;
        }
      });

      return finalName;
    },
    [mergeRules, selectedMergeRules]
  );
  // 将日期格式从 YYYY-MM-DD 或 YYYY/MM/DD 转换为 M.DD 格式
  const formatDateToMD = (dateStr: string): string => {
    // 先转换为字符串，防止传入的是数字类型
    const str = String(dateStr);

    if (!str) return "";

    // 处理标准日期格式 YYYY-MM-DD 或 YYYY/MM/DD
    if (str.includes("-") || str.includes("/")) {
      const separator = str.includes("-") ? "-" : "/";
      const parts = str.split(separator);
      if (parts.length === 3) {
        // 确保年份是四位数
        if (parts[0].length === 4) {
          return `${parseInt(parts[1])}.${parseInt(parts[2])}`;
        }
      }
    }

    // 如果是Excel序列号格式，需要转换
    if (!isNaN(Number(str)) && Number(str) > 1000) {
      const date = new Date((Number(str) - 25569) * 86400 * 1000);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}.${day}`;
    }

    return str;
  };

  // 处理筛选逻辑
  useEffect(() => {
    let result = [...excelData];

    if (filters.unit.length > 0) {
      result = result.filter((item) => {
        // 提取单位名称进行比较
        const unitName = parseUnitName(item.registerUnit);
        return filters.unit.includes(unitName);
      });
    }

    if (filters.date) {
      result = result.filter(
        (item) => formatDateToMD(item.registerTime) === filters.date
      );
    }

    setFilteredData(result);
  }, [filters, excelData, selectedMergeRules, mergeRules, parseUnitName]);

  // 处理报表数据
  const processDataForReport = (data: ExcelData[]) => {
    // 提取所有唯一日期
    const uniqueDates = Array.from(
      new Set(data.map((item) => item.registerTime))
    );

    // 按日期排序
    uniqueDates.sort((a, b) => {
      const [monthA, dayA] = a.split(".").map(Number);
      const [monthB, dayB] = b.split(".").map(Number);

      if (monthA !== monthB) {
        return monthA - monthB;
      }
      return dayA - dayB;
    });

    setDates(uniqueDates);


    // 按单位分组统计
    const groupedByUnit: Record<string, Record<string, number>> = {};

    data.forEach((item) => {
      // 解析单位名称
      const unitName = parseUnitName(item.registerUnit);
      const formattedDate = item.registerTime;

      if (!groupedByUnit[unitName]) {
        groupedByUnit[unitName] = {};
      }

      if (!groupedByUnit[unitName][formattedDate]) {
        groupedByUnit[unitName][formattedDate] = 0;
      }

      groupedByUnit[unitName][formattedDate]++;
    });

    // 转换为表格数据格式
    const tableData: ProcessedReportData[] = Object.entries(groupedByUnit).map(
      ([unitName, dateCounts]) => {
        const row: ProcessedReportData = {
          pcsName: unitName,
        };

        // 为每个日期列设置值
        let total = 0;
        uniqueDates.forEach((date) => {
          const count = dateCounts[date] || 0;
          row[date] = count;
          total += count;
        });

        // 添加本周登记总数列
        row["本周登记总数"] = total;

        return row;
      }
    );

    setProcessedData(tableData);
  };

  // 处理文件上传
  const handleUpload = (file: File) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);

        // 验证文件签名
        if (data.length < 8) {
          throw new Error("文件太小，可能不是有效的Excel文件");
        }

        // 检查文件签名
        const signature = Array.from(data.slice(0, 8))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        const validSignatures = [
          "d0cf11e0a1b11ae1", // XLS (Excel 97-2003)
          "504b030414000600", // XLSX (Excel Office Open XML)
          "504b03040a000000", // XLSX (另一种变体)
        ];

        if (!validSignatures.includes(signature)) {
          throw new Error(
            "文件格式不正确，请确保上传的是有效的Excel文件(.xlsx或.xls)"
          );
        }

        // 读取工作簿
        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
          cellNF: false,
          cellText: false,
        });

        // 假设数据在第一个工作表
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        if (!worksheet) {
          throw new Error("无法读取Excel工作表");
        }

        // 读取所有数据，然后跳过第一行
        const allJsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });

        // 确保至少有两行数据（标题行和至少一行数据）
        if (allJsonData.length < 2) {
          message.error("Excel文件数据不足，请确保至少包含标题行和数据行");
          setLoading(false);
          return;
        }

        // 获取标题行（第二行，索引为1）
        const headerRow = allJsonData[1];

        if (!headerRow || headerRow.length === 0) {
          throw new Error("无法读取标题行，请检查Excel文件格式");
        }

        // 获取数据行（从第三行开始，索引为2）
        const dataRows = allJsonData.slice(2);

        // 构造以标题为键的对象数组
        const jsonData: ExcelData[] = dataRows
          .filter((row) => row && row.length > 0) // 过滤空行
          .map((row, index) => {
            const rowData: any = {};
            let hasValidData = false;

            headerRow.forEach((header: string, index: number) => {
              // 只处理我们需要的两列
              if (header === "登记时间" || header === "登记单位") {
                const value =
                  row[index] !== undefined && row[index] !== null
                    ? String(row[index])
                    : "";
                rowData[
                  header === "登记时间" ? "registerTime" : "registerUnit"
                ] = value;
                if (value.trim() !== "") hasValidData = true;
              }
            });

            // 只有包含有效数据的行才返回
            return hasValidData ? (rowData as ExcelData) : null;
          })
          .filter((item) => item !== null) as ExcelData[];

        // 格式化日期（仅对未格式化的数据）
        const formattedData = jsonData.map((item) => ({
          ...item,
          registerTime: formatDateToMD(item.registerTime),
        }));

        setExcelData(formattedData);
        setFilteredData(formattedData);

        // 处理报表数据
        processDataForReport(formattedData);

        setFilters({ unit: [], date: "" }); // 重置筛选条件
        setSearchText({ unit: "", date: "" }); // 重置搜索文本
        message.success("文件解析成功");
      } catch (error) {
        console.error("文件解析错误:", error);
        message.error(
          `文件解析失败: ${error instanceof Error ? error.message : "未知错误"}`
        );
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

  const handleFilterChange = (
    type: keyof typeof filters,
    value: string | string[]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSearchChange = (type: keyof typeof searchText, value: string) => {
    setSearchText((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // 获取筛选选项
  const getFilteredOptions = (type: "unit" | "date") => {
    let options: string[] = [];

    if (type === "unit") {
      // 使用处理后的派出所名称作为选项
      options = excelData.map((item) => parseUnitName(item.registerUnit));
    } else if (type === "date") {
      options = dates;
    }

    // 去重
    options = Array.from(new Set(options));

    const search = type === "date" ? searchText.date : searchText.unit;

    return search
      ? options.filter((option) =>
          option.toLowerCase().includes(search.toLowerCase())
        )
      : options;
  };

  const generateOriginalColumns = (): ColumnsType<ExcelData> => {
    return [
      {
        title: "派出所名称",
        dataIndex: "registerUnit",
        key: "registerUnit",
        fixed: "left" as FixedType,
        width: 200,
        render: (text: string) => {
          return parseUnitName(text);
        },
        filters: Array.from(
          new Set(excelData.map((item) => parseUnitName(item.registerUnit)))
        ).map((unit) => ({ text: unit, value: unit })),
        onFilter: (value, record) =>
          parseUnitName(record.registerUnit) === value,
      },
      {
        title: "登记时间",
        dataIndex: "registerTime",
        key: "registerTime",
        width: 150,
        filters: dates.map((date) => ({ text: date, value: date })),
        onFilter: (value, record) =>
          formatDateToMD(record.registerTime) === value,
      },
    ];
  };

  const generateReportColumns = () => {
    const columns = [
      {
        title: "派出所名称",
        dataIndex: "pcsName",
        key: "pcsName",
        fixed: "left" as FixedType,
        width: 150,
      },
      ...dates.map((date) => ({
        title: date,
        dataIndex: date,
        key: date,
        width: 100,
        align: "center" as const,
      })),
      {
        title: "本周登记总数",
        dataIndex: "本周登记总数",
        key: "本周登记总数",
        width: 150,
        fixed: "right" as FixedType,
      },
    ];

    return columns;
  };

  // 导出为JSON文件
  const exportToJson = (data: any[], filename: string) => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 导出原始数据为JSON
  const exportOriginalData = () => {
    // 转换原始数据格式
    const exportData = excelData.map((item) => ({
      pcsName: parseUnitName(item.registerUnit),
      date: item.registerTime,
    }));
    exportToJson(exportData, "原始数据");
  };

  // 导出报表数据为JSON
  const exportReportData = () => {
    exportToJson(processedData, "报表数据");
  };

  // 根据筛选条件过滤报表数据
  const getFilteredReportData = () => {
    if (filters.unit.length > 0) {
      return processedData.filter((item) =>
        filters.unit.includes(item.pcsName)
      );
    }
    return processedData;
  };

  const generateReportWorkbook = async (): Promise<XLSX.WorkBook | null> => {
    try {
      // 获取时间范围
      if (dates.length === 0) {
        message.error("没有可用的日期数据");
        return null;
      }

      const sortedDates = [...dates].sort((a, b) => {
        const [monthA, dayA] = a.split(".").map(Number);
        const [monthB, dayB] = b.split(".").map(Number);

        if (monthA !== monthB) {
          return monthA - monthB;
        }
        return dayA - dayB;
      });

      // 获取起始和结束日期
      const startTime = sortedDates[0];
      const endTime = sortedDates[sortedDates.length - 1];

      // 读取模板文件
      const templatePath = "/excel/test1.xlsx";
      const response = await fetch(templatePath);

      if (!response.ok) {
        throw new Error(
          `无法加载模板文件: ${response.status} ${response.statusText}`
        );
      }

      // 检查响应的内容类型
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("模板文件路径返回了HTML页面，请检查文件路径是否正确");
      }

      const arrayBuffer = await response.arrayBuffer();

      // 确保获取到的是有效的数据
      if (arrayBuffer.byteLength === 0) {
        throw new Error("模板文件为空");
      }

      // 使用 bookType: 'xlsx' 和 cellStyles: true 来保留样式
      const templateWorkbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellStyles: true,
        cellNF: true,
        cellDates: true,
        sheetStubs: true,
      });

      // 获取第一个工作表
      const worksheetName = templateWorkbook.SheetNames[0];
      const worksheet = templateWorkbook.Sheets[worksheetName];

      // 更新数据截止时间 (3A-3K合并单元格)
      const timeCellRef = XLSX.utils.encode_cell({ c: 0, r: 2 }); // A3单元格
      if (worksheet[timeCellRef]) {
        worksheet[timeCellRef].v = `数据截止时间：${startTime}至${endTime}`;
      }

      // 更新星期列标题 (5D-5J)
      // 周六到周五的列标题更新
      const weekdays = ["周六", "周日", "周一", "周二", "周三", "周四", "周五"];
      for (let i = 0; i < Math.min(7, sortedDates.length); i++) {
        const cellRef = XLSX.utils.encode_cell({ c: 3 + i, r: 4 }); // 从D5开始
        if (worksheet[cellRef]) {
          worksheet[cellRef].v = `${weekdays[i]}（${sortedDates[i]}）`;
        }
      }

      // 创建一个映射，便于快速查找报表数据
      const reportDataMap = new Map<string, ProcessedReportData>();
      processedData.forEach((item) => {
        // 清理派出所名称，去除空格等
        let cleanPcsName = item.pcsName.replace(/\s+/g, "");
        // 应用合并规则到导出数据
        selectedMergeRules.forEach((ruleIndex) => {
          const rule = mergeRules[ruleIndex];
          if (rule.sources.includes(cleanPcsName)) {
            cleanPcsName = rule.target;
          }
        });
        reportDataMap.set(cleanPcsName, item);
      });

      // 从第6行开始查找派出所名称（索引为5）
      let row = 5;
      // 设置一个合理的上限，避免无限循环
      const maxRows = 100;

      // 用于存储合计行的位置
      const totalRows: number[] = [];

      while (row < maxRows) {
        // 检查C列（索引为2）的当前行是否有派出所名称
        const cellAddress = { c: 2, r: row };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        const cell = worksheet[cellRef];

        // 如果单元格不存在或为空，继续检查下一行
        if (
          !cell ||
          cell.v === undefined ||
          cell.v === null ||
          String(cell.v).trim() === ""
        ) {
          row++;
          continue;
        }

        // 获取单元格中的派出所名称
        const cellValue = String(cell.v).trim();
        let pcsName = cellValue;

        // 清理派出所名称（去除可能的空格和特殊字符）
        pcsName = pcsName.replace(/\s+/g, "");

        // 检查是否为"合计"行
        if (pcsName === "合计") {
          totalRows.push(row);
          row++;
          continue;
        }

        // 查找对应的报表数据
        const reportItem = reportDataMap.get(pcsName);

        if (reportItem) {
          // 填充数据到对应的日期列
          // 从D列（索引为3）开始填充数据
          for (let i = 0; i < sortedDates.length; i++) {
            const date = sortedDates[i];
            const dataCol = 3 + i; // 从D列开始（索引3）
            const dataRow = row; // 保持在同一行

            const dataCellAddress = { c: dataCol, r: dataRow };
            const dataCellRef = XLSX.utils.encode_cell(dataCellAddress);

            // 获取该日期的数据
            const rawValue = reportItem[date];
            const value = rawValue !== undefined ? Number(rawValue) : 0;

            // 如果值为0，则保持单元格为空白
            if (value === 0) {
              // 如果单元格存在，保留样式但清空值
              if (worksheet[dataCellRef]) {
                // 保留原有单元格的样式，但不设置值
                worksheet[dataCellRef] = {
                  ...worksheet[dataCellRef],
                  v: undefined,
                  t: undefined,
                };
              } else {
                // 如果单元格不存在且值为0，不创建单元格
                // 这样单元格将保持空白
              }
            } else {
              // 如果值不为0，正常填充
              if (worksheet[dataCellRef]) {
                // 保留原有单元格的样式
                worksheet[dataCellRef] = {
                  ...worksheet[dataCellRef],
                  v: value,
                  t: "n",
                };
              } else {
                // 如果单元格不存在，创建新单元格
                worksheet[dataCellRef] = {
                  v: value,
                  t: "n",
                };
              }
            }
          }

          // 填充总数（在日期数据列之后）
          const totalCol = 3 + sortedDates.length;
          const totalRow = row;
          const totalCellAddress = { c: totalCol, r: totalRow };
          const totalCellRef = XLSX.utils.encode_cell(totalCellAddress);

          const rawTotalValue = reportItem["本周登记总数"];
          const totalValue =
            rawTotalValue !== undefined ? Number(rawTotalValue) : 0;

          // 如果总数为0，则保持单元格为空白
          if (totalValue === 0) {
            // 如果单元格存在，保留样式但清空值
            if (worksheet[totalCellRef]) {
              worksheet[totalCellRef] = {
                ...worksheet[totalCellRef],
                v: undefined,
                t: undefined,
              };
            } else {
              // 如果单元格不存在且值为0，不创建单元格
            }
          } else {
            // 如果总数不为0，正常填充
            if (worksheet[totalCellRef]) {
              worksheet[totalCellRef] = {
                ...worksheet[totalCellRef],
                v: totalValue,
                t: "n",
              };
            } else {
              worksheet[totalCellRef] = {
                v: totalValue,
                t: "n",
              };
            }
          }
        }

        row++;
      }

      // 处理合计行逻辑 - 修正计算范围
      for (let i = 0; i < totalRows.length; i++) {
        const totalRow = totalRows[i];

        // 确定计算范围
        let startRow, endRow;

        if (i === 0) {
          // 第一个合计行，从第6行（索引5）开始计算
          startRow = 5; // 第6行
          endRow = totalRow - 1; // 合计行的上一行
        } else {
          // 后续合计行，从上一个合计行的下一行开始计算
          startRow = totalRows[i - 1] + 1; // 上一个合计行的下一行
          endRow = totalRow - 1; // 当前合计行的上一行
        }

        // 对每一列进行求和
        for (let col = 3; col < 3 + sortedDates.length + 1; col++) {
          let sum = 0;
          for (let r = startRow; r <= endRow; r++) {
            const cellAddress = { c: col, r: r };
            const cellRef = XLSX.utils.encode_cell(cellAddress);
            const cell = worksheet[cellRef];

            if (cell && typeof cell.v === "number") {
              sum += cell.v;
            }
          }

          // 填充合计值
          const totalCellAddress = { c: col, r: totalRow };
          const totalCellRef = XLSX.utils.encode_cell(totalCellAddress);

          if (worksheet[totalCellRef]) {
            worksheet[totalCellRef] = {
              ...worksheet[totalCellRef],
              v: sum,
              t: "n",
            };
          } else {
            worksheet[totalCellRef] = {
              v: sum,
              t: "n",
            };
          }
        }
      }

      return templateWorkbook;
    } catch (error) {
      console.error("生成报表工作簿失败:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      message.error(`生成报表失败: ${errMsg}`);
      return null;
    }
  };

  // 更新 exportReportToExcel 函数以更好地保留样式

  const exportReportToExcel = async () => {
    try {
      const templateWorkbook = await generateReportWorkbook();

      if (!templateWorkbook) {
        return;
      }

      // 获取时间范围用于文件名
      const sortedDates = [...dates].sort((a, b) => {
        const [monthA, dayA] = a.split(".").map(Number);
        const [monthB, dayB] = b.split(".").map(Number);

        if (monthA !== monthB) {
          return monthA - monthB;
        }
        return dayA - dayB;
      });

      const startTime = sortedDates[0];
      const endTime = sortedDates[sortedDates.length - 1];
      const fileName = `全局省外户籍流动人口采集情况统计表（${startTime}-${endTime}）周.xlsx`;

      // 导出文件时保留样式
      const wbout = XLSX.write(templateWorkbook, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true,
        bookSST: true,
        compression: true,
      });

      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.success("报表导出成功");
    } catch (error) {
      console.error("导出报表失败:", error);
      message.error("导出报表失败，请重试");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={3}>Excel处理工具</Title>
        <Paragraph>
          上传Excel文件，系统将展示原始的登记时间和登记单位数据。（注意：将跳过第一行，从第二行读取标题）
        </Paragraph>

        {/* 单位合并规则配置 */}
        {mergeRules.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>单位合并规则</Title>
            <div style={{ marginBottom: 12 }}>
              {mergeRules.map((rule, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <Checkbox
                    checked={selectedMergeRules.includes(index)}
                    onChange={() => toggleRuleSelection(index)}
                  >
                    {Array.isArray(rule.sources) && rule.sources.length > 0
                      ? rule.sources.join(", ")
                      : "无源单位"}{" "}
                    → {rule.target}
                  </Checkbox>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Input
                placeholder="合并后的单位名称"
                value={customMergeRule.target}
                onChange={(e) =>
                  setCustomMergeRule({
                    ...customMergeRule,
                    target: e.target.value,
                  })
                }
                style={{ flex: 1 }}
              />
              <Input
                placeholder="要合并的单位名称"
                value={customMergeRule.source}
                onChange={(e) =>
                  setCustomMergeRule({
                    ...customMergeRule,
                    source: e.target.value,
                  })
                }
                style={{ flex: 1 }}
              />
              <Button onClick={addCustomMergeRule} icon={<PlusOutlined />}>
                添加规则
              </Button>
            </div>
          </div>
        )}

        <Upload
          beforeUpload={handleUpload}
          maxCount={1}
          accept=".xlsx,.xls"
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} loading={loading}>
            上传Excel文件
          </Button>
        </Upload>

        {excelData.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              tabBarExtraContent={
                activeTab === "1" ? (
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={exportOriginalData}
                    size="small"
                  >
                    导出JSON
                  </Button>
                ) : (
                  <div>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={exportReportData}
                      size="small"
                      style={{ marginRight: 8 }}
                    >
                      导出JSON
                    </Button>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={exportReportToExcel}
                      size="small"
                    >
                      导出Excel
                    </Button>
                  </div>
                )
              }
            >
              <TabPane tab="原始数据" key="1">
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col span={8}>
                    <Select
                      mode="multiple" // 启用多选模式
                      showSearch
                      placeholder="请选择派出所"
                      value={filters.unit}
                      onChange={(value) => handleFilterChange("unit", value)}
                      onSearch={(value) => handleSearchChange("unit", value)}
                      allowClear
                      style={{ width: "100%" }}
                    >
                      {getFilteredOptions("unit").map((unit) => (
                        <Option key={unit} value={unit}>
                          {unit}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={8}>
                    <Select
                      showSearch
                      placeholder="请选择登记时间"
                      value={filters.date || undefined}
                      onChange={(value) => handleFilterChange("date", value)}
                      onSearch={(value) => handleSearchChange("date", value)}
                      allowClear
                      style={{ width: "100%" }}
                    >
                      {getFilteredOptions("date").map((date) => (
                        <Option key={date} value={date}>
                          {date}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={8}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%",
                        paddingLeft: "12px",
                        color: "#666",
                      }}
                    >
                      共 {filteredData.length} 条数据
                    </div>
                  </Col>
                </Row>
                <Table
                  dataSource={filteredData}
                  columns={generateOriginalColumns()}
                  scroll={{ x: 600 }}
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              <TabPane tab="报表数据" key="2">
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Select
                      mode="multiple" // 启用多选模式
                      showSearch
                      placeholder="请选择派出所"
                      value={filters.unit}
                      onChange={(value) => handleFilterChange("unit", value)}
                      onSearch={(value) => handleSearchChange("unit", value)}
                      allowClear
                      style={{ width: "100%" }}
                    >
                      {getFilteredOptions("unit").map((unit) => (
                        <Option key={unit} value={unit}>
                          {unit}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
                <Table
                  dataSource={getFilteredReportData()}
                  columns={generateReportColumns()}
                  scroll={{ x: 600 }}
                  pagination={{ pageSize: 20 }}
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FgExcel;

import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  message,
  Row,
  Col,
  Spin,
  Input,
  Tree,
  Select,
  ConfigProvider,
} from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import ExcelJS from "exceljs";
import {
  buildDeptTree,
  DeptNode,
  findDeptNode,
  getAllChildDeptCodes,
} from "./DeptTreeBuilder";
import zhCN from "antd/lib/locale/zh_CN";
// 导入通用业务筛选组件
import BusinessFilter from "../../components/BusinessFilter/BusinessFilter";
import thirdservice from "../../services/thirdService";

const { Title, Paragraph } = Typography;
const { Option } = Select;

// 定义dayCount数据接口
interface DayCountData {
  date: string;
  deptCode: string;
  deptDayCount: string;
}

// 定义报表数据接口
interface ReportData {
  deptCode: string;
  deptName: string;
  parentCode: string;
  dates: Record<string, number>; // key为日期，value为数量
  totalCount: number;
}

// 定义表格展示数据接口
interface TableData {
  key: string;
  deptCode: string;
  deptName: string;
  date: string;
  deptDayCount: number;
}

// 定义树节点接口
interface TreeNodeData {
  title: string;
  key: string;
  children?: TreeNodeData[];
}

const ExcelTemplateGenerator: React.FC = () => {
  const [dayCountData, setDayCountData] = useState<DayCountData[]>([]); // 原始数据
  const [reportData, setReportData] = useState<ReportData[]>([]); // 报表数据
  const [tableData, setTableData] = useState<TableData[]>([]); // 表格展示数据
  const [deptTree, setDeptTree] = useState<DeptNode[]>([]); // 部门树结构
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]); // 用于展示的树数据
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]); // 展开的树节点
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]); // 选中的树节点
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true); // 自动展开父节点
  const [loading, setLoading] = useState(false);
  const [reportTitle, setReportTitle] = useState(""); // 报表标题

  // 添加筛选状态
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined
  ); // 选中的日期
  const [selectedDept, setSelectedDept] = useState<string | undefined>(
    undefined
  ); // 选中的部门

  // 业务筛选条件状态
  const [filterParams, setFilterParams] = useState({
    taskIds: [] as string[],
    beginTime: undefined as string | undefined,
    endTime: undefined as string | undefined,
  });

  // 获取所有唯一日期用于下拉框
  const getUniqueDates = () => {
    return Array.from(new Set(dayCountData.map((item) => item.date))).sort();
  };

  // 获取所有部门用于下拉框
  const getAllDepts = () => {
    return reportData.map((item) => ({
      deptCode: item.deptCode,
      deptName: item.deptName,
    }));
  };

  // 组件加载时默认加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 加载默认数据
  const loadData = async () => {
    try {
      setLoading(true);

      // 加载dayCount数据（根据筛选条件）
      let dayCountArray: DayCountData[] = [];

      // 如果有筛选条件，则使用筛选条件调用接口
      if (
        filterParams.taskIds.length > 0 ||
        filterParams.beginTime ||
        filterParams.endTime
      ) {
        // 调用实际的筛选接口获取数据
        const response = await thirdservice.getDayCountData({
          taskIds: filterParams.taskIds,
          beginTime: filterParams.beginTime,
          endTime: filterParams.endTime,
        });

        // 检查响应数据
        if (response && response.data && Array.isArray(response.data)) {
          dayCountArray = response.data;
        } else {
          message.warning("获取报表数据失败，使用模拟数据");
          const dayCountResponse = await fetch("/dayCount.txt");
          const dayCountText = await dayCountResponse.text();
          dayCountArray = JSON.parse(dayCountText);
        }
      } else {
        // 加载默认数据
        const dayCountResponse = await fetch("/dayCount.txt");
        const dayCountText = await dayCountResponse.text();
        dayCountArray = JSON.parse(dayCountText);
      }

      setDayCountData(dayCountArray);

      // 加载部门数据
      const deptResponse = await fetch("/dept.txt");
      const deptText = await deptResponse.text();
      const deptArray: DeptNode[] = JSON.parse(deptText);
      const tree = buildDeptTree(deptArray);
      setDeptTree(tree);

      // 构建用于展示的树数据
      const treeNodes = buildTreeNodes(tree);
      setTreeData(treeNodes);

      // 默认展开第一层节点
      const firstLevelKeys = tree.map((node) => node.deptCode);
      setExpandedKeys(firstLevelKeys);

      // 处理报表数据
      processReportData(dayCountArray, tree);

      message.success("数据加载成功");
    } catch (error) {
      console.error("加载数据失败:", error);
      message.error("加载数据失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 构建用于展示的树节点数据
  const buildTreeNodes = (nodes: DeptNode[]): TreeNodeData[] => {
    return nodes.map((node) => ({
      title: node.deptName,
      key: node.deptCode,
      children:
        node.children && node.children.length > 0
          ? buildTreeNodes(node.children)
          : undefined,
    }));
  };

  // 处理报表数据
  const processReportData = (
    dayCountArray: DayCountData[],
    deptTree: DeptNode[]
  ) => {
    // 按部门代码分组数据
    const groupedData: Record<string, ReportData> = {};

    // 初始化所有部门
    const initDeptData = (nodes: DeptNode[]) => {
      nodes.forEach((node) => {
        groupedData[node.deptCode] = {
          deptCode: node.deptCode,
          deptName: node.deptName,
          parentCode: node.parentCode,
          dates: {},
          totalCount: 0,
        };

        if (node.children && node.children.length > 0) {
          initDeptData(node.children);
        }
      });
    };

    initDeptData(deptTree);

    // 填充数据
    dayCountArray.forEach((item) => {
      if (!groupedData[item.deptCode]) {
        // 如果部门不存在，创建一个临时条目
        groupedData[item.deptCode] = {
          deptCode: item.deptCode,
          deptName: `未知部门(${item.deptCode})`,
          parentCode: "",
          dates: {},
          totalCount: 0,
        };
      }

      // 设置日期数据
      groupedData[item.deptCode].dates[item.date] = parseInt(
        item.deptDayCount,
        10
      );
      groupedData[item.deptCode].totalCount += parseInt(item.deptDayCount, 10);
    });

    // 转换为数组
    const reportDataArray = Object.values(groupedData);
    setReportData(reportDataArray);

    // 转换为表格数据（展开形式）
    const tableDataArray: TableData[] = [];
    dayCountArray.forEach((item, index) => {
      // 查找部门名称
      const dept = findDeptNode(deptTree, item.deptCode);
      const deptName = dept ? dept.deptName : `未知部门(${item.deptCode})`;

      tableDataArray.push({
        key: `${item.deptCode}-${item.date}`,
        deptCode: item.deptCode,
        deptName: deptName,
        date: item.date,
        deptDayCount: parseInt(item.deptDayCount, 10),
      });
    });

    setTableData(tableDataArray);
  };

  // 添加筛选处理函数
  const handleFilter = () => {
    let filteredData = [...tableData];

    // 根据选中的日期筛选
    if (selectedDate) {
      filteredData = filteredData.filter((item) => item.date === selectedDate);
    }

    // 根据选中的部门筛选
    if (selectedDept) {
      filteredData = filteredData.filter(
        (item) => item.deptCode === selectedDept
      );
    }

    return filteredData;
  };

  // 重置筛选条件
  const resetFilter = () => {
    setSelectedDate(undefined);
    setSelectedDept(undefined);
  };

  // 处理业务筛选条件变化
  const handleBusinessFilterChange = (filterValues: {
    taskIds: string[];
    beginTime?: string;
    endTime?: string;
  }) => {
    setFilterParams({
      taskIds: filterValues.taskIds,
      beginTime: filterValues.beginTime,
      endTime: filterValues.endTime,
    });
  };

  // 树节点展开/收缩
  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };

  // 树节点选择
  const onCheck = (checkedKeysValue: any) => {
    // 处理不同类型的选中值
    if (Array.isArray(checkedKeysValue)) {
      setCheckedKeys(checkedKeysValue);
    } else {
      setCheckedKeys(checkedKeysValue.checked);
    }
  };

  // 获取选中部门及其子部门的所有代码
  const getSelectedDeptCodes = (): string[] => {
    const allSelectedCodes: string[] = [];

    // 遍历所有选中的节点
    checkedKeys.forEach((key) => {
      allSelectedCodes.push(key as string);

      // 查找该节点并获取所有子节点
      const node = findDeptNode(deptTree, key as string);
      if (node) {
        const childCodes = getAllChildDeptCodes(node);
        allSelectedCodes.push(...childCodes);
      }
    });

    // 去重
    return Array.from(new Set(allSelectedCodes));
  };

  // 生成Excel模板数据
  const generateExcelTemplate = async () => {
    if (reportData.length === 0) {
      message.warning("没有数据可导出");
      return;
    }

    if (checkedKeys.length === 0) {
      message.warning("请至少选择一个部门");
      return;
    }

    try {
      setLoading(true);

      // 获取选中的部门代码（包括子部门）
      const selectedDeptCodes = getSelectedDeptCodes();

      // 过滤出选中部门的数据
      const filteredReportData = reportData.filter((item) =>
        selectedDeptCodes.includes(item.deptCode)
      );

      if (filteredReportData.length === 0) {
        message.warning("选中的部门没有相关数据");
        return;
      }

      // 获取所有唯一日期并排序
      const uniqueDates = Array.from(
        new Set(dayCountData.map((item) => item.date))
      ).sort();

      // 将日期格式从 YYYY-MM-DD 转换为 M.DD 格式
      const formattedDates = uniqueDates.map((date) => {
        const [year, month, day] = date.split("-");
        return `${parseInt(month)}.${parseInt(day)}`;
      });

      // 创建新的工作簿
      const workbook = new ExcelJS.Workbook();

      // 获取第二级部门（市级部门）
      const secondLevelDepts: DeptNode[] = [];
      deptTree.forEach((root) => {
        if (root.children) {
          secondLevelDepts.push(...root.children);
        }
      });

      // 为每个第二级部门创建工作表
      secondLevelDepts.forEach((secondLevelDept) => {
        // 检查该第二级部门是否有被选中的数据
        const deptAndChildrenCodes = [
          secondLevelDept.deptCode,
          ...getAllChildDeptCodes(secondLevelDept),
        ];
        const hasRelevantData = filteredReportData.some((item) =>
          deptAndChildrenCodes.includes(item.deptCode)
        );

        if (!hasRelevantData) {
          return; // 如果没有相关数据，跳过创建工作表
        }

        // 过滤出属于当前第二级部门的派出所数据
        const policeStationDepts = filteredReportData.filter((item) => {
          // 放宽过滤条件，只要属于当前第二级部门就可以
          return deptAndChildrenCodes.includes(item.deptCode);
        });

        // 如果没有相关数据，跳过创建工作表
        if (policeStationDepts.length === 0) {
          return;
        }

        // 创建工作表
        const worksheet = workbook.addWorksheet(secondLevelDept.deptName);

        // 计算总列数（序号+分局+派出所+日期列+完成总数）
        const totalColumns = 3 + formattedDates.length + 1;

        // 设置列宽
        const columns = [];
        for (let i = 0; i < totalColumns; i++) {
          // 调整第三列（派出所列）的宽度，确保文本能完全显示
          if (i === 2) {
            // 第三列（索引为2）
            columns.push({ width: 25 }); // 增加宽度到25
          } else {
            columns.push({ width: 15 });
          }
        }
        worksheet.columns = columns;

        // 计算日期范围
        const startDate = uniqueDates[0];
        const endDate = uniqueDates[uniqueDates.length - 1];
        const [startYear, startMonth, startDay] = startDate.split("-");
        const [endYear, endMonth, endDay] = endDate.split("-");

        // 第一行 - 合并所有单元格填充标题
        const titleRow = worksheet.addRow([]);
        titleRow.height = 60; // 增加行高以适应两行内容
        for (let i = 0; i < totalColumns; i++) {
          const cell = titleRow.getCell(i + 1);
          cell.value = i === 0 ? reportTitle : "";
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { bold: true, size: 14 };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
        // 合并第一行和第二行的所有单元格，实现纵向合并
        worksheet.mergeCells(1, 1, 2, totalColumns);

        // 第三行 - 数据截止时间，合并所有单元格
        const timeRow = worksheet.addRow([]);
        timeRow.height = 25;
        for (let i = 0; i < totalColumns; i++) {
          const cell = timeRow.getCell(i + 1);
          cell.value =
            i === 0
              ? `数据截止时间：${parseInt(startMonth)}月${parseInt(
                  startDay
                )}日至${parseInt(endMonth)}月${parseInt(endDay)}日`
              : "";
          // 设置为右对齐
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.font = { bold: true };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }
        worksheet.mergeCells(3, 1, 3, totalColumns);

        // 第四行 - 表头第一行
        const headerRow4 = worksheet.addRow([
          "序号",
          "分局",
          "派出所",
          ...Array(formattedDates.length).fill("完成数"),
          "完成总数",
        ]);
        headerRow4.height = 25;
        headerRow4.eachCell((cell, colNumber) => {
          cell.font = { bold: true };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // 第五行 - 表头第二行
        const headerRow5 = worksheet.addRow([
          "",
          "",
          "",
          ...formattedDates,
          "完成总数",
        ]);
        headerRow5.height = 25;
        headerRow5.eachCell((cell, colNumber) => {
          cell.font = { bold: true };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // 表头行的合并
        // 注意：我们必须确保不会重复合并已经合并的单元格，否则会抛出错误
        // 4A,5A 合并单元格 "序号"
        worksheet.mergeCells(4, 1, 5, 1);
        // 4B,5B 合并单元格 "分局"
        worksheet.mergeCells(4, 2, 5, 2);
        // 4C,5C 合并单元格 "派出所"
        worksheet.mergeCells(4, 3, 5, 3);
        // 4D 开始到第四行倒数第二列合并为"完成数"
        worksheet.mergeCells(4, 4, 4, 3 + formattedDates.length);
        // 第四行最后一列和第五行最后一列合并为"完成总数"
        worksheet.mergeCells(
          4,
          4 + formattedDates.length,
          5,
          4 + formattedDates.length
        );

        // 添加数据行
        let rowIndex = 6; // 从第6行开始（索引为6，因为前面有5行表头）
        const branchStartRows: Record<string, number> = {}; // 记录每个分局的起始行

        // 按分局分组派出所数据
        const policeStationsByBranch: Record<string, ReportData[]> = {};
        policeStationDepts.forEach((policeStation) => {
          // 获取派出所的直接上级部门（分局）
          const branchDept = findDeptNode(deptTree, policeStation.parentCode);
          // 根据规范，只有deptLevel为3的部门才作为分局处理
          if (branchDept && branchDept.deptLevel === 3) {
            const branchCode = branchDept.deptCode;

            if (!policeStationsByBranch[branchCode]) {
              policeStationsByBranch[branchCode] = [];
            }
            policeStationsByBranch[branchCode].push(policeStation);
          }
        });

        // 添加数据行和总计行
        Object.keys(policeStationsByBranch).forEach((branchCode) => {
          const policeStations = policeStationsByBranch[branchCode];

          // 记录分局的起始行
          branchStartRows[branchCode] = rowIndex;

          // 初始化序号
          let localRowIndex = 1;

          // 计算分局的总计数据
          const branchTotal: number[] = Array(formattedDates.length).fill(0);
          let branchTotalCount = 0;

          policeStations.forEach((policeStation) => {
            // 计算每日数据和行总计
            const dateValues: number[] = [];
            let rowTotalCount = 0;

            formattedDates.forEach((date, index) => {
              const [month, day] = date.split(".");
              const fullDate = `2025-${month.padStart(2, "0")}-${day.padStart(
                2,
                "0"
              )}`;
              const value = policeStation.dates[fullDate] || 0;
              dateValues.push(value);
              rowTotalCount += value;
            });

            // 获取派出所的直接上级部门（分局）名称
            const policeBranchDept = findDeptNode(
              deptTree,
              policeStation.parentCode
            );
            // 根据规范，只有deptLevel为3的部门才作为分局显示
            const policeBranchName =
              policeBranchDept && policeBranchDept.deptLevel === 3
                ? policeBranchDept.deptName
                : "未知分局";

            const rowData = [
              localRowIndex++, // 序号（从1开始，每个分局内重新计算）
              policeBranchName !== "未知分局" ? policeBranchName : "", // 分局（每个派出所都显示分局名称，未知分局显示为空）
              policeStation.deptName, // 派出所
              ...dateValues, // 每个日期的数据
              rowTotalCount, // 完成总数
            ];

            const dataRow = worksheet.addRow(rowData);
            dataRow.height = 15; // 降低行高
            dataRow.eachCell((cell, colNumber) => {
              cell.alignment = { horizontal: "center", vertical: "middle" };
              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
            });

            // 保存派出所的deptCode到单元格的备注中，用于后续数据填充时的匹配
            const policeCell = dataRow.getCell(3); // 第三列是派出所列
            policeCell.note = policeStation.deptCode; // 将deptCode保存到单元格备注中

            // 累计分局总计
            branchTotal.forEach((total, index) => {
              branchTotal[index] = total + dateValues[index];
            });
            branchTotalCount += rowTotalCount;

            rowIndex++;
          });

          // 添加分局总计行
          const totalRowData = [
            "总计", // 在合并后的单元格中显示"总计"
            "", // 分局为空
            "", // 派出所为空
            ...branchTotal, // 每个日期的总计
            branchTotalCount, // 完成总数
          ];

          const totalRow = worksheet.addRow(totalRowData);
          totalRow.height = 15; // 降低行高
          totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });

          // 合并分局总计行的A、B、C列（第1、2、3列）
          worksheet.mergeCells(rowIndex, 1, rowIndex, 3);

          rowIndex++;
        });

        // 添加整个表格的总计行
        // 计算每列的总和
        const overallTotals: number[] = Array(formattedDates.length).fill(0);
        let overallTotalCount = 0;

        // 遍历所有数据行（除了"总计"行），累加数据
        for (let row = 6; row < rowIndex; row++) {
          const rowObj = worksheet.getRow(row);
          // 检查是否为"总计"行
          const policeNameCell = rowObj.getCell(3);
          const policeName = policeNameCell.value as string;

          // 只有不是"总计"行才参与总计算
          if (policeName !== "总计") {
            // 累加每日数据
            for (let col = 4; col < 4 + formattedDates.length; col++) {
              const cell = rowObj.getCell(col);
              const value = typeof cell.value === "number" ? cell.value : 0;
              overallTotals[col - 4] += value;
            }

            // 累加该行的总计
            const totalCell = rowObj.getCell(4 + formattedDates.length);
            const rowTotal =
              typeof totalCell.value === "number" ? totalCell.value : 0;
            overallTotalCount += rowTotal;
          }
        }

        // 构造总计行数据
        const overallTotalRowData = [
          "总计", // 在合并后的单元格中显示"总计"
          "", // 分局为空
          "", // 派出所为空
          ...overallTotals, // 每个日期的总计
          overallTotalCount, // 完成总数
        ];

        // 添加总计行
        const overallTotalRow = worksheet.addRow(overallTotalRowData);
        overallTotalRow.height = 15; // 降低行高
        overallTotalRow.eachCell((cell, colNumber) => {
          cell.font = { bold: true };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // 合并总计行的A、B、C列（第1、2、3列）
        worksheet.mergeCells(rowIndex, 1, rowIndex, 3);

        rowIndex++;

        // 合并相同分局的单元格（在所有数据添加完成后再进行）
        Object.keys(policeStationsByBranch).forEach((branchCode) => {
          const policeStations = policeStationsByBranch[branchCode];
          const startRow = branchStartRows[branchCode];
          // 不包含总计行，总计行在startRow + policeStations.length位置
          const endRow = startRow + policeStations.length - 1;

          // 获取分局信息并检查层级
          const branchDept = findDeptNode(deptTree, branchCode);
          // 只有deptLevel为3的部门才进行合并
          // 确保有多个派出所才进行合并，避免合并单个单元格
          if (
            endRow > startRow &&
            branchDept &&
            branchDept.deptLevel === 3
          ) {
            worksheet.mergeCells(startRow, 2, endRow, 2);
          }
        });

        // 对分局列（第二列）从第六行开始到最后一行的单元格应用特殊样式
        // 首先确定最后一行的行号
        const lastRowNumber = rowIndex - 1;
        // 从第6行到最后一行，对第二列应用黑体、22号字体，并将字体调整为竖直显示
        for (let row = 6; row <= lastRowNumber; row++) {
          // 调整行高以适应22号字体
          const rowObj = worksheet.getRow(row);
          rowObj.height = 30; // 降低行高，但仍要确保文字能完整显示
          
          const cell = worksheet.getCell(row, 2);
          cell.font = {
            name: "黑体",
            size: 22,
            bold: true,
          };
          // 设置文字竖直显示，使用垂直文本方向
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            textRotation: "vertical", // 使用垂直文本方向而不是旋转角度
          };
        }

        // 对派出所列（第三列）从第六行开始到最后一行的单元格应用宋体、14号字体
        for (let row = 6; row <= lastRowNumber; row++) {
          const cell = worksheet.getCell(row, 3);
          cell.font = {
            name: "宋体",
            size: 14,
          };
          // 保持居中对齐
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        }
      });

      // 导出文件
      const fileName = `${reportTitle}_报表.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
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

      message.success("Excel报表生成成功");
    } catch (error) {
      console.error("生成Excel报表失败:", error);
      message.error("生成Excel报表失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns = [
    {
      title: "部门代码",
      dataIndex: "deptCode",
      key: "deptCode",
      width: 150,
    },
    {
      title: "部门名称",
      dataIndex: "deptName",
      key: "deptName",
      width: 200,
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "完成数",
      dataIndex: "deptDayCount",
      key: "deptDayCount",
      width: 100,
    },
  ];

  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ padding: "24px" }}>
        <Card>
          <Title level={3}>任务统计报表导出</Title>
          <Paragraph>根据用户选择的部门生成符合规范的Excel报表。</Paragraph>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <Input
                placeholder="请输入报表标题"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small" title="部门选择">
                <Tree
                  checkable
                  expandedKeys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  onExpand={onExpand}
                  checkedKeys={checkedKeys}
                  onCheck={onCheck}
                  treeData={treeData}
                />
              </Card>
            </Col>
            <Col span={16}>
              {/* 使用通用业务筛选组件 */}
              <BusinessFilter
                onFilterChange={handleBusinessFilterChange}
                onReset={resetFilter}
              />

              {/* 添加查询数据按钮 */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col>
                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={loadData}
                    loading={loading}
                  >
                    查询数据
                  </Button>
                </Col>
              </Row>

              {/* 原有的日期和部门筛选移到这里 */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <Select
                    placeholder="请选择日期"
                    value={selectedDate}
                    onChange={setSelectedDate}
                    allowClear
                    style={{ width: "100%" }}
                  >
                    {getUniqueDates().map((date: string) => (
                      <Option key={date} value={date}>
                        {date}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={8}>
                  <Select
                    showSearch
                    placeholder="请选择部门"
                    value={selectedDept}
                    onChange={setSelectedDept}
                    allowClear
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string)
                        ?.toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    style={{ width: "100%" }}
                  >
                    {getAllDepts().map(
                      (dept: { deptCode: string; deptName: string }) => (
                        <Option key={dept.deptCode} value={dept.deptCode}>
                          {dept.deptName}
                        </Option>
                      )
                    )}
                  </Select>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadData}
                    loading={loading}
                  >
                    重新加载数据
                  </Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={generateExcelTemplate}
                    loading={loading}
                    disabled={reportData.length === 0}
                  >
                    生成Excel报表
                  </Button>
                </Col>
              </Row>

              {loading ? (
                <div style={{ textAlign: "center", padding: "50px" }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>正在加载数据...</div>
                </div>
              ) : (
                <Table
                  dataSource={handleFilter()} // 使用筛选后的数据
                  columns={columns}
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 600, y: 600 }}
                  rowKey="key"
                />
              )}
            </Col>
          </Row>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default ExcelTemplateGenerator;

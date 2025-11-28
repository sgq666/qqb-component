import React, { useState, useEffect } from "react";
import { TreeSelect, DatePicker, Button, Row, Col, message, ConfigProvider } from "antd";
import { RangePickerProps } from "antd/lib/date-picker";
import thirdservice from "../../services/thirdService";
import zhCN from 'antd/lib/locale/zh_CN';
import moment from "moment";
import "moment/locale/zh-cn";

// 确保日期格式正确设置
const dateFormat = "YYYY-MM-DD";

// 设置DatePicker的默认格式和本地化
const { RangePicker } = DatePicker;

// 定义部门节点接口
interface DeptNode {
  deptCode: string;
  deptName: string;
  parentCode: string;
  children?: DeptNode[];
}

// 扩展的部门节点接口，用于TreeSelect
interface ExtendedDeptNode extends DeptNode {
  children?: ExtendedDeptNode[];
}

interface BusinessFilterProps {
  onFilterChange: (filterValues: {
    taskIds: string[];
    beginTime?: string;
    endTime?: string;
  }) => void;
  onReset: () => void;
}

const BusinessFilter: React.FC<BusinessFilterProps> = ({ onFilterChange, onReset }) => {
  const [taskIds, setTaskIds] = useState<string[]>([]); // 业务选择
  const [beginTime, setBeginTime] = useState<string>(); // 开始时间
  const [endTime, setEndTime] = useState<string>(); // 结束时间
  const [businessTopicsData, setBusinessTopicsData] = useState<ExtendedDeptNode[]>([]); // 业务专题树数据
  const [dataLoading, setDataLoading] = useState(false); // 数据加载状态

  // 组件加载时默认加载业务专题数据
  useEffect(() => {
    loadBusinessTopics();
  }, []);

  // 加载业务专题数据
  const loadBusinessTopics = async (): Promise<ExtendedDeptNode[]> => {
    try {
      setDataLoading(true);
      const deptRes: any = await thirdservice.taskTree();

      // 检查响应数据
      if (!deptRes.data || !Array.isArray(deptRes.data)) {
        message.warning("业务专题数据格式异常，使用模拟数据");
        return [];
      }

      // 转换数据结构以符合TreeSelect要求
      const transformedData = transformTreeData(deptRes.data, "business");
      setBusinessTopicsData(transformedData);
      return transformedData;
    } catch (error) {
      console.error("业务专题数据加载失败:", error);
      message.error("业务专题数据加载失败，使用模拟数据");
      return [];
    } finally {
      setDataLoading(false);
    }
  };

  // 数据转换和保护函数 - 确保数据结构符合TreeSelect要求
  const transformTreeData = (
    data: any[],
    type: "business" | "department"
  ): ExtendedDeptNode[] => {
    if (!Array.isArray(data)) {
      console.warn(`${type} 数据不是数组格式:`, data);
      return [];
    }

    return data.map((item: any) => {
      const transformed: ExtendedDeptNode = {
        ...item,
        // 确保必要字段存在
        children: item.children
          ? transformTreeData(item.children, type)
          : undefined,
      };

      // 为业务专题数据添加必要字段
      if (type === "business") {
        transformed.deptCode = item.id || item.taskId || item.code || "";
        transformed.deptName = item.name || item.taskName || item.title || "未命名";
      }

      return transformed;
    });
  };

  // 业务专题选择变化
  const onBusinessTopicChange = (values: string[]) => {
    setTaskIds(values);
    onFilterChange({ taskIds: values, beginTime, endTime });
  };

  // 开始时间变化
  const onBeginTimeChange = (date: moment.Moment | null, dateString: string) => {
    setBeginTime(dateString);
    onFilterChange({ taskIds, beginTime: dateString, endTime });
  };

  // 结束时间变化
  const onEndTimeChange = (date: moment.Moment | null, dateString: string) => {
    setEndTime(dateString);
    onFilterChange({ taskIds, beginTime, endTime: dateString });
  };

  // 重置筛选条件
  const handleReset = () => {
    setTaskIds([]);
    setBeginTime(undefined);
    setEndTime(undefined);
    onReset();
    onFilterChange({ taskIds: [], beginTime: undefined, endTime: undefined });
  };

  return (
    <ConfigProvider locale={zhCN}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <TreeSelect
            treeData={businessTopicsData}
            value={taskIds}
            onChange={onBusinessTopicChange}
            treeCheckable={true}
            showCheckedStrategy={TreeSelect.SHOW_ALL}
            placeholder={dataLoading ? "正在加载业务专题..." : "请选择业务专题"}
            style={{ width: "100%" }}
            treeNodeFilterProp="deptName"
            fieldNames={{
              label: "deptName",
              value: "deptCode",
              children: "children",
            }}
            loading={dataLoading}
            disabled={dataLoading}
            notFoundContent={dataLoading ? "加载中..." : "无数据"}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          />
        </Col>
        <Col span={6}>
          <DatePicker
            format={dateFormat}
            placeholder="开始日期"
            onChange={onBeginTimeChange}
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={6}>
          <DatePicker
            format={dateFormat}
            placeholder="结束日期"
            onChange={onEndTimeChange}
            style={{ width: "100%" }}
          />
        </Col>
        <Col span={6}>
          <Button onClick={handleReset}>重置筛选</Button>
        </Col>
      </Row>
    </ConfigProvider>
  );
};

export default BusinessFilter;
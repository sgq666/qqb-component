import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Form,
  Button,
  Row,
  Col,
  Space,
  Table,
  DatePicker,
  Pagination,
  Spin,
  message,
  Input,
  Select,
  TreeSelect,
  Modal,
  Checkbox,
  List,
} from "antd";
import { TaskTreeSelect } from "../../components";
import thirdservice, {
  FormField,
  WorkLogData,
  Form as FormType,
} from "../../services/thirdService";
import { buildDeptTree, DeptNode } from "../StatReport/DeptTreeBuilder";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const WorkLogPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WorkLogData[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [dynamicColumns, setDynamicColumns] = useState<any[]>([]);
  const [taskId, setTaskId] = useState<string | number | null>(null);
  const [forms, setForms] = useState<FormType[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);

  // 部门树相关状态
  const [deptTree, setDeptTree] = useState<DeptNode[]>([]);
  const [deptCodes, setDeptCodes] = useState<string[]>([]); // 部门代码列表

  // 查询完成记录相关状态
  // 定义字段类型枚举
  type FieldType = 'text' | 'jurisdiction' | 'jurisdictionAndCommunity';
  
  // 扩展字段配置类型，添加字段类型属性
  interface ExtendedFieldConfig {
    fieldKeys: string[];
    fieldName: string;
    fieldType?: FieldType; // 新增字段类型，默认为 'text'
    id?: number | string; // 用于自定义配置的ID
  }
  
  // 专门用于自定义字段配置的接口，id 是必需的
  interface CustomFieldConfig {
    id: number | string;
    fieldKeys: string[];
    fieldName: string;
    fieldType?: FieldType; // 新增字段类型，默认为 'text'
  }
  
  const [fieldConfigs, setFieldConfigs] = useState<ExtendedFieldConfig[]>([]);
  const [selectedFieldKeys, setSelectedFieldKeys] = useState<{
    [key: string]: string[];
  }>({});
  const [fieldSearches, setFieldSearches] = useState<any[]>([]);
  const [queryCurrentFormOnly, setQueryCurrentFormOnly] = useState<boolean>(true); // 默认只查询当前表单

  // 模态框相关状态
  const [fieldConfigModalVisible, setFieldConfigModalVisible] = useState(false);
  const [fieldSearchModalVisible, setFieldSearchModalVisible] = useState(false);

  // 自定义字段配置状态
  const [customFieldConfigs, setCustomFieldConfigs] = useState<CustomFieldConfig[]>([]);
  const [useCustomFieldConfig, setUseCustomFieldConfig] = useState(false); // 默认不使用自定义配置
  
  
  // 根据表单字段动态生成表格列
  useEffect(() => {
    if (formFields.length > 0) {
      const columns = [
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
        },
        ...formFields.map((field) => ({
          title: field.fieldValue,
          dataIndex: field.fieldKey,
          key: field.fieldKey,
        })),
      ];
      setDynamicColumns(columns);
    } else {
      // 默认列
      setDynamicColumns([
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
        },
        {
          title: "任务名称",
          dataIndex: "taskName",
          key: "taskName",
        },
        {
          title: "开始时间",
          dataIndex: "startTime",
          key: "startTime",
        },
        {
          title: "结束时间",
          dataIndex: "endTime",
          key: "endTime",
        },
        {
          title: "状态",
          dataIndex: "status",
          key: "status",
        },
      ]);
    }
  }, [formFields]);

  // 当任务ID改变时，获取对应的表单
  useEffect(() => {
    const fetchForms = async () => {
      if (taskId) {
        try {
          setLoading(true);
          const response = await thirdservice.getFormByTaskId(
            taskId.toString()
          );
          if (response.code === 200) {
            setForms(response.data || []);
            // 默认选择第一个表单
            if (response.data && response.data.length > 0) {
              setSelectedFormId(response.data[0].id);
            } else {
              setSelectedFormId(null);
              setFormFields([]);
            }
          } else {
            message.error(response.message || "获取表单失败");
            setForms([]);
            setSelectedFormId(null);
            setFormFields([]);
          }
        } catch (error) {
          console.error("获取表单失败:", error);
          message.error("获取表单失败");
          setForms([]);
          setSelectedFormId(null);
          setFormFields([]);
        } finally {
          setLoading(false);
        }
      } else {
        setForms([]);
        setSelectedFormId(null);
        setFormFields([]);
      }
    };

    fetchForms();
  }, [taskId]);

  // 当表单ID改变时，获取对应的表单字段
  useEffect(() => {
    if (selectedFormId && forms.length > 0) {
      const selectedForm = forms.find((f) => f.id === selectedFormId);
      if (selectedForm) {
        setFormFields(selectedForm.actionItemList || []);
      } else {
        setFormFields([]);
      }
    } else {
      setFormFields([]);
    }
  }, [selectedFormId, forms]);

  // 当表单字段变化时，更新 fieldConfigs
  useEffect(() => {
    if (formFields.length > 0) {
      // 按 fieldKey 分组，相同 fieldValue 的字段合并到同一个 fieldConfig 中
      const groupedFields: { [key: string]: FormField[] } = {};
      
      formFields.forEach((field) => {
        if (!groupedFields[field.fieldValue]) {
          groupedFields[field.fieldValue] = [];
        }
        groupedFields[field.fieldValue].push(field);
      });
      
      // 构建默认 fieldConfigs
      const defaultFieldConfigs = Object.entries(groupedFields).map(
        ([fieldName, fields]) => ({
          fieldKeys: fields.map((f) => f.fieldKey),
          fieldName: fieldName,
          fieldType: 'text' as FieldType, // 默认字段类型为文本
        })
      );
      
      // 如果没有自定义配置或不使用自定义配置，则使用默认配置
      if (!useCustomFieldConfig || customFieldConfigs.length === 0) {
        setFieldConfigs(defaultFieldConfigs);
        
        // 初始化 selectedFieldKeys
        const initialSelectedFieldKeys: { [key: string]: string[] } = {};
        defaultFieldConfigs.forEach((config) => {
          initialSelectedFieldKeys[config.fieldName] = config.fieldKeys;
        });
        setSelectedFieldKeys(initialSelectedFieldKeys);
      }
      
      // 如果使用自定义配置但自定义配置为空，初始化为默认配置
      if (useCustomFieldConfig && customFieldConfigs.length === 0) {
        setCustomFieldConfigs(defaultFieldConfigs.map(config => ({
          ...config,
          id: Date.now() + Math.random(), // 为每个配置项生成唯一ID
          fieldType: (config as ExtendedFieldConfig).fieldType || 'text', // 确保字段类型被设置
        })));
      }
    } else {
      setFieldConfigs([]);
      setCustomFieldConfigs([]);
      setSelectedFieldKeys({});
    }
  }, [formFields, customFieldConfigs, useCustomFieldConfig]);

  // 加载部门树数据
  useEffect(() => {
    const loadDeptTree = async () => {
      try {
        setLoading(true);
        // 从 dept.txt 文件加载部门数据
        const deptResponse = await fetch("/dept.txt");
        const deptText = await deptResponse.text();
        const deptArray: DeptNode[] = JSON.parse(deptText);
        const tree = buildDeptTree(deptArray);
        setDeptTree(tree);
      } catch (error) {
        console.error("加载部门树失败:", error);
        message.error("加载部门树失败");
      } finally {
        setLoading(false);
      }
    };

    loadDeptTree();
  }, []);

  // 构建 TreeSelect 的树形数据
  const buildTreeSelectData = (nodes: DeptNode[]): any[] => {
    return nodes.map((node) => ({
      title: node.deptName,
      value: node.deptCode,
      key: node.deptCode,
      children: node.children ? buildTreeSelectData(node.children) : [],
    }));
  };

  // 获取所有子节点的代码
  const getAllChildCodes = (node: DeptNode): string[] => {
    let codes: string[] = [node.deptCode];
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        codes = codes.concat(getAllChildCodes(child));
      });
    }
    return codes;
  };

  // 处理部门选择，实现选择父节点时自动选择所有子节点并在下拉框显示所有子节点
  const handleDeptChange = (selectedValues: string[]) => {
    // 如果没有选择任何值，直接设置为空数组
    if (!selectedValues || selectedValues.length === 0) {
      setDeptCodes([]);
      return;
    }

    // 构建部门树映射，便于查找
    const deptMap = new Map<string, DeptNode>();
    const buildDeptMap = (nodes: DeptNode[]) => {
      nodes.forEach((node) => {
        deptMap.set(node.deptCode, node);
        if (node.children) {
          buildDeptMap(node.children);
        }
      });
    };
    buildDeptMap(deptTree);

    // 展开所有选中节点的子节点
    const expandedSelections = new Set<string>();

    selectedValues.forEach((code) => {
      const node = deptMap.get(code);
      if (node) {
        // 如果是父节点，添加其所有子节点
        const allChildCodes = getAllChildCodes(node);
        allChildCodes.forEach((childCode) => expandedSelections.add(childCode));
      } else {
        expandedSelections.add(code);
      }
    });

    setDeptCodes(Array.from(expandedSelections));
  };

  // 添加自定义字段配置
  const addCustomFieldConfig = () => {
    const newConfig: CustomFieldConfig = {
      id: Date.now(),
      fieldName: "",
      fieldKeys: [],
      fieldType: 'text', // 默认字段类型为文本
    };
    setCustomFieldConfigs([...customFieldConfigs, newConfig]);
  };

  // 更新自定义字段配置
  const updateCustomFieldConfig = (id: number | string | undefined, field: string, value: any) => {
    if (id === undefined) return; // 如果 id 为 undefined，则不执行更新
    const updatedConfigs = customFieldConfigs.map((config) => {
      if (config.id === id) {
        return { ...config, [field]: value };
      }
      return config;
    });
    setCustomFieldConfigs(updatedConfigs);
  };

  // 删除自定义字段配置
  const removeCustomFieldConfig = (id: number | string) => {
    const updatedConfigs = customFieldConfigs.filter(
      (config) => config.id !== id
    );
    setCustomFieldConfigs(updatedConfigs);
  };

  // 应用自定义字段配置
  const applyCustomFieldConfig = () => {
    setFieldConfigs([...customFieldConfigs]);
    setUseCustomFieldConfig(true);
    setFieldConfigModalVisible(false);
  };

  // 重置为默认字段配置
  const resetToDefaultFieldConfig = () => {
    setUseCustomFieldConfig(false);
    setCustomFieldConfigs([]);
    
    // 重新构建默认配置
    if (formFields.length > 0) {
      const groupedFields: { [key: string]: FormField[] } = {};
      
      formFields.forEach((field) => {
        if (!groupedFields[field.fieldValue]) {
          groupedFields[field.fieldValue] = [];
        }
        groupedFields[field.fieldValue].push(field);
      });
      
      // 构建默认 fieldConfigs
      const defaultFieldConfigs = Object.entries(groupedFields).map(
        ([fieldName, fields]) => ({
          fieldKeys: fields.map((f) => f.fieldKey),
          fieldName: fieldName,
          fieldType: 'text' as FieldType, // 默认字段类型为文本
        })
      );
      
      setFieldConfigs(defaultFieldConfigs);
      
      // 初始化 selectedFieldKeys
      const initialSelectedFieldKeys: { [key: string]: string[] } = {};
      defaultFieldConfigs.forEach((config) => {
        initialSelectedFieldKeys[config.fieldName] = config.fieldKeys;
      });
      setSelectedFieldKeys(initialSelectedFieldKeys);
    }
  };

  // 应用查询条件
  const applyFieldSearches = () => {
    // 这里可以添加验证逻辑
    setFieldSearchModalVisible(false);
  };

  // 导出数据
  const exportData = async (exportType: "current" | "all") => {
    if (!taskId) {
      message.error("请先选择任务");
      return;
    }

    // 如果需要只查询当前表单但没有选中表单，则提示用户
    if (queryCurrentFormOnly && (!selectedFormId || selectedFormId === null)) {
      message.error("请先选择表单");
      return;
    }

    try {
      setLoading(true);

      // 构建导出参数
      const params = {
        actionId: queryCurrentFormOnly && selectedFormId ? selectedFormId.toString() : "", // 如果只查询当前表单且有选中表单，则使用表单ID，否则为空
        taskIds: [taskId.toString()],
        deptCodes: deptCodes,
        fieldConfigs:
          useCustomFieldConfig && customFieldConfigs.length > 0
            ? customFieldConfigs
            : fieldConfigs,
        fieldSearches: fieldSearches,
        exportType: exportType === "current" ? 1 : 2, // 1: 导出当前页，2: 导出所有
        pageNum: pagination.current,
        pageSize: exportType === "current" ? pagination.pageSize : 99999, // 导出所有时设置大数值
        startTime:
          form.getFieldValue(["timeRange", 0])?.format("YYYY-MM-DD HH:mm:ss") ||
          "",
        endTime:
          form.getFieldValue(["timeRange", 1])?.format("YYYY-MM-DD HH:mm:ss") ||
          "",
      };

      // 直接使用axios调用导出接口，绕过响应拦截器中的业务逻辑检查
      const axiosResponse = await thirdservice.exportCompletedRecords(params);

      // 检查响应是否为文件流
      if (
        axiosResponse &&
        axiosResponse.data instanceof Blob &&
        axiosResponse.data.size > 0
      ) {
        // 从响应头获取文件名
        const disposition =
          axiosResponse.headers["content-disposition"] ||
          axiosResponse.headers["Content-Disposition"];
        let fileName = `完成记录_${
          exportType === "current" ? "当前页" : "全部"
        }.xlsx`;

        if (disposition) {
          const fileNameMatch = disposition.match(/filename\*=UTF-8''(.+)/i);
          if (fileNameMatch) {
            fileName = decodeURIComponent(fileNameMatch[1]);
          } else {
            const fileNameMatch2 = disposition.match(/filename=(.+)/i);
            if (fileNameMatch2) {
              fileName = fileNameMatch2[1].replace(/\"/g, "");
            }
          }
        }

        // 创建下载链接
        const url = window.URL.createObjectURL(new Blob([axiosResponse.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();

        // 清理
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        message.success(
          `成功导出${exportType === "current" ? "当前页" : "所有"}数据`
        );
      } else {
        message.error("导出失败，未收到文件数据");
      }
    } catch (error) {
      console.error("导出失败:", error);
      message.error("导出失败");
    } finally {
      setLoading(false);
    }
  };

  // 保存筛选条件相关状态
  const [saveFilterModalVisible, setSaveFilterModalVisible] = useState(false);
  const [saveFilterForm] = Form.useForm();
  const [isEditingFilter, setIsEditingFilter] = useState(false); // 是否为编辑模式
  const [editingFilterId, setEditingFilterId] = useState<number | null>(null); // 正在编辑的筛选条件ID

  // 筛选条件列表相关状态
  const [filterConditionList, setFilterConditionList] = useState<any[]>([]);
  const [filterListModalVisible, setFilterListModalVisible] = useState(false);

  // 保存当前筛选条件
  const saveCurrentFilter = async () => {
    if (!taskId) {
      message.error("请先选择任务");
      return;
    }

    // 如果需要只查询当前表单但没有选中表单，则提示用户
    if (queryCurrentFormOnly && (!selectedFormId || selectedFormId === null)) {
      message.error("请先选择表单");
      return;
    }

    try {
      const formValues = saveFilterForm.getFieldsValue();

      // 构建当前筛选条件参数
      const currentParams = {
        actionId: queryCurrentFormOnly && selectedFormId ? selectedFormId.toString() : "", // 根据设置决定是否使用当前表单ID
        taskIds: [taskId.toString()],
        deptCodes: deptCodes,
        fieldConfigs:
          useCustomFieldConfig && customFieldConfigs.length > 0
            ? customFieldConfigs
            : fieldConfigs,
        fieldSearches: fieldSearches,
        queryCurrentFormOnly: queryCurrentFormOnly, // 添加只查询当前表单的设置
        startTime:
          form.getFieldValue(["timeRange", 0])?.format("YYYY-MM-DD HH:mm:ss") ||
          "",
        endTime:
          form.getFieldValue(["timeRange", 1])?.format("YYYY-MM-DD HH:mm:ss") ||
          "",
      };

      // 将参数转换为字符串
      const conditionString = JSON.stringify(currentParams);

      let response;
      if (isEditingFilter && editingFilterId) {
        // 更新模式
        response = await thirdservice.updateFilterCondition({
          id: editingFilterId,
          condition: conditionString,
          remark: formValues.remark,
          viewName: formValues.saveAsView ? formValues.viewName : "",
          updateView: formValues.saveAsView ? 1 : 0,
        });
      } else {
        // 新增模式
        response = await thirdservice.saveFilterCondition({
          condition: conditionString,
          remark: formValues.remark,
          viewName: formValues.saveAsView ? formValues.viewName : "",
          updateView: formValues.saveAsView ? 1 : 0,
        });
      }

      if (response.code === 200) {
        message.success(
          isEditingFilter ? "筛选条件更新成功" : "筛选条件保存成功"
        );
        setSaveFilterModalVisible(false);
        setIsEditingFilter(false);
        setEditingFilterId(null);
        saveFilterForm.resetFields();
        // 重新加载筛选条件列表
        loadFilterConditionList();
      } else {
        message.error(
          response.message || (isEditingFilter ? "更新失败" : "保存失败")
        );
      }
    } catch (error) {
      console.error(
        isEditingFilter ? "更新筛选条件失败:" : "保存筛选条件失败:",
        error
      );
      message.error(isEditingFilter ? "更新失败" : "保存失败");
    }
  };

  // 加载筛选条件列表
  const loadFilterConditionList = async () => {
    try {
      const response = await thirdservice.getFilterConditionList();
      if (response.code === 200) {
        setFilterConditionList(response.data || []);
      } else {
        message.error(response.message || "获取筛选条件列表失败");
      }
    } catch (error) {
      console.error("获取筛选条件列表失败:", error);
      message.error("获取筛选条件列表失败");
    }
  };

  // 应用筛选条件
  const applyFilterCondition = (conditionData: any) => {
    try {
      const condition = JSON.parse(conditionData.condition);

      // 更新任务ID
      if (condition.taskIds && condition.taskIds.length > 0) {
        const taskIdValue = condition.taskIds[0];
        setTaskId(taskIdValue);

        // 更新表单字段的值
        form.setFieldsValue({ taskId: taskIdValue });

        // 获取并设置对应的表单
        const fetchForms = async () => {
          try {
            setLoading(true);
            const response = await thirdservice.getFormByTaskId(
              taskIdValue.toString()
            );
            if (response.code === 200) {
              setForms(response.data || []);

              // 更新表单ID
              if (condition.actionId) {
                const actionIdValue = parseInt(condition.actionId);
                setSelectedFormId(actionIdValue);

                // 更新表单字段的值
                form.setFieldsValue({ formId: actionIdValue });

                // 获取并设置对应的表单字段
                const selectedForm = response.data.find(
                  (f) => f.id === actionIdValue
                );
                if (selectedForm) {
                  setFormFields(selectedForm.actionItemList || []);

                  // 更新字段配置
                  if (Array.isArray(condition.fieldConfigs)) {
                    setFieldConfigs(condition.fieldConfigs);
                    setUseCustomFieldConfig(true);
                    setCustomFieldConfigs(condition.fieldConfigs);
                  }
                }
              }
            } else {
              message.error(response.message || "获取表单失败");
            }
          } catch (error) {
            console.error("获取表单失败:", error);
            message.error("获取表单失败");
          } finally {
            setLoading(false);
          }
        };

        fetchForms();
      }

      // 更新部门代码
      if (Array.isArray(condition.deptCodes)) {
        setDeptCodes(condition.deptCodes);

        // 更新部门字段的值
        form.setFieldsValue({ deptCodes: condition.deptCodes });
      }

      // 更新查询条件
      if (Array.isArray(condition.fieldSearches)) {
        setFieldSearches(condition.fieldSearches);
      }

      // 更新时间范围
      if (condition.startTime || condition.endTime) {
        const timeRange = [];
        if (condition.startTime) {
          timeRange[0] = dayjs(condition.startTime);
        }
        if (condition.endTime) {
          timeRange[1] = dayjs(condition.endTime);
        }
        form.setFieldsValue({ timeRange: timeRange });
      }
      
      // 更新只查询当前表单设置
      if (condition.queryCurrentFormOnly !== undefined) {
        setQueryCurrentFormOnly(condition.queryCurrentFormOnly);
      }

      message.success("筛选条件应用成功");
      setFilterListModalVisible(false);
    } catch (error) {
      console.error("应用筛选条件失败:", error);
      message.error("应用筛选条件失败");
    }
  };

  // 删除筛选条件
  const deleteFilterCondition = async (id: number, index: number) => {
    try {
      const response = await thirdservice.deleteFilterCondition(id);
      if (response.code === 200) {
        message.success("筛选条件删除成功");

        // 从列表中移除已删除的项
        const updatedList = [...filterConditionList];
        updatedList.splice(index, 1);
        setFilterConditionList(updatedList);
      } else {
        message.error(response.message || "删除失败");
      }
    } catch (error) {
      console.error("删除筛选条件失败:", error);
      message.error("删除失败");
    }
  };


  // 查询数据
  const fetchData = async (params: any = {}) => {
    setLoading(true);
    try {
      // 这里应该是实际的API调用
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 模拟数据 - 实际应用中应使用thirdservice.queryWorkLog
      const mockData: WorkLogData[] = Array.from(
        { length: params.pageSize },
        (_, index) => {
          const mockItem: WorkLogData = {
            id: `${(params.page - 1) * params.pageSize + index + 1}`,
            taskName: `任务${(params.page - 1) * params.pageSize + index + 1}`,
            startTime: dayjs()
              .subtract(index, "day")
              .format("YYYY-MM-DD HH:mm:ss"),
            endTime: dayjs()
              .subtract(index - 1, "day")
              .format("YYYY-MM-DD HH:mm:ss"),
            status: index % 2 === 0 ? "已完成" : "进行中",
          };

          // 根据表单字段动态添加数据
          formFields.forEach((field) => {
            mockItem[field.fieldKey] = `值${index + 1}`;
          });

          return mockItem;
        }
      );

      setData(mockData);
      setPagination({
        ...pagination,
        current: params.page,
        pageSize: params.pageSize,
        total: 100, // 模拟总数据量
      });
    } catch (error) {
      console.error("查询工作日志失败:", error);
      message.error("查询工作日志失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理查询
  const handleSearch = async (values: any) => {
    console.log("查询条件:", values);

    // 验证时间范围
    if (values.timeRange && values.timeRange[0] && values.timeRange[1]) {
      const startTime = values.timeRange[0];
      const endTime = values.timeRange[1];

      if (startTime.isAfter(endTime)) {
        message.error("开始时间不能晚于结束时间");
        return;
      }
    }

    const queryParams = {
      taskId: values.taskId?.toString(),
      formId: selectedFormId, // 传递选中的表单ID
      startTime: values.timeRange?.[0]?.format("YYYY-MM-DD HH:mm:ss"),
      endTime: values.timeRange?.[1]?.format("YYYY-MM-DD HH:mm:ss"),
      page: 1,
      pageSize: pagination.pageSize,
      ...values, // 包含其他动态查询条件
    };

    await fetchData(queryParams);
  };

  // 添加查询条件
  const addFieldSearch = () => {
    setFieldSearches([
      ...fieldSearches,
      { fieldName: "", condition: "=", value: "" },
    ]);
  };

  // 更新查询条件
  const updateFieldSearch = (index: number, field: string, value: any) => {
    const newFieldSearches = [...fieldSearches];
    
    // 如果是更新条件字段，且之前是'in'条件，需要处理值的格式
    if (field === 'condition' && newFieldSearches[index].condition === 'in') {
      // 将之前的逗号分隔的值转换为数组，以便在UI中正确显示
      const currentValue = newFieldSearches[index].value;
      if (typeof currentValue === 'string' && currentValue.includes(',')) {
        // 保持逗号分隔的字符串格式
      }
    }
    
    newFieldSearches[index] = { ...newFieldSearches[index], [field]: value };
    setFieldSearches(newFieldSearches);
  };

  // 删除查询条件
  const removeFieldSearch = (index: number) => {
    const newFieldSearches = [...fieldSearches];
    newFieldSearches.splice(index, 1);
    setFieldSearches(newFieldSearches);
  };

  // 查询完成记录
  const handleQueryCompletedRecords = async (params?: any) => {
    // 如果没有传入参数，则构建查询参数
    const queryParams = {
      actionId: queryCurrentFormOnly && selectedFormId ? selectedFormId.toString() : "", // 如果只查询当前表单且有选中表单，则使用表单ID，否则为空
      taskIds: taskId ? [taskId.toString()] : [],
      deptCodes: deptCodes,
      fieldConfigs:
        useCustomFieldConfig && customFieldConfigs.length > 0
          ? customFieldConfigs.map(config => ({...config}))
          : fieldConfigs.map(config => ({...config})),
      fieldSearches: fieldSearches.map(search => ({...search})),
      pageSize: params?.pageSize || pagination.pageSize,
      pageNum: params?.pageNum || pagination.current,
      startTime:
        form.getFieldValue(["timeRange", 0])?.format("YYYY-MM-DD HH:mm:ss") ||
        "",
      endTime:
        form.getFieldValue(["timeRange", 1])?.format("YYYY-MM-DD HH:mm:ss") ||
        "",
    };
    
    // 验证必要参数
    if (queryParams.taskIds.length === 0) {
      message.error("请先选择任务");
      return;
    }
    
    // 如果需要只查询当前表单，但没有选中表单，则提示用户
    if (queryCurrentFormOnly && (!selectedFormId || selectedFormId === null)) {
      message.error("请先选择表单");
      return;
    }
    
    setLoading(true);
    try {
      console.log("查询参数:", queryParams);
      const response = await thirdservice.queryCompletedRecords(queryParams);

      if (response.code === 200) {
        // 处理响应数据
        const result = response.data;

        // 设置数据
        setData(result.records || []);

        // 动态生成列
        if (result.records && result.records.length > 0) {
          const firstRecord = result.records[0];
          const dynamicColumns = Object.keys(firstRecord).map((key) => ({
            title: key,
            dataIndex: key,
            key: key,
            // 如果是图片字段，特殊处理
            render: (text: any) => {
              if (
                key.toLowerCase().includes("图片") &&
                typeof text === "string"
              ) {
                try {
                  const imageArray = JSON.parse(text);
                  if (Array.isArray(imageArray) && imageArray.length > 0) {
                    return (
                      <div>
                        {imageArray.map((img, idx) => (
                          <div key={idx} style={{ marginBottom: "4px" }}>
                            <a
                              href={img.queryPath}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {img.fileName}
                            </a>
                          </div>
                        ))}
                      </div>
                    );
                  }
                } catch (e) {
                  // 如果解析失败，直接显示文本
                  return text;
                }
              }
              return text;
            },
          }));

          setDynamicColumns(dynamicColumns);
        }

        setPagination({
          ...pagination,
          current: result.current || 1,
          pageSize: result.size || 10,
          total: result.total || 0,
        });
        message.success("查询完成记录成功");
      } else {
        message.error(response.message || "查询完成记录失败");
      }
    } catch (error) {
      console.error("查询完成记录失败:", error);
      message.error("查询完成记录失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    setData([]);
    setFormFields([]);
    setTaskId(null);
    setForms([]);
    setSelectedFormId(null);
    setPagination({
      current: 1,
      pageSize: 10,
      total: 0,
    });
  };

  // 处理分页变化
  const handlePageChange = (page: number, pageSize?: number) => {
    // 只传递分页参数
    const params = {
      pageNum: page,
      pageSize: pageSize || pagination.pageSize,
    };

    // 调用查询完成记录接口
    handleQueryCompletedRecords(params);
  };

  // 当任务选择改变时更新taskId状态
  const handleTaskChange = (value: string | number) => {
    setTaskId(value?.toString() || null);
    // 重置表单和字段选择
    setSelectedFormId(null);
    form.setFieldsValue({ formId: undefined, fieldId: undefined });

    // 重置查询字段配置和查询条件
    setFieldConfigs([]);
    setCustomFieldConfigs([]);
    setUseCustomFieldConfig(false);
    setFieldSearches([]);
  };

  // 当表单选择改变时更新selectedFormId状态
  const handleFormChange = (value: number) => {
    setSelectedFormId(value);
    // 重置字段选择
    form.setFieldsValue({ fieldId: undefined });
  };


  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={3}>工作成果复盘</Title>

        <Form
          form={form}
          onFinish={handleSearch}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if (changedValues.taskId) {
              handleTaskChange(changedValues.taskId);
            }
            if (changedValues.formId) {
              handleFormChange(changedValues.formId);
            }
          }}
        >
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="deptCodes" label="部门选择">
                <TreeSelect
                  treeData={buildTreeSelectData(deptTree)}
                  value={deptCodes}
                  onChange={handleDeptChange}
                  treeCheckable={true}
                  treeCheckStrictly={true}
                  showCheckedStrategy={TreeSelect.SHOW_ALL}
                  placeholder="请选择部门"
                  style={{ width: "100%" }}
                  multiple={true}
                  maxTagCount="responsive"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item name="taskId" label="任务">
                <TaskTreeSelect
                  style={{ width: "100%" }}
                  placeholder="请选择任务"
                  useNonCycleApi={false}
                  onlyRootNode={false}
                  onlyLeafNode={true}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8} md={6} lg={4}>
              <Form.Item name="formId" label="表单">
                <Select
                  style={{ width: "100%" }}
                  placeholder="请选择表单"
                  disabled={!taskId || forms.length === 0}
                  value={selectedFormId || undefined}
                  onChange={handleFormChange}
                >
                  {forms.map((form) => (
                    <Option key={form.id} value={form.id}>
                      {form.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <div style={{ marginTop: "8px" }}>
                <Checkbox 
                  checked={queryCurrentFormOnly}
                  onChange={(e) => setQueryCurrentFormOnly(e.target.checked)}
                >
                  只查询当前表单
                </Checkbox>
              </div>
            </Col>

            <Col xs={24} sm={8} md={6} lg={4}>
              <Form.Item name="fieldId" label="字段">
                <Select
                  style={{ width: "100%" }}
                  placeholder="请选择字段"
                  disabled={!selectedFormId || formFields.length === 0}
                >
                  {formFields.map((field) => (
                    <Option key={field.fieldKey} value={field.fieldKey}>
                      {field.fieldValue}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={6} lg={12}>
              <Form.Item name="timeRange" label="时间范围">
                <RangePicker
                  showTime={{ format: "HH:mm:ss" }}
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder={["开始时间", "结束时间"]}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={6}>
              <Form.Item label="&nbsp;">
                <Space>
                  <Button.Group>
                    <Button onClick={() => setSaveFilterModalVisible(true)}>
                      保存筛选条件
                    </Button>
                    <Button
                      onClick={() => {
                        loadFilterConditionList();
                        setFilterListModalVisible(true);
                      }}
                    >
                      筛选条件列表
                    </Button>
                  </Button.Group>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* 查询完成记录配置 */}
        <div style={{ marginTop: "24px" }}>
          {/* 查询条件摘要 */}
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <Title level={5}>查询条件</Title>
              <Space>
                <Button
                  type="primary"
                  onClick={() => setFieldConfigModalVisible(true)}
                  size="small"
                >
                  查看字段配置
                </Button>
                <Button
                  type="primary"
                  onClick={() => setFieldSearchModalVisible(true)}
                  size="small"
                >
                  配置查询条件
                </Button>
              </Space>
            </div>

            {fieldSearches.length > 0 ? (
              <div
                style={{
                  padding: "8px",
                  border: "1px solid #e8e8e8",
                  borderRadius: "4px",
                }}
              >
                {fieldSearches.map((search, index) => (
                  <span key={index}>
                    <span style={{ fontWeight: "bold" }}>
                      {search.fieldName}
                    </span>
                    <span style={{ margin: "0 8px" }}>{search.condition}</span>
                    <span>{search.value}</span>
                    {index < fieldSearches.length - 1 && (
                      <span style={{ margin: "0 8px", color: "#999" }}>
                        and
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "8px",
                  textAlign: "center",
                  color: "#999",
                  fontStyle: "italic",
                }}
              >
                暂无查询条件
              </div>
            )}
          </div>

          {/* 查询完成记录按钮 */}
          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <Space>
              <Button type="primary" onClick={handleQueryCompletedRecords}>
                查询完成记录
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button.Group>
                <Button onClick={() => exportData("current")}>
                  导出当前页
                </Button>
                <Button onClick={() => exportData("all")}>导出全部</Button>
              </Button.Group>
            </Space>
          </div>
        </div>

        {/* 字段配置模态框 */}
        <Modal
          title="字段配置"
          open={fieldConfigModalVisible}
          onCancel={() => setFieldConfigModalVisible(false)}
          footer={null}
          width={800}
        >
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <div style={{ marginBottom: "16px" }}>
              <Space style={{ marginBottom: "16px" }}>
                <Button
                  type={useCustomFieldConfig ? "default" : "primary"}
                  onClick={resetToDefaultFieldConfig}
                >
                  使用默认配置
                </Button>
                <Button 
                  type={useCustomFieldConfig ? 'primary' : 'default'} 
                  onClick={() => {
                    setUseCustomFieldConfig(true);
                    // 当切换到自定义配置时，如果自定义配置为空，初始化为默认配置
                    if (customFieldConfigs.length === 0 && formFields.length > 0) {
                      const groupedFields: { [key: string]: FormField[] } = {};
                                      
                      formFields.forEach((field) => {
                        if (!groupedFields[field.fieldValue]) {
                          groupedFields[field.fieldValue] = [];
                        }
                        groupedFields[field.fieldValue].push(field);
                      });
                                      
                      // 构建默认 fieldConfigs 作为自定义配置的初始值
                      const defaultFieldConfigs = Object.entries(groupedFields).map(
                        ([fieldName, fields]) => ({
                          fieldKeys: fields.map((f) => f.fieldKey),
                          fieldName: fieldName,
                          fieldType: 'text' as FieldType, // 默认字段类型为文本
                          id: Date.now() + Math.random(), // 为每个配置项生成唯一ID
                        })
                      );
                                      
                      setCustomFieldConfigs(defaultFieldConfigs);
                    }
                  }}
                >
                  自定义配置
                </Button>
              </Space>

              {useCustomFieldConfig && (
                <Button
                  type="primary"
                  onClick={addCustomFieldConfig}
                  style={{ marginLeft: "16px" }}
                >
                  添加字段配置
                </Button>
              )}
            </div>

            {useCustomFieldConfig ? (
              // 自定义字段配置
              <div>
                {customFieldConfigs.map((config, index) => (
                  <div
                    key={config.id}
                    style={{
                      marginBottom: "16px",
                      padding: "12px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "4px",
                    }}
                  >
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <div style={{ marginBottom: "8px" }}>字段名称</div>
                        <Input
                          value={config.fieldName}
                          onChange={(e) =>
                            updateCustomFieldConfig(
                              config.id,
                              "fieldName",
                              e.target.value
                            )
                          }
                          placeholder="请输入字段名称"
                        />
                      </Col>
                      <Col span={10}>
                        <div style={{ marginBottom: "8px" }}>字段键值</div>
                        <Select
                          mode="tags"
                          style={{ width: "100%" }}
                          value={config.fieldKeys}
                          onChange={(value) =>
                            updateCustomFieldConfig(
                              config.id,
                              "fieldKeys",
                              value
                            )
                          }
                          placeholder="请输入字段键值，多个用逗号分隔"
                          tokenSeparators={[","]}
                        >
                          {formFields.map((field) => (
                            <Select.Option
                              key={field.fieldKey}
                              value={field.fieldKey}
                            >
                              {field.fieldKey} ({field.fieldValue})
                            </Select.Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={4}>
                        <div style={{ marginBottom: "8px" }}>字段类型</div>
                        <Select
                          value={config.fieldType || 'text'}
                          onChange={(value) =>
                            updateCustomFieldConfig(
                              config.id,
                              "fieldType",
                              value
                            )
                          }
                          style={{ width: "100%" }}
                        >
                          <Select.Option value="text">文本</Select.Option>
                          <Select.Option value="jurisdiction">管辖单位</Select.Option>
                          <Select.Option value="jurisdictionAndCommunity">管辖单位和社区</Select.Option>
                        </Select>
                      </Col>
                      <Col span={4}>
                        <div style={{ marginBottom: "8px" }}>&nbsp;</div>
                        <Button
                          danger
                          onClick={() => removeCustomFieldConfig(config.id)}
                          style={{ width: "100%" }}
                        >
                          删除
                        </Button>
                      </Col>
                    </Row>
                  </div>
                ))}

                {customFieldConfigs.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#999",
                      padding: "20px",
                    }}
                  >
                    暂无自定义字段配置，点击"添加字段配置"按钮添加
                  </div>
                )}
              </div>
            ) : (
              // 默认字段配置
              <div>
                <Title level={5}>默认字段配置</Title>
                {fieldConfigs.map((config, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "8px",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  >
                    <div>
                      <strong>字段名称:</strong> {config.fieldName}
                    </div>
                    <div>
                      <strong>字段键值:</strong> {config.fieldKeys.join(", ")}
                    </div>
                  </div>
                ))}

                {fieldConfigs.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#999",
                      padding: "20px",
                    }}
                  >
                    暂无字段配置，请先选择表单
                  </div>
                )}
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Space>
                <Button onClick={() => setFieldConfigModalVisible(false)}>
                  取消
                </Button>
                <Button onClick={resetToDefaultFieldConfig}>重置</Button>
                <Button type="primary" onClick={applyCustomFieldConfig}>
                  应用配置
                </Button>
              </Space>
            </div>
          </div>
        </Modal>

        {/* 查询条件配置模态框 */}
        <Modal
          title="查询条件配置"
          open={fieldSearchModalVisible}
          onCancel={() => setFieldSearchModalVisible(false)}
          footer={null}
          width={900}
        >
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <div style={{ marginBottom: "16px" }}>
              <Button type="primary" onClick={addFieldSearch}>
                添加查询条件
              </Button>
            </div>

            <div>
              {fieldSearches.map((search, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "8px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "flex-end",
                  }}
                >
                  <div style={{ flex: 3 }}>
                    <div
                      style={{
                        marginBottom: "4px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      字段
                    </div>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="选择字段"
                      value={search.fieldName}
                      onChange={(value) =>
                        updateFieldSearch(index, "fieldName", value)
                      }
                      options={formFields.map((field) => ({
                        label: field.fieldValue,
                        value: field.fieldKey,
                      }))}
                    />
                  </div>
                  <div style={{ flex: 2 }}>
                    <div
                      style={{
                        marginBottom: "4px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      条件
                    </div>
                    <Select
                      style={{ width: "100%" }}
                      value={search.condition}
                      onChange={(value) =>
                        updateFieldSearch(index, "condition", value)
                      }
                      options={[
                        { label: "=", value: "=" },
                        { label: "!=", value: "!=" },
                        { label: ">", value: ">" },
                        { label: ">=", value: ">=" },
                        { label: "<", value: "<" },
                        { label: "<=", value: "<=" },
                        { label: "包含", value: "like" },
                        { label: "不包含", value: "not like" },
                        { label: "在列表中", value: "in" },
                        { label: "是空的", value: "isEmpty" },
                        { label: "是null", value: "isNull" },
                        { label: "是空的或者是null", value: "isEmptyOrNull" },
                      ]}
                    />
                  </div>
                  <div style={{ flex: 3 }}>
                    <div
                      style={{
                        marginBottom: "4px",
                        fontSize: "12px",
                        color: "#666",
                      }}
                    >
                      值
                    </div>
                    {
                      // 获取当前选择字段的options
                      (() => {
                        // 检查是否为空值条件
                        const isEmptyCondition = ['isEmpty', 'isNull', 'isEmptyOrNull'].includes(search.condition);
                        const currentField = formFields.find(field => field.fieldKey === search.fieldName);
                        const isInCondition = search.condition === 'in';
                                            
                        if (isEmptyCondition) {
                          // 如果是空值条件，显示提示信息
                          return (
                            <div style={{ padding: '6px 11px', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#888' }}>
                              此条件无需输入值
                            </div>
                          );
                        }
                                            
                        // 检查当前字段是否有options
                        const hasOptions = currentField && Array.isArray(currentField.options) && currentField.options.length > 0;
                                            
                        if (hasOptions) {
                          // 如果字段有options，根据条件类型决定显示方式
                          if (isInCondition) {
                            // "在列表中"条件使用多选下拉框
                            const valueArray = search.value ? search.value.split(',') : [];
                            return (
                              <Select
                                mode="multiple" // 多选模式
                                style={{ width: '100%' }}
                                placeholder="请选择值，支持多选"
                                value={valueArray}
                                onChange={(value) => {
                                  // 将数组转换为逗号分隔的字符串
                                  const processedValue = value ? value.join(',') : '';
                                  updateFieldSearch(index, 'value', processedValue);
                                }}
                                options={currentField.options.map(option => ({
                                  label: option,
                                  value: option
                                }))}
                                showSearch
                                allowClear
                                optionFilterProp="children"
                              />
                            );
                          } else {
                            // 其他条件使用单选下拉框
                            return (
                              <Select
                                style={{ width: '100%' }}
                                placeholder="请选择值"
                                value={search.value}
                                onChange={(value) => updateFieldSearch(index, 'value', value)}
                                options={currentField.options.map(option => ({
                                  label: option,
                                  value: option
                                }))}
                                showSearch
                                allowClear
                                optionFilterProp="children"
                              />
                            );
                          }
                        } else {
                          // 如果字段没有options，根据条件类型决定输入方式
                          if (isInCondition) {
                            // "在列表中"条件允许输入多个值，用逗号分隔
                            return (
                              <Input
                                style={{ width: "100%" }}
                                placeholder="请输入多个值，用逗号分隔"
                                value={search.value}
                                onChange={(e) =>
                                  updateFieldSearch(index, "value", e.target.value)
                                }
                              />
                            );
                          } else {
                            // 其他条件只允许输入单个值
                            return (
                              <Input
                                style={{ width: "100%" }}
                                placeholder="输入值"
                                value={search.value}
                                onChange={(e) =>
                                  updateFieldSearch(index, "value", e.target.value)
                                }
                              />
                            );
                          }
                        }
                      })()
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <Button
                      danger
                      onClick={() => removeFieldSearch(index)}
                      style={{ width: "100%" }}
                    >
                      删除
                    </Button>
                  </div>
                </div>
              ))}

              {fieldSearches.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#999",
                    padding: "20px",
                  }}
                >
                  暂无查询条件，点击"添加查询条件"按钮添加
                </div>
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <Space>
                <Button onClick={() => setFieldSearchModalVisible(false)}>
                  取消
                </Button>
                <Button
                  onClick={() => {
                    setFieldSearches([]);
                  }}
                >
                  清空条件
                </Button>
                <Button type="primary" onClick={applyFieldSearches}>
                  应用条件
                </Button>
              </Space>
            </div>
          </div>
        </Modal>

        <Spin spinning={loading}>
          <Table
            dataSource={data}
            columns={dynamicColumns}
            rowKey="id"
            pagination={false}
            style={{ marginTop: "24px" }}
            scroll={{ x: "max-content" }}
          />

          {pagination.total > 0 && (
            <div style={{ textAlign: "right", marginTop: "16px" }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 条记录`}
                size="small"
              />
            </div>
          )}
        </Spin>
      </Card>
      {/* 保存筛选条件模态框 */}
      <Modal
        title={isEditingFilter ? "编辑筛选条件" : "保存筛选条件"}
        open={saveFilterModalVisible}
        onCancel={() => {
          setSaveFilterModalVisible(false);
          setIsEditingFilter(false);
          setEditingFilterId(null);
          saveFilterForm.resetFields();
        }}
        onOk={saveCurrentFilter}
        width={500}
      >
        <Form form={saveFilterForm} layout="vertical">
          <Form.Item
            name="remark"
            label="备注"
            rules={[{ required: true, message: "请输入备注" }]}
          >
            <Input.TextArea placeholder="请输入备注信息" rows={3} />
          </Form.Item>
          <Form.Item
            name="saveAsView"
            label="保存为视图"
            valuePropName="checked"
          >
            <Checkbox>保存为视图，方便后续快速查询</Checkbox>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.saveAsView !== currentValues.saveAsView
            }
          >
            {({ getFieldValue }) => {
              if (getFieldValue("saveAsView")) {
                return (
                  <Form.Item
                    name="viewName"
                    label="视图名称"
                    rules={[{ required: true, message: "请输入视图名称" }]}
                  >
                    <Input placeholder="请输入视图名称" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
        </Form>
      </Modal>

      {/* 筛选条件列表模态框 */}
      <Modal
        title="筛选条件列表"
        open={filterListModalVisible}
        onCancel={() => setFilterListModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {filterConditionList.length > 0 ? (
            <List
              dataSource={filterConditionList}
              renderItem={(item, index) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      onClick={() => applyFilterCondition(item)}
                    >
                      应用
                    </Button>,
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        // 准备编辑数据
                        saveFilterForm.setFieldsValue({
                          remark: item.remark,
                          saveAsView: !!item.viewName,
                          viewName: item.viewName,
                        });
                        // 设置为编辑模式
                        setIsEditingFilter(true);
                        setEditingFilterId(item.id);
                        setSaveFilterModalVisible(true);
                      }}
                    >
                      编辑
                    </Button>,
                    <Button
                      type="link"
                      size="small"
                      danger
                      onClick={() => {
                        Modal.confirm({
                          title: "确认删除",
                          content: `确定要删除筛选条件 "${item.viewName}" 吗？`,
                          onOk: () => deleteFilterCondition(item.id, index),
                          okText: "确定",
                          cancelText: "取消",
                        });
                      }}
                    >
                      删除
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div>
                        <div style={{ fontWeight: "bold" }}>
                          {item.viewName}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#999",
                            marginTop: "4px",
                          }}
                        >
                          {item.remark}
                        </div>
                      </div>
                    }
                    description={
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        <div>
                          创建时间:{" "}
                          {dayjs(item.whenCreated).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )}
                        </div>
                        <div>
                          修改时间:{" "}
                          {dayjs(item.whenModified).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#999" }}
            >
              暂无保存的筛选条件
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default WorkLogPage;

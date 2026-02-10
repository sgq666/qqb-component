import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
  DatePicker,
} from "antd";
import moment from "moment";
import TaskTreeSelect from "../../components/TaskTreeSelect";
import thirdservice from "../../services/thirdService";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Column } = Table;

// 警员类型映射
const POLICE_TYPE_MAP: Record<number, string> = {
  0: "0-警号（逗号分隔）（分号分隔一组）",
  1: "1-用户id（逗号分隔）",
  2: "2-张三,警号;李四,警号;",
  3: '3-"policeName":"姓名,警号"（取警号）',
  4: "4-身份证（逗号分隔）（分号分隔一组）加了个转换大写字母",
  5: "5-人员选择组件，用户id",
  6: "6-身份证取警号",
  7: "7-特殊转换",
};

interface TaskDisRecord {
  taskId: number;
  taskName: string;
  nextTaskId: number;
  objName: string;
  objField: string;
  objFieldName: string;
  deptField: string;
  deptFieldName: string;
  type: number;
  policeType: number;
  isDisPolice: string;
  incrementTime: string | number | Date; // 调度增长时间
  times: number; // 调度次数
  id: number;
  createTime: string;
  updateTime: string;
}

const TaskDisPage: React.FC = () => {
  const [data, setData] = useState<TaskDisRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<TaskDisRecord | null>(
    null
  );
  const [form] = Form.useForm();
  const [fieldOptions, setFieldOptions] = useState<any[]>([]);

  // 获取数据函数
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await thirdservice.getTaskDisConfigList();
      if (response.code === 200) {
        setData(response.data || []);
        setPagination({
          current: 1,
          pageSize: 10,
          total: (response.data || []).length,
        });
      } else {
        message.error(response.message || "获取数据失败");
        setData([]);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
      message.error("获取数据失败");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchData();
  }, []);

  // 分页变化处理
  const handleTableChange = (pagination: any) => {
    // 使用any类型避免复杂的TablePaginationConfig类型问题
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize || 10,
    });
  };

  // 获取对象信息
  const fetchObjectInfo = async (taskId: string | number) => {
    try {
      const response = await thirdservice.getObjectByTaskId({ id: taskId });

      if (response.code === 200) {
        form.setFieldsValue({
          nextTaskId: response.data.id,
          objName: response.data.objName,
        });

        // 获取字段信息
        fetchFieldInfo(response.data.id);
      } else {
        message.error(response.message || "获取对象信息失败");
      }
    } catch (error) {
      console.error("获取对象信息失败:", error);
      message.error("获取对象信息失败");
    }
  };

  // 获取字段信息
  const fetchFieldInfo = async (objId: string | number) => {
    try {
      const response = await thirdservice.getFieldsByObjId({ id: objId });

      if (response.code === 200) {
        setFieldOptions(response.data || []);
      } else {
        message.error(response.message || "获取字段信息失败");
        setFieldOptions([]);
      }
    } catch (error) {
      console.error("获取字段信息失败:", error);
      message.error("获取字段信息失败");
      setFieldOptions([]);
    }
  };

  // 任务选择变化处理
  const handleTaskChange = (
    value: string | number | (string | number)[],
    labelList: React.ReactNode[],
    extra: any
  ) => {
    if (value && !Array.isArray(value)) {
      fetchObjectInfo(value);
      // 设置任务名称，从labelList获取任务的显示名称
      if (labelList && labelList.length > 0) {
        form.setFieldsValue({
          taskName: labelList[0]?.toString() || `任务 ${value}`,
        });
      } else {
        form.setFieldsValue({
          taskName: `任务 ${value}`,
        });
      }
    } else {
      // 清空对象信息和字段选项
      form.setFieldsValue({
        nextTaskId: undefined,
        objName: undefined,
        taskName: undefined,
      });
      setFieldOptions([]);
    }
  };

  // 新增/编辑提交
  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        try {
          // 获取当前选中的对象字段和部门字段的选项信息
          const selectedObjFieldName = form.getFieldValue("objFieldName"); // 这是name，即label
          const selectedDeptField = form.getFieldValue("deptField"); // 这是tableFieldName，即value

          // 从fieldOptions中找到对应的选项，以获取name和tableFieldName
          const objFieldOption = fieldOptions.find(
            (option) => option.name === selectedObjFieldName
          );
          const deptFieldOption = fieldOptions.find(
            (option) => option.tableFieldName === selectedDeptField
          );

          // 处理时间字段格式化
          let formattedIncrementTime = values.incrementTime;
          if (values.incrementTime && moment.isMoment(values.incrementTime)) {
            // 如果是moment对象，格式化为指定字符串格式
            formattedIncrementTime = values.incrementTime.format(
              "YYYY-MM-DD HH:mm:ss"
            );
          } else if (values.incrementTime instanceof Date) {
            // 如果是Date对象，转换为moment后再格式化
            formattedIncrementTime = moment(values.incrementTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
          } else if (
            typeof values.incrementTime === "string" &&
            values.incrementTime
          ) {
            // 如果是字符串，尝试解析
            formattedIncrementTime = moment(values.incrementTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
          } else if (!values.incrementTime) {
            // 如果是null或undefined，设为空字符串或null
            formattedIncrementTime = "";
          }

          // 整合完整数据
          const completeValues = {
            ...values,
            incrementTime: formattedIncrementTime,
            taskName:
              form.getFieldValue("taskName") ||
              `任务 ${form.getFieldValue("taskId") || ""}`,
            objField: objFieldOption ? objFieldOption.tableFieldName : "", // objField是value(tableFieldName)
            objFieldName: selectedObjFieldName || "", // objFieldName是label(name)
            deptField: selectedDeptField || "", // deptField是value(tableFieldName)
            deptFieldName: deptFieldOption ? deptFieldOption.name : "", // deptFieldName是label(name)
          };

          let response;
          if (editingRecord) {
            // 编辑模式 - 添加id字段
            response = await thirdservice.updateTaskDisConfig({
              ...completeValues,
              id: editingRecord.id,
            });
          } else {
            // 新增模式
            response = await thirdservice.saveTaskDisConfig(completeValues);
          }

          if (response.code === 200) {
            message.success(editingRecord ? "更新成功" : "新增成功");

            // 关闭模态框并重置表单
            setModalVisible(false);
            setEditingRecord(null);
            // 直接设置表单字段为空值，替代 form.resetFields()
            form.setFieldsValue({
              taskId: null,
              nextTaskId: null,
              objName: null,
              objFieldName: null,
              deptField: null,
              deptFieldName: null,
              objField: null,
              taskName: null,
              type: null,
              policeType: null,
              incrementTime: null,
              isDisPolice: null,
            });

            // 重新获取数据
            fetchData();
          } else {
            message.error(
              response.message || (editingRecord ? "更新失败" : "新增失败")
            );
          }
        } catch (error) {
          console.error("保存失败:", error);
          message.error(editingRecord ? "更新失败" : "新增失败");
        }
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  // 编辑记录
  const handleEdit = (record: TaskDisRecord) => {
    setEditingRecord(record);
    // 设置表单初始值，确保字段名与表单中定义的一致
    // 将时间值转换为moment对象
    // const incrementTimeMoment = record.incrementTime ? moment(record.incrementTime) : null;

    form.setFieldsValue({
      taskId: record.taskId,
      nextTaskId: record.nextTaskId,
      objName: record.objName,
      objFieldName: record.objFieldName,
      deptField: record.deptField,
      deptFieldName: record.deptFieldName,
      objField: record.objField,
      taskName: record.taskName,
      type: record.type,
      policeType: record.policeType,
      incrementTime: record.incrementTime
        ? typeof record.incrementTime === "string" ||
          typeof record.incrementTime === "number"
          ? moment(record.incrementTime)
          : moment(new Date(record.incrementTime))
        : null,
      isDisPolice: record.isDisPolice,
    });

    // 如果存在对象ID，则获取字段信息
    if (record.nextTaskId) {
      fetchFieldInfo(record.nextTaskId);
    }

    setModalVisible(true);
  };

  // 删除记录
  const handleDelete = async (id: number) => {
    try {
      const response = await thirdservice.deleteTaskDisConfigById(id);
      if (response.code === 200) {
        message.success("删除成功");
        // 重新获取数据
        fetchData();
      } else {
        message.error(response.message || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      message.error("删除失败");
    }
  };

  // 打开新增模态框
  const handleAdd = () => {
    setEditingRecord(null);
    // 直接设置表单字段为空值，替代 form.resetFields()
    form.setFieldsValue({
      taskId: null,
      nextTaskId: null,
      objName: null,
      objFieldName: null,
      deptField: null,
      deptFieldName: null,
      objField: null,
      taskName: null,
      type: null,
      policeType: null,
      incrementTime: null,
      isDisPolice: null,
    });
    setModalVisible(true);
  };

  // 取消模态框
  const handleCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
    // 直接设置表单字段为空值，替代 form.resetFields()
    form.setFieldsValue({
      taskId: null,
      nextTaskId: null,
      objName: null,
      objFieldName: null,
      deptField: null,
      deptFieldName: null,
      objField: null,
      taskName: null,
      type: null,
      policeType: null,
      incrementTime: null,
      isDisPolice: null,
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="自动调度管理"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1750 }} // 设置水平滚动，最小宽度1750px
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
        >
          <Column title="ID" dataIndex="id" key="id" width={60} />
          <Column title="任务ID" dataIndex="taskId" key="taskId" width={80} />
          <Column
            title="任务名称"
            dataIndex="taskName"
            key="taskName"
            width={120}
          />
          <Column
            title="对象ID"
            dataIndex="nextTaskId"
            key="nextTaskId"
            width={80}
          />
          <Column
            title="对象名称"
            dataIndex="objName"
            key="objName"
            width={120}
          />
          <Column
            title="对象字段"
            dataIndex="objFieldName"
            key="objFieldName"
            width={120}
          />
          <Column
            title="部门字段"
            dataIndex="deptField"
            key="deptField"
            width={120}
          />
          <Column
            title="部门字段名"
            dataIndex="deptFieldName"
            key="deptFieldName"
            width={120}
          />
          <Column
            title="类型"
            dataIndex="type"
            key="type"
            width={80}
            render={(text) =>
              text === 3 ? "群下发" : text === 4 ? "层级下发" : "未知类型"
            }
          />
          <Column
            title="警员类型"
            dataIndex="policeType"
            key="policeType"
            width={180}
            render={(text) => POLICE_TYPE_MAP[text] || text}
          />
          <Column
            title="增长时间"
            dataIndex="incrementTime"
            key="incrementTime"
            width={200}
            render={(text) =>
              text
                ? typeof text === "string" || typeof text === "number"
                  ? moment(text).format("YYYY-MM-DD HH:mm:ss")
                  : moment(new Date(text)).format("YYYY-MM-DD HH:mm:ss")
                : ""
            }
          />
          <Column title="调度次数" dataIndex="times" key="times" width={100} />
          <Column
            title="isDisPolice"
            dataIndex="isDisPolice"
            key="isDisPolice"
            width={120}
          />
          <Column
            title="创建时间"
            dataIndex="whenCreated"
            key="createTime"
            width={150}
          />
          <Column
            title="更新时间"
            dataIndex="whenModified"
            key="updateTime"
            width={150}
          />
          <Column
            title="操作"
            key="actions"
            width={200}
            fixed="right" // 固定操作列在右侧
            render={(text, record: TaskDisRecord) => (
              <Space size="middle">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                >
                  编辑
                </Button>
                <Popconfirm
                  title="确认删除该记录？"
                  onConfirm={() => handleDelete(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            )}
          />
        </Table>
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? "编辑自动调度" : "新增自动调度"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        destroyOnClose
        width={800}
      >
        <Form form={form} layout="vertical" initialValues={editingRecord || {}}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="taskId"
                label="任务"
                rules={[{ required: true, message: "请选择任务" }]}
              >
                <TaskTreeSelect
                  style={{ width: "100%" }}
                  placeholder="请选择任务"
                  useNonCycleApi={true}
                  onlyRootNode={false}
                  onlyLeafNode={true}
                  onChange={(value, labelList, extra) =>
                    handleTaskChange(value, labelList, extra)
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="objName" label="对象名称">
                <Input placeholder="请选择任务以获取对象信息" readOnly />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="objFieldName"
                label="对象字段"
                rules={[{ required: true, message: "请选择对象字段" }]}
              >
                <Select
                  placeholder="请选择对象字段"
                  disabled={fieldOptions.length === 0}
                >
                  {fieldOptions.map((field, index) => (
                    <Select.Option key={index} value={field.tableFieldName}>
                      {field.name} ({field.tableFieldName})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="deptField" label="部门字段">
                <Select
                  placeholder="请选择部门字段"
                  disabled={fieldOptions.length === 0}
                >
                  {fieldOptions.map((field, index) => (
                    <Select.Option key={index} value={field.tableFieldName}>
                      {field.name} ({field.tableFieldName})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="type"
                label="类型"
                rules={[{ required: true, message: "请选择类型" }]}
              >
                <Select placeholder="请选择类型">
                  <Select.Option value={3}>群下发（3）</Select.Option>
                  <Select.Option value={4}>层级下发（4）</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="policeType"
                label="警员类型"
                rules={[{ required: true, message: "请选择警员类型" }]}
              >
                <Select placeholder="请选择警员类型">
                  {Object.entries(POLICE_TYPE_MAP).map(([key, value]) => (
                    <Select.Option key={key} value={Number(key)}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isDisPolice" label="isDisPolice">
                <Input placeholder="请输入isDisPolice" />
              </Form.Item>
            </Col>
            {editingRecord && (
              <Col span={8}>
                <Form.Item
                  name="incrementTime"
                  label="增长时间"
                  rules={
                    editingRecord
                      ? [{ required: true, message: "请选择增长时间" }]
                      : []
                  }
                >
                  <DatePicker
                    placeholder="请选择增长时间"
                    format="YYYY-MM-DD HH:mm:ss"
                    showTime={{ format: "HH:mm:ss" }}
                    style={{ width: "100%" }}
                    value={
                      editingRecord?.incrementTime
                        ? typeof editingRecord.incrementTime === "string" ||
                          typeof editingRecord.incrementTime === "number"
                          ? moment(editingRecord.incrementTime)
                          : moment(new Date(editingRecord.incrementTime))
                        : null
                    }
                    onChange={(date) =>
                      form.setFieldsValue({ incrementTime: date })
                    }
                  />
                </Form.Item>
              </Col>
            )}
          </Row>

          {/* 隐藏字段 */}
          <Form.Item name="nextTaskId" noStyle>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="deptFieldName" noStyle>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="objField" noStyle>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="taskName" noStyle>
            <Input type="hidden" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskDisPage;

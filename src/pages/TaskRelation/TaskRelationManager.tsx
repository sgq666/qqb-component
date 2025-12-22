import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Table,
  Button,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Spin,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TaskTreeSelect } from '../../components';
import thirdservice, { TaskRelation, TaskModel } from '../../services/thirdService';

const { Title } = Typography;

const TaskRelationManager: React.FC = () => {
  const [relations, setRelations] = useState<TaskRelation[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRelation, setEditingRelation] = useState<TaskRelation | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [filterTaskId, setFilterTaskId] = useState<string | number | undefined>(undefined);

  // 获取任务关联关系数据
  const fetchRelations = async (taskId?: string | number) => {
    setLoading(true);
    try {
      console.log('获取任务关联关系，参数:', taskId);
      const response = await thirdservice.getTaskRelations(taskId);
      console.log('获取任务关联关系响应:', response);
      if (response.code === 200) {
        setRelations(response.data || []);
      } else {
        message.error(response.message || '获取任务关联关系失败');
      }
    } catch (error) {
      message.error('获取任务关联关系失败');
      console.error('获取任务关联关系失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 编辑任务关联关系
  const handleEdit = (record: TaskRelation) => {
    setEditingRelation(record);
    // 转换taskModels数据格式以适配Select组件
    const relatedTaskIds = record.taskModels.map(model => model.id);
    form.setFieldsValue({
      taskId: record.taskId,
      relatedTaskIds: relatedTaskIds,
    });
    setIsModalVisible(true);
  };

  // 删除任务关联关系
  const handleDelete = async (taskId: string) => {
    try {
      const response = await thirdservice.deleteTaskRelation(taskId);
      if (response.code === 200) {
        message.success('删除成功');
        fetchRelations(filterTaskId); // 重新加载数据，保持筛选状态
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error) {
      message.error('删除失败');
      console.error('删除失败:', error);
    }
  };

  // 保存任务关联关系
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存表单数据:', values);
      
      // 转换relatedTaskIds为taskModels格式
      const taskModels = values.relatedTaskIds.map((id: string) => ({
        id: id,
        name: `任务-${id}` // 这里可以替换为实际的任务名称
      }));
      
      // 构造关联关系数据
      const relationData = {
        taskId: values.taskId.toString(),
        taskModels: taskModels
      };
      
      if (editingRelation) {
        // 更新操作
        const response = await thirdservice.updateTaskRelation(relationData);
        if (response.code === 200) {
          message.success('更新成功');
          fetchRelations(filterTaskId); // 重新加载数据，保持筛选状态
        } else {
          message.error(response.message || '更新失败');
          return;
        }
      } else {
        // 新增操作
        const response = await thirdservice.addTaskRelation(relationData);
        if (response.code === 200) {
          message.success('添加成功');
          fetchRelations(filterTaskId); // 重新加载数据，保持筛选状态
        } else {
          message.error(response.message || '添加失败');
          return;
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请检查输入内容');
    }
  };

  // 取消操作
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingRelation(null);
  };

  // 处理筛选任务ID变化
  const handleFilterTaskIdChange = (value: string | number) => {
    console.log('任务筛选值变化:', value);
    setFilterTaskId(value);
    fetchRelations(value);
  };

  // 表格列定义
  const columns = [
    {
      title: '任务ID',
      dataIndex: 'taskId',
      key: 'taskId',
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '关联任务',
      dataIndex: 'taskModels',
      key: 'taskModels',
      render: (taskModels: TaskModel[]) => (
        <Space direction="vertical">
          {taskModels.map(model => (
            <div key={model.id}>{model.name} ({model.id})</div>
          ))}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TaskRelation) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个关联关系吗？"
            onConfirm={() => handleDelete(record.taskId)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 组件挂载时获取数据
  useEffect(() => {
    fetchRelations();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>任务关联关系管理</Title>
        
        <Row justify="space-between" style={{ marginBottom: 16 }} gutter={[16, 16]}>
          <Col>
            <TaskTreeSelect 
              onlyRootNode={false} 
              useNonCycleApi={true}
              onChange={handleFilterTaskIdChange}
              style={{ width: '300px' }}
              placeholder="选择任务进行筛选"
              allowClear
            />
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEditingRelation(null);
                form.resetFields();
                setIsModalVisible(true);
              }}
            >
              新增关联关系
            </Button>
          </Col>
        </Row>
        
        <Spin spinning={loading}>
          <Table
            dataSource={relations}
            columns={columns}
            rowKey="taskId"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>
      
      <Modal
        title={editingRelation ? "编辑任务关联关系" : "新增任务关联关系"}
        visible={isModalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="taskId"
            label="主任务选择"
            rules={[{ required: true, message: '请选择主任务!' }]}
          >
            <TaskTreeSelect 
              onlyRootNode={false} 
              useNonCycleApi={true}
              style={{ width: '100%' }}
              placeholder="请选择主任务"
              disabled={!!editingRelation} // 编辑时禁用任务选择
            />
          </Form.Item>
          
          <Form.Item
            name="relatedTaskIds"
            label="关联任务"
            rules={[{ required: true, message: '请至少选择一个关联任务!' }]}
          >
            <TaskTreeSelect
              onlyRootNode={false}
              useNonCycleApi={true}
              style={{ width: '100%' }}
              placeholder="请选择要关联的任务"
              treeCheckable={true}
              showCheckedStrategy={'SHOW_CHILD'}
              treeDefaultExpandAll={true}
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskRelationManager;
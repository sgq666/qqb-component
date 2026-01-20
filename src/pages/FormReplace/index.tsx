import React, { useState, useEffect } from 'react';
import { Card, Form, Select, Button, message, Space, Row, Col, Typography, Table, Alert, Modal } from 'antd';
import thirdservice from '../../services/thirdService';

const { Title } = Typography;
const { Option } = Select;

interface FormItem {
  id: number;
  name: string;
}

interface FormField {
  fieldKey: string;
  fieldValue: string;
  fieldType: string;
  options: string[];
}

const FormReplacePage: React.FC = () => {
  const [oldForms, setOldForms] = useState<FormItem[]>([]);
  const [newForms, setNewForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOldForm, setSelectedOldForm] = useState<number | null>(null);
  const [selectedNewForm, setSelectedNewForm] = useState<number | null>(null);
  
  // 表单详情相关状态
  const [oldFormDetails, setOldFormDetails] = useState<FormField[]>([]);
  const [newFormDetails, setNewFormDetails] = useState<FormField[]>([]);
  const [formDetailsLoading, setFormDetailsLoading] = useState(false);
  
  // 对比结果相关状态
  const [showComparison, setShowComparison] = useState(false);
  


  // 获取表单列表
  const fetchForms = async () => {
    setLoading(true);
    try {
      const response = await thirdservice.getFormList();
      if (response.code === 200) {
        setOldForms(response.data || []);
        setNewForms(response.data || []);
      } else {
        message.error(response.message || '获取表单列表失败');
      }
    } catch (error) {
      console.error('获取表单列表失败:', error);
      message.error('获取表单列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取表单详情
  const fetchFormDetails = async (formId: number, type: 'old' | 'new') => {
    if (!formId) return;
    
    setFormDetailsLoading(true);
    try {
      const response = await thirdservice.getFormDetail(formId);
      if (response.code === 200) {
        if (type === 'old') {
          setOldFormDetails(response.data || []);
        } else {
          setNewFormDetails(response.data || []);
        }
      } else {
        message.error(response.message || `获取${type === 'old' ? '旧' : '新'}表单详情失败`);
      }
    } catch (error) {
      console.error(`获取${type === 'old' ? '旧' : '新'}表单详情失败:`, error);
      message.error(`获取${type === 'old' ? '旧' : '新'}表单详情失败`);
    } finally {
      setFormDetailsLoading(false);
    }
  };
  
  // 当旧表单选择改变时
  const handleOldFormChange = (value: number) => {
    setSelectedOldForm(value);
    // 重置旧表单详情
    setOldFormDetails([]);
    // 获取旧表单详情
    fetchFormDetails(value, 'old');
    // 不再需要检查是否需要提示交换
    setShowComparison(false);
  };
  
  // 当新表单选择改变时
  const handleNewFormChange = (value: number) => {
    setSelectedNewForm(value);
    // 重置新表单详情
    setNewFormDetails([]);
    // 获取新表单详情
    fetchFormDetails(value, 'new');
    // 不再需要检查是否需要提示交换
    setShowComparison(false);
  };

  useEffect(() => {
    fetchForms();
    
    // 清理函数
    return () => {
      // 如果有需要清理的资源，可以在这里处理
    };
  }, []);

  // 处理表单替换
  const handleFormReplace = async () => {
    if (!selectedOldForm || !selectedNewForm) {
      message.error('请先选择旧表单和新表单');
      return;
    }

    if (selectedOldForm === selectedNewForm) {
      message.error('旧表单和新表单不能相同');
      return;
    }
    
    // 检查是否旧表单ID大于新表单ID，如果是则提示用户
    if (selectedOldForm > selectedNewForm) {
      Modal.confirm({
        title: '确认替换',
        content: `旧表单ID (${selectedOldForm}) 大于新表单ID (${selectedNewForm})，确定要继续替换吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          try {
            const response = await thirdservice.replaceForm({
              oldActionId: selectedOldForm,
              newActionId: selectedNewForm,
            });
            
            if (response.code === 200) {
              message.success(`表单替换成功：将表单ID ${selectedOldForm} 替换为表单ID ${selectedNewForm}`);
              // 重置选择
              setSelectedOldForm(null);
              setSelectedNewForm(null);
              setOldFormDetails([]);
              setNewFormDetails([]);
              setShowComparison(false);
            } else {
              message.error(response.message || '表单替换失败');
            }
          } catch (error) {
            console.error('表单替换失败:', error);
            message.error('表单替换失败');
          }
        },
      });
    } else {
      // 如果旧表单ID不大于新表单ID，直接执行替换
      try {
        const response = await thirdservice.replaceForm({
          oldActionId: selectedOldForm,
          newActionId: selectedNewForm,
        });
        
        if (response.code === 200) {
          message.success(`表单替换成功：将表单ID ${selectedOldForm} 替换为表单ID ${selectedNewForm}`);
          // 重置选择
          setSelectedOldForm(null);
          setSelectedNewForm(null);
          setOldFormDetails([]);
          setNewFormDetails([]);
          setShowComparison(false);
        } else {
          message.error(response.message || '表单替换失败');
        }
      } catch (error) {
        console.error('表单替换失败:', error);
        message.error('表单替换失败');
      }
    }
  };

  // 重置选择
  const handleReset = () => {
    setSelectedOldForm(null);
    setSelectedNewForm(null);
    setOldFormDetails([]);
    setNewFormDetails([]);
    setShowComparison(false);
  };
  
  // 交换新旧表单
  const handleSwapForms = () => {
    const tempOldForm = selectedOldForm;
    const tempOldDetails = oldFormDetails;
    
    setSelectedOldForm(selectedNewForm);
    setOldFormDetails(newFormDetails);
    setSelectedNewForm(tempOldForm);
    setNewFormDetails(tempOldDetails);
    
    setShowComparison(false);
  };
  
  // 对比表单字段
  const compareFormFields = () => {
    if (!selectedOldForm || !selectedNewForm) {
      message.error('请先选择旧表单和新表单');
      return;
    }
    
    // 如果还没有获取表单详情，先获取
    if (oldFormDetails.length === 0) {
      fetchFormDetails(selectedOldForm, 'old');
    }
    if (newFormDetails.length === 0) {
      fetchFormDetails(selectedNewForm, 'new');
    }
    
    setShowComparison(true);
  };
  
  // 生成对比表格数据
  const getComparisonData = () => {
    const allFieldKeys = new Set<string>();
    
    // 收集所有字段键
    oldFormDetails.forEach(field => allFieldKeys.add(field.fieldKey));
    newFormDetails.forEach(field => allFieldKeys.add(field.fieldKey));
    
    const comparisonData = Array.from(allFieldKeys).map(key => {
      const oldField = oldFormDetails.find(f => f.fieldKey === key);
      const newField = newFormDetails.find(f => f.fieldKey === key);
      
      return {
        key,
        fieldKey: key,
        oldFieldValue: oldField ? oldField.fieldValue : '',
        newFieldValue: newField ? newField.fieldValue : '',
        isDifferent: oldField && newField ? 
          (oldField.fieldKey !== newField.fieldKey || 
           oldField.fieldValue !== newField.fieldValue) : 
          (oldField !== undefined) !== (newField !== undefined),
      };
    });
    
    return comparisonData;
  };
  
  // 对比表格列定义
  const comparisonColumns = [
    {
      title: '字段键',
      dataIndex: 'fieldKey',
      key: 'fieldKey',
      width: 150,
      render: (text: string, record: any) => {
        return record.isDifferent ? <span style={{ color: 'red' }}>{text}</span> : text;
      },
    },
    {
      title: '旧表单字段名',
      dataIndex: 'oldFieldValue',
      key: 'oldFieldValue',
      width: 150,
      render: (text: string, record: any) => {
        return record.isDifferent ? <span style={{ color: 'red' }}>{text}</span> : text;
      },
    },
    {
      title: '新表单字段名',
      dataIndex: 'newFieldValue',
      key: 'newFieldValue',
      width: 150,
      render: (text: string, record: any) => {
        return record.isDifferent ? <span style={{ color: 'red' }}>{text}</span> : text;
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3} style={{ marginBottom: '24px' }}>
          表单替换与对比
        </Title>
        
        <Form layout="vertical">
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="旧表单" required>
                <Select
                  showSearch
                  placeholder="请选择旧表单"
                  optionFilterProp="children"
                  value={selectedOldForm || undefined}
                  onChange={handleOldFormChange}
                  loading={loading}
                  filterOption={(input, option) => {
                    const childrenText = (option?.children as React.ReactNode)?.toString()?.toLowerCase();
                    const inputValue = input.toLowerCase();
                    // 检查表单名称是否匹配
                    const nameMatch = childrenText?.includes(inputValue);
                    // 检查表单ID是否精确匹配
                    const idMatch = option?.value?.toString() === input;
                    return nameMatch || idMatch;
                  }}
                >
                  {oldForms.map((form) => (
                    <Option key={form.id} value={form.id}>
                      {form.name} (ID: {form.id})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="新表单" required>
                <Select
                  showSearch
                  placeholder="请选择新表单"
                  optionFilterProp="children"
                  value={selectedNewForm || undefined}
                  onChange={handleNewFormChange}
                  loading={loading}
                  filterOption={(input, option) => {
                    const childrenText = (option?.children as React.ReactNode)?.toString()?.toLowerCase();
                    const inputValue = input.toLowerCase();
                    // 检查表单名称是否匹配
                    const nameMatch = childrenText?.includes(inputValue);
                    // 检查表单ID是否精确匹配
                    const idMatch = option?.value?.toString() === input;
                    return nameMatch || idMatch;
                  }}
                >
                  {newForms.map((form) => (
                    <Option key={form.id} value={form.id}>
                      {form.name} (ID: {form.id})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={24} md={8} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Space>
                <Button 
                  type="primary" 
                  onClick={handleFormReplace}
                  disabled={loading || !selectedOldForm || !selectedNewForm}
                >
                  执行替换
                </Button>
                <Button onClick={compareFormFields} disabled={!selectedOldForm || !selectedNewForm}>
                  对比表单
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
        
        {/* 表单详情和对比结果 */}
        {(selectedOldForm || selectedNewForm) && (
          <div style={{ marginTop: '24px' }}>
            <Title level={4}>表单详情</Title>
            <Row gutter={24}>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <h5>旧表单详情 (ID: {selectedOldForm || '未选择'})</h5>
                  <Table
                    columns={[{
                      title: '字段键',
                      dataIndex: 'fieldKey',
                      key: 'fieldKey',
                    }, {
                      title: '字段名',
                      dataIndex: 'fieldValue',
                      key: 'fieldValue',
                    }]}
                    dataSource={oldFormDetails.map(field => ({
                      ...field,
                      key: field.fieldKey
                    }))}
                    rowKey="fieldKey"
                    loading={formDetailsLoading}
                    pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, pageSizeOptions: ['5', '10', '20', '50'], showTotal: (total) => `共 ${total} 条` }}
                    size="small"
                  />
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: '16px' }}>
                  <h5>新表单详情 (ID: {selectedNewForm || '未选择'})</h5>
                  <Table
                    columns={[{
                      title: '字段键',
                      dataIndex: 'fieldKey',
                      key: 'fieldKey',
                    }, {
                      title: '字段名',
                      dataIndex: 'fieldValue',
                      key: 'fieldValue',
                    }]}
                    dataSource={newFormDetails.map(field => ({
                      ...field,
                      key: field.fieldKey
                    }))}
                    rowKey="fieldKey"
                    loading={formDetailsLoading}
                    pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, pageSizeOptions: ['5', '10', '20', '50'], showTotal: (total) => `共 ${total} 条` }}
                    size="small"
                  />
                </div>
              </Col>
            </Row>
            
            {/* 表单对比结果 */}
            {showComparison && (
              <div style={{ marginTop: '24px' }}>
                <Title level={4}>表单对比结果</Title>
                <Table
                  columns={comparisonColumns}
                  dataSource={getComparisonData()}
                  rowKey="fieldKey"
                  loading={formDetailsLoading}
                  pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true, pageSizeOptions: ['10', '20', '50', '100'], showTotal: (total) => `共 ${total} 条` }}
                  scroll={{ x: 'max-content' }}
                />
              </div>
            )}
          </div>
        )}
        
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
          <Typography.Text strong>使用说明：</Typography.Text>
          <ul style={{ marginTop: '8px', paddingLeft: '20px', marginBottom: 0 }}>
            <li>从"旧表单"下拉框中选择需要被替换的表单</li>
            <li>从"新表单"下拉框中选择用于替换的新表单</li>
            <li>下拉框支持按表单名称或ID搜索，ID支持精确匹配</li>
            <li>选择表单后，下方会自动显示表单的字段详情</li>
            <li>点击"执行替换"按钮完成表单替换操作</li>
            <li>点击"对比表单"按钮查看两个表单的字段键和字段名差异</li>
            <li>当旧表单ID大于新表单ID时，执行替换会弹出确认提示</li>
            <li>可以通过访问 <code>/form-replace</code> 路径来访问此页面</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default FormReplacePage;
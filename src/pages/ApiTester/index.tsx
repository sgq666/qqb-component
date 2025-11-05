import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, Typography, message, Spin, Select, Checkbox, Alert } from 'antd';
import requestService from '../../services/requestService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface HeaderItem {
  key: string;
  value: string;
}

const ApiTester: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [headers, setHeaders] = useState<HeaderItem[]>([{ key: '', value: '' }]);
  
  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    setResponse(null);
    
    try {
      // 构造请求头对象
      const headersObj: Record<string, string> = {};
      headers.forEach(header => {
        if (header.key && header.value) {
          headersObj[header.key] = header.value;
        }
      });

      // 解析请求参数
      let params = {};
      if (values.params) {
        try {
          params = JSON.parse(values.params);
        } catch (e) {
          message.error('请求参数格式错误，请输入有效的JSON格式');
          setLoading(false);
          return;
        }
      }

      // 如果需要处理跨域问题，使用 fetch 直接发送请求
      if (values.handleCors) {
        // 构造完整的 URL
        let url = values.url;
        if (!url.startsWith('http')) {
          // 如果是相对路径，需要添加基础 URL
          const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
          url = baseUrl + (url.startsWith('/') ? url : '/' + url);
        }

        // 构造 fetch 配置
        const fetchConfig: RequestInit = {
          method: values.method,
          headers: { ...headersObj },
          // 添加 CORS 相关选项
          mode: 'cors',
          credentials: 'omit' // 不发送凭据，避免跨域问题
        };

        // 添加请求体（如果是需要的请求方法）
        if (['POST', 'PUT', 'PATCH'].includes(values.method) && Object.keys(params).length > 0) {
          fetchConfig.body = JSON.stringify(params);
          // 确保 Content-Type 被设置
          if (!headersObj['Content-Type']) {
            (fetchConfig.headers as Record<string, string>)['Content-Type'] = 'application/json';
          }
        }

        try {
          const response = await fetch(url, fetchConfig);
          const result = await response.json();
          setResponse(result);
          message.success('请求成功');
        } catch (error: any) {
          setResponse({ error: error.message || '请求失败' });
          message.error('请求失败: ' + (error.message || '未知错误'));
        }
      } else {
        // 使用原有的 requestService 发送请求
        // 构造请求配置
        const config: any = {
          headers: headersObj
        };

        let result: any;
        switch (values.method) {
          case 'GET':
            result = await requestService.get(values.url, config);
            break;
          case 'POST':
            result = await requestService.post(values.url, params, config);
            break;
          case 'PUT':
            result = await requestService.put(values.url, params, config);
            break;
          case 'DELETE':
            result = await requestService.delete(values.url, config);
            break;
          case 'PATCH':
            result = await requestService.post(values.url, params, config);
            break;
          default:
            result = await requestService.get(values.url, config);
        }

        setResponse(result);
        message.success('请求成功');
      }
    } catch (error: any) {
      setResponse({ error: error.message || '请求失败' });
      message.error('请求失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (data: any) => {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data, null, 2);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>API 接口测试工具</Title>
      <Alert
        message="跨域问题说明"
        description="浏览器会自动添加 Referer 等请求头，无法完全通过前端代码移除。如遇到跨域问题，请勾选下方的'处理跨域问题'选项，将使用特殊配置发送请求。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            method: 'GET',
            handleCors: false
          }}
        >
          <Form.Item
            name="url"
            label="接口路径"
            rules={[{ required: true, message: '请输入接口路径' }]}
          >
            <Input placeholder="例如: /api/users" />
          </Form.Item>

          <Form.Item
            name="method"
            label="请求方法"
            rules={[{ required: true, message: '请选择请求方法' }]}
          >
            <Select>
              <Select.Option value="GET">GET</Select.Option>
              <Select.Option value="POST">POST</Select.Option>
              <Select.Option value="PUT">PUT</Select.Option>
              <Select.Option value="DELETE">DELETE</Select.Option>
              <Select.Option value="PATCH">PATCH</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="handleCors"
            label="跨域处理"
            valuePropName="checked"
          >
            <Checkbox>处理跨域问题（使用特殊配置发送请求）</Checkbox>
          </Form.Item>

          <Form.Item label="请求头">
            {headers.map((header, index) => (
              <Space key={index} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                <Input
                  placeholder="键"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                />
                <Input
                  placeholder="值"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                />
                {index > 0 && (
                  <Button onClick={() => removeHeader(index)}>删除</Button>
                )}
              </Space>
            ))}
            <Button type="dashed" onClick={addHeader} style={{ width: '100%' }}>
              + 添加请求头
            </Button>
          </Form.Item>

          <Form.Item
            name="params"
            label="请求参数 (JSON格式)"
          >
            <TextArea
              rows={4}
              placeholder='{ "name": "test", "age": 18 }'
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              发送请求
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {response && (
        <Card title="响应结果" style={{ marginTop: 24 }}>
          {loading ? (
            <Spin />
          ) : (
            <div>
              <Text strong>响应内容:</Text>
              <TextArea
                rows={10}
                value={formatResponse(response)}
                readOnly
                style={{ marginTop: 8, fontFamily: 'monospace' }}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ApiTester;
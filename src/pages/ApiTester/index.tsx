import React, { useState, useRef } from 'react';
import { Form, Input, Button, Card, Space, Typography, message, Spin, Select, Checkbox, Alert, Divider, Row, Col, Progress, InputNumber, Switch } from 'antd';
import requestService from '../../services/requestService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface HeaderItem {
  key: string;
  value: string;
}

// 预设的API前缀
const API_PREFIXES = [
  { label: '默认前缀', value: '' },
  { label: '海南省厅二类网通道', value: 'http://zw3.ga.hainan.gov.cn/hngazhjw/app' },
  { label: '本地开发环境', value: 'http://localhost:3000' },
  { label: '测试环境', value: 'http://127.0.0.1:8010' },
];

const ApiTester: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [stressTesting, setStressTesting] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [headers, setHeaders] = useState<HeaderItem[]>([{ key: '', value: '' }]);
  const [progress, setProgress] = useState(0);
  const [testResults, setTestResults] = useState<any>(null);
  const [autoGenerateParams, setAutoGenerateParams] = useState(false);
  const [paramConfig, setParamConfig] = useState({
    keyCount: 3,
    valueLength: 10
  });
  
  // 用于存储压力测试的状态
  const stressTestRef = useRef({
    totalRequests: 0,
    completedRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    startTime: 0,
    endTime: 0,
  });

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

  // 生成随机字符串
  const generateRandomString = (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 生成随机参数对象
  const generateRandomParams = (keyCount: number, valueLength: number): any => {
    const params: any = {};
    for (let i = 0; i < keyCount; i++) {
      const key = `key_${i}_${generateRandomString(3)}`;
      const value = generateRandomString(valueLength);
      params[key] = value;
    }
    return params;
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

      // 解析或生成请求参数
      let params = {};
      if (autoGenerateParams) {
        // 自动生成参数
        params = generateRandomParams(paramConfig.keyCount, paramConfig.valueLength);
      } else if (values.params) {
        // 使用手动输入的参数
        try {
          params = JSON.parse(values.params);
        } catch (e) {
          message.error('请求参数格式错误，请输入有效的JSON格式');
          setLoading(false);
          return;
        }
      }

      // 构造完整的 URL
      let url = values.url;
      if (values.apiPrefix && !url.startsWith('http')) {
        // 如果选择了API前缀且URL不是完整路径，则添加前缀
        url = values.apiPrefix + (url.startsWith('/') ? url : '/' + url);
      } else if (!url.startsWith('http')) {
        // 如果是相对路径，需要添加基础 URL
        const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
        url = baseUrl + (url.startsWith('/') ? url : '/' + url);
      }

      // 如果需要处理跨域问题，使用 fetch 直接发送请求
      if (values.handleCors) {
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
            result = await requestService.get(url, config);
            break;
          case 'POST':
            result = await requestService.post(url, params, config);
            break;
          case 'PUT':
            result = await requestService.put(url, params, config);
            break;
          case 'DELETE':
            result = await requestService.delete(url, config);
            break;
          case 'PATCH':
            result = await requestService.post(url, params, config);
            break;
          default:
            result = await requestService.get(url, config);
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

  // 压力测试函数
  const onStartStressTest = async (values: any) => {
    setStressTesting(true);
    setTestResults(null);
    setProgress(0);
    
    // 初始化压力测试状态
    stressTestRef.current = {
      totalRequests: values.concurrentRequests * values.duration,
      completedRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      startTime: Date.now(),
      endTime: 0,
    };

    try {
      // 构造请求头对象
      const headersObj: Record<string, string> = {};
      headers.forEach(header => {
        if (header.key && header.value) {
          headersObj[header.key] = header.value;
        }
      });

      // 构造完整的 URL
      let baseUrl = values.url;
      if (values.apiPrefix && !baseUrl.startsWith('http')) {
        // 如果选择了API前缀且URL不是完整路径，则添加前缀
        baseUrl = values.apiPrefix + (baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl);
      } else if (!baseUrl.startsWith('http')) {
        // 如果是相对路径，需要添加基础 URL
        const envBaseUrl = process.env.REACT_APP_API_BASE_URL || '';
        baseUrl = envBaseUrl + (baseUrl.startsWith('/') ? baseUrl : '/' + baseUrl);
      }

      // 构造请求配置
      const config: any = {
        headers: headersObj
      };

      // 创建并发请求函数
      const sendRequest = async (): Promise<boolean> => {
        try {
          // 每次请求都生成新的随机参数（如果启用了自动生成功能）
          let params = {};
          if (autoGenerateParams) {
            params = generateRandomParams(paramConfig.keyCount, paramConfig.valueLength);
          } else if (values.params) {
            try {
              params = JSON.parse(values.params);
            } catch (e) {
              // 如果参数解析失败，使用空对象
              params = {};
            }
          }

          let result: any;
          switch (values.method) {
            case 'GET':
              result = await requestService.get(baseUrl, config);
              break;
            case 'POST':
              result = await requestService.post(baseUrl, params, config);
              break;
            case 'PUT':
              result = await requestService.put(baseUrl, params, config);
              break;
            case 'DELETE':
              result = await requestService.delete(baseUrl, config);
              break;
            case 'PATCH':
              result = await requestService.post(baseUrl, params, config);
              break;
            default:
              result = await requestService.get(baseUrl, config);
          }
          return true;
        } catch (error) {
          return false;
        }
      };

      // 创建并发请求批次
      const runBatch = async () => {
        const promises = [];
        for (let i = 0; i < values.concurrentRequests; i++) {
          promises.push(sendRequest());
        }
        
        const results = await Promise.all(promises);
        results.forEach(success => {
          stressTestRef.current.completedRequests++;
          if (success) {
            stressTestRef.current.successfulRequests++;
          } else {
            stressTestRef.current.failedRequests++;
          }
        });

        // 更新进度
        const progressPercent = Math.min(100, Math.round(
          (stressTestRef.current.completedRequests / stressTestRef.current.totalRequests) * 100
        ));
        setProgress(progressPercent);

        // 如果还没有达到总请求数，继续发送下一批请求
        if (stressTestRef.current.completedRequests < stressTestRef.current.totalRequests) {
          setTimeout(runBatch, values.interval);
        } else {
          // 测试完成
          stressTestRef.current.endTime = Date.now();
          setStressTesting(false);
          
          // 计算测试结果
          const durationSeconds = (stressTestRef.current.endTime - stressTestRef.current.startTime) / 1000;
          const requestsPerSecond = stressTestRef.current.completedRequests / durationSeconds;
          
          setTestResults({
            totalRequests: stressTestRef.current.totalRequests,
            completedRequests: stressTestRef.current.completedRequests,
            successfulRequests: stressTestRef.current.successfulRequests,
            failedRequests: stressTestRef.current.failedRequests,
            durationSeconds: durationSeconds.toFixed(2),
            requestsPerSecond: requestsPerSecond.toFixed(2),
            successRate: ((stressTestRef.current.successfulRequests / stressTestRef.current.completedRequests) * 100).toFixed(2)
          });
          
          message.success('压力测试完成');
        }
      };

      // 开始第一轮请求
      runBatch();
    } catch (error: any) {
      message.error('压力测试失败: ' + (error.message || '未知错误'));
      setStressTesting(false);
    }
  };

  const onStopStressTest = () => {
    setStressTesting(false);
    message.info('压力测试已停止');
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
        message="使用说明"
        description="1. 可以选择预设的API前缀，简化URL输入；2. 启用自动参数生成可测试网络稳定性；3. 压力测试可评估接口性能"
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
            handleCors: false,
            apiPrefix: ''
          }}
        >
          <Form.Item
            name="apiPrefix"
            label="API前缀"
          >
            <Select placeholder="选择API前缀">
              {API_PREFIXES.map(prefix => (
                <Select.Option key={prefix.value} value={prefix.value}>
                  {prefix.label}: {prefix.value || '使用环境变量配置'}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="url"
            label="接口路径"
            rules={[{ required: true, message: '请输入接口路径' }]}
          >
            <Input placeholder="例如: /api/users 或完整URL" />
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

          <Form.Item label="参数生成设置">
            <Space>
              <Switch 
                checked={autoGenerateParams} 
                onChange={setAutoGenerateParams} 
                checkedChildren="启用自动参数生成" 
                unCheckedChildren="使用手动参数" 
              />
              {autoGenerateParams && (
                <Space>
                  <span>键数量:</span>
                  <InputNumber 
                    min={1} 
                    max={30} 
                    value={paramConfig.keyCount} 
                    onChange={(value) => setParamConfig({...paramConfig, keyCount: value || 3})} 
                  />
                  <span>值长度:</span>
                  <InputNumber 
                    min={1} 
                    max={100} 
                    value={paramConfig.valueLength} 
                    onChange={(value) => setParamConfig({...paramConfig, valueLength: value || 10})} 
                  />
                </Space>
              )}
            </Space>
          </Form.Item>

          {!autoGenerateParams && (
            <Form.Item
              name="params"
              label="请求参数 (JSON格式)"
            >
              <TextArea
                rows={4}
                placeholder='{ "name": "test", "age": 18 }'
              />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                发送请求
              </Button>
              <Button type="default" htmlType="button" onClick={() => form.resetFields()}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 压力测试部分 */}
      <Divider orientation="left">压力测试</Divider>
      <Card>
        <Form
          layout="vertical"
          onFinish={onStartStressTest}
          initialValues={{
            method: 'GET',
            concurrentRequests: 5,
            interval: 1000,
            duration: 10,
            apiPrefix: ''
          }}
        >
          <Form.Item
            name="apiPrefix"
            label="API前缀"
          >
            <Select placeholder="选择API前缀">
              {API_PREFIXES.map(prefix => (
                <Select.Option key={prefix.value} value={prefix.value}>
                  {prefix.label}: {prefix.value || '使用环境变量配置'}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="url"
            label="接口路径"
            rules={[{ required: true, message: '请输入接口路径' }]}
          >
            <Input placeholder="例如: /api/users 或完整URL" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="concurrentRequests"
                label="并发请求数量"
                rules={[{ required: true, message: '请输入并发请求数量' }]}
              >
                <InputNumber min={1} max={100} placeholder="并发请求数量" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="interval"
                label="请求间隔 (毫秒)"
                rules={[{ required: true, message: '请输入请求间隔时间' }]}
              >
                <InputNumber min={0} max={10000} placeholder="请求间隔时间" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="duration"
                label="测试持续时间 (秒)"
                rules={[{ required: true, message: '请输入测试持续时间' }]}
              >
                <InputNumber min={1} max={300} placeholder="测试持续时间" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item label="参数生成设置">
            <Space>
              <Switch 
                checked={autoGenerateParams} 
                onChange={setAutoGenerateParams} 
                checkedChildren="启用自动参数生成" 
                unCheckedChildren="使用手动参数" 
              />
              {autoGenerateParams && (
                <Space>
                  <span>键数量:</span>
                  <InputNumber 
                    min={1} 
                    max={20} 
                    value={paramConfig.keyCount} 
                    onChange={(value) => setParamConfig({...paramConfig, keyCount: value || 3})} 
                  />
                  <span>值长度:</span>
                  <InputNumber 
                    min={1} 
                    max={100} 
                    value={paramConfig.valueLength} 
                    onChange={(value) => setParamConfig({...paramConfig, valueLength: value || 10})} 
                  />
                </Space>
              )}
            </Space>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={stressTesting}
                disabled={stressTesting}
              >
                开始压力测试
              </Button>
              {stressTesting && (
                <Button type="default" onClick={onStopStressTest}>
                  停止测试
                </Button>
              )}
            </Space>
          </Form.Item>
          
          {stressTesting && (
            <div style={{ marginTop: 20 }}>
              <Text>正在进行压力测试...</Text>
              <Progress percent={progress} status="active" />
            </div>
          )}
        </Form>
      </Card>

      {testResults && (
        <Card title="压力测试结果" style={{ marginTop: 24 }}>
          <Space direction="vertical">
            <Text>总请求数: {testResults.totalRequests}</Text>
            <Text>完成请求数: {testResults.completedRequests}</Text>
            <Text>成功请求数: {testResults.successfulRequests}</Text>
            <Text>失败请求数: {testResults.failedRequests}</Text>
            <Text>成功率: {testResults.successRate}%</Text>
            <Text>测试耗时: {testResults.durationSeconds} 秒</Text>
            <Text>平均QPS: {testResults.requestsPerSecond}</Text>
          </Space>
        </Card>
      )}

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
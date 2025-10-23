import React, { useState } from 'react';
import { Card, Button, message, Alert, Input, Space, Typography, Divider } from 'antd';
import requestService from '../../services/requestService';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const TestDecrypt: React.FC = () => {
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [dataType, setDataType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 测试解密功能
  const testDecrypt = () => {
    try {
      // 这里应该使用从后端获取的真实加密数据进行测试
      // 由于我们没有真实的加密数据，这里只是演示如何调用解密方法
      message.info('解密功能已集成到requestService中，将在API响应拦截器中自动解密data字段');
    } catch (error) {
      message.error('测试失败: ' + (error as Error).message);
    }
  };

  // 手动解密输入的文本
  const handleDecrypt = () => {
    if (!encryptedText.trim()) {
      message.warning('请输入要解密的文本');
      return;
    }

    setLoading(true);
    try {
      // 使用requestService中的解密方法
      const result = requestService.decrypt(encryptedText);
      
      // 根据结果类型设置不同的显示
      if (typeof result === 'object' && result !== null) {
        setDecryptedText(JSON.stringify(result, null, 2));
        setDecryptedData(result);
        setDataType('JSON对象');
      } else {
        setDecryptedText(String(result));
        setDecryptedData(null);
        setDataType(typeof result === 'string' ? '字符串' : typeof result);
      }
      
      message.success('解密成功');
    } catch (error) {
      const errorMessage = (error as Error).message;
      message.error(errorMessage);
      setDecryptedText('');
      setDecryptedData(null);
      setDataType('');
      
      // 提供更详细的错误指导
      if (errorMessage.includes('Base64')) {
        message.info('请确保输入的是有效的Base64编码的加密数据');
      } else if (errorMessage.includes('密钥') || errorMessage.includes('解密失败')) {
        message.info('请检查：1. 输入的数据是否为有效的AES加密数据 2. 加密时使用的密钥和IV是否与解密端一致');
      } else if (errorMessage.includes('Malformed UTF-8 data')) {
        message.info('解密后的数据无法正确解析为UTF-8字符串，可能是密钥/IV不匹配或数据已损坏');
      }
    } finally {
      setLoading(false);
    }
  };

  // 清空输入和输出
  const handleClear = () => {
    setEncryptedText('');
    setDecryptedText('');
    setDecryptedData(null);
    setDataType('');
  };

  // 使用示例加密文本
  const useExampleText = () => {
    // 这里提供一个示例文本（注意：这只是一个示例，实际使用时需要真实的加密数据）
    setEncryptedText('Km9JjHm7X+7V9Q1pP5nQ6A=='); // 示例Base64数据
    message.info('已填入示例数据，请替换为真实的加密数据进行测试');
  };

  const decryptSetting = process.env.REACT_APP_DECRY || '未设置';

  return (
    <div style={{ padding: 20 }}>
      <Card title="解密功能测试">
        <Alert
          message="环境变量检查"
          description={`REACT_APP_DECRY 当前设置为: ${decryptSetting}。${decryptSetting === '1' ? '解密功能已启用' : '解密功能已禁用'}`}
          type={decryptSetting === '1' ? "success" : "warning"}
          showIcon
          style={{ marginBottom: 20 }}
        />
        
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={4}>手动解密测试</Title>
            <Paragraph>
              在此输入框中输入Base64编码的加密文本，点击解密按钮进行解密：
            </Paragraph>
            <TextArea
              rows={4}
              placeholder="请输入Base64编码的加密文本"
              value={encryptedText}
              onChange={(e) => setEncryptedText(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <Space>
              <Button 
                type="primary" 
                onClick={handleDecrypt}
                loading={loading}
                disabled={!encryptedText.trim()}
              >
                解密
              </Button>
              <Button 
                onClick={handleClear}
              >
                清空
              </Button>
              <Button 
                onClick={useExampleText}
              >
                填入示例数据
              </Button>
            </Space>
          </div>

          {(decryptedText || decryptedData) && (
            <div>
              <Title level={4}>解密结果</Title>
              <Paragraph>
                数据类型: <strong>{dataType}</strong>
              </Paragraph>
              <TextArea
                rows={decryptedData ? 8 : 4}
                value={decryptedText}
                readOnly
              />
            </div>
          )}

          <Divider />

          <div>
            <Title level={4}>使用说明</Title>
            <ul>
              <li>请输入有效的Base64编码的AES加密数据</li>
              <li>加密算法: AES/CBC/PKCS5Padding</li>
              <li>密钥: tgram7qb12345678</li>
              <li>IV: tgram7qb12345678</li>
              <li>只有当环境变量 REACT_APP_DECRY 等于 "1" 时，API响应才会自动解密</li>
              <li>如果解密内容是JSON格式，系统会自动解析为对象；否则保持为原始数据类型</li>
              <li>支持解密为字符串、数字、布尔值、JSON对象等各种数据类型</li>
            </ul>
          </div>

          <div>
            <Title level={4}>自动解密说明</Title>
            <Paragraph>
              解密功能已成功集成到requestService中。当API响应包含加密的data字段时，
              系统会根据环境变量自动决定是否进行解密处理。
            </Paragraph>
            <Button type="primary" onClick={testDecrypt}>
              测试解密功能
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default TestDecrypt;
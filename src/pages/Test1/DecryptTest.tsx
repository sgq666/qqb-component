import React, { useState } from 'react';
import { Card, Button, Input, Typography, Space, message, Alert } from 'antd';
import CryptoJS from 'crypto-js';
import requestService from '../../services/requestService';

const { Title, Text } = Typography;

// AES解密函数，与Java代码保持一致
const decryptByAES = (encrypted: string): string => {
  const key = "tgram7qb12345678";
  const iv = "tgram7qb12345678";
  
  try {
    // 将密钥和IV转换为CryptoJS格式
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const ivBytes = CryptoJS.enc.Utf8.parse(iv);
    
    // Base64解码并解密
    const decrypted = CryptoJS.AES.decrypt(encrypted, keyBytes, {
      keySize: 128 / 32,
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // 转换为UTF-8字符串
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("解密失败:", error);
    throw error;
  }
};

// AES加密函数，用于测试（与Java代码保持一致）
const encryptByAES = (plaintext: string): string => {
  const key = "tgram7qb12345678";
  const iv = "tgram7qb12345678";
  
  try {
    // 将密钥和IV转换为CryptoJS格式
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const ivBytes = CryptoJS.enc.Utf8.parse(iv);
    
    // 加密
    const encrypted = CryptoJS.AES.encrypt(plaintext, keyBytes, {
      keySize: 128 / 32,
      iv: ivBytes,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // 返回Base64编码的结果
    return encrypted.toString();
  } catch (error) {
    console.error("加密失败:", error);
    throw error;
  }
};

const DecryptTest: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [encryptedText, setEncryptedText] = useState<string>('');
  const [decryptedText, setDecryptedText] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');
  const [decryptSetting, setDecryptSetting] = useState<string>(process.env.REACT_APP_DECRY || '未设置');

  // 处理加密
  const handleEncrypt = () => {
    if (!inputText) {
      message.warning('请输入要加密的文本');
      return;
    }
    
    try {
      const encrypted = encryptByAES(inputText);
      setEncryptedText(encrypted);
      message.success('加密成功');
    } catch (error) {
      message.error('加密失败: ' + (error as Error).message);
    }
  };

  // 处理解密
  const handleDecrypt = () => {
    if (!encryptedText) {
      message.warning('请输入要解密的文本');
      return;
    }
    
    try {
      const decrypted = decryptByAES(encryptedText);
      setDecryptedText(decrypted);
      message.success('解密成功');
    } catch (error) {
      message.error('解密失败: ' + (error as Error).message);
    }
  };

  // 测试加密解密流程
  const handleTestEncryptionDecryption = () => {
    if (!inputText) {
      message.warning('请输入要测试的文本');
      return;
    }
    
    try {
      const encrypted = encryptByAES(inputText);
      const decrypted = decryptByAES(encrypted);
      
      setEncryptedText(encrypted);
      setDecryptedText(decrypted);
      
      if (decrypted === inputText) {
        setTestResult('测试通过：解密结果与原始文本一致');
        message.success('端到端测试通过');
      } else {
        setTestResult('测试失败：解密结果与原始文本不一致');
        message.error('端到端测试失败');
      }
    } catch (error) {
      setTestResult('测试失败：发生错误 - ' + (error as Error).message);
      message.error('端到端测试失败: ' + (error as Error).message);
    }
  };

  // 测试requestService的解密功能
  const testRequestServiceDecrypt = () => {
    if (!encryptedText) {
      message.warning('请先生成加密文本');
      return;
    }

    try {
      // 使用requestService的公共解密方法
      const decrypted = requestService.decrypt(encryptedText);
      setDecryptedText(decrypted);
      message.success('使用requestService解密成功');
    } catch (error) {
      message.error('使用requestService解密失败: ' + (error as Error).message);
    }
  };

  return (
    <Card title="AES解密功能测试" style={{ marginTop: 20 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="环境变量检查"
          description={`REACT_APP_DECRY 当前设置为: ${decryptSetting}。${decryptSetting === '1' ? '解密功能已启用' : '解密功能已禁用'}`}
          type={decryptSetting === '1' ? "success" : "warning"}
          showIcon
        />
        
        <Title level={4}>加密解密测试</Title>
        
        <div>
          <Text strong>原始文本:</Text>
          <Input.TextArea
            rows={3}
            placeholder="输入要加密的文本"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        
        <div>
          <Text strong>加密结果:</Text>
          <Input.TextArea
            rows={3}
            placeholder="加密后的文本"
            value={encryptedText}
            onChange={(e) => setEncryptedText(e.target.value)}
          />
        </div>
        
        <div>
          <Text strong>解密结果:</Text>
          <Input.TextArea
            rows={3}
            placeholder="解密后的文本"
            value={decryptedText}
            onChange={(e) => setDecryptedText(e.target.value)}
          />
        </div>
        
        <div>
          <Text strong>测试结果:</Text>
          <div>{testResult}</div>
        </div>
        
        <Space>
          <Button type="primary" onClick={handleEncrypt}>
            加密
          </Button>
          <Button onClick={handleDecrypt}>
            解密
          </Button>
          <Button type="primary" danger onClick={handleTestEncryptionDecryption}>
            端到端测试
          </Button>
          <Button onClick={testRequestServiceDecrypt}>
            测试requestService解密
          </Button>
        </Space>
        
        <div style={{ marginTop: 20 }}>
          <Title level={4}>使用说明</Title>
          <Text>
            1. 在"原始文本"中输入要测试的内容，点击"加密"按钮生成加密数据<br/>
            2. 点击"解密"按钮对加密数据进行解密<br/>
            3. 点击"端到端测试"按钮完整测试加密和解密流程<br/>
            4. 点击"测试requestService解密"按钮测试集成到服务中的解密功能<br/>
            5. 本测试使用与Java代码相同的AES/CBC/PKCS5Padding算法<br/>
            6. 密钥和IV均为"tgram7qb12345678"<br/>
            7. 解密功能受环境变量REACT_APP_DECRY控制，只有当其值为"1"时才会在API响应中自动解密data字段
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default DecryptTest;
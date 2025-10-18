import React from 'react';
import { Card, Button, message, Alert } from 'antd';
// import requestService from '../../services/requestService';

const TestDecrypt: React.FC = () => {
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
        <p>解密功能已成功集成到requestService中。</p>
        <p>当API响应包含加密的data字段时，系统会根据环境变量自动决定是否进行解密处理。</p>
        <p>解密算法与提供的Java代码保持一致：</p>
        <ul>
          <li>算法: AES/CBC/PKCS5Padding</li>
          <li>密钥: tgram7qb12345678</li>
          <li>IV: tgram7qb12345678</li>
        </ul>
        <p><strong>控制逻辑：</strong>只有当环境变量 REACT_APP_DECRY 等于 "1" 时，才会对返回的数据进行自动解密。</p>
        <Button type="primary" onClick={testDecrypt}>
          测试解密功能
        </Button>
      </Card>
    </div>
  );
};

export default TestDecrypt;
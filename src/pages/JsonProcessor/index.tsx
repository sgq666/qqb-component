import React, { useState } from "react";
import { Card, Input, Button, Space, Row, Col, message } from "antd";
import type { InputRef } from "antd";

const JsonProcessor: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>("");
  const [processingCode, setProcessingCode] = useState<string>(
    `// 示例处理代码：
// data 为解析后的JSON对象或数组
// 返回处理后的结果

// 如果输入是对象，获取所有键：
// if (Array.isArray(data)) {
//   return data.length; // 如果是数组，返回长度
// } else {
//   return Object.keys(data); // 如果是对象，返回键列表
// }

// 简单示例：处理数组数据
if (Array.isArray(data)) {
  return data.map((item, index) => ({
    ...item,
    id: index + 1
  }));
}

// 如果是对象，直接返回
return data;`
  );
  const [output, setOutput] = useState<string>("");

  const handleProcess = () => {
    try {
      // 解析输入的JSON
      const parsedData = JSON.parse(inputJson);
      
      // 创建处理函数
      const func = new Function("data", processingCode);
      
      // 执行处理
      const result = func(parsedData);
      
      // 设置输出结果
      setOutput(JSON.stringify(result, null, 2));
    } catch (error: any) {
      message.error("处理出错: " + error.message);
      setOutput("错误: " + error.message);
    }
  };

  const handleClear = () => {
    setInputJson("");
    setOutput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>JSON 数据处理器</h1>
      <p>在此页面中，您可以输入JSON数据（对象或数组），编写JavaScript代码来处理这些数据，并查看输出结果。</p>
      
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="输入 JSON 数据" size="small">
            <Input.TextArea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              rows={15}
              placeholder={'请输入JSON数据（可以是对象或数组）...\n例如：\n{\n  "name": "张三",\n  "age": 30\n}\n\n或者：\n[\n  {"name": "张三", "age": 30},\n  {"name": "李四", "age": 25}\n]'}
            />
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="处理结果" size="small">
            <Input.TextArea
              value={output}
              rows={15}
              placeholder="处理结果将显示在这里..."
              readOnly
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="处理代码" size="small" style={{ marginTop: 16 }}>
        <Input.TextArea
          value={processingCode}
          onChange={(e) => setProcessingCode(e.target.value)}
          rows={10}
          placeholder="在此编写处理JSON数据的JavaScript代码。数据通过 'data' 变量传入。\n支持处理对象和数组类型的数据。\n可以使用 Array.isArray(data) 来判断数据类型。"
        />
        <div style={{ marginTop: 16 }}>
          <Space>
            <Button type="primary" onClick={handleProcess}>
              执行处理
            </Button>
            <Button onClick={handleClear}>清空</Button>
          </Space>
        </div>
      </Card>
      
      <Card title="使用说明" size="small" style={{ marginTop: 16 }}>
        <ul>
          <li>在左侧输入框中输入有效的JSON数据（可以是对象或数组）</li>
          <li>在下方代码区域编写处理逻辑，数据通过 <code>data</code> 变量传入</li>
          <li>可以使用 <code>Array.isArray(data)</code> 来判断输入数据是数组还是对象</li>
          <li>处理函数需要通过 <code>return</code> 语句返回结果</li>
          <li>点击"执行处理"按钮查看结果</li>
          <li>右侧会显示处理后的JSON结果</li>
        </ul>
        <p><strong>注意：</strong>请确保输入的JSON数据格式正确，处理代码为标准JavaScript语法。</p>
      </Card>
    </div>
  );
};

export default JsonProcessor;
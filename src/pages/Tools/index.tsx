import React, { useState } from "react";
import { Card, Button, Input, Typography, Row, Col, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

// XML转JSON的辅助函数
const xmlToJson = (xmlString: string): any => {
  try {
    // 创建DOMParser实例
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    
    // 递归转换XML节点为JSON对象
    const xmlNodeToJson = (node: any): any => {
      const obj: any = {};
      
      // 处理属性
      if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          obj[`@${attr.name}`] = attr.value;
        }
      }
      
      // 处理子节点
      if (node.childNodes && node.childNodes.length > 0) {
        const children: any = {};
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          if (child.nodeType === 1) { // 元素节点
            const nodeName = child.nodeName;
            const childObj = xmlNodeToJson(child);
            
            if (children[nodeName]) {
              if (!Array.isArray(children[nodeName])) {
                children[nodeName] = [children[nodeName]];
              }
              children[nodeName].push(childObj);
            } else {
              children[nodeName] = childObj;
            }
          } else if (child.nodeType === 3) { // 文本节点
            const text = child.nodeValue?.trim();
            if (text) {
              if (Object.keys(obj).length > 0) {
                obj["#text"] = text;
              } else {
                return text;
              }
            }
          }
        }
        
        Object.assign(obj, children);
      }
      
      return obj;
    };
    
    return xmlNodeToJson(xmlDoc.documentElement);
  } catch (error) {
    throw new Error("XML解析失败: " + (error as Error).message);
  }
};

const Tools: React.FC = () => {
  // Base64图片状态
  const [base64Text, setBase64Text] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  
  // XML转JSON状态
  const [xmlText, setXmlText] = useState("");
  const [jsonResult, setJsonResult] = useState("");
  
  // 处理Base64图片显示
  const handleShowImage = () => {
    if (!base64Text.trim()) {
      message.warning("请输入Base64文本");
      return;
    }
    
    try {
      // 验证Base64格式
      if (!base64Text.startsWith("data:image")) {
        // 如果没有data:image前缀，尝试添加默认的png前缀
        setImageUrl(`data:image/png;base64,${base64Text}`);
      } else {
        setImageUrl(base64Text);
      }
      message.success("图片加载成功");
    } catch (error) {
      message.error("Base64格式不正确或图片加载失败");
    }
  };
  
  // 处理XML转JSON
  const handleXmlToJson = () => {
    if (!xmlText.trim()) {
      message.warning("请输入XML文本");
      return;
    }
    
    try {
      const jsonObj = xmlToJson(xmlText);
      setJsonResult(JSON.stringify(jsonObj, null, 2));
      message.success("XML转换JSON成功");
    } catch (error) {
      message.error((error as Error).message);
    }
  };
  
  // Base64文件上传处理
  const handleBase64FileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        setBase64Text(result);
        message.success("文件读取成功");
      } catch (error) {
        message.error("文件读取失败");
      }
    };
    reader.onerror = () => {
      message.error("文件读取失败");
    };
    reader.readAsText(file);
    return false;
  };
  
  // XML文件上传处理
  const handleXmlFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        setXmlText(result);
        message.success("文件读取成功");
      } catch (error) {
        message.error("文件读取失败");
      }
    };
    reader.onerror = () => {
      message.error("文件读取失败");
    };
    reader.readAsText(file);
    return false;
  };
  
  // Base64上传配置
  const base64UploadProps = {
    beforeUpload: (file: File) => {
      handleBase64FileUpload(file);
      return false;
    },
    maxCount: 1,
    accept: ".txt,.base64",
    showUploadList: false
  };
  
  // XML上传配置
  const xmlUploadProps = {
    beforeUpload: (file: File) => {
      handleXmlFileUpload(file);
      return false;
    },
    maxCount: 1,
    accept: ".xml,.txt",
    showUploadList: false
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>实用工具集</Title>
      
      <Row gutter={16}>
        {/* Base64图片显示 */}
        <Col span={12}>
          <Card title="Base64图片显示" size="small">
            <Upload {...base64UploadProps}>
              <Button icon={<UploadOutlined />} style={{ marginBottom: "10px" }}>
                上传Base64文件
              </Button>
            </Upload>
            <TextArea
              rows={6}
              placeholder="请输入Base64图片文本，支持data:image/格式或纯Base64数据"
              value={base64Text}
              onChange={(e) => setBase64Text(e.target.value)}
            />
            <Button 
              type="primary" 
              onClick={handleShowImage}
              style={{ marginTop: "10px" }}
            >
              显示图片
            </Button>
            
            {imageUrl && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <Text strong>图片预览:</Text>
                <div style={{ marginTop: "10px" }}>
                  <img 
                    src={imageUrl} 
                    alt="Base64图片" 
                    style={{ maxWidth: "100%", maxHeight: "300px" }}
                  />
                </div>
              </div>
            )}
          </Card>
        </Col>
        
        {/* XML转JSON */}
        <Col span={12}>
          <Card title="XML转JSON" size="small">
            <Upload {...xmlUploadProps}>
              <Button icon={<UploadOutlined />} style={{ marginBottom: "10px" }}>
                上传XML文件
              </Button>
            </Upload>
            <TextArea
              rows={6}
              placeholder="请输入XML文本"
              value={xmlText}
              onChange={(e) => setXmlText(e.target.value)}
            />
            <Button 
              type="primary" 
              onClick={handleXmlToJson}
              style={{ marginTop: "10px" }}
            >
              转换为JSON
            </Button>
            
            {jsonResult && (
              <div style={{ marginTop: "20px" }}>
                <Text strong>JSON结果:</Text>
                <TextArea
                  rows={8}
                  value={jsonResult}
                  readOnly
                  style={{ marginTop: "10px", fontFamily: "monospace" }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Tools;
import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import { FileUploader, ImageUploader } from '../components';

const { Title, Paragraph } = Typography;

const TestPage: React.FC = () => {
  const handleFileUploaded = (fileInfo: any) => {
    console.log('文件上传成功:', fileInfo);
    // 在这里处理文件上传成功后的逻辑
  };

  const handleImageUploaded = (fileInfo: any) => {
    console.log('图片上传成功:', fileInfo);
    // 在这里处理图片上传成功后的逻辑
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>文件上传组件测试</Title>
        
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" title="通用文件上传组件">
                <Paragraph>支持任意类型的文件上传，默认最大10MB</Paragraph>
                <FileUploader onFileUploaded={handleFileUploaded} />
              </Card>
            </Col>
            
            <Col span={12}>
              <Card size="small" title="图片上传组件（优化版）">
                <Paragraph>专门用于图片上传，支持预览和移除功能</Paragraph>
                <ImageUploader onImageUploaded={handleImageUploaded} />
              </Card>
            </Col>
          </Row>
          
          <Card size="small" title="图片上传组件 - 限制文件类型">
            <Paragraph>只允许上传图片文件 (.jpg, .jpeg, .png)</Paragraph>
            <ImageUploader 
              onImageUploaded={handleImageUploaded} 
              accept=".jpg,.jpeg,.png"
              maxFileSize={5}
            />
          </Card>
          
          <Card size="small" title="文件上传组件 - 限制文件大小">
            <Paragraph>允许上传任意类型文件，但限制大小为2MB</Paragraph>
            <FileUploader 
              onFileUploaded={handleFileUploaded} 
              maxFileSize={2}
            />
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default TestPage;
import React, { useState } from 'react';
import { Upload, Button, message, Card, Space, Typography, Spin } from 'antd';
import { UploadOutlined, FileOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import fileUploadService, { FileInfo } from '../services/fileUploadService';

const { Text } = Typography;

interface FileUploaderProps {
  onFileUploaded?: (fileInfo: FileInfo) => void;
  accept?: string;
  maxFileSize?: number; // MB
  showFileDetails?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUploaded,
  accept,
  maxFileSize = 10,
  showFileDetails = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      // 检查文件大小
      const isLtMaxSize = file.size / 1024 / 1024 < maxFileSize;
      if (!isLtMaxSize) {
        message.error(`文件大小不能超过 ${maxFileSize}MB!`);
        return false;
      }
      
      // 检查文件类型
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        
        const isAccepted = acceptedTypes.some(type => {
          // 处理 MIME 类型
          if (type.includes('/')) {
            return fileType.includes(type.split('/')[0]);
          }
          // 处理文件扩展名
          else {
            return fileName.endsWith(type.toLowerCase());
          }
        });
        
        if (!isAccepted) {
          message.error(`不支持的文件类型，请上传 ${accept} 类型的文件!`);
          return false;
        }
      }
      
      // 开始上传
      handleUpload(file);
      return false; // 阻止默认上传行为
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
    showUploadList: false,
    accept: accept,
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      // 上传文件
      const uploadResponse = await fileUploadService.uploadFile(file);
      
      if (uploadResponse.code === 200) {
        // 获取文件详情
        const detailsResponse = await fileUploadService.getFileDetails(uploadResponse.data);
        
        if (detailsResponse.code === 200) {
          setUploadedFile(detailsResponse.data);
          message.success('文件上传成功');
          
          // 触发回调
          if (onFileUploaded) {
            onFileUploaded(detailsResponse.data);
          }
        } else {
          message.error(detailsResponse.message || '获取文件详情失败');
        }
      } else {
        message.error(uploadResponse.message || '文件上传失败');
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      message.error('文件上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (uploadedFile) {
      const realPath = fileUploadService.getFileRealPath(uploadedFile.filePath);
      window.open(realPath, '_blank');
    }
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };

  return (
    <Card size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} loading={loading}>
            {loading ? '上传中...' : '选择文件'}
          </Button>
        </Upload>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <Spin tip="文件上传中..." />
          </div>
        )}
        
        {showFileDetails && uploadedFile && (
          <Card size="small" type="inner">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <FileOutlined />
                <Text strong>{uploadedFile.fileName}</Text>
              </Space>
              
              <Space size="large">
                <Text type="secondary">大小: {formatFileSize(uploadedFile.size)}</Text>
                <Text type="secondary">
                  上传时间: {new Date(uploadedFile.whenCreated).toLocaleString()}
                </Text>
              </Space>
              
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={handleDownload}
                size="small"
              >
                下载文件
              </Button>
            </Space>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default FileUploader;
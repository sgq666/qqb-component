import React, { useState } from 'react';
import { Upload, Button, message, Card, Space, Spin, Image, Tooltip } from 'antd';
import { UploadOutlined, CloseOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import fileUploadService, { FileInfo } from '../services/fileUploadService';


interface ImageUploaderProps {
  onImageUploaded?: (fileInfo: FileInfo) => void;
  maxFileSize?: number; // MB
  showPreview?: boolean;
  initialValue?: FileInfo | null;
  accept?: string; // 添加accept属性支持
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  maxFileSize = 10,
  showPreview = true,
  initialValue = null,
  accept = 'image/*', // 默认接受所有图片类型
}) => {
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<FileInfo | null>(initialValue);
  const [previewVisible, setPreviewVisible] = useState(false);

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      // 检查文件大小
      const isLtMaxSize = file.size / 1024 / 1024 < maxFileSize;
      if (!isLtMaxSize) {
        message.error(`文件大小不能超过 ${maxFileSize}MB!`);
        return false;
      }
      
      // 检查文件类型
      if (accept !== 'image/*') {
        // 如果指定了具体的accept类型，检查文件类型是否匹配
        const acceptedTypes = accept.split(',').map(type => type.trim());
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            // 按扩展名检查
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          } else {
            // 按MIME类型检查
            return file.type.includes(type);
          }
        });
        
        if (!isAccepted) {
          message.error(`不支持的文件类型，请上传 ${accept} 类型的文件!`);
          return false;
        }
      } else {
        // 默认情况下只允许图片
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
          message.error('只能上传图片文件!');
          return false;
        }
      }
      
      // 开始上传
      handleUpload(file);
      return false; // 阻止默认上传行为
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 图片上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 图片上传失败`);
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
          setUploadedImage(detailsResponse.data);
          message.success('图片上传成功');
          
          // 触发回调
          if (onImageUploaded) {
            onImageUploaded(detailsResponse.data);
          }
        } else {
          message.error(detailsResponse.message || '获取图片详情失败');
        }
      } else {
        message.error(uploadResponse.message || '图片上传失败');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      message.error('图片上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setUploadedImage(null);
    // 触发回调，传入null表示移除了图片
    if (onImageUploaded) {
      onImageUploaded(null as any);
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
            {loading ? '上传中...' : '选择图片'}
          </Button>
        </Upload>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <Spin tip="图片上传中..." />
          </div>
        )}
        
        {showPreview && uploadedImage && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Tooltip 
              title={
                <div>
                  <div>文件名: {uploadedImage.fileName}</div>
                  <div>大小: {formatFileSize(uploadedImage.size)}</div>
                  <div>上传时间: {new Date(uploadedImage.whenCreated).toLocaleString()}</div>
                </div>
              }
            >
              <Image
                width={200}
                src={fileUploadService.getFileRealPath(uploadedImage.filePath)}
                preview={{
                  visible: previewVisible,
                  src: fileUploadService.getFileRealPath(uploadedImage.filePath),
                  onVisibleChange: (value) => {
                    setPreviewVisible(value);
                  },
                }}
              />
            </Tooltip>
            <Tooltip title="删除图片">
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<CloseOutlined />}
                size="small"
                onClick={handleRemove}
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  zIndex: 2,
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  minWidth: 18,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            </Tooltip>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ImageUploader;
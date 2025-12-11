import React, { useState } from "react";
import {
  Button,
  Card,
  Input,
  Form,
  Row,
  Col,
  message,
  Upload,
  Table,
  Space,
  Tag,
  Modal,
} from "antd";
import {
  EnvironmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";
import { CheckPoint } from "./types";
import GeolocationUtils from "../../utils/GeolocationUtils";

interface CheckPointReportingProps {
  checkPoints: CheckPoint[];
  onAddCheckPoint: (checkpoint: CheckPoint) => void;
  onDeleteCheckPoint: (id: string) => void;
}

const { TextArea } = Input;

const CheckPointReporting: React.FC<CheckPointReportingProps> = ({
  checkPoints,
  onAddCheckPoint,
  onDeleteCheckPoint,
}) => {
  const [loading, setLoading] = useState(false);
  const [photoList, setPhotoList] = useState<any[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [form] = Form.useForm();

  // 获取当前位置
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    // 使用GeolocationUtils获取位置
    GeolocationUtils.getCurrentPosition(10000)
      .then((result) => {
        const { latitude, longitude } = result.coords;
        const location = { latitude, longitude };
        setCurrentLocation(location);
        form.setFieldsValue({
          latitude: location.latitude,
          longitude: location.longitude
        });
        setLocationLoading(false);
        message.success("定位成功！");
      })
      .catch((error) => {
        console.log("定位失败:", error);
        setLocationLoading(false);
        message.error(error.message || "定位失败，请检查位置权限设置");
      });
  };

  // 上传图片相关
  const uploadProps: UploadProps = {
    beforeUpload: (file: RcFile) => {
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("只能上传 JPG/PNG 格式的图片!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("图片大小不能超过 2MB!");
      }
      return isJpgOrPng && isLt2M;
    },
    onChange: (info) => {
      setPhotoList(info.fileList);
    },
    listType: "picture-card",
    fileList: photoList,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  };

  // 添加打卡点
  const handleAddCheckpoint = (values: any) => {
    setLoading(true);
    const newCheckpoint: CheckPoint = {
      id: Date.now().toString(),
      name: values.name,
      latitude: parseFloat(values.latitude),
      longitude: parseFloat(values.longitude),
      description: values.description,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setTimeout(() => {
      onAddCheckPoint(newCheckpoint);
      setLoading(false);
      setPhotoList([]);
      form.resetFields();
      message.success("打卡点添加成功");
    }, 1000);
  };

  // 删除打卡点
  const handleDeleteCheckpoint = (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个打卡点吗？",
      onOk: () => {
        onDeleteCheckPoint(id);
        message.success("删除成功");
      },
    });
  };

  return (
    <div>
      <Card title="添加打卡点">
        <Form form={form} onFinish={handleAddCheckpoint} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="打卡点名称"
                rules={[{ required: true, message: "请输入打卡点名称" }]}
              >
                <Input placeholder="请输入打卡点名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="latitude"
                label="纬度"
                rules={[{ required: true, message: "请输入纬度" }]}
              >
                <Input 
                  type="number" 
                  step="0.000001" 
                  placeholder="请输入纬度" 
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="longitude"
                label="经度"
                rules={[{ required: true, message: "请输入经度" }]}
              >
                <Input 
                  type="number" 
                  step="0.000001" 
                  placeholder="请输入经度" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="description"
                label="打卡点说明"
                rules={[{ required: true, message: "请输入打卡点说明" }]}
              >
                <TextArea rows={2} placeholder="请输入打卡点说明" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  icon={<EnvironmentOutlined />} 
                  onClick={getCurrentLocation}
                  loading={locationLoading}
                >
                  {locationLoading ? "定位中..." : "获取当前位置"}
                </Button>
                
                {currentLocation && (
                  <div style={{ marginTop: 10 }}>
                    <Tag color="blue">
                      纬度: {currentLocation.latitude.toFixed(6)}
                    </Tag>
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      经度: {currentLocation.longitude.toFixed(6)}
                    </Tag>
                  </div>
                )}
              </div>
              
              <Form.Item
                name="photo"
                label="打卡点照片"
              >
                <Upload {...uploadProps}>
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传照片</div>
                  </div>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              添加打卡点
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      <Card title="打卡点列表" style={{ marginTop: 20 }}>
        <Table
          dataSource={checkPoints}
          columns={[
            {
              title: "名称",
              dataIndex: "name",
              key: "name",
            },
            {
              title: "纬度",
              dataIndex: "latitude",
              key: "latitude",
              render: (text: number) => text.toFixed(6),
            },
            {
              title: "经度",
              dataIndex: "longitude",
              key: "longitude",
              render: (text: number) => text.toFixed(6),
            },
            {
              title: "描述",
              dataIndex: "description",
              key: "description",
            },
            {
              title: "创建时间",
              dataIndex: "createdAt",
              key: "createdAt",
            },
            {
              title: "操作",
              key: "action",
              render: (_, record) => (
                <Space>
                  <Button 
                    size="small" 
                    onClick={() => {
                      // 可以在这里添加编辑功能
                    }}
                  >
                    编辑
                  </Button>
                  <Button 
                    size="small" 
                    danger 
                    onClick={() => handleDeleteCheckpoint(record.id)}
                  >
                    删除
                  </Button>
                </Space>
              ),
            },
          ]}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default CheckPointReporting;
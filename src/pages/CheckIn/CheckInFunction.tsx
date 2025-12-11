import React, { useState } from "react";
import {
  Button,
  Card,
  Input,
  Form,
  message,
  Upload,
  Descriptions,
  Tag,
  Select,
  Space,
} from "antd";
import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";
import { CheckPoint, CheckInRecord } from "./types";

interface CheckInFunctionProps {
  checkPoints: CheckPoint[];
  onCheckIn: (record: CheckInRecord) => void;
  selectedCheckpoint: CheckPoint | null;
  onSelectCheckpoint: (checkpoint: CheckPoint | null) => void;
}

const { TextArea } = Input;
const { Option } = Select;

const CheckInFunction: React.FC<CheckInFunctionProps> = ({
  checkPoints,
  onCheckIn,
  selectedCheckpoint,
  onSelectCheckpoint,
}) => {
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [remark, setRemark] = useState("");
  const [photoList, setPhotoList] = useState<any[]>([]);

  // 获取当前位置
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    // 检查是否在Android WebView环境中
    const isAndroidWebView = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android/i.test(userAgent) && /wv/i.test(userAgent);
    };

    // 检查是否在iOS WebView环境中
    const isIOSWebView = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /iPhone|iPad|iPod/i.test(userAgent) && !/Safari/i.test(userAgent);
    };

    // Android WebView特殊处理
    if (isAndroidWebView() && (window as any).AndroidLocation) {
      try {
        // 使用回调方式调用
        (window as any).handleAndroidLocation = (result: any) => {
          if (result && result.latitude && result.longitude) {
            setCurrentLocation({
              latitude: parseFloat(result.latitude),
              longitude: parseFloat(result.longitude),
              accuracy: result.accuracy ? parseFloat(result.accuracy) : 10,
            });
            setLocationLoading(false);
            message.success("Android定位成功！");
          } else {
            message.error("Android定位返回无效数据");
            setLocationLoading(false);
          }
          
          // 清理回调函数
          setTimeout(() => {
            delete (window as any).handleAndroidLocation;
          }, 1000);
        };
        
        // 调用Android方法
        (window as any).AndroidLocation.requestLocation();
        
        // 设置超时处理
        setTimeout(() => {
          if ((window as any).handleAndroidLocation) {
            setLocationLoading(false);
            message.error("Android定位超时");
            delete (window as any).handleAndroidLocation;
          }
        }, 15000);
      } catch (err) {
        console.log("调用Android定位异常:", err);
        // 回退到浏览器API
        getLocationUsingBrowserAPI();
      }
    } else {
      // 使用浏览器API获取位置
      getLocationUsingBrowserAPI();
    }
  };

  // 使用浏览器API获取位置
  const getLocationUsingBrowserAPI = () => {
    if (!navigator.geolocation) {
      message.error("您的浏览器不支持地理定位功能");
      setLocationLoading(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
        });
        setLocationLoading(false);
        message.success("定位成功");
      },
      (error) => {
        console.log("定位失败:", error);
        setLocationLoading(false);
        message.error("定位失败，请检查位置权限设置");
      },
      options
    );
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

  // 执行打卡
  const handleCheckIn = () => {
    if (!currentLocation) {
      message.error("请先获取当前位置");
      return;
    }
    
    if (!selectedCheckpoint) {
      message.error("请选择打卡点");
      return;
    }
    
    setLoading(true);
    
    // 模拟打卡过程
    setTimeout(() => {
      const distance = Math.random() * 100; // 模拟距离
      
      const newRecord: CheckInRecord = {
        id: Date.now().toString(),
        checkpointId: selectedCheckpoint.id,
        checkpointName: selectedCheckpoint.name,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        checkTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        remark: remark,
        photoUrls: photoList.map(file => file.url || file.thumbUrl).filter(Boolean),
        status: distance <= 100 ? "success" : "failed", // 假设100米为范围限制
        distance: distance,
      };
      
      onCheckIn(newRecord);
      setLoading(false);
      
      if (newRecord.status === "success") {
        message.success("打卡成功！");
      } else {
        message.error(`打卡失败！您距离打卡点 ${Math.round(distance)} 米，超出范围`);
      }
    }, 1500);
  };

  return (
    <div>
      <Card title="执行打卡">
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <Form.Item label="选择打卡点">
              <Select
                placeholder="请选择打卡点"
                value={selectedCheckpoint?.id || undefined}
                onChange={(value) => {
                  const checkpoint = checkPoints.find(p => p.id === value);
                  onSelectCheckpoint(checkpoint || null);
                }}
              >
                {checkPoints.map(point => (
                  <Option key={point.id} value={point.id}>
                    {point.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
          <div>
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
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="纬度">
                    {currentLocation.latitude.toFixed(6)}
                  </Descriptions.Item>
                  <Descriptions.Item label="经度">
                    {currentLocation.longitude.toFixed(6)}
                  </Descriptions.Item>
                  <Descriptions.Item label="精度">
                    {currentLocation.accuracy.toFixed(2)} 米
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </div>
          
          <div>
            <Form.Item label="打卡备注">
              <TextArea 
                rows={3} 
                placeholder="请输入打卡备注（可选）" 
                value={remark}
                onChange={e => setRemark(e.target.value)}
              />
            </Form.Item>
          </div>
          
          <div>
            <Form.Item label="打卡照片">
              <Upload {...uploadProps}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传照片</div>
                </div>
              </Upload>
            </Form.Item>
          </div>
          
          <div>
            <Button 
              type="primary" 
              size="large" 
              icon={<CheckCircleOutlined />}
              onClick={handleCheckIn}
              loading={loading}
              disabled={!currentLocation || !selectedCheckpoint}
            >
              执行打卡
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default CheckInFunction;
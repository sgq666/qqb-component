import React, { useState } from "react";
import { Button, Card, message, Tag } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

const TestLocation: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // 获取当前位置
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    // 检查是否在Android WebView环境中
    const isAndroidWebView = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android/i.test(userAgent) && /wv/i.test(userAgent);
    };

    // Android WebView特殊处理
    if (isAndroidWebView() && (window as any).AndroidLocation) {
      try {
        // 使用回调方式调用
        (window as any).handleAndroidLocation = (result: any) => {
          if (result && result.latitude && result.longitude) {
            const location = {
              latitude: parseFloat(result.latitude),
              longitude: parseFloat(result.longitude),
            };
            setCurrentLocation(location);
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
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(location);
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

  return (
    <div style={{ padding: "20px" }}>
      <Card title="位置获取测试">
        <Button 
          type="primary" 
          icon={<EnvironmentOutlined />} 
          onClick={getCurrentLocation}
          loading={locationLoading}
        >
          {locationLoading ? "定位中..." : "获取当前位置"}
        </Button>
        
        {currentLocation && (
          <div style={{ marginTop: 20 }}>
            <h3>当前位置信息：</h3>
            <Tag color="blue">
              纬度: {currentLocation.latitude.toFixed(6)}
            </Tag>
            <br />
            <Tag color="blue" style={{ marginTop: 8 }}>
              经度: {currentLocation.longitude.toFixed(6)}
            </Tag>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TestLocation;
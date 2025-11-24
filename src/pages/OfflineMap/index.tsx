import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Spin, Typography, Space, Divider } from 'antd';
import { EnvironmentOutlined, CompassOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 修复 Leaflet 默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
  iconUrl: require('leaflet/dist/images/marker-icon.png').default,
  shadowUrl: require('leaflet/dist/images/marker-shadow.png').default,
});

const { Title, Text } = Typography;

// 定义坐标信息的接口
interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

// 定义位置信息的接口
interface LocationInfo {
  timestamp: number;
  coords: Coordinates;
}

const OfflineMapPage: React.FC = () => {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.5, 110.0]); // 海南省中心位置

  // 检查是否在Android WebView环境中
  const isAndroidWebView = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android/i.test(userAgent) && /wv/i.test(userAgent);
  };

  // 获取当前位置
  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    // 检查浏览器是否支持地理定位
    if (!navigator.geolocation) {
      setError('您的浏览器不支持地理定位功能');
      setLoading(false);
      return;
    }

    // 选项配置
    const options: PositionOptions = {
      enableHighAccuracy: true, // 启用高精度
      timeout: 10000,           // 超时时间10秒
      maximumAge: 300000        // 缓存时间5分钟
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 转换位置信息格式
        const locationInfo: LocationInfo = {
          timestamp: position.timestamp,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          }
        };
        setLocation(locationInfo);
        setMapCenter([position.coords.latitude, position.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleError(err);
      },
      options
    );
  };

  // 处理错误
  const handleError = (error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError('用户拒绝了地理定位请求');
        setPermissionDenied(true);
        break;
      case error.POSITION_UNAVAILABLE:
        setError('位置信息不可用');
        break;
      case error.TIMEOUT:
        setError('获取位置信息超时');
        break;
      default:
        setError(`获取位置时发生未知错误: ${error.message}`);
        break;
    }
  };

  // Android WebView特殊处理
  const handleAndroidWebView = () => {
    // 这里可以调用Android原生方法获取位置
    // 示例：如果Android注入了window.AndroidLocation对象
    if ((window as any).AndroidLocation && typeof (window as any).AndroidLocation.getLocation === 'function') {
      setLoading(true);
      setError(null);
      
      try {
        (window as any).AndroidLocation.getLocation()
          .then((result: any) => {
            setLoading(false);
            if (result && result.latitude && result.longitude) {
              // 模拟位置信息对象
              const locationInfo: LocationInfo = {
                timestamp: Date.now(),
                coords: {
                  latitude: result.latitude,
                  longitude: result.longitude,
                  accuracy: result.accuracy || 0,
                  altitude: result.altitude || null,
                  altitudeAccuracy: result.altitudeAccuracy || null,
                  heading: result.heading || null,
                  speed: result.speed || null
                }
              };
              setLocation(locationInfo);
              setMapCenter([result.latitude, result.longitude]);
            } else {
              setError('Android原生定位返回无效数据');
            }
          })
          .catch((err: any) => {
            setLoading(false);
            setError(`Android原生定位失败: ${err.message || err}`);
          });
      } catch (err) {
        setLoading(false);
        setError(`调用Android原生定位异常: ${(err as Error).message}`);
      }
    } else {
      setError('未检测到Android原生定位接口，请在Android App中打开此页面');
    }
  };

  // 根据环境选择定位方式
  const getLocationByEnvironment = () => {
    if (isAndroidWebView()) {
      handleAndroidWebView();
    } else {
      getCurrentLocation();
    }
  };

  // 格式化坐标显示
  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  // 格式化方向显示
  const formatHeading = (heading: number | null): string => {
    if (heading === null) return '未知';
    if (heading >= 337.5 || heading < 22.5) return '北';
    if (heading >= 22.5 && heading < 67.5) return '东北';
    if (heading >= 67.5 && heading < 112.5) return '东';
    if (heading >= 112.5 && heading < 157.5) return '东南';
    if (heading >= 157.5 && heading < 202.5) return '南';
    if (heading >= 202.5 && heading < 247.5) return '西南';
    if (heading >= 247.5 && heading < 292.5) return '西';
    return '西北';
  };

  // 格式化速度显示
  const formatSpeed = (speed: number | null): string => {
    if (speed === null) return '静止';
    return `${speed.toFixed(2)} 米/秒`;
  };

  useEffect(() => {
    // 组件加载时自动获取位置
    // getLocationByEnvironment();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>
            <EnvironmentOutlined /> 海南省离线地图
          </Title>
          
          <Alert
            message="说明"
            description="此页面展示海南省离线地图，兼容Android App内嵌H5环境。地图数据存储在本地，无需网络连接。"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
          
          {isAndroidWebView() && (
            <Alert
              message="检测到Android WebView环境"
              description="当前页面在Android App中打开，将尝试调用原生定位功能。"
              type="success"
              showIcon
              icon={<CompassOutlined />}
            />
          )}
          
          {error && (
            <Alert
              message="错误"
              description={error}
              type="error"
              showIcon
            />
          )}
          
          {permissionDenied && (
            <Alert
              message="权限被拒绝"
              description={
                <>
                  <div>请按以下步骤授予权限：</div>
                  <div>1. 在浏览器设置中找到网站权限设置</div>
                  <div>2. 找到当前网站并允许位置访问</div>
                  <div>3. 刷新页面并重新尝试</div>
                  {isAndroidWebView() && (
                    <div>4. 检查App的位置权限是否已开启</div>
                  )}
                </>
              }
              type="warning"
              showIcon
            />
          )}
          
          <div style={{ textAlign: 'center' }}>
            <Button 
              type="primary" 
              size="large" 
              onClick={getLocationByEnvironment}
              loading={loading}
              icon={<EnvironmentOutlined />}
            >
              {loading ? '正在获取位置...' : '获取当前位置'}
            </Button>
          </div>
          
          {loading && (
            <div style={{ textAlign: 'center' }}>
              <Spin size="large" tip="正在获取位置信息..." />
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* 左侧信息面板 */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              {location && (
                <Card title="位置信息" type="inner">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ 
                      backgroundColor: '#f0f2f5', 
                      padding: '20px', 
                      borderRadius: '8px',
                      textAlign: 'center',
                      marginBottom: '20px'
                    }}>
                      <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        <EnvironmentOutlined /> 当前位置坐标
                      </Title>
                      <Divider style={{ margin: '12px 0' }} />
                      <Title level={3} style={{ margin: '10px 0', color: '#52c41a' }}>
                        {formatCoordinate(location.coords.latitude)}, {formatCoordinate(location.coords.longitude)}
                      </Title>
                    </div>
                    
                    <Card size="small" title="详细信息" style={{ marginBottom: '20px' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text><strong>纬度:</strong> {formatCoordinate(location.coords.latitude)}</Text>
                        <Text><strong>经度:</strong> {formatCoordinate(location.coords.longitude)}</Text>
                        <Text><strong>精度:</strong> {location.coords.accuracy !== null ? `${location.coords.accuracy} 米` : '未知'}</Text>
                        {location.coords.altitude !== null && (
                          <Text><strong>海拔:</strong> {location.coords.altitude.toFixed(2)} 米</Text>
                        )}
                        {location.coords.altitudeAccuracy !== null && (
                          <Text><strong>海拔精度:</strong> {location.coords.altitudeAccuracy} 米</Text>
                        )}
                        <Text><strong>方向:</strong> {formatHeading(location.coords.heading)}</Text>
                        <Text><strong>速度:</strong> {formatSpeed(location.coords.speed)}</Text>
                        <Text><strong>获取时间:</strong> {new Date(location.timestamp).toLocaleString()}</Text>
                      </Space>
                    </Card>
                    
                    <Card size="small" title="海南省主要城市" type="inner">
                      <Space direction="vertical">
                        <Text>• 海口市 - 省会城市</Text>
                        <Text>• 三亚市 - 热带滨海旅游城市</Text>
                        <Text>• 儋州市 - 海南西部中心城市</Text>
                        <Text>• 琼海市 - 博鳌亚洲论坛永久会址所在地</Text>
                        <Text>• 文昌市 - 航天发射基地</Text>
                      </Space>
                    </Card>
                  </Space>
                </Card>
              )}
              
              {!location && !loading && (
                <Card title="使用说明" type="inner">
                  <Space direction="vertical">
                    <Text>1. 点击"获取当前位置"按钮开始定位</Text>
                    <Text>2. 浏览器会提示您是否允许访问位置信息，请点击"允许"</Text>
                    <Text>3. 在Android App中，需要授予App位置权限</Text>
                    <Text>4. 定位成功后会显示坐标信息和海南省地图</Text>
                    <Text>5. 地图使用本地存储的数据，无需网络连接</Text>
                    <Text>6. 如果您已放置MBTiles文件，请确保它位于 public/tiles/ 目录下</Text>
                  </Space>
                </Card>
              )}
            </div>
            
            {/* 右侧地图区域 */}
            <div style={{ flex: 2, minWidth: '500px', height: '600px' }}>
              <Card title="海南省地图" type="inner" style={{ height: '100%' }}>
                <div style={{ height: 'calc(100% - 40px)' }}>
                  <MapContainer 
                    center={mapCenter} 
                    zoom={8} 
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                  >
                    <TileLayer
                      url="/tiles/{z}/{x}/{y}.svg"
                      errorTileUrl="/tiles/error.png"
                    />
                    {location && (
                      <Marker position={[location.coords.latitude, location.coords.longitude]}>
                        <Popup>
                          <div>
                            <strong>当前位置</strong><br />
                            纬度: {formatCoordinate(location.coords.latitude)}<br />
                            经度: {formatCoordinate(location.coords.longitude)}<br />
                            时间: {new Date(location.timestamp).toLocaleString()}
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </Card>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default OfflineMapPage;
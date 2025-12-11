import React, { useState } from "react";
import {
  Button,
  Card,
  Alert,
  Spin,
  Typography,
  Space,
  InputNumber,
  Form,
  Row,
  Col,
  message,
  Descriptions,
} from "antd";
import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentFilled,
} from "@ant-design/icons";

const { Title, Text } = Typography;

// 定义坐标信息的接口
interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

// 定义位置信息的接口
interface LocationInfo {
  timestamp: number;
  coords: Coordinates;
}

const CheckInPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null);
  const [checkPoint, setCheckPoint] = useState<{ lat: number; lng: number }>({
    lat: 19.5,
    lng: 110.0,
  }); // 默认打卡点
  const [distance, setDistance] = useState<number>(100); // 默认打卡距离100米
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [checkedIn, setCheckedIn] = useState<boolean>(false);
  const [distanceToCheckPoint, setDistanceToCheckPoint] = useState<
    number | null
  >(null);

  // 检查是否在Android WebView环境中
  const isAndroidWebView = () => {
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android/i.test(userAgent) && /wv/i.test(userAgent);
  };

  // 检查是否在iOS WebView环境中
  const isIOSWebView = () => {
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    return /iPhone|iPad|iPod/i.test(userAgent) && !/Safari/i.test(userAgent);
  };

  // 检查并请求定位权限
  const requestLocationPermission = async () => {
    console.log("检查定位权限状态...");

    // 检查是否在安全上下文中（HTTPS）
    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      console.log("非安全上下文，地理位置API可能受限");
      // 在非HTTPS环境下给出警告，但仍继续尝试
      message.warning("当前页面不在HTTPS环境下，地理位置功能可能受限");
    }

    // 现代浏览器的权限API检查
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permissionStatus = await navigator.permissions.query({
          name: "geolocation",
        });
        console.log("权限状态:", permissionStatus.state);

        if (permissionStatus.state === "granted") {
          console.log("定位权限已授予");
          return true;
        } else if (permissionStatus.state === "denied") {
          console.log("定位权限已被拒绝");
          setError(
            "定位权限已被拒绝。请在浏览器设置中为当前网站开启位置权限，然后刷新页面重试。\n提示：某些浏览器需要通过地址栏的🔒图标来管理权限。"
          );
          setLoading(false);
          return false;
        } else if (permissionStatus.state === "prompt") {
          console.log("需要用户授权定位权限");
          // 权限状态为prompt，需要用户交互触发
          return true;
        }
      } catch (err) {
        console.log("权限检查失败:", err);
        // 在某些浏览器中权限API可能不可用，继续执行定位
        console.log("权限API不可用，将继续尝试定位");
        return true;
      }
    }

    // 如果权限API不可用，继续执行定位
    return true;
  };

  // 获取当前位置 - 根据环境选择合适的方法
  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);
    setUserLocation(null); // 清除之前的位置信息

    console.log("开始获取位置，检测环境...");
    console.log("当前协议:", window.location.protocol);
    console.log("当前主机名:", window.location.hostname);
    console.log("User Agent:", navigator.userAgent);

    // 先检查权限
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return;
    }

    // 根据不同环境选择不同的定位方式
    if (isAndroidWebView()) {
      console.log("检测到Android WebView环境");
      // Android WebView环境
      if (!handleAndroidWebView()) {
        console.log("Android原生方法不可用，尝试简化版定位");
        // 如果Android原生方法不可用，尝试简化版定位
        getCurrentLocationSimple();
      }
    } else if (isIOSWebView()) {
      console.log("检测到iOS WebView环境");
      // iOS WebView环境
      if (!handleIOSWebView()) {
        console.log("iOS原生方法不可用，尝试简化版定位");
        // 如果iOS原生方法不可用，尝试简化版定位
        getCurrentLocationSimple();
      }
    } else {
      console.log("使用简化版定位方法");
      // 标准浏览器环境也使用简化版以提高兼容性
      getCurrentLocationSimple();
    }
  };

  // Android WebView特殊处理
  const handleAndroidWebView = () => {
    // 尝试调用Android原生方法获取位置
    // 注意：这需要在Android端注入相应的JavaScript接口

    // 首先检查是否存在Android接口
    if (!(window as any).AndroidLocation) {
      console.log("未检测到Android定位接口");
      return false;
    }

    try {
      console.log("尝试调用Android原生定位接口");
      
      // 检查是否存在异步方法
      if (typeof (window as any).AndroidLocation.getLocation === "function") {
        // 使用Promise方式调用
        (window as any).AndroidLocation.getLocation()
          .then((result: any) => {
            console.log("Android定位成功返回:", result);
            handleAndroidLocationResult(result);
          })
          .catch((err: any) => {
            console.log("Android定位失败:", err);
            setLoading(false);
            setError(`Android原生定位失败: ${err.message || err}`);
          });
      } else {
        // 使用回调方式调用
        // 设置全局回调函数等待Android返回结果
        (window as any).handleAndroidLocation = (result: any) => {
          console.log("Android定位成功返回(回调方式):", result);
          handleAndroidLocationResult(result);
          
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
            setLoading(false);
            setError("Android原生定位超时");
            delete (window as any).handleAndroidLocation;
          }
        }, 20000);
      }
    } catch (err) {
      console.log("调用Android原生定位异常:", err);
      setLoading(false);
      setError(`调用Android原生定位异常: ${(err as Error).message}`);
      return false;
    }

    return true;
  };

  // 处理Android定位结果
  const handleAndroidLocationResult = (result: any) => {
    setLoading(false);
    if (result && result.latitude && result.longitude) {
      // 构造位置信息对象
      const locationInfo: LocationInfo = {
        timestamp: result.timestamp || Date.now(),
        coords: {
          latitude: parseFloat(result.latitude),
          longitude: parseFloat(result.longitude),
          accuracy: result.accuracy ? parseFloat(result.accuracy) : null,
        },
      };
      setUserLocation(locationInfo);

      // 计算距离打卡点的距离
      calculateDistanceToCheckPoint(parseFloat(result.latitude), parseFloat(result.longitude));
      
      message.success("Android原生定位成功！");
    } else {
      setError("Android原生定位返回无效数据");
    }
  };

  // iOS WebView特殊处理
  const handleIOSWebView = () => {
    // 尝试调用iOS原生方法获取位置
    // 注意：这需要在iOS端注入相应的JavaScript接口

    // 首先检查是否存在iOS接口
    if (
      !(window as any).webkit ||
      !(window as any).webkit.messageHandlers ||
      !(window as any).webkit.messageHandlers.getLocation
    ) {
      console.log("未检测到iOS定位接口，回退到标准API");
      return false;
    }

    try {
      console.log("尝试调用iOS原生定位接口");
      // 发送消息到iOS原生代码
      (window as any).webkit.messageHandlers.getLocation.postMessage({});

      // 设置一个全局回调函数供iOS原生代码调用
      (window as any).handleIOSLocation = (result: any) => {
        console.log("iOS定位成功返回:", result);
        setLoading(false);
        if (result && result.latitude && result.longitude) {
          // 模拟位置信息对象
          const locationInfo: LocationInfo = {
            timestamp: Date.now(),
            coords: {
              latitude: result.latitude,
              longitude: result.longitude,
              accuracy: result.accuracy || 0,
            },
          };
          setUserLocation(locationInfo);

          // 计算距离打卡点的距离
          calculateDistanceToCheckPoint(result.latitude, result.longitude);
        } else {
          setError("iOS原生定位返回无效数据");
        }

        // 清理回调函数
        setTimeout(() => {
          delete (window as any).handleIOSLocation;
        }, 1000);
      };

      // 设置超时处理
      setTimeout(() => {
        if ((window as any).handleIOSLocation) {
          setLoading(false);
          setError("iOS原生定位超时");
          delete (window as any).handleIOSLocation;
        }
      }, 15000);
    } catch (err) {
      console.log("调用iOS原生定位异常:", err);
      setLoading(false);
      setError(`调用iOS原生定位异常: ${(err as Error).message}`);
      return false;
    }

    return true;
  };

  // 简化版定位方法，适用于移动端
  const getCurrentLocationSimple = async () => {
    console.log("尝试使用简化版定位方法");

    // 先检查权限
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return;
    }

    // 检查浏览器是否支持地理定位
    if (!navigator.geolocation) {
      setError(
        "您的浏览器不支持地理定位功能。请尝试更换其他浏览器或更新当前浏览器。"
      );
      setLoading(false);
      return;
    }

    // 简化选项配置，降低精度要求以提高成功率
    const options: PositionOptions = {
      enableHighAccuracy: false, // 关闭高精度以加快定位
      timeout: 30000, // 超时时间30秒
      maximumAge: 600000, // 10分钟内的缓存都可以接受
    };

    console.log("开始请求地理位置...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("定位成功:", position);
        // 转换位置信息格式
        const locationInfo: LocationInfo = {
          timestamp: position.timestamp,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        };
        setUserLocation(locationInfo);
        setLoading(false);

        // 计算距离打卡点的距离
        calculateDistanceToCheckPoint(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      (err) => {
        console.log("定位失败详情:", err);
        setLoading(false);

        // 特别处理权限拒绝的情况
        if (err.code === err.PERMISSION_DENIED) {
          setError(`定位权限被拒绝。
请按以下步骤操作：
1. 点击浏览器地址栏左侧的🔒图标
2. 找到"位置"权限并设置为"允许"
3. 刷新页面后重试
4. 如果问题持续存在，请重启浏览器`);
          setPermissionDenied(true);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError(`位置信息不可用。
请检查：
1. 手机GPS是否已开启
2. 是否在室内导致信号不良
3. 浏览器位置权限是否已开启`);
        } else if (err.code === err.TIMEOUT) {
          setError(`定位请求超时。
请尝试：
1. 检查网络连接
2. 到开阔地带重试
3. 重启手机的定位服务`);
        } else {
          setError(`定位失败：${err.message}\n请检查位置权限设置或稍后重试`);
        }
      },
      options
    );
  };

  // 处理错误
  const handleError = (error: GeolocationPositionError) => {
    console.log("定位错误详情:", error);

    switch (error.code) {
      case error.PERMISSION_DENIED:
        // 在移动端给出更具体的指导
        if (isAndroidWebView() || isIOSWebView()) {
          setError(
            "定位权限被拒绝。请在手机设置中为当前App开启位置权限，然后下拉刷新页面重试。"
          );
        } else {
          setError("用户拒绝了地理定位请求。请检查浏览器的位置权限设置。");
        }
        setPermissionDenied(true);
        break;
      case error.POSITION_UNAVAILABLE:
        setError("位置信息不可用，请确保手机GPS功能已开启");
        break;
      case error.TIMEOUT:
        setError("获取位置信息超时，请在网络良好的环境下重试");
        break;
      default:
        setError(`获取位置时发生未知错误: ${error.message}`);
        break;
    }

    setLoading(false);
  };

  // 计算用户到打卡点的距离（单位：米）
  const calculateDistanceToCheckPoint = (
    userLat: number,
    userLng: number
  ): number | null => {
    if (!checkPoint) return null;

    // 使用Haversine公式计算两点间距离
    const R = 6371e3; // 地球半径（米）
    const φ1 = (userLat * Math.PI) / 180; // φ, λ in radians
    const φ2 = (checkPoint.lat * Math.PI) / 180;
    const Δφ = ((checkPoint.lat - userLat) * Math.PI) / 180;
    const Δλ = ((checkPoint.lng - userLng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // 距离（米）
    setDistanceToCheckPoint(d);

    return d;
  };

  // 计算用户相对于打卡点的方位
  const calculateBearing = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): string => {
    // 将角度转换为弧度
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    // 计算方位角
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    const bearing = ((θ * 180) / Math.PI + 360) % 360;

    // 根据方位角确定方位
    if (bearing >= 337.5 || bearing < 22.5) return "北";
    if (bearing >= 22.5 && bearing < 67.5) return "东北";
    if (bearing >= 67.5 && bearing < 112.5) return "东";
    if (bearing >= 112.5 && bearing < 157.5) return "东南";
    if (bearing >= 157.5 && bearing < 202.5) return "南";
    if (bearing >= 202.5 && bearing < 247.5) return "西南";
    if (bearing >= 247.5 && bearing < 292.5) return "西";
    return "西北";
  };

  // 根据距离和方位调整用户点在图示中的位置
  const getPositionStyle = (distance: number, bearing: string) => {
    // 根据方位确定用户点的位置
    const maxRadius = 70; // 最大显示半径
    const normalizedDistance = Math.min(distance / 100, 1); // 简单归一化距离
    const radius = normalizedDistance * maxRadius;

    let topPercent = 50;
    let leftPercent = 50;

    switch (bearing) {
      case "北":
        topPercent = 50 - radius;
        leftPercent = 50;
        break;
      case "东北":
        topPercent = 50 - radius * 0.7;
        leftPercent = 50 + radius * 0.7;
        break;
      case "东":
        topPercent = 50;
        leftPercent = 50 + radius;
        break;
      case "东南":
        topPercent = 50 + radius * 0.7;
        leftPercent = 50 + radius * 0.7;
        break;
      case "南":
        topPercent = 50 + radius;
        leftPercent = 50;
        break;
      case "西南":
        topPercent = 50 + radius * 0.7;
        leftPercent = 50 - radius * 0.7;
        break;
      case "西":
        topPercent = 50;
        leftPercent = 50 - radius;
        break;
      case "西北":
        topPercent = 50 - radius * 0.7;
        leftPercent = 50 - radius * 0.7;
        break;
    }

    return {
      top: `${topPercent}%`,
      left: `${leftPercent}%`,
      transform: "translate(-50%, -50%)",
      zIndex: 2,
    };
  };

  // 执行打卡操作
  const handleCheckIn = () => {
    if (!userLocation) {
      message.error("请先获取当前位置");
      return;
    }

    const dist = calculateDistanceToCheckPoint(
      userLocation.coords.latitude,
      userLocation.coords.longitude
    );

    if (dist !== null && dist <= distance) {
      setCheckedIn(true);
      message.success("打卡成功！");
    } else {
      message.error(
        `打卡失败！您距离打卡点 ${Math.round(
          dist || 0
        )} 米，超出 ${distance} 米范围`
      );
    }
  };

  // 更新打卡点
  const updateCheckPoint = (lat: number | null, lng: number | null) => {
    if (lat !== null && lng !== null) {
      setCheckPoint({ lat, lng });
    }
  };

  // 格式化坐标显示
  const formatCoordinate = (coord: number): string => {
    return coord.toFixed(6);
  };

  // 渲染位置关系图
  const renderLocationDiagram = () => {
    if (!userLocation) {
      return (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">获取位置后将显示位置关系图</Text>
        </div>
      );
    }

    // 计算用户相对于打卡点的方位
    const bearing = calculateBearing(
      checkPoint.lat,
      checkPoint.lng,
      userLocation.coords.latitude,
      userLocation.coords.longitude
    );

    const inRange =
      distanceToCheckPoint !== null && distanceToCheckPoint <= distance;

    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div
          style={{
            position: "relative",
            height: "250px",
            maxWidth: "500px",
            margin: "0 auto",
          }}
        >
          {/* 方向指示 */}
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "12px",
              color: "#999",
            }}
          >
            北
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              right: "0",
              transform: "translateY(-50%)",
              fontSize: "12px",
              color: "#999",
            }}
          >
            东
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "12px",
              color: "#999",
            }}
          >
            南
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "0",
              transform: "translateY(-50%)",
              fontSize: "12px",
              color: "#999",
            }}
          >
            西
          </div>

          {/* 打卡范围圆 */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              border: `2px dashed ${inRange ? "#52c41a" : "#ff4d4f"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <EnvironmentFilled
                style={{
                  fontSize: "24px",
                  color: "#1890ff",
                  marginBottom: "5px",
                }}
              />
              <div style={{ fontSize: "12px", color: "#666" }}>打卡点</div>
              <div style={{ fontSize: "10px", color: "#999" }}>
                ({formatCoordinate(checkPoint.lat)},{" "}
                {formatCoordinate(checkPoint.lng)})
              </div>
            </div>
          </div>

          {/* 用户位置点 - 根据真实方位调整位置 */}
          <div style={getPositionStyle(distanceToCheckPoint || 0, bearing)}>
            <div style={{ textAlign: "center" }}>
              <UserOutlined
                style={{
                  fontSize: "24px",
                  color: inRange ? "#52c41a" : "#ff4d4f",
                  marginBottom: "5px",
                }}
              />
              <div style={{ fontSize: "12px", color: "#666" }}>您的位置</div>
              <div style={{ fontSize: "10px", color: "#999" }}>
                ({formatCoordinate(userLocation.coords.latitude)},{" "}
                {formatCoordinate(userLocation.coords.longitude)})
              </div>
              <div
                style={{ fontSize: "10px", color: "#999", marginTop: "2px" }}
              >
                {bearing} {Math.round(distanceToCheckPoint || 0)}米
              </div>
            </div>
          </div>
        </div>

        {/* 距离和状态信息 */}
        <div style={{ marginTop: "20px" }}>
          <Card size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="距离打卡点">
                {distanceToCheckPoint !== null
                  ? `${Math.round(distanceToCheckPoint)} 米`
                  : "计算中..."}
              </Descriptions.Item>
              <Descriptions.Item label="相对方位">{bearing}</Descriptions.Item>
              <Descriptions.Item label="打卡范围">
                {distance} 米
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {distanceToCheckPoint !== null ? (
                  inRange ? (
                    <Text type="success">
                      <CheckCircleOutlined /> 在范围内，可以打卡
                    </Text>
                  ) : (
                    <Text type="danger">
                      <ClockCircleOutlined /> 超出范围，无法打卡
                    </Text>
                  )
                ) : (
                  "计算中..."
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2}>
            <CheckCircleOutlined /> 打卡签到系统
          </Title>
          
          {(isAndroidWebView() || isIOSWebView()) && (
            <Alert
              message="移动端使用提示"
              description={
                <div>
                  <div>检测到您正在使用移动设备访问此页面。</div>
                  <div style={{ marginTop: '5px' }}><strong>重要提示：</strong>首次使用定位功能时，需要您主动点击"获取当前位置"按钮来触发权限请求。</div>
                  <div style={{ marginTop: '5px' }}><strong>Android用户请注意：</strong>如果当前页面通过App内置WebView访问，系统将自动调用App原生定位功能，无需浏览器权限。</div>
                  <div style={{ marginTop: '5px' }}>如果遇到问题，请检查：</div>
                  <div>1. 手机设置中是否为当前App开启了位置权限</div>
                  <div>2. 手机GPS功能是否已开启</div>
                  <div>3. 必要时可尝试重启App</div>
                </div>
              }
              type="info"
              showIcon
            />
          )}

          <Alert
            message="使用说明"
            description="请先设置打卡点坐标和允许的最大距离，然后获取当前位置进行打卡签到。"
            type="info"
            showIcon
          />

          {error && (
            <Alert
              message="定位错误"
              description={
                <div>
                  <div>{error}</div>
                  {(isAndroidWebView() || isIOSWebView()) && (
                    <div
                      style={{
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: "1px solid #f0f0f0",
                      }}
                    >
                      <strong>移动端定位问题解决方法：</strong>
                      <div>1. 检查手机设置中是否为当前App开启了位置权限</div>
                      <div>2. 确保手机GPS功能已开启</div>
                      <div>3. 下拉刷新页面后重试</div>
                      <div>4. 如仍无法定位，可尝试重启App</div>
                    </div>
                  )}
                </div>
              }
              type="error"
              showIcon
            />
          )}

          {permissionDenied && (
            <Alert
              message="权限被拒绝"
              description={
                <>
                  <div>定位权限被拒绝，请按以下步骤解决：</div>
                  <div>1. 在手机设置中找到当前App</div>
                  <div>2. 开启位置权限（部分手机需要选择"始终允许"）</div>
                  <div>3. 重新打开页面并点击"获取当前位置"按钮</div>
                  <div>4. 当系统弹出权限请求时，选择"允许"</div>
                  {(isAndroidWebView() || isIOSWebView()) && (
                    <div>5. 如未看到权限请求弹窗，尝试重启App后再试</div>
                  )}
                </>
              }
              type="warning"
              showIcon
            />
          )}

          <Card title="打卡设置" type="inner">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="打卡点纬度">
                    <InputNumber
                      value={checkPoint.lat}
                      onChange={(value) =>
                        updateCheckPoint(value, checkPoint.lng)
                      }
                      style={{ width: "100%" }}
                      step={0.000001}
                      precision={6}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="打卡点经度">
                    <InputNumber
                      value={checkPoint.lng}
                      onChange={(value) =>
                        updateCheckPoint(checkPoint.lat, value)
                      }
                      style={{ width: "100%" }}
                      step={0.000001}
                      precision={6}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="允许最大距离（米）">
                    <InputNumber
                      value={distance}
                      onChange={(value) => value !== null && setDistance(value)}
                      style={{ width: "100%" }}
                      min={10}
                      max={10000}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              size="large"
              onClick={getCurrentLocation}
              loading={loading}
              icon={<EnvironmentOutlined />}
              style={{ marginRight: "16px" }}
            >
              {loading ? "正在获取位置..." : "获取当前位置"}
            </Button>

            <Button
              type="primary"
              size="large"
              onClick={handleCheckIn}
              disabled={!userLocation || checkedIn}
              icon={<CheckCircleOutlined />}
            >
              {checkedIn ? "已打卡" : "打卡签到"}
            </Button>
          </div>

          {loading && (
            <div style={{ textAlign: "center" }}>
              <Spin size="large" tip="正在获取位置信息..." />
            </div>
          )}

          {checkedIn && (
            <Alert
              message="打卡成功"
              description={`您已在规定范围内完成打卡！`}
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          )}

          {/* 位置关系图示 */}
          <Card title="位置关系图示" type="inner">
            {renderLocationDiagram()}
          </Card>

          {/* 详细信息展示区域 */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* 打卡点信息 */}
            <div style={{ flex: 1, minWidth: "300px" }}>
              <Card title="打卡点信息" type="inner">
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="纬度">
                    {formatCoordinate(checkPoint.lat)}
                  </Descriptions.Item>
                  <Descriptions.Item label="经度">
                    {formatCoordinate(checkPoint.lng)}
                  </Descriptions.Item>
                  <Descriptions.Item label="允许距离">
                    {distance} 米
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>

            {/* 用户位置信息 */}
            <div style={{ flex: 1, minWidth: "300px" }}>
              {userLocation ? (
                <Card title="用户位置信息" type="inner">
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="纬度">
                      {formatCoordinate(userLocation.coords.latitude)}
                    </Descriptions.Item>
                    <Descriptions.Item label="经度">
                      {formatCoordinate(userLocation.coords.longitude)}
                    </Descriptions.Item>
                    <Descriptions.Item label="精度">
                      {userLocation.coords.accuracy !== null
                        ? `${userLocation.coords.accuracy} 米`
                        : "未知"}
                    </Descriptions.Item>
                    <Descriptions.Item label="获取时间">
                      {new Date(userLocation.timestamp).toLocaleString()}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              ) : (
                <Card title="用户位置信息" type="inner">
                  <Text type="secondary">请先获取当前位置</Text>
                </Card>
              )}
            </div>
          </div>

          {/* 使用说明 */}
          {!userLocation && !loading && (
            <Card title="使用说明" type="inner">
              <Space direction="vertical">
                <Text>
                  <ClockCircleOutlined /> 1. 设置打卡点坐标和允许的最大距离
                </Text>
                <Text>
                  <EnvironmentOutlined /> 2. 点击"获取当前位置"按钮开始定位
                </Text>
                <Text>
                  <CheckCircleOutlined /> 3.
                  App会提示您是否允许访问位置信息，请点击"允许"
                </Text>
                <Text>
                  <CheckCircleOutlined /> 4. 定位成功后点击"打卡签到"完成打卡
                </Text>
                {(isAndroidWebView() || isIOSWebView()) && (
                  <Text>
                    <CheckCircleOutlined /> 5. 移动设备需要在设置中开启位置权限
                  </Text>
                )}
              </Space>
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default CheckInPage;

/**
 * 地理位置工具类
 * 用于在iframe中与父页面通信获取设备坐标
 */

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationResult {
  coords: Coordinates;
  timestamp: number;
}

class GeolocationUtils {
  private static instance: GeolocationUtils;
  private listeners: Array<(result: LocationResult) => void> = [];
  private errorCallback: ((error: any) => void) | null = null;
  private timeoutId: number | null = null;

  private constructor() {
    // 监听来自父页面的定位结果
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  /**
   * 获取单例实例
   */
  static getInstance(): GeolocationUtils {
    if (!GeolocationUtils.instance) {
      GeolocationUtils.instance = new GeolocationUtils();
    }
    return GeolocationUtils.instance;
  }

  /**
   * 请求获取当前位置
   * @param timeout 超时时间（毫秒）
   * @returns Promise<LocationResult>
   */
  getCurrentPosition(timeout: number = 10000): Promise<LocationResult> {
    return new Promise((resolve, reject) => {
      // 设置超时
      this.timeoutId = window.setTimeout(() => {
        this.handleError({ code: -1, message: '定位超时' });
      }, timeout);

      // 添加成功回调
      this.listeners.push((result: LocationResult) => {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        resolve(result);
      });

      // 添加错误回调
      this.errorCallback = (error: any) => {
        if (this.timeoutId) {
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        reject(error);
      };

      // 发送消息到父页面请求定位
      this.requestLocationFromParent();
    });
  }

  /**
   * 发送消息到父页面请求定位
   */
  private requestLocationFromParent(): void {
    // 检查是否在iframe中
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'get_location',
        data: {}
      }, '*');
    } else {
      // 如果不在iframe中，使用浏览器原生定位
      this.fallbackToNativeGeolocation();
    }
  }

  /**
   * 处理来自父页面的消息
   * @param event MessageEvent
   */
  private handleMessage(event: MessageEvent): void {
    if (event.data && event.data.type) {
      switch (event.data.type) {
        case 'location_result':
          this.handleLocationResult(event.data.data);
          break;
        case 'location_error':
          this.handleError(event.data.data);
          break;
      }
    }
  }

  /**
   * 处理定位结果
   * @param data 定位数据
   */
  private handleLocationResult(data: any): void {
    if (this.listeners.length > 0) {
      const result: LocationResult = {
        coords: {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy
        },
        timestamp: data.timestamp || Date.now()
      };
      
      // 调用所有监听器
      this.listeners.forEach(listener => listener(result));
      
      // 清空监听器
      this.listeners = [];
      this.errorCallback = null;
    }
  }

  /**
   * 处理定位错误
   * @param error 错误信息
   */
  private handleError(error: any): void {
    if (this.errorCallback) {
      this.errorCallback(error);
      this.listeners = [];
      this.errorCallback = null;
    }
  }

  /**
   * 降级到浏览器原生定位
   */
  private fallbackToNativeGeolocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.handleLocationResult({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          this.handleError(error);
        }
      );
    } else {
      this.handleError({ code: -2, message: '浏览器不支持地理定位' });
    }
  }
}

export default GeolocationUtils.getInstance();
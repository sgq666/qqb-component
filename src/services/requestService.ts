// services/requestService.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
// 添加 crypto-js 导入
import CryptoJS from 'crypto-js';

import { message } from "antd";

class RequestService {
  private instance: AxiosInstance;
  // 定义密钥和IV
  private readonly AES_KEY = process.env.REACT_APP_DECRY_AES_KEY || "tgram7qb12345678";
  private readonly AES_IV = process.env.REACT_APP_DECRY_AES_IV || "tgram7qb12345678";
  // 从环境变量读取是否需要解密
  private readonly NEED_DECRYPT = process.env.REACT_APP_DECRY === '1';

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || "",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 从 SessionStorage 中获取 Authorization 请求头
        const authorization = sessionStorage.getItem('dxpt_Authorization');
        if (authorization) {
          config.headers.Authorization = authorization;
        }
        
        console.log("发送请求:", {
          url: config.url,
          method: config.method,
          headers: config.headers,
          data: config.data
        });
        return config;
      },
      (error: AxiosError) => {
        console.error("请求错误:", error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    // 在 requestService.ts 的响应拦截器中添加业务逻辑错误处理
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 检查业务逻辑错误
        if (response.data && response.data.code !== 200) {
          message.error(response.data.message || "请求失败");
          return Promise.reject(new Error(response.data.message || "请求失败"));
        }
      
        // 只有在环境变量REACT_APP_DECRY等于1时才对响应数据中的data字段进行解密处理
        if (this.NEED_DECRYPT && response.data && response.data.data) {
          try {
            const decryptedData = this.decryptData(response.data.data);
          
            // 尝试将解密后的字符串解析为JSON对象
            try {
              const parsedData = JSON.parse(decryptedData);
              // 确保解析后的数据是对象或数组，而不是字符串、数字等基本类型
              if (typeof parsedData === 'object' && parsedData !== null) {
                response.data.data = parsedData;
              } else {
                // 如果解析结果不是对象或数组，保持原始字符串
                response.data.data = decryptedData;
              }
            } catch (parseError) {
              // 如果解析失败，保持原始字符串
              response.data.data = decryptedData;
            }
          } catch (e) {
            console.warn("数据解密失败:", e);
          }
        }
      
        return response.data;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * AES解密函数，对应Java的decryptByAES方法
   * @param encrypted Base64编码的加密数据
   * @returns 解密后的字符串
   */
  private decryptData(encrypted: string): string {
    try {
      // 检查输入是否为空
      if (!encrypted) {
        throw new Error("加密数据不能为空");
      }
      
      // 检查是否是有效的Base64字符串
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(encrypted)) {
        message.error("输入的数据不是有效的Base64格式");
      }
      
      // 将密钥和IV转换为CryptoJS格式
      const key = CryptoJS.enc.Utf8.parse(this.AES_KEY);
      const iv = CryptoJS.enc.Utf8.parse(this.AES_IV);
      
      // Base64解码并解密
      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        keySize: 128 / 32,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // 检查解密结果
      if (!decrypted || decrypted.toString() === '') {
        throw new Error("解密失败，可能是密钥或IV不匹配，或者输入数据已损坏");
      }
      
      // 转换为UTF-8字符串
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      // 检查解密结果是否为空
      if (result === null || result === undefined) {
        throw new Error("解密结果为空，可能是密钥或IV不匹配");
      }
      
      return result;
    } catch (error) {
      console.error("解密失败:", error);
      console.error("输入的加密数据:", encrypted);
      // 提供更详细的错误信息
      if (error instanceof Error) {
        throw new Error(`解密失败: ${error.message}`);
      } else {
        throw new Error("解密失败: 未知错误");
      }
    }
  }

  /**
   * 公共解密方法，可以在其他地方使用
   * @param encrypted Base64编码的加密数据
   * @returns 解密后的数据（如果是JSON格式会自动解析为对象）
   */
  public decrypt(encrypted: string): any {
    const decryptedData = this.decryptData(encrypted);
    
    // 尝试将解密后的字符串解析为JSON对象
    try {
      const parsedData = JSON.parse(decryptedData);
      // 确保解析后的数据是对象或数组，而不是字符串、数字等基本类型
      if (typeof parsedData === 'object' && parsedData !== null) {
        return parsedData;
      } else {
        // 如果解析结果不是对象或数组，返回原始字符串
        return decryptedData;
      }
    } catch (parseError) {
      // 如果解析失败，返回原始字符串
      return decryptedData;
    }
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message.error("登录已过期，请重新登录");
          break;
        case 403:
          message.error("没有权限访问该资源");
          break;
        case 404:
          message.error("请求的资源不存在");
          break;
        case 500:
          message.error("服务器内部错误");
          break;
        default:
          message.error(`请求失败: ${error.response.statusText}`);
      }
    } else if (error.request) {
      message.error("网络连接异常，请检查网络");
    } else {
      message.error("请求配置错误");
    }

    console.error("请求异常:", error);
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.post(url, data, config);
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.instance.put(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }
}

const requestService = new RequestService();
export default requestService;
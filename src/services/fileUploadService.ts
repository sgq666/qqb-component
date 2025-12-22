import requestService from './requestService';
import { ApiResponse } from '../types/index';
import { FILE_UPLOAD_SERVICE_PATHS } from '../config/apiPaths';

// 文件详情接口
export interface FileInfo {
  id: string;
  queryPath: string;
  filePath: string;
  fileName: string;
  extName: string;
  whenCreated: string;
  size: number;
}

// 文件上传服务类
class FileUploadService {
  // 上传文件
  public async uploadFile(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', file);
    
    // 使用 requestService 并设置正确的 Content-Type
    const response = await requestService.post<ApiResponse<string>>(
      FILE_UPLOAD_SERVICE_PATHS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response;
  }
  
  // 获取文件详情
  public async getFileDetails(id: string): Promise<ApiResponse<FileInfo>> {
    const response = await requestService.get<ApiResponse<FileInfo>>(
      `${FILE_UPLOAD_SERVICE_PATHS.GET_FILE_DETAILS}?id=${id}`
    );
    
    return response;
  }
  
  // 获取文件真实路径
  public getFileRealPath(filePath: string): string {
    const baseUrl = process.env.REACT_APP_NGINX_BASE_URL || '';
    // 确保baseUrl和filePath之间有正确的连接
    if (baseUrl.endsWith('/') && filePath.startsWith('/')) {
      return baseUrl + filePath.substring(1);
    } else if (!baseUrl.endsWith('/') && !filePath.startsWith('/')) {
      return baseUrl + '/' + filePath;
    } else {
      return baseUrl + filePath;
    }
  }
}

const fileUploadService = new FileUploadService();
export default fileUploadService;
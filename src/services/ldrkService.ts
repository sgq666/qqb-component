import requestService from "./requestService";
import { ApiResponse } from "../types/index";
import { LDRK_SERVICE_PATHS } from "../config/apiPaths";
import * as XLSX from "xlsx";

// 导入数据接口参数
interface ImportDataItem {
  idCardNo: string;
  sourceName: string;
}

interface ImportRequest {
  data: ImportDataItem[];
  fileName: string;
}

// 导入记录接口返回数据
export interface ImportRecord {
  uuid: string; // 导入批次号
  fileName: string; // 导入文件名
  total: number; // 导入总数
  successCount: number; // 成功数量
}

// 导入详情接口返回数据
export interface ImportDetail {
  sourceName: string; // 姓名
  idCardNo: string; // 身份证号
  hjdQu: string; // 户籍地区
  hjdFullAddr: string; // 户籍地地址
  name: string; // 身份证姓名
}

// 流动人口服务类
class LdrkService {
  // 导入Excel数据
  public async importExcelData(data: ImportRequest): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      LDRK_SERVICE_PATHS.IMPORT,
      data
    );
  }

  // 查询所有导入记录
  public async getImportRecords(): Promise<ApiResponse<ImportRecord[]>> {
    return requestService.post<ApiResponse<ImportRecord[]>>(
      LDRK_SERVICE_PATHS.RECORDS
    );
  }

  // 根据批次号查询导入详情
  public async getImportDetails(uuid: string): Promise<ApiResponse<ImportDetail[]>> {
    return requestService.post<ApiResponse<ImportDetail[]>>(
      `${LDRK_SERVICE_PATHS.DETAILS}`,
      { uuid }
    );
  }

  // 导出导入详情为Excel文件
  public exportDetailsToExcel(data: ImportDetail[], fileName: string): void {
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 转换数据格式以适应Excel
    const excelData = data.map(item => ({
      "姓名": item.sourceName,
      "身份证号码": item.idCardNo,
      "户籍地区": item.hjdQu,
      "户籍地地址": item.hjdFullAddr,
      "身份证姓名": item.name,
      "姓名匹配": item.sourceName === item.name ? "匹配" : "不匹配"
    }));
    
    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "导入详情");
    
    // 导出文件
    XLSX.writeFile(wb, `${fileName.replace(/\.[^/.]+$/, "")}_导出数据.xlsx`);
  }
}

const ldrkService = new LdrkService();
export default ldrkService;
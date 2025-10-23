import requestService from "./requestService";
import { ApiResponse, User } from "../types/index";
import { OTHER_SERVICE_PATHS } from "../config/apiPaths";

// 数据服务类
class ThirdService {
  //获取附件信息  data: {id: string}
  public async getSuffFile(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_SUFF_FILE_GET,
      data
    );
  }

  //获取部门列表
  public async getDeptList(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_DEPT_LIST
    );
  }

  //获取部门映射列表
  public async getDeptMappingList(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_DEPT_MAPPING_LIST
    );
  }

  //添加部门映射列表
  public async addDeptMappingList(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_DEPT_MAPPING_ADD,
      data
    );
  }

  //获取富文本配置列表
  public async getFulltextList(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_FULLTEXT_LIST
    );
  }

  //获取富文本配置根据id
  public async getFulltextById(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_FULLTEXT_GET,
      data
    );
  }

  //添加富文本配置
  public async addFulltext(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_FULLTEXT_CREAT,
      data
    );
  }
  //修改富文本配置
  public async updateFulltext(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_FULLTEXT_UPDATE,
      data
    );
  }

  // 获取部门树结构
  public async deptTree(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_STATS_DEPT_TREE
    );
  }

  // 获取任务树结构
  public async taskTree(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_STATS_TASK_TREE
    );
  }

  // 获取是否有新任务下发
  public async notice(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_STATS_NOTICE,
      data
    );
  }

  // 获取当前登录用户
  public async currentUser(): Promise<ApiResponse<User>> {
    return requestService.post<ApiResponse<User>>(
      OTHER_SERVICE_PATHS.JN_CURRENT_USER_INFO
    );
  }
}

const thirdservice = new ThirdService();
export default thirdservice;
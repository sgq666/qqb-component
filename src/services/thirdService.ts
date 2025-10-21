import requestService from "./requestService";
import { ApiResponse, User } from "../types/index";

// 数据服务类
class ThirdService {
  //获取附件信息  data: {id: string}
  public async getSuffFile(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/suffFile/get",
      data
    );
  }

  //获取部门列表
  public async getDeptList(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/dept/list"
    );
  }

  //获取部门映射列表
  public async getDeptMappingList(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/dept/mapping/list"
    );
  }

  //添加部门映射列表
  public async addDeptMappingList(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/dept/mapping/add",
      data
    );
  }

  //获取富文本配置列表
  public async getFulltextList(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/fulltext/list"
    );
  }

  //获取富文本配置根据id
  public async getFulltextById(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/fulltext/get",
      data
    );
  }

  //添加富文本配置
  public async addFulltext(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/fulltext/creat",
      data
    );
  }
  //修改富文本配置
  public async updateFulltext(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/fulltext/update",
      data
    );
  }

  // 获取部门树结构
  public async deptTree(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/stats/dept/tree"
    );
  }

  // 获取任务树结构
  public async taskTree(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/stats/task/tree"
    );
  }

  // 获取是否有新任务下发
  public async notice(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      "/rwpt/thirdservice/hk/stats/notice",
      data
    );
  }

  // 获取当前登录用户
  public async currentUser(): Promise<ApiResponse<User>> {
    return requestService.post<ApiResponse<User>>(
      "/rwpt/thirdservice/JN/current/user/info"
    );
  }
}

const thirdservice = new ThirdService();
export default thirdservice;

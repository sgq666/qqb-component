import requestService from "./requestService";
import { ApiResponse, User } from "../types/index";
import { OTHER_SERVICE_PATHS } from "../config/apiPaths";

// 任务模型接口
export interface TaskModel {
  id: string;
  name: string;
}

// 任务关联关系接口
export interface TaskRelation {
  taskId: string;
  taskName: string;
  taskModels: TaskModel[];
}

// 任务详情接口
export interface TaskDetail {
  id: number;
  pid: number;
  name: string;
  type: number;
  timeModel: number;
  startTime: string;
  endTime: string;
  policeType: number;
  categoryType: number;
  categoryTypeDetail: number;
  controlType: number;
  controlNum: number;
  finishWay: number;
  xiezuoFinishWay: number;
  objectFinishWay: number;
  dataActionIds: string; // 表单ID，多个ID用逗号分隔
  mustDataActionIds: string;
  xiezuoDataActionIds: string;
  mustXiezuoDataActionIds: string;
  controlId: string;
  controlName: string;
  accessType: number;
  whoModified: number;
  whenModified: string;
  whenCreated: string;
  whoCreated: number;
  deleted: number;
  createDeptcode: string;
  createDeptname: string;
  level: number;
  objectType: string;
  timeModelDetail: string;
  issue: string;
  totalGuidance: number;
  guidanceType: number;
  guideNum: number;
  importantType: number;
  policeTypeName: string;
  categoryTypeName: string;
  categoryTypeDetailName: string;
  nowObjNum: number;
  status: number;
  ifAuto: number;
  isDraft: number;
  whoCreatedName: string;
  fileFolderTaskId: number;
  appObjectSortType: number;
  templateId: number;
  isDesenstitize: number;
  isCombination: number;
}

// 表单字段选项接口
export interface FormFieldOption {
  label: string;
  value: string;
}

// 表单字段接口
export interface FormField {
  fieldKey: string;
  fieldValue: string;
  fieldType: string; // input, file, radio, checkbox 等
  options: string[]; // 选项列表
}

// 表单接口
export interface Form {
  id: number;
  name: string;
  actionItemList: FormField[];
}

// 工作日志数据接口
export interface WorkLogData {
  id: string;
  [key: string]: any; // 支持动态字段
}

// 查询结果接口
export interface QueryResult {
  data: WorkLogData[];
  total: number;
  current: number;
  pageSize: number;
}

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
  public async createFulltext(data: any): Promise<ApiResponse<any>> {
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
  public async taskTree(useNonCycleApi: boolean = false): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      useNonCycleApi ? 
        OTHER_SERVICE_PATHS.HK_STATS_TASK_TREE_NOT_CYCLE : 
        OTHER_SERVICE_PATHS.HK_STATS_TASK_TREE
    );
  }

  // 获取任务详情
  public async getTaskDetail(taskId: string | number): Promise<ApiResponse<TaskDetail>> {
    return requestService.post<ApiResponse<TaskDetail>>(
      `${OTHER_SERVICE_PATHS.HK_PRODUCT_TASK_GET}`,
      { taskId }
    );
  }

  // 根据任务ID获取表单信息
  public async getFormByTaskId(taskId: string | number): Promise<ApiResponse<Form[]>> {
    return requestService.post<ApiResponse<Form[]>>(
      `${OTHER_SERVICE_PATHS.HK_PRODUCT_TASK_ACTION_GET}`,
      { id: taskId }
    );
  }

  // 获取任务关联关系列表
  public async getTaskRelations(taskId?: string | number): Promise<ApiResponse<TaskRelation[]>> {
    return requestService.post<ApiResponse<TaskRelation[]>>(
      OTHER_SERVICE_PATHS.HK_STATS_TASK_RELATION_LIST,
      taskId ? { taskId } : {}
    );
  }

  // 添加任务关联关系
  public async addTaskRelation(data: TaskRelation): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_STATS_TASK_RELATION_ADD,
      data
    );
  }

  // 更新任务关联关系
  public async updateTaskRelation(data: TaskRelation): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_STATS_TASK_RELATION_UPDATE,
      data
    );
  }

  // 删除任务关联关系
  public async deleteTaskRelation(taskId: string): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_STATS_TASK_RELATION_DELETE,
      { taskId }
    );
  }

  // 根据任务ID获取表单字段
  public async getFormFieldsByTaskId(taskId: string): Promise<ApiResponse<FormField[]>> {
    try {
      const response = await this.getFormByTaskId(taskId);
      if (response.code === 200 && response.data && response.data.length > 0) {
        // 只取第一个表单的字段
        const form = response.data[0];
        return { code: 200, message: '操作成功', data: form.actionItemList };
      } else {
        return { code: 200, message: '操作成功', data: [] };
      }
    } catch (error) {
      console.error('获取表单字段失败:', error);
      throw error;
    }
  }

  // 查询工作日志数据
  public async queryWorkLog(params: any): Promise<ApiResponse<QueryResult>> {
    return requestService.post<ApiResponse<QueryResult>>(
      OTHER_SERVICE_PATHS.HK_QUERY_WORK_LOG,
      params
    );
  }

  // 查询完成记录
  public async queryCompletedRecords(params: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_TASK_WORK_LOG_PAGE,
      params
    );
  }

  // 导出完成记录
  public async exportCompletedRecords(params: any): Promise<any> {
    // 使用requestService的公共方法进行文件下载，不经过响应拦截器的业务逻辑检查
    const response = await requestService.request({
      method: 'post',
      url: OTHER_SERVICE_PATHS.HK_TASK_WORK_LOG_EXPORT,
      data: params,
      responseType: 'blob', // 重要：设置响应类型为blob以处理文件下载
    });
    return response;
  }
  

  // 获取是否有新任务下发
  public async notice(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_STATS_NOTICE,
      data
    );
  }

  // 任务监听异常日志上报
  public async logUpload(data: any): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_STATS_NOTICE_LOG_UPLOAD,
      data
    );
  }

  // 获取当前登录用户
  public async currentUser(): Promise<ApiResponse<User>> {
    return requestService.post<ApiResponse<User>>(
      OTHER_SERVICE_PATHS.JN_CURRENT_USER_INFO
    );
  }

  // 获取日报统计数据
  public async getDayCountData(params: {
    taskIds?: string[];
    beginTime?: string;
    endTime?: string;
  }): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_STATS_DAY_COUNT, // 使用正确的API路径
      params
    );
  }

  // 保存筛选条件
  public async saveFilterCondition(params: {
    condition: string,
    remark: string,
    viewName: string,
    updateView: number
  }): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_TASK_WORK_LOG_ADD,
      params
    );
  }
  
  // 查询筛选条件列表
  public async getFilterConditionList(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_TASK_WORK_LOG_LIST,
      {}
    );
  }
  
  // 更新筛选条件
  public async updateFilterCondition(params: {
    id: number,
    condition: string,
    remark: string,
    viewName: string,
    updateView: number
  }): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_TASK_WORK_LOG_UPDATE,
      params
    );
  }
  
  // 删除筛选条件
  public async deleteFilterCondition(id: number): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      OTHER_SERVICE_PATHS.HK_TASK_WORK_LOG_DEL,
      { id }
    );
  }
  
  // 获取表单列表
  public async getFormList(): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      '/rwpt/thirdservice/product/action/list',
      {}
    );
  }
  
  // 表单替换
  public async replaceForm(params: { oldActionId: number; newActionId: number }): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      '/rwpt/thirdservice/fuZhouGongAn/action/replace',
      params
    );
  }
  
  // 获取表单详情
  public async getFormDetail(formId: string | number): Promise<ApiResponse<any>> {
    return requestService.post<ApiResponse<any>>(
      '/rwpt/thirdservice/product/action/get',
      { id: formId }
    );
  }
}

const thirdservice = new ThirdService();
export default thirdservice;
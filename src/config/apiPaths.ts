// src/config/apiPaths.ts
// API接口路径配置文件

// 第三方服务基础URL
export const THIRD_SERVICE_BASE_URL = "/rwpt/thirdservice";

// 流动人口服务相关接口路径
export const LDRK_SERVICE_PATHS = {
  IMPORT: `${THIRD_SERVICE_BASE_URL}/hk/ldrk/into`,
  RECORDS: `${THIRD_SERVICE_BASE_URL}/hk/ldrk/obj/list`,
  DETAILS: `${THIRD_SERVICE_BASE_URL}/hk/ldrk/list`,
};

// 文件上传服务相关接口路径
export const FILE_UPLOAD_SERVICE_PATHS = {
  UPLOAD: `${THIRD_SERVICE_BASE_URL}/hk/upload`,
  GET_FILE_DETAILS: `${THIRD_SERVICE_BASE_URL}/hk/file/get`,
};

// 其他服务相关接口路径
export const OTHER_SERVICE_PATHS = {
  HK_SUFF_FILE_GET: `${THIRD_SERVICE_BASE_URL}/hk/suffFile/get`,
  HK_DEPT_LIST: `${THIRD_SERVICE_BASE_URL}/hk/dept/list`,
  HK_DEPT_MAPPING_LIST: `${THIRD_SERVICE_BASE_URL}/hk/dept/mapping/list`,
  HK_DEPT_MAPPING_ADD: `${THIRD_SERVICE_BASE_URL}/hk/dept/mapping/add`,
  HK_FULLTEXT_LIST: `${THIRD_SERVICE_BASE_URL}/hk/fulltext/list`,
  HK_FULLTEXT_GET: `${THIRD_SERVICE_BASE_URL}/hk/fulltext/get`,
  HK_FULLTEXT_CREAT: `${THIRD_SERVICE_BASE_URL}/hk/fulltext/creat`,
  HK_FULLTEXT_UPDATE: `${THIRD_SERVICE_BASE_URL}/hk/fulltext/update`,
  HK_STATS_DEPT_TREE: `${THIRD_SERVICE_BASE_URL}/hk/stats/dept/tree`,
  HK_STATS_TASK_TREE: `${THIRD_SERVICE_BASE_URL}/hk/stats/task/tree`,
  HK_STATS_TASK_TREE_NOT_CYCLE: `${THIRD_SERVICE_BASE_URL}/hk/stats/task/tree/not/cycle`,// 获取任务树（非周期）
  HK_PRODUCT_TASK_GET: `${THIRD_SERVICE_BASE_URL}/product/task/get`, // 获取任务详情
  HK_PRODUCT_TASK_ACTION_GET: `${THIRD_SERVICE_BASE_URL}/product/task/action/get`, // 根据任务ID获取表单
  HK_STATS_TASK_RELATION_LIST: `${THIRD_SERVICE_BASE_URL}/taskRelated/list`, // 获取任务关联关系列表
  HK_STATS_TASK_RELATION_ADD: `${THIRD_SERVICE_BASE_URL}/taskRelated/add`, // 添加任务关联关系
  HK_STATS_TASK_RELATION_UPDATE: `${THIRD_SERVICE_BASE_URL}/taskRelated/update`, // 更新任务关联关系
  HK_STATS_TASK_RELATION_DELETE: `${THIRD_SERVICE_BASE_URL}/taskRelated/del`, // 删除任务关联关系
  HK_STATS_NOTICE: `${THIRD_SERVICE_BASE_URL}/hk/stats/notice`,
  HK_STATS_DAY_COUNT: `${THIRD_SERVICE_BASE_URL}/hk/st/stat/report`, // 添加日报统计数据接口
  HK_STATS_NOTICE_LOG_UPLOAD: `${THIRD_SERVICE_BASE_URL}/hk/notice/error/log`,
  HK_FORM_FIELDS_BY_TASK: `${THIRD_SERVICE_BASE_URL}/hk/form-fields/task`, // 根据任务ID获取表单字段
  HK_QUERY_WORK_LOG: `${THIRD_SERVICE_BASE_URL}/hk/work-log/query`, // 查询工作日志
  HK_TASK_WORK_LOG_PAGE: `${THIRD_SERVICE_BASE_URL}/taskWorkLog/page`, // 查询完成记录
  HK_TASK_WORK_LOG_ADD: `${THIRD_SERVICE_BASE_URL}/taskWorkLog/add`, // 保存筛选条件
  HK_TASK_WORK_LOG_LIST: `${THIRD_SERVICE_BASE_URL}/taskWorkLog/list`, // 查询筛选条件列表
  HK_TASK_WORK_LOG_UPDATE: `${THIRD_SERVICE_BASE_URL}/taskWorkLog/update`, // 更新筛选条件
  HK_TASK_WORK_LOG_DEL: `${THIRD_SERVICE_BASE_URL}/taskWorkLog/del`, // 删除筛选条件
  HK_TASK_WORK_LOG_EXPORT: `${THIRD_SERVICE_BASE_URL}/taskWorkLog/export`, // 导出完成记录
  JN_CURRENT_USER_INFO: `${THIRD_SERVICE_BASE_URL}/JN/current/user/info`,
};

const apiPaths = {
  THIRD_SERVICE_BASE_URL,
  LDRK_SERVICE_PATHS,
  FILE_UPLOAD_SERVICE_PATHS,
  OTHER_SERVICE_PATHS,
};

export default apiPaths;
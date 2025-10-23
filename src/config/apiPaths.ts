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
  HK_STATS_NOTICE: `${THIRD_SERVICE_BASE_URL}/hk/stats/notice`,
  JN_CURRENT_USER_INFO: `${THIRD_SERVICE_BASE_URL}/JN/current/user/info`,
};

const apiPaths = {
  THIRD_SERVICE_BASE_URL,
  LDRK_SERVICE_PATHS,
  OTHER_SERVICE_PATHS,
};

export default apiPaths;
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Form,
  TreeSelect,
  InputNumber,
  Button,
  message,
  Card,
  Space,
  Tabs,
  Row,
  Col,
  Modal,
  Table,
  Checkbox,
} from "antd";
import type { TreeSelectProps } from "antd";
import thirdservice from "../../services/thirdService";
import type { ApiResponse, User } from "../../types";
import { groupBy } from "../../utils/ArraysUtils";
import dayjs from "dayjs";

// 格式化时间显示
const formatDateTime = (dateTimeString: string): string => {
  return dayjs(dateTimeString).format("YYYY-MM-DD HH:mm:ss");
};

// 数据转换和保护函数 - 确保数据结构符合TreeSelect要求
const transformTreeData = (
  data: any[],
  type: "business" | "department",
  visited = new Set()
): any[] => {
  if (!Array.isArray(data)) {
    console.warn(`${type} 数据不是数组格式:`, data);
    return [];
  }

  return data.map((item: any) => {
    // 检查是否存在循环引用
    if (item && typeof item === "object") {
      if (visited.has(item)) {
        console.warn(`检测到循环引用，跳过处理:`, item);
        return { ...item };
      }
      visited.add(item);
    }

    const transformed: any = {
      ...item,
      // 确保必要字段存在
      children:
        item.children && Array.isArray(item.children)
          ? transformTreeData(item.children, type, new Set(visited))
          : undefined,
    };

    // 为业务专题数据添加必要字段
    if (type === "business") {
      transformed.id = item.id || item.taskId || item.code;
      transformed.name = item.name || item.taskName || item.title || "未命名";
    }

    // 为部门数据添加必要字段
    if (type === "department") {
      transformed.deptCode = item.deptCode || item.code || item.id;
      transformed.deptName =
        item.deptName || item.name || item.title || "未命名部门";
    }

    // 从visited集合中移除当前项，避免影响同级节点的处理
    if (item && typeof item === "object") {
      visited.delete(item);
    }

    return transformed;
  });
};

interface ExtendedDataNode {
  // 业务专题字段
  id?: string;
  name?: string;
  // 责任单位字段
  deptCode?: string;
  deptName?: string;
  // 通用字段
  children?: ExtendedDataNode[];
  parentCode?: string;
  deptLevel?: number; // 添加可选的deptLevel属性
  [key: string]: any;
}

// 监听历史记录的数据结构
interface ListenHistoryItem {
  id: string; // 唯一标识
  timestamp: string; // 监听时间
  size: number; // 任务数量
  hitRes: any[]; // 任务详情
  businessTopics: string[]; // 当前选中的业务专题
  departments: string[]; // 当前选中的责任单位
}

// 模拟数据 - 实际使用时应该从API获取
const mockBusinessTopics: ExtendedDataNode[] = [
  {
    name: "政务服务专题",
    id: "topic001",
    children: [
      {
        name: "证照办理",
        id: "topic001-001",
        children: [
          { name: "营业执照办理", id: "leaf001-001-001" },
          { name: "税务登记证办理", id: "leaf001-001-002" },
          { name: "组织机构代码证办理", id: "leaf001-001-003" },
        ],
      },
      {
        name: "公积金服务",
        id: "topic001-002",
        children: [
          { name: "公积金提取", id: "leaf001-002-001" },
          { name: "公积金贷款", id: "leaf001-002-002" },
        ],
      },
      { name: "社保查询", id: "leaf001-003" },
    ],
  },
  {
    name: "便民服务专题",
    id: "topic002",
    children: [
      {
        name: "交通出行",
        id: "topic002-001",
        children: [
          { name: "违章查询", id: "leaf002-001-001" },
          { name: "驾驶证换证", id: "leaf002-001-002" },
          { name: "车辆年检", id: "leaf002-001-003" },
        ],
      },
      {
        name: "医疗健康",
        id: "topic002-002",
        children: [
          { name: "预约挂号", id: "leaf002-002-001" },
          { name: "体检报告查询", id: "leaf002-002-002" },
        ],
      },
      { name: "水电气缴费", id: "leaf002-003" },
    ],
  },
  {
    name: "教育服务专题",
    id: "topic003",
    children: [
      { name: "入学申请", id: "leaf003-001" },
      { name: "学籍查询", id: "leaf003-002" },
      { name: "成绩查询", id: "leaf003-003" },
    ],
  },
];

const mockDepartments: ExtendedDataNode[] = [
  {
    deptCode: "100000",
    deptName: "市政府办公厅",
    parentCode: undefined,
    deptLevel: 1,
  },
  {
    deptCode: "100001",
    deptName: "综合处",
    parentCode: "100000",
    deptLevel: 2,
  },
  {
    deptCode: "100001001",
    deptName: "秘书科",
    parentCode: "100001",
    deptLevel: 3,
  },
  {
    deptCode: "100001002",
    deptName: "文印科",
    parentCode: "100001",
    deptLevel: 3,
  },
  {
    deptCode: "100002",
    deptName: "信息处",
    parentCode: "100000",
    deptLevel: 2,
  },
  {
    deptCode: "100002001",
    deptName: "网络管理科",
    parentCode: "100002",
    deptLevel: 3,
  },
  {
    deptCode: "100002002",
    deptName: "系统维护科",
    parentCode: "100002",
    deptLevel: 3,
  },
  {
    deptCode: "100003",
    deptName: "督查处",
    parentCode: "100000",
    deptLevel: 2,
  },
  {
    deptCode: "200000",
    deptName: "市发展改革委",
    parentCode: undefined,
    deptLevel: 1,
  },
  {
    deptCode: "200001",
    deptName: "发展规划处",
    parentCode: "200000",
    deptLevel: 2,
  },
  {
    deptCode: "200001001",
    deptName: "城市规划科",
    parentCode: "200001",
    deptLevel: 3,
  },
  {
    deptCode: "200001002",
    deptName: "产业规划科",
    parentCode: "200001",
    deptLevel: 3,
  },
  {
    deptCode: "200002",
    deptName: "投资管理处",
    parentCode: "200000",
    deptLevel: 2,
  },
  {
    deptCode: "200002001",
    deptName: "项目审批科",
    parentCode: "200002",
    deptLevel: 3,
  },
  {
    deptCode: "200002002",
    deptName: "招商引资科",
    parentCode: "200002",
    deptLevel: 3,
  },
  {
    deptCode: "200003",
    deptName: "价格监督处",
    parentCode: "200000",
    deptLevel: 2,
  },
  {
    deptCode: "300000",
    deptName: "市教育局",
    parentCode: undefined,
    deptLevel: 1,
  },
  {
    deptCode: "300001",
    deptName: "基础教育处",
    parentCode: "300000",
    deptLevel: 2,
  },
  {
    deptCode: "300002",
    deptName: "职业教育处",
    parentCode: "300000",
    deptLevel: 2,
  },
  {
    deptCode: "300003",
    deptName: "高等教育处",
    parentCode: "300000",
    deptLevel: 2,
  },
  {
    deptCode: "400000",
    deptName: "市卫生健康委",
    parentCode: undefined,
    deptLevel: 1,
  },
  {
    deptCode: "400001",
    deptName: "医政医管处",
    parentCode: "400000",
    deptLevel: 2,
  },
  {
    deptCode: "400002",
    deptName: "疾病预防控制处",
    parentCode: "400000",
    deptLevel: 2,
  },
  {
    deptCode: "400003",
    deptName: "妇幼健康处",
    parentCode: "400000",
    deptLevel: 2,
  },
];

const NoticeNew: React.FC = () => {
  const [form] = Form.useForm();
  const searchParams = useMemo(() => {
    // 首先尝试从 window.location.search 获取（常规路由）
    if (window.location.search) {
      return new URLSearchParams(window.location.search);
    }

    // 如果 search 为空，尝试从 hash 中提取查询参数（hash 路由）
    const hash = window.location.hash;
    const queryIndex = hash.indexOf("?");
    if (queryIndex !== -1) {
      const queryString = hash.substring(queryIndex + 1);
      return new URLSearchParams(queryString);
    }

    // 如果都没有，返回空的 URLSearchParams
    return new URLSearchParams();
  }, []);

  // 获取当前用户信息
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userRes: ApiResponse<User> = await thirdservice.currentUser();
        setCurrentUser(userRes.data);
        // setCurrentUser({
        //   id: 1,
        //   username: "zhangsan",
        //   chineseName: "张三",
        //   idcardNo: "110101199003071234",
        //   policeCode: "J000001",
        //   deptCode: "100000",
        //   phoneNo: "13800138000",
        //   powerId: "1",
        // });
      } catch (error) {
        console.error("获取用户信息失败:", error);
        message.error("获取用户信息失败");
      }
    };

    fetchCurrentUser();
  }, []);

  const taskIds = searchParams.get("taskIds") || "";
  const interval = searchParams.get("interval") || 1;
  const deptLevel = searchParams.get("deptLevel") || 0;
  const [hasNotice, setHasNotice] = useState<boolean>(false);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(5);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>(new Date().toISOString());
  const [countdown, setCountdown] = useState<number>(0); // 倒计时秒数
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toISOString()
  ); // 当前时间状态

  // 监听历史记录状态
  const [listenHistory, setListenHistory] = useState<ListenHistoryItem[]>([]);
  // 新任务详情模态框状态
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<ListenHistoryItem | null>(null);
  // 选中的历史记录用于导出
  const [selectedHistoryKeys, setSelectedHistoryKeys] = useState<string[]>([]);
  // 监听历史筛选状态
  const [filterNewTasksOnly, setFilterNewTasksOnly] = useState<boolean>(false);
  const [filteredHistory, setFilteredHistory] = useState<ListenHistoryItem[]>(
    []
  );

  // 初始化筛选后的监听历史
  useEffect(() => {
    setFilteredHistory(listenHistory);
  }, [listenHistory]);

  // 新增状态：业务专题和责任单位数据
  const [businessTopicsData, setBusinessTopicsData] = useState<
    ExtendedDataNode[]
  >([]);
  const [departmentsData, setDepartmentsData] = useState<ExtendedDataNode[]>(
    []
  );
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioIntervalRef = useRef<NodeJS.Timeout | null>(null); // 用于控制音频循环播放
  const countdownRef = useRef<NodeJS.Timeout | null>(null); // 用于控制倒计时
  const startTimeRef = useRef<string>(new Date().toISOString()); // 用于保存最新的startTime
  const hasSetDefaultDepartment = useRef(false);
  const hasAutoStartedListening = useRef(false); // 用于跟踪是否已经自动开始监听

  // 根据任务ID获取任务名称的函数
  const getTaskNameById = useCallback(
    (taskId: string, treeData: ExtendedDataNode[]): string => {
      let taskName = "";

      const traverse = (nodes: ExtendedDataNode[]) => {
        for (const node of nodes) {
          if (node.id === taskId) {
            taskName = node.name || "未命名任务";
            return;
          }
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          }
        }
      };

      traverse(treeData);
      return taskName || "未知任务";
    },
    []
  );

  // 播放提示音
  const playSound = useCallback(() => {
    try {
      if (audioRef.current) {
        // 重置音频到开始位置
        audioRef.current.currentTime = 0;
        // 添加类型断言确保play方法存在
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((e: any) => {
            console.log(
              "提示音播放失败，可能是浏览器限制或音频文件问题:",
              e.message
            );
            console.log("🔔 新任务提醒！");
          });
        }
      } else {
        console.log("🔔 新任务提醒！（音频未初始化）");
      }
    } catch (e) {
      console.log("Audio play error:", e);
    }
  }, []);

  // 开始持续播放提示音
  const startContinuousSound = useCallback(() => {
    // 先清除之前的定时器
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
    }

    // 立即播放一次
    playSound();

    // 设置循环播放，每3秒播放一次
    audioIntervalRef.current = setInterval(() => {
      playSound();
    }, 2000); // 每3秒播放一次

    console.log("🔄 开始持续播放提示音");
  }, [playSound]);

  // 停止持续播放提示音
  const stopContinuousSound = useCallback(() => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
      console.log("⏹️ 停止持续播放提示音");
    }
  }, []);

  // 检查是否有新任务
  const checkForNewTasks = useCallback(async () => {
    try {
      console.log("📡 检查新任务中...");

      // 获取表单数据
      const formData = form.getFieldsValue();
      const { businessTopics = [], departments = [] } = formData;

      // 记录请求前的时间，用于参数 - 使用 ref 获取最新值
      const currentStartTime = startTimeRef.current;

      // 优化deptCodes处理逻辑，确保即使departments数组中有空值也能正确过滤
      const validDepartments = (departments as string[]).filter(
        (dept: string) => dept && dept.trim() !== ""
      );
      const deptCodes =
        validDepartments.length > 0
          ? validDepartments
          : currentUser?.deptCode
          ? [currentUser.deptCode]
          : [];

      console.log("🔍 调试信息:", {
        deptCodes: deptCodes,
        taskIds: businessTopics,
        startTime: formatDateTime(currentStartTime),
        当前时间: formatDateTime(new Date().toISOString()),
      });

      // 添加额外的调试信息
      console.log("🔍 详细调试信息:", {
        departmentsLength: departments.length,
        validDepartmentsLength: validDepartments.length,
        businessTopicsLength: businessTopics.length,
        departmentsContent: departments,
        validDepartmentsContent: validDepartments,
        businessTopicsContent: businessTopics,
        isDepartmentsArray: Array.isArray(departments),
        isBusinessTopicsArray: Array.isArray(businessTopics),
        currentUserDeptCode: currentUser?.deptCode,
      });

      const noticeRes: ApiResponse<any> = await thirdservice.notice({
        deptCodes: deptCodes,
        taskIds: businessTopics,
        startTime: formatDateTime(currentStartTime),
      });
      const data = noticeRes.data;
      const hitRes: any[] = data.hitRes || [];

      // 创建监听历史记录
      const historyItem: ListenHistoryItem = {
        id: Date.now().toString(), // 使用时间戳作为唯一ID
        timestamp: new Date().toISOString(),
        size: data.size || 0,
        hitRes: hitRes,
        businessTopics: [...businessTopics],
        departments: [...validDepartments], // 使用过滤后的有效部门列表
      };

      // 更新监听历史记录
      setListenHistory((prev) => [historyItem, ...prev.slice(0, 999)]); // 保留最近1000条记录

      if (data.size > 0) {
        console.log(`✅ 检查完成：发现 ${data.size} 个新任务`);
        setHasNotice(true);
        startContinuousSound(); // 开始持续播放提示音
        triggerVibration();
        showBrowserNotification(data.size);
        message.success(`检测到 ${data.size} 个新任务！`);
        // 每次检查完成后,有发现新任务才更新startTime为当前时间
        const newStartTime = new Date().toISOString();
        console.log("⏰ 更新startTime:", {
          请求时使用的时间: formatDateTime(currentStartTime),
          更新后的时间: formatDateTime(newStartTime),
        });
        // 同时更新状态和引用
        setStartTime(newStartTime);
        startTimeRef.current = newStartTime;
      } else {
        console.log("✅ 检查完成：暂无新任务");
      }
    } catch (error) {
      console.error("检查新任务失败:", error);
      message.error("检查新任务失败，请检查网络连接");

      // 获取表单数据用于错误记录
      const formData = form.getFieldsValue();
      const { businessTopics = [], departments = [] } = formData;

      // 优化错误情况下的deptCodes处理
      const validDepartments = (departments as string[]).filter(
        (dept: string) => dept && dept.trim() !== ""
      );

      // 即使出错也记录历史
      const historyItem: ListenHistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        size: 0,
        hitRes: [],
        businessTopics: businessTopics,
        departments: validDepartments, // 使用过滤后的有效部门列表
      };

      setListenHistory((prev) => [historyItem, ...prev.slice(0, 999)]);
    }
  }, [form, currentUser, startContinuousSound]);

  // 开始倒计时
  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 开始监听
  const startListening = useCallback(
    (intervalValue?: number) => {
      // 获取表单数据
      const formData = form.getFieldsValue();
      const { businessTopics = [], intervalMinutes: formIntervalMinutes } =
        formData as {
          businessTopics?: string[];
          intervalMinutes?: number;
        };

      // 使用传入的intervalValue或表单中的intervalMinutes或默认的intervalMinutes状态
      const effectiveInterval =
        intervalValue !== undefined
          ? intervalValue
          : formIntervalMinutes !== undefined
          ? formIntervalMinutes
          : intervalMinutes;

      if (!effectiveInterval || effectiveInterval <= 0) {
        message.warning("请输入有效的监听间隔");
        return;
      }

      if (businessTopics.length === 0) {
        message.warning("请选择至少一个业务专题");
        return;
      }

      setIsListening(true);
      const newStartTime = new Date().toISOString();
      setStartTime(newStartTime);
      startTimeRef.current = newStartTime; // 同时更新ref
      message.success("开始监听任务");

      // 立即执行一次检查
      checkForNewTasks();

      // 开始倒计时
      startCountdown(effectiveInterval * 60);

      // 设置定时器
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        checkForNewTasks();
        // 重新开始倒计时
        setTimeout(() => {
          startCountdown(effectiveInterval * 60);
        }, 100);
      }, effectiveInterval * 60 * 1000);
    },
    [form, intervalMinutes, checkForNewTasks, startCountdown]
  );

  // 当用户信息和部门数据都加载完成后，设置默认选中的部门
  useEffect(() => {
    if (
      currentUser &&
      departmentsData.length > 0 &&
      !hasSetDefaultDepartment.current
    ) {
      // 查找用户所在部门
      const findUserDept = (
        nodes: ExtendedDataNode[]
      ): ExtendedDataNode | null => {
        for (const node of nodes) {
          if (node.deptCode === currentUser.deptCode) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const found = findUserDept(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const userDept = findUserDept(departmentsData);

      // 如果找到了用户所在部门，则设置为默认选中
      if (userDept && userDept.deptCode) {
        console.log(
          "默认选中用户所在部门:",
          userDept.deptName,
          userDept.deptCode
        );
        form.setFieldsValue({
          departments: [userDept.deptCode],
        });
        hasSetDefaultDepartment.current = true; // 标记已设置默认选中
      } else {
        console.log("未找到用户所在部门，用户deptCode:", currentUser.deptCode);
        // 如果没有找到用户所在部门，但用户有deptCode，仍然设置为默认选中
        if (currentUser.deptCode) {
          form.setFieldsValue({
            departments: [currentUser.deptCode],
          });
          hasSetDefaultDepartment.current = true;
        }
      }
    }
  }, [currentUser, departmentsData, form]);

  // 初始化音频
  useEffect(() => {
    // 创建音频对象
    audioRef.current = new Audio() as HTMLAudioElement;

    // 尝试加载 public/audio/warnning.mp3，如果失败则使用默认提示音
    const warningAudio = new Audio("/audio/warnning.mp3") as HTMLAudioElement;

    const handleCanPlayThrough = () => {
      // 如果能成功加载外部音频，则使用它
      if (audioRef.current) {
        audioRef.current.src = "/audio/warnning.mp3";
        console.log("✅ 成功加载外部警告音频");
      }
    };

    const handleError = () => {
      // 如果加载失败，使用默认提示音
      setDefaultAudioSource();
    };

    warningAudio.addEventListener("canplaythrough", handleCanPlayThrough);
    warningAudio.addEventListener("error", handleError);

    // 设置音量
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
    }

    // 定义设置默认音频源的函数
    function setDefaultAudioSource() {
      console.log("⚠️ 外部警告音频加载失败，使用默认提示音");
      if (audioRef.current) {
        audioRef.current.src =
          "data:audio/wav;base64,UklGRpACAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYwCAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBjiR1/LNeSMFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSMF";
      }
    }

    // 请求通知权限
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      // 清理事件监听器
      warningAudio.removeEventListener("canplaythrough", handleCanPlayThrough);
      warningAudio.removeEventListener("error", handleError);
    };
  }, []);

  // 每秒更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // 加载业务专题数据
  const loadBusinessTopics = async (): Promise<ExtendedDataNode[]> => {
    try {
      console.log("📡 正在加载业务专题数据...");
      const deptRes: ApiResponse<any[]> = await thirdservice.taskTree();
      // const deptRes = { data: mockBusinessTopics };

      // 检查响应数据
      if (!deptRes.data || !Array.isArray(deptRes.data)) {
        console.warn("业务专题数据格式异常:", deptRes);
        message.warning("业务专题数据格式异常，使用模拟数据");
        return mockBusinessTopics;
      }

      const transformedData = transformTreeData(deptRes.data, "business");
      console.log("✅ 业务专题数据加载成功:", transformedData);
      return transformedData;
    } catch (error) {
      console.error("业务专题数据加载失败:", error);
      message.error("业务专题数据加载失败，使用模拟数据");
      return mockBusinessTopics;
    }
  };

  // 加载责任单位数据
  const loadDepartments = useCallback(async (): Promise<ExtendedDataNode[]> => {
    try {
      console.log("📡 正在加载责任单位数据...");
      const taskRes: ApiResponse<any[]> = await thirdservice.getDeptList();
      // const taskRes = { data: mockDepartments };

      // 检查响应数据
      if (!taskRes.data || !Array.isArray(taskRes.data)) {
        console.warn("责任单位数据格式异常:", taskRes);
        message.warning("责任单位数据格式异常，使用模拟数据");
        taskRes.data = mockDepartments;
      }

      // 构建部门树结构
      console.log("deptLevel", deptLevel);
      let topLevelDeptCode = "";

      // 如果有当前用户信息，根据用户所在部门和deptLevel确定最顶级部门代码
      if (currentUser && currentUser.deptCode) {
        // 查找当前用户所在部门的层级
        const userDept = taskRes.data.find(
          (dept) => dept.deptCode === currentUser.deptCode
        );
        console.log("userDept", userDept);
        if (userDept) {
          const userDeptLevel = userDept.deptLevel || 0;
          if (userDeptLevel <= Number(deptLevel)) {
            // 如果用户所在部门层级小于等于deptLevel，最顶级部门就是用户所在部门
            topLevelDeptCode = userDept.parentCode || "";
          } else {
            // 如果用户所在部门层级大于deptLevel，需要向上查找
            let currentDept: ExtendedDataNode | undefined = userDept;
            let currentDeptParentCode: string | undefined = undefined; // 明确声明类型

            // 提取查找父级部门的逻辑到循环外部，避免在循环中创建函数
            const findParentDept = (parentCode: string | undefined) => {
              return taskRes.data.find((dept) => dept.deptCode === parentCode);
            };

            while (
              currentDept &&
              (currentDept.deptLevel || 0) > Number(deptLevel)
            ) {
              // 查找父级部门
              currentDeptParentCode = currentDept.parentCode;
              const parentDept = findParentDept(currentDeptParentCode);
              if (parentDept) {
                currentDept = parentDept;
              } else {
                break;
              }
            }
            topLevelDeptCode = currentDept?.parentCode || "";
          }
        }
      }
      console.log("顶级部门代码:", topLevelDeptCode);

      const buildTree = () => {
        const deptList = taskRes.data;
        const deptMap: Record<string, ExtendedDataNode[]> = groupBy(
          deptList,
          (dept) => dept.parentCode || ""
        );
        deptList.forEach((dept) => {
          dept.children = deptMap[dept.deptCode || ""] || [];
        });
        if (!topLevelDeptCode) {
          return deptList.filter((dept) => !dept.parentCode);
        }
        return deptList.filter((dept) => dept.parentCode === topLevelDeptCode);
      };

      const treeData = buildTree();
      return treeData;
    } catch (error) {
      console.error("责任单位数据加载失败:", error);
      message.error("责任单位数据加载失败，使用模拟数据");

      return mockDepartments;
    }
  }, [currentUser, deptLevel]);

  // 初始化加载数据
  const loadInitialData = useCallback(async () => {
    setDataLoading(true);
    try {
      // 先加载业务专题数据
      const businessTopicsResponse = await loadBusinessTopics();
      setBusinessTopicsData(businessTopicsResponse);

      // 再加载责任单位数据
      const departmentsResponse = await loadDepartments();
      setDepartmentsData(departmentsResponse);

      console.log("✅ 数据加载完成");
    } catch (error) {
      console.error("数据加载失败:", error);
      message.error("数据加载失败，请刷新页面重试");
      // 如果接口失败，使用模拟数据作为备选
      setBusinessTopicsData(mockBusinessTopics);
      setDepartmentsData(mockDepartments);
    } finally {
      setDataLoading(false);
    }
  }, [loadDepartments]);

  // 初始化加载数据
  useEffect(() => {
    // 使用ref标记是否已处理过URL参数触发的监听，避免重复触发
    if (hasAutoStartedListening.current) {
      return;
    }

    // 只有在taskIds存在且不为"-1"时才自动开始监听
    if (taskIds && taskIds !== "-1") {
      // 标记已自动开始监听，避免重复触发
      hasAutoStartedListening.current = true;

      loadInitialData().then(() => {
        // 数据加载完成后，检查是否有taskIds参数
        // 将逗号分隔的字符串转换为数组
        const taskIdArray = taskIds
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);

        console.log("有效的业务专题ID：", taskIdArray);

        // 设置表单值
        form.setFieldsValue({
          businessTopics: taskIdArray,
        });

        // 如果有有效的业务专题，则自动开始监听
        if (taskIdArray.length > 0) {
          let intervalValue = 5; // 默认间隔5分钟
          if (interval && !isNaN(Number(interval)) && Number(interval) > 0) {
            intervalValue = Number(interval);
          }

          // 设置表单中的间隔时间
          form.setFieldsValue({
            intervalMinutes: intervalValue,
          });

          // 延迟一小段时间确保状态更新完成后再开始监听
          setTimeout(() => {
            startListening(intervalValue);
          }, 100);
        }
      });
    } else {
      // 如果没有taskIds参数，只加载数据
      loadInitialData();
    }
  }, [taskIds, interval, loadInitialData, startListening, form]);

  // 监听hanNotice状态变化，控制音频播放
  useEffect(() => {
    if (!hasNotice) {
      // 当hasNotice变为false时，停止音频播放
      stopContinuousSound();
    }
  }, [hasNotice, stopContinuousSound]);

  // 页面标题闪烁
  useEffect(() => {
    const originalTitle = document.title;
    let interval: NodeJS.Timeout;
    if (hasNotice) {
      interval = setInterval(() => {
        document.title =
          document.title === originalTitle
            ? "【新消息】" + originalTitle
            : originalTitle;
      }, 1000);
    } else {
      document.title = originalTitle;
    }

    return () => {
      clearInterval(interval);
      document.title = originalTitle;
    };
  }, [hasNotice]);

  // 获取业务专题所有叶子节点的值（只能选择叶子节点）
  const getBusinessTopicLeafValues = (
    treeData: ExtendedDataNode[]
  ): string[] => {
    let leafValues: string[] = [];

    const traverse = (nodes: ExtendedDataNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        } else {
          leafValues.push(node.id as string); // 使用 id 字段
        }
      });
    };

    traverse(treeData);
    return leafValues;
  };

  // 获取责任单位所有节点的值（可以选择根节点）
  const getAllDepartmentValues = (treeData: ExtendedDataNode[]): string[] => {
    let allValues: string[] = [];

    const traverse = (nodes: ExtendedDataNode[]) => {
      nodes.forEach((node) => {
        allValues.push(node.deptCode as string); // 使用 deptCode 字段
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(treeData);
    return allValues;
  };

  // 过滤业务专题非叶子节点
  const filterBusinessTopicNonLeafValues = (
    values: string[],
    treeData: ExtendedDataNode[]
  ): string[] => {
    const leafValues = getBusinessTopicLeafValues(treeData);
    return values.filter((value) => leafValues.includes(value));
  };

  // 过滤责任单位无效节点（允许所有节点）
  const filterDepartmentInvalidValues = (
    values: string[],
    treeData: ExtendedDataNode[]
  ): string[] => {
    const allValues = getAllDepartmentValues(treeData);
    return values.filter((value) => allValues.includes(value));
  };

  // 业务专题选择变化
  const onBusinessTopicChange: TreeSelectProps["onChange"] = (values) => {
    // 过滤掉非叶子节点
    const filteredValues = filterBusinessTopicNonLeafValues(
      values,
      businessTopicsData
    );

    // 限制最多选择10个
    if (filteredValues.length > 10) {
      message.warning("业务专题最多只能选择10个");
      return;
    }

    form.setFieldsValue({
      businessTopics: filteredValues,
    });
  };

  // 责任单位选择变化
  const onDepartmentChange: TreeSelectProps["onChange"] = (values) => {
    // 过滤掉无效节点（允许所有节点）
    const filteredValues = filterDepartmentInvalidValues(
      values,
      departmentsData
    );
    form.setFieldsValue({
      departments: filteredValues,
    });
  };

  // 触发震动
  const triggerVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  // 显示浏览器通知
  const showBrowserNotification = (taskCount?: number) => {
    if ("Notification" in window) {
      const notificationBody = taskCount
        ? `您有 ${taskCount} 个新的待办任务！`
        : `检测到业务专题和责任单位有新任务`;

      if (Notification.permission === "granted") {
        new Notification("新任务提醒", {
          body: notificationBody,
          icon: "/favicon.ico",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("新任务提醒", {
              body: notificationBody,
              icon: "/favicon.ico",
            });
          }
        });
      }
    }
  };

  // 停止倒计时
  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(0);
  };

  // 停止监听
  const stopListening = () => {
    setIsListening(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // 停止倒计时
    stopCountdown();
    message.info("已停止监听");
  };

  // 标记消息为已读
  const markAsRead = () => {
    setHasNotice(false);
    stopContinuousSound(); // 停止持续播放提示音
    const newStartTime = new Date().toISOString();
    setStartTime(newStartTime); // 重置开始时间为当前时间
    startTimeRef.current = newStartTime; // 同时更新ref
    message.success("已标记为已读");
  };

  // 清空监听历史
  const clearHistory = () => {
    setListenHistory([]);
    message.success("监听历史已清空");
  };

  // 显示新任务详情
  const showTaskDetails = (item: ListenHistoryItem) => {
    setSelectedHistoryItem(item);
    setModalVisible(true);
  };

  // 导出选中的监听历史为JSON
  const exportSelectedHistory = () => {
    if (selectedHistoryKeys.length === 0) {
      message.warning("请先选择要导出的监听历史");
      return;
    }

    // 过滤出选中的历史记录
    const selectedItems = listenHistory.filter((item) =>
      selectedHistoryKeys.includes(item.id)
    );

    // 创建JSON数据
    const jsonData = JSON.stringify(selectedItems, null, 2);

    // 创建下载链接
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `监听历史_${formatDateTime(new Date().toISOString())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    message.success(`成功导出 ${selectedItems.length} 条监听历史`);
  };

  // 处理历史记录选择变化
  const onHistorySelectChange = (selectedRowKeys: string[]) => {
    setSelectedHistoryKeys(selectedRowKeys);
  };

  // 筛选监听历史
  useEffect(() => {
    if (filterNewTasksOnly) {
      setFilteredHistory(listenHistory.filter((item) => item.size > 0));
    } else {
      setFilteredHistory(listenHistory);
    }
  }, [listenHistory, filterNewTasksOnly]);

  // 获取业务专题名称
  const getBusinessTopicNames = (topicIds: string[]): string[] => {
    const findTopicName = (
      nodes: ExtendedDataNode[],
      id: string
    ): string | null => {
      for (const node of nodes) {
        if (node.id === id) {
          return node.name || "未知业务专题";
        }
        if (node.children && node.children.length > 0) {
          const found = findTopicName(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    return topicIds.map((id) => {
      const name = findTopicName(businessTopicsData, id);
      return name || "未知业务专题";
    });
  };

  // 获取责任单位名称
  const getDepartmentNames = (deptCodes: string[]): string[] => {
    const findDeptName = (
      nodes: ExtendedDataNode[],
      code: string
    ): string | null => {
      for (const node of nodes) {
        if (node.deptCode === code) {
          return node.deptName || "未知责任单位";
        }
        if (node.children && node.children.length > 0) {
          const found = findDeptName(node.children, code);
          if (found) return found;
        }
      }
      return null;
    };

    return deptCodes.map((code) => {
      const name = findDeptName(departmentsData, code);
      return name || "未知责任单位";
    });
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          {currentUser && (
            <div style={{ fontSize: "16px", fontWeight: "bold" }}>
              当前用户: {currentUser.chineseName} ({currentUser.policeCode})
            </div>
          )}
        </Col>
        <Col>
          <div style={{ fontSize: "16px", color: "#666" }}>
            当前时间: {formatDateTime(currentTime)}
          </div>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="监听设置" key="1">
          <Card title="监听设置" style={{ marginBottom: 20 }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                intervalMinutes: 5,
              }}
            >
              <Form.Item
                name="businessTopics"
                label="业务专题 (最多选择10个)"
                rules={[{ required: true, message: "请选择至少一个业务专题" }]}
              >
                <TreeSelect
                  treeData={businessTopicsData}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_CHILD}
                  placeholder={
                    dataLoading ? "正在加载业务专题..." : "请选择业务专题"
                  }
                  style={{ width: "100%" }}
                  treeNodeFilterProp="name"
                  fieldNames={{
                    label: "name",
                    value: "id",
                    children: "children",
                  }}
                  loading={dataLoading}
                  disabled={dataLoading || isListening}
                  notFoundContent={dataLoading ? "加载中..." : "无数据"}
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                  onChange={onBusinessTopicChange}
                />
              </Form.Item>

              <Form.Item name="departments" label="责任单位">
                <TreeSelect
                  treeData={departmentsData}
                  treeCheckable={true}
                  showCheckedStrategy={TreeSelect.SHOW_ALL}
                  placeholder={
                    dataLoading ? "正在加载责任单位..." : "请选择责任单位"
                  }
                  style={{ width: "100%" }}
                  treeNodeFilterProp="deptName"
                  fieldNames={{
                    label: "deptName",
                    value: "deptCode",
                    children: "children",
                  }}
                  loading={dataLoading}
                  disabled={dataLoading || isListening}
                  notFoundContent={dataLoading ? "加载中..." : "无数据"}
                  dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                  onChange={onDepartmentChange}
                />
              </Form.Item>

              <Form.Item
                name="intervalMinutes"
                label="监听间隔 (分钟)"
                rules={[{ required: true, message: "请输入监听间隔" }]}
              >
                <InputNumber min={1} placeholder="请输入监听间隔" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    onClick={() => startListening()}
                    disabled={isListening}
                  >
                    {isListening ? "监听中..." : "开始监听"}
                  </Button>

                  <Button onClick={stopListening} disabled={!isListening}>
                    停止监听
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {hasNotice ? (
            <Card
              title="🔔 新任务提醒"
              style={{
                border: "2px solid #ff9800",
                backgroundColor: "#fff7e6",
                animation: "blink 1s infinite",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#d46b08",
                }}
              >
                您有新的待办任务!
              </p>
              <p>检测到业务专题和责任单位有新任务下发。</p>
              <p style={{ color: "#666", fontSize: "12px" }}>
                监听开始时间: {formatDateTime(startTime)}
              </p>
              <Button type="primary" onClick={markAsRead} size="large">
                标记为已读
              </Button>
            </Card>
          ) : (
            <Card title="📊 当前状态">
              <Space direction="vertical">
                <p>
                  <strong>监听状态:</strong>
                  <span style={{ color: isListening ? "#52c41a" : "#666" }}>
                    {isListening ? "🟢 正在监听中..." : "⭕ 未开始监听"}
                  </span>
                </p>
                {isListening && (
                  <>
                    <p>
                      <strong>开始时间:</strong> {formatDateTime(startTime)}
                    </p>
                    {countdown > 0 && (
                      <p>
                        <strong>下次检查:</strong>
                        <span style={{ color: "#1890ff", fontWeight: "bold" }}>
                          {Math.floor(countdown / 60)}分{countdown % 60}秒后
                        </span>
                      </p>
                    )}
                  </>
                )}
                {!hasNotice && (
                  <p style={{ color: "#52c41a" }}>✅ 暂无新消息</p>
                )}
              </Space>
            </Card>
          )}
        </Tabs.TabPane>

        <Tabs.TabPane tab={`监听历史 (${listenHistory.length})`} key="2">
          <Card
            title="监听历史记录"
            extra={
              <Space>
                <Checkbox
                  checked={filterNewTasksOnly}
                  onChange={(e) => setFilterNewTasksOnly(e.target.checked)}
                >
                  仅显示有新任务的记录
                </Checkbox>
                {listenHistory.length > 0 && (
                  <Button size="small" onClick={exportSelectedHistory}>
                    导出选中
                  </Button>
                )}
                {listenHistory.length > 0 && (
                  <Button size="small" onClick={clearHistory}>
                    清空历史
                  </Button>
                )}
              </Space>
            }
          >
            {filteredHistory.length > 0 ? (
              <Table
                rowKey="id"
                dataSource={filteredHistory}
                pagination={{ pageSize: 10 }}
                rowSelection={{
                  selectedRowKeys: selectedHistoryKeys,
                  onChange: (selectedRowKeys) =>
                    onHistorySelectChange(selectedRowKeys as string[]),
                }}
                columns={[
                  {
                    title: "时间",
                    dataIndex: "timestamp",
                    render: (text: string) => formatDateTime(text),
                    sorter: (a, b) =>
                      new Date(a.timestamp).getTime() -
                      new Date(b.timestamp).getTime(),
                  },
                  {
                    title: "新任务数",
                    dataIndex: "size",
                    sorter: (a, b) => a.size - b.size,
                  },
                  {
                    title: "业务专题",
                    dataIndex: "businessTopics",
                    render: (topics: string[]) => {
                      const topicNames = getBusinessTopicNames(topics);
                      return (
                        <div>
                          <div>{topicNames.length} 个业务专题</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {topicNames.slice(0, 3).join(", ")}
                            {topicNames.length > 3
                              ? ` 等${topicNames.length}个`
                              : ""}
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    title: "责任单位",
                    dataIndex: "departments",
                    render: (depts: string[]) => {
                      const deptNames = getDepartmentNames(depts);
                      return (
                        <div>
                          <div>{deptNames.length} 个责任单位</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {deptNames.slice(0, 3).join(", ")}
                            {deptNames.length > 3
                              ? ` 等${deptNames.length}个`
                              : ""}
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    title: "操作",
                    key: "action",
                    render: (_, record: ListenHistoryItem) => (
                      <Button
                        type="link"
                        size="small"
                        onClick={() => showTaskDetails(record)}
                        disabled={record.size === 0}
                      >
                        {record.size > 0 ? "查看新任务" : "无新任务"}
                      </Button>
                    ),
                  },
                ]}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#999",
                }}
              >
                <p>暂无监听历史记录</p>
                <p style={{ fontSize: "12px" }}>
                  开始监听后，历史记录将显示在这里
                </p>
              </div>
            )}
          </Card>
        </Tabs.TabPane>
      </Tabs>

      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      {/* 新任务详情模态框 */}
      <Modal
        title="新任务详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedHistoryItem && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <p>
                <strong>监听时间:</strong>{" "}
                {formatDateTime(selectedHistoryItem.timestamp)}
              </p>
              <Form.Item noStyle shouldUpdate>
                {({ getFieldValue }) => (
                  <>
                    <p>
                      <strong>业务专题:</strong>{" "}
                      {getBusinessTopicNames(
                        selectedHistoryItem.businessTopics
                      ).join(", ")}
                    </p>
                    <p>
                      <strong>责任单位:</strong>{" "}
                      {getDepartmentNames(selectedHistoryItem.departments).join(
                        ", "
                      )}
                    </p>
                  </>
                )}
              </Form.Item>
            </div>
            <Table
              dataSource={selectedHistoryItem.hitRes}
              pagination={{ pageSize: 5 }}
              columns={[
                {
                  title: "任务名称",
                  dataIndex: "taskName",
                  render: (_, record: any) => {
                    const taskName = getTaskNameById(
                      record.taskId,
                      businessTopicsData
                    );
                    return taskName || record.taskName || "未知任务";
                  },
                },
                {
                  title: "任务ID",
                  dataIndex: "taskId",
                },
                {
                  title: "对象名称",
                  dataIndex: "objectName",
                },
                {
                  title: "管控时间",
                  dataIndex: "controlTime",
                  render: (text: string) => (text ? formatDateTime(text) : "-"),
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NoticeNew;

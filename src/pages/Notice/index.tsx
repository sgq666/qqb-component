import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TreeSelect, InputNumber, Button, message, Card, Space } from "antd";
import type { TreeSelectProps } from "antd";
import thirdservice from "../../services/thirdService";
import type { ApiResponse } from "../../types";
import dayjs from "dayjs";

// 格式化时间显示
const formatDateTime = (dateTimeString: string): string => {
  return dayjs(dateTimeString).format("YYYY-MM-DD HH:mm:ss");
};

// 数据转换和保护函数 - 确保数据结构符合TreeSelect要求
const transformTreeData = (
  data: any[],
  type: "business" | "department"
): ExtendedDataNode[] => {
  if (!Array.isArray(data)) {
    console.warn(`${type} 数据不是数组格式:`, data);
    return [];
  }

  return data.map((item: any) => {
    const transformed: ExtendedDataNode = {
      ...item,
      // 确保必要字段存在
      children: item.children
        ? transformTreeData(item.children, type)
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
  [key: string]: any;
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
    children: [
      {
        deptCode: "100001",
        deptName: "综合处",
        children: [
          { deptCode: "100001001", deptName: "秘书科" },
          { deptCode: "100001002", deptName: "文印科" },
        ],
      },
      {
        deptCode: "100002",
        deptName: "信息处",
        children: [
          { deptCode: "100002001", deptName: "网络管理科" },
          { deptCode: "100002002", deptName: "系统维护科" },
        ],
      },
      { deptCode: "100003", deptName: "督查处" },
    ],
  },
  {
    deptCode: "200000",
    deptName: "市发展改革委",
    children: [
      {
        deptCode: "200001",
        deptName: "发展规划处",
        children: [
          { deptCode: "200001001", deptName: "城市规划科" },
          { deptCode: "200001002", deptName: "产业规划科" },
        ],
      },
      {
        deptCode: "200002",
        deptName: "投资管理处",
        children: [
          { deptCode: "200002001", deptName: "项目审批科" },
          { deptCode: "200002002", deptName: "招商引资科" },
        ],
      },
      { deptCode: "200003", deptName: "价格监督处" },
    ],
  },
  {
    deptCode: "300000",
    deptName: "市教育局",
    children: [
      { deptCode: "300001", deptName: "基础教育处" },
      { deptCode: "300002", deptName: "职业教育处" },
      { deptCode: "300003", deptName: "高等教育处" },
    ],
  },
  {
    deptCode: "400000",
    deptName: "市卫生健康委",
    children: [
      { deptCode: "400001", deptName: "医政医管处" },
      { deptCode: "400002", deptName: "疾病预防控制处" },
      { deptCode: "400003", deptName: "妇幼健康处" },
    ],
  },
];

const Notice: React.FC = () => {
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

  const taskIds = searchParams.get("taskIds") || "";
  const interval = searchParams.get("interval") || 1;
  const [hasNotice, setHasNotice] = useState<boolean>(false);
  const [businessTopics, setBusinessTopics] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(5);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<string>(new Date().toISOString());
  const [countdown, setCountdown] = useState<number>(0); // 倒计时秒数

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

  // 播放提示音
  const playSound = useCallback(() => {
    try {
      if (audioRef.current) {
        // 重置音频到开始位置
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e: any) => {
          console.log(
            "提示音播放失败，可能是浏览器限制或音频文件问题:",
            e.message
          );
          console.log("🔔 新任务提醒！");
        });
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
  const stopContinuousSound = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
      console.log("⏹️ 停止持续播放提示音");
    }
  };

  // 检查是否有新任务
  const checkForNewTasks = useCallback(async (taskIdsParam?: string[]) => {
    try {
      console.log("📡 检查新任务中...");

      // 记录请求前的时间，用于参数 - 使用 ref 获取最新值
      const currentStartTime = startTimeRef.current;
      
      // 使用传入的taskIdsParam或默认的businessTopics
      const effectiveTaskIds = taskIdsParam !== undefined ? taskIdsParam : businessTopics;
      
      console.log("🔍 调试信息:", {
        deptCodes: departments,
        taskIds: effectiveTaskIds,
        startTime: formatDateTime(currentStartTime),
        当前时间: formatDateTime(new Date().toISOString()),
      });

      // 添加额外的调试信息
      console.log("🔍 详细调试信息:", {
        departmentsLength: departments.length,
        businessTopicsLength: effectiveTaskIds.length,
        departmentsContent: departments,
        businessTopicsContent: effectiveTaskIds,
        isDepartmentsArray: Array.isArray(departments),
        isBusinessTopicsArray: Array.isArray(effectiveTaskIds),
      });

      const noticeRes: ApiResponse<any> = await thirdservice.notice({
        deptCodes: departments,
        taskIds: effectiveTaskIds, // 使用effectiveTaskIds而不是businessTopics
        startTime: formatDateTime(currentStartTime),
      });
      const data = noticeRes.data;

      // 调试用模拟数据，暂时返回无新任务
      // const data = { size: 1 }; // 调试时返回0，避免连续触发提醒

      if (data.size > 0) {
        console.log(`✅ 检查完成：发现 ${data.size} 个新任务`);
        setHasNotice(true);
        startContinuousSound(); // 开始持续播放提示音
        triggerVibration();
        showBrowserNotification(data.size);
        message.success(`检测到 ${data.size} 个新任务！`);
      } else {
        console.log("✅ 检查完成：暂无新任务");
      }

      // 每次检查完成后更新startTime为当前时间
      const newStartTime = new Date().toISOString();
      console.log("⏰ 更新startTime:", {
        请求时使用的时间: formatDateTime(currentStartTime),
        更新后的时间: formatDateTime(newStartTime),
      });
      // 同时更新状态和引用
      setStartTime(newStartTime);
      startTimeRef.current = newStartTime;
    } catch (error) {
      console.error("检查新任务失败:", error);
      message.error("检查新任务失败，请检查网络连接");
    }
  }, [businessTopics, departments, startTimeRef, startContinuousSound]);

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
  }, [countdownRef, setCountdown]);

  // 将 startListening 函数移到这里，在 useEffect 之前声明
  const startListening = useCallback((intervalValue?: number, taskIdsParam?: string[]) => {
    // 业务专题必须选中至少一个
    // 使用传入的taskIdsParam或默认的businessTopics
    const effectiveTaskIds = taskIdsParam !== undefined ? taskIdsParam : businessTopics;
    console.log("businessTopics:{}", effectiveTaskIds);
    
    if (effectiveTaskIds.length === 0) {
      // 当taskIds为"-1"时不显示警告，因为这是特殊标识
      if (!taskIds) {
        // 只有手动点击时才显示警告
        message.warning("请选择至少一个业务专题");
        return;
      }
    }

    // 使用传入的intervalValue或默认的intervalMinutes
    const effectiveInterval = intervalValue !== undefined ? intervalValue : intervalMinutes;
    
    if (!effectiveInterval || effectiveInterval <= 0) {
      message.warning("请输入有效的监听间隔");
      return;
    }

    setIsListening(true);
    const newStartTime = new Date().toISOString();
    setStartTime(newStartTime);
    startTimeRef.current = newStartTime; // 同时更新ref
    message.success("开始监听任务");

    // 立即执行一次检查，传递taskIdsParam参数
    checkForNewTasks(taskIdsParam);
    
    // 开始倒计时
    startCountdown(effectiveInterval * 60);

    // 设置定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      // 修复：不传递taskIdsParam参数，让checkForNewTasks函数内部自己判断使用哪个值
      // 这样可以确保每次都使用最新的businessTopics状态值
      checkForNewTasks();
      // 重新开始倒计时 - 在checkForNewTasks完成后重新开始倒计时
      // 通过延迟一小段时间确保状态更新完成
      setTimeout(() => {
        startCountdown(effectiveInterval * 60);
      }, 100);
    }, effectiveInterval * 60 * 1000);
  }, [businessTopics, intervalMinutes, taskIds, checkForNewTasks, startCountdown]);

  // 初始化加载数据
  const loadInitialData = useCallback(async () => {
    setDataLoading(true);
    try {
      // 并行请求业务专题和责任单位数据
      const [businessTopicsResponse, departmentsResponse] = await Promise.all([
        loadBusinessTopics(),
        loadDepartments(),
      ]);

      setBusinessTopicsData(businessTopicsResponse);
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
  }, []);

  // 初始化加载数据
  useEffect(() => {
    loadInitialData().then(() => {
      // 数据加载完成后，检查是否有taskIds参数
      // 如果taskIds等于-1，则不触发自动选中和监听逻辑
      if (taskIds && taskIds !== "-1") {
        // 将逗号分隔的字符串转换为数组
        const taskIdArray = taskIds
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id);

        console.log("有效的业务专题ID：", taskIdArray);

        // 设置选中的业务专题
        setBusinessTopics(taskIdArray);
        console.log("设置后的业务专题ID：", taskIdArray); // 使用taskIdArray而不是businessTopics状态
        
        // 如果有有效的业务专题，则自动开始监听
        if (taskIdArray.length > 0) {
          let intervalValue = 5; // 默认间隔5分钟
          if (interval && !isNaN(Number(interval)) && Number(interval) > 0) {
            intervalValue = Number(interval);
          }
          
          // 直接使用intervalValue而不是通过状态，因为状态更新是异步的
          setIntervalMinutes(intervalValue);
          
          // 延迟一小段时间确保状态更新完成后再开始监听
          setTimeout(() => {
            startListening(intervalValue, taskIdArray);
          }, 100);
        }
      }
    });
  }, [taskIds, interval, loadInitialData, startListening]);

  // 初始化音频
  useEffect(() => {
    // 创建音频对象
    audioRef.current = new Audio();

    // 尝试加载 public/audio/warnning.mp3，如果失败则使用默认提示音
    const warningAudio = new Audio("/audio/warnning.mp3");

    warningAudio.oncanplaythrough = () => {
      // 如果能成功加载外部音频，则使用它
      if (warningAudio.duration > 0) {
        audioRef.current!.src = "/audio/warnning.mp3";
        console.log("✅ 成功加载外部警告音频");
      } else {
        // 如果文件存在但无法播放（如空文件），使用默认提示音
        setDefaultAudioSource();
      }
    };

    warningAudio.onerror = () => {
      // 如果加载失败，使用默认提示音
      setDefaultAudioSource();
    };

    // 设置音量
    audioRef.current.volume = 0.5;

    // 定义设置默认音频源的函数
    function setDefaultAudioSource() {
      console.log("⚠️ 外部警告音频加载失败，使用默认提示音");
      audioRef.current!.src =
        "data:audio/wav;base64,UklGRpACAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YYwCAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBjiR1/LNeSMFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSMFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSMFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LNeSMF";
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
    };
  }, []);

  // 加载业务专题数据
  const loadBusinessTopics = async (): Promise<ExtendedDataNode[]> => {
    try {
      console.log("📡 正在加载业务专题数据...");
      const deptRes: ApiResponse<any[]> = await thirdservice.taskTree();

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
  const loadDepartments = async (): Promise<ExtendedDataNode[]> => {
    try {
      console.log("📡 正在加载责任单位数据...");
      const taskRes: ApiResponse<any[]> = await thirdservice.deptTree();

      // 检查响应数据
      if (!taskRes.data || !Array.isArray(taskRes.data)) {
        console.warn("责任单位数据格式异常:", taskRes);
        message.warning("责任单位数据格式异常，使用模拟数据");
        return mockDepartments;
      }

      const transformedData = transformTreeData(taskRes.data, "department");
      console.log("✅ 责任单位数据加载成功:", transformedData);
      return transformedData;
    } catch (error) {
      console.error("责任单位数据加载失败:", error);
      message.error("责任单位数据加载失败，使用模拟数据");
      return mockDepartments;
    }
  };

  // 监听hanNotice状态变化，控制音频播放
  useEffect(() => {
    if (!hasNotice) {
      // 当hasNotice变为false时，停止音频播放
      stopContinuousSound();
    }
  }, [hasNotice]);

  // 页面标题闪烁
  useEffect(() => {
    const originalTitle = document.title;
    let interval: NodeJS.Timeout;
    if (hasNotice) {
      interval = setInterval(() => {
        document.title =
          document.title === originalTitle ? "【新消息】" + originalTitle : originalTitle;
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

    setBusinessTopics(filteredValues);
  };

  // 责任单位选择变化
  const onDepartmentChange: TreeSelectProps["onChange"] = (values) => {
    // 过滤掉无效节点（允许所有节点）
    const filteredValues = filterDepartmentInvalidValues(
      values,
      departmentsData
    );
    setDepartments(filteredValues);
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

  return (
    <div>
      <h1>待办消息监听</h1>

      <Card title="监听设置" style={{ marginBottom: 20 }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <label>业务专题 (最多选择10个): </label>
            <TreeSelect
              treeData={businessTopicsData}
              value={businessTopics}
              onChange={onBusinessTopicChange}
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
              disabled={dataLoading || isListening} // 添加isListening状态控制
              notFoundContent={dataLoading ? "加载中..." : "无数据"}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            />
          </div>

          <div>
            <label>责任单位: </label>
            <TreeSelect
              treeData={departmentsData}
              value={departments}
              onChange={onDepartmentChange}
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
              disabled={dataLoading || isListening} // 添加isListening状态控制
              notFoundContent={dataLoading ? "加载中..." : "无数据"}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            />
          </div>

          <div>
            <label>监听间隔 (分钟): </label>
            <InputNumber
              min={1}
              value={intervalMinutes}
              onChange={(value) =>
                setIntervalMinutes(value === null ? 5 : value)
              }
              placeholder="请输入监听间隔"
            />
          </div>

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
        </Space>
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
          <p style={{ fontSize: "16px", fontWeight: "bold", color: "#d46b08" }}>
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
                  <strong>监听间隔:</strong> {intervalMinutes} 分钟
                </p>
                <p>
                  <strong>业务专题:</strong> {businessTopics.length} 个
                </p>
                <p>
                  <strong>责任单位:</strong> {departments.length} 个
                </p>
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
            {!hasNotice && <p style={{ color: "#52c41a" }}>✅ 暂无新消息</p>}
          </Space>
        </Card>
      )}

      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Notice;

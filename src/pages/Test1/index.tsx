// src/pages/Test1/index.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Image,
  Space,
  Input,
  Typography,
  message,
  Row,
  Col,
  Affix,
  Modal,
} from "antd";
import {
  CloseOutlined,
  VerticalAlignTopOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
} from "@ant-design/icons";
import thirdservice from "../../services/thirdService";
import { ApiResponse } from "../../types/index";
import demoData from "./data";

const { Text } = Typography;
const { confirm } = Modal;

interface ExtInfoItem {
  id: string; // 使用id字段作为唯一标识
  fileDownloadUrlBase64: string;
  fileName: string;
  fileExt?: string;
}

interface ExtInfo {
  fileList: ExtInfoItem[];
  relationId?: string;
}

interface StuffItem {
  stuffName: string;
  extInfo: ExtInfo;
}

interface SubmitData {
  stuffName: string;
  extInfo: {
    fileUnid: string; // 保持字段名为fileUnid
    issue: string;
  };
}

// 添加初始化数据类型定义
interface InitDataItem {
  stuffName: string;
  extInfo: {
    fileUnid: string; // 保持字段名为fileUnid
    issue: string;
  };
}

// 判断是否为图片文件
const isImageFile = (fileExt?: string): boolean => {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  return fileExt ? imageExts.includes(fileExt.toLowerCase()) : false;
};

// 判断是否为PDF文件
const isPdfFile = (fileExt?: string): boolean => {
  return fileExt ? fileExt.toLowerCase() === 'pdf' : false;
};

// 获取文件图标
const getFileIcon = (fileExt?: string) => {
  if (isImageFile(fileExt)) {
    return <FileImageOutlined />;
  } else if (isPdfFile(fileExt)) {
    return <FilePdfOutlined />;
  } else {
    return <FileOutlined />;
  }
};

// 获取文件类型描述
const getFileTypeDescription = (fileExt?: string) => {
  if (isImageFile(fileExt)) {
    return "图片文件";
  } else if (isPdfFile(fileExt)) {
    return "PDF文件";
  } else {
    return "附件文件";
  }
};

const Test1: React.FC = () => {
  const [data, setData] = useState<StuffItem[]>([]);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIssue, setCurrentIssue] = useState<string>("");
  const [selectedImageName, setSelectedImageName] = useState<string | null>(
    null
  );
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  // 修改 searchParams 的获取方式，支持 hash 路由
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

  console.log(searchParams.get("initData"));
  console.log(searchParams.get("id"));
  console.log(`version:${process.env.REACT_APP_VERSION}`);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = searchParams.get("id");
        
        // 当id为-1时，使用demoData
        if (id === "-1") {
          setData(demoData);
          
          // 初始化问题数据
          const initialIssues: Record<string, string> = {};
          const initData: InitDataItem[] = JSON.parse(
            searchParams.get("initData") || "[]"
          );
          initData.forEach((item) => {
            initialIssues[item.extInfo.fileUnid] = item.extInfo.issue;
          });
          setIssues(initialIssues);
          return;
        }
        
        if (!id) {
          message.error("缺少流水号");
          return;
        }
        
        const result: ApiResponse<string> = await thirdservice.getSuffFile({
          id,
        });
        
        // 兼容处理可能返回的数组字符串或数组
        let parsedData: StuffItem[] = [];
        if (typeof result.data === 'string') {
          try {
            const data = JSON.parse(result.data);
            // 确保解析后的数据是数组
            if (Array.isArray(data)) {
              parsedData = data;
            } else {
              // 如果不是数组，将其包装在数组中
              parsedData = [data];
            }
          } catch (parseError) {
            console.error("解析数据失败:", parseError);
            message.error("数据格式错误");
            return;
          }
        } else if (Array.isArray(result.data)) {
          parsedData = result.data;
        } else {
          // 如果是对象但不是数组，将其包装在数组中
          parsedData = [result.data];
        }
        
        setData(parsedData);

        // 初始化问题数据
        const initialIssues: Record<string, string> = {};
        const initData: InitDataItem[] = JSON.parse(
          searchParams.get("initData") || "[]"
        );
        initData.forEach((item) => {
          initialIssues[item.extInfo.fileUnid] = item.extInfo.issue;
        });
        setIssues(initialIssues);
      } catch (error) {
        console.error("获取数据失败:", error);
        message.error("获取数据失败");
      }
    };

    fetchData();
  }, [searchParams]);

  // 监听选中图片和问题输入的变化
  useEffect(() => {
    if (selectedImage && currentIssue) {
      // 检查当前输入的问题是否已保存
      if (issues[selectedImage] !== currentIssue) {
        setUnsavedChanges(true);
      } else {
        setUnsavedChanges(false);
      }
    } else {
      setUnsavedChanges(false);
    }
  }, [selectedImage, currentIssue, issues]);

  const onPostMessage = (issueSummary: string, submitData: String) => {
    const result = { issueSummary, submitData };
    const message = {
      data: {
        id: searchParams.get("businessId"),
        code: 200,
        message: "操作成功",
        result,
      },
      type: "tgram_success",
    };
    console.log(message);
    window.top && window.top.window.postMessage({ ...message }, "*");
  };

  // 检查是否有未保存的更改并提示用户
  const checkUnsavedChanges = (action: string, callback: () => void) => {
    if (unsavedChanges) {
      confirm({
        title: "您有未保存的更改",
        content: `您已输入问题描述但尚未保存，确定要${action}吗？`,
        okText: "确定",
        cancelText: "取消",
        onOk() {
          callback();
        },
        onCancel() {
          // 用户取消操作
        },
      });
    } else {
      callback();
    }
  };

  const handleImageSelect = (fileUnid: string, fileName: string) => {
    // 如果有未保存的更改，提示用户
    if (unsavedChanges) {
      confirm({
        title: "您有未保存的更改",
        content: "您已输入问题描述但尚未保存，确定要切换图片吗？",
        okText: "确定",
        cancelText: "取消",
        onOk() {
          setSelectedImage(fileUnid);
          setSelectedImageName(fileName);
          setCurrentIssue(issues[fileUnid] || "");
          setUnsavedChanges(false); // 重置未保存状态
        },
        onCancel() {
          // 用户取消操作
        },
      });
    } else {
      setSelectedImage(fileUnid);
      setSelectedImageName(fileName);
      setCurrentIssue(issues[fileUnid] || "");
    }
  };

  const handleSaveIssue = () => {
    if (!selectedImage) {
      message.warning("请先选择一个附件");
      return;
    }

    if (!currentIssue.trim()) {
      message.warning("请输入问题描述");
      return;
    }

    setIssues((prev) => ({
      ...prev,
      [selectedImage]: currentIssue,
    }));

    setUnsavedChanges(false); // 保存后重置未保存状态
    message.success("问题已保存");
  };

  const handleClearIssue = (fileUnid: string) => {
    const newIssues = { ...issues };
    delete newIssues[fileUnid];
    setIssues(newIssues);

    if (selectedImage === fileUnid) {
      setSelectedImage(null);
      setSelectedImageName(null);
      setCurrentIssue("");
      setUnsavedChanges(false); // 清除后重置未保存状态
    }

    message.success("问题已清除");
  };

  const handleSubmit = () => {
    checkUnsavedChanges("提交", () => {
      const submitData: SubmitData[] = [];

      Object.entries(issues).forEach(([fileUnid, issue]) => {
        data.forEach((item) => {
          const foundImage = item.extInfo.fileList.find(
            (img) => img.id === fileUnid // 使用id字段进行匹配
          );
          if (foundImage) {
            submitData.push({
              stuffName: item.stuffName,
              extInfo: {
                fileUnid: fileUnid, // 保持字段名为fileUnid
                issue: issue,
              },
            });
          }
        });
      });

      // 输出到控制台
      console.log(JSON.stringify(submitData));

      // 打印问题汇总文本
      let issueSummary = "问题汇总:\n";
      if (Object.keys(issues).length > 0) {
        Object.entries(issues).forEach(([fileUnid, issue], index) => {
          let stuffItem: StuffItem | undefined;
          let imageItem: ExtInfoItem | undefined;
          let imageIndex: number | undefined;

          data.forEach((item) => {
            const foundImageIndex = item.extInfo.fileList.findIndex(
              (img) => img.id === fileUnid // 使用id字段进行匹配
            );
            if (foundImageIndex !== -1) {
              stuffItem = item;
              imageItem = item.extInfo.fileList[foundImageIndex];
              imageIndex = foundImageIndex + 1;
            }
          });

          issueSummary += `${index + 1}. ${
            stuffItem?.stuffName ?? "未知材料"
          }的第${imageIndex ?? 0}个附件（${
            imageItem?.fileName ?? "未知文件"
          }）发现的问题：${issue}\n`;
        });
      } else {
        issueSummary += "暂无问题反馈";
      }

      console.log(issueSummary);
      message.success("问题数据已输出到控制台");
      onPostMessage(issueSummary, JSON.stringify(submitData));
    });
  };

  // 滚动到顶部
  const scrollToTop = () => {
    checkUnsavedChanges("返回顶部", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  // 取消选择
  const handleCancelSelect = () => {
    if (unsavedChanges) {
      confirm({
        title: "您有未保存的更改",
        content: "您已输入问题描述但尚未保存，确定要取消选择吗？",
        okText: "确定",
        cancelText: "取消",
        onOk() {
          setSelectedImage(null);
          setSelectedImageName(null);
          setCurrentIssue("");
          setUnsavedChanges(false);
        },
        onCancel() {
          // 用户取消操作
        },
      });
    } else {
      setSelectedImage(null);
      setSelectedImageName(null);
      setCurrentIssue("");
    }
  };

  // 处理文件预览
  const handleFilePreview = (file: ExtInfoItem) => {
    if (isPdfFile(file.fileExt)) {
      // 对于PDF文件，打开新窗口预览
      const pdfUrl = `${process.env.REACT_APP_API_BASE_URL}/${file.fileDownloadUrlBase64}`;
      window.open(pdfUrl, '_blank');
    } else if (isImageFile(file.fileExt)) {
      // 图片文件已经在Image组件中支持预览
      // 这里不需要额外处理
    } else {
      // 对于其他文件类型，提示下载
      const fileUrl = `${process.env.REACT_APP_API_BASE_URL}/${file.fileDownloadUrlBase64}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 固定在顶部的问题反馈区域 */}
      <Affix offsetTop={0} style={{ marginBottom: 20 }}>
        <Card
          title={`附件审批，流水号:${searchParams.get("id")}`}
          size="small"
          style={{
            marginBottom: "20px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            backgroundColor: "#fafafa",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text>选中附件: {selectedImageName || "未选择"}</Text>
            <Input.TextArea
              rows={3}
              placeholder="请输入您发现的问题，如：文件模糊、文件错误等"
              value={currentIssue}
              onChange={(e) => setCurrentIssue(e.target.value)}
              disabled={!selectedImage}
            />
            <Space wrap>
              <Button
                type="primary"
                onClick={handleSaveIssue}
                disabled={!selectedImage}
              >
                保存问题
              </Button>
              <Button onClick={handleCancelSelect}>取消选择</Button>
              <Button type="primary" danger onClick={handleSubmit}>
                提交问题
              </Button>
              <Button icon={<VerticalAlignTopOutlined />} onClick={scrollToTop}>
                返回顶部
              </Button>
            </Space>
          </Space>
        </Card>
      </Affix>

      <Card title="附件展示页面">
        <Space direction="vertical" style={{ width: "100%" }}>
          {data.map((item: StuffItem, index: number) => (
            <Card
              key={index}
              title={item.stuffName}
              style={{ marginBottom: "20px" }}
            >
              <Row gutter={[16, 16]}>
                {item.extInfo.fileList?.map(
                  (img: ExtInfoItem, imgIndex: number) => {
                    const isSelected = selectedImage === img.id; // 使用id字段进行比较
                    const hasIssue = !!issues[img.id]; // 使用id字段进行比较
                    const isImage = isImageFile(img.fileExt);
                    const isPdf = isPdfFile(img.fileExt);

                    return (
                      <Col xs={24} sm={12} md={8} lg={6} key={img.id}> {/* 使用id作为key */}
                        <div
                          style={{
                            border: isSelected
                              ? "2px solid #1890ff"
                              : hasIssue
                              ? "2px solid #ff4d4f"
                              : "1px solid #d9d9d9",
                            borderRadius: "8px",
                            padding: "8px",
                            backgroundColor: isSelected
                              ? "#e6f7ff"
                              : hasIssue
                              ? "#fff2f0"
                              : "white",
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* 文件容器 */}
                          <div
                            style={{
                              width: "100%",
                              overflow: "hidden",
                              borderRadius: "4px",
                              marginBottom: "8px",
                              textAlign: "center",
                            }}
                          >
                            {isImage ? (
                              // 图片文件使用Image组件
                              <Image
                                src={
                                  process.env.REACT_APP_API_BASE_URL +
                                  "/" +
                                  img.fileDownloadUrlBase64
                                }
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                                style={{
                                  width: "100%",
                                  height: "150px",
                                  objectFit: "cover",
                                }}
                                preview={true}
                              />
                            ) : (
                              // 非图片文件显示占位符和文件信息
                              <div
                                style={{
                                  height: "150px",
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#f5f5f5",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleFilePreview(img)}
                              >
                                <div style={{ fontSize: "48px", color: isPdf ? "#ff4d4f" : "#1890ff" }}>
                                  {getFileIcon(img.fileExt)}
                                </div>
                                <div style={{ marginTop: "8px", textAlign: "center" }}>
                                  <Text strong>{getFileTypeDescription(img.fileExt)}</Text>
                                </div>
                              </div>
                            )}
                          </div>

                          <div style={{ marginTop: "8px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px",
                              }}
                            >
                              <Text
                                strong
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  flex: 1,
                                }}
                              >
                                {img.fileName}
                              </Text>
                              <Button
                                type={isSelected ? "primary" : "default"}
                                size="small"
                                icon={
                                  isSelected ? <CheckCircleOutlined /> : null
                                }
                                onClick={() =>
                                  handleImageSelect(img.id, img.fileName) // 使用id字段
                                }
                                style={{
                                  flexShrink: 0,
                                  marginLeft: "8px",
                                }}
                              >
                                {isSelected ? "已选中" : "选择"}
                              </Button>
                            </div>

                            {/* 非图片文件添加预览按钮 */}
                            {!isImage && (
                              <div style={{ marginBottom: "8px" }}>
                                <Button 
                                  type="link" 
                                  size="small"
                                  onClick={() => handleFilePreview(img)}
                                  block
                                >
                                  {isPdf ? "预览PDF" : "下载文件"}
                                </Button>
                              </div>
                            )}

                            {hasIssue && (
                              <div
                                style={{
                                  padding: "8px",
                                  backgroundColor: "#fff2f0",
                                  border: "1px solid #ffccc7",
                                  borderRadius: "4px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                  }}
                                >
                                  <Text type="danger" style={{ flex: 1 }}>
                                    问题: {issues[img.id]} {/* 使用id字段 */}
                                  </Text>
                                  <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    danger
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClearIssue(img.id); // 使用id字段
                                    }}
                                    style={{
                                      marginLeft: "8px",
                                      color: "#ff4d4f",
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                    );
                  }
                )}
              </Row>
            </Card>
          ))}

          <Card title="问题汇总" size="small">
            {Object.keys(issues).length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {Object.entries(issues).map(([fileUnid, issue], index) => {
                  let stuffItem: StuffItem | undefined;
                  let imageItem: ExtInfoItem | undefined;
                  let imageIndex: number | undefined;

                  data.forEach((item) => {
                    const foundImageIndex = item.extInfo.fileList.findIndex(
                      (img) => img.id === fileUnid // 使用id字段进行匹配
                    );
                    if (foundImageIndex !== -1) {
                      stuffItem = item;
                      imageItem = item.extInfo.fileList[foundImageIndex];
                      imageIndex = foundImageIndex + 1;
                    }
                  });

                  return (
                    <Card
                      size="small"
                      key={fileUnid}
                      style={{
                        backgroundColor: "#fffbe6",
                        border: "1px solid #ffe58f",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <Text strong>
                            {stuffItem?.stuffName ?? "未知材料"}的第
                            {imageIndex ?? 0}个附件（
                            {imageItem?.fileName ?? "未知文件"}）
                          </Text>
                          <br />
                          <Text type="danger">发现的问题：{issue}</Text>
                        </div>
                        <Button
                          type="primary"
                          danger
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearIssue(fileUnid);
                          }}
                        >
                          清除
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </Space>
            ) : (
              <Text>暂无问题反馈</Text>
            )}
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default Test1;
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
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import thirdservice from "../../services/thirdService";
import { ApiResponse } from "../../types/index";
import demoData from "./data";

const { Text } = Typography;

interface ExtInfoItem {
  clid: string;
  fileDownloadUrlBase64: string;
  fileName: string;
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
    clid: string;
    issue: string;
  };
}

// 添加初始化数据类型定义
interface InitDataItem {
  stuffName: string;
  extInfo: {
    clid: string;
    issue: string;
  };
}

const Test1: React.FC = () => {
  const [data, setData] = useState<StuffItem[]>([]);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIssue, setCurrentIssue] = useState<string>("");
  const [selectedImageName, setSelectedImageName] = useState<string | null>(
    null
  );
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );
  console.log(searchParams.get("initData"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result: ApiResponse<string> = await thirdservice.getSuffFile({
          id: searchParams.get("id"),
        });
        setData(JSON.parse(result.data));
        // setData(demoData);

        // 初始化问题数据
        const initialIssues: Record<string, string> = {};
        const initData: InitDataItem[] = JSON.parse(
          searchParams.get("initData") || "[]"
        );
        initData.forEach((item) => {
          initialIssues[item.extInfo.clid] = item.extInfo.issue;
        });
        setIssues(initialIssues);
      } catch (error) {
        console.error("获取数据失败:", error);
        message.error("获取数据失败");
      }
    };

    fetchData();
  }, [searchParams]);

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

  const handleImageSelect = (clid: string, fileName: string) => {
    setSelectedImage(clid);
    setSelectedImageName(fileName);
    setCurrentIssue(issues[clid] || "");
  };

  const handleSaveIssue = () => {
    if (!selectedImage) {
      message.warning("请先选择一张图片");
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

    message.success("问题已保存");
  };

  const handleClearIssue = (clid: string) => {
    const newIssues = { ...issues };
    delete newIssues[clid];
    setIssues(newIssues);

    if (selectedImage === clid) {
      setSelectedImage(null);
      setSelectedImageName(null);
      setCurrentIssue("");
    }

    message.success("问题已清除");
  };

  const handleSubmit = () => {
    const submitData: SubmitData[] = [];

    Object.entries(issues).forEach(([clid, issue]) => {
      data.forEach((item) => {
        const foundImage = item.extInfo.fileList.find(
          (img) => img.clid === clid
        );
        if (foundImage) {
          submitData.push({
            stuffName: item.stuffName,
            extInfo: {
              clid: clid,
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
      Object.entries(issues).forEach(([clid, issue], index) => {
        let stuffItem: StuffItem | undefined;
        let imageItem: ExtInfoItem | undefined;
        let imageIndex: number | undefined;

        data.forEach((item) => {
          const foundImageIndex = item.extInfo.fileList.findIndex(
            (img) => img.clid === clid
          );
          if (foundImageIndex !== -1) {
            stuffItem = item;
            imageItem = item.extInfo.fileList[foundImageIndex];
            imageIndex = foundImageIndex + 1;
          }
        });

        issueSummary += `${index + 1}. ${
          stuffItem?.stuffName ?? "未知材料"
        }的第${imageIndex ?? 0}张图片（${
          imageItem?.fileName ?? "未知文件"
        }）发现的问题：${issue}\n`;
      });
    } else {
      issueSummary += "暂无问题反馈";
    }

    console.log(issueSummary);
    message.success("问题数据已输出到控制台");
    onPostMessage(issueSummary, JSON.stringify(submitData));
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card title="图片展示页面">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Card size="small" title="问题反馈" style={{ marginBottom: "20px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text>选中图片: {selectedImageName || "未选择"}</Text>
              <Input.TextArea
                rows={3}
                placeholder="请输入您发现的问题，如：图片模糊、图片错误等"
                value={currentIssue}
                onChange={(e) => setCurrentIssue(e.target.value)}
                disabled={!selectedImage}
              />
              <Space>
                <Button
                  type="primary"
                  onClick={handleSaveIssue}
                  disabled={!selectedImage}
                >
                  保存问题
                </Button>
                <Button
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedImageName(null);
                    setCurrentIssue("");
                  }}
                >
                  取消选择
                </Button>
                <Button type="primary" danger onClick={handleSubmit}>
                  提交问题
                </Button>
              </Space>
            </Space>
          </Card>

          {data.map((item: StuffItem, index: number) => (
            <Card
              key={index}
              title={item.stuffName}
              style={{ marginBottom: "20px" }}
            >
              <Row gutter={[16, 16]}>
                {item.extInfo.fileList?.map(
                  (img: ExtInfoItem, imgIndex: number) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={img.clid}>
                      <div
                        style={{
                          border:
                            selectedImage === img.clid
                              ? "2px solid red"
                              : "1px solid #d9d9d9",
                          borderRadius: "8px",
                          padding: "8px",
                          cursor: "pointer",
                          backgroundColor: issues[img.clid]
                            ? "#fffbe6"
                            : "white",
                        }}
                        onClick={() =>
                          handleImageSelect(img.clid, img.fileName)
                        }
                      >
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
                        />
                        <div style={{ marginTop: "8px" }}>
                          <Text strong>图片名称: {img.fileName}</Text>
                          {issues[img.clid] && (
                            <div
                              style={{
                                marginTop: "4px",
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
                                <Text type="danger">
                                  问题: {issues[img.clid]}
                                </Text>
                                <Button
                                  type="text"
                                  icon={<CloseOutlined />}
                                  danger
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleClearIssue(img.clid);
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
                  )
                )}
              </Row>
            </Card>
          ))}

          <Card title="问题汇总" size="small">
            {Object.keys(issues).length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {Object.entries(issues).map(([clid, issue], index) => {
                  let stuffItem: StuffItem | undefined;
                  let imageItem: ExtInfoItem | undefined;
                  let imageIndex: number | undefined;

                  data.forEach((item) => {
                    const foundImageIndex = item.extInfo.fileList.findIndex(
                      (img) => img.clid === clid
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
                      key={clid}
                      style={{
                        backgroundColor: "#fffbe6",
                        border: "1px solid #ffe58f",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <Text strong>
                            {stuffItem?.stuffName ?? "未知材料"}的第
                            {imageIndex ?? 0}张图片（
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
                            handleClearIssue(clid);
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

// Ocr 组件示例
import React, { useState, useRef, useMemo } from "react";
import { createWorker, OEM } from "tesseract.js";
import {
  Upload,
  Button,
  Spin,
  Progress,
  Card,
  Image,
  Typography,
  message,
  Checkbox,
  Space,
} from "antd";
import { UploadOutlined, CopyOutlined } from "@ant-design/icons";
import copyToClipboard from "../../utils/clipboard";

const { Text, Title, Paragraph } = Typography;

const Ocr: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [extractNumbersOnly, setExtractNumbersOnly] = useState<boolean>(false);
  const [originalText, setOriginalText] = useState<string>(""); // 保存原始识别文本

  const worker = useRef<any>(null);

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

  // 处理文本显示（根据选项决定是否只显示数字）
  const displayText = useMemo(() => {
    if (!originalText) return "";

    if (extractNumbersOnly) {
      // 提取数字相关的内容（包括小数、负数、百分比等）
      const numberPattern = /-?\d+\.?\d*%?/g;
      const matches = originalText.match(numberPattern);
      return matches ? matches.join("\n") : "";
    }

    return originalText;
  }, [originalText, extractNumbersOnly]);

  const initWorker = async () => {
    if (!worker.current) {
      try {
        worker.current = await createWorker("eng+chi_sim", OEM.DEFAULT, {
          cacheMethod: "none",
          workerBlobURL: false,
          workerPath: "/tessdata/worker.min.js",
          langPath: "/tessdata/langs",
          corePath: "/tessdata/tesseract-core.wasm.js",
          gzip: false,
          logger: (m) => {
            if (m.status === "loading tesseract core") {
              setProgressStatus("正在加载Tesseract核心...");
            } else if (m.status === "initializing tesseract") {
              setProgressStatus("正在初始化Tesseract...");
            } else if (m.status === "loading language traineddata") {
              setProgressStatus("正在加载语言包...");
            } else if (m.status === "recognizing text") {
              setProgressStatus("正在识别文本...");
            }
            if (m.progress) {
              setProgress(Math.round(m.progress * 100));
            }
          },
        });
      } catch (err) {
        console.error("Worker 初始化失败:", err);
        message.error("OCR 初始化失败，请检查资源文件");
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    // 检查文件类型
    if (!file.type.match("image.*")) {
      message.error("请选择图片文件");
      return false;
    }

    // 显示图片预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 开始OCR识别
    setLoading(true);
    setProgress(0);
    setText("");
    setOriginalText("");

    try {
      // 确保worker已初始化
      await initWorker();
      const result = await worker.current.recognize(file);
      setOriginalText(result.data.text); // 保存原始文本
      setText(result.data.text); // 设置显示文本
    } catch (error) {
      console.error("OCR识别失败:", error);
      message.error("OCR识别失败，请重试");
    } finally {
      setLoading(false);
    }

    return false;
  };

  const beforeUpload = (file: File) => {
    handleFileUpload(file);
    return false;
  };

  const copyText = () => {
    copyToClipboard(displayText);
  };

  const onPostMessage = (text: string) => {
    const result = { text };
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

  const handleOutputToConsole = () => {
    onPostMessage(displayText);
  };

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <Title level={3} style={{ textAlign: "center", marginBottom: "16px" }}>
        图片文本提取
      </Title>
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <Card
          title="上传图片"
          size="small"
          style={{ flex: 1 }}
          bodyStyle={{
            minHeight: "120px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center", width: "100%" }}>
            <Upload
              beforeUpload={beforeUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button
                icon={<UploadOutlined />}
                style={{ marginBottom: "12px" }}
              >
                选择图片
              </Button>
            </Upload>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "12px" }}
            >
              支持 JPG、PNG、JPEG 格式图片
            </Text>
          </div>
        </Card>

        <Card
          title="图片预览"
          size="small"
          style={{ flex: 1 }}
          bodyStyle={{ textAlign: "center" }}
        >
          <div style={{ padding: "12px", height: "100%" }}>
            {image ? (
              <Image
                src={image}
                alt="预览图片"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: "200px",
                  objectFit: "contain",
                  borderRadius: "4px",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                暂无图片
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 操作按钮区域 */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {originalText && (
          <Space>
            <Checkbox
              checked={extractNumbersOnly}
              onChange={(e) => setExtractNumbersOnly(e.target.checked)}
            >
              仅提取数字
            </Checkbox>
            <Button
              icon={<CopyOutlined />}
              onClick={copyText}
              type="primary"
              size="small"
            >
              复制文本
            </Button>
            <Button onClick={handleOutputToConsole} type="primary" size="small">
              确定
            </Button>
          </Space>
        )}
      </div>

      {/* 识别进度和结果区域 */}
      <div>
        {loading && (
          <Card title="识别进度" size="small" style={{ marginBottom: "16px" }}>
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <Spin size="large" />
              <div style={{ marginTop: "12px", fontSize: "14px" }}>
                {progressStatus}
              </div>
              <Progress
                percent={progress}
                style={{
                  marginTop: "12px",
                  maxWidth: "300px",
                  margin: "12px auto 0",
                }}
                showInfo
                size="small"
              />
            </div>
          </Card>
        )}

        {originalText && (
          <Card
            title={extractNumbersOnly ? "数字提取结果" : "识别结果"}
            size="small"
            extra={
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {extractNumbersOnly
                  ? "仅显示识别出的数字内容"
                  : "显示完整识别文本"}
              </Text>
            }
          >
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                fontSize: "14px",
                maxHeight: "300px",
                overflow: "auto",
              }}
            >
              <Paragraph
                style={{
                  whiteSpace: "pre-wrap",
                  margin: 0,
                }}
                editable={false}
              >
                {displayText || (extractNumbersOnly ? "未识别到数字内容" : "")}
              </Paragraph>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Ocr;

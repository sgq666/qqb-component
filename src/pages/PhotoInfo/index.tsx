// src/pages/PhotoInfo/index.tsx
import React, { useState, useRef, useMemo } from "react";
import {
  Upload,
  Button,
  Card,
  Space,
  Image,
  message,
  Slider,
  Select,
  Row,
  Col,
  Typography,
  Popover,
  Checkbox,
  Collapse,
  Form,
  Input,
  Tabs,
  Drawer,
} from "antd";
import { SketchPicker } from "react-color";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import EXIF from "exif-js";

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface ExifData {
  dateTime?: string;
  make?: string;
  model?: string;
  latitude?: number;
  longitude?: number;
  software?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: number;
  focalLength?: string;
}

interface WatermarkField {
  id: string;
  label: string;
  value?: string;
  enabled: boolean;
}

interface WatermarkConfig {
  fields: WatermarkField[];
  fontSize: number;
  color: string;
  position:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
  opacity: number;
  customText: string;
}

const PhotoInfo: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
    fields: [],
    fontSize: 25,
    color: "#000000",
    position: "bottom-right",
    opacity: 0.8,
    customText: "",
  });
  const [watermarkedImageUrl, setWatermarkedImageUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const setting = searchParams.get("setting") || "1";
  const time = searchParams.get("time") || "1";
  const equipment = searchParams.get("equipment") || "0";
  const gps = searchParams.get("gps") || "1";
  const text = searchParams.get("text") || "";
  const fontSize = searchParams.get("fontSize") || "75";
  const fontColor = searchParams.get("fontColor") || "#ffffff";
  const position = searchParams.get("position") || "bottom-right";

  // 处理文件上传
  const handleUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      message.error("请上传图片文件");
      return false;
    }

    setFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);

      // 如果 setting 为 "0"，则自动添加水印
      if (setting === "0") {
        // 先初始化水印配置
        const initialWatermarkConfig = {
          fields: [
            {
              id: "dateTime",
              label: "拍摄时间",
              value: "",
              enabled: time === "1",
            },
            {
              id: "camera",
              label: "拍摄设备",
              value: "",
              enabled: equipment === "1",
            },
            {
              id: "location",
              label: "GPS坐标",
              value: "",
              enabled: gps === "1",
            },
            {
              id: "exposure",
              label: "曝光参数",
              value: "",
              enabled: false,
            },
            {
              id: "focalLength",
              label: "焦距",
              value: "",
              enabled: false,
            },
            {
              id: "software",
              label: "处理软件",
              value: "",
              enabled: false,
            },
          ],
          fontSize: isNaN(Number(fontSize)) ? 75 : Number(fontSize),
          color: fontColor,
          position: position as any,
          opacity: 0.8,
          customText: text,
        };

        setWatermarkConfig(initialWatermarkConfig);

        setTimeout(() => {
          extractExifDataWithAutoWatermark(result, initialWatermarkConfig);
        }, 100);
      } else {
        extractExifData(result);
      }
    };

    reader.readAsDataURL(file);
    return false;
  };

  // 提取EXIF信息并自动添加水印
  const extractExifDataWithAutoWatermark = (
    dataUrl: string,
    initialConfig: WatermarkConfig
  ) => {
    const img = document.createElement("img");
    img.src = dataUrl;

    img.onload = () => {
      EXIF.getData(img as any, () => {
        const exifObj: ExifData = {};

        // 拍摄时间
        const dateTime =
          EXIF.getTag(img, "DateTimeOriginal") || EXIF.getTag(img, "DateTime");
        if (dateTime) {
          exifObj.dateTime = dateTime.toString();
        }

        // 设备信息
        const make = EXIF.getTag(img, "Make");
        const model = EXIF.getTag(img, "Model");
        if (make) exifObj.make = make.toString();
        if (model) exifObj.model = model.toString();

        // 软件信息
        const software = EXIF.getTag(img, "Software");
        if (software) exifObj.software = software.toString();

        // 曝光参数
        const exposureTime = EXIF.getTag(img, "ExposureTime");
        if (exposureTime) exifObj.exposureTime = exposureTime.toString();

        const fNumber = EXIF.getTag(img, "FNumber");
        if (fNumber) exifObj.fNumber = `f/${fNumber}`;

        const iso = EXIF.getTag(img, "ISOSpeedRatings");
        if (iso) exifObj.iso = iso;

        const focalLength = EXIF.getTag(img, "FocalLength");
        if (focalLength) exifObj.focalLength = `${focalLength}mm`;

        // GPS信息
        try {
          const gpsLatitude = EXIF.getTag(img, "GPSLatitude");
          const gpsLongitude = EXIF.getTag(img, "GPSLongitude");
          const gpsLatitudeRef = EXIF.getTag(img, "GPSLatitudeRef");
          const gpsLongitudeRef = EXIF.getTag(img, "GPSLongitudeRef");

          if (gpsLatitude && gpsLongitude) {
            const latitude = convertDMSToDD(gpsLatitude, gpsLatitudeRef);
            const longitude = convertDMSToDD(gpsLongitude, gpsLongitudeRef);

            if (latitude !== undefined && longitude !== undefined) {
              exifObj.latitude = latitude;
              exifObj.longitude = longitude;
            }
          }
        } catch (error) {
          console.error("Error extracting GPS data:", error);
        }

        // 更新水印字段的值
        const updatedFields = initialConfig.fields.map((field) => {
          switch (field.id) {
            case "dateTime":
              return { ...field, value: exifObj.dateTime };
            case "camera":
              return {
                ...field,
                value: `${exifObj.make || ""} ${exifObj.model || ""}`.trim(),
              };
            case "location":
              return {
                ...field,
                value:
                  exifObj.latitude && exifObj.longitude
                    ? `${exifObj.latitude.toFixed(
                        6
                      )}, ${exifObj.longitude.toFixed(6)}`
                    : undefined,
              };
            case "exposure":
              return {
                ...field,
                value: `${exifObj.exposureTime || ""} ${
                  exifObj.fNumber || ""
                } ISO${exifObj.iso || ""}`.trim(),
              };
            case "focalLength":
              return { ...field, value: exifObj.focalLength };
            case "software":
              return { ...field, value: exifObj.software };
            default:
              return field;
          }
        });

        const updatedConfig = {
          ...initialConfig,
          fields: updatedFields,
        };

        setWatermarkConfig(updatedConfig);

        // 延迟调用 addWatermarkDirect
        setTimeout(() => {
          addWatermarkDirect(dataUrl, updatedConfig);
        }, 500);
      });
    };
  };

  // 直接添加水印（不依赖 previewUrl 状态）
  const addWatermarkDirect = (imageUrl: string, config?: WatermarkConfig) => {
    const watermarkConfigToUse = config || watermarkConfig;

    if (!imageUrl || !canvasRef.current) {
      message.warning("请先上传图片");
      return;
    }

    const img = document.createElement("img");
    img.src = imageUrl;

    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 构造水印文本
      const enabledFields = watermarkConfigToUse.fields.filter(
        (field) => field.enabled && field.value
      );
      let watermarkTexts: string[] = [];

      enabledFields.forEach((field) => {
        if (field.value) {
          watermarkTexts.push(`${field.label}: ${field.value}`);
        }
      });

      // 添加自定义文本
      if (watermarkConfigToUse.customText) {
        watermarkTexts.push(watermarkConfigToUse.customText);
      }

      if (watermarkTexts.length > 0) {
        // 设置水印样式
        ctx.font = `bold ${watermarkConfigToUse.fontSize}px Arial`;
        ctx.fillStyle = watermarkConfigToUse.color;
        ctx.globalAlpha = watermarkConfigToUse.opacity;

        // 计算水印位置
        const lineHeight = watermarkConfigToUse.fontSize * 1.5;
        const padding = 20;

        let x = 0;
        let y = 0;

        switch (watermarkConfigToUse.position) {
          case "top-left":
            x = padding;
            y = padding;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            break;
          case "top-right":
            x = canvas.width - padding;
            y = padding;
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            break;
          case "bottom-left":
            x = padding;
            y =
              canvas.height -
              padding -
              (watermarkTexts.length - 1) * lineHeight;
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            break;
          case "bottom-right":
            x = canvas.width - padding;
            y =
              canvas.height -
              padding -
              (watermarkTexts.length - 1) * lineHeight;
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            break;
          case "center":
            x = canvas.width / 2;
            y = canvas.height / 2 - (watermarkTexts.length / 2) * lineHeight;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            break;
        }

        // 绘制水印文本（支持多行）
        watermarkTexts.forEach((text, index) => {
          if (text.trim()) {
            ctx.fillText(text, x, y + index * lineHeight);
          }
        });
      }

      // 生成带水印的图片
      const watermarkedImage = canvas.toDataURL("image/jpeg", 0.9);
      setWatermarkedImageUrl(watermarkedImage);
    };
  };

  // 提取EXIF信息
  const extractExifData = (dataUrl: string) => {
    const img = document.createElement("img");
    img.src = dataUrl;

    img.onload = () => {
      EXIF.getData(img as any, () => {
        const exifObj: ExifData = {};

        // 拍摄时间
        const dateTime =
          EXIF.getTag(img, "DateTimeOriginal") || EXIF.getTag(img, "DateTime");
        if (dateTime) {
          exifObj.dateTime = dateTime.toString();
        }

        // 设备信息
        const make = EXIF.getTag(img, "Make");
        const model = EXIF.getTag(img, "Model");
        if (make) exifObj.make = make.toString();
        if (model) exifObj.model = model.toString();

        // 软件信息
        const software = EXIF.getTag(img, "Software");
        if (software) exifObj.software = software.toString();

        // 曝光参数
        const exposureTime = EXIF.getTag(img, "ExposureTime");
        if (exposureTime) exifObj.exposureTime = exposureTime.toString();

        const fNumber = EXIF.getTag(img, "FNumber");
        if (fNumber) exifObj.fNumber = `f/${fNumber}`;

        const iso = EXIF.getTag(img, "ISOSpeedRatings");
        if (iso) exifObj.iso = iso;

        const focalLength = EXIF.getTag(img, "FocalLength");
        if (focalLength) exifObj.focalLength = `${focalLength}mm`;

        // GPS信息 - 增强的处理逻辑
        try {
          const gpsLatitude = EXIF.getTag(img, "GPSLatitude");
          const gpsLongitude = EXIF.getTag(img, "GPSLongitude");
          const gpsLatitudeRef = EXIF.getTag(img, "GPSLatitudeRef");
          const gpsLongitudeRef = EXIF.getTag(img, "GPSLongitudeRef");

          if (gpsLatitude && gpsLongitude) {
            const latitude = convertDMSToDD(gpsLatitude, gpsLatitudeRef);
            const longitude = convertDMSToDD(gpsLongitude, gpsLongitudeRef);

            if (latitude !== undefined && longitude !== undefined) {
              exifObj.latitude = latitude;
              exifObj.longitude = longitude;
            }
          }
        } catch (error) {
          console.error("Error extracting GPS data:", error);
        }

        // 初始化水印字段
        initializeWatermarkFields(exifObj);
      });
    };
  };

  // 初始化水印字段
  const initializeWatermarkFields = (exifData: ExifData) => {
    const fields: WatermarkField[] = [
      {
        id: "dateTime",
        label: "拍摄时间",
        value: exifData.dateTime,
        enabled: time === "1", // 根据time参数控制默认选中状态
      },
      {
        id: "camera",
        label: "拍摄设备",
        value: `${exifData.make || ""} ${exifData.model || ""}`.trim(),
        enabled: equipment === "1", // 根据equipment参数控制默认选中状态
      },
      {
        id: "location",
        label: "GPS坐标",
        value:
          exifData.latitude && exifData.longitude
            ? `${exifData.latitude.toFixed(6)}, ${exifData.longitude.toFixed(
                6
              )}`
            : undefined,
        enabled: gps === "1", // 根据gps参数控制默认选中状态
      },
      {
        id: "exposure",
        label: "曝光参数",
        value: `${exifData.exposureTime || ""} ${exifData.fNumber || ""} ISO${
          exifData.iso || ""
        }`.trim(),
        enabled: false, // 默认不选
      },
      {
        id: "focalLength",
        label: "焦距",
        value: exifData.focalLength,
        enabled: false, // 默认不选
      },
      {
        id: "software",
        label: "处理软件",
        value: exifData.software,
        enabled: false, // 默认不选
      },
    ];

    setWatermarkConfig((prev) => ({
      ...prev,
      fields,
      fontSize: isNaN(Number(fontSize)) ? 75 : Number(fontSize),
      color: fontColor,
      position: position as any,
      customText: text,
    }));
  };

  // 将GPS坐标从DMS格式转换为DD格式 - 增强版本
  const convertDMSToDD = (dms: any, ref: string) => {
    try {
      if (!dms || dms.length < 3) return undefined;

      // 处理不同的DMS格式
      let degrees, minutes, seconds;

      // 如果是数字数组
      if (typeof dms[0] === "number") {
        degrees = dms[0];
        minutes = dms[1];
        seconds = dms[2];
      }
      // 如果是对象（如 {numerator, denominator}）
      else if (dms[0] && typeof dms[0] === "object") {
        degrees = dms[0].numerator / dms[0].denominator;
        minutes = dms[1].numerator / dms[1].denominator;
        seconds = dms[2].numerator / dms[2].denominator;
      }
      // 如果是字符串
      else if (typeof dms[0] === "string") {
        degrees = parseFloat(dms[0]);
        minutes = parseFloat(dms[1]);
        seconds = parseFloat(dms[2]);
      } else {
        return undefined;
      }

      let dd = degrees + minutes / 60 + seconds / 3600;

      if (ref === "S" || ref === "W") {
        dd = dd * -1;
      }

      return dd;
    } catch (error) {
      console.error("Error converting DMS to DD:", error);
      return undefined;
    }
  };

  // 切换字段启用状态
  const toggleField = (id: string) => {
    setWatermarkConfig((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === id ? { ...field, enabled: !field.enabled } : field
      ),
    }));
  };

  // 更新自定义文本
  const updateCustomText = (text: string) => {
    setWatermarkConfig((prev) => ({
      ...prev,
      customText: text,
    }));
  };

  // 添加水印
  const addWatermark = () => {
    if (!previewUrl || !canvasRef.current) {
      message.warning("请先上传图片");
      return;
    }

    const img = document.createElement("img");
    img.src = previewUrl;

    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 构造水印文本
      const enabledFields = watermarkConfig.fields.filter(
        (field) => field.enabled && field.value
      );
      let watermarkTexts: string[] = [];

      enabledFields.forEach((field) => {
        if (field.value) {
          watermarkTexts.push(`${field.label}: ${field.value}`);
        }
      });

      // 添加自定义文本
      if (watermarkConfig.customText) {
        watermarkTexts.push(watermarkConfig.customText);
      }

      if (watermarkTexts.length > 0) {
        // 设置水印样式
        ctx.font = `bold ${watermarkConfig.fontSize}px Arial`;
        ctx.fillStyle = watermarkConfig.color;
        ctx.globalAlpha = watermarkConfig.opacity;

        // 计算水印位置
        const lineHeight = watermarkConfig.fontSize * 1.5;
        const padding = 20;

        let x = 0;
        let y = 0;

        switch (watermarkConfig.position) {
          case "top-left":
            x = padding;
            y = padding;
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            break;
          case "top-right":
            x = canvas.width - padding;
            y = padding;
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            break;
          case "bottom-left":
            x = padding;
            y =
              canvas.height -
              padding -
              (watermarkTexts.length - 1) * lineHeight;
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            break;
          case "bottom-right":
            x = canvas.width - padding;
            y =
              canvas.height -
              padding -
              (watermarkTexts.length - 1) * lineHeight;
            ctx.textAlign = "right";
            ctx.textBaseline = "bottom";
            break;
          case "center":
            x = canvas.width / 2;
            y = canvas.height / 2 - (watermarkTexts.length / 2) * lineHeight;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            break;
        }

        // 绘制水印文本（支持多行）
        watermarkTexts.forEach((text, index) => {
          if (text.trim()) {
            ctx.fillText(text, x, y + index * lineHeight);
          }
        });
      }

      // 生成带水印的图片
      const watermarkedImage = canvas.toDataURL("image/jpeg", 0.9);
      setWatermarkedImageUrl(watermarkedImage);
    };
  };

  // 下载图片
  const downloadImage = () => {
    if (!watermarkedImageUrl) {
      message.warning("请先生成带水印的图片");
      return;
    }

    const link = document.createElement("a");
    link.href = watermarkedImageUrl;
    link.download = file ? `watermarked_${file.name}` : "watermarked_image.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 更新水印配置
  const updateWatermarkConfig = (field: keyof WatermarkConfig, value: any) => {
    setWatermarkConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      handleUpload(file);
      return false;
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>照片信息提取与水印工具</Title>
      {/* 上传区域 - 铺满水平方向 */}
      <Card title="上传照片" style={{ marginBottom: 20 }}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽照片到此区域上传</p>
          <p className="ant-upload-hint">
            支持常见图片格式，建议使用手机拍摄的照片以获取完整EXIF信息
          </p>
        </Dragger>
      </Card>
      <Row gutter={24}>
        {/* 图片预览区域 - 现在占满整个宽度 */}
        <Col xs={24}>
          <Card title="图片预览">
            <div style={{ marginBottom: 16 }}>
              {(setting === "1" || setting === "") && (
                <Button
                  type="primary"
                  onClick={() => setDrawerVisible(true)}
                  style={{ marginRight: 16 }}
                >
                  打开水印设置
                </Button>
              )}
              <Button
                type="primary"
                onClick={addWatermark}
                disabled={!previewUrl}
                style={{ marginRight: 16 }}
              >
                生成带水印照片
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadImage}
                disabled={!watermarkedImageUrl}
              >
                下载图片
              </Button>
            </div>
            <Tabs defaultActiveKey="1">
              <TabPane tab="原始图片" key="1">
                {previewUrl && (
                  <div style={{ textAlign: "center" }}>
                    <Image
                      src={previewUrl}
                      alt="原始图片"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        objectFit: "contain",
                      }}
                      preview={true}
                    />
                  </div>
                )}
                {!previewUrl && (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text type="secondary">请先上传图片</Text>
                  </div>
                )}
              </TabPane>
              <TabPane tab="水印图片" key="2">
                {watermarkedImageUrl ? (
                  <div style={{ textAlign: "center" }}>
                    <Image
                      src={watermarkedImageUrl}
                      alt="带水印图片"
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        objectFit: "contain",
                      }}
                      preview={true}
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px" }}>
                    <Text type="secondary">请先生成带水印图片</Text>
                  </div>
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
      <Drawer
        title="水印设置"
        placement="right"
        closable={true}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={400}
      >
        <Collapse defaultActiveKey={["1", "2", "3"]}>
          <Panel header="水印字段选择" key="1">
            <Space direction="vertical" style={{ width: "100%" }}>
              {watermarkConfig.fields.map((field) => (
                <div
                  key={field.id}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Checkbox
                    checked={field.enabled}
                    onChange={() => toggleField(field.id)}
                  >
                    {field.label}
                  </Checkbox>
                  {field.value && (
                    <Text
                      type="secondary"
                      style={{ marginLeft: 10, fontSize: "12px" }}
                    >
                      {field.value}
                    </Text>
                  )}
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Text strong>自定义文本:</Text>
                <Input
                  placeholder="输入自定义水印文本"
                  value={watermarkConfig.customText}
                  onChange={(e) => updateCustomText(e.target.value)}
                  style={{ marginLeft: 10, flex: 1 }}
                />
              </div>
            </Space>
          </Panel>

          <Panel header="水印样式设置" key="2">
            <Form layout="vertical">
              <Form.Item label="字体大小">
                <Slider
                  min={10}
                  max={100}
                  value={watermarkConfig.fontSize}
                  onChange={(value) => updateWatermarkConfig("fontSize", value)}
                />
                <Text>{watermarkConfig.fontSize}px</Text>
              </Form.Item>

              <Form.Item label="字体颜色">
                <Space>
                  <Popover
                    content={
                      <SketchPicker
                        color={watermarkConfig.color}
                        onChangeComplete={(color) =>
                          updateWatermarkConfig("color", color.hex)
                        }
                      />
                    }
                    trigger="click"
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        border: "1px solid #ddd",
                        backgroundColor: watermarkConfig.color,
                        cursor: "pointer",
                      }}
                    />
                  </Popover>
                  <Text>{watermarkConfig.color}</Text>
                </Space>
              </Form.Item>

              <Form.Item label="透明度">
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={watermarkConfig.opacity}
                  onChange={(value) => updateWatermarkConfig("opacity", value)}
                />
                <Text>{Math.round(watermarkConfig.opacity * 100)}%</Text>
              </Form.Item>

              <Form.Item label="位置">
                <Select
                  value={watermarkConfig.position}
                  onChange={(value) => updateWatermarkConfig("position", value)}
                >
                  <Option value="top-left">左上角</Option>
                  <Option value="top-right">右上角</Option>
                  <Option value="bottom-left">左下角</Option>
                  <Option value="bottom-right">右下角</Option>
                  <Option value="center">居中</Option>
                </Select>
              </Form.Item>
            </Form>
          </Panel>

          <Panel header="操作" key="3">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="primary"
                onClick={addWatermark}
                disabled={!previewUrl}
                block
              >
                生成带水印图片
              </Button>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadImage}
                disabled={!watermarkedImageUrl}
                block
              >
                下载图片
              </Button>

              <Button onClick={() => setDrawerVisible(false)} block>
                关闭
              </Button>
            </Space>
          </Panel>
        </Collapse>
      </Drawer>
      {/* 隐藏的Canvas用于处理图片 */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default PhotoInfo;

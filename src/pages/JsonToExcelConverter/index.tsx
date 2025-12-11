import React, { useState } from "react";
import { Button, Input, Space, Typography, Card, Row, Col } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const JsonToExcelConverter: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>("");
  const [resultText, setResultText] = useState<string>("");
  const deptArr = [
    "天涯分局",
    "东方市公安局",
    "五指山市公安局",
    "文昌市公安局",
    "昌江黎族自治县公安局",
    "琼海市公安局",
    "白沙黎族自治县公安局",
  ];

  const taskArr = [
    "严重精神障碍患者日常管控",
    "刑满释放未满5年人员管控",
    "涉枪涉爆人员管控",
    "退役涉访人员常态管控",
    "娱乐场所日常检查",
    "11月份家庭、婚姻纠纷化解",
  ];

  // 将二维数组转换为可粘贴到Excel的文本格式
  const convertArrayToExcelText = (data: any[][]): string => {
    return data
      .map((row: any[]) =>
        row
          .map((cell: any) => {
            // 处理包含制表符或换行符的单元格内容
            if (
              typeof cell === "string" &&
              (cell.includes("\t") || cell.includes("\n"))
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            // 确保所有值都被转换为字符串
            return String(cell);
          })
          .join("\t")
      )
      .join("\n");
  };

  // 处理JSON的主函数
  const handleProcessJson = () => {
    try {
      // 解析JSON字符串
      const parsedData = JSON.parse(inputJson);

      // 验证是否为二维数组
      if (!Array.isArray(parsedData)) {
        throw new Error("输入的JSON必须是一个数组");
      }
      // 用户可以在这里实现自己的处理逻辑
      // 这里只是一个占位符，实际处理逻辑由用户实现
      let processedData: any[][] = [];
      for (const dept of deptArr) {
        const deptItemArr = parsedData.filter(
          (item: any) => item.deptName === dept
        );
        const arr: any[] = [];
        for (const task of taskArr) {
          const taskItemArr = deptItemArr.filter(
            (item: any) => item.taskName === task
          );
          if (taskItemArr.length > 0) {
            const { deliveryCount, finishCount, rate } = taskItemArr[0];
            console.log(deliveryCount, finishCount, rate);
            arr.push(deliveryCount, finishCount, rate);
          } else {
            arr.push(0, 0, "0.00%");
          }
        }
        processedData.push(arr);
      }
      console.log(JSON.stringify(processedData));

      // 转换为Excel可粘贴的文本格式
      const excelText = convertArrayToExcelText(processedData);
      setResultText(excelText);
    } catch (error) {
      setResultText(`处理错误: ${(error as Error).message}`);
    }
  };

  // 复制结果到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultText);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={3}>JSON转Excel粘贴文本工具</Title>
        <Text type="secondary">
          输入JSON格式的二维数组，系统将转换为可直接粘贴到Excel中的文本格式
        </Text>

        <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
          <Col span={24}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>输入JSON:</Text>
              <Input.TextArea
                rows={6}
                placeholder='请输入JSON格式的二维数组，例如: [["姓名", "年龄"], ["张三", 25], ["李四", 30]]'
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
              />
              <Button type="primary" onClick={handleProcessJson}>
                处理JSON并生成Excel文本
              </Button>
            </Space>
          </Col>

          <Col span={24}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text strong>转换结果 (可粘贴到Excel):</Text>
                <Button
                  icon={<CopyOutlined />}
                  onClick={copyToClipboard}
                  disabled={!resultText}
                >
                  复制到剪贴板
                </Button>
              </div>
              <Input.TextArea
                rows={8}
                placeholder="处理结果将显示在这里"
                value={resultText}
                readOnly
              />
            </Space>
          </Col>
        </Row>

        <div style={{ marginTop: "24px" }}>
          <Title level={4}>使用说明:</Title>
          <ul>
            <li>在上方输入框中输入有效的JSON格式二维数组</li>
            <li>点击"处理JSON并生成Excel文本"按钮执行转换</li>
            <li>转换结果可在下方文本框中查看，并可复制到Excel中</li>
            <li>
              Excel会自动将制表符(\t)分隔的内容放入不同列，换行符(\n)分隔的内容放入不同行
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default JsonToExcelConverter;

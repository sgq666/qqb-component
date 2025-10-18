// src/pages/UserDept/otherTable.tsx
import React, { useState } from "react";
import { Button, Upload, message, Spin, Table, Card, Input, Tabs } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import SqlGenerator from "./sqlGenerator";

interface ExcelData {
  [key: string]: any;
}

const OtherTable: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [sqlGeneratorVisible, setSqlGeneratorVisible] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [activeTab, setActiveTab] = useState("excel"); // excel, jsonInput, jsonFile

  // 处理文件上传
  const handleUpload = (file: File) => {
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;

        if (file.name.endsWith(".json")) {
          // 处理JSON文件
          const jsonData = JSON.parse(fileContent);
          processData(jsonData);
        } else {
          // 处理Excel文件
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // 将Excel数据转换为JSON格式
          const jsonData: ExcelData[] = XLSX.utils.sheet_to_json(worksheet);
          processData(jsonData);
        }
      } catch (error) {
        message.error("文件解析失败，请检查文件格式");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      message.error("文件读取失败");
      setLoading(false);
    };

    if (file.name.endsWith(".json")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }

    return false;
  };

  // 处理数据并生成表格列
  const processData = (jsonData: any[]) => {
    if (Array.isArray(jsonData) && jsonData.length > 0) {
      setExcelData(jsonData);

      // 根据第一行数据动态生成表格列定义
      const keys = Object.keys(jsonData[0]);
      const tableColumns = keys.map((key) => ({
        title: key,
        dataIndex: key,
        key: key,
      }));

      setColumns(tableColumns);
      message.success("数据导入成功");
    } else {
      message.warning("数据格式不正确或没有数据");
    }
  };

  // 处理JSON文本输入
  const handleJsonInput = () => {
    try {
      if (!jsonInput.trim()) {
        message.warning("请输入JSON数据");
        return;
      }

      const jsonData = JSON.parse(jsonInput);
      processData(jsonData);
    } catch (error) {
      message.error("JSON格式不正确，请检查后重试");
      console.error(error);
    }
  };

  // 处理SQL导出
  const handleSqlExport = (sqlStatements: string[]) => {
    // 创建一个Blob对象包含所有SQL语句
    const blob = new Blob([sqlStatements.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated.sql";
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSqlGeneratorVisible(false);
      message.success("SQL文件已下载");
    }, 0);
  };

  // 显示SQL生成器
  const showSqlGenerator = () => {
    if (excelData.length === 0) {
      message.warning("请先导入数据");
      return;
    }
    setSqlGeneratorVisible(true);
  };

  // 清空数据
  const clearData = () => {
    setExcelData([]);
    setColumns([]);
    setJsonInput("");
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card title="数据导入与SQL生成">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Excel文件上传" key="excel">
            <div style={{ marginBottom: "20px" }}>
              <Upload
                beforeUpload={handleUpload}
                maxCount={1}
                accept=".xlsx,.xls"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} type="primary">
                  上传Excel文件
                </Button>
              </Upload>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab="JSON文本输入" key="jsonInput">
            <div style={{ marginBottom: "20px" }}>
              <Input.TextArea
                rows={6}
                placeholder='请输入JSON数据，例如: [{"name": "张三", "age": 25}, {"name": "李四", "age": 30}]'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <Button
                type="primary"
                onClick={handleJsonInput}
                style={{ marginTop: "10px" }}
              >
                解析JSON数据
              </Button>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane tab="JSON文件上传" key="jsonFile">
            <div style={{ marginBottom: "20px" }}>
              <Upload
                beforeUpload={handleUpload}
                maxCount={1}
                accept=".json"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} type="primary">
                  上传JSON文件
                </Button>
              </Upload>
            </div>
          </Tabs.TabPane>
        </Tabs>

        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {excelData.length > 0 && (
            <>
              <Button onClick={showSqlGenerator} type="primary">
                生成SQL
              </Button>
              <Button onClick={clearData}>清空数据</Button>
            </>
          )}
        </div>

        <Spin spinning={loading}>
          {excelData.length > 0 ? (
            <div>
              <h3>导入的数据预览</h3>
              <Table
                dataSource={excelData}
                columns={columns}
                pagination={{ pageSize: 10 }}
                scroll={{ x: true }}
                rowKey={(record, index) => index?.toString() || "0"}
              />
            </div>
          ) : (
            <p>请通过以上任一方式导入数据</p>
          )}
        </Spin>
      </Card>

      {/* SqlGenerator 组件 */}
      <SqlGenerator
        visible={sqlGeneratorVisible}
        onCancel={() => setSqlGeneratorVisible(false)}
        onDataExport={handleSqlExport}
        fields={columns.map((col) => ({
          key: col.dataIndex,
          label: col.title,
        }))}
        data={excelData}
      />
    </div>
  );
};

export default OtherTable;

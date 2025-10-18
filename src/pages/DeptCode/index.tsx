import React, { useState, useEffect } from "react";
import {
  Upload,
  Button,
  Input,
  Select,
  Radio,
  message,
  Table,
  Space,
  Modal,
  List,
  Typography,
  Tabs,
  Badge,
  Checkbox,
  Drawer,
  Form,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import thirdservice from "../../services/thirdService";
// import dept from "./data";
// import mapping from "./mapping";
import { ApiResponse } from "../../types/index";

const { Option } = Select;
const { Dragger } = Upload;
const { Text } = Typography;
const { TabPane } = Tabs;

interface Department {
  deptCode: string;
  deptName: string;
}

interface ExcelColumn {
  title: string;
  dataIndex: string;
  key: string;
}

interface MatchResult {
  originalName: string;
  code: string;
  matched: boolean;
  isNew?: boolean;
}

interface MappingItem {
  deptCode: string;
  deptName: string;
  sourceName: string;
}

const DeptCode: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [worksheet, setWorksheet] = useState<XLSX.WorkSheet | null>(null);
  const [columns, setColumns] = useState<ExcelColumn[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [deptColumn, setDeptColumn] = useState<string>("");
  const [operationType, setOperationType] = useState<"replace" | "add">(
    "replace"
  );
  const [newColumnName, setNewColumnName] = useState<string>("部门代码");
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempMatchResults, setTempMatchResults] = useState<MatchResult[]>([]);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [unmatchedMappings, setUnmatchedMappings] = useState<MappingItem[]>([]);
  const [autoAddUnmatched, setAutoAddUnmatched] = useState(false);
  const [deptData, setDeptData] = useState<Department[]>([]);
  const [mappingData, setMappingData] = useState<Department[]>([]);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isAddMappingModalVisible, setIsAddMappingModalVisible] =
    useState(false);
  const [newMappingForm] = Form.useForm();
  const [collectedMappings, setCollectedMappings] = useState<MappingItem[]>([]);

  // 处理文件上传
  const handleUpload = (file: File) => {
    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        setWorksheet(worksheet);

        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setDataSource(jsonData);

        const header = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        })[0] as string[];
        const cols: ExcelColumn[] = header.map(
          (title: string, index: number) => ({
            title,
            dataIndex: title,
            key: title,
          })
        );
        setColumns(cols);
      } catch (error) {
        message.error("文件解析失败，请确保是有效的Excel文件");
      }
    };
    reader.readAsArrayBuffer(file);
    return false;
  };

  const parseData = (data: any): any => {
    if (typeof data === "string") {
      return JSON.parse(data);
    }
    return data;
  };

  // 然后在 useEffect 中使用
  useEffect(() => {
    const fetchData = async () => {
      try {
        const deptResult: ApiResponse<string> =
          await thirdservice.getDeptList();
        setDeptData(parseData(deptResult.data));
        const deptMappingResult: ApiResponse<string> =
          await thirdservice.getDeptMappingList();
        setMappingData(parseData(deptMappingResult.data));
      } catch (error) {
        message.error("数据加载失败");
        console.error("数据加载失败:", error);
      }
    };

    fetchData();
  }, []);

  // 分析匹配结果
  const analyzeMatches = () => {
    if (!worksheet || !deptColumn) {
      message.warning("请先上传文件并选择部门列");
      return;
    }

    try {
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
      const combinedDeptData = [...deptData, ...mappingData];

      const allDeptMap = new Map<
        string,
        { code: string; isMapping: boolean }
      >();
      combinedDeptData.forEach((dept) => {
        allDeptMap.set(dept.deptName, {
          code: dept.deptCode,
          isMapping: !!mappingData.find((m) => m.deptName === dept.deptName),
        });
      });

      const uniqueDeptNames = Array.from(
        new Set(jsonData.map((row: any) => row[deptColumn]))
      );
      const results: MatchResult[] = uniqueDeptNames.map((name: string) => {
        const deptInfo = allDeptMap.get(name);
        return {
          originalName: name,
          code: deptInfo ? deptInfo.code : "",
          matched: !!deptInfo,
          isNew: deptInfo ? deptInfo.isMapping : false,
        };
      });

      setTempMatchResults([...results]);
      setCollectedMappings([]); // 重置收集的映射数据
      setIsModalVisible(true);
    } catch (error) {
      message.error("分析失败，请重试");
    }
  };

  // 更新匹配结果
  const updateMatchResult = (index: number, code: string) => {
    console.log("更新匹配结果:", { index, code });

    const newResults = [...tempMatchResults];
    newResults[index] = {
      ...newResults[index],
      code,
    };

    console.log("更新后的结果:", newResults);
    setTempMatchResults(newResults);

    // 实时更新收集的映射数据
    updateCollectedMappings(newResults);
  };
  const updateCollectedMappings = (currentResults: MatchResult[]) => {
    console.log("当前所有匹配结果:", currentResults);

    // 收集所有用户手动设置了代码的项目（无论原来是否匹配）
    const manuallySetCodes = currentResults.filter((item) => {
      // 用户手动设置了代码
      return item.code && item.code.trim();
    });

    console.log("设置了代码的项目:", manuallySetCodes);

    // 从这些项目中筛选出原本未匹配的（即需要保存映射的）
    const mappingsToSave = manuallySetCodes
      .filter((item) => !item.isNew && !item.matched) // 原本既不是预设匹配也不是映射匹配
      .map((item) => ({
        deptCode: item.code,
        deptName: item.originalName,
        sourceName:
          deptData.find((d) => d.deptCode === item.code)?.deptName || "",
      }));

    console.log("需要保存的映射数据:", mappingsToSave);
    setCollectedMappings(mappingsToSave);
  };

  // 模态框确认处理
  const handleModalOkInternal = () => {
    const unmatchedItems = tempMatchResults.filter(
      (item) => !item.matched && !item.code.trim()
    );
    if (unmatchedItems.length > 0) {
      message.error("请为所有未匹配的部门指定代码后再提交");
      return;
    }

    const newUnmatchedMappings = tempMatchResults
      .filter((item) => !item.matched && item.code.trim())
      .map((item) => ({
        deptCode: item.code,
        deptName: item.originalName,
        sourceName:
          deptData.find((d) => d.deptCode === item.code)?.deptName || "",
      }));

    if (newUnmatchedMappings.length > 0) {
      setUnmatchedMappings(newUnmatchedMappings);
      setIsConfirmModalVisible(true);
      return;
    }

    processDepartmentData(tempMatchResults);
  };
  // 处理部门列映射
  const processDepartmentData = (
    matchResults: MatchResult[],
    autoAddNew?: boolean
  ) => {
    if (!worksheet || !deptColumn) {
      message.warning("请先上传文件并选择部门列");
      return;
    }

    try {
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
      const deptMap = new Map<string, string>();
      matchResults.forEach((result) => {
        if (result.code) {
          deptMap.set(result.originalName, result.code);
        }
      });

      const processed = jsonData.map((row: any) => {
        const deptName = row[deptColumn];
        const deptCode = deptMap.get(deptName) || "未找到匹配代码";

        if (operationType === "replace") {
          return {
            ...row,
            [deptColumn]: deptCode,
          };
        } else {
          return {
            ...row,
            [newColumnName]: deptCode,
          };
        }
      });

      setProcessedData(processed);

      message.success(`处理完成！共处理 ${jsonData.length} 条数据`);
      setIsModalVisible(false);
      setCollectedMappings([]); // 重置收集的映射数据
    } catch (error) {
      message.error("处理失败，请重试");
    }
  };

  // 导出处理后的数据
  const exportData = () => {
    if (processedData.length === 0) {
      message.warning("没有可导出的数据");
      return;
    }

    // 处理数据，确保数字被正确识别为数字但以文本形式显示
    const processedDataFormatted = processedData.map((row) => {
      const newRow: any = {};
      Object.keys(row).forEach((key) => {
        const value = row[key];
        // 保持原始值，但确保数据类型正确
        newRow[key] = value;
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(processedDataFormatted);

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");

    // 为所有列设置宽度和文本格式
    if (!ws["!cols"]) ws["!cols"] = [];

    for (let C = range.s.c; C <= range.e.c; ++C) {
      // 设置列宽
      ws["!cols"][C] = { wch: 20 };

      // 为该列的所有单元格设置文本格式
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
        if (ws[cellAddress]) {
          // 强制设置单元格格式为文本
          ws[cellAddress].z = "@";
          // 确保单元格类型为字符串
          ws[cellAddress].t = "s";
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "处理结果");

    let newFileName = "处理后的数据.xlsx";
    if (file) {
      const originalName = file.name;
      const lastDotIndex = originalName.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        const nameWithoutExtension = originalName.substring(0, lastDotIndex);
        const extension = originalName.substring(lastDotIndex);
        newFileName = `${nameWithoutExtension}部门代码补充${extension}`;
      } else {
        newFileName = `${originalName}部门代码补充.xlsx`;
      }
    }

    XLSX.writeFile(wb, newFileName);
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      const isExcel =
        file.type === "application/vnd.ms-excel" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");

      if (!isExcel) {
        message.error("只能上传Excel文件!");
        return false;
      }

      handleUpload(file);
      return false;
    },
  };

  // 模态框取消
  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCollectedMappings([]); // 重置收集的映射数据
  };

  // 确认添加未匹配部门
  const handleConfirmOk = () => {
    const updatedMatchResults = [...tempMatchResults];

    if (autoAddUnmatched) {
      const updatedResults = updatedMatchResults.map((item) => {
        const found = unmatchedMappings.find(
          (m) => m.deptName === item.originalName
        );
        if (found && !item.matched && item.code) {
          return {
            ...item,
            matched: true,
            isNew: true,
          };
        }
        return item;
      });

      setTempMatchResults(updatedResults);
    }

    setIsConfirmModalVisible(false);
    processDepartmentData(updatedMatchResults, autoAddUnmatched);
    setCollectedMappings([]); // 重置收集的映射数据
  };
  // 取消确认
  const handleConfirmCancel = () => {
    setIsConfirmModalVisible(false);
    processDepartmentData(tempMatchResults);
    setCollectedMappings([]); // 重置收集的映射数据
  };

  // 计算未匹配的数量
  const unmatchedCount = tempMatchResults.filter(
    (item) => !item.matched
  ).length;

  // 修改 handleAddMapping 函数以更新 mappingData
  const handleAddMapping = async (values: any) => {
    const newMappingItem: MappingItem[] = [
      {
        deptCode: values.deptCode,
        deptName: values.deptName,
        sourceName: values.sourceName,
      },
    ];

    // 检查是否已存在
    if (mappingData.some((item) => item.deptName === values.deptName)) {
      message.warning("该部门名称已存在映射");
      return;
    }

    try {
      await thirdservice.addDeptMappingList(newMappingItem);

      // 更新 mappingData 状态以包含新添加的映射
      setMappingData((prev) => [...prev, ...newMappingItem]);

      setIsAddMappingModalVisible(false);
      newMappingForm.resetFields();
      message.success("映射添加成功");
    } catch (error) {
      message.error("映射添加失败");
    }
  };

  // 保存映射到控制台
  const saveMappingsToConsole = async () => {
    if (collectedMappings.length > 0) {
      console.log("用户保存的部门映射数据:", collectedMappings);
      await thirdservice.addDeptMappingList(collectedMappings);
      message.success(`已将 ${collectedMappings.length} 个部门映射保存`);
    } else {
      message.info("没有需要保存的部门映射数据");
    }
  };

  // 自定义模态框footer
  const renderModalFooter = () => {
    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Button onClick={saveMappingsToConsole}>
            保存部门映射 ({collectedMappings.length})
          </Button>
        </div>
        <div>
          <Button onClick={handleModalCancel}>取消</Button>
          <Button
            type="primary"
            onClick={handleModalOkInternal}
            style={{ marginLeft: 8 }}
          >
            确认并处理
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        Excel部门代码处理工具
        <Button
          type="primary"
          onClick={() => setIsDrawerVisible(true)}
          size="small"
          style={{ marginLeft: 16 }}
        >
          查看详细部门数据
        </Button>
      </h2>

      {/* 文件上传区域 */}
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽Excel文件到此区域上传</p>
        <p className="ant-upload-hint">支持.xls和.xlsx格式</p>
      </Dragger>

      {dataSource.length > 0 && (
        <>
          {/* 部门列选择 */}
          <div style={{ marginTop: "20px" }}>
            <Space>
              <span>选择部门列:</span>
              <Select
                style={{ width: 200 }}
                onChange={setDeptColumn}
                placeholder="请选择包含部门名称的列"
              >
                {columns.map((col) => (
                  <Option key={col.dataIndex} value={col.dataIndex}>
                    {col.title}
                  </Option>
                ))}
              </Select>
            </Space>
          </div>

          {/* 操作类型选择 */}
          <div style={{ marginTop: "20px" }}>
            <Space>
              <span>处理方式:</span>
              <Radio.Group
                onChange={(e) => setOperationType(e.target.value)}
                value={operationType}
              >
                <Radio value="replace">替换为部门代码</Radio>
                <Radio value="add">新增部门代码列</Radio>
              </Radio.Group>
            </Space>
          </div>

          {/* 新增列名输入 */}
          {operationType === "add" && (
            <div style={{ marginTop: "20px" }}>
              <Space>
                <span>新增列名:</span>
                <Input
                  style={{ width: 200 }}
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="请输入新增列的名称"
                />
              </Space>
            </div>
          )}

          {/* 处理按钮 */}
          <div style={{ marginTop: "20px" }}>
            <Space>
              <Button
                type="primary"
                onClick={analyzeMatches}
                disabled={!deptColumn}
              >
                处理数据
              </Button>

              {processedData.length > 0 && (
                <Button type="primary" onClick={exportData}>
                  导出处理结果
                </Button>
              )}
            </Space>
          </div>

          {/* 数据预览Tabs */}
          <div style={{ marginTop: "20px" }}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="原始数据" key="1">
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  pagination={{ pageSize: 5 }}
                  scroll={{ x: true }}
                />
              </TabPane>
              {processedData.length > 0 && (
                <TabPane tab="处理结果" key="2">
                  <Table
                    dataSource={processedData}
                    columns={
                      operationType === "replace"
                        ? columns
                        : [
                            ...columns,
                            {
                              title: newColumnName,
                              dataIndex: newColumnName,
                              key: newColumnName,
                            },
                          ]
                    }
                    pagination={{ pageSize: 5 }}
                    scroll={{ x: true }}
                  />
                </TabPane>
              )}
            </Tabs>
          </div>
        </>
      )}

      {/* 匹配结果模态框 */}
      <Modal
        title="部门匹配结果"
        open={isModalVisible}
        onCancel={handleModalCancel}
        width={800}
        footer={renderModalFooter()}
      >
        <p>请检查以下匹配结果，您可以修改部门代码：</p>
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                已匹配部门{" "}
                <Badge
                  count={tempMatchResults.filter((item) => item.matched).length}
                />
              </span>
            }
            key="1"
          >
            <List
              dataSource={tempMatchResults.filter((item) => item.matched)}
              renderItem={(item, index) => {
                const actualIndex = tempMatchResults.findIndex(
                  (res) => res.originalName === item.originalName
                );
                return (
                  <List.Item key={item.originalName + index}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Text strong>{item.originalName}</Text>
                      </div>
                      <div style={{ width: 200 }}>
                        <Select
                          showSearch
                          value={item.code || undefined}
                          onChange={(value) =>
                            updateMatchResult(actualIndex, value)
                          }
                          style={{ width: "100%" }}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.children?.toString() || "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {deptData.map((dept) => (
                            <Option key={dept.deptCode} value={dept.deptCode}>
                              {dept.deptName} ({dept.deptCode})
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                未匹配部门{" "}
                <Badge
                  count={unmatchedCount}
                  style={{
                    backgroundColor: unmatchedCount > 0 ? "#ff4d4f" : "#1890ff",
                  }}
                />
              </span>
            }
            key="2"
          >
            <List
              dataSource={tempMatchResults.filter((item) => !item.matched)}
              renderItem={(item, index) => {
                const actualIndex = tempMatchResults.findIndex(
                  (res) => res.originalName === item.originalName
                );
                return (
                  <List.Item key={item.originalName + index}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Text strong type="danger">
                          {item.originalName}
                        </Text>
                      </div>
                      <div style={{ width: 200 }}>
                        <Select
                          showSearch
                          placeholder="请选择或输入部门代码"
                          value={item.code || undefined}
                          onChange={(value) =>
                            updateMatchResult(actualIndex, value)
                          }
                          style={{ width: "100%" }}
                          allowClear
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.children?.toString() || "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        >
                          {deptData.map((dept) => (
                            <Option key={dept.deptCode} value={dept.deptCode}>
                              {dept.deptName} ({dept.deptCode})
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </TabPane>
        </Tabs>
      </Modal>

      {/* 确认添加未匹配部门模态框 */}
      <Modal
        title="发现未匹配部门"
        open={isConfirmModalVisible}
        onOk={handleConfirmOk}
        onCancel={handleConfirmCancel}
        width={600}
        okText="确认并添加"
        cancelText="仅处理已有映射"
      >
        <p>检测到以下未匹配的部门，您是否要将它们添加到部门映射中？</p>
        <List
          dataSource={unmatchedMappings}
          renderItem={(item) => (
            <List.Item key={item.deptName}>
              <div style={{ display: "flex", width: "100%" }}>
                <div style={{ flex: 1 }}>{item.deptName}</div>
                <div style={{ flex: 1 }}>{item.deptCode}</div>
                <div style={{ flex: 1 }}>{item.sourceName}</div>
              </div>
            </List.Item>
          )}
        >
          <List.Item>
            <Checkbox
              checked={autoAddUnmatched}
              onChange={(e) => setAutoAddUnmatched(e.target.checked)}
            >
              自动添加到部门映射
            </Checkbox>
          </List.Item>
        </List>
      </Modal>

      {/* 数据查看侧边栏 */}
      <Drawer
        title="部门数据"
        placement="right"
        width={600}
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="部门数据" key="1">
            <Table
              dataSource={deptData}
              columns={[
                { title: "部门名称", dataIndex: "deptName", key: "deptName" },
                { title: "部门代码", dataIndex: "deptCode", key: "deptCode" },
              ]}
              pagination={false}
              size="small"
              bordered
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                手动映射数据
                <Button
                  type="link"
                  size="small"
                  onClick={() => setIsAddMappingModalVisible(true)}
                  style={{ marginLeft: 10 }}
                >
                  添加
                </Button>
              </span>
            }
            key="2"
          >
            <Table
              dataSource={mappingData}
              columns={[
                { title: "部门名称", dataIndex: "deptName", key: "deptName" },
                {
                  title: "映射部门代码",
                  dataIndex: "deptCode",
                  key: "deptCode",
                  render: (code: string) => {
                    const dept = deptData.find((d) => d.deptCode === code);
                    return dept ? `${dept.deptName} (${code})` : code;
                  },
                },
              ]}
              pagination={false}
              size="small"
              bordered
            />
          </TabPane>
        </Tabs>
      </Drawer>

      {/* 添加映射数据模态框 */}
      <Modal
        title="添加手动映射"
        open={isAddMappingModalVisible}
        onOk={() => newMappingForm.submit()}
        onCancel={() => {
          setIsAddMappingModalVisible(false);
          newMappingForm.resetFields();
        }}
        okText="确认"
        cancelText="取消"
      >
        <Form
          form={newMappingForm}
          layout="vertical"
          onFinish={handleAddMapping}
        >
          <Form.Item
            name="deptName"
            label="部门名称"
            rules={[{ required: true, message: "请输入部门名称" }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>

          <Form.Item
            name="deptCode"
            label="映射部门代码"
            rules={[{ required: true, message: "请选择映射的部门代码" }]}
          >
            <Select
              showSearch
              placeholder="请选择映射的部门代码"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children?.toString() || "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {deptData.map((dept) => (
                <Option key={dept.deptCode} value={dept.deptCode}>
                  {dept.deptName} ({dept.deptCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeptCode;

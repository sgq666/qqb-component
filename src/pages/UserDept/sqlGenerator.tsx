import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Card,
  Tooltip,
  Tag,
  message,
  Select,
  Tabs,
  Checkbox,
  Row,
  Col,
} from "antd";
import {
  QuestionCircleOutlined,
  CopyOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import sqlTemplates from "./sqlTemplate"; // 引入模板数据

interface SqlGeneratorProps {
  visible: boolean;
  onCancel: () => void;
  onDataExport: (sqlStatements: string[]) => void;
  fields: { key: string; label: string }[];
  data: any[];
  defaultTemplate?: string;
}

// 字段映射定义
interface FieldMapping {
  tableField: string; // 表格中的字段名
  dbField: string; // 数据库中的字段名
  defaultValue: any; // 默认值
}

// SQL模板定义
interface SqlTemplate {
  name: string;
  type: "insert" | "update";
  table: string;
  fieldMapping: FieldMapping[];
  whereClause?: string[]; // UPDATE语句的WHERE条件字段（支持多个）
}

const SqlGenerator: React.FC<SqlGeneratorProps> = ({
  visible,
  onCancel,
  onDataExport,
  fields,
  data,
  defaultTemplate = "",
}) => {
  const [activeTab, setActiveTab] = useState("visual");
  const [selectedTemplate, setSelectedTemplate] = useState<SqlTemplate | null>(
    null
  );
  const [sqlType, setSqlType] = useState<"insert" | "update">("insert");
  const [tableName, setTableName] = useState("table_name");
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([
    { tableField: "", dbField: "", defaultValue: null },
  ]);
  const [whereClauseFields, setWhereClauseFields] = useState<string[]>([]); // UPDATE语句的WHERE字段（支持多个）
  const [additionalWhereClause, setAdditionalWhereClause] = useState(""); // 用户手动添加的WHERE条件
  const [sqlInput, setSqlInput] = useState(""); // 用于SQL解析的输入
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      // 重置到初始状态
      setSelectedTemplate(null);
      setSqlType("insert");
      setTableName("table_name");
      setFieldMappings([{ tableField: "", dbField: "", defaultValue: null }]);
      setWhereClauseFields([]);
      setAdditionalWhereClause("");
      setSqlInput("");
    }
  }, [visible]);

  // 处理模板选择
  const handleTemplateChange = (value: string) => {
    const template = sqlTemplates.find((t) => t.name === value) as SqlTemplate;

    if (template) {
      setSelectedTemplate(template);
      setSqlType(template.type);
      setTableName(template.table);
      setFieldMappings([...template.fieldMapping]);
      setWhereClauseFields(template.whereClause || []);
      setAdditionalWhereClause("");
      setActiveTab("visual");
    }
  };

  // 添加字段映射
  const addFieldMapping = () => {
    setFieldMappings([
      ...fieldMappings,
      { tableField: "", dbField: "", defaultValue: null },
    ]);
  };

  // 更新字段映射
  const updateFieldMapping = (
    index: number,
    field: keyof FieldMapping,
    value: any
  ) => {
    const newMappings = [...fieldMappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setFieldMappings(newMappings);
  };

  // 删除字段映射
  const removeFieldMapping = (index: number) => {
    if (fieldMappings.length <= 1) {
      message.warning("至少需要保留一个字段映射");
      return;
    }
    const newMappings = [...fieldMappings];
    newMappings.splice(index, 1);
    setFieldMappings(newMappings);
  };

  // 切换WHERE条件字段
  const toggleWhereClauseField = (fieldKey: string) => {
    if (whereClauseFields.includes(fieldKey)) {
      setWhereClauseFields(whereClauseFields.filter((key) => key !== fieldKey));
    } else {
      setWhereClauseFields([...whereClauseFields, fieldKey]);
    }
  };

  // 生成SQL语句
  const generateSqlStatements = () => {
    if (fieldMappings.length === 0) {
      return [];
    }

    const statements: string[] = [];

    // 过滤出有效的字段映射（数据库字段名不为空）
    const validMappings = fieldMappings.filter((mapping) => mapping.dbField);

    if (validMappings.length === 0) {
      return [];
    }

    data.forEach((item) => {
      if (sqlType === "insert") {
        // 构建INSERT语句
        const dbFields = validMappings.map((mapping) => mapping.dbField);
        const values = validMappings.map((mapping) => {
          // 获取字段值，优先使用表格数据，否则使用默认值
          const value =
            item[mapping.tableField] !== undefined &&
            item[mapping.tableField] !== null
              ? item[mapping.tableField]
              : mapping.defaultValue;

          if (value === null || value === undefined) {
            return "NULL";
          }

          // 字符串值需要加引号
          if (typeof value === "string") {
            return `'${value.replace(/'/g, "''")}'`; // 转义单引号
          }
          return `'${value}'`;
        });

        const sql = `INSERT INTO ${tableName} (${dbFields.join(
          ", "
        )}) VALUES (${values.join(", ")});`;
        statements.push(sql);
      } else if (sqlType === "update") {
        // 构建UPDATE语句
        const setClauses = validMappings.map((mapping) => {
          // 获取字段值，优先使用表格数据，否则使用默认值
          const value =
            item[mapping.tableField] !== undefined &&
            item[mapping.tableField] !== null
              ? item[mapping.tableField]
              : mapping.defaultValue;

          if (value === null || value === undefined) {
            return `${mapping.dbField} = NULL`;
          }

          // 字符串值需要加引号
          if (typeof value === "string") {
            return `${mapping.dbField} = '${value.replace(/'/g, "''")}'`; // 转义单引号
          }
          return `${mapping.dbField} = '${value}'`;
        });

        // 构建WHERE条件
        let whereClause = "";
        const whereConditions: string[] = [];

        // 添加字段WHERE条件
        if (whereClauseFields.length > 0) {
          whereClauseFields.forEach((tableFieldKey) => {
            // 先尝试在字段映射中找到对应的数据库字段名
            const fieldMapping = validMappings.find(
              (mapping) => mapping.tableField === tableFieldKey
            );

            // 如果找到了映射，使用数据库字段名；否则直接使用表格字段名
            const dbFieldName = fieldMapping
              ? fieldMapping.dbField
              : tableFieldKey;

            const value = item[tableFieldKey];
            if (value === null || value === undefined) {
              whereConditions.push(`${dbFieldName} IS NULL`);
            } else if (typeof value === "string") {
              whereConditions.push(
                `${dbFieldName} = '${value.replace(/'/g, "''")}'`
              );
            } else {
              whereConditions.push(`${dbFieldName} = '${value}'`);
            }
          });
        }

        // 添加用户手动输入的WHERE条件
        if (additionalWhereClause.trim() !== "") {
          whereConditions.push(additionalWhereClause.trim());
        }

        if (whereConditions.length > 0) {
          whereClause = `WHERE ${whereConditions.join(" AND ")}`;
        }

        const sql = `UPDATE ${tableName} SET ${setClauses.join(
          ", "
        )} ${whereClause};`;
        statements.push(sql);
      }
    });

    return statements;
  };

  // 导出SQL到txt文件
  const exportSqlToTxt = () => {
    if (fieldMappings.length === 0) {
      message.warning("请至少配置一个字段映射");
      return;
    }

    // 检查必填字段
    const validMappings = fieldMappings.filter((mapping) => mapping.dbField);

    if (validMappings.length === 0) {
      message.warning("请至少配置一个有效的字段映射");
      return;
    }

    if (
      sqlType === "update" &&
      whereClauseFields.length === 0 &&
      additionalWhereClause.trim() === ""
    ) {
      message.warning(
        "UPDATE语句至少需要选择一个WHERE条件字段或输入手动WHERE条件"
      );
      return;
    }

    const sqlStatements = generateSqlStatements();

    if (sqlStatements.length === 0) {
      message.warning("没有生成任何SQL语句");
      return;
    }

    onDataExport(sqlStatements);
  };

  // 导出为模板
  const exportAsTemplate = () => {
    // 检查必填字段
    // 修改：保留所有字段映射，包括有默认值的字段
    const validMappings = fieldMappings.filter(
      (mapping) => mapping.dbField // 只需要数据库字段不为空即可
    );

    if (validMappings.length === 0) {
      message.warning("请至少配置一个有效的字段映射");
      return;
    }

    if (
      sqlType === "update" &&
      whereClauseFields.length === 0 &&
      additionalWhereClause.trim() === ""
    ) {
      message.warning(
        "UPDATE语句至少需要选择一个WHERE条件字段或输入手动WHERE条件"
      );
      return;
    }

    // 构建模板对象
    const template: SqlTemplate = {
      name: "自定义模板",
      type: sqlType,
      table: tableName,
      fieldMapping: validMappings,
      ...(sqlType === "update" &&
      (whereClauseFields.length > 0 || additionalWhereClause.trim() !== "")
        ? { whereClause: whereClauseFields }
        : {}),
    };

    // 转换为字符串格式
    const templateStr = `{
  name: "${template.name}",
  type: "${template.type}",
  table: "${template.table}",
  fieldMapping: [
    ${template.fieldMapping
      .map(
        (mapping) =>
          `{ tableField: "${mapping.tableField || ""}", dbField: "${
            mapping.dbField
          }", defaultValue: ${
            mapping.defaultValue === null
              ? "null"
              : typeof mapping.defaultValue === "string"
              ? `"${mapping.defaultValue}"`
              : mapping.defaultValue
          } }`
      )
      .join(",\n    ")}
  ]${
    template.whereClause
      ? `,\n  whereClause: [${template.whereClause
          .map((field) => `"${field}"`)
          .join(", ")}]`
      : ""
  }
}`;

    // 复制到剪贴板
    navigator.clipboard
      .writeText(`const template = ${templateStr};\nexport default template;`)
      .then(() => {
        message.success("模板已复制到剪贴板");
      })
      .catch(() => {
        message.error("复制失败，请手动复制");
        console.log(templateStr);
      });
  };

  // 解析SQL为模板
  const parseSqlToTemplate = () => {
    if (!sqlInput.trim()) {
      message.warning("请输入SQL语句");
      return;
    }

    try {
      // 简单解析INSERT语句
      const insertRegex =
        /INSERT\s+INTO\s+([^\s\(]+)\s*\(\s*([^\)]+)\s*\)\s*VALUES\s*\(\s*([^\)]+)\s*\)/i;
      const match = sqlInput.trim().match(insertRegex);

      if (match) {
        // 修改：保留原始表名，包括反引号
        const tableName = match[1]; // 不再去除引号
        const fieldsStr = match[2];
        const valuesStr = match[3];

        // 解析字段
        const dbFields = fieldsStr
          .split(",")
          .map((field) => field.trim().replace(/^[`']|[`']$/g, ""));
        const values = valuesStr.split(",").map((value) => {
          const trimmed = value.trim();
          // 去除引号并处理特殊值
          if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            return trimmed.substring(1, trimmed.length - 1);
          } else if (trimmed.toLowerCase() === "null") {
            return null;
          } else {
            return trimmed;
          }
        });

        // 创建字段映射
        const newFieldMappings: FieldMapping[] = dbFields.map(
          (dbField, index) => ({
            tableField: "", // 需要用户手动匹配
            dbField: dbField,
            defaultValue: values[index] || null,
          })
        );

        setSqlType("insert");
        setTableName(tableName); // 保留原始表名包括反引号
        setFieldMappings(newFieldMappings);
        setActiveTab("visual");
        message.success("SQL解析成功，请手动匹配表格字段");
      } else {
        message.warning("暂不支持解析该SQL语句格式");
      }
    } catch (error) {
      message.error("SQL解析失败: " + (error as Error).message);
    }
  };

  // 高亮显示占位符的函数
  const highlightPlaceholders = (text: string) => {
    if (!text) return text;

    const parts: React.ReactNode[] = [];
    const placeholderRegex = /'([^']*)'/g;
    let lastIndex = 0;
    let match;

    while ((match = placeholderRegex.exec(text)) !== null) {
      // 添加占位符前的文本
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // 添加带样式的占位符
      parts.push(
        <span
          key={`${match.index}-${match[0]}`}
          style={{
            backgroundColor: "#e6f7ff",
            border: "1px dashed #1890ff",
            borderRadius: "4px",
            padding: "0 2px",
            color: "#1890ff",
            fontWeight: "bold",
          }}
        >
          {match[0]}
        </span>
      );

      lastIndex = match.index + match[0].length;
    }

    // 添加剩余的文本
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  // 渲染可视化SQL构建器
  const renderVisualBuilder = () => {
    return (
      <div
        style={{
          padding: "16px",
          backgroundColor: "#fafafa",
          borderRadius: "4px",
        }}
      >
        <Form layout="vertical">
          <Form.Item label="SQL类型">
            <Select
              value={sqlType}
              onChange={(value) => setSqlType(value as "insert" | "update")}
            >
              <Select.Option value="insert">INSERT</Select.Option>
              <Select.Option value="update">UPDATE</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="表名">
            <Input
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="请输入表名"
            />
          </Form.Item>

          {sqlType === "update" && (
            <>
              <Form.Item label="WHERE条件字段（可多选）">
                <div
                  style={{
                    maxHeight: 150,
                    overflowY: "auto",
                    border: "1px solid #d9d9d9",
                    padding: 12,
                    backgroundColor: "white",
                  }}
                >
                  <Row gutter={[8, 8]}>
                    {fields.map((field) => (
                      <Col span={12} key={field.key}>
                        <Checkbox
                          checked={whereClauseFields.includes(field.key)}
                          onChange={() => toggleWhereClauseField(field.key)}
                        >
                          <Tag color="blue">{field.label}</Tag>
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            {field.key}
                          </span>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </div>
                <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                  提示：选择的字段将使用其对应的数据库字段名构建WHERE条件（如果存在映射），否则使用表格字段名
                </div>
              </Form.Item>

              <Form.Item label="附加WHERE条件">
                <Input
                  value={additionalWhereClause}
                  onChange={(e) => setAdditionalWhereClause(e.target.value)}
                  placeholder="例如: status = 1 AND created_time > '2023-01-01'"
                />
                <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                  提示：可以添加额外的WHERE条件，将与字段条件使用AND连接
                </div>
              </Form.Item>
            </>
          )}

          <Form.Item label="字段映射">
            <div
              style={{
                maxHeight: 300,
                overflowY: "auto",
                border: "1px solid #d9d9d9",
                padding: 12,
                backgroundColor: "white",
                marginBottom: 12,
              }}
            >
              {fieldMappings.map((mapping, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 8,
                    alignItems: "center",
                    padding: 8,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 4,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div>数据库字段:</div>
                    <Input
                      value={mapping.dbField}
                      onChange={(e) =>
                        updateFieldMapping(index, "dbField", e.target.value)
                      }
                      placeholder="输入数据库字段名"
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div>表格字段:</div>
                    <Select
                      value={mapping.tableField}
                      onChange={(value) =>
                        updateFieldMapping(index, "tableField", value)
                      }
                      placeholder="选择表格字段"
                      style={{ width: "100%" }}
                      showSearch
                    >
                      {fields.map((field) => (
                        <Select.Option key={field.key} value={field.key}>
                          {field.label} ({field.key})
                        </Select.Option>
                      ))}
                    </Select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div>默认值:</div>
                    <Input
                      value={
                        mapping.defaultValue === null
                          ? ""
                          : mapping.defaultValue.toString()
                      }
                      onChange={(e) =>
                        updateFieldMapping(
                          index,
                          "defaultValue",
                          e.target.value || null
                        )
                      }
                      placeholder="留空表示NULL"
                    />
                  </div>

                  <Button
                    type="text"
                    danger
                    onClick={() => removeFieldMapping(index)}
                    style={{ alignSelf: "flex-end" }}
                  >
                    删除
                  </Button>
                </div>
              ))}
            </div>

            <Button
              onClick={addFieldMapping}
              type="dashed"
              style={{ width: "100%" }}
            >
              添加字段映射
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={exportAsTemplate}
              style={{ marginRight: 8 }}
            >
              导出为模板
            </Button>
            <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
              提示：将当前配置导出为模板格式，可复制到sqlTemplate.ts文件中
            </div>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16, fontSize: "12px", color: "#666" }}>
          提示：配置数据库字段与表格字段的映射关系，可设置默认值
        </div>
      </div>
    );
  };

  // 渲染SQL解析器
  const renderSqlParser = () => {
    return (
      <div
        style={{
          padding: "16px",
          backgroundColor: "#fafafa",
          borderRadius: "4px",
        }}
      >
        <Form layout="vertical">
          <Form.Item label="SQL语句">
            <Input.TextArea
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="例如: INSERT INTO `sys`.`test1` (`id`, `name`) VALUES (1, '1');"
              rows={6}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              icon={<ScanOutlined />}
              onClick={parseSqlToTemplate}
            >
              解析SQL
            </Button>
            <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
              提示：目前支持解析简单的INSERT语句，解析后需要手动匹配表格字段
            </div>
          </Form.Item>
        </Form>
      </div>
    );
  };

  // 渲染模板选择器
  const renderTemplateSelector = () => {
    return (
      <div
        style={{
          padding: "16px",
          backgroundColor: "#fafafa",
          borderRadius: "4px",
        }}
      >
        <Form layout="vertical">
          <Form.Item label="常用模板">
            <Select
              placeholder="请选择常用模板"
              onChange={handleTemplateChange}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {sqlTemplates.map((template) => (
                <Select.Option key={template.name} value={template.name}>
                  {template.name} ({template.type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedTemplate && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: "white",
                border: "1px solid #d9d9d9",
                borderRadius: 4,
              }}
            >
              <h4>模板详情：</h4>
              <p>类型：{selectedTemplate.type}</p>
              <p>表名：{selectedTemplate.table}</p>
              <p>字段映射：</p>
              <ul>
                {selectedTemplate.fieldMapping.map((mapping, index) => (
                  <li key={index}>
                    {mapping.dbField} → {mapping.tableField}
                    {mapping.defaultValue !== null &&
                      ` (默认: ${mapping.defaultValue})`}
                  </li>
                ))}
              </ul>
              {selectedTemplate.whereClause &&
                selectedTemplate.whereClause.length > 0 && (
                  <p>
                    WHERE条件字段：{selectedTemplate.whereClause.join(", ")}
                  </p>
                )}
            </div>
          )}
        </Form>
      </div>
    );
  };

  // 渲染SQL预览
  const renderPreview = () => {
    const validMappings = fieldMappings.filter((mapping) => mapping.dbField);

    if (validMappings.length === 0) {
      return (
        <Input.TextArea
          value="-- 请先配置字段映射"
          rows={8}
          placeholder="SQL预览"
          style={{ width: "100%", fontFamily: "monospace" }}
          readOnly
        />
      );
    }

    let exampleSql = "";
    if (sqlType === "insert") {
      const dbFields = validMappings.map((mapping) => mapping.dbField);
      const values = validMappings.map((mapping) =>
        mapping.defaultValue !== null ? `'${mapping.defaultValue}'` : "NULL"
      );
      exampleSql = `INSERT INTO ${tableName} (${dbFields.join(
        ", "
      )}) VALUES (${values.join(", ")});`;
    } else if (sqlType === "update") {
      const setClauses = validMappings.map(
        (mapping) =>
          `${mapping.dbField} = ${
            mapping.defaultValue !== null ? `'${mapping.defaultValue}'` : "NULL"
          }`
      );

      // 预览WHERE条件
      const whereConditions: string[] = [];

      // 添加字段WHERE条件预览
      if (whereClauseFields.length > 0) {
        whereClauseFields.forEach((tableFieldKey) => {
          // 先尝试在字段映射中找到对应的数据库字段名
          const fieldMapping = validMappings.find(
            (mapping) => mapping.tableField === tableFieldKey
          );

          // 如果找到了映射，使用数据库字段名；否则直接使用表格字段名
          const dbFieldName = fieldMapping
            ? fieldMapping.dbField
            : tableFieldKey;

          whereConditions.push(`${dbFieldName} = '示例值'`);
        });
      }

      // 添加用户手动输入的WHERE条件预览
      if (additionalWhereClause.trim() !== "") {
        whereConditions.push(additionalWhereClause.trim());
      }

      const whereExample =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      exampleSql = `UPDATE ${tableName} SET ${setClauses.join(
        ", "
      )} ${whereExample};`;
    }

    return (
      <Input.TextArea
        value={exampleSql}
        rows={8}
        placeholder="SQL预览"
        style={{ width: "100%", fontFamily: "monospace" }}
        readOnly
      />
    );
  };

  return (
    <Modal
      title="生成SQL语句"
      visible={visible}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={exportSqlToTxt}>
          导出SQL文件
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label={
            <span>
              SQL构建器&nbsp;
              <Tooltip title="选择模板或手动配置字段映射来构建SQL语句">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="模板选择" key="template">
              {renderTemplateSelector()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="可视化构建" key="visual">
              {renderVisualBuilder()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="SQL解析" key="parser">
              {renderSqlParser()}
            </Tabs.TabPane>
            <Tabs.TabPane tab="SQL预览" key="preview">
              {renderPreview()}
            </Tabs.TabPane>
          </Tabs>
        </Form.Item>

        <Form.Item label="预览SQL">
          <Card size="small">
            {data.length > 0 ? (
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  maxHeight: "200px",
                  overflow: "auto",
                  fontSize: "12px",
                  backgroundColor: "#fafafa",
                  padding: "10px",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                }}
              >
                {highlightPlaceholders(
                  generateSqlStatements()[0] || "暂无预览数据"
                )}
              </pre>
            ) : (
              "暂无数据"
            )}
          </Card>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SqlGenerator;

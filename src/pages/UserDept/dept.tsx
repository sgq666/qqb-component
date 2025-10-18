import React, { useState } from "react";
import { Button, Upload, message, Spin, Tree } from "antd";
import { UploadOutlined, CopyOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import copyToClipboard from "../../utils/clipboard";
import SqlGenerator from "./sqlGenerator"; // 引入SqlGenerator组件

interface DeptData {
  id: string;
  deptName: string;
  deptCode: string;
  deptLevel: string;
  parentCode: string | null;
  children?: DeptData[];
  isNew?: boolean; // 标记是否为新增部门
}

const Dept: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [deptTree, setDeptTree] = useState<DeptData[]>([
    {
      id: "1",
      deptName: "省厅",
      deptCode: "001",
      deptLevel: "0",
      parentCode: null,
      children: [
        {
          id: "2",
          deptName: "分局",
          deptCode: "002",
          deptLevel: "1",
          parentCode: "001",
          children: [
            {
              id: "3",
              deptName: "派出所1",
              deptCode: "003",
              deptLevel: "2",
              parentCode: "002",
            },
          ],
        },
      ],
    },
  ]);
  const [importedDepts, setImportedDepts] = useState<DeptData[]>([]); // 存储导入的部门数据
  const [sqlGeneratorVisible, setSqlGeneratorVisible] = useState(false); // 控制SqlGenerator模态框显示

  // 下载模板功能
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const templateData = [["部门代码", "部门名称", "父级部门代码"]];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "部门导入模板");
    XLSX.writeFile(wb, "部门导入模板.xlsx");
  };

  // 处理文件上传
  const handleUpload = (file: File) => {
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        });

        if (jsonData.length > 1) {
          const newDepts: DeptData[] = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 3) {
              newDepts.push({
                id: `dept_${Date.now()}_${i}`, // 临时ID
                deptCode: row[0] || "",
                deptName: row[1] || "",
                parentCode: row[2] || null,
                deptLevel: "0", // 初始值，后续会根据父级计算
                isNew: true, // 标记为新增部门
              });
            }
          }

          // 计算部门层级
          const deptsWithLevel = calculateDeptLevels(newDepts, deptTree);
          setImportedDepts(deptsWithLevel);

          // 合并到现有树结构中（仅用于展示）
          const mergedTree = mergeDeptTree([...deptTree], deptsWithLevel);
          setDeptTree(mergedTree);

          message.success("数据导入成功");
        } else {
          message.warning("文件中没有数据");
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

    reader.readAsArrayBuffer(file);
    return false;
  };

  // 根据父级部门计算部门层级
  const calculateDeptLevels = (
    importedDepts: DeptData[],
    existingTree: DeptData[]
  ): DeptData[] => {
    const result = [...importedDepts];

    // 创建部门代码到部门对象的映射
    const deptMap = new Map<string, DeptData>();
    const buildDeptMap = (depts: DeptData[]) => {
      depts.forEach((dept) => {
        deptMap.set(dept.deptCode, dept);
        if (dept.children) {
          buildDeptMap(dept.children);
        }
      });
    };

    // 构建现有部门树的映射
    buildDeptMap(existingTree);

    // 为导入的部门计算层级
    result.forEach((dept) => {
      if (dept.parentCode) {
        const parentDept = deptMap.get(dept.parentCode);
        if (parentDept) {
          dept.deptLevel = (parseInt(parentDept.deptLevel) + 1).toString();
        } else {
          // 如果找不到父级部门，默认为层级1
          dept.deptLevel = "1";
        }
      } else {
        // 没有父级部门，默认为层级0
        dept.deptLevel = "0";
      }
    });

    return result;
  };

  // 将导入的部门合并到现有树结构中（仅用于展示）
  const mergeDeptTree = (
    tree: DeptData[],
    importedDepts: DeptData[]
  ): DeptData[] => {
    const result = [...tree];
    const treeMap = new Map<string, DeptData>();

    // 构建现有树的映射
    const buildTreeMap = (depts: DeptData[]) => {
      depts.forEach((dept) => {
        treeMap.set(dept.deptCode, dept);
        if (dept.children) {
          buildTreeMap(dept.children);
        }
      });
    };

    buildTreeMap(result);

    // 将导入的部门添加到树中
    importedDepts.forEach((dept) => {
      if (dept.parentCode) {
        const parentDept = treeMap.get(dept.parentCode);
        if (parentDept) {
          if (!parentDept.children) {
            parentDept.children = [];
          }
          // 避免重复添加
          if (
            !parentDept.children.some(
              (child) => child.deptCode === dept.deptCode
            )
          ) {
            parentDept.children.push(dept);
          }
        }
      } else {
        // 没有父级的部门添加到根级别
        if (!result.some((rootDept) => rootDept.deptCode === dept.deptCode)) {
          result.push(dept);
        }
      }
    });

    return result;
  };

  // 提交数据到后台
  const handleSubmit = () => {
    if (importedDepts.length === 0) {
      message.warning("请先导入部门数据");
      return;
    }

    // 显示SQL生成器模态框
    setSqlGeneratorVisible(true);
  };

  // 处理SQL导出
  const handleSqlExport = (sqlStatements: string[]) => {
    // 在这里处理生成的SQL语句
    console.log("生成的SQL语句:", sqlStatements);

    // 创建一个Blob对象包含所有SQL语句
    const blob = new Blob([sqlStatements.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "departments.sql";
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

  // 渲染树节点标题
  const renderTreeNodeTitle = (dept: DeptData) => {
    const copyDeptCode = (deptCode: string, e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡，避免触发树节点的其他操作
      copyToClipboard(
        deptCode,
        `部门代码 ${deptCode} 已复制到剪贴板`,
        "复制失败"
      );
    };

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: dept.isNew ? "red" : "inherit", flex: 1 }}>
          {dept.deptName} ({dept.deptCode})
        </span>
        <Button
          type="text"
          icon={<CopyOutlined />}
          onClick={(e) => copyDeptCode(dept.deptCode, e)}
          size="small"
          style={{
            opacity: 0.5,
            transition: "opacity 0.3s",
            minWidth: "auto",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
        />
      </div>
    );
  };

  // 转换部门数据为树形结构
  const convertToTreeData = (
    depts: DeptData[]
  ): Array<{
    title: React.ReactNode;
    key: string;
    children: any[];
  }> => {
    return depts.map((dept) => ({
      title: renderTreeNodeTitle(dept),
      key: dept.deptCode,
      children: dept.children ? convertToTreeData(dept.children) : [],
    }));
  };

  // 下载所有部门数据为Excel
  const downloadAllDepts = () => {
    // 展平部门树结构为列表
    const flattenDepts = (
      depts: DeptData[],
      result: DeptData[] = []
    ): DeptData[] => {
      depts.forEach((dept) => {
        result.push(dept);
        if (dept.children && dept.children.length > 0) {
          flattenDepts(dept.children, result);
        }
      });
      return result;
    };

    // 获取所有部门数据
    const allDepts = flattenDepts(deptTree);

    // 创建父级部门代码到部门对象的映射，用于获取父级部门名称
    const deptMap = new Map<string, DeptData>();
    allDepts.forEach((dept) => {
      deptMap.set(dept.deptCode, dept);
    });

    // 构造导出数据
    const exportData = allDepts.map((dept) => {
      const parentDept = dept.parentCode ? deptMap.get(dept.parentCode) : null;
      return {
        部门代码: dept.deptCode,
        部门名称: dept.deptName,
        父级部门代码: dept.parentCode || "",
        父级部门名称: parentDept ? parentDept.deptName : "",
        部门层级: dept.deptLevel,
      };
    });

    // 创建Excel文件并下载
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "部门数据");
    XLSX.writeFile(wb, "部门数据.xlsx");
  };

  const treeData = convertToTreeData(deptTree);

  // 定义字段映射
  const fields = [
    { key: "deptCode", label: "部门代码" },
    { key: "deptName", label: "部门名称" },
    { key: "parentCode", label: "父级部门代码" },
    { key: "deptLevel", label: "部门层级" },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <Button onClick={downloadTemplate} type="primary">
          下载模板
        </Button>

        <Upload
          beforeUpload={handleUpload}
          maxCount={1}
          accept=".xlsx,.xls"
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>上传Excel</Button>
        </Upload>

        <Button onClick={downloadAllDepts} type="primary">
          下载部门数据
        </Button>

        {importedDepts.length > 0 && (
          <Button onClick={handleSubmit} type="primary">
            生成sql
          </Button>
        )}
      </div>

      <Spin spinning={loading}>
        <div style={{ marginTop: "20px" }}>
          <h3>部门结构</h3>
          {treeData.length > 0 ? (
            <Tree
              treeData={treeData}
              defaultExpandAll
              style={{
                backgroundColor: "#f5f5f5",
                padding: "16px",
                borderRadius: "4px",
              }}
            />
          ) : (
            <p>暂无部门数据</p>
          )}
        </div>
      </Spin>

      {/* SqlGenerator 组件 */}
      <SqlGenerator
        visible={sqlGeneratorVisible}
        onCancel={() => setSqlGeneratorVisible(false)}
        onDataExport={handleSqlExport}
        fields={fields}
        data={importedDepts}
      />
    </div>
  );
};

export default Dept;

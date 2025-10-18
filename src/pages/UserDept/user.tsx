import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Input,
  Upload,
  message,
  Spin,
  Modal,
  Radio,
  PaginationProps,
  Select,
  Form,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import SqlGenerator from "./sqlGenerator";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface UserData {
  key: string;
  chineseName: string; // 姓名
  userName: string; // 警号
  idcardNo: string; // 身份证号
  phoneNo: string; // 手机号码
  deptCode: string; // 所属派出所
  powerId?: string; // 权限
}

const User: React.FC = () => {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<UserData[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<React.Key[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({}); // 修改为单个角色ID而不是数组
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(""); // 单选改为单个值
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectAll, setSelectAll] = useState(false);
  const [permissionFilter, setPermissionFilter] = useState<string>("all"); // 权限筛选状态

  // 新增状态用于SQL生成功能
  const [isSqlGeneratorVisible, setIsSqlGeneratorVisible] = useState(false);

  // 模拟获取权限数据
  useEffect(() => {
    const mockRoles = [
      { id: "1", name: "管理员" },
      { id: "2", name: "普通用户" },
      { id: "3", name: "审核员" },
      { id: "4", name: "查看员" },
    ];
    setRoles(mockRoles);
  }, []);

  // 计算已分配和未分配权限的用户数量
  const getPermissionStats = () => {
    const assigned = userData.filter((user) => userRoles[user.idcardNo]).length;
    const unassigned = userData.length - assigned;
    return { assigned, unassigned };
  };

  // 下载模板功能
  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const templateData = [
      ["姓名", "警号", "身份证号", "手机号码", "所属派出所"],
    ];
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "用户导入模板");
    XLSX.writeFile(wb, "用户导入模板.xlsx");
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
          const users: UserData[] = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 5) {
              users.push({
                key: row[2] || `user_${i}`, // 使用身份证号作为key
                chineseName: row[0] || "", // 姓名
                userName: row[1] || "", // 警号
                idcardNo: row[2] || "", // 身份证号
                phoneNo: row[3] || "", // 手机号码
                deptCode: row[4] || "", // 所属派出所
              });
            }
          }

          setUserData(users);
          setFilteredData(users);
          setPagination({
            ...pagination,
            total: users.length,
          });
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

  // 查询功能
  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, permissionFilter);
  };

  // 权限筛选功能
  const handlePermissionFilter = (value: string) => {
    setPermissionFilter(value);
    applyFilters(searchText, value);
  };

  // 应用所有筛选条件
  const applyFilters = (searchValue: string, permissionValue: string) => {
    let result = [...userData];

    // 应用搜索筛选
    if (searchValue) {
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          val.toString().toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }

    // 应用权限筛选
    if (permissionValue === "assigned") {
      result = result.filter((user) => userRoles[user.idcardNo]);
    } else if (permissionValue === "unassigned") {
      result = result.filter((user) => !userRoles[user.idcardNo]);
    }

    setFilteredData(result);
    setPagination({
      ...pagination,
      total: result.length,
      current: 1,
    });
  };

  // 打开权限分配弹窗
  const showRoleModal = () => {
    if (selectedUsers.length === 0) {
      message.warning("请先选择用户");
      return;
    }
    setIsRoleModalVisible(true);
  };

  // 关闭权限分配弹窗
  const handleRoleModalCancel = () => {
    setIsRoleModalVisible(false);
    setSelectedRoleId("");
  };

  // 确认分配权限
  const handleRoleAssign = () => {
    if (!selectedRoleId) {
      message.warning("请选择权限");
      return;
    }

    const newUserRoles = { ...userRoles };
    selectedUsers.forEach((userId) => {
      const user = userData.find((u) => u.key === userId);
      if (user) {
        newUserRoles[user.idcardNo] = selectedRoleId; // 使用身份证号作为键
      }
    });
    setUserRoles(newUserRoles);
    setIsRoleModalVisible(false);
    setSelectedRoleId("");
    message.success("权限分配成功");

    // 重新应用筛选条件
    applyFilters(searchText, permissionFilter);
  };

  // 处理分页变化
  const handleTableChange: PaginationProps["onChange"] = (page, pageSize) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize,
    });
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allKeys = filteredData.map((item) => item.key);
      setSelectedUsers(allKeys);
    } else {
      setSelectedUsers([]);
    }
  };

  // 提交数据到后台
  const handleSubmit = () => {
    // 检查是否有未分配权限的用户
    const usersWithoutRole = userData.filter(
      (user) => !userRoles[user.idcardNo]
    );

    if (usersWithoutRole.length > 0) {
      message.error(
        `存在未分配权限的用户: ${usersWithoutRole
          .map((u) => u.chineseName)
          .join(", ")}，请先为所有用户分配权限`
      );
      return;
    }

    // 收集所有用户数据和对应的角色信息
    const submitData = userData.map((user) => ({
      ...user,
      powerId: userRoles[user.idcardNo], // 使用身份证号获取角色ID
    }));

    // 打印到控制台
    console.log("提交的数据:", submitData);

    // 显示SQL生成器模态框
    setIsSqlGeneratorVisible(true);
  };

  // 处理SQL导出
  const handleSqlExport = (sqlStatements: string[]) => {
    const blob = new Blob([sqlStatements.join(";\n") + ";"], {
      type: "text/plain;charset=utf-8",
    });

    saveAs(blob, "generated_sql.txt");
    message.success("SQL文件导出成功");
    setIsSqlGeneratorVisible(false);
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys: selectedUsers,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedUsers(selectedRowKeys);
      setSelectAll(
        selectedRowKeys.length === filteredData.length &&
          filteredData.length > 0
      );
    },
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      {
        key: "all-data",
        text: "选择所有数据",
        onSelect: () => handleSelectAll(true),
      },
    ],
  };

  // 获取权限统计信息
  const { assigned, unassigned } = getPermissionStats();

  // 表格列定义
  const columns = [
    {
      title: "姓名",
      dataIndex: "chineseName",
      key: "chineseName",
    },
    {
      title: "警号",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "身份证号",
      dataIndex: "idcardNo",
      key: "idcardNo",
    },
    {
      title: "手机号码",
      dataIndex: "phoneNo",
      key: "phoneNo",
    },
    {
      title: "所属派出所",
      dataIndex: "deptCode",
      key: "deptCode",
    },
    {
      title: "权限",
      dataIndex: "powerId",
      key: "powerId",
      render: (_: any, record: UserData) => {
        const roleId = userRoles[record.idcardNo]; // 使用身份证号获取角色ID
        const roleName = roleId
          ? roles.find((r) => r.id === roleId)?.name
          : null;

        return roleName || "未分配";
      },
    },
  ];

  // 可用字段列表
  const availableFields = [
    { key: "chineseName", label: "姓名" },
    { key: "userName", label: "警号" },
    { key: "idcardNo", label: "身份证号" },
    { key: "phoneNo", label: "手机号码" },
    { key: "deptCode", label: "所属派出所" },
    { key: "powerId", label: "权限ID" },
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

        {userData.length > 0 && (
          <Button onClick={showRoleModal} type="primary">
            分配权限
          </Button>
        )}

        {/* 添加提交按钮 */}
        {userData.length > 0 && (
          <Button onClick={handleSubmit} type="primary">
            生成sql
          </Button>
        )}
      </div>

      {userData.length > 0 && (
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Input.Search
            placeholder="请输入搜索内容"
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />

          <Select
            value={permissionFilter}
            onChange={handlePermissionFilter}
            style={{ width: 200 }}
          >
            <Select.Option value="all">全部用户</Select.Option>
            <Select.Option value="assigned">
              已分配权限 ({assigned})
            </Select.Option>
            <Select.Option value="unassigned">
              未分配权限 ({unassigned})
            </Select.Option>
          </Select>

          <div>
            已分配权限: {assigned} 人，未分配权限: {unassigned} 人
          </div>
        </div>
      )}

      <Spin spinning={loading}>
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: "max-content" }}
          rowSelection={rowSelection}
          onChange={(pagination) => {
            const { current, pageSize } = pagination;
            if (current !== undefined && pageSize !== undefined) {
              handleTableChange(current, pageSize);
            }
          }}
        />
      </Spin>

      {/* 权限分配弹窗 */}
      <Modal
        title="分配权限"
        visible={isRoleModalVisible}
        onOk={handleRoleAssign}
        onCancel={handleRoleModalCancel}
        okText="确认"
        cancelText="取消"
      >
        <p>为选中的 {selectedUsers.length} 个用户分配权限：</p>
        <Radio.Group
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {roles.map((role) => (
            <Radio key={role.id} value={role.id} style={{ margin: "5px 0" }}>
              {role.name}
            </Radio>
          ))}
        </Radio.Group>
      </Modal>

      {/* 使用SqlGenerator组件 */}
      <SqlGenerator
        visible={isSqlGeneratorVisible}
        onCancel={() => setIsSqlGeneratorVisible(false)}
        onDataExport={handleSqlExport}
        fields={availableFields}
        data={userData.map((user) => ({
          ...user,
          powerId: userRoles[user.idcardNo] || "",
        }))}
        defaultTemplate=""
      />
    </div>
  );
};

export default User;

import React, { useState } from "react";
import { Tabs } from "antd";
import User from "./user"; // 引入用户组件
import Dept from "./dept"; // 引入部门组件
import Xzqh from "./xzqh";
import OtherTable from "./otherTable";
const UserDeptTabs: React.FC = () => {
  const [activeKey, setActiveKey] = useState("user");

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Tabs centered={true} activeKey={activeKey} onChange={handleTabChange}>
        <Tabs.TabPane tab="用户" key="user">
          <User />
        </Tabs.TabPane>
        <Tabs.TabPane tab="部门" key="dept">
          <Dept />
        </Tabs.TabPane>
        <Tabs.TabPane tab="行政区划" key="xzqh">
          <Xzqh />
        </Tabs.TabPane>
        <Tabs.TabPane tab="其他" key="other">
          <OtherTable />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default UserDeptTabs;

import React from "react";
import { Card, Typography, Layout, Menu } from "antd";
import { 
  PlusOutlined, 
  SettingOutlined, 
  HistoryOutlined, 
  CheckCircleOutlined, 
  BarChartOutlined 
} from "@ant-design/icons";
import { Link, useLocation, Switch, Route, Redirect } from "react-router-dom";
import CheckPointReporting from "./CheckPointReporting";
import CheckInRules from "./CheckInRules";
import CheckInDataManagement from "./CheckInDataManagement";
import CheckInFunction from "./CheckInFunction";
import CheckInStatistics from "./CheckInStatistics";
import { initialCheckPoints, initialCheckInRecords, initialCheckInRules, initialStatistics } from "./checkInData";
import { CheckPoint, CheckInRecord, CheckInRule } from "./types";

const { Sider, Content } = Layout;
const { Title } = Typography;

const CheckInLayout: React.FC = () => {
  const location = useLocation();
  const [checkPoints, setCheckPoints] = React.useState<CheckPoint[]>(initialCheckPoints);
  const [checkInRecords, setCheckInRecords] = React.useState<CheckInRecord[]>(initialCheckInRecords);
  const [checkInRules, setCheckInRules] = React.useState<CheckInRule[]>(initialCheckInRules);
  const [statistics] = React.useState(initialStatistics);
  const [selectedCheckpoint, setSelectedCheckpoint] = React.useState<CheckPoint | null>(null);

  // 添加打卡点
  const handleAddCheckPoint = (checkpoint: CheckPoint) => {
    setCheckPoints([...checkPoints, checkpoint]);
  };

  // 删除打卡点
  const handleDeleteCheckPoint = (id: string) => {
    setCheckPoints(checkPoints.filter(point => point.id !== id));
  };

  // 添加规则
  const handleAddRule = (rule: CheckInRule) => {
    setCheckInRules([...checkInRules, rule]);
  };

  // 执行打卡
  const handleCheckIn = (record: CheckInRecord) => {
    setCheckInRecords([record, ...checkInRecords]);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card>
        <Title level={2}>
          <CheckCircleOutlined /> 打卡管理系统
        </Title>
        
        <Layout style={{ minHeight: "600px" }}>
          <Sider width={200} className="site-layout-background">
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              style={{ height: "100%", borderRight: 0 }}
            >
              <Menu.Item key="/check-in/reporting" icon={<PlusOutlined />}>
                <Link to="/check-in/reporting">打卡点上报</Link>
              </Menu.Item>
              <Menu.Item key="/check-in/rules" icon={<SettingOutlined />}>
                <Link to="/check-in/rules">打卡规则配置</Link>
              </Menu.Item>
              <Menu.Item key="/check-in/data" icon={<HistoryOutlined />}>
                <Link to="/check-in/data">打卡数据管理</Link>
              </Menu.Item>
              <Menu.Item key="/check-in/function" icon={<CheckCircleOutlined />}>
                <Link to="/check-in/function">打卡功能</Link>
              </Menu.Item>
              <Menu.Item key="/check-in/statistics" icon={<BarChartOutlined />}>
                <Link to="/check-in/statistics">打卡统计分析</Link>
              </Menu.Item>
            </Menu>
          </Sider>
          
          <Layout style={{ padding: "0 24px 24px" }}>
            <Content
              className="site-layout-background"
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
              }}
            >
              <Switch>
                <Route exact path="/check-in/reporting">
                  <CheckPointReporting 
                    checkPoints={checkPoints}
                    onAddCheckPoint={handleAddCheckPoint}
                    onDeleteCheckPoint={handleDeleteCheckPoint}
                  />
                </Route>
                <Route exact path="/check-in/rules">
                  <CheckInRules 
                    checkPoints={checkPoints}
                    checkInRules={checkInRules}
                    onAddRule={handleAddRule}
                  />
                </Route>
                <Route exact path="/check-in/data">
                  <CheckInDataManagement 
                    checkPoints={checkPoints}
                    checkInRecords={checkInRecords}
                  />
                </Route>
                <Route exact path="/check-in/function">
                  <CheckInFunction 
                    checkPoints={checkPoints}
                    onCheckIn={handleCheckIn}
                    selectedCheckpoint={selectedCheckpoint}
                    onSelectCheckpoint={setSelectedCheckpoint}
                  />
                </Route>
                <Route exact path="/check-in/statistics">
                  <CheckInStatistics statistics={statistics} />
                </Route>
                <Redirect from="/check-in" to="/check-in/reporting" />
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </Card>
    </div>
  );
};

export default CheckInLayout;
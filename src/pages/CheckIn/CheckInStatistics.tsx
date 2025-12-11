import React from "react";
import {
  Card,
  Statistic,
  Divider,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

interface CheckInStatisticsProps {
  statistics: {
    totalCheckIns: number;
    successRate: number;
    avgDistance: number;
  };
}

const CheckInStatistics: React.FC<CheckInStatisticsProps> = ({
  statistics,
}) => {
  // 渲染统计图表（简化版）
  const renderStatistics = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <Card style={{ flex: 1 }}>
          <Statistic
            title="总打卡次数"
            value={statistics.totalCheckIns}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
        <Card style={{ flex: 1 }}>
          <Statistic
            title="成功率"
            value={statistics.successRate}
            precision={2}
            suffix="%"
            prefix={<BarChartOutlined />}
          />
        </Card>
        <Card style={{ flex: 1 }}>
          <Statistic
            title="平均距离"
            value={statistics.avgDistance}
            precision={1}
            suffix="米"
          />
        </Card>
      </div>
      
      <Divider />
      
      <Card title="近7天打卡趋势">
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">此处应显示打卡趋势图表</Text>
        </div>
      </Card>
    </div>
  );

  return (
    <div>
      {renderStatistics()}
    </div>
  );
};

export default CheckInStatistics;
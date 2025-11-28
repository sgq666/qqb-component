import React from "react";
import { ConfigProvider, DatePicker, Space, Typography, Card } from "antd";
import zhCN from 'antd/lib/locale/zh_CN';
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

// 设置dayjs为中文
dayjs.locale("zh-cn");
dayjs.extend(weekday);
dayjs.extend(localeData);

const { RangePicker } = DatePicker;
const { Title } = Typography;

const FinalTest: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ padding: "24px" }}>
        <Title level={2}>最终测试日期选择器中文化</Title>
        <Card title="日期选择器测试">
          <Space direction="vertical" size={20}>
            <div>
              <h3>普通日期选择器:</h3>
              <DatePicker placeholder="请选择日期" />
            </div>
            <div>
              <h3>时间范围选择器:</h3>
              <RangePicker
                showTime={{ format: 'HH:mm:ss' }}
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['开始时间', '结束时间']}
              />
            </div>
            <div>
              <h3>月份选择器:</h3>
              <DatePicker picker="month" placeholder="请选择月份" />
            </div>
            <div>
              <h3>周选择器:</h3>
              <DatePicker picker="week" placeholder="请选择周" />
            </div>
          </Space>
        </Card>
      </div>
    </ConfigProvider>
  );
};

export default FinalTest;
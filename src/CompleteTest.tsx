import React from "react";
import { ConfigProvider, DatePicker, Space, Typography } from "antd";
import zhCN from 'antd/lib/locale/zh_CN';
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";

// 设置dayjs为中文
dayjs.locale("zh-cn");

// 引入dayjs的插件和本地化
dayjs.extend(weekday);
dayjs.extend(localeData);

const { RangePicker } = DatePicker;
const { Title } = Typography;

const CompleteTest: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ padding: "24px" }}>
        <Title level={2}>完整测试日期选择器中文化</Title>
        <Space direction="vertical" size={20}>
          <div>
            <h3>普通日期选择器:</h3>
            <DatePicker />
          </div>
          <div>
            <h3>时间范围选择器:</h3>
            <RangePicker
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={['开始时间', '结束时间']}
            />
          </div>
        </Space>
      </div>
    </ConfigProvider>
  );
};

export default CompleteTest;
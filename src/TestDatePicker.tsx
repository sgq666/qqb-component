import React from "react";
import { ConfigProvider, DatePicker, Space } from "antd";
import zhCN from 'antd/lib/locale/zh_CN';
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

// 设置dayjs为中文
dayjs.locale("zh-cn");

const { RangePicker } = DatePicker;

const TestDatePicker: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <div style={{ padding: "24px" }}>
        <h1>测试日期选择器中文化</h1>
        <Space direction="vertical" size={12}>
          <RangePicker
            showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD HH:mm:ss"
            placeholder={['开始时间', '结束时间']}
          />
        </Space>
      </div>
    </ConfigProvider>
  );
};

export default TestDatePicker;
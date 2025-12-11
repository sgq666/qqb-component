import React from "react";
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  Tag,
  DatePicker,
} from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import { CheckInRecord, CheckPoint } from "./types";
import moment from "moment";

const { Option } = Select;

interface CheckInDataManagementProps {
  checkPoints: CheckPoint[];
  checkInRecords: CheckInRecord[];
}

const CheckInDataManagement: React.FC<CheckInDataManagementProps> = ({
  checkPoints,
  checkInRecords,
}) => {
  // 渲染打卡记录表格
  const renderCheckInRecordsTable = () => (
    <Table
      dataSource={checkInRecords}
      columns={[
        {
          title: "打卡点",
          dataIndex: "checkpointName",
          key: "checkpointName",
        },
        {
          title: "打卡时间",
          dataIndex: "checkTime",
          key: "checkTime",
        },
        {
          title: "距离(米)",
          dataIndex: "distance",
          key: "distance",
          render: (text: number) => Math.round(text),
        },
        {
          title: "状态",
          dataIndex: "status",
          key: "status",
          render: (status: "success" | "failed") => (
            <Tag color={status === "success" ? "green" : "red"}>
              {status === "success" ? "成功" : "失败"}
            </Tag>
          ),
        },
        {
          title: "备注",
          dataIndex: "remark",
          key: "remark",
        },
        {
          title: "照片",
          key: "photos",
          render: (_, record) => (
            record.photoUrls.length > 0 ? 
            <span>{record.photoUrls.length} 张</span> : 
            <span>无</span>
          ),
        },
      ]}
      rowKey="id"
      pagination={{
        pageSize: 5,
      }}
    />
  );

  return (
    <div>
      <Card title="打卡记录查询">
        <Form layout="inline" style={{ marginBottom: 20 }}>
          <Form.Item label="打卡点">
            <Select style={{ width: 150 }} placeholder="请选择打卡点">
              {checkPoints.map(point => (
                <Option key={point.id} value={point.id}>
                  {point.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="日期范围">
            <DatePicker.RangePicker />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary">查询</Button>
          </Form.Item>
        </Form>
        
        {renderCheckInRecordsTable()}
      </Card>
    </div>
  );
};

export default CheckInDataManagement;
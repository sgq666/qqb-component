import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  Row,
  Col,
  message,
  Table,
  Tag,
  Space,
  Select,
  DatePicker,
  Input,
} from "antd";
import { SettingOutlined } from "@ant-design/icons";
import moment from "moment";
import { CheckInRule, CheckPoint } from "./types";

interface CheckInRulesProps {
  checkPoints: CheckPoint[];
  checkInRules: CheckInRule[];
  onAddRule: (rule: CheckInRule) => void;
}

const { Option } = Select;

const CheckInRules: React.FC<CheckInRulesProps> = ({
  checkPoints,
  checkInRules,
  onAddRule,
}) => {
  const [loading, setLoading] = useState(false);

  // 配置打卡规则
  const handleConfigureRule = (values: any) => {
    setLoading(true);
    const newRule: CheckInRule = {
      id: Date.now().toString(),
      checkpointId: values.checkpointId,
      frequency: values.frequency,
      timeRange: [values.startTime.format("HH:mm"), values.endTime.format("HH:mm")],
      maxDistance: parseInt(values.maxDistance),
      enabled: values.enabled,
    };
    
    setTimeout(() => {
      onAddRule(newRule);
      setLoading(false);
      message.success("打卡规则配置成功");
    }, 1000);
  };

  return (
    <div>
      <Card title="配置打卡规则">
        <Form onFinish={handleConfigureRule} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="checkpointId"
                label="选择打卡点"
                rules={[{ required: true, message: "请选择打卡点" }]}
              >
                <Select placeholder="请选择打卡点">
                  {checkPoints.map(point => (
                    <Option key={point.id} value={point.id}>
                      {point.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="frequency"
                label="打卡频率"
                rules={[{ required: true, message: "请选择打卡频率" }]}
              >
                <Select placeholder="请选择打卡频率">
                  <Option value="daily">每日</Option>
                  <Option value="weekly">每周</Option>
                  <Option value="monthly">每月</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="开始时间"
                rules={[{ required: true, message: "请选择开始时间" }]}
              >
                <DatePicker.TimePicker format="HH:mm" placeholder="请选择开始时间" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="结束时间"
                rules={[{ required: true, message: "请选择结束时间" }]}
              >
                <DatePicker.TimePicker format="HH:mm" placeholder="请选择结束时间" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxDistance"
                label="最大距离(米)"
                rules={[{ required: true, message: "请输入最大距离" }]}
              >
                <Input type="number" placeholder="请输入最大距离" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="enabled"
                label="是否启用"
                initialValue={true}
              >
                <Select>
                  <Option value={true}>启用</Option>
                  <Option value={false}>禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存规则
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      <Card title="规则列表" style={{ marginTop: 20 }}>
        <Table
          dataSource={checkInRules}
          columns={[
            {
              title: "打卡点",
              dataIndex: "checkpointId",
              key: "checkpointId",
              render: (checkpointId: string) => {
                const point = checkPoints.find(p => p.id === checkpointId);
                return point ? point.name : "未知";
              },
            },
            {
              title: "频率",
              dataIndex: "frequency",
              key: "frequency",
              render: (frequency: string) => {
                const freqMap: Record<string, string> = {
                  daily: "每日",
                  weekly: "每周",
                  monthly: "每月",
                  custom: "自定义",
                };
                return freqMap[frequency] || frequency;
              },
            },
            {
              title: "时间范围",
              key: "timeRange",
              render: (_, record) => `${record.timeRange[0]} - ${record.timeRange[1]}`,
            },
            {
              title: "最大距离(米)",
              dataIndex: "maxDistance",
              key: "maxDistance",
            },
            {
              title: "状态",
              dataIndex: "enabled",
              key: "enabled",
              render: (enabled: boolean) => (
                <Tag color={enabled ? "green" : "red"}>
                  {enabled ? "启用" : "禁用"}
                </Tag>
              ),
            },
            {
              title: "操作",
              key: "action",
              render: (_, record) => (
                <Space>
                  <Button size="small">编辑</Button>
                  <Button size="small" danger>删除</Button>
                </Space>
              ),
            },
          ]}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default CheckInRules;
import React, { useState } from "react";
import {
  Button,
  Card,
  Alert,
  Spin,
  Typography,
  Space,
  Input,
  Form,
  Row,
  Col,
  message,
  Tabs,
  Upload,
  DatePicker,
  Select,
  Table,
  Tag,
  Descriptions,
  Modal,
  Statistic,
  Divider,
} from "antd";
import {
  EnvironmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  PlusOutlined,
  HistoryOutlined,
  BarChartOutlined,
  SettingOutlined,
  CameraOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd/es/upload/interface";
import type { RcFile } from "antd/es/upload";
import moment from "moment";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// 定义打卡点接口
interface CheckPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  photoUrl?: string;
  createdAt: string;
}

// 定义打卡记录接口
interface CheckInRecord {
  id: string;
  checkpointId: string;
  checkpointName: string;
  latitude: number;
  longitude: number;
  checkTime: string;
  remark?: string;
  photoUrls: string[];
  status: "success" | "failed";
  distance: number;
}

// 定义打卡规则接口
interface CheckInRule {
  id: string;
  checkpointId: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  timeRange: [string, string]; // [开始时间, 结束时间]
  maxDistance: number; // 最大距离(米)
  enabled: boolean;
}

const CheckInMainPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [checkPoints, setCheckPoints] = useState<CheckPoint[]>([
    {
      id: "1",
      name: "公司大门",
      latitude: 39.9042,
      longitude: 116.4074,
      description: "公司正门入口",
      createdAt: "2023-01-01",
    },
  ]);
  const [checkInRecords, setCheckInRecords] = useState<CheckInRecord[]>([
    {
      id: "1",
      checkpointId: "1",
      checkpointName: "公司大门",
      latitude: 39.9042,
      longitude: 116.4074,
      checkTime: "2023-01-01 09:00:00",
      remark: "按时上班打卡",
      photoUrls: [],
      status: "success",
      distance: 50,
    },
  ]);
  const [checkInRules, setCheckInRules] = useState<CheckInRule[]>([
    {
      id: "1",
      checkpointId: "1",
      frequency: "daily",
      timeRange: ["08:00", "09:30"],
      maxDistance: 100,
      enabled: true,
    },
  ]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<CheckPoint | null>(null);
  const [remark, setRemark] = useState("");
  const [photoList, setPhotoList] = useState<any[]>([]);
  const [statistics, setStatistics] = useState({
    totalCheckIns: 120,
    successRate: 98.3,
    avgDistance: 45.2,
  });

  // 模拟获取当前位置
  const getCurrentLocation = () => {
    setLocationLoading(true);
    // 模拟定位过程
    setTimeout(() => {
      setCurrentLocation({
        latitude: 39.9042 + (Math.random() - 0.5) * 0.01,
        longitude: 116.4074 + (Math.random() - 0.5) * 0.01,
        accuracy: 10 + Math.random() * 20,
      });
      setLocationLoading(false);
      message.success("定位成功");
    }, 1500);
  };

  // 上传图片相关
  const uploadProps: UploadProps = {
    beforeUpload: (file: RcFile) => {
      const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("只能上传 JPG/PNG 格式的图片!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("图片大小不能超过 2MB!");
      }
      return isJpgOrPng && isLt2M;
    },
    onChange: (info) => {
      setPhotoList(info.fileList);
    },
    listType: "picture-card",
    fileList: photoList,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  };

  // 添加打卡点
  const handleAddCheckpoint = (values: any) => {
    setLoading(true);
    const newCheckpoint: CheckPoint = {
      id: Date.now().toString(),
      name: values.name,
      latitude: parseFloat(values.latitude),
      longitude: parseFloat(values.longitude),
      description: values.description,
      createdAt: moment().format("YYYY-MM-DD"),
    };
    
    setTimeout(() => {
      setCheckPoints([...checkPoints, newCheckpoint]);
      setLoading(false);
      message.success("打卡点添加成功");
    }, 1000);
  };

  // 配置打卡规则
  const handleConfigureRule = (values: any) => {
    setLoading(true);
    const newRule: CheckInRule = {
      id: Date.now().toString(),
      checkpointId: values.checkpointId,
      frequency: values.frequency,
      timeRange: [values.startTime, values.endTime],
      maxDistance: parseInt(values.maxDistance),
      enabled: values.enabled,
    };
    
    setTimeout(() => {
      setCheckInRules([...checkInRules, newRule]);
      setLoading(false);
      message.success("打卡规则配置成功");
    }, 1000);
  };

  // 执行打卡
  const handleCheckIn = () => {
    if (!currentLocation) {
      message.error("请先获取当前位置");
      return;
    }
    
    if (!selectedCheckpoint) {
      message.error("请选择打卡点");
      return;
    }
    
    setLoading(true);
    
    // 模拟打卡过程
    setTimeout(() => {
      const distance = Math.random() * 100; // 模拟距离
      
      const newRecord: CheckInRecord = {
        id: Date.now().toString(),
        checkpointId: selectedCheckpoint.id,
        checkpointName: selectedCheckpoint.name,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        checkTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        remark: remark,
        photoUrls: photoList.map(file => file.url || file.thumbUrl).filter(Boolean),
        status: distance <= 100 ? "success" : "failed", // 假设100米为范围限制
        distance: distance,
      };
      
      setCheckInRecords([newRecord, ...checkInRecords]);
      setLoading(false);
      
      if (newRecord.status === "success") {
        message.success("打卡成功！");
      } else {
        message.error(`打卡失败！您距离打卡点 ${Math.round(distance)} 米，超出范围`);
      }
    }, 1500);
  };

  // 删除打卡点
  const handleDeleteCheckpoint = (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这个打卡点吗？",
      onOk: () => {
        setCheckPoints(checkPoints.filter(point => point.id !== id));
        message.success("删除成功");
      },
    });
  };

  // 渲染打卡点管理表格
  const renderCheckpointsTable = () => (
    <Table
      dataSource={checkPoints}
      columns={[
        {
          title: "名称",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "纬度",
          dataIndex: "latitude",
          key: "latitude",
          render: (text: number) => text.toFixed(6),
        },
        {
          title: "经度",
          dataIndex: "longitude",
          key: "longitude",
          render: (text: number) => text.toFixed(6),
        },
        {
          title: "描述",
          dataIndex: "description",
          key: "description",
        },
        {
          title: "创建时间",
          dataIndex: "createdAt",
          key: "createdAt",
        },
        {
          title: "操作",
          key: "action",
          render: (_, record) => (
            <Space>
              <Button 
                size="small" 
                onClick={() => {
                  setSelectedCheckpoint(record);
                  setActiveTab("4");
                }}
              >
                打卡
              </Button>
              <Button 
                size="small" 
                danger 
                onClick={() => handleDeleteCheckpoint(record.id)}
              >
                删除
              </Button>
            </Space>
          ),
        },
      ]}
      rowKey="id"
      pagination={false}
    />
  );

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

  // 渲染统计图表（简化版）
  const renderStatistics = () => (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总打卡次数"
              value={statistics.totalCheckIns}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="成功率"
              value={statistics.successRate}
              precision={2}
              suffix="%"
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="平均距离"
              value={statistics.avgDistance}
              precision={1}
              suffix="米"
            />
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      <Card title="近7天打卡趋势">
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text type="secondary">此处应显示打卡趋势图表</Text>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card>
        <Title level={2}>
          <CheckCircleOutlined /> 打卡管理系统
        </Title>
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 打卡点上报 */}
          <TabPane
            tab={
              <span>
                <PlusOutlined />
                打卡点上报
              </span>
            }
            key="1"
          >
            <Card title="添加打卡点">
              <Form onFinish={handleAddCheckpoint} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="name"
                      label="打卡点名称"
                      rules={[{ required: true, message: "请输入打卡点名称" }]}
                    >
                      <Input placeholder="请输入打卡点名称" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="latitude"
                      label="纬度"
                      rules={[{ required: true, message: "请输入纬度" }]}
                    >
                      <Input type="number" step="0.000001" placeholder="请输入纬度" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="longitude"
                      label="经度"
                      rules={[{ required: true, message: "请输入经度" }]}
                    >
                      <Input type="number" step="0.000001" placeholder="请输入经度" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="description"
                      label="打卡点说明"
                      rules={[{ required: true, message: "请输入打卡点说明" }]}
                    >
                      <TextArea rows={2} placeholder="请输入打卡点说明" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="photo"
                      label="打卡点照片"
                    >
                      <Upload {...uploadProps}>
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>上传照片</div>
                        </div>
                      </Upload>
                    </Form.Item>
                  </Col>
                </Row>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    添加打卡点
                  </Button>
                </Form.Item>
              </Form>
            </Card>
            
            <Card title="打卡点列表" style={{ marginTop: 20 }}>
              {renderCheckpointsTable()}
            </Card>
          </TabPane>
          
          {/* 打卡规则配置 */}
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                打卡规则配置
              </span>
            }
            key="2"
          >
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
          </TabPane>
          
          {/* 打卡数据管理 */}
          <TabPane
            tab={
              <span>
                <HistoryOutlined />
                打卡数据管理
              </span>
            }
            key="3"
          >
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
          </TabPane>
          
          {/* 打卡功能 */}
          <TabPane
            tab={
              <span>
                <CheckCircleOutlined />
                打卡功能
              </span>
            }
            key="4"
          >
            <Card title="执行打卡">
              <Space direction="vertical" style={{ width: "100%" }}>
                <div>
                  <Text strong>当前打卡点：</Text>
                  {selectedCheckpoint ? (
                    <Tag icon={<EnvironmentOutlined />} color="blue">
                      {selectedCheckpoint.name}
                    </Tag>
                  ) : (
                    <Text type="secondary">请从打卡点列表中选择</Text>
                  )}
                </div>
                
                <div>
                  <Button 
                    type="primary" 
                    icon={<EnvironmentOutlined />} 
                    onClick={getCurrentLocation}
                    loading={locationLoading}
                  >
                    {locationLoading ? "定位中..." : "获取当前位置"}
                  </Button>
                  
                  {currentLocation && (
                    <div style={{ marginTop: 10 }}>
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="纬度">
                          {currentLocation.latitude.toFixed(6)}
                        </Descriptions.Item>
                        <Descriptions.Item label="经度">
                          {currentLocation.longitude.toFixed(6)}
                        </Descriptions.Item>
                        <Descriptions.Item label="精度">
                          {currentLocation.accuracy.toFixed(2)} 米
                        </Descriptions.Item>
                      </Descriptions>
                    </div>
                  )}
                </div>
                
                <div>
                  <Form.Item label="打卡备注">
                    <TextArea 
                      rows={3} 
                      placeholder="请输入打卡备注（可选）" 
                      value={remark}
                      onChange={e => setRemark(e.target.value)}
                    />
                  </Form.Item>
                </div>
                
                <div>
                  <Form.Item label="打卡照片">
                    <Upload {...uploadProps}>
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>上传照片</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </div>
                
                <div>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<CheckCircleOutlined />}
                    onClick={handleCheckIn}
                    loading={loading}
                    disabled={!currentLocation || !selectedCheckpoint}
                  >
                    执行打卡
                  </Button>
                </div>
              </Space>
            </Card>
          </TabPane>
          
          {/* 打卡统计分析 */}
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                打卡统计分析
              </span>
            }
            key="5"
          >
            {renderStatistics()}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default CheckInMainPage;
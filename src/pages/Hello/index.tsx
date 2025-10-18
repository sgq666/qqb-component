import React from "react";
import { Card, List, Typography, Space, Tag } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

interface RouteInfo {
  path: string;
  name: string;
  description?: string;
}

const routes: RouteInfo[] = [
  { path: "/ocr", name: "OCR识别", description: "识别图片文本并且提取" },
  { path: "/photoInfo", name: "照片信息提取与水印添加", description: "获取照片的拍摄时间，位置(经纬度)，拍照设备等信息，并且在图片上打上水印" },
  { path: "/deptCode", name: "部门代码处理", description: "Excel部门代码映射和处理工具" },
  { path: "/userDept", name: "mysql插入语句可视化生成", description: "根据JSON或者excel数据可视化生成mysql的insert语句" },
  { path: "/fgExcel", name: "FG Excel工具", description: "给峰哥开发Excel报表导出工具" },
  { path: "/component/hyb", name: "附件审批", description: "HyB附件审批" },
  { path: "/hyb", name: "附件审批", description: "HyB附件审批" },
  { path: "/fulltext", name: "富文本展示", description: "可以编辑和展示富文本信息" },
  { path: "/notice", name: "检测任务", description: "检测任务下发，并且发出提示" },
];

const Hello: React.FC = () => {
  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "32px" }}>
        欢迎使用系统工具集
      </Title>
      
      <Card style={{ marginBottom: "24px" }}>
        <Text>
          这是一个集成了多种实用工具的系统，您可以根据需要选择相应的功能模块。
          以下是可以访问的功能页面：
        </Text>
      </Card>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={routes}
        renderItem={(route) => (
          <List.Item>
            <Card 
              hoverable 
              style={{ width: "100%" }}
              onClick={() => (window.location.hash = `#${route.path}`)}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Title level={4} style={{ margin: 0 }}>
                    <Link to={route.path} style={{ textDecoration: "none", color: "inherit" }}>
                      {route.name}
                    </Link>
                  </Title>
                  <Tag color="blue">路径: {route.path}</Tag>
                </div>
                {route.description && (
                  <Text type="secondary">{route.description}</Text>
                )}
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  点击访问 <Link to={route.path}>{route.path}</Link>
                </Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />
      
      <Card size="small" style={{ marginTop: "24px", textAlign: "center" }}>
        <Text type="secondary">
          选择上方任意功能模块开始使用
        </Text>
      </Card>
    </div>
  );
};

export default Hello;
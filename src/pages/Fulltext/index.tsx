// src/pages/Fulltext/index.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Button,
  Card,
  Space,
  Typography,
  Tabs,
  message,
  Input,
  Spin,
  List,
} from "antd";
import {
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { IDomEditor } from "@wangeditor/editor";
import EditorComponent from "./EditorComponent";
import thirdservice from "../../services/thirdService";
import { ApiResponse } from "../../types";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

// 模拟后端数据接口
interface RichTextData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const Fulltext: React.FC = () => {
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [isEditMode, setIsEditMode] = useState<boolean>(true); // true表示编辑模式，false表示查看模式
  const [richTextList, setRichTextList] = useState<RichTextData[]>([]); // 富文本列表
  const [selectedRichText, setSelectedRichText] = useState<RichTextData | null>(
    null
  );
  const [editorKey, setEditorKey] = useState<number>(0); // 用于强制重新渲染编辑器组件

  // 获取URL参数
  const searchParams = useMemo(() => {
    if (window.location.search) {
      return new URLSearchParams(window.location.search);
    }

    const hash = window.location.hash;
    const queryIndex = hash.indexOf("?");
    if (queryIndex !== -1) {
      const queryString = hash.substring(queryIndex + 1);
      return new URLSearchParams(queryString);
    }

    return new URLSearchParams();
  }, []);

  const model = searchParams.get("model") || "edit"; // 默认edit模式
  const id = searchParams.get("id") || "";

  // 编辑器内容变化回调
  const handleEditorChange = useCallback((html: string) => {
    setContent(html);
  }, []);

  // 编辑器创建回调
  const handleEditorCreated = useCallback((editor: IDomEditor) => {
    setEditor(editor);
  }, []);

  // 重置编辑器 - 使用key强制重新渲染
  const resetEditor = useCallback(() => {
    // 清理编辑器实例
    if (editor) {
      try {
        editor.destroy();
      } catch (e) {
        console.log("Editor destroy error:", e);
      }
    }
    setEditor(null);
    // 递增editorKey强制重新创建组件
    setEditorKey((prev) => prev + 1);
  }, [editor]);

  // 根据model参数设置编辑模式
  useEffect(() => {
    setIsEditMode(model === "edit");
    if (model === "edit") {
      fetchAllRichTextConfigs();
    } else if (id) {
      fetchRichTextData(id);
    }
  }, [model, id]);

  // 组件销毁时销毁编辑器
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    return () => {
      if (editor == null) return;
      try {
        editor.destroy();
      } catch (e) {
        console.log("Editor destroy error:", e);
      }
      setEditor(null);
    };
  }, []);

  // 获取富文本数据 (view模式)
  const fetchRichTextData = async (id: string) => {
    setDataLoading(true);
    try {
      // 模拟API调用
      console.log("请求参数：", { id });
      const fulltextRes: ApiResponse<RichTextData> =
        await thirdservice.getFulltextById({ id });
      const date = fulltextRes.data;

      // 模拟数据
      setTimeout(() => {
        // const mockData: RichTextData = {
        //   id: id,
        //   title: "查看模式示例文章标题",
        //   content:
        //     "<p>这是查看模式下的示例内容，包含<strong>粗体</strong>和<em>斜体</em>文本。</p><p>还支持<ul><li>无序列表</li><li>多个列表项</li></ul></p>",
        //   createdAt: new Date().toISOString(),
        //   updatedAt: new Date().toISOString(),
        // };

        setTitle(date.title);
        setContent(date.content);
        // setTitle(mockData.title);
        // setContent(mockData.content);
        setDataLoading(false);
      }, 500);
    } catch (error) {
      console.error("获取数据失败:", error);
      message.error("获取数据失败");
      setDataLoading(false);
    }
  };

  // 获取所有配置好的富文本内容（edit模式）
  const fetchAllRichTextConfigs = async () => {
    setDataLoading(true);
    try {
      // 模拟API调用
      console.log("请求所有富文本配置");

      const fulltextResult: ApiResponse<RichTextData[]> =
        await thirdservice.getFulltextList();

      // 模拟数据
      setTimeout(() => {
        // const mockList: RichTextData[] = [
        //   {
        //     id: "1",
        //     title: "欢迎使用富文本编辑器",
        //     content:
        //       "<p>这是查看模式下的示例内容，包含<strong>粗体</strong>和<em>斜体</em>文本。</p><p>还支持<ul><li>无序列表</li><li>多个列表项</li></ul></p>",
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //   },
        //   {
        //     id: "2",
        //     title: "如何使用富文本编辑器",
        //     content: "<p>这是一篇使用教程</p>",
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //   },
        //   {
        //     id: "3",
        //     title: "富文本编辑器功能介绍",
        //     content: "<p>介绍编辑器的各种功能</p>",
        //     createdAt: new Date().toISOString(),
        //     updatedAt: new Date().toISOString(),
        //   },
        // ];

        setRichTextList(fulltextResult.data);
        // setRichTextList(mockList);
        setDataLoading(false);
      }, 500);
    } catch (error) {
      console.error("获取配置失败:", error);
      message.error("获取配置失败");
      setDataLoading(false);
    }
  };

  // 选择富文本进行编辑
  const selectRichText = (item: RichTextData) => {
    setSelectedRichText(item);
    setTitle(item.title);
    setContent(item.content);
    setActiveTab("edit");
    resetEditor(); // 重置编辑器
  };

  // 新建富文本
  const createNewRichText = () => {
    setSelectedRichText(null);
    setTitle("");
    setContent("");
    setActiveTab("edit");
    resetEditor(); // 重置编辑器
  };

  // 保存内容
  const saveContent = async () => {
    if (!title.trim()) {
      message.warning("请输入标题");
      return;
    }

    if (!content.trim()) {
      message.warning("请输入内容");
      return;
    }

    setLoading(true);

    try {
      const saveData: RichTextData = {
        id: selectedRichText?.id || Date.now().toString(),
        title,
        content,
        createdAt: selectedRichText?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (selectedRichText) {
        // 更新操作
        console.log("更新请求参数：", saveData);
        thirdservice.updateFulltext(saveData);
      } else {
        // 新增操作
        console.log("新增请求参数：", saveData);
        saveData.id = "";
        thirdservice.addFulltext(saveData);
      }

      setTimeout(() => {
        setLoading(false);
        message.success(selectedRichText ? "内容更新成功" : "内容保存成功");

        // 更新列表
        if (selectedRichText) {
          setRichTextList((prev) =>
            prev.map((item) =>
              item.id === selectedRichText.id ? { ...saveData } : item
            )
          );
        } else {
          setRichTextList((prev) => [...prev, saveData]);
        }
        setSelectedRichText(saveData);
      }, 500);
    } catch (error) {
      console.error("保存失败:", error);
      message.error("保存失败");
      setLoading(false);
    }
  };

  // 处理标签页切换
  const handleTabChange = useCallback(
    (key: string) => {
      if (key === "edit" && activeTab !== "edit") {
        // 切换到编辑模式时重置编辑器
        resetEditor();
      }
      setActiveTab(key);
    },
    [activeTab, resetEditor]
  );

  return (
    <div style={{ padding: model === "view" ? "0" : "20px" }}>
      {model !== "view" && <Title level={2}>富文本编辑器</Title>}

      {model === "view" ? (
        // view模式：只显示内容
        dataLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>加载中...</div>
          </div>
        ) : (
          <div>
            {title && <Title level={3}>{title}</Title>}
            {content ? (
              <div dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#999",
                  padding: "40px",
                }}
              >
                暂无内容
              </div>
            )}
          </div>
        )
      ) : (
        <Card>
          {dataLoading ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>加载中...</div>
            </div>
          ) : isEditMode ? (
            // 编辑模式
            <>
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                tabBarExtraContent={
                  <Space>
                    {activeTab === "list" && (
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={createNewRichText}
                      >
                        新建富文本
                      </Button>
                    )}
                    {activeTab === "edit" && (
                      <>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={saveContent}
                          loading={loading}
                        >
                          保存内容
                        </Button>
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => setActiveTab("preview")}
                        >
                          预览模式
                        </Button>
                      </>
                    )}
                    {activeTab === "preview" && (
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => setActiveTab("edit")}
                      >
                        编辑模式
                      </Button>
                    )}
                  </Space>
                }
              >
                <TabPane tab="富文本列表" key="list">
                  <List
                    itemLayout="horizontal"
                    dataSource={richTextList}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <button
                            type="button"
                            key="edit"
                            onClick={() => selectRichText(item)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#1890ff",
                              cursor: "pointer",
                              textDecoration: "underline",
                              padding: 0,
                            }}
                          >
                            编辑
                          </button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <button
                              type="button"
                              onClick={() => selectRichText(item)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#1890ff",
                                cursor: "pointer",
                                textDecoration: "underline",
                                padding: 0,
                                textAlign: "left",
                                fontSize: "16px",
                              }}
                            >
                              {item.title}
                            </button>
                          }
                          description={
                            <div>
                              <Text type="secondary">富文本id: {item.id}</Text>
                              <br />
                              <Text type="secondary">
                                创建时间:{" "}
                                {new Date(item.createdAt).toLocaleString()}
                              </Text>
                              <br />
                              <Text type="secondary">
                                更新时间:{" "}
                                {new Date(item.updatedAt).toLocaleString()}
                              </Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                  {richTextList.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#999",
                        padding: "40px",
                      }}
                    >
                      暂无富文本内容
                    </div>
                  )}
                </TabPane>

                <TabPane tab="编辑模式" key="edit">
                  <Input
                    placeholder="请输入文章标题"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ marginBottom: 16 }}
                    size="large"
                  />
                  <EditorComponent
                    key={editorKey}
                    value={content}
                    onChange={handleEditorChange}
                    onEditorCreated={handleEditorCreated}
                  />
                </TabPane>

                <TabPane tab="预览模式" key="preview">
                  <div
                    style={{
                      minHeight: 500,
                      padding: "16px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "4px",
                    }}
                  >
                    {title && <Title level={3}>{title}</Title>}
                    {content ? (
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          color: "#999",
                          padding: "40px",
                        }}
                      >
                        暂无内容
                      </div>
                    )}
                  </div>
                </TabPane>
              </Tabs>
            </>
          ) : (
            // 查看模式
            <Tabs activeKey="preview">
              <TabPane tab="内容预览" key="preview">
                <div
                  style={{
                    minHeight: 500,
                    padding: "16px",
                    border: "1px solid #f0f0f0",
                    borderRadius: "4px",
                  }}
                >
                  {title && <Title level={3}>{title}</Title>}
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#999",
                        padding: "40px",
                      }}
                    >
                      暂无内容
                    </div>
                  )}
                </div>
              </TabPane>
            </Tabs>
          )}
        </Card>
      )}
    </div>
  );
};

export default Fulltext;

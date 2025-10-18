import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/editor";
import "@wangeditor/editor/dist/css/style.css";

interface EditorComponentProps {
  value: string;
  onChange: (html: string) => void;
  onEditorCreated?: (editor: IDomEditor) => void;
}

const EditorComponent: React.FC<EditorComponentProps> = ({
  value,
  onChange,
  onEditorCreated,
}) => {
  const [editor, setEditor] = useState<IDomEditor | null>(null);

  // 编辑器配置
  const toolbarConfig: Partial<IToolbarConfig> = useMemo(
    () => ({
      // 工具栏配置
    }),
    []
  );

  const editorConfig: Partial<IEditorConfig> = useMemo(
    () => ({
      placeholder: "请输入内容...",
      MENU_CONF: {
        uploadImage: {
          // 使用自定义上传
          customUpload(file: File, insertFn: Function) {
            // 自定义上传逻辑
            const formData = new FormData();
            formData.append("file", file);

            fetch("/api/upload/image", {
              method: "POST",
              body: formData,
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              },
            })
              .then((response) => response.json())
              .then((result) => {
                if (result.url) {
                  // 插入图片到编辑器
                  insertFn(result.url, result.alt || "", result.href || "");
                } else {
                  console.error("上传失败", result);
                }
              })
              .catch((error) => {
                console.error("上传错误", error);
              });
          },
        },
      },
    }),
    []
  );

  // 编辑器创建回调
  const handleCreated = useCallback(
    (editor: IDomEditor) => {
      setEditor(editor);
      onEditorCreated?.(editor);
    },
    [onEditorCreated]
  );

  // 编辑器内容变化回调
  const handleChange = useCallback(
    (editor: IDomEditor) => {
      onChange(editor.getHtml());
    },
    [onChange]
  );

  // 组件销毁时销毁编辑器
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
  }, [editor]);

  return (
    <div style={{ border: "1px solid #ccc", zIndex: 100 }}>
      <Toolbar
        editor={editor}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: "1px solid #ccc" }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={value}
        onCreated={handleCreated}
        onChange={handleChange}
        mode="default"
        style={{ height: "500px", overflowY: "hidden" }}
      />
    </div>
  );
};

export default EditorComponent;

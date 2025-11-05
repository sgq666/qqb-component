# 实用工具集使用说明

## 功能介绍

实用工具集包含两个常用工具：

1. **Base64图片显示**：将Base64编码的图片数据转换为可视图片
2. **XML转JSON**：将XML格式的文本转换为JSON格式

## Base64图片显示

### 功能说明
此工具可以将Base64编码的图片数据显示为可视图片，支持以下格式：
- 完整的Base64图片数据（包含data:image/前缀）
- 纯Base64数据（不包含前缀，默认按PNG格式处理）

### 使用方法
1. 在文本框中输入Base64图片数据
2. 点击"显示图片"按钮
3. 图片将在下方预览区域显示

### 支持的格式示例
```
# 完整格式
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==

# 纯Base64数据
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==
```

### 文件上传
支持上传.txt或.base64格式的文件，文件内容应为Base64图片数据。

## XML转JSON

### 功能说明
此工具可以将XML格式的文本转换为JSON格式，支持：
- XML元素节点转换
- XML属性转换（以@开头）
- 文本内容转换（以#text表示）
- 重复元素自动转为数组

### 使用方法
1. 在文本框中输入XML文本
2. 点击"转换为JSON"按钮
3. 转换结果将在下方显示

### 转换示例
输入XML：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <person id="1">
    <name>张三</name>
    <age>25</age>
  </person>
  <person id="2">
    <name>李四</name>
    <age>30</age>
  </person>
</root>
```

输出JSON：
```json
{
  "person": [
    {
      "@id": "1",
      "name": "张三",
      "age": "25"
    },
    {
      "@id": "2",
      "name": "李四",
      "age": "30"
    }
  ]
}
```

### 文件上传
支持上传.xml或.txt格式的文件，文件内容应为XML文本。

## 注意事项

1. Base64图片显示功能仅支持有效的Base64图片数据
2. XML转JSON功能要求输入的XML格式正确
3. 转换结果可能因XML结构复杂性而有所不同
4. 大文件处理可能需要一些时间，请耐心等待
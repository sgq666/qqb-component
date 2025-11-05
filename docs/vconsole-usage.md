# vConsole 调试功能使用说明

## 功能介绍

本项目集成了 vConsole 移动端调试工具，可以在 H5 页面中方便地进行调试。该功能通过环境变量控制，只在需要时显示调试按钮。

## 如何启用 vConsole

1. 打开项目根目录下的 `.env` 文件
2. 找到 `REACT_APP_ENABLE_VCONSOLE` 配置项
3. 将其值设置为 `1`：
   ```
   REACT_APP_ENABLE_VCONSOLE=1
   ```
4. 重启开发服务器（`npm start`）

## 如何禁用 vConsole

1. 打开项目根目录下的 `.env` 文件
2. 找到 `REACT_APP_ENABLE_VCONSOLE` 配置项
3. 将其值设置为 `0` 或注释掉该行：
   ```
   REACT_APP_ENABLE_VCONSOLE=0
   ```
   或
   ```
   # REACT_APP_ENABLE_VCONSOLE=1
   ```
4. 重启开发服务器（`npm start`）

## 使用方法

当 vConsole 启用后，页面右下角会出现一个"打开调试面板"的按钮。点击该按钮即可打开 vConsole 调试面板，可以查看 console 日志、网络请求、页面元素等信息。

## 注意事项

1. 该功能仅在开发环境使用，生产环境不会包含 vConsole 相关代码
2. 为了保证应用性能，建议在不需要调试时禁用该功能
3. vConsole 面板可以通过再次点击按钮或刷新页面来关闭
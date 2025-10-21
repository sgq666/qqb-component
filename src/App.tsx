import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import "antd/dist/antd.css";
import Test1 from "./pages/Test1";
import Ocr from "./pages/Ocr";
import PhotoInfo from "./pages/PhotoInfo";
import DeptCode from "./pages/DeptCode";
import UserDept from "./pages/UserDept";
import FgExcel from "./pages/fgExcel";
import Hello from "./pages/Hello";
import Fulltext from "./pages/Fulltext";
import Notice from "./pages/Notice";
import NoticeNew from "./pages/NoticeNew";
import TestDecrypt from "./pages/TestDecrypt/indext"; // 添加解密测试页面
import { message, notification } from "antd";

// 配置 message 和 notification 的默认配置
message.config({
  top: 100,
  duration: 3,
});

notification.config({
  placement: "topRight",
  top: 70,
  duration: 3,
});

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Switch>
          <Route exact path="/" component={Hello} />
          <Route exact path="/component/hyb" component={Test1} />
          <Route exact path="/hyb" component={Test1} />
          <Route exact path="/ocr" component={Ocr} />
          <Route exact path="/photoInfo" component={PhotoInfo} />
          <Route exact path="/deptCode" component={DeptCode} />
          <Route exact path="/userDept" component={UserDept} />
          <Route exact path="/fgExcel" component={FgExcel} />
          <Route exact path="/fulltext" component={Fulltext} />
          <Route exact path="/notice" component={Notice} />
          <Route exact path="/testDecrypt" component={TestDecrypt} /> {/* 添加解密测试路由 */}
          <Route exact path="/noticeNew" component={NoticeNew} />
        </Switch>
      </Router>
    </ConfigProvider>
  );
}

export default App;
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import "antd/dist/antd.css";
import Test1 from "./pages/Test1";
import ExcelTemplateGenerator from "./pages/StatReport/ExcelTemplateGenerator"; // 添加Excel模板生成器页面
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
import Ldrk from "./pages/Ldrk/index"; // 添加流动人口Excel读取页面
import ApiTester from "./pages/ApiTester"; // 添加API测试页面
import DataMatcher from "./pages/DataMatcher"; // 添加数据匹配页面
import Tools from "./pages/Tools"; // 添加实用工具页面
import Geolocation from "./pages/Geolocation"; // 添加地理定位页面
import OfflineMap from "./pages/OfflineMap"; // 添加离线地图页面
import JsonProcessor from "./pages/JsonProcessor"; // 添加JSON处理器页面
import JsonToExcelConverter from "./pages/JsonToExcelConverter"; // 添加JSON转Excel粘贴文本页面
import CheckIn from "./pages/CheckIn"; // 添加打卡签到页面
import CheckInMain from "./pages/CheckIn/CheckInMain"; // 添加打卡管理系统页面
import CheckPointReporting from "./pages/CheckIn/CheckPointReporting";
import TaskRelationManager from "./pages/TaskRelation/TaskRelationManager";
import WorkLogPage from "./pages/WorkLog";
import FormReplacePage from "./pages/FormReplace";
import VConsoleButton from "./components/VConsoleButton"; // 导入 vConsole 控制组件
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
      {/* 添加 vConsole 控制按钮 */}
      <VConsoleButton />
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
          <Route exact path="/ldrk" component={Ldrk} /> {/* 添加流动人口Excel读取路由 */}
          <Route exact path="/api-tester" component={ApiTester} /> {/* 添加API测试路由 */}
          <Route exact path="/data-matcher" component={DataMatcher} /> {/* 添加数据匹配路由 */}
          <Route exact path="/tools" component={Tools} /> {/* 添加实用工具路由 */}
          <Route exact path="/geolocation" component={Geolocation} /> {/* 添加地理定位路由 */}
          <Route exact path="/offline-map" component={OfflineMap} /> {/* 添加离线地图路由 */}
          <Route exact path="/json-processor" component={JsonProcessor} /> {/* 添加JSON处理器路由 */}
          <Route exact path="/json-to-excel" component={JsonToExcelConverter} /> {/* 添加JSON转Excel粘贴文本路由 */}
          <Route exact path="/excel-stat" component={ExcelTemplateGenerator} /> {/* 添加Excel模板生成器路由 */}
          <Route exact path="/check-in" component={CheckIn} /> {/* 添加打卡签到路由 */}
          <Route exact path="/check-in-main" component={CheckInMain} /> {/* 添加打卡管理系统路由 */}
          <Route exact path="/check-point-reporting" component={CheckPointReporting} />
          <Route exact path="/task-relation" component={TaskRelationManager} />
          <Route exact path="/work-log" component={WorkLogPage} />
          <Route exact path="/form-replace" component={FormReplacePage} />
        </Switch>
      </Router>
    </ConfigProvider>
  );
}

export default App;
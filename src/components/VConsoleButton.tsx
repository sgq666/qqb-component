import React, { useEffect, useRef } from 'react';
import { Button } from 'antd';

const VConsoleButton: React.FC = () => {
  const vConsoleRef = useRef<any>(null);

  useEffect(() => {
    // 检查环境变量是否启用了 vConsole
    const enableVConsole = process.env.REACT_APP_ENABLE_VCONSOLE === '1';
    
    if (enableVConsole) {
      // 动态导入 vconsole 以减少初始包大小
      import('vconsole').then((VConsole) => {
        vConsoleRef.current = new VConsole.default();
      });
    }

    // 组件卸载时销毁 vConsole
    return () => {
      if (vConsoleRef.current) {
        vConsoleRef.current.destroy();
        vConsoleRef.current = null;
      }
    };
  }, []);

  const toggleVConsole = () => {
    if (vConsoleRef.current) {
      vConsoleRef.current.show();
    }
  };

  // 如果没有启用 vConsole，则不渲染任何内容
  if (process.env.REACT_APP_ENABLE_VCONSOLE !== '1') {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}>
      <Button type="primary" onClick={toggleVConsole}>
        打开调试面板
      </Button>
    </div>
  );
};

export default VConsoleButton;
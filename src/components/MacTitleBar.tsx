import React from 'react';
import {
  Sun,
  Moon,
  Settings as SettingsIcon,
  Minus,
  Square,
  X
} from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface MacTitleBarProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onSettingsClick: () => void;
  showSettings?: boolean;
}

const MacTitleBar: React.FC<MacTitleBarProps> = ({
  theme,
  onThemeToggle,
  onSettingsClick,
  showSettings = true
}) => {
  const handleWindowControl = async (action: 'minimize' | 'maximize' | 'close') => {
    try {
      const window = getCurrentWindow();
      switch (action) {
        case 'minimize':
          await window.minimize();
          break;
        case 'maximize':
          const isMaximized = await window.isMaximized();
          if (isMaximized) {
            await window.unmaximize();
          } else {
            await window.maximize();
          }
          break;
        case 'close':
          await window.close();
          break;
      }
    } catch (error) {
      console.error(`Window action ${action} failed:`, error);
    }
  };

  return (
    <div className="mac-titlebar" data-tauri-drag-region>
      {/* 左侧控制按钮区域 */}
      <div className="titlebar-left">
        {/* macOS 窗口控制按钮 */}
        <div className="traffic-lights">
          <button
            className="traffic-light traffic-light-close"
            onClick={() => handleWindowControl('close')}
            title="关闭"
          >
            <X size={12} />
          </button>
          <button
            className="traffic-light traffic-light-minimize"
            onClick={() => handleWindowControl('minimize')}
            title="最小化"
          >
            <Minus size={12} />
          </button>
          <button
            className="traffic-light traffic-light-maximize"
            onClick={() => handleWindowControl('maximize')}
            title="最大化"
          >
            <Square size={10} />
          </button>
        </div>
      </div>

      {/* 中间拖拽区域 */}
      <div className="titlebar-center" data-tauri-drag-region>
        <span className="titlebar-title" data-tauri-drag-region>
          AI Tools Manager
        </span>
      </div>

      {/* 右侧控制按钮区域 */}
      <div className="titlebar-right">
        {/* 系统设置按钮 - 仅在首页显示 */}
        {showSettings && (
          <button
            className="titlebar-button titlebar-settings"
            onClick={onSettingsClick}
            title="系统设置"
          >
            <SettingsIcon size={14} />
          </button>
        )}

        {/* 主题切换按钮 */}
        <button
          className="titlebar-button titlebar-theme"
          onClick={onThemeToggle}
          title={theme === 'light' ? '切换到深色主题' : '切换到浅色主题'}
        >
          {theme === 'light' ? (
            <Moon size={14} />
          ) : (
            <Sun size={14} />
          )}
        </button>
      </div>
    </div>
  );
};

export default MacTitleBar;
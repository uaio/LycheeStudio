import React from 'react';
import {
  Minus,
  Square,
  X,
  Sun,
  Moon,
  Settings as SettingsIcon
} from 'lucide-react';

interface TitleBarProps {
  title: string;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onSettingsClick: () => void;
  showSettings?: boolean;
}

const TitleBar: React.FC<TitleBarProps> = ({
  title,
  theme,
  onThemeToggle,
  onSettingsClick,
  showSettings = true
}) => {
  const handleWindowControl = (action: 'minimize' | 'maximize' | 'close') => {
    // 这里会调用 Tauri API 来控制窗口
    // TODO: 实现窗口控制功能
  };

  return (
    <div className="titlebar">
      <div className="titlebar-content">
        <div className="titlebar-drag-area">
          <span className="titlebar-title">{title}</span>
        </div>

        <div className="titlebar-controls">
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

          {/* 系统配置按钮 - 仅在首页显示 */}
          {showSettings && (
            <button
              className="titlebar-button titlebar-settings"
              onClick={onSettingsClick}
              title="系统设置"
            >
              <SettingsIcon size={14} />
            </button>
          )}

          {/* 窗口控制按钮 */}
          <button
            className="titlebar-button titlebar-minimize"
            onClick={() => handleWindowControl('minimize')}
            title="最小化"
          >
            <Minus size={14} />
          </button>

          <button
            className="titlebar-button titlebar-maximize"
            onClick={() => handleWindowControl('maximize')}
            title="最大化"
          >
            <Square size={14} />
          </button>

          <button
            className="titlebar-button titlebar-close"
            onClick={() => handleWindowControl('close')}
            title="关闭"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
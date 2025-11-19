import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Settings,
  Minus,
  Square,
  X
} from 'lucide-react';
import { Button, Tooltip } from 'antd';

interface ElectronTitleBarProps {
  selectedTool: string | null;
  onNavigateSettings: () => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  currentTheme: 'light' | 'dark' | 'system';
}

const ElectronTitleBar: React.FC<ElectronTitleBarProps> = ({
  selectedTool,
  onNavigateSettings,
  onThemeChange,
  currentTheme
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  // 根据currentTheme计算isDarkMode状态
  const isDarkMode = currentTheme === 'dark' ||
    (currentTheme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // 窗口控制处理
  const handleWindowControl = async (action: 'minimize' | 'maximize' | 'close') => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.windowControl(action);

        // 如果是最大化操作，更新状态
        if (action === 'maximize') {
          setIsMaximized(!isMaximized);
        }
      }
    } catch (error) {
      console.error('Window control error:', error);
    }
  };

  // 主题切换处理 - 直接点击循环切换
  const handleThemeToggle = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' :
                      currentTheme === 'dark' ? 'system' : 'light';
    onThemeChange(nextTheme);
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return <Sun size={14} />;
      case 'dark':
        return <Moon size={14} />;
      case 'system':
        return <Monitor size={14} />;
      default:
        return <Sun size={14} />;
    }
  };

  const getThemeLabel = () => {
    switch (currentTheme) {
      case 'light':
        return '浅色';
      case 'dark':
        return '深色';
      case 'system':
        return '跟随系统';
      default:
        return '浅色';
    }
  };

  // macOS 样式：左侧控制按钮
  const isMac = typeof window !== 'undefined' &&
    (window.electronAPI?.platform === 'darwin' ||
     window.electronAPI?.getPlatform?.() === 'darwin');

  const baseStyle: React.CSSProperties = {
    height: '38px',
    background: isDarkMode
      ? '#1f1f1f'
      : 'rgba(255, 255, 255, 0.95)',
    borderBottom: isDarkMode
      ? '1px solid rgba(255, 255, 255, 0.06)'
      : '1px solid rgba(0, 0, 0, 0.08)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    WebkitUserSelect: 'none' as any,
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    fontSize: '13px'
  };

  if (isMac) {
    return (
      <div style={baseStyle} className="electron-titlebar">
        {/* 左侧：工具名称显示 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '100%',
            paddingLeft: '75px' // 为原生红绿灯留出空间
          }}
        >
          {/* 工具名称显示 */}
          {selectedTool && (
            <span style={{
              fontSize: '13px',
              color: isDarkMode ? '#fff' : '#333',
              fontWeight: '500',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: '200px'
            }}>
              {selectedTool}
            </span>
          )}
        </div>

        {/* 中间：拖拽区域 */}
        <div
          style={{
            flex: 1,
            height: '100%',
            cursor: 'move'
          }}
        />

        {/* 右侧工具按钮 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '100%',
            paddingRight: '16px'
          }}
        >
          {/* 主题切换按钮 - 直接点击 */}
          <Button
            type="text"
            icon={getThemeIcon()}
            size="small"
            onClick={handleThemeToggle}
            className="theme-toggle-button"
            style={{
              color: isDarkMode ? '#fff' : undefined,
            }}
            title={`主题: ${getThemeLabel()} (点击切换)`}
          />

          {/* 设置按钮 */}
          <Button
            type="text"
            icon={<Settings size={14} />}
            size="small"
            onClick={onNavigateSettings}
            className="titlebar-settings-button"
            style={{
              color: isDarkMode ? '#fff' : undefined,
            }}
            title="设置"
          />
        </div>
      </div>
    );
  }

  // Windows/Linux 样式
  return (
    <div style={baseStyle} className="electron-titlebar">
      {/* 左侧：拖拽区域和工具名称 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          height: '100%',
          flex: 1,
          paddingLeft: '16px'
        }}
      >
        {/* 工具名称显示 */}
        {selectedTool && (
          <span style={{
            fontSize: '13px',
            color: isDarkMode ? '#fff' : '#333',
            fontWeight: '500',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            maxWidth: '200px'
          }}>
            {selectedTool}
          </span>
        )}
      </div>

      {/* 窗口控制按钮 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%'
        }}
        className="window-controls"
      >
        <Tooltip title="最小化">
          <Button
            type="text"
            icon={<Minus size={14} />}
            size="small"
            onClick={() => handleWindowControl('minimize')}
            className="window-control-minimize"
            style={{
              borderRadius: 0,
            }}
          />
        </Tooltip>
        <Tooltip title={isMaximized ? "还原" : "最大化"}>
          <Button
            type="text"
            icon={<Square size={14} />}
            size="small"
            onClick={() => handleWindowControl('maximize')}
            className="window-control-maximize"
            style={{
              borderRadius: 0,
            }}
          />
        </Tooltip>
        <Tooltip title="关闭">
          <Button
            type="text"
            icon={<X size={14} />}
            size="small"
            onClick={() => handleWindowControl('close')}
            className="window-control-close"
            style={{
              borderRadius: 0,
            }}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default ElectronTitleBar;
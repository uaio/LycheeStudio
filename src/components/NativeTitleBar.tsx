import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import {
  Home,
  Sun,
  Moon,
  Monitor,
  Settings
} from 'lucide-react';

interface NativeTitleBarProps {
  currentView: 'home' | 'config';
  selectedTool: string | null;
  onNavigateHome: () => void;
  onNavigateSettings: () => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  currentTheme: 'light' | 'dark' | 'system';
}

const NativeTitleBar: React.FC<NativeTitleBarProps> = ({
  currentView,
  selectedTool,
  onNavigateHome,
  onNavigateSettings,
  onThemeChange,
  currentTheme
}) => {
  const handleWindowControl = async (action: 'close' | 'minimize' | 'maximize') => {
    try {
      const window = getCurrentWindow();
      switch (action) {
        case 'close':
          await window.close();
          break;
        case 'minimize':
          await window.minimize();
          break;
        case 'maximize':
          if (await window.isMaximized()) {
            await window.unmaximize();
          } else {
            await window.maximize();
          }
          break;
      }
    } catch (error) {
      console.error('Window control error:', error);
    }
  };

  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light':
        return <Sun size={12} />;
      case 'dark':
        return <Moon size={12} />;
      case 'system':
        return <Monitor size={12} />;
      default:
        return <Sun size={12} />;
    }
  };

  return (
    <div
      className="native-titlebar"
      style={{
        height: '40px',
        background: 'rgba(0, 0, 0, 0)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
    >
      {/* 左侧：拖拽区域和导航按钮 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          height: '100%',
          flex: 1,
          padding: '0 16px'
        }}
        data-tauri-drag-region
      >
        {/* macOS 窗口控制按钮 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginRight: '12px'
          }}
        >
          <button
            onClick={() => handleWindowControl('close')}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#ff5f57',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              WebkitAppRegion: 'no-drag' as any
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
            title="关闭"
          />
          <button
            onClick={() => handleWindowControl('minimize')}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#ffbd2e',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              WebkitAppRegion: 'no-drag' as any
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
            title="最小化"
          />
          <button
            onClick={() => handleWindowControl('maximize')}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#28ca42',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              WebkitAppRegion: 'no-drag' as any
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
            title="最大化"
          />
        </div>

        {/* 拖拽区域 */}
        <div
          style={{
            flex: 1,
            height: '100%',
            cursor: 'move'
          }}
          data-tauri-drag-region
        />

        {/* 首页按钮 */}
        <button
          onClick={onNavigateHome}
          className="titlebar-nav-button"
          style={{
            background: currentView === 'home'
              ? 'rgba(59, 130, 246, 0.1)'
              : 'rgba(0, 0, 0, 0)',
            border: currentView === 'home'
              ? '1px solid rgba(59, 130, 246, 0.2)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: '500',
            color: currentView === 'home' ? '#3b82f6' : '#666',
            transition: 'all 0.15s ease',
            WebkitAppRegion: 'no-drag' as any,
            minHeight: '24px'
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'home') {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'home') {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0)';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            }
          }}
          title="首页"
        >
          <Home size={12} />
          <span>首页</span>
        </button>

        {/* 工具名称显示 */}
        {selectedTool && (
          <span style={{
            fontSize: '13px',
            color: '#333',
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

      {/* 右侧工具按钮 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '100%',
          padding: '0 16px'
        }}
      >
        {/* 主题切换按钮 */}
        <button
          onClick={cycleTheme}
          className="titlebar-tool-button"
          style={{
            background: 'rgba(0, 0, 0, 0)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#666',
            transition: 'all 0.15s ease',
            WebkitAppRegion: 'no-drag' as any,
            minHeight: '24px',
            width: '24px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0)';
            e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
          }}
          title={`当前主题: ${currentTheme}`}
        >
          {getThemeIcon()}
        </button>

        {/* 设置按钮 */}
        <button
          onClick={onNavigateSettings}
          className="titlebar-tool-button"
          style={{
            background: currentView === 'config'
              ? 'rgba(59, 130, 246, 0.1)'
              : 'rgba(0, 0, 0, 0)',
            border: currentView === 'config'
              ? '1px solid rgba(59, 130, 246, 0.2)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: currentView === 'config' ? '#3b82f6' : '#666',
            transition: 'all 0.15s ease',
            WebkitAppRegion: 'no-drag' as any,
            minHeight: '24px',
            width: '24px'
          }}
          onMouseEnter={(e) => {
            if (currentView !== 'config') {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentView !== 'config') {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0)';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
            }
          }}
          title="设置"
        >
          <Settings size={12} />
        </button>
      </div>
    </div>
  );
};

export default NativeTitleBar;
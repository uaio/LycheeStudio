import React from 'react';
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
  const cycleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex]);
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

  const getThemeTitle = () => {
    switch (currentTheme) {
      case 'light':
        return '浅色主题';
      case 'dark':
        return '深色主题';
      case 'system':
        return '跟随系统';
      default:
        return '浅色主题';
    }
  };

  const getCurrentPageTitle = () => {
    if (currentView === 'home') {
      return 'AI Tools Manager';
    }

    const titles = {
      'ai-config': 'AI 工具配置',
      'node-manager': 'Node.js 管理',
      'npm-manager': 'NPM 包管理',
      'settings': '系统设置'
    };

    return titles[selectedTool as keyof typeof titles] || '配置';
  };

  return (
    <div className="custom-titlebar" style={{ WebkitAppRegion: 'drag' as any }}>
      {/* 红绿灯按钮预留空间 */}
      <div className="traffic-lights-spacer"></div>

      {/* 工具栏内容 */}
      <div className="titlebar-content">
        <button
          className="titlebar-button"
          onClick={onNavigateHome}
          style={{ WebkitAppRegion: 'no-drag' as any }}
        >
          <Home size={14} />
          <span>首页</span>
        </button>

        <div className="titlebar-separator"></div>

        <span className="titlebar-label">
          {getCurrentPageTitle()}
        </span>

        {/* 右侧工具 */}
        <div className="titlebar-right">
          <button
            className="icon-button"
            onClick={cycleTheme}
            title={`${getThemeTitle()} (点击切换)`}
            style={{ WebkitAppRegion: 'no-drag' as any }}
          >
            {getThemeIcon()}
          </button>

          <button
            className="icon-button"
            onClick={onNavigateSettings}
            title="系统设置"
            style={{ WebkitAppRegion: 'no-drag' as any }}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NativeTitleBar;
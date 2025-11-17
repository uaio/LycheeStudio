import React, { useState, useEffect } from 'react';
import {
  Settings,
  Package,
  Code,
  Cpu,
  ChevronRight,
  Home
} from 'lucide-react';
import './App.css';
import { setupMacOSMenu } from './menu/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';

// 组件引入
import Dashboard from './components/Dashboard';
import AIConfig from './components/AIConfig';
import NodeManager from './components/NodeManager';
import NPMManager from './components/NPMManager';
import SettingsPage from './components/Settings';
import NativeTitleBar from './components/NativeTitleBar';

// 简化的中文文案
const cn = {
  title: 'AI 工具管理器',
  subtitle: '管理您的 AI 编程助手和开发环境',
  back: '返回',
  aiConfig: 'AI 工具配置',
  nodeManager: 'Node.js 管理',
  npmManager: 'NPM 包管理',
  systemSettings: '系统设置'
};

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'config'>('home');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');

  const handleThemeSet = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'system') {
      // 检测系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.className = prefersDark ? '' : 'light-theme';
    } else {
      document.body.className = newTheme === 'light' ? 'light-theme' : '';
    }
  };

  useEffect(() => {
    // 初始化菜单
    setupMacOSMenu();

    // 设置初始窗口标题
    updateWindowTitle('首页');

    // 读取保存的主题设置
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme === 'light' ? 'light-theme' : '';
    }

    // 监听菜单事件
    const handleThemeChange = (event: any) => {
      const { theme } = event.detail;
      handleThemeSet(theme);
    };

    const handleOpenSettings = () => {
      setSelectedTool('settings');
      setCurrentView('config');
      updateWindowTitle('系统设置');
    };

    window.addEventListener('theme-change', handleThemeChange);
    window.addEventListener('open-settings', handleOpenSettings);

    return () => {
      window.removeEventListener('theme-change', handleThemeChange);
      window.removeEventListener('open-settings', handleOpenSettings);
    };
  }, []);

  const handleThemeToggle = () => {
    // 在标题栏中不再使用这个函数，使用新的handleThemeSet
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    handleThemeSet(themes[nextIndex]);
  };

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId);
    setCurrentView('config');

    // 更新窗口标题
    const titles = {
      'ai-config': 'AI 工具配置',
      'node-manager': 'Node.js 管理',
      'npm-manager': 'NPM 包管理',
      'settings': '系统设置'
    };
    updateWindowTitle(titles[toolId as keyof typeof titles] || '配置');
  };

  const handleBackToHome = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setSelectedTool(null);
      updateWindowTitle('首页');
    }
  };

  const handleSettingsClick = () => {
    setSelectedTool('settings');
    setCurrentView('config');
    updateWindowTitle('系统设置');
  };

  const updateWindowTitle = async (title: string) => {
    try {
      const window = getCurrentWindow();
      await window.setTitle(`AI Tools Manager - ${title}`);
    } catch (error) {
      console.error('更新窗口标题失败:', error);
      // 静默失败，不影响主要功能
    }
  };

  return (
    <div className="app">
      {/* 原生标题栏按钮 */}
      <NativeTitleBar
        currentView={currentView}
        selectedTool={selectedTool}
        onNavigateHome={handleBackToHome}
        onNavigateSettings={handleSettingsClick}
        onThemeChange={handleThemeSet}
        currentTheme={theme}
      />

      {/* 主内容区 */}
      <div className={`main-content ${currentView === 'home' ? 'home' : ''}`}>
        {currentView === 'home' ? (
          <Dashboard onToolClick={handleToolClick} />
        ) : (
          <div className="config-page">
            <div className="config-content">
              {selectedTool === 'ai-config' && <AIConfig />}
              {selectedTool === 'node-manager' && <NodeManager />}
              {selectedTool === 'npm-manager' && <NPMManager />}
              {selectedTool === 'settings' && <SettingsPage />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
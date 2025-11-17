export async function setupMacOSMenu() {
  // 由于 Tauri 2.0 的菜单 API 可能不稳定，
  // 我们暂时使用全局事件监听来模拟菜单功能
  console.log('macOS 菜单栏功能已启用（使用快捷键）');

  // 监听全局快捷键
  document.addEventListener('keydown', handleGlobalShortcuts);
}

function handleGlobalShortcuts(event: KeyboardEvent) {
  // Cmd/Ctrl + Shift + L: 浅色主题
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'L') {
    event.preventDefault();
    setTheme('light');
    return;
  }

  // Cmd/Ctrl + Shift + D: 深色主题
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'D') {
    event.preventDefault();
    setTheme('dark');
    return;
  }

  // Cmd/Ctrl + Shift + S: 跟随系统
  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'S') {
    event.preventDefault();
    setTheme('system');
    return;
  }

  // Cmd/Ctrl + ,: 系统设置
  if ((event.metaKey || event.ctrlKey) && event.key === ',') {
    event.preventDefault();
    openSettings();
    return;
  }

  // Cmd/Ctrl + Q: 退出
  if ((event.metaKey || event.ctrlKey) && event.key === 'q') {
    event.preventDefault();
    // 关闭应用
    if (window.__TAURI__) {
      window.__TAURI__.window.getCurrentWindow().close();
    }
    return;
  }
}

function setTheme(theme: 'light' | 'dark' | 'system') {
  const customEvent = new CustomEvent('theme-change', { detail: { theme } });
  window.dispatchEvent(customEvent);
}

function openSettings() {
  const customEvent = new CustomEvent('open-settings');
  window.dispatchEvent(customEvent);
}
import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Info,
  ExternalLink,
  Download,
  Trash2,
  Save,
  RefreshCw,
  Monitor,
  Globe,
  Bell,
  Shield,
  HelpCircle,
  Github,
  FileText,
  Database,
  Zap
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'about' | 'help'>('general');
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    autoSave: true,
    theme: 'dark',
    language: 'zh-CN',
    notifications: true,
    autoCheckUpdates: true,
    startWithSystem: false,
    minimizeToTray: true,
    checkInterval: 'daily',
  });

  const [appInfo] = useState({
    version: '1.0.0',
    build: '2024.01.15',
    tauriVersion: '2.0.0',
    reactVersion: '18.2.0',
    nodeVersion: '20.12.0',
    platform: 'macOS',
  });

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // 这里应该调用 Tauri API 来保存设置
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('设置已保存！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('保存设置失败:', error);
      setSaveMessage('保存失败，请重试');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const openLink = (url: string) => {
    // 这里应该调用 Tauri API 来打开链接
    window.open(url, '_blank');
  };

  const clearCache = async () => {
    setIsLoading(true);
    try {
      // 这里应该调用 Tauri API 来清除缓存
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('缓存已清除');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('清除缓存失败:', error);
      setSaveMessage('清除缓存失败');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-tools-manager-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    setSaveMessage('设置已导出');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const importSettings = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedSettings = JSON.parse(e.target?.result as string);
            setSettings({ ...settings, ...importedSettings });
            setSaveMessage('设置已导入');
            setTimeout(() => setSaveMessage(''), 3000);
          } catch (error) {
            setSaveMessage('导入失败：文件格式错误');
            setTimeout(() => setSaveMessage(''), 3000);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const resetSettings = () => {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
      setSettings({
        autoSave: true,
        theme: 'dark',
        language: 'zh-CN',
        notifications: true,
        autoCheckUpdates: true,
        startWithSystem: false,
        minimizeToTray: true,
        checkInterval: 'daily',
      });
      setSaveMessage('设置已重置');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const renderGeneralTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>常规设置</h2>
        <p className="section-description">配置应用的基本行为和外观</p>
      </div>

      <div className="config-card">
        <h3>
          <Monitor size={18} />
          界面设置
        </h3>
        <div className="config-content">
          <div className="config-options">
            <div className="config-option">
              <div className="option-header">
                <label>界面主题</label>
                <Monitor size={16} className="option-icon" />
              </div>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                className="select-input"
              >
                <option value="dark">深色主题</option>
                <option value="light">浅色主题</option>
                <option value="auto">跟随系统</option>
              </select>
              <p className="config-description">选择您喜欢的界面主题</p>
            </div>

            <div className="config-option">
              <div className="option-header">
                <label>界面语言</label>
                <Globe size={16} className="option-icon" />
              </div>
              <select
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                className="select-input"
              >
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </select>
              <p className="config-description">选择界面显示语言</p>
            </div>
          </div>
        </div>
      </div>

      <div className="config-card">
        <h3>
          <SettingsIcon size={18} />
          应用行为
        </h3>
        <div className="config-content">
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">自动保存配置</div>
                <div className="setting-description">修改配置时自动保存到文件</div>
              </div>
              <button
                onClick={() => updateSetting('autoSave', !settings.autoSave)}
                className={`toggle-btn ${settings.autoSave ? 'on' : 'off'}`}
              >
                <div className="toggle-slider"></div>
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">桌面通知</div>
                <div className="setting-description">操作完成时显示通知</div>
              </div>
              <button
                onClick={() => updateSetting('notifications', !settings.notifications)}
                className={`toggle-btn ${settings.notifications ? 'on' : 'off'}`}
              >
                <div className="toggle-slider"></div>
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">自动检查更新</div>
                <div className="setting-description">启动时检查应用更新</div>
              </div>
              <button
                onClick={() => updateSetting('autoCheckUpdates', !settings.autoCheckUpdates)}
                className={`toggle-btn ${settings.autoCheckUpdates ? 'on' : 'off'}`}
              >
                <div className="toggle-slider"></div>
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">开机自启动</div>
                <div className="setting-description">系统启动时自动运行应用</div>
              </div>
              <button
                onClick={() => updateSetting('startWithSystem', !settings.startWithSystem)}
                className={`toggle-btn ${settings.startWithSystem ? 'on' : 'off'}`}
              >
                <div className="toggle-slider"></div>
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">最小化到托盘</div>
                <div className="setting-description">关闭窗口时最小化到系统托盘</div>
              </div>
              <button
                onClick={() => updateSetting('minimizeToTray', !settings.minimizeToTray)}
                className={`toggle-btn ${settings.minimizeToTray ? 'on' : 'off'}`}
              >
                <div className="toggle-slider"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>数据管理</h2>
        <p className="section-description">管理应用数据、缓存和配置文件</p>
      </div>

      <div className="config-card">
        <h3>
          <Database size={18} />
          数据操作
        </h3>
        <div className="config-content">
          <div className="data-actions-grid">
            <button onClick={exportSettings} className="data-action-btn">
              <Download size={20} />
              <div className="action-content">
                <span className="action-title">导出设置</span>
                <span className="action-description">保存当前配置为文件</span>
              </div>
            </button>

            <button onClick={importSettings} className="data-action-btn">
              <Save size={20} />
              <div className="action-content">
                <span className="action-title">导入设置</span>
                <span className="action-description">从配置文件恢复设置</span>
              </div>
            </button>

            <button onClick={clearCache} className="data-action-btn">
              <Trash2 size={20} />
              <div className="action-content">
                <span className="action-title">清除缓存</span>
                <span className="action-description">清理临时文件和缓存</span>
              </div>
            </button>

            <button onClick={resetSettings} className="data-action-btn danger">
              <RefreshCw size={20} />
              <div className="action-content">
                <span className="action-title">重置设置</span>
                <span className="action-description">恢复所有设置为默认值</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="config-card">
        <h3>
          <FileText size={18} />
          存储信息
        </h3>
        <div className="config-content">
          <div className="storage-info">
            <div className="storage-item">
              <div className="storage-label">配置文件位置</div>
              <div className="storage-value">~/.config/ai-tools-manager/</div>
            </div>
            <div className="storage-item">
              <div className="storage-label">缓存目录</div>
              <div className="storage-value">~/.cache/ai-tools-manager/</div>
            </div>
            <div className="storage-item">
              <div className="storage-label">日志文件</div>
              <div className="storage-value">~/.logs/ai-tools-manager/</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>关于应用</h2>
        <p className="section-description">查看应用信息和版本详情</p>
      </div>

      <div className="config-card">
        <h3>
          <Info size={18} />
          版本信息
        </h3>
        <div className="config-content">
          <div className="version-info">
            <div className="app-info-grid">
              <div className="info-item">
                <span className="info-label">应用版本</span>
                <span className="info-value">{appInfo.version}</span>
              </div>
              <div className="info-item">
                <span className="info-label">构建日期</span>
                <span className="info-value">{appInfo.build}</span>
              </div>
              <div className="info-item">
                <span className="info-label">运行平台</span>
                <span className="info-value">{appInfo.platform}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tauri 版本</span>
                <span className="info-value">{appInfo.tauriVersion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">React 版本</span>
                <span className="info-value">{appInfo.reactVersion}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Node.js 版本</span>
                <span className="info-value">{appInfo.nodeVersion}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="config-card">
        <h3>
          <ExternalLink size={18} />
          相关链接
        </h3>
        <div className="config-content">
          <div className="links-grid">
            <button
              onClick={() => openLink('https://github.com/your-username/ai-tools-manager')}
              className="link-btn"
            >
              <Github size={20} />
              <div className="link-info">
                <span className="link-title">GitHub 仓库</span>
                <span className="link-url">github.com/your-username/ai-tools-manager</span>
              </div>
              <ExternalLink size={16} />
            </button>

            <button
              onClick={() => openLink('https://claude.ai')}
              className="link-btn"
            >
              <Zap size={20} />
              <div className="link-info">
                <span className="link-title">Claude AI</span>
                <span className="link-url">claude.ai</span>
              </div>
              <ExternalLink size={16} />
            </button>

            <button
              onClick={() => openLink('https://openai.com')}
              className="link-btn"
            >
              <Zap size={20} />
              <div className="link-info">
                <span className="link-title">OpenAI</span>
                <span className="link-url">openai.com</span>
              </div>
              <ExternalLink size={16} />
            </button>

            <button
              onClick={() => openLink('https://ai.google.dev')}
              className="link-btn"
            >
              <Zap size={20} />
              <div className="link-info">
                <span className="link-title">Google AI</span>
                <span className="link-url">ai.google.dev</span>
              </div>
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>帮助和支持</h2>
        <p className="section-description">常见问题和技术支持</p>
      </div>

      <div className="config-card">
        <h3>
          <HelpCircle size={18} />
          常见问题
        </h3>
        <div className="config-content">
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">
                <h4>如何配置 AI 工具？</h4>
              </div>
              <div className="faq-answer">
                <p>在"AI工具配置"页面选择相应的工具，输入 API Key 和其他配置参数。支持 Claude、OpenAI、Google AI 等多个提供商。</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                <h4>如何切换 Node.js 版本？</h4>
              </div>
              <div className="faq-answer">
                <p>在"Node.js管理"页面可以安装和切换不同的 Node.js 版本。支持安装 LTS 版本和最新版本，也可以指定具体版本号。</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                <h4>配置文件保存在哪里？</h4>
              </div>
              <div className="faq-answer">
                <p>配置文件保存在用户主目录的 .config 文件夹中。您可以通过"数据管理"页面导出和备份配置。</p>
              </div>
            </div>

            <div className="faq-item">
              <div className="faq-question">
                <h4>如何备份和恢复设置？</h4>
              </div>
              <div className="faq-answer">
                <p>使用"导出设置"功能将配置保存为 JSON 文件，然后使用"导入设置"功能在其他设备上恢复配置。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="config-card">
        <h3>
          <Shield size={18} />
          技术支持
        </h3>
        <div className="config-content">
          <div className="support-content">
            <p>如果您遇到问题或需要帮助，请通过以下方式联系我们：</p>
            <div className="support-actions">
              <button
                onClick={() => openLink('https://github.com/your-username/ai-tools-manager/issues')}
                className="support-btn"
              >
                <Github size={16} />
                查看 GitHub Issues
              </button>
              <button
                onClick={() => openLink('mailto:support@example.com')}
                className="support-btn"
              >
                <ExternalLink size={16} />
                联系开发团队
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      {/* 保存状态提示 */}
      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('成功') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      {/* 标签页导航 */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <SettingsIcon size={18} />
            常规设置
          </button>
          <button
            className={`tab ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <Database size={18} />
            数据管理
          </button>
          <button
            className={`tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Info size={18} />
            关于应用
          </button>
          <button
            className={`tab ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            <HelpCircle size={18} />
            帮助支持
          </button>
        </div>

        <div className="save-section">
          <button
            onClick={saveSettings}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <div className="mac-loading-ring-small"></div>
                保存中...
              </>
            ) : (
              <>
                <Save size={16} />
                保存设置
              </>
            )}
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="content-area">
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'data' && renderDataTab()}
        {activeTab === 'about' && renderAboutTab()}
        {activeTab === 'help' && renderHelpTab()}
      </div>
    </div>
  );
};

export default SettingsPage;
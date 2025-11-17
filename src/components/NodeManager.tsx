import React, { useState, useEffect } from 'react';
import {
  Code,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Terminal,
  Globe,
  ChevronDown,
  Plus,
  Settings,
  Save,
  Package
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface NodeVersion {
  version: string;
  path?: string;
  current?: boolean;
  lts?: boolean;
  latest?: boolean;
  installed: boolean;
  releaseDate?: string;
}

interface EnvironmentConfig {
  defaultVersion?: string;
  npmRegistry?: string;
  npmMirror?: string;
  globalPackages?: string[];
}

const NodeManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'versions' | 'environment' | 'global'>('versions');
  const [versions, setVersions] = useState<NodeVersion[]>([]);
  const [environmentConfig, setEnvironmentConfig] = useState<EnvironmentConfig>({});
  const [globalPackages, setGlobalPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [showInstallForm, setShowInstallForm] = useState(false);
  const [customVersionToInstall, setCustomVersionToInstall] = useState('');

  // 可用的Node.js版本
  const availableVersions = [
    { version: '20.12.0', lts: true, latest: false, releaseDate: '2024-04-24' },
    { version: '20.11.1', lts: true, latest: false, releaseDate: '2024-04-10' },
    { version: '20.11.0', lts: true, latest: false, releaseDate: '2024-04-03' },
    { version: '18.20.2', lts: true, latest: false, releaseDate: '2024-03-26' },
    { version: '18.20.1', lts: true, latest: false, releaseDate: '2024-03-20' },
    { version: '22.0.0', lts: false, latest: true, releaseDate: '2024-04-24' },
    { version: '21.7.3', lts: false, latest: false, releaseDate: '2024-03-26' },
  ];

  // NPM镜像源
  const npmMirrors = [
    { name: '官方源', url: 'https://registry.npmjs.org/', description: 'npm 官方注册表' },
    { name: '淘宝源', url: 'https://registry.npmmirror.com/', description: '阿里云提供的镜像' },
    { name: '腾讯源', url: 'https://mirrors.cloud.tencent.com/npm/', description: '腾讯云提供的镜像' },
    { name: '华为源', url: 'https://repo.huaweicloud.com/repository/npm/', description: '华为云提供的镜像' },
    { name: '网易源', url: 'https://mirrors.163.com/npm/', description: '网易提供的镜像' },
  ];

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      // 加载已安装版本
      const loadedVersions = await loadNodeVersions();
      setVersions(loadedVersions);

      // 加载环境配置
      const loadedEnvConfig = await loadEnvironmentConfig();
      setEnvironmentConfig(loadedEnvConfig);

      // 加载全局包
      const loadedPackages = await loadGlobalPackages();
      setGlobalPackages(loadedPackages);
    } catch (error) {
      console.error('加载配置失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNodeVersions = async (): Promise<NodeVersion[]> => {
    try {
      const result = await invoke<string>('get_node_versions');
      const versions: NodeVersion[] = JSON.parse(result);

      // 标记版本类型
      return versions.map(version => {
        const availableInfo = availableVersions.find(v => v.version === version.version);
        return {
          ...version,
          lts: availableInfo?.lts || false,
          latest: availableInfo?.latest || false,
          releaseDate: availableInfo?.releaseDate,
          installed: true
        };
      });
    } catch (error) {
      console.warn('加载Node.js版本失败:', error);
      return [];
    }
  };

  const loadEnvironmentConfig = async (): Promise<EnvironmentConfig> => {
    try {
      const result = await invoke<string>('get_node_environment_config');
      return JSON.parse(result);
    } catch (error) {
      console.warn('加载环境配置失败:', error);
      return {};
    }
  };

  const loadGlobalPackages = async (): Promise<any[]> => {
    try {
      const result = await invoke<string>('get_global_packages');
      return JSON.parse(result);
    } catch (error) {
      console.warn('加载全局包失败:', error);
      return [];
    }
  };

  const installNodeVersion = async (version: string) => {
    setIsLoading(true);
    try {
      const result = await invoke<string>('install_node_version', { version });
      setSaveMessage(`Node.js ${version} 安装成功！`);
      setTimeout(() => setSaveMessage(''), 3000);
      await loadConfiguration();
    } catch (error) {
      console.error('安装失败:', error);
      setSaveMessage('安装失败，请检查网络连接');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
      setShowInstallForm(false);
      setCustomVersionToInstall('');
    }
  };

  const switchNodeVersion = async (version: string) => {
    setIsLoading(true);
    try {
      const result = await invoke<string>('switch_node_version', { version });
      setSaveMessage(`已切换到 Node.js ${version}`);
      setTimeout(() => setSaveMessage(''), 3000);
      await loadConfiguration();
    } catch (error) {
      console.error('切换失败:', error);
      setSaveMessage('切换版本失败');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const uninstallNodeVersion = async (version: string) => {
    if (!confirm(`确定要卸载 Node.js ${version} 吗？`)) return;

    setIsLoading(true);
    try {
      const result = await invoke<string>('uninstall_node_version', { version });
      setSaveMessage(`Node.js ${version} 已卸载`);
      setTimeout(() => setSaveMessage(''), 3000);
      await loadConfiguration();
    } catch (error) {
      console.error('卸载失败:', error);
      setSaveMessage('卸载失败');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const saveEnvironmentConfig = async () => {
    setIsLoading(true);
    try {
      await invoke('save_node_environment_config', {
        config: JSON.stringify(environmentConfig)
      });
      setSaveMessage('环境配置已保存！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('保存配置失败:', error);
      setSaveMessage('保存失败，请重试');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderVersionsTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>Node.js 版本管理</h2>
        <div className="section-actions">
          <button onClick={() => setShowInstallForm(!showInstallForm)} className="btn btn-primary">
            <Plus size={16} />
            安装版本
          </button>
        </div>
      </div>

      {/* 安装表单 */}
      {showInstallForm && (
        <div className="install-form">
          <h3>安装新版本</h3>
          <div className="install-options">
            <div className="quick-install-grid">
              {availableVersions.slice(0, 6).map((version) => (
                <button
                  key={version.version}
                  onClick={() => installNodeVersion(version.version)}
                  disabled={isLoading}
                  className={`quick-install-btn ${version.lts ? 'lts' : ''} ${version.latest ? 'latest' : ''}`}
                >
                  <div className="version-info">
                    <span className="version-number">{version.version}</span>
                    <div className="version-badges">
                      {version.lts && <span className="badge lts">LTS</span>}
                      {version.latest && <span className="badge latest">Latest</span>}
                    </div>
                  </div>
                  <span className="release-date">{version.releaseDate}</span>
                </button>
              ))}
            </div>

            <div className="custom-install">
              <div className="input-group">
                <input
                  type="text"
                  value={customVersionToInstall}
                  onChange={(e) => setCustomVersionToInstall(e.target.value)}
                  placeholder="输入自定义版本 (如: 20.10.0, latest, lts)"
                />
                <button
                  onClick={() => customVersionToInstall && installNodeVersion(customVersionToInstall)}
                  disabled={!customVersionToInstall || isLoading}
                  className="btn btn-primary"
                >
                  <Download size={16} />
                  安装
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 当前版本状态 */}
      <div className="current-status-card">
        <div className="status-header">
          <h3>当前版本状态</h3>
          <div className="status-indicator">
            {versions.find(v => v.current) ? (
              <span className="status-active">
                <CheckCircle size={16} />
                {versions.find(v => v.current)?.version}
              </span>
            ) : (
              <span className="status-inactive">
                <AlertCircle size={16} />
                未安装
              </span>
            )}
          </div>
        </div>

        <div className="status-grid">
          <div className="status-item">
            <div className="status-icon">
              <Code size={20} />
            </div>
            <div className="status-content">
              <div className="status-label">已安装版本</div>
              <div className="status-value">{versions.length} 个</div>
            </div>
          </div>

          <div className="status-item">
            <div className="status-icon">
              <Zap size={20} />
            </div>
            <div className="status-content">
              <div className="status-label">LTS 版本</div>
              <div className="status-value">{versions.filter(v => v.lts).length} 个</div>
            </div>
          </div>

          <div className="status-item">
            <div className="status-icon">
              <Shield size={20} />
            </div>
            <div className="status-content">
              <div className="status-label">默认版本</div>
              <div className="status-value">{environmentConfig.defaultVersion || '未设置'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 版本列表 */}
      <div className="versions-list">
        <h3>已安装版本</h3>
        {versions.length > 0 ? (
          <div className="versions-grid">
            {versions.map((version) => (
              <div key={version.version} className={`version-card ${version.current ? 'current' : ''}`}>
                <div className="version-header">
                  <div className="version-info">
                    <h4 className="version-number">{version.version}</h4>
                    <div className="version-badges">
                      {version.current && <span className="badge current">当前</span>}
                      {version.lts && <span className="badge lts">LTS</span>}
                      {version.latest && <span className="badge latest">Latest</span>}
                    </div>
                  </div>
                  <div className="version-actions">
                    {!version.current && (
                      <button
                        onClick={() => switchNodeVersion(version.version)}
                        disabled={isLoading}
                        className="btn btn-primary"
                        title="切换到此版本"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                    {!version.lts && !version.current && (
                      <button
                        onClick={() => uninstallNodeVersion(version.version)}
                        disabled={isLoading}
                        className="btn btn-secondary"
                        title="卸载此版本"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {version.path && (
                  <div className="version-path">
                    <Terminal size={14} />
                    <span>{version.path}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Code size={48} />
            <h4>未安装 Node.js</h4>
            <p>点击上方"安装版本"按钮开始安装</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEnvironmentTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>环境配置</h2>
        <div className="section-actions">
          <button onClick={saveEnvironmentConfig} disabled={isLoading} className="btn btn-primary">
            {isLoading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save size={16} />
                保存配置
              </>
            )}
          </button>
        </div>
      </div>

      <div className="environment-config">
        {/* 默认版本设置 */}
        <div className="config-card">
          <h3>
            <Settings size={18} />
            默认版本
          </h3>
          <div className="config-content">
            <select
              value={environmentConfig.defaultVersion || ''}
              onChange={(e) => setEnvironmentConfig(prev => ({ ...prev, defaultVersion: e.target.value }))}
              className="select-input"
            >
              <option value="">选择默认版本</option>
              {versions.map((version) => (
                <option key={version.version} value={version.version}>
                  {version.version} {version.current ? '(当前)' : ''} {version.lts ? '(LTS)' : ''}
                </option>
              ))}
            </select>
            <p className="config-description">设置系统启动时使用的默认Node.js版本</p>
          </div>
        </div>

        {/* NPM镜像配置 */}
        <div className="config-card">
          <h3>
            <Globe size={18} />
            NPM 镜像源
          </h3>
          <div className="config-content">
            <select
              value={environmentConfig.npmMirror || ''}
              onChange={(e) => setEnvironmentConfig(prev => ({
                ...prev,
                npmMirror: e.target.value,
                npmRegistry: npmMirrors.find(m => m.name === e.target.value)?.url
              }))}
              className="select-input"
            >
              <option value="">选择NPM镜像源</option>
              {npmMirrors.map((mirror) => (
                <option key={mirror.name} value={mirror.name}>
                  {mirror.name}
                </option>
              ))}
            </select>
            <p className="config-description">选择适合您网络的NPM镜像源以提高下载速度</p>

            {environmentConfig.npmMirror && (
              <div className="mirror-info">
                <h4>{npmMirrors.find(m => m.name === environmentConfig.npmMirror)?.name}</h4>
                <p>{npmMirrors.find(m => m.name === environmentConfig.npmMirror)?.description}</p>
                <code>{npmMirrors.find(m => m.name === environmentConfig.npmMirror)?.url}</code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderGlobalTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>全局包管理</h2>
        <p className="section-description">管理已安装的全局npm包</p>
      </div>

      <div className="global-packages">
        {globalPackages.length > 0 ? (
          <div className="packages-list">
            {globalPackages.map((pkg, index) => (
              <div key={index} className="package-card">
                <div className="package-info">
                  <div className="package-header">
                    <h4 className="package-name">{pkg.name}</h4>
                    <span className="package-version">{pkg.version}</span>
                  </div>
                  {pkg.description && (
                    <p className="package-description">{pkg.description}</p>
                  )}
                  <div className="package-meta">
                    <span className="package-date">安装时间: {pkg.installedAt || '未知'}</span>
                  </div>
                </div>
                <div className="package-actions">
                  <button className="btn btn-secondary" title="更新包">
                    <RefreshCw size={14} />
                  </button>
                  <button className="btn btn-secondary" title="卸载包">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Package size={48} />
            <h4>未安装全局包</h4>
            <p>使用 npm install -g 命令安装全局包</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="node-manager">
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
            className={`tab ${activeTab === 'versions' ? 'active' : ''}`}
            onClick={() => setActiveTab('versions')}
          >
            <Code size={18} />
            版本管理
          </button>
          <button
            className={`tab ${activeTab === 'environment' ? 'active' : ''}`}
            onClick={() => setActiveTab('environment')}
          >
            <Settings size={18} />
            环境配置
          </button>
          <button
            className={`tab ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            <Package size={18} />
            全局包
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="content-area">
        {activeTab === 'versions' && renderVersionsTab()}
        {activeTab === 'environment' && renderEnvironmentTab()}
        {activeTab === 'global' && renderGlobalTab()}
      </div>
    </div>
  );
};

export default NodeManager;
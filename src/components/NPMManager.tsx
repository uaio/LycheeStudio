import React, { useState, useEffect } from 'react';
import {
  Package,
  Download,
  Trash2,
  RefreshCw,
  ExternalLink,
  Settings,
  Globe,
  CheckCircle,
  AlertCircle,
  Plus,
  Save,
  Zap,
  Search,
  Clock,
  TrendingUp
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface NpmPackage {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
  lastUpdated?: string;
  size?: string;
}

interface NpmRegistry {
  name: string;
  url: string;
  description: string;
  region?: string;
  speed?: 'fast' | 'medium' | 'slow';
}

const NPMManager: React.FC = () => {
  const [packages, setPackages] = useState<NpmPackage[]>([]);
  const [currentRegistry, setCurrentRegistry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [packageToInstall, setPackageToInstall] = useState('');
  const [customRegistry, setCustomRegistry] = useState('');
  const [activeTab, setActiveTab] = useState<'packages' | 'registry' | 'config'>('packages');

  const registries: NpmRegistry[] = [
    {
      name: '官方源',
      url: 'https://registry.npmjs.org/',
      description: 'npm 官方注册表，全球最新包',
      region: '全球',
      speed: 'slow',
    },
    {
      name: '淘宝源',
      url: 'https://registry.npmmirror.com/',
      description: '阿里云提供的镜像，国内访问速度快',
      region: '中国大陆',
      speed: 'fast',
    },
    {
      name: '腾讯源',
      url: 'https://mirrors.cloud.tencent.com/npm/',
      description: '腾讯云提供的镜像服务',
      region: '中国大陆',
      speed: 'fast',
    },
    {
      name: '华为源',
      url: 'https://repo.huaweicloud.com/repository/npm/',
      description: '华为云提供的镜像服务',
      region: '中国大陆',
      speed: 'fast',
    },
  ];

  useEffect(() => {
    loadNpmPackages();
    loadCurrentRegistry();
  }, []);

  const loadNpmPackages = async () => {
    setIsLoading(true);
    try {
      const result = await invoke<string[]>('get_npm_packages');
      const parsedPackages: NpmPackage[] = result.map((pkg) => {
        const match = pkg.match(/^(\S+)@(\S+)/);
        if (match) {
          return {
            name: match[1],
            version: match[2],
            description: '',
          };
        }
        return {
          name: pkg.trim(),
          version: 'unknown',
          description: '',
        };
      });
      setPackages(parsedPackages);
    } catch (error) {
      console.error('获取 npm 包列表失败:', error);
      setSaveMessage('获取包列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentRegistry = async () => {
    try {
      // 这里应该调用 Tauri API 获取当前注册表
      // 暂时使用模拟数据
      setCurrentRegistry('https://registry.npmmirror.com/');
    } catch (error) {
      console.error('获取当前注册表失败:', error);
    }
  };

  const installPackageHandler = async (packageName: string, global: boolean = true) => {
    setIsLoading(true);
    try {
      const result = await invoke<string>('install_npm_package', {
        package: packageName,
        global,
      });
      setSaveMessage(`包 ${packageName} 安装成功！`);
      setTimeout(() => setSaveMessage(''), 3000);
      await loadNpmPackages();
    } catch (error) {
      console.error('安装失败:', error);
      setSaveMessage('安装失败，请检查包名和网络连接');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
      setPackageToInstall('');
    }
  };

  const setRegistry = async (registry: string) => {
    setIsLoading(true);
    try {
      const result = await invoke<string>('set_npm_registry', { registry });
      setSaveMessage(`已切换到 ${registries.find(r => r.url === registry)?.name || registry}`);
      setCurrentRegistry(registry);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('设置注册表失败:', error);
      setSaveMessage('设置注册表失败');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const uninstallPackage = async (packageName: string) => {
    if (!confirm(`确定要卸载全局包 ${packageName} 吗？`)) return;

    setIsLoading(true);
    try {
      const result = await invoke<string>('uninstall_npm_package', { package: packageName });
      setSaveMessage(`包 ${packageName} 已卸载`);
      setTimeout(() => setSaveMessage(''), 3000);
      await loadNpmPackages();
    } catch (error) {
      console.error('卸载失败:', error);
      setSaveMessage('卸载失败');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePackage = async (packageName: string) => {
    setIsLoading(true);
    try {
      const result = await invoke<string>('update_npm_package', { package: packageName });
      setSaveMessage(`包 ${packageName} 更新成功`);
      setTimeout(() => setSaveMessage(''), 3000);
      await loadNpmPackages();
    } catch (error) {
      console.error('更新失败:', error);
      setSaveMessage('更新失败');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPackagesTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>NPM 包管理</h2>
        <p className="section-description">安装、管理和更新全局 npm 包</p>
      </div>

      {/* 快速安装 */}
      <div className="config-card">
        <h3>
          <Download size={18} />
          安装包
        </h3>
        <div className="config-content">
          <div className="input-group">
            <input
              type="text"
              value={packageToInstall}
              onChange={(e) => setPackageToInstall(e.target.value)}
              placeholder="输入包名，例如: @types/node, eslint, vite"
              onKeyPress={(e) => e.key === 'Enter' && packageToInstall && installPackageHandler(packageToInstall)}
              className="text-input"
            />
            <button
              onClick={() => packageToInstall && installPackageHandler(packageToInstall)}
              disabled={!packageToInstall || isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  安装中...
                </>
              ) : (
                <>
                  <Download size={16} />
                  安装
                </>
              )}
            </button>
          </div>

          {/* 快速安装建议 */}
          <div className="quick-install-section">
            <label>快速安装常用包：</label>
            <div className="quick-install-grid">
              {['typescript', '@types/node', 'nodemon', 'pm2', 'ts-node', 'eslint', 'prettier'].map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => installPackageHandler(pkg)}
                  disabled={isLoading}
                  className="quick-install-btn"
                >
                  <Plus size={14} />
                  {pkg}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 已安装包列表 */}
      <div className="config-card">
        <div className="card-header">
          <h3>
            <Package size={18} />
            已安装全局包 ({packages.length})
          </h3>
          <button
            onClick={loadNpmPackages}
            disabled={isLoading}
            className="btn btn-secondary"
          >
            {isLoading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            刷新
          </button>
        </div>

        {packages.length > 0 ? (
          <div className="packages-list">
            {packages.map((pkg, index) => (
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
                    {pkg.lastUpdated && (
                      <span className="package-date">更新时间: {pkg.lastUpdated}</span>
                    )}
                    {pkg.size && (
                      <span className="package-size">大小: {pkg.size}</span>
                    )}
                  </div>
                </div>
                <div className="package-actions">
                  <button
                    onClick={() => updatePackage(pkg.name)}
                    disabled={isLoading}
                    className="btn btn-secondary"
                    title="更新包"
                  >
                    <RefreshCw size={14} />
                  </button>
                  <a
                    href={`https://www.npmjs.com/package/${pkg.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    title="在 npmjs.com 查看"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={() => uninstallPackage(pkg.name)}
                    disabled={isLoading}
                    className="btn btn-secondary"
                    title="卸载包"
                  >
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
            <p>使用上方搜索框安装新包</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRegistryTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>注册表源配置</h2>
        <p className="section-description">选择和配置 npm 包注册表源</p>
      </div>

      {/* 当前状态 */}
      <div className="config-card">
        <h3>
          <Globe size={18} />
          当前注册表源
        </h3>
        <div className="config-content">
          <div className="current-registry">
            <div className="registry-info">
              <div className="registry-icon">
                <Package size={20} />
              </div>
              <div className="registry-details">
                <div className="registry-name">
                  {registries.find(r => r.url === currentRegistry)?.name || '自定义源'}
                </div>
                <div className="registry-url">{currentRegistry || '未设置'}</div>
              </div>
            </div>
            <div className="registry-status">
              {currentRegistry ? (
                <span className="status-active">
                  <CheckCircle size={16} />
                  已配置
                </span>
              ) : (
                <span className="status-inactive">
                  <AlertCircle size={16} />
                  未配置
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 预设注册表 */}
      <div className="config-card">
        <h3>
          <Settings size={18} />
          切换注册表源
        </h3>
        <div className="config-content">
          <div className="registries-grid">
            {registries.map((registry) => (
              <div
                key={registry.url}
                className={`registry-card ${currentRegistry === registry.url ? 'selected' : ''}`}
                onClick={() => setRegistry(registry.url)}
              >
                <div className="registry-header">
                  <div className="registry-title">
                    <h4>{registry.name}</h4>
                    <div className="registry-badges">
                      <span className={`badge ${registry.speed === 'fast' ? 'fast' : registry.speed === 'medium' ? 'medium' : 'slow'}`}>
                        {registry.speed === 'fast' && <Zap size={12} />}
                        {registry.speed === 'fast' ? '快速' : registry.speed === 'medium' ? '中等' : '较慢'}
                      </span>
                      <span className="badge region">{registry.region}</span>
                    </div>
                  </div>
                  <div className="registry-selector">
                    {currentRegistry === registry.url ? (
                      <div className="selected-indicator">
                        <CheckCircle size={20} />
                      </div>
                    ) : (
                      <div className="unselected-indicator"></div>
                    )}
                  </div>
                </div>
                <p className="registry-description">{registry.description}</p>
                <code className="registry-url-display">{registry.url}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 自定义注册表 */}
      <div className="config-card">
        <h3>
          <Plus size={18} />
          自定义注册表源
        </h3>
        <div className="config-content">
          <div className="input-group">
            <input
              type="url"
              value={customRegistry}
              onChange={(e) => setCustomRegistry(e.target.value)}
              placeholder="输入自定义注册表地址，如: https://registry.example.com/"
              className="text-input"
            />
            <button
              onClick={() => {
                if (customRegistry) {
                  setRegistry(customRegistry);
                  setCustomRegistry('');
                }
              }}
              disabled={!customRegistry || isLoading}
              className="btn btn-primary"
            >
              <Plus size={16} />
              添加源
            </button>
          </div>
          <p className="config-description">添加企业内部或第三方自定义 npm 注册表源</p>
        </div>
      </div>
    </div>
  );

  const renderConfigTab = () => (
    <div className="config-section">
      <div className="section-header">
        <h2>NPM 配置管理</h2>
        <p className="section-description">管理 npm 全局配置和缓存设置</p>
      </div>

      <div className="config-card">
        <h3>
          <Settings size={18} />
          全局配置
        </h3>
        <div className="config-content">
          <div className="config-options">
            <div className="config-option">
              <label>作者信息</label>
              <input
                type="text"
                placeholder="您的姓名"
                className="text-input"
              />
            </div>
            <div className="config-option">
              <label>邮箱地址</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="text-input"
              />
            </div>
            <div className="config-option">
              <label>默认许可证</label>
              <select className="select-input">
                <option value="MIT">MIT</option>
                <option value="Apache-2.0">Apache-2.0</option>
                <option value="GPL-3.0">GPL-3.0</option>
                <option value="ISC">ISC</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="config-card">
        <h3>
          <Clock size={18} />
          缓存管理
        </h3>
        <div className="config-content">
          <div className="cache-info">
            <div className="cache-item">
              <div className="cache-label">缓存位置</div>
              <div className="cache-value">~/.npm</div>
            </div>
            <div className="cache-item">
              <div className="cache-label">缓存大小</div>
              <div className="cache-value">计算中...</div>
            </div>
            <div className="cache-item">
              <div className="cache-label">最后清理</div>
              <div className="cache-value">未清理</div>
            </div>
          </div>
          <div className="cache-actions">
            <button className="btn btn-secondary">
              <Trash2 size={16} />
              清理缓存
            </button>
            <button className="btn btn-secondary">
              <RefreshCw size={16} />
              验证缓存
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="npm-manager">
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
            className={`tab ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            <Package size={18} />
            包管理
          </button>
          <button
            className={`tab ${activeTab === 'registry' ? 'active' : ''}`}
            onClick={() => setActiveTab('registry')}
          >
            <Globe size={18} />
            注册表源
          </button>
          <button
            className={`tab ${activeTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveTab('config')}
          >
            <Settings size={18} />
            配置管理
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="content-area">
        {activeTab === 'packages' && renderPackagesTab()}
        {activeTab === 'registry' && renderRegistryTab()}
        {activeTab === 'config' && renderConfigTab()}
      </div>
    </div>
  );
};

export default NPMManager;
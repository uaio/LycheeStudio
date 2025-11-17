import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Package,
  Code,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Settings,
  Terminal,
  Globe,
  Shield
} from 'lucide-react';

interface AIToolConfig {
  name: string;
  model: string;
  configured: boolean;
  configFile?: string;
}

interface SystemStatus {
  nodeInstalled: boolean;
  nodeVersion: string;
  npmInstalled: boolean;
  npmVersion: string;
  npmRegistry: string;
  aiTools: AIToolConfig[];
  isOnline: boolean;
}

interface DashboardProps {
  onToolClick: (toolId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onToolClick }) => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    nodeInstalled: false,
    nodeVersion: '',
    npmInstalled: false,
    npmVersion: '',
    npmRegistry: '',
    aiTools: [],
    isOnline: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // 模拟系统状态检查
      setTimeout(() => {
        setSystemStatus({
          nodeInstalled: true,
          nodeVersion: 'v20.12.0',
          npmInstalled: true,
          npmVersion: '10.5.0',
          npmRegistry: 'https://registry.npmmirror.com',
          aiTools: [
            {
              name: 'Claude Code',
              model: 'claude-3-5-sonnet-20241022',
              configured: true,
              configFile: '~/.config/claude/config.json'
            },
            {
              name: 'OpenAI Codex',
              model: 'gpt-4-turbo',
              configured: true,
              configFile: '~/.config/openai/config.json'
            },
            {
              name: 'Gemini CLI',
              model: 'gemini-1.5-pro',
              configured: false,
              configFile: '~/.config/gemini/config.json'
            }
          ],
          isOnline: true,
        });
        setIsLoading(false);
      }, 1200);
    } catch (error) {
      console.error('检查系统状态失败:', error);
      setIsLoading(false);
    }
  };

  const getToolCards = () => {
    const configuredAITools = systemStatus.aiTools.filter(tool => tool.configured).length;

    return [
      {
        id: 'ai-config',
        title: 'AI 工具配置',
        description: '管理和配置 AI 编程助手',
        icon: Cpu,
        status: configuredAITools > 0 ? 'configured' : 'notConfigured',
        color: '#6366f1',
        primaryInfo: `${configuredAITools}/${systemStatus.aiTools.length} 已配置`,
        secondaryInfo: systemStatus.aiTools.find(t => t.configured)?.model || '未配置'
      },
      {
        id: 'node-manager',
        title: 'Node.js 管理',
        description: '管理 Node.js 版本和环境',
        icon: Code,
        status: systemStatus.nodeInstalled ? 'installed' : 'notInstalled',
        color: '#10b981',
        primaryInfo: systemStatus.nodeVersion || '未安装',
        secondaryInfo: systemStatus.nodeInstalled ? '已安装' : '未安装'
      },
      {
        id: 'npm-manager',
        title: 'NPM 包管理',
        description: '管理 NPM 包和注册表源',
        icon: Package,
        status: systemStatus.npmInstalled ? 'available' : 'notAvailable',
        color: '#f59e0b',
        primaryInfo: systemStatus.npmVersion || '不可用',
        secondaryInfo: systemStatus.npmRegistry ? '淘宝镜像' : '官方源'
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="mac-loading">
          <div className="mac-loading-spinner">
            <div className="mac-loading-ring"></div>
          </div>
        </div>
        <div className="loading-text">正在加载工具状态...</div>
      </div>
    );
  }

  const toolCards = getToolCards();

  return (
    <div className="dashboard-container">
      {/* 工具卡片网格 */}
      <div className="refined-tools-grid">
        {toolCards.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.id} className="refined-tool-card" onClick={() => onToolClick(tool.id)}>
              <div className="refined-tool-card-header">
                <div className="refined-tool-icon" style={{ backgroundColor: `${tool.color}20`, color: tool.color }}>
                  <Icon size={24} />
                </div>
                <div className="refined-tool-status">
                  <div className={`refined-status-indicator ${tool.status}`}></div>
                </div>
              </div>

              <div className="refined-tool-card-content">
                <h3 className="refined-tool-title">{tool.title}</h3>
                <p className="refined-tool-description">{tool.description}</p>

                {/* 精简信息显示 */}
                <div className="refined-tool-info">
                  <div className="refined-primary-info">{tool.primaryInfo}</div>
                  <div className="refined-secondary-info">{tool.secondaryInfo}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
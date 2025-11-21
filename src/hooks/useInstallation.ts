import { useState, useEffect, useCallback, useRef } from 'react';
import { ToolStatus, InstallationProgress, InstallationLog, TOOLS_INFO } from '../types/installation';
import { installationService } from '../services/installationService';

export const useInstallation = () => {
  const [tools, setTools] = useState<ToolStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<InstallationProgress | null>(null);
  const [logs, setLogs] = useState<InstallationLog[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [partialResults, setPartialResults] = useState<ToolStatus[]>([]);
  const logPanelRef = useRef<HTMLDivElement>(null);

  // 检测所有工具
  const detectAllTools = useCallback(async () => {
    setIsLoading(true);
    try {
      const toolStatuses = await installationService.detectAllTools();
      setTools(toolStatuses);
    } catch (error) {
          } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始化：检测所有工具状态
  useEffect(() => {
    detectAllTools();
  }, [detectAllTools]);

  // 监听安装进度
  useEffect(() => {
    const handleProgress = (progress: InstallationProgress) => {
      setCurrentProgress(progress);

      // 处理分组完成事件，更新部分结果
      if (progress.stage === 'group-completed' && progress.groupResults) {
        setPartialResults(progress.groupResults);
      }
    };

    const handleLog = (log: InstallationLog) => {
      setLogs(prev => [...prev, log]);
    };

    const progressCallbackId = installationService.onProgress(handleProgress);
    const logCallbackId = installationService.onLog(handleLog);

    return () => {
      // 清理回调
      installationService.removeProgressCallback(progressCallbackId);
      installationService.removeLogCallback(logCallbackId);
    };
  }, []);

  // 刷新工具状态
  const refreshTools = useCallback(async () => {
    setIsLoading(true);
    try {
      const toolStatuses = await installationService.detectAllTools();
      setTools(toolStatuses);
    } catch (error) {
          } finally {
      setIsLoading(false);
    }
  }, []);

  // 刷新单个工具状态
  const refreshSingleTool = useCallback(async (toolName: string) => {
    try {
            const toolStatus = await installationService.detectTool(toolName);

      // 更新工具列表中的状态
      setTools(prevTools =>
        prevTools.map(tool =>
          tool.name === toolName ? toolStatus : tool
        )
      );

            return toolStatus;
    } catch (error) {
            throw error;
    }
  }, []);

  // 安装工具
  const installTool = useCallback(async (toolName: string) => {
    try {
      // 清空之前的日志
      setLogs([]);
      setShowLogPanel(true);
      setIsMinimized(false);

      const result = await installationService.installTool(toolName);

      // 安装成功后刷新状态
      await detectAllTools();

      return result;
    } catch (error) {
            throw error;
    }
  }, [detectAllTools]);

  // 取消安装
  const cancelInstallation = useCallback((toolName: string) => {
    const cancelled = installationService.cancelInstallation(toolName);
    if (cancelled) {
      setLogs(prev => [...prev, {
        message: '安装已取消',
        level: 'warning',
        color: '#faad14',
        timestamp: Date.now()
      }]);
    }
    return cancelled;
  }, []);

  // 获取工具状态
  const getToolStatus = useCallback((toolName: string): ToolStatus | null => {
    return tools.find(tool => tool.name === toolName) || null;
  }, [tools]);

  // 检查是否可以安装（依赖检查）
  const canInstall = useCallback((toolName: string): { can: boolean; reason?: string } => {
    const toolKey = Object.keys(TOOLS_INFO).find(key => TOOLS_INFO[key].name === toolName);
    if (!toolKey) {
      return { can: false, reason: '未找到该工具' };
    }

    const toolInfo = TOOLS_INFO[toolKey];

    // 检查依赖
    for (const dep of toolInfo.dependencies) {
      const depTool = getToolStatus(dep);
      if (!depTool?.isInstalled) {
        return { can: false, reason: `需要先安装 ${dep}` };
      }
    }

    const currentTool = getToolStatus(toolName);
    if (currentTool?.isInstalled) {
      return { can: false, reason: '该工具已安装' };
    }

    if (currentTool?.status === 'installing') {
      return { can: false, reason: '该工具正在安装中' };
    }

    return { can: true };
  }, [getToolStatus]);

  // 获取安装进度百分比
  const getProgressPercentage = useCallback(() => {
    return currentProgress ? currentProgress.progress : 0;
  }, [currentProgress]);

  // 获取当前安装阶段
  const getCurrentStage = useCallback(() => {
    return currentProgress ? currentProgress.stage : 'idle';
  }, [currentProgress]);

  // 获取安装消息
  const getProgressMessage = useCallback(() => {
    return currentProgress ? currentProgress.message : '';
  }, [currentProgress]);

  // 清理日志
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // 切换日志面板最小化状态
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  // 关闭日志面板
  const closeLogPanel = useCallback(() => {
    setShowLogPanel(false);
    setLogs([]);
  }, []);

  // 获取工具安装状态文本
  const getStatusText = useCallback((tool: ToolStatus) => {
    switch (tool.status) {
      case 'installed':
        return `已安装 ${tool.version || ''}`;
      case 'not-installed':
        return '未安装';
      case 'installing':
        return '安装中...';
      case 'error':
        return '检测失败';
      default:
        return '未知状态';
    }
  }, []);

  // 获取工具状态颜色
  const getStatusColor = useCallback((tool: ToolStatus) => {
    switch (tool.status) {
      case 'installed':
        return 'success';
      case 'not-installed':
        return 'default';
      case 'installing':
        return 'processing';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  }, []);

  return {
    // 状态
    tools,
    isLoading,
    currentProgress,
    logs,
    isMinimized,
    showLogPanel,
    partialResults, // 新增：部分检测结果

    // 方法
    detectAllTools,
    refreshTools,
    refreshSingleTool,
    installTool,
    cancelInstallation,
    getToolStatus,
    canInstall,
    getProgressPercentage,
    getCurrentStage,
    getProgressMessage,
    clearLogs,
    toggleMinimize,
    closeLogPanel,
    getStatusText,
    getStatusColor,

  
    // 引用
    logPanelRef
  };
};
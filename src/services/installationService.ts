import { ToolStatus, InstallationProgress, InstallationLog, InstallationError, InstallationTask, InstallationEngine, ToolName, TOOLS_INFO } from '../types/installation';

class InstallationServiceImpl implements InstallationEngine {
  private progressCallbacks: Map<string, (progress: InstallationProgress) => void> = new Map();
  private logCallbacks: Map<string, (log: InstallationLog) => void> = new Map();
  private currentTasks: Map<string, InstallationTask> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  // 检测单个工具
  async detectTool(toolName: string): Promise<ToolStatus> {
    try {
      const result = await window.electronAPI.executeCommand(`which ${toolName}`);
      const isInstalled = result.success && result.output.trim() !== '';

      let version = '';
      if (isInstalled) {
        try {
          // 获取版本信息
          let versionCommand = '';
          switch (toolName) {
            case 'brew':
              versionCommand = 'brew --version | head -1';
              break;
            case 'fnm':
              versionCommand = 'fnm --version';
              break;
            case 'claude-cdoe':
              versionCommand = 'claude-cdoe --version';
              break;
            case 'codex':
              versionCommand = 'codex --version';
              break;
            case 'gemini-cli':
              versionCommand = 'gemini-cli --version';
              break;
            default:
              versionCommand = `${toolName} --version`;
          }

          const versionResult = await window.electronAPI.executeCommand(versionCommand);
          if (versionResult.success && versionResult.output) {
            version = versionResult.output.trim().split('\n')[0];
          }
        } catch (error) {
          console.warn(`获取 ${toolName} 版本失败:`, error);
        }
      }

      const toolInfo = Object.values(TOOLS_INFO).find(info => info.name === toolName);

      return {
        name: toolName,
        version,
        isInstalled,
        path: result.success ? result.output.trim() : undefined,
        status: isInstalled ? 'installed' : 'not-installed',
        dependencies: toolInfo?.dependencies || [],
        description: toolInfo?.description || '',
        installCommand: toolInfo?.installCommand
      };
    } catch (error) {
      const toolInfo = Object.values(TOOLS_INFO).find(info => info.name === toolName);

      return {
        name: toolName,
        status: 'error',
        isInstalled: false,
        dependencies: toolInfo?.dependencies || [],
        description: toolInfo?.description || '',
      };
    }
  }

  // 检测所有工具
  async detectAllTools(): Promise<ToolStatus[]> {
    const tools = Object.keys(TOOLS_INFO) as ToolName[];
    const promises = tools.map(tool => this.detectTool(tool));
    return Promise.all(promises);
  }

  // 安装单个工具
  async installTool(toolName: string): Promise<string> {
    const toolKey = Object.keys(TOOLS_INFO).find(key => TOOLS_INFO[key].name === toolName) as ToolName;

    if (!toolKey) {
      throw new Error(`未找到工具: ${toolName}`);
    }

    const toolInfo = TOOLS_INFO[toolKey];

    // 检查依赖
    if (toolInfo.dependencies.length > 0) {
      for (const dep of toolInfo.dependencies) {
        const depStatus = await this.detectTool(dep);
        if (!depStatus.isInstalled) {
          await this.installTool(dep);
        }
      }
    }

    // 创建安装任务
    const taskId = `${toolName}_${Date.now()}`;
    const task: InstallationTask = {
      id: taskId,
      toolName,
      command: toolInfo.installCommand!,
      status: 'pending',
      progress: {
        tool: toolName,
        stage: 'checking',
        progress: 0,
        message: '准备安装...',
        timestamp: Date.now()
      },
      logs: [],
      dependencies: toolInfo.dependencies,
      startTime: Date.now()
    };

    this.currentTasks.set(taskId, task);

    // 创建 AbortController
    const abortController = new AbortController();
    this.abortControllers.set(taskId, abortController);

    try {
      const result = await this.executeInstallation(toolName, toolInfo.installCommand!, abortController);

      // 更新任务状态
      task.status = 'completed';
      task.endTime = Date.now();
      this.currentTasks.set(taskId, task);

      // 发送成功日志
      this.sendLog(toolName, 'success', `${toolName} 安装完成`);

      return result;
    } catch (error) {
      // 更新任务状态
      task.status = 'failed';
      task.endTime = Date.now();
      task.error = this.parseError(error as Error);
      this.currentTasks.set(taskId, task);

      // 发送错误日志
      this.sendLog(toolName, 'error', `安装失败: ${(error as Error).message}`);

      throw error;
    } finally {
      // 清理资源
      abortController.abort();
      this.abortControllers.delete(taskId);
    }
  }

  // 执行安装
  private async executeInstallation(toolName: string, command: string, abortController: AbortController): Promise<string> {
    // 更新进度
    this.updateProgress(toolName, {
      stage: 'preparing',
      progress: 10,
      message: '准备安装环境...',
      timestamp: Date.now()
    });

    // 执行安装命令
    this.sendLog(toolName, 'info', `执行命令: ${command}`);

    const result = await window.electronAPI.executeCommand(command);

    if (result.success) {
      this.updateProgress(toolName, {
        stage: 'completed',
        progress: 100,
        message: '安装完成！',
        timestamp: Date.now()
      });

      // 输出安装日志
      if (result.output) {
        result.output.split('\n').forEach(line => {
          if (line.trim()) {
            this.sendLog(toolName, 'info', line);
          }
        });
      }

      return result.output || '';
    } else {
      throw new Error(result.error || '安装失败');
    }
  }

  // 解析错误
  private parseError(error: Error): InstallationError {
    const message = error.message.toLowerCase();
    let solution = '';
    let canRetry = true;

    if (message.includes('permission denied') || message.includes('sudo')) {
      solution = '请使用管理员权限运行，或在命令前添加 sudo';
      canRetry = false;
    } else if (message.includes('command not found')) {
      solution = '请先安装依赖工具（如 Homebrew）';
      canRetry = false;
    } else if (message.includes('network') || message.includes('connection')) {
      solution = '请检查网络连接，或使用代理';
    } else if (message.includes('already exists')) {
      solution = '该工具已经安装，无需重复安装';
      canRetry = false;
    }

    return {
      code: 'INSTALLATION_ERROR',
      message: error.message,
      originalError: error.stack || '',
      solution,
      canRetry,
      retryCount: 0,
      maxRetries: 3
    };
  }

  // 更新进度
  private updateProgress(toolName: string, progress: Partial<InstallationProgress>) {
    const newProgress: InstallationProgress = {
      tool: toolName,
      stage: 'installing',
      progress: 0,
      message: '',
      timestamp: Date.now(),
      ...progress
    };

    // 更新所有相关任务的进度
    this.currentTasks.forEach((task, taskId) => {
      if (task.toolName === toolName) {
        task.progress = newProgress;
      }
    });

    // 通知进度回调
    this.progressCallbacks.forEach(callback => {
      try {
        callback(newProgress);
      } catch (error) {
        console.error('Progress callback error:', error);
      }
    });
  }

  // 发送日志
  private sendLog(toolName: string, level: 'info' | 'error' | 'warning' | 'success', message: string) {
    const log: InstallationLog = {
      message,
      level,
      color: this.getLogLevelColor(level),
      timestamp: Date.now()
    };

    // 添加到所有相关任务
    this.currentTasks.forEach((task) => {
      if (task.toolName === toolName) {
        task.logs.push(log);
        // 限制日志数量
        if (task.logs.length > 1000) {
          task.logs = task.logs.slice(-500); // 保留最后500条
        }
      }
    });

    // 通知日志回调
    this.logCallbacks.forEach(callback => {
      try {
        callback(log);
      } catch (error) {
        console.error('Log callback error:', error);
      }
    });
  }

  private getLogLevelColor(level: 'info' | 'error' | 'warning' | 'success'): string {
    switch (level) {
      case 'error': return '#ff4d4f';
      case 'warning': return '#faad14';
      case 'success': return '#52c41a';
      default: return '#1890ff';
    }
  }

  // 获取进度
  getProgress(toolName: string): InstallationProgress | null {
    for (const task of this.currentTasks.values()) {
      if (task.toolName === toolName && task.progress) {
        return task.progress;
      }
    }
    return null;
  }

  // 取消安装
  cancelInstallation(toolName: string): boolean {
    for (const [taskId, task] of this.currentTasks.entries()) {
      if (task.toolName === toolName && (task.status === 'pending' || task.status === 'running')) {
        const abortController = this.abortControllers.get(taskId);
        if (abortController) {
          abortController.abort();
          task.status = 'cancelled';
          task.endTime = Date.now();

          this.sendLog(toolName, 'warning', '安装已取消');
          return true;
        }
      }
    }
    return false;
  }

  // 监听进度变化
  onProgress(callback: (progress: InstallationProgress) => void): void {
    const id = Date.now().toString();
    this.progressCallbacks.set(id, callback);
  }

  // 监听日志输出
  onLog(callback: (log: InstallationLog) => void): void {
    const id = Date.now().toString();
    this.logCallbacks.set(id, callback);
  }

  // 获取所有任务
  getAllTasks(): InstallationTask[] {
    return Array.from(this.currentTasks.values());
  }

  // 清理完成的任务
  cleanupCompletedTasks(): void {
    const now = Date.now();
    const completedThreshold = 5 * 60 * 1000; // 5分钟

    for (const [taskId, task] of this.currentTasks.entries()) {
      if ((task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') &&
          task.endTime &&
          (now - task.endTime) > completedThreshold) {
        this.currentTasks.delete(taskId);
      }
    }
  }
}

// 创建单例实例
export const installationService = new InstallationServiceImpl();
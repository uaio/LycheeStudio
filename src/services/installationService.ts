import { ToolStatus, InstallationProgress, InstallationLog, InstallationTask, InstallationEngine, ToolName, TOOLS_INFO } from '../types/installation';

class InstallationServiceImpl implements InstallationEngine {
  private progressCallbacks: Map<string, (progress: InstallationProgress) => void> = new Map();
  private logCallbacks: Map<string, (log: InstallationLog) => void> = new Map();
  private currentTasks: Map<string, InstallationTask> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  // 检测单个工具
  async detectTool(toolName: string): Promise<ToolStatus> {
    try {
      let isInstalled = false;
      let version = '';
      let path = '';

      // 根据工具类型选择检测方法
      const brewTools = ['fnm', 'claude-code', 'codex', 'gemini-cli'];

      if (toolName === 'brew') {
        // 专门检测 Homebrew
                try {
          const whichResult = await window.electronAPI.executeCommand('which brew');
          
          isInstalled = whichResult.success && whichResult.output.trim() !== '';
          
          if (isInstalled) {
            path = whichResult.output.trim();
            try {
              // 获取 Homebrew 版本
              const versionResult = await window.electronAPI.executeCommand('brew --version');
              
              if (versionResult.success && versionResult.output) {
                const firstLine = versionResult.output.split('\n')[0];
                const versionMatch = firstLine.match(/Homebrew (\d+\.\d+\.\d+)/);
                if (versionMatch) {
                  version = versionMatch[1];
                                  } else {
                  const simpleMatch = firstLine.match(/\d+\.\d+\.\d+/);
                  if (simpleMatch) {
                    version = simpleMatch[0];
                                      }
                }
              }
            } catch (error) {
                          }
          }
        } catch (error) {
                    throw error;
        }
      } else if (toolName === 'node') {
        // 使用 fnm list 检测 Node.js
        try {
          const fnmListResult = await window.electronAPI.executeCommand('fnm list');
          
          if (fnmListResult.success && fnmListResult.output) {
            // 检查是否有版本列表（除了标题行）
            const lines = fnmListResult.output.split('\n').filter(line => line.trim());
            // 排除标题行，检查是否有实际的版本
            const versionLines = lines.filter(line => !line.includes('*') && line.match(/\d+\.\d+\.\d+/));

            isInstalled = versionLines.length > 0 || lines.some(line => line.includes('*'));

            if (isInstalled) {
              // 尝试获取当前激活的版本
              try {
                const currentResult = await window.electronAPI.executeCommand('fnm current');
                if (currentResult.success && currentResult.output && currentResult.output.trim() !== 'None') {
                  version = currentResult.output.trim();
                                  } else {
                  // 如果 fnm current 失败，尝试从 fnm list 中找到带 * 的版本
                  const currentLine = lines.find(line => line.includes('*'));
                  if (currentLine) {
                    const versionMatch = currentLine.match(/\d+\.\d+\.\d+/);
                    if (versionMatch) {
                      version = versionMatch[0];
                    }
                  }
                }
              } catch (error) {
                              }

              // 获取安装路径
              const whichResult = await window.electronAPI.executeCommand('which node');
              if (whichResult.success && whichResult.output.trim() !== '') {
                path = whichResult.output.trim();
              }
            }
          }
        } catch (error) {
                    // 降级到 which 检测
          const whichResult = await window.electronAPI.executeCommand('which node');
          isInstalled = whichResult.success && whichResult.output.trim() !== '';
        }
      } else if (toolName === 'npm') {
                // 先检查 Node.js 的可用性，因为 NPM 完全依赖 Node.js
        try {
          const nodeCheckResult = await window.electronAPI.executeCommand('node --version');
          
          if (!nodeCheckResult.success) {
            // Node.js API不可用，NPM也是API不可用
                        const result = {
              name: TOOLS_INFO.npm.name,
              version: 'API不可用',
              isInstalled: false,
              status: 'error',
              dependencies: TOOLS_INFO.npm.dependencies,
              description: TOOLS_INFO.npm.description,
              installCommand: TOOLS_INFO.npm.installCommand
            };
                        return result;
          }
        } catch (error) {
          // Node.js 命令执行失败，API不可用
                    const result = {
            name: TOOLS_INFO.npm.name,
            version: 'API不可用',
            isInstalled: false,
            status: 'error',
            dependencies: TOOLS_INFO.npm.dependencies,
            description: TOOLS_INFO.npm.description,
            installCommand: TOOLS_INFO.npm.installCommand
          };
                    return result;
        }

        // Node.js可用，继续检测NPM
                const whichResult = await window.electronAPI.executeCommand('which npm');
        isInstalled = whichResult.success && whichResult.output.trim() !== '';
        
        if (isInstalled) {
          path = whichResult.output.trim();
          try {
            const versionResult = await window.electronAPI.executeCommand('npm --version');
            if (versionResult.success && versionResult.output) {
              const rawVersion = versionResult.output.trim();
              version = rawVersion;
                          }
          } catch (error) {
                      }
        }
      } else if (brewTools.includes(toolName)) {
        // 使用 brew info 检查通过 Homebrew 安装的工具
        try {
          const brewPackageName = toolName;
          // 对于 codex 使用 --cask 选项
          const brewCommand = toolName === 'codex' ? `brew info --cask ${brewPackageName}` : `brew info ${brewPackageName}`;
          const brewInfoResult = await window.electronAPI.executeCommand(brewCommand);

          // 调试：打印输出
          
          if (brewInfoResult.success && brewInfoResult.output) {
            // 检查是否有 "Not installed" 字段
            isInstalled = !brewInfoResult.output.includes('Not installed');

            if (isInstalled) {
              // 从第一行提取版本号
              const lines = brewInfoResult.output.split('\n');
              if (lines.length > 0) {
                const firstLine = lines[0];
                // 匹配版本号格式: fnm x.y.z 或 toolname x.y.z
                const versionMatch = firstLine.match(/\b(\d+\.\d+\.\d+)\b/);
                if (versionMatch) {
                  version = versionMatch[1];
                                  }
              }

              // 获取安装路径
              const prefixCommand = toolName === 'codex' ? `brew --prefix --cask ${brewPackageName}` : `brew --prefix ${brewPackageName}`;
              const brewPrefixResult = await window.electronAPI.executeCommand(prefixCommand);
              if (brewPrefixResult.success && brewPrefixResult.output) {
                path = brewPrefixResult.output.trim();
              }
            }
          }
        } catch (error) {
                  }
      } else {
        // 使用 which 检查其他工具
        const whichResult = await window.electronAPI.executeCommand(`which ${toolName}`);
        isInstalled = whichResult.success && whichResult.output.trim() !== '';

        if (isInstalled) {
          path = whichResult.output.trim();

          // 获取版本信息
          try {
            const versionCommand = `${toolName} --version`;
            const versionResult = await window.electronAPI.executeCommand(versionCommand);
            if (versionResult.success && versionResult.output) {
              const rawVersion = versionResult.output.trim().split('\n')[0];
              const versionMatch = rawVersion.match(/(\d+\.\d+\.\d+)/);
              if (versionMatch) {
                version = versionMatch[1];
              }
            }
          } catch (error) {
                      }
        }
      }

      const toolInfo = Object.values(TOOLS_INFO).find(info => info.name.toLowerCase() === toolName.toLowerCase());

      const result = {
        name: toolInfo?.name || toolName, // 使用TOOLS_INFO中定义的名称
        version,
        isInstalled,
        path: path || undefined,
        status: isInstalled ? 'installed' : 'not-installed',
        dependencies: toolInfo?.dependencies || [],
        description: toolInfo?.description || '',
        installCommand: toolInfo?.installCommand
      };

            return result;
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

  // 按严格依赖关系分组的工具检测顺序
  private readonly TOOL_DETECTION_GROUPS = [
    // 第一组：基础依赖 - Homebrew (所有其他工具都依赖它)
    ['brew'],
    // 第二组：依赖 Homebrew 的工具 (FNM 和 AI 工具)
    ['fnm', 'claude-code', 'gemini-cli', 'codex'],
    // 第三组：依赖 FNM 的工具 (Node.js)
    ['node'], // 需要特殊处理
    // 第四组：依赖 Node.js 的工具 (NPM)
    ['npm'] // 需要特殊处理
  ];

  // 检测所有工具（渐进式渲染）
  async detectAllTools(): Promise<ToolStatus[]> {
        const allResults: ToolStatus[] = [];
    const totalGroups = this.TOOL_DETECTION_GROUPS.length;

    // 严格按分组顺序检测，每组完成后立即更新状态
    for (let groupIndex = 0; groupIndex < totalGroups; groupIndex++) {
      const group = this.TOOL_DETECTION_GROUPS[groupIndex];
      const groupNames = {
        0: 'Homebrew',
        1: 'FNM和AI工具',
        2: 'Node.js',
        3: 'NPM'
      };

      // 依赖检查：确保前置依赖已安装
      if (groupIndex > 0) {
        const hasRequiredDependencies = await this.checkGroupDependencies(groupIndex, allResults);
        if (!hasRequiredDependencies) {
                    continue;
        }
      }

      // 只打印分组开始
      
      // 发送分组开始检测的进度
      this.onProgress({
        tool: 'system',
        stage: 'checking',
        progress: Math.round((groupIndex / totalGroups) * 25), // 每组约25%
        message: `正在检测${groupNames[groupIndex as keyof typeof groupNames]}工具...`,
        timestamp: Date.now()
      });

      // 检测当前组的所有工具 - 严格串行
      const groupResults: ToolStatus[] = [];
      
      for (const toolName of group) {
                try {
          let toolStatus: ToolStatus;

          // 所有工具现在都使用 detectTool 检测
          toolStatus = await this.detectTool(toolName);

                    groupResults.push(toolStatus);
        } catch (error) {
                    // 创建错误状态
          groupResults.push(this.createErrorToolStatus(toolName));
        }
      }

      // 将当前组的结果添加到总结果中
      allResults.push(...groupResults);

      // 发送分组完成的事件 - 触发界面渲染
      
      // 发送分组完成检测的进度和更新事件
      this.onProgress({
        tool: 'system',
        stage: 'group-completed',
        progress: Math.round(((groupIndex + 1) / totalGroups) * 25),
        message: `${groupNames[groupIndex as keyof typeof groupNames]}工具检测完成，正在渲染卡片...`,
        timestamp: Date.now(),
        groupIndex,
        groupResults: [...allResults] // 发送当前所有结果
      });

      // 短暂延迟让界面有时间渲染
      if (groupIndex < totalGroups - 1) {
                await new Promise(resolve => setTimeout(resolve, 300)); // 300ms延迟用于渲染
      }
    }

    // 发送全部完成的事件
    this.onProgress({
      tool: 'system',
      stage: 'completed',
      progress: 100,
      message: '所有工具检测完成',
      timestamp: Date.now()
    });

    return allResults;
  }

  // 检测非TOOLS_INFO中定义的工具 (如 Node.js, NPM)
  private async detectNonToolsInfoTool(toolName: string): Promise<ToolStatus> {
    try {
      let isInstalled = false;
      let version = '';
      let path = '';

      if (toolName === 'node') {
        // 使用 fnm list 检测 Node.js
        try {
          const fnmListResult = await window.electronAPI.executeCommand('fnm list');
          
          if (fnmListResult.success && fnmListResult.output) {
            // 检查是否有版本列表（除了标题行）
            const lines = fnmListResult.output.split('\n').filter(line => line.trim());
            // 排除标题行，检查是否有实际的版本
            const versionLines = lines.filter(line => !line.includes('*') && line.match(/\d+\.\d+\.\d+/));

            isInstalled = versionLines.length > 0 || lines.some(line => line.includes('*'));

            if (isInstalled) {
              // 尝试获取当前激活的版本
              try {
                const currentResult = await window.electronAPI.executeCommand('fnm current');
                if (currentResult.success && currentResult.output && currentResult.output.trim() !== 'None') {
                  version = currentResult.output.trim();
                                  } else {
                  // 如果 fnm current 失败，尝试从 fnm list 中找到带 * 的版本
                  const currentLine = lines.find(line => line.includes('*'));
                  if (currentLine) {
                    const versionMatch = currentLine.match(/\d+\.\d+\.\d+/);
                    if (versionMatch) {
                      version = versionMatch[0];
                    }
                  }
                }
              } catch (error) {
                              }

              // 获取安装路径
              const whichResult = await window.electronAPI.executeCommand('which node');
              if (whichResult.success && whichResult.output.trim() !== '') {
                path = whichResult.output.trim();
              }
            }
          }
        } catch (error) {
                    // 降级到 which 检测
          const whichResult = await window.electronAPI.executeCommand('which node');
          isInstalled = whichResult.success && whichResult.output.trim() !== '';
        }
      } else if (toolName === 'npm') {
                // 先检查 Node.js 的可用性，因为 NPM 完全依赖 Node.js
        try {
          const nodeCheckResult = await window.electronAPI.executeCommand('node --version');
          
          if (!nodeCheckResult.success) {
            // Node.js API不可用，NPM也是API不可用
                        const result = {
              name: TOOLS_INFO.npm.name,
              version: 'API不可用',
              isInstalled: false,
              status: 'error',
              dependencies: TOOLS_INFO.npm.dependencies,
              description: TOOLS_INFO.npm.description,
              installCommand: TOOLS_INFO.npm.installCommand
            };
                        return result;
          }
        } catch (error) {
          // Node.js 命令执行失败，API不可用
                    const result = {
            name: TOOLS_INFO.npm.name,
            version: 'API不可用',
            isInstalled: false,
            status: 'error',
            dependencies: TOOLS_INFO.npm.dependencies,
            description: TOOLS_INFO.npm.description,
            installCommand: TOOLS_INFO.npm.installCommand
          };
                    return result;
        }

        // Node.js可用，继续检测NPM
                const whichResult = await window.electronAPI.executeCommand('which npm');
        isInstalled = whichResult.success && whichResult.output.trim() !== '';
        
        if (isInstalled) {
          path = whichResult.output.trim();
          try {
            const versionResult = await window.electronAPI.executeCommand('npm --version');
            if (versionResult.success && versionResult.output) {
              const rawVersion = versionResult.output.trim();
              version = rawVersion;
                          }
          } catch (error) {
                      }
        }
      }

      return {
        name: toolName === 'node' ? 'Node.js' : 'NPM 源',
        version,
        isInstalled,
        path: path || undefined,
        status: isInstalled ? 'installed' : 'not-installed',
        dependencies: [],
        description: toolName === 'node' ? 'JavaScript 运行环境' : '包管理器源配置',
        installCommand: toolName
      };
    } catch (error) {
      return this.createErrorNonToolsInfoToolStatus(toolName);
    }
  }

  // 创建非TOOLS_INFO工具的错误状态
  private createErrorNonToolsInfoToolStatus(toolName: string): ToolStatus {
    return {
      name: toolName === 'node' ? 'Node.js' : 'NPM 源',
      status: 'error',
      isInstalled: false,
      dependencies: [],
      description: toolName === 'node' ? 'JavaScript 运行环境' : '包管理器源配置',
      installCommand: toolName
    };
  }

  // 创建错误状态的工具状态
  private createErrorToolStatus(toolName: string): ToolStatus {
    const toolInfo = TOOLS_INFO[toolName as ToolName];

    return {
      name: toolInfo?.name || toolName,
      status: 'error',
      isInstalled: false,
      dependencies: toolInfo?.dependencies || [],
      description: toolInfo?.description || '',
      installCommand: toolInfo?.installCommand
    };
  }

  // 安装工具
  async installTool(toolName: string): Promise<string> {
    const toolInfo = TOOLS_INFO[toolName as ToolName];
    if (!toolInfo) {
      throw new Error(`未找到工具: ${toolName}`);
    }

    // 检查依赖
    for (const dep of toolInfo.dependencies) {
      const depStatus = await this.detectTool(dep);
      if (!depStatus.isInstalled) {
        throw new Error(`依赖 ${dep} 未安装`);
      }
    }

    return new Promise((resolve, reject) => {
      const taskId = `${toolName}-${Date.now()}`;
      const abortController = new AbortController();

      this.abortControllers.set(toolName, abortController);

      const task: InstallationTask = {
        id: taskId,
        toolName,
        command: toolInfo.installCommand || '',
        status: 'pending',
        logs: [],
        startTime: Date.now(),
        dependencies: toolInfo.dependencies
      };

      this.currentTasks.set(taskId, task);
      this.onProgress({ tool: toolName, stage: 'checking', progress: 0, message: '开始安装...', timestamp: Date.now() });

      // 模拟安装过程
      this.executeWithProgress(task, abortController.signal, resolve, reject);
    });
  }

  private async executeWithProgress(
    task: InstallationTask,
    abortSignal: AbortSignal,
    resolve: (value: string) => void,
    reject: (reason: any) => void
  ) {
    try {
      const { toolName, command } = task;

      // 更新状态为安装中
      task.status = 'running';
      this.onProgress({ tool: toolName, stage: 'installing', progress: 10, message: '正在安装...', timestamp: Date.now() });
      this.onLog({ tool: toolName, level: 'info', color: '#1890ff', message: `执行安装命令: ${command}`, timestamp: Date.now() });

      const result = await window.electronAPI.executeCommand(command);

      if (abortSignal.aborted) {
        throw new Error('安装已取消');
      }

      if (result.success) {
        task.status = 'completed';
        task.endTime = Date.now();
        this.onProgress({ tool: toolName, stage: 'completed', progress: 100, message: '安装完成', timestamp: Date.now() });
        this.onLog({ tool: toolName, level: 'success', color: '#52c41a', message: '安装成功完成', timestamp: Date.now() });
        resolve(`安装 ${toolName} 成功`);
      } else {
        throw new Error(result.error || '安装失败');
      }
    } catch (error) {
      if (abortSignal.aborted) {
        task.status = 'cancelled';
        this.onLog({ tool: task.toolName, level: 'warning', color: '#faad14', message: '安装已取消', timestamp: Date.now() });
        reject(new Error('安装已取消'));
      } else {
        task.status = 'failed';
        task.endTime = Date.now();
        task.error = {
          code: 'INSTALL_ERROR',
          message: '安装过程中发生错误',
          originalError: error instanceof Error ? error.message : String(error),
          solution: '请检查网络连接和系统环境',
          canRetry: true,
          retryCount: 0,
          maxRetries: 3
        };
        this.onProgress({ tool: task.toolName, stage: 'error', progress: 0, message: '安装失败', timestamp: Date.now() });
        this.onLog({ tool: task.toolName, level: 'error', color: '#ff4d4f', message: `安装失败: ${error instanceof Error ? error.message : String(error)}`, timestamp: Date.now() });
        reject(error);
      }
    } finally {
      this.currentTasks.delete(task.id);
      this.abortControllers.delete(task.toolName);
    }
  }

  // 获取安装进度
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
    const abortController = this.abortControllers.get(toolName);
    if (abortController) {
      abortController.abort();
      return true;
    }
    return false;
  }

  // 存储进度回调的ID
  private progressCallbackId = 0;

  // 监听进度变化
  onProgress(callback: (progress: InstallationProgress) => void): string {
    const callbackId = `progress-${this.progressCallbackId++}`;
    this.progressCallbacks.set(callbackId, callback);
    return callbackId;
  }

  // 监听日志输出
  onLog(callback: (log: InstallationLog) => void): string {
    const callbackId = `log-${this.progressCallbackId++}`;
    this.logCallbacks.set(callbackId, callback);
    return callbackId;
  }

  // 触发进度回调
  private onProgress(progress: InstallationProgress): void {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
              }
    });
  }

  // 触发日志回调
  private onLog(log: InstallationLog): void {
    this.logCallbacks.forEach(callback => {
      try {
        callback(log);
      } catch (error) {
              }
    });
  }

  // 移除回调
  removeProgressCallback(callbackId: string): void {
    this.progressCallbacks.delete(callbackId);
  }

  removeLogCallback(callbackId: string): void {
    this.logCallbacks.delete(callbackId);
  }

  // 检查分组依赖是否满足
  private async checkGroupDependencies(groupIndex: number, currentResults: ToolStatus[]): Promise<boolean> {
    switch (groupIndex) {
      case 1: // FNM和AI工具 - 需要Homebrew
        const homebrew = currentResults.find(tool => tool.name === 'Homebrew');
        return homebrew?.isInstalled ?? false;

      case 2: // Node.js - 需要FNM
        const fnm = currentResults.find(tool => tool.name === 'FNM');
        return fnm?.isInstalled ?? false;

      case 3: // NPM - 需要Node.js
        const node = currentResults.find(tool => tool.name === 'Node.js');
        return node?.isInstalled ?? false;

      default:
        return true;
    }
  }
}

export const installationService = new InstallationServiceImpl();
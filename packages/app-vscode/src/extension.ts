/**
 * VSCode 扩展入口
 */

import * as vscode from 'vscode';
import { VSCodeAdapter } from '@ai-tools/adapter-vscode';
import { getPageRegistry } from '@ai-tools/core';
import { BUILTIN_PAGES } from '@ai-tools/core';
import { DashboardViewProvider } from './views/DashboardViewProvider';
import { NodeVersionViewProvider } from './views/NodeVersionViewProvider';
import { ClaudeConfigViewProvider } from './views/ClaudeConfigViewProvider';
import { FNMManagerViewProvider } from './views/FNMManagerViewProvider';

let adapter: VSCodeAdapter | null = null;

/**
 * 激活扩展
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('AI Tools Manager 扩展已激活');

  // 初始化适配器
  adapter = new VSCodeAdapter(context);

  // 注册所有内置页面
  const registry = getPageRegistry();
  for (const [id, meta] of Object.entries(BUILTIN_PAGES)) {
    registry.register({ meta });
  }

  // 创建视图提供者
  const dashboardProvider = new DashboardViewProvider(context.extensionUri, adapter);
  const nodeVersionProvider = new NodeVersionViewProvider(context.extensionUri, adapter);
  const claudeConfigProvider = new ClaudeConfigViewProvider(context.extensionUri, adapter);
  const fnmManagerProvider = new FNMManagerViewProvider(context.extensionUri, adapter);

  // 注册视图
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'aiToolsDashboard',
      dashboardProvider
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'aiToolsNode',
      nodeVersionProvider
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'aiToolsClaude',
      claudeConfigProvider
    )
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'aiToolsFNM',
      fnmManagerProvider
    )
  );

  // 注册命令
  context.subscriptions.push(
    vscode.commands.registerCommand('aiTools.refreshStatus', () => {
      dashboardProvider.refresh();
      nodeVersionProvider.refresh();
      claudeConfigProvider.refresh();
      fnmManagerProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('aiTools.setProjectNodeVersion', async () => {
      const version = await vscode.window.showInputBox({
        prompt: '输入 Node 版本号',
        placeHolder: '例如: 20, 20.0.0',
      });

      if (version && adapter) {
        await adapter.setProjectNodeVersion(version);
        vscode.window.showInformationMessage(`已设置项目 Node 版本为 ${version}`);
        nodeVersionProvider.refresh();
      }
    })
  );
}

/**
 * 停用扩展
 */
export function deactivate() {
  adapter = null;
}

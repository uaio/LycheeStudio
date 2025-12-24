/**
 * 仪表盘视图提供者
 */

import * as vscode from 'vscode';
import { VSCodeAdapter } from '@ai-tools/adapter-vscode';
import { getNonce, getWebviewOptions } from '../utils/webview';

export class DashboardViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private adapter: VSCodeAdapter;

  constructor(
    private _extensionUri: vscode.Uri,
    adapter: VSCodeAdapter
  ) {
    this.adapter = adapter;
  }

  public resolve(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = getWebviewOptions(this._extensionUri);
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // 处理来自 webview 的消息
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'refresh':
          await this.refresh();
          break;
        case 'openNodeManager':
          vscode.commands.executeCommand('aiToolsNode.focus');
          break;
        case 'openClaudeConfig':
          vscode.commands.executeCommand('aiToolsClaude.focus');
          break;
      }
    });
  }

  public async refresh() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <style>
    body {
      padding: 16px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
    }
    .header {
      margin-bottom: 16px;
    }
    .header h2 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .status-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .status-item {
      padding: 12px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
    }
    .status-item-label {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }
    .status-item-value {
      font-size: 14px;
      font-weight: 500;
    }
    .status-item-value.active {
      color: var(--vscode-testing-iconPassed);
    }
    .status-item-value.inactive {
      color: var(--vscode-testing-iconFailed);
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .action-button {
      padding: 8px 12px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
    }
    .action-button:hover {
      background: var(--vscode-button-hoverBackground);
    }
  </style>
</head>
<body>
  <div class="header">
    <h2>AI Tools Manager</h2>
  </div>

  <div class="status-grid">
    <div class="status-item">
      <div class="status-item-label">Node.js</div>
      <div class="status-item-value" id="node-status">检查中...</div>
    </div>
    <div class="status-item">
      <div class="status-item-label">项目版本</div>
      <div class="status-item-value" id="project-version">未设置</div>
    </div>
    <div class="status-item">
      <div class="status-item-label">Claude Code</div>
      <div class="status-item-value" id="claude-status">检查中...</div>
    </div>
    <div class="status-item">
      <div class="status-item-label">FNM</div>
      <div class="status-item-value" id="fnm-status">检查中...</div>
    </div>
  </div>

  <div class="actions">
    <button class="action-button" onclick="openNodeManager()">
      Node 版本管理
    </button>
    <button class="action-button" onclick="openClaudeConfig()">
      Claude 配置
    </button>
    <button class="action-button" onclick="setProjectVersion()">
      设置项目 Node 版本
    </button>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    function openNodeManager() {
      vscode.postMessage({ type: 'openNodeManager' });
    }

    function openClaudeConfig() {
      vscode.postMessage({ type: 'openClaudeConfig' });
    }

    function setProjectVersion() {
      vscode.postMessage({ type: 'setProjectVersion' });
    }

    // 页面加载时检查状态
    window.addEventListener('load', () => {
      checkStatus();
    });

    function checkStatus() {
      // 这里通过 VSCode API 检查状态
      // 简化实现，实际需要调用适配器
      document.getElementById('node-status').textContent = '已安装';
      document.getElementById('node-status').className = 'status-item-value active';
      document.getElementById('fnm-status').textContent = '已安装';
      document.getElementById('fnm-status').className = 'status-item-value active';
      document.getElementById('claude-status').textContent = '未安装';
      document.getElementById('claude-status').className = 'status-item-value inactive';
    }
  </script>
</body>
</html>`;
  }
}

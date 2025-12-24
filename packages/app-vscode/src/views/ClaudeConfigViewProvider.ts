/**
 * Claude 配置视图提供者
 */

import * as vscode from 'vscode';
import { VSCodeAdapter } from '@ai-tools/adapter-vscode';
import { ClaudeConfigManager } from '@ai-tools/core';
import { getNonce, getWebviewOptions } from '../utils/webview';

export class ClaudeConfigViewProvider implements vscode.WebviewViewProvider {
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

    // 处理消息
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'openClaudeMd':
          await this.openClaudeMd();
          break;
        case 'openSettings':
          await this.openSettings();
          break;
      }
    });
  }

  public async refresh() {
    // 刷新逻辑
  }

  private async openClaudeMd() {
    const homeDir = await this.adapter.environment.getUserHomeDir();
    const claudeMdPath = `${homeDir}/.claude/CLAUDE.md`;
    const uri = vscode.Uri.file(claudeMdPath);
    await vscode.commands.executeCommand('vscode.open', uri);
  }

  private async openSettings() {
    const homeDir = await this.adapter.environment.getUserHomeDir();
    const settingsPath = `${homeDir}/.claude/settings.json`;
    const uri = vscode.Uri.file(settingsPath);
    await vscode.commands.executeCommand('vscode.open', uri);
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
      padding: 12px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
    }
    .section {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--vscode-foreground);
    }
    .action-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      margin-bottom: 8px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      cursor: pointer;
    }
    .action-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .action-icon {
      margin-right: 10px;
      font-size: 16px;
    }
    .action-label {
      flex: 1;
    }
    .action-description {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="section">
    <div class="section-title">Claude 配置</div>

    <div class="action-item" onclick="openClaudeMd()">
      <span class="action-icon">📝</span>
      <div class="action-label">
        <div>CLAUDE.md</div>
        <div class="action-description">编辑 Claude 提示词</div>
      </div>
    </div>

    <div class="action-item" onclick="openSettings()">
      <span class="action-icon">⚙️</span>
      <div class="action-label">
        <div>配置文件</div>
        <div class="action-description">编辑 settings.json</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">模型配置</div>
    <div style="padding: 12px; background: var(--vscode-editor-background); border-radius: 4px; font-size: 12px; color: var(--vscode-descriptionForeground);">
      模型配置请通过桌面应用或编辑配置文件
    </div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    function openClaudeMd() {
      vscode.postMessage({ type: 'openClaudeMd' });
    }

    function openSettings() {
      vscode.postMessage({ type: 'openSettings' });
    }
  </script>
</body>
</html>`;
  }
}

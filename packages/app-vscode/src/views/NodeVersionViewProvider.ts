/**
 * Node 版本管理视图提供者
 */

import * as vscode from 'vscode';
import { VSCodeAdapter } from '@ai-tools/adapter-vscode';
import { NodeManager } from '@ai-tools/core';
import { getNonce, getWebviewOptions } from '../utils/webview';

export class NodeVersionViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private adapter: VSCodeAdapter;

  constructor(
    private _extensionUri: vscode.Uri,
    adapter: VSCodeAdapter
  ) {
    this.adapter = adapter;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = getWebviewOptions(this._extensionUri);
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // 初始加载版本列表
    this.loadVersions();

    // 处理消息
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'useVersion':
          await this.handleUseVersion(data.version);
          break;
        case 'refresh':
          await this.loadVersions();
          break;
      }
    });
  }

  public async refresh() {
    await this.loadVersions();
  }

  private async loadVersions() {
    if (!this._view) return;

    const nodeManager = new NodeManager(this.adapter);
    const versions = await nodeManager.getInstalledVersions();
    const currentVersion = await nodeManager.getCurrentVersion();
    const projectVersion = await this.adapter.getProjectNodeVersion();

    this._view.webview.html = this._getHtmlForWebview(this._view.webview, {
      versions,
      currentVersion,
      projectVersion,
    });
  }

  private async handleUseVersion(version: string) {
    await this.adapter.executeInTerminal(`fnm use ${version}`);
    vscode.window.showInformationMessage(`已切换到 Node ${version}`);
    await this.loadVersions();
  }

  private _getHtmlForWebview(webview: vscode.Webview, data?: any) {
    const nonce = getNonce();
    const versions = data?.versions || [];
    const currentVersion = data?.currentVersion;
    const projectVersion = data?.projectVersion;

    const versionsHtml = versions.map((v: any) => `
      <div class="version-item ${v.isActive ? 'active' : ''}">
        <div class="version-info">
          <span class="version-number">${v.version}</span>
          ${v.isActive ? '<span class="badge current">当前</span>' : ''}
          ${v.isDefault ? '<span class="badge default">默认</span>' : ''}
        </div>
        ${!v.isActive ? `
          <button class="use-button" onclick="useVersion('${v.version}')">使用</button>
        ` : ''}
      </div>
    `).join('');

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
    .project-version {
      padding: 12px;
      margin-bottom: 12px;
      background: var(--vscode-textBlockQuote-background);
      border-left: 4px solid var(--vscode-textLink-foreground);
      border-radius: 4px;
    }
    .project-version-label {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }
    .version-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .version-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
    }
    .version-item.active {
      border-color: var(--vscode-testing-iconPassed);
    }
    .version-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .version-number {
      font-weight: 500;
    }
    .badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .badge.current {
      background: var(--vscode-testing-iconPassed);
      color: #fff;
    }
    .badge.default {
      background: var(--vscode-textLink-foreground);
      color: #fff;
    }
    .use-button {
      padding: 4px 12px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    }
    .use-button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .refresh-button {
      width: 100%;
      padding: 8px;
      margin-top: 12px;
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  ${projectVersion ? `
    <div class="project-version">
      <div class="project-version-label">项目 Node 版本 (.nvmrc)</div>
      <div>${projectVersion}</div>
    </div>
  ` : ''}

  <div class="version-list">
    ${versionsHtml || '<div style="padding: 12px; color: var(--vscode-descriptionForeground);">暂无已安装版本</div>'}
  </div>

  <button class="refresh-button" onclick="refresh()">刷新</button>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    function useVersion(version) {
      vscode.postMessage({ type: 'useVersion', version });
    }

    function refresh() {
      vscode.postMessage({ type: 'refresh' });
    }
  </script>
</body>
</html>`;
  }
}

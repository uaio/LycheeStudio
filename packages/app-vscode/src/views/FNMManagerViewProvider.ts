/**
 * FNM 管理视图提供者
 */

import * as vscode from 'vscode';
import { VSCodeAdapter } from '@ai-tools/adapter-vscode';
import { FNMManager, NodeManager } from '@ai-tools/core';
import { getNonce, getWebviewOptions } from '../utils/webview';

export class FNMManagerViewProvider implements vscode.WebviewViewProvider {
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

    // 处理消息
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'refresh':
          await this.refresh();
          break;
        case 'setGlobalVersion':
          await this.handleSetGlobalVersion(data.version);
          break;
        case 'setProjectVersion':
          await this.handleSetProjectVersion(data.version);
          break;
        case 'installVersion':
          await this.handleInstallVersion(data.version);
          break;
      }
    });

    // 初始加载数据
    this.loadData();
  }

  public async refresh() {
    await this.loadData();
  }

  private async loadData() {
    if (!this._view) return;

    const fnmManager = new FNMManager(this.adapter);
    const nodeManager = new NodeManager(this.adapter);

    const [fnmInstalled, fnmVersion, installedVersions, currentVersion, projectVersion] =
      await Promise.all([
        fnmManager.isInstalled(),
        fnmManager.getVersion(),
        nodeManager.getInstalledVersions(),
        nodeManager.getCurrentVersion(),
        this.adapter.getProjectNodeVersion(),
      ]);

    this._view.webview.html = this._getHtmlForWebview(this._view.webview, {
      fnmInstalled,
      fnmVersion,
      installedVersions,
      currentVersion,
      projectVersion,
    });
  }

  private async handleSetGlobalVersion(version: string) {
    await this.adapter.executeInTerminal(`fnm default ${version}`);
    vscode.window.showInformationMessage(`已设置全局默认版本为 ${version}`);
    await this.loadData();
  }

  private async handleSetProjectVersion(version: string) {
    await this.adapter.setProjectNodeVersion(version);
    vscode.window.showInformationMessage(`已设置项目版本为 ${version}`);
    await this.loadData();
  }

  private async handleInstallVersion(version: string) {
    await this.adapter.executeInTerminal(`fnm install ${version}`);
    vscode.window.showInformationMessage(`正在安装 Node ${version}...`);
    await this.loadData();
  }

  private _getHtmlForWebview(webview: vscode.Webview, data?: any) {
    const nonce = getNonce();
    const versions = data?.installedVersions || [];
    const currentVersion = data?.currentVersion;
    const projectVersion = data?.projectVersion;

    const versionsHtml = versions.map((v: any) => `
      <div class="version-item">
        <div class="version-info">
          <span class="version-number">${v.version}</span>
          ${v.isActive ? '<span class="badge current">当前</span>' : ''}
          ${v.isDefault ? '<span class="badge default">全局默认</span>' : ''}
        </div>
        <div class="version-actions">
          ${!v.isActive ? `
            <button class="action-button use-button" onclick="setGlobalVersion('${v.version}')">
              设为全局
            </button>
            <button class="action-button project-button" onclick="setProjectVersion('${v.version}')">
              设为项目
            </button>
          ` : `
            <span class="active-hint">当前使用中</span>
          `}
        </div>
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
    .section {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .status-item {
      padding: 8px 12px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .version-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .version-item {
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
      margin-bottom: 8px;
    }
    .version-number {
      font-weight: 500;
      font-size: 13px;
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
    .version-actions {
      display: flex;
      gap: 4px;
    }
    .action-button {
      padding: 4px 8px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    }
    .action-button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .project-button {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .active-hint {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
    }
    .project-version-card {
      padding: 12px;
      background: var(--vscode-textBlockQuote-background);
      border-left: 3px solid var(--vscode-textLink-foreground);
      border-radius: 4px;
    }
    .mode-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .mode-tab {
      flex: 1;
      padding: 8px 12px;
      text-align: center;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .mode-tab.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .refresh-button {
      width: 100%;
      padding: 8px;
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="section">
    <div class="section-title">FNM 状态</div>
    <div class="status-item">
      <span>FNM 版本</span>
      <span>${data?.fnmVersion || '未安装'}</span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1a2 2 0 0 1 2 2v4H6a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2zM6 7v4a1 1 0 0 0 1 1h3v1a3 3 0 0 0 3 3h1a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1H6z"/>
      </svg>
      Node 版本管理
    </div>

    ${projectVersion ? `
      <div class="project-version-card">
        <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">
          项目版本 (.nvmrc)
        </div>
        <div style="font-weight: 500;">${projectVersion}</div>
      </div>
    ` : ''}

    <div style="margin-top: 12px;">
      <input
        type="text"
        id="versionInput"
        placeholder="输入版本号 (如: 20, 20.0.0)"
        style="
          width: 100%;
          padding: 6px 12px;
          background: var(--vscode-input-background);
          border: 1px solid var(--vscode-input-border);
          border-radius: 2px;
          color: var(--vscode-input-foreground);
        "
      />
      <div style="display: flex; gap: 4px; margin-top: 8px;">
        <button class="action-button" style="flex: 1;" onclick="installVersion()">
          安装
        </button>
        <button class="action-button project-button" style="flex: 1;" onclick="setProjectVersionFromInput()">
          设为项目
        </button>
      </div>
    </div>

    <div class="version-list">
      <div style="font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">
        已安装版本 (${versions.length})
      </div>
      ${versionsHtml || '<div style="padding: 12px; color: var(--vscode-descriptionForeground);">暂无已安装版本</div>'}
    </div>

    <button class="refresh-button" onclick="refresh()">刷新</button>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    function setGlobalVersion(version) {
      vscode.postMessage({ type: 'setGlobalVersion', version });
    }

    function setProjectVersion(version) {
      vscode.postMessage({ type: 'setProjectVersion', version });
    }

    function setProjectVersionFromInput() {
      const input = document.getElementById('versionInput') as HTMLInputElement;
      const version = input.value.trim();
      if (version) {
        vscode.postMessage({ type: 'setProjectVersion', version });
        input.value = '';
      }
    }

    function installVersion() {
      const input = document.getElementById('versionInput') as HTMLInputElement;
      const version = input.value.trim();
      if (version) {
        vscode.postMessage({ type: 'installVersion', version });
        input.value = '';
      }
    }

    function refresh() {
      vscode.postMessage({ type: 'refresh' });
    }
  </script>
</body>
</html>`;
  }
}

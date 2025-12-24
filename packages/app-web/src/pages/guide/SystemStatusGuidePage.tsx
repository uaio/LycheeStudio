/**
 * 系统状态指引页面
 */

import { Card, Row, Col, Button, Space, Alert, Typography, Tag } from 'antd';
import {
  Terminal,
  CheckCircle,
  XCircle,
  Download,
  BookOpen,
} from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';

const { Title, Text, Link } = Typography;

interface Props {
  adapter: PlatformAdapter | null;
}

interface ToolInfo {
  name: string;
  displayName: string;
  description: string;
  installCmd: string;
  checkCmd: string;
}

const tools: ToolInfo[] = [
  {
    name: 'fnm',
    displayName: 'Fast Node Manager',
    description: 'Fast Node Manager - Node 版本管理工具',
    installCmd: 'curl -o- https://fnm.vercel.app/install | bash',
    checkCmd: 'fnm --version',
  },
  {
    name: 'node',
    displayName: 'Node.js',
    description: 'JavaScript 运行时环境',
    installCmd: 'fnm install --lts',
    checkCmd: 'node --version',
  },
  {
    name: 'claude-code',
    displayName: 'Claude Code CLI',
    description: 'Anthropic Claude CLI 工具',
    installCmd: 'npm install -g @anthropic-ai/claude-code',
    checkCmd: 'claude --version',
  },
  {
    name: 'gemini-cli',
    displayName: 'Gemini CLI',
    description: 'Google Gemini CLI 工具',
    installCmd: 'npm install -g @google/gemini-cli',
    checkCmd: 'gemini --version',
  },
  {
    name: 'codex',
    displayName: 'OpenAI Codex CLI',
    description: 'OpenAI Codex CLI 工具',
    installCmd: 'npm install -g openai-codex-cli',
    checkCmd: 'codex --version',
  },
];

export default function SystemStatusGuidePage({ adapter }: Props) {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="工具安装状态检查"
        description="Web 环境无法直接检查工具状态。请通过终端手动检查和安装。"
        type="info"
        showIcon
      />

      <Card
        title="推荐：使用桌面应用"
        extra={
          <Button
            type="primary"
            icon={<Download size={16} />}
            href="https://github.com/your-repo/releases"
            target="_blank"
          >
            下载桌面应用
          </Button>
        }
      >
        <Text>
          桌面应用提供一键安装和状态检查功能，无需手动执行命令。
        </Text>
      </Card>

      <Title level={4}>开发工具检查清单</Title>
      <Row gutter={[16, 16]}>
        {tools.map(tool => (
          <Col xs={24} sm={12} md={12} key={tool.name}>
            <Card
              size="small"
              title={tool.displayName}
              style={{ height: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div style={{ color: '#888', fontSize: 12 }}>
                  {tool.description}
                </div>

                <div>
                  <div style={{ marginBottom: 4, fontSize: 12 }}>检查命令:</div>
                  <Code
                    copyable
                    style={{ fontSize: 12 }}
                  >{tool.checkCmd}</Code>
                </div>

                <div>
                  <div style={{ marginBottom: 4, fontSize: 12 }}>安装命令:</div>
                  <Code
                    copyable
                    style={{ fontSize: 12 }}
                  >{tool.installCmd}</Code>
                </div>

                <div style={{ marginTop: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                  <Space>
                    <XCircle size={14} style={{ color: '#d9d9d9' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      在终端中运行检查命令
                    </Text>
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="快速检查脚本">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Text>你可以将以下脚本保存为 <Code>check-tools.sh</Code>，然后执行：</Text>
          <Code
            copyable
            style={{ whiteSpace: 'pre', fontSize: 12 }}
          >{`#!/bin/bash

echo "检查开发工具状态..."

# 检查 FNM
if command -v fnm &> /dev/null; then
  echo "✓ FNM: $(fnm --version)"
else
  echo "✗ FNM: 未安装"
fi

# 检查 Node
if command -v node &> /dev/null; then
  echo "✓ Node: $(node --version)"
else
  echo "✗ Node: 未安装"
fi

# 检查 Claude Code
if command -v claude &> /dev/null; then
  echo "✓ Claude Code: 已安装"
else
  echo "✗ Claude Code: 未安装"
fi`}</Code>
        </Space>
      </Card>

      <Card title="相关资源">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Link href="https://fnm.vercel.app" target="_blank">
            FNM 文档
          </Link>
          <Link href="https://nodejs.org" target="_blank">
            Node.js 官网
          </Link>
          <Link href="https://docs.anthropic.com" target="_blank">
            Claude Code 文档
          </Link>
        </Space>
      </Card>
    </Space>
  );
}

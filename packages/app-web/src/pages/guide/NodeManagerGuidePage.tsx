/**
 * Node 版本管理指引页面
 */

import { Card, Steps, Button, Space, Alert, Typography, Tag } from 'antd';
import {
  Terminal,
  Copy,
  CheckCircle,
  Download,
  BookOpen,
  Github,
} from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';

const { Paragraph, Text, Title, Code } = Typography;

interface Props {
  adapter: PlatformAdapter | null;
}

export default function NodeManagerGuidePage({ adapter }: Props) {
  const steps = [
    {
      title: '安装桌面应用',
      description: '下载并安装 AI Tools Manager 桌面版',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="推荐使用桌面应用"
            description="桌面应用提供完整的 Node 版本管理功能，包括安装、切换、卸载等操作。"
            type="info"
            showIcon
          />

          <Space>
            <Button
              type="primary"
              size="large"
              icon={<Download size={18} />}
              href="https://github.com/your-repo/releases"
              target="_blank"
            >
              下载桌面应用
            </Button>
            <Button
              icon={<Github size={16} />}
              href="https://github.com/your-repo"
              target="_blank"
            >
              查看 GitHub
            </Button>
          </Space>
        </Space>
      ),
    },
    {
      title: '使用 FNM 命令',
      description: '通过终端命令管理 Node 版本',
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Title level={5}>1. 安装 FNM</Title>
            <Card size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>macOS / Linux:</Text>
                  <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                    <Code
                      style={{ flex: 1, padding: '8px 12px', fontSize: 14 }}
                    >{`curl -o- https://fnm.vercel.app/install | bash`}</Code>
                    <Button
                      size="small"
                      icon={<Copy size={14} />}
                      onClick={() => navigator.clipboard.writeText('curl -o- https://fnm.vercel.app/install | bash')}
                    >
                      复制
                    </Button>
                  </Space.Compact>
                </div>
                <div>
                  <Text strong>或使用 Homebrew:</Text>
                  <Space.Compact style={{ width: '100%', marginTop: 8 }}>
                    <Code
                      style={{ flex: 1, padding: '8px 12px', fontSize: 14 }}
                    >{`brew install fnm`}</Code>
                    <Button
                      size="small"
                      icon={<Copy size={14} />}
                      onClick={() => navigator.clipboard.writeText('brew install fnm')}
                    >
                      复制
                    </Button>
                  </Space.Compact>
                </div>
              </Space>
            </Card>
          </div>

          <div>
            <Title level={5}>2. 常用命令</Title>
            <Card size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div>
                  <Text>查看已安装版本:</Text>
                  <Code
                    copyable
                    style={{ marginLeft: 8, display: 'block', marginTop: 4 }}
                  >{`fnm list`}</Code>
                </div>
                <div>
                  <Text>安装指定版本:</Text>
                  <Code
                    copyable
                    style={{ marginLeft: 8, display: 'block', marginTop: 4 }}
                  >{`fnm install 20`}</Code>
                </div>
                <div>
                  <Text>切换版本:</Text>
                  <Code
                    copyable
                    style={{ marginLeft: 8, display: 'block', marginTop: 4 }}
                  >{`fnm use 20`}</Code>
                </div>
                <div>
                  <Text>设置默认版本:</Text>
                  <Code
                    copyable
                    style={{ marginLeft: 8, display: 'block', marginTop: 4 }}
                  >{`fnm default 20`}</Code>
                </div>
              </Space>
            </Card>
          </div>

          <div>
            <Title level={5}>3. 项目配置</Title>
            <Paragraph>
              在项目根目录创建 <Code>.nvmrc</Code> 文件，写入需要的 Node 版本号：
            </Paragraph>
            <Card size="small">
              <Code
                copyable
                style={{ fontSize: 13 }}
              >{`20\n# 或指定完整版本号\n20.0.0`}</Code>
            </Card>
          </div>
        </Space>
      ),
    },
    {
      title: '使用 VSCode 扩展',
      description: '在 VSCode 中管理项目 Node 版本',
      content: (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="VSCode 扩展推荐"
            description="如果你使用 VSCode，可以安装我们的扩展，在侧边栏直接管理项目 Node 版本。"
            type="success"
            showIcon
          />

          <Card size="small" title="安装扩展">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>1. 打开 VSCode</Text>
              </div>
              <div>
                <Text>2. 按 <Code>Cmd+Shift+X</Code> (macOS) 打开扩展面板</Text>
              </div>
              <div>
                <Text>3. 搜索 <Code>AI Tools Manager</Code></Text>
              </div>
              <div>
                <Text>4. 点击安装</Text>
              </div>
            </Space>
          </Card>

          <Space>
            <Button
              type="primary"
              icon={<BookOpen size={16} />}
              href="https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-tools-manager"
              target="_blank"
            >
              查看扩展详情
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="Node 版本管理需要桌面应用或命令行"
        description="Web 环境无法执行系统命令。请选择以下方式之一来管理 Node 版本："
        type="info"
        showIcon
      />

      <Card>
        <Steps
          direction="vertical"
          current={-1}
          items={steps.map((step, index) => ({
            title: step.title,
            description: step.description,
            icon: index === 0 ? <Download size={18} /> : index === 1 ? <Terminal size={18} /> : <BookOpen size={18} />,
            status: 'process',
          }))}
        />
      </Card>

      <Card title="相关资源">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <Tag color="blue">FNM 文档</Tag>
            <a
              href="https://fnm.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 8 }}
            >
              https://fnm.vercel.app
            </a>
          </div>
          <div>
            <Tag color="green">Node.js 官网</Tag>
            <a
              href="https://nodejs.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 8 }}
            >
              https://nodejs.org
            </a>
          </div>
          <div>
            <Tag color="purple">VSCode 扩展</Tag>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-tools-manager"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 8 }}
            >
              AI Tools Manager 扩展
            </a>
          </div>
        </Space>
      </Card>
    </Space>
  );
}

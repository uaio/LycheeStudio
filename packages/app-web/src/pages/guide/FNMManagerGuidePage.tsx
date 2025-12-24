/**
 * FNM 安装指引页面
 */

import { Card, Tabs, Button, Space, Alert, Typography, Code } from 'antd';
import {
  Terminal,
  Copy,
  Download,
  BookOpen,
  Homebrew,
  Package,
} from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';

const { Title, Paragraph, Text, Link } = Typography;

interface Props {
  adapter: PlatformAdapter | null;
}

export default function FNMManagerGuidePage({ adapter }: Props) {
  const installMethods = [
    {
      key: 'curl',
      label: '使用 curl 安装',
      icon: <Terminal size={16} />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="推荐方式"
            description="这是 FNM 官方推荐的快速安装方式"
            type="success"
            showIcon
          />

          <Card size="small" title="安装命令">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                执行以下命令一键安装 FNM：
              </Paragraph>
              <Space.Compact style={{ width: '100%' }}>
                <Code
                  style={{ flex: 1, padding: '12px', fontSize: 14 }}
                >{`curl -o- https://fnm.vercel.app/install | bash`}</Code>
                <Button
                  icon={<Copy size={14} />}
                  onClick={() => navigator.clipboard.writeText('curl -o- https://fnm.vercel.app/install | bash')}
                >
                  复制
                </Button>
              </Space.Compact>

              <Paragraph style={{ marginTop: 16 }}>
                <Text strong>安装后配置：</Text>
              </Paragraph>
              <Space.Compact style={{ width: '100%' }}>
                <Code
                  style={{ flex: 1, padding: '12px', fontSize: 14 }}
                >{`eval "$(fnm env --use-on-cd)"`}</Code>
                <Button
                  icon={<Copy size={14} />}
                  onClick={() => navigator.clipboard.writeText('eval "$(fnm env --use-on-cd)"')}
                >
                  复制
                </Button>
              </Space.Compact>
              <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
                将以上命令添加到你的 shell 配置文件（~/.bashrc、~/.zshrc 等）
              </Paragraph>
            </Space>
          </Card>
        </Space>
      ),
    },
    {
      key: 'brew',
      label: '使用 Homebrew 安装',
      icon: <Homebrew size={16} />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="macOS 用户推荐"
            description="如果你已经安装了 Homebrew，这是最简单的方式"
            type="info"
            showIcon
          />

          <Card size="small" title="安装命令">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>使用 Homebrew 安装 FNM：</Paragraph>
              <Space.Compact style={{ width: '100%' }}>
                <Code
                  style={{ flex: 1, padding: '12px', fontSize: 14 }}
                >{`brew install fnm`}</Code>
                <Button
                  icon={<Copy size={14} />}
                  onClick={() => navigator.clipboard.writeText('brew install fnm')}
                >
                  复制
                </Button>
              </Space.Compact>

              <Paragraph style={{ marginTop: 16 }}>
                <Text strong>配置 shell：</Text>
              </Paragraph>
              <Space.Compact style={{ width: '100%' }}>
                <Code
                  style={{ flex: 1, padding: '12px', fontSize: 14 }}
                >{`eval "$(fnm env --use-on-cd)"`}</Code>
                <Button
                  icon={<Copy size={14} />}
                  onClick={() => navigator.clipboard.writeText('eval "$(fnm env --use-on-cd)"')}
                >
                  复制
                </Button>
              </Space.Compact>
            </Space>
          </Card>
        </Space>
      ),
    },
    {
      key: 'manual',
      label: '手动安装',
      icon: <Package size={16} />,
      content: (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message="高级用户"
            description="如果你想手动控制安装过程"
            type="warning"
            showIcon
          />

          <Card size="small" title="安装步骤">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>1. 下载最新版本</Text>
                <Code
                  copyable
                  style={{ marginLeft: 16, display: 'block', marginTop: 4 }}
                >{`wget https://github.com/Schniz/fnm/releases/latest/download/fnm.zip`}</Code>
              </div>
              <div>
                <Text strong>2. 解压文件</Text>
                <Code
                  copyable
                  style={{ marginLeft: 16, display: 'block', marginTop: 4 }}
                >{`unzip fnm.zip`}</Code>
              </div>
              <div>
                <Text strong>3. 添加到 PATH</Text>
                <Paragraph copyable style={{ marginLeft: 16, marginTop: 4 }}>
                  将解压后的 fnm 路径添加到你的 PATH 环境变量
                </Paragraph>
              </div>
            </Space>
          </Card>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="FNM 需要在终端中安装"
        description="Web 环境无法执行系统命令。请选择以下方式之一安装 FNM："
        type="info"
        showIcon
      />

      <Card title="FNM 安装指南">
        <Tabs
          defaultActiveKey="curl"
          items={installMethods}
          size="large"
        />
      </Card>

      <Card title="为什么选择 FNM？">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <CheckCircle size={16} style={{ marginRight: 8, color: '#52c41a' }} />
            <Text>快速切换 Node 版本</Text>
          </div>
          <div>
            <CheckCircle size={16} style={{ marginRight: 8, color: '#52c41a' }} />
            <Text>支持 .nvmrc 项目配置文件</Text>
          </div>
          <div>
            <CheckCircle size={16} style={{ marginRight: 8, color: '#52c41a' }} />
            <Text>跨平台支持（macOS、Linux、WSL）</Text>
          </div>
          <div>
            <CheckCircle size={16} style={{ marginRight: 8, color: '#52c41a' }} />
            <Text>比 nvm 更快的性能</Text>
          </div>
        </Space>
      </Card>

      <Card title="相关链接">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Link href="https://fnm.vercel.app" target="_blank">
            FNM 官方文档
          </Link>
          <Link href="https://github.com/Schniz/fnm" target="_blank">
            FNM GitHub 仓库
          </Link>
          <Link href="https://brew.sh/" target="_blank">
            Homebrew 官网
          </Link>
        </Space>
      </Card>
    </Space>
  );
}

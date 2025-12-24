/**
 * 首页
 */

import { Card, Row, Col, Alert, Space, Typography, Button, Tag } from 'antd';
import {
  Check,
  Download,
  ExternalLink,
  Github,
  Monitor,
  Code,
  Globe,
  BookOpen,
} from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';

const { Title, Paragraph, Text } = Typography;

interface Props {
  adapter: PlatformAdapter | null;
}

export default function HomePage({ adapter }: Props) {
  const platforms = [
    {
      name: '桌面应用',
      icon: <Monitor size={24} />,
      description: '完整功能，支持所有系统命令',
      features: ['Node 版本管理', 'FNM 管理', 'Claude 配置', 'MCP 服务', '工具安装'],
      color: 'purple',
      action: '下载桌面应用',
    },
    {
      name: 'VSCode 扩展',
      icon: <Code size={24} />,
      description: '项目级配置，集成到开发环境',
      features: ['项目 Node 版本', 'Claude 配置快捷访问', '终端集成'],
      color: 'blue',
      action: '安装扩展',
    },
    {
      name: 'Web 版本',
      icon: <Globe size={24} />,
      description: '在线访问，查看配置和指引',
      features: ['配置预览', '安装指引', '功能文档'],
      color: 'green',
      action: '当前页面',
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card>
        <Title level={2}>欢迎使用 AI Tools Manager</Title>
        <Paragraph>
          AI 工具管理器帮助你管理开发环境中的 AI 工具，包括 Node.js 版本管理、
          Claude Code 配置、MCP 服务等。
        </Paragraph>
      </Card>

      <Title level={4}>选择你的平台</Title>
      <Row gutter={[16, 16]}>
        {platforms.map((platform) => (
          <Col xs={24} sm={8} key={platform.name}>
            <Card
              hoverable
              style={{ height: '100%', borderColor: platform.color === 'green' ? '#52c41a' : undefined }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ color: platform.color === 'purple' ? '#7c4dff' : platform.color === 'blue' ? '#1890ff' : '#52c41a' }}>
                    {platform.icon}
                  </div>
                  <Title level={5} style={{ margin: 0 }}>
                    {platform.name}
                  </Title>
                </div>

                <Paragraph style={{ marginBottom: 8, fontSize: 13 }}>
                  {platform.description}
                </Paragraph>

                <div style={{ marginBottom: 12 }}>
                  {platform.features.map(feature => (
                    <Tag key={feature} color={platform.color === 'green' ? 'default' : platform.color}>
                      {feature}
                    </Tag>
                  ))}
                </div>

                {platform.action !== '当前页面' && (
                  <Button
                    type={platform.color === 'purple' ? 'primary' : 'default'}
                    size="small"
                    icon={platform.color === 'purple' ? <Download size={14} /> : <ExternalLink size={14} />}
                    href={platform.color === 'purple' ? 'https://github.com/your-repo/releases' : 'https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-tools-manager'}
                    target="_blank"
                  >
                    {platform.action}
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="快速开始">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <Text strong>1. 下载桌面应用</Text>
            <Paragraph style={{ marginBottom: 0 }}>
              获取完整功能，包括 Node 版本管理和工具安装
            </Paragraph>
          </div>
          <div>
            <Text strong>2. 安装 VSCode 扩展（可选）</Text>
            <Paragraph style={{ marginBottom: 0 }}>
              在开发环境中直接管理项目配置
            </Paragraph>
          </div>
          <div>
            <Text strong>3. 查看功能指引</Text>
            <Paragraph style={{ marginBottom: 0 }}>
              通过左侧菜单访问各个功能的详细说明
            </Paragraph>
          </div>
        </Space>
      </Card>

      <Card title="核心功能">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card size="small" hoverable>
              <Space direction="vertical" size="small">
                <Hexagon size={24} style={{ color: '#7c4dff' }} />
                <Text strong>Node 管理</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  安装、切换 Node 版本
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" hoverable>
              <Space direction="vertical" size="small">
                <Bot size={24} style={{ color: '#1890ff' }} />
                <Text strong>Claude 配置</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  模型、Provider 配置
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" hoverable>
              <Space direction="vertical" size="small">
                <FileText size={24} style={{ color: '#52c41a' }} />
                <Text strong>Prompt 管理</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  CLAUDE.md 模板
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" hoverable>
              <Space direction="vertical" size="small">
                <Server size={24} style={{ color: '#fa8c16' }} />
                <Text strong>MCP 服务</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  服务配置管理
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="相关资源">
        <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
          <Button
            type="link"
            icon={<Github size={16} />}
            href="https://github.com/your-repo"
            target="_blank"
          >
            GitHub 仓库
          </Button>
          <Button
            type="link"
            icon={<BookOpen size={16} />}
            href="https://docs.anthropic.com"
            target="_blank"
          >
            Claude 文档
          </Button>
          <Button
            type="link"
            icon={<ExternalLink size={16} />}
            href="https://fnm.vercel.app"
            target="_blank"
          >
            FNM 文档
          </Button>
        </Space>
      </Card>
    </Space>
  );
}

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
  Hexagon,
  Bot,
  FileText,
  Server,
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
      icon: <Monitor size={28} />,
      description: '完整功能，支持所有系统命令',
      features: ['Node 版本管理', 'FNM 管理', 'Claude 配置', 'MCP 服务', '工具安装'],
      themeColor: '#7c4dff',
      badge: '推荐',
      badgeColor: '#7c4dff',
      action: '下载桌面应用',
      actionHref: 'https://github.com/your-repo/releases',
    },
    {
      name: 'VSCode 扩展',
      icon: <Code size={28} />,
      description: '项目级配置，集成到开发环境',
      features: ['项目 Node 版本', 'Claude 配置快捷访问', '终端集成'],
      themeColor: '#1890ff',
      badge: '开发者',
      badgeColor: '#1890ff',
      action: '安装扩展',
      actionHref: 'https://marketplace.visualstudio.com/items?itemName=your-publisher.ai-tools-manager',
    },
    {
      name: 'Web 版本',
      icon: <Globe size={28} />,
      description: '在线访问，查看配置和指引',
      features: ['配置预览', '安装指引', '功能文档'],
      themeColor: '#52c41a',
      badge: '当前',
      badgeColor: '#52c41a',
      action: null,
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      {/* 欢迎横幅 */}
      <Card style={{
        background: 'linear-gradient(135deg, #f0f9f0 0%, #e6f7ff 100%)',
        border: '1px solid #d9f7be',
      }}>
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0, color: '#262626' }}>
            🌿 欢迎使用 AI Tools Manager
          </Title>
          <Paragraph style={{ marginBottom: 0, fontSize: 15, color: '#595959' }}>
            AI 工具管理器帮助你管理开发环境中的 AI 工具，包括 Node.js 版本管理、
            Claude Code 配置、MCP 服务等。
          </Paragraph>
        </Space>
      </Card>

      {/* 平台选择 */}
      <Title level={4}>选择你的平台</Title>
      <Row gutter={[20, 20]}>
        {platforms.map((platform) => (
          <Col xs={24} sm={8} key={platform.name}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderColor: platform.badge === '当前' ? platform.themeColor : undefined,
                borderWidth: platform.badge === '当前' ? 2 : 1,
                borderRadius: 12,
                overflow: 'hidden',
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: 10,
                    background: `${platform.themeColor}15`,
                  }}>
                    <span style={{ color: platform.themeColor }}>
                      {platform.icon}
                    </span>
                  </div>
                  <Tag color={platform.badgeColor} style={{ margin: 0 }}>
                    {platform.badge}
                  </Tag>
                </div>

                <Title level={5} style={{ margin: 0, fontSize: 16 }}>
                  {platform.name}
                </Title>

                <Paragraph style={{ marginBottom: 8, fontSize: 13, color: '#8c8c8c' }}>
                  {platform.description}
                </Paragraph>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {platform.features.map(feature => (
                    <Tag key={feature} style={{
                      margin: 0,
                      fontSize: 11,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      {feature}
                    </Tag>
                  ))}
                </div>

                {platform.action && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<Download size={14} />}
                    href={platform.actionHref}
                    target="_blank"
                    style={{
                      background: platform.themeColor,
                      borderColor: platform.themeColor,
                    }}
                  >
                    {platform.action}
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速开始 */}
      <Card title={
        <span style={{ color: '#52c41a' }}>
          🚀 快速开始
        </span>
      } style={{ borderRadius: 12 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#7c4dff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              flexShrink: 0,
            }}>1</div>
            <div style={{ flex: 1 }}>
              <Text strong>下载桌面应用</Text>
              <Paragraph style={{ marginBottom: 0, fontSize: 13, color: '#8c8c8c' }}>
                获取完整功能，包括 Node 版本管理和工具安装
              </Paragraph>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#1890ff',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              flexShrink: 0,
            }}>2</div>
            <div style={{ flex: 1 }}>
              <Text strong>安装 VSCode 扩展（可选）</Text>
              <Paragraph style={{ marginBottom: 0, fontSize: 13, color: '#8c8c8c' }}>
                在开发环境中直接管理项目配置
              </Paragraph>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#52c41a',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              flexShrink: 0,
            }}>3</div>
            <div style={{ flex: 1 }}>
              <Text strong>查看功能指引</Text>
              <Paragraph style={{ marginBottom: 0, fontSize: 13, color: '#8c8c8c' }}>
                通过左侧菜单访问各个功能的详细说明
              </Paragraph>
            </div>
          </div>
        </Space>
      </Card>

      {/* 核心功能 */}
      <Card title={
        <span style={{ color: '#52c41a' }}>
          ⚡ 核心功能
        </span>
      } style={{ borderRadius: 12 }}>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              hoverable
              style={{ borderRadius: 8, textAlign: 'center' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <Space direction="vertical" size="small">
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <Hexagon size={24} style={{ color: '#7c4dff' }} />
                </div>
                <Text strong>Node 管理</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  安装、切换 Node 版本
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              hoverable
              style={{ borderRadius: 8, textAlign: 'center' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <Space direction="vertical" size="small">
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <Bot size={24} style={{ color: '#1890ff' }} />
                </div>
                <Text strong>Claude 配置</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  模型、Provider 配置
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              hoverable
              style={{ borderRadius: 8, textAlign: 'center' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <Space direction="vertical" size="small">
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <FileText size={24} style={{ color: '#52c41a' }} />
                </div>
                <Text strong>Prompt 管理</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  CLAUDE.md 模板
                </Text>
              </Space>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              size="small"
              hoverable
              style={{ borderRadius: 8, textAlign: 'center' }}
              bodyStyle={{ padding: '16px 12px' }}
            >
              <Space direction="vertical" size="small">
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                }}>
                  <Server size={24} style={{ color: '#fa8c16' }} />
                </div>
                <Text strong>MCP 服务</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  服务配置管理
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 相关资源 */}
      <Card title={
        <span style={{ color: '#52c41a' }}>
          📚 相关资源
        </span>
      } style={{ borderRadius: 12 }}>
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

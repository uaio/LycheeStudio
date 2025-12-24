/**
 * 首页 - 功能说明和平台对比
 */

import { Card, Row, Col, Alert, Space, Typography, Tag, Button } from 'antd';
import {
  Check,
  X,
  Hexagon,
  Bot,
  FileText,
  Server,
  AlertTriangle,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';

const { Title, Paragraph, Text } = Typography;

interface Props {
  adapter: PlatformAdapter | null;
}

export default function HomePage({ adapter }: Props) {
  const features = [
    {
      category: 'Node 版本管理',
      items: [
        { name: '查看已安装版本', desktop: true, vscode: true, web: false },
        { name: '安装新版本', desktop: true, vscode: true, web: false },
        { name: '切换 Node 版本', desktop: true, vscode: true, web: false },
        { name: '项目级版本配置', desktop: true, vscode: true, web: false },
      ],
      icon: <Hexagon size={20} />,
    },
    {
      category: 'Claude 配置',
      items: [
        { name: '模型配置', desktop: true, vscode: true, web: true },
        { name: 'Provider 设置', desktop: true, vscode: true, web: true },
        { name: 'CLAUDE.md 编辑', desktop: true, vscode: true, web: true },
        { name: '提示词模板', desktop: true, vscode: true, web: true },
      ],
      icon: <Bot size={20} />,
    },
    {
      category: 'MCP 服务',
      items: [
        { name: '服务管理', desktop: true, vscode: true, web: true },
        { name: '推荐服务', desktop: true, vscode: true, web: true },
      ],
      icon: <Server size={20} />,
    },
    {
      category: '系统工具',
      items: [
        { name: '工具状态检查', desktop: true, vscode: true, web: false },
        { name: '工具安装', desktop: true, vscode: false, web: false },
      ],
      icon: <FileText size={20} />,
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="Web 版本功能说明"
        description={
          <Space direction="vertical" size="small">
            <div>
              由于浏览器安全限制，Web 版本无法执行系统命令。以下功能需要使用桌面版或
              VSCode 扩展。
            </div>
            <Button
              type="primary"
              size="small"
              icon={<Download size={14} />}
              href="https://github.com/your-repo/releases"
              target="_blank"
            >
              下载桌面应用
            </Button>
          </Space>
        }
        type="warning"
        showIcon
        icon={<AlertTriangle size={16} />}
      />

      <Title level={3}>功能对比</Title>

      {features.map((feature) => (
        <Card
          key={feature.category}
          title={
            <Space>
              {feature.icon}
              <span>{feature.category}</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={[16, 16]}>
            {feature.items.map((item) => (
              <Col xs={24} sm={12} md={12} key={item.name}>
                <div
                  style={{
                    padding: 12,
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    background: '#fafafa',
                  }}
                >
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>{item.name}</div>
                  <Space size="middle">
                    <Space size={4}>
                      <Text type="secondary">桌面版:</Text>
                      {item.desktop ? (
                        <Check size={16} style={{ color: '#52c41a' }} />
                      ) : (
                        <X size={16} style={{ color: '#d9d9d9' }} />
                      )}
                    </Space>
                    <Space size={4}>
                      <Text type="secondary">VSCode:</Text>
                      {item.vscode ? (
                        <Check size={16} style={{ color: '#52c41a' }} />
                      ) : (
                        <X size={16} style={{ color: '#d9d9d9' }} />
                      )}
                    </Space>
                    <Space size={4}>
                      <Text type="secondary">Web:</Text>
                      {item.web ? (
                        <Check size={16} style={{ color: '#52c41a' }} />
                      ) : (
                        <X size={16} style={{ color: '#ff4d4f' }} />
                      )}
                    </Space>
                  </Space>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      ))}

      <Card title="可用功能">
        <Paragraph>
          Web 版本提供以下配置管理功能，所有更改都会保存到浏览器本地存储：
        </Paragraph>
        <ul>
          <li>Claude 模型参数配置</li>
          <li>Claude Prompt 模板管理</li>
          <li>MCP 服务配置预览</li>
        </ul>
        <Alert
          message="提示"
          description="配置仅用于预览和参考，实际使用需要通过桌面应用写入配置文件"
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>
    </Space>
  );
}

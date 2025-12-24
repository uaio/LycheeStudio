/**
 * Claude 模型配置页面（Web 版 - 预览模式）
 */

import { Card, Form, InputNumber, Switch, Space, Alert } from 'antd';
import { Eye } from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';

interface Props {
  adapter: PlatformAdapter | null;
}

const mockModels = [
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    maxTokens: 200000,
    temperature: 0,
    enabled: true,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    temperature: 0,
    enabled: true,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 200000,
    temperature: 0,
    enabled: false,
  },
];

export default function ClaudeModelPage({ adapter }: Props) {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="Web 版本 - 预览模式"
        description="此页面仅用于预览配置。实际配置需要通过桌面应用修改。"
        type="info"
        showIcon
        icon={<Eye size={16} />}
      />

      <Card title="Claude 模型配置">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {mockModels.map((model) => (
            <Card
              key={model.id}
              size="small"
              title={model.name}
              style={{ background: '#fafafa' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Form.Item label="启用" valuePropName="checked" initialValue={model.enabled}>
                  <Switch disabled />
                </Form.Item>

                <Form.Item label="最大Token数" initialValue={model.maxTokens}>
                  <InputNumber disabled style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item label="温度" initialValue={model.temperature}>
                  <InputNumber disabled min={0} max={1} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Space>
            </Card>
          ))}
        </Space>
      </Card>
    </Space>
  );
}

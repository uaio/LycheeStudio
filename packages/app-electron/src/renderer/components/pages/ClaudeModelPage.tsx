/**
 * Claude 模型配置页面
 */

import { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Space,
  List,
  Tag,
  message,
  Divider,
} from 'antd';
import { Save, RefreshCw } from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';
import { ClaudeConfigManager } from '@ai-tools/core';
import { useClaudeConfig } from '@ai-tools/ui';

interface ClaudeModelPageProps {
  adapter: PlatformAdapter;
}

export default function ClaudeModelPage({ adapter }: ClaudeModelPageProps) {
  const { models, loading, refreshProvider, setModel } = useClaudeConfig({ adapter });

  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();

      // 保存每个启用的模型配置
      for (const model of models) {
        if (values[model.id]?.enabled) {
          const modelType = getModelType(model.id);
          await setModel(modelType, model.id);
        }
      }

      message.success('模型配置已保存');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const getModelType = (modelId: string): 'haiku' | 'sonnet' | 'opus' => {
    if (modelId.includes('haiku')) return 'haiku';
    if (modelId.includes('opus')) return 'opus';
    return 'sonnet';
  };

  const getProviderTag = (provider: string) => {
    const colors: Record<string, string> = {
      anthropic: 'purple',
      openai: 'green',
      google: 'blue',
    };
    return <Tag color={colors[provider] || 'default'}>{provider}</Tag>;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card
        title="Claude 模型配置"
        extra={
          <Space>
            <Button icon={<RefreshCw size={16} />} onClick={refreshProvider} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<Save size={16} />} onClick={handleSave} loading={saving}>
              保存配置
            </Button>
          </Space>
        }
      >
        <List
          loading={loading}
          dataSource={models}
          renderItem={model => (
            <List.Item>
              <Card
                size="small"
                title={model.name}
                style={{ width: '100%' }}
                extra={getProviderTag(model.provider)}
              >
                <Form.Item
                  name={[model.id, 'enabled']}
                  label="启用"
                  valuePropName="checked"
                  initialValue={model.enabled}
                  style={{ marginBottom: 8 }}
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name={[model.id, 'maxTokens']}
                  label="最大Token数"
                  initialValue={model.maxTokens}
                  style={{ marginBottom: 8 }}
                >
                  <InputNumber min={1} max={200000} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                  name={[model.id, 'temperature']}
                  label="温度"
                  initialValue={model.temperature}
                  style={{ marginBottom: 0 }}
                >
                  <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
                </Form.Item>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Card title="配置说明">
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div>
            <strong>模型类型：</strong>
            <ul>
              <li>Haiku - 快速响应，适合简单任务</li>
              <li>Sonnet - 平衡性能和速度</li>
              <li>Opus - 最高质量，适合复杂任务</li>
            </ul>
          </div>
          <div>
            <strong>参数说明：</strong>
            <ul>
              <li>最大Token数 - 控制响应长度</li>
              <li>温度 - 控制输出随机性（0=确定性，1=创造性）</li>
            </ul>
          </div>
        </Space>
      </Card>
    </Space>
  );
}

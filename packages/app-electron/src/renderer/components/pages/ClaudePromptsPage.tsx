/**
 * Claude 提示词管理页面
 */

import { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  List,
  Tag,
  message,
  Modal,
  Divider,
} from 'antd';
import { Save, RefreshCw, FileText, Plus, Trash2 } from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';
import { PromptsManager } from '@ai-tools/core';
import { usePromptsManager } from '@ai-tools/ui';

const { TextArea } = Input;

interface ClaudePromptsPageProps {
  adapter: PlatformAdapter;
}

export default function ClaudePromptsPage({ adapter }: ClaudePromptsPageProps) {
  const { claudeMd, templates, loading, refresh, saveClaudeMd, applyTemplate } =
    usePromptsManager({ adapter });

  const [content, setContent] = useState(claudeMd);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveClaudeMd(content);
      setHasChanges(false);
      message.success('保存成功');
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      await applyTemplate(template);
      setContent(template.content);
      setHasChanges(true);
      message.success(`已应用模板: ${template.name}`);
    }
  };

  const builtinTemplates = templates.filter(t => t.isBuiltin);
  const userTemplates = templates.filter(t => !t.isBuiltin);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card
        title="CLAUDE.md 编辑"
        extra={
          <Space>
            <Button icon={<RefreshCw size={16} />} onClick={refresh} loading={loading}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={handleSave}
              loading={saving}
              disabled={!hasChanges}
            >
              保存
            </Button>
          </Space>
        }
      >
        <TextArea
          value={content}
          onChange={e => {
            setContent(e.target.value);
            setHasChanges(true);
          }}
          placeholder="在此输入 CLAUDE.md 内容..."
          style={{ minHeight: 400, fontFamily: 'monospace' }}
        />
        {hasChanges && (
          <div style={{ marginTop: 8, color: '#faad14' }}>
            有未保存的更改
          </div>
        )}
      </Card>

      <Card title="提示词模板">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <div style={{ marginBottom: 12, fontWeight: 'bold' }}>内置模板</div>
            <List
              dataSource={builtinTemplates}
              renderItem={template => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<FileText size={14} />}
                      onClick={() => handleApplyTemplate(template.id)}
                    >
                      应用
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={template.name}
                    description={template.description}
                  />
                  {template.tags.map(tag => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </List.Item>
              )}
            />
          </div>

          {userTemplates.length > 0 && (
            <>
              <Divider />
              <div>
                <div style={{ marginBottom: 12, fontWeight: 'bold' }}>我的模板</div>
                <List
                  dataSource={userTemplates}
                  renderItem={template => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          icon={<FileText size={14} />}
                          onClick={() => handleApplyTemplate(template.id)}
                        >
                          应用
                        </Button>,
                        <Button
                          type="link"
                          danger
                          icon={<Trash2 size={14} />}
                        >
                          删除
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={template.name}
                        description={template.description}
                      />
                    </List.Item>
                  )}
                />
              </div>
            </>
          )}
        </Space>
      </Card>
    </Space>
  );
}

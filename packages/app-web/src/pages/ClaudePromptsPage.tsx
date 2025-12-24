/**
 * Claude Prompts 页面（Web 版 - 预览模式）
 */

import { useState } from 'react';
import { Card, Input, Button, Space, List, Tag, Alert, Modal } from 'antd';
import { Eye, Save, FileCopy } from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';

const { TextArea } = Input;

interface Props {
  adapter: PlatformAdapter | null;
}

const mockTemplates = [
  {
    id: 'builtin_development',
    name: '开发指南',
    description: '通用开发项目指南',
    content: '# Development Guidelines\n\n## Philosophy\n\n- Incremental progress over big bangs\n- Learning from existing code\n...',
    isBuiltin: true,
  },
  {
    id: 'builtin_code_review',
    name: '代码审查',
    description: '代码审查指南',
    content: '# Code Review Guidelines\n\n## Review Process\n\n1. Understand the context\n...',
    isBuiltin: true,
  },
];

export default function ClaudePromptsPage({ adapter }: Props) {
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const handleApplyTemplate = (templateContent: string) => {
    setContent(templateContent);
    setHasChanges(true);
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="Web 版本 - 预览模式"
        description="此页面仅用于预览和管理提示词模板。实际编辑需要通过桌面应用或 VSCode。"
        type="info"
        showIcon
        icon={<Eye size={16} />}
      />

      <Card title="CLAUDE.md 编辑器">
        <TextArea
          value={content}
          onChange={e => {
            setContent(e.target.value);
            setHasChanges(true);
          }}
          placeholder="在此输入 CLAUDE.md 内容..."
          style={{ minHeight: 400, fontFamily: 'monospace' }}
          disabled
        />
        {hasChanges && (
          <div style={{ marginTop: 8, color: '#faad14' }}>
            预览模式 - 无法保存
          </div>
        )}
      </Card>

      <Card title="提示词模板">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <div style={{ marginBottom: 12, fontWeight: 'bold' }}>内置模板</div>
            <List
              dataSource={mockTemplates}
              renderItem={template => (
                <List.Item>
                  <List.Item.Meta
                    title={template.name}
                    description={template.description}
                  />
                  <Button
                    type="link"
                    icon={<FileCopy size={14} />}
                    onClick={() => handleApplyTemplate(template.content)}
                  >
                    预览
                  </Button>
                </List.Item>
              )}
            />
          </div>
        </Space>
      </Card>
    </Space>
  );
}

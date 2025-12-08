/**
 * Claude全局提示词管理器主组件
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Button,
  Space,
  Typography,
  Modal,
  Alert,
  Spin,
  Tooltip,
  App
} from 'antd';
import {
  Save,
  RefreshCw,
  FileText,
  Plus,
  Copy,
  Download,
  Upload
} from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';
import TemplateModal from './TemplateModal';
import { ClaudePromptsManagerProps, PromptTemplate } from '../types/prompts';
import { promptsStorage } from '../utils/promptsStorage';
import { BUILTIN_TEMPLATES } from '../data/builtinTemplates';

const { Content } = Layout;
const { Text } = Typography;

const ClaudePromptsManager: React.FC<ClaudePromptsManagerProps> = ({
  isDarkMode,
  collapsed = false
}) => {
  // 消息API
  const { message } = App.useApp();

  // 状态管理
  const [currentContent, setCurrentContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateLibraryVisible, setTemplateLibraryVisible] = useState<boolean>(false);

  // 初始化内置模板
  useEffect(() => {
    promptsStorage.setBuiltinTemplates(BUILTIN_TEMPLATES);
  }, []);

  // 加载初始数据
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // 并行加载CLAUDE.md内容和模板数据
      const [claudeMdContent, allTemplates] = await Promise.all([
        promptsStorage.loadClaudeMd(),
        promptsStorage.getAllTemplates()
      ]);

      setCurrentContent(claudeMdContent);
      setOriginalContent(claudeMdContent);
      setTemplates(allTemplates);

      // 只在首次加载时显示成功消息
      if (originalContent === '') {
        message.success('数据加载成功');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [message, originalContent]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 刷新数据
  const handleRefresh = async () => {
    await loadInitialData();
  };

  // 处理模板选择
  const handleSelectTemplate = (template: PromptTemplate, mode: 'overwrite' | 'append' = 'overwrite') => {
    if (mode === 'overwrite') {
      Modal.confirm({
        title: '确认操作',
        content: `选择"${template.name}"模板将覆盖当前内容，是否继续？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          setCurrentContent(template.content);
          setSelectedTemplate(template);
          message.success(`已应用模板: ${template.name}`);
        }
      });
    } else {
      // 追加模式
      const newContent = currentContent + '\n\n' + template.content;
      setCurrentContent(newContent);
      setSelectedTemplate(template);
      message.success(`已追加模板: ${template.name}`);
    }
  };

  // 处理内容变化
  const handleContentChange = (content: string) => {
    setCurrentContent(content);
    setSelectedTemplate(null); // 清除选中的模板
  };

  // 处理保存
  const handleSave = async () => {
    if (currentContent === originalContent) {
      message.info('内容没有变化，无需保存');
      return;
    }

    Modal.confirm({
      title: '确认保存',
      content: '这将直接覆盖 ~/.claude/CLAUDE.md 文件，确定要继续吗？',
      okText: '确认保存',
      cancelText: '取消',
      onOk: async () => {
        setSaving(true);
        try {
          const result = await promptsStorage.saveClaudeMd(currentContent);
          if (result.success) {
            setOriginalContent(currentContent);
            message.success('保存成功');
          } else {
            message.error(`保存失败: ${result.error}`);
          }
        } catch (error) {
          console.error('保存CLAUDE.md失败:', error);
          message.error('保存过程中出现错误');
        } finally {
          setSaving(false);
        }
      }
    });
  };

  // 处理添加模板
  const handleAddTemplate = async (templateData: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltin'>) => {
    try {
      const success = await promptsStorage.addUserTemplate(templateData);
      if (success) {
        const updatedTemplates = await promptsStorage.getAllTemplates();
        setTemplates(updatedTemplates);
        message.success('模板添加成功');
      } else {
        message.error('模板添加失败');
      }
    } catch (error) {
      console.error('添加模板失败:', error);
      message.error('添加模板过程中出现错误');
    }
  };

  // 处理编辑模板
  const handleEditTemplate = async (updatedTemplate: PromptTemplate) => {
    try {
      const success = await promptsStorage.updateUserTemplate(updatedTemplate);
      if (success) {
        const updatedTemplates = await promptsStorage.getAllTemplates();
        setTemplates(updatedTemplates);
        message.success('模板更新成功');
      } else {
        message.error('模板更新失败');
      }
    } catch (error) {
      console.error('更新模板失败:', error);
      message.error('更新模板过程中出现错误');
    }
  };

  // 处理删除模板
  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const success = await promptsStorage.deleteUserTemplate(templateId);
      if (success) {
        const updatedTemplates = await promptsStorage.getAllTemplates();
        setTemplates(updatedTemplates);
        message.success('模板删除成功');
      } else {
        message.error('模板删除失败');
      }
    } catch (error) {
      console.error('删除模板失败:', error);
      message.error('删除模板过程中出现错误');
    }
  };

  // 检查是否有未保存的更改
  const hasUnsavedChanges = currentContent !== originalContent;

  return (
    <Layout style={{
      height: '100%',
      background: 'transparent',
      width: '100%'
    }}>
      <div style={{
        height: '100%',
        margin: '16px',
        background: isDarkMode ? '#1f1f1f' : '#ffffff',
        borderRadius: '12px',
        boxShadow: isDarkMode
          ? '0 4px 16px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        border: isDarkMode ? '1px solid #404040' : '1px solid #e0e0e0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 简化的顶部工具栏 */}
        <div
          style={{
            padding: '12px 24px',
            background: 'transparent',
            borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 'auto',
            minHeight: '48px'
          }}
        >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={20} color={isDarkMode ? '#ffffff' : '#000000'} />
          <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '14px' }}>
            CLAUDE.md
          </Text>
          {selectedTemplate && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              当前: {selectedTemplate.name}
            </Text>
          )}
        </div>

        <Space size="small">
          {hasUnsavedChanges && (
            <Alert
              message="未保存"
              type="warning"
              showIcon
              style={{ padding: '2px 8px', fontSize: '12px', height: '28px', display: 'flex', alignItems: 'center' }}
            />
          )}
          <Button
            icon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            loading={loading}
            size="small"
          >
            刷新
          </Button>
          <Button
            icon={<Plus size={16} />}
            size="small"
            onClick={() => setTemplateLibraryVisible(true)}
          >
            模板
          </Button>
          <Tooltip title="复制内容">
            <Button
              icon={<Copy size={16} />}
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(currentContent);
                message.success('内容已复制到剪贴板');
              }}
            />
          </Tooltip>
          <Tooltip title="导出文件">
            <Button
              icon={<Download size={16} />}
              size="small"
              onClick={() => {
                const blob = new Blob([currentContent], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'CLAUDE.md';
                a.click();
                URL.revokeObjectURL(url);
                message.success('文件导出成功');
              }}
            />
          </Tooltip>
          <Tooltip title="导入文件">
            <Button
              icon={<Upload size={16} />}
              size="small"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.md';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const content = e.target?.result as string;
                      setCurrentContent(content);
                      message.success('文件导入成功');
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<Save size={16} />}
            onClick={handleSave}
            loading={saving}
            disabled={!hasUnsavedChanges}
            size="small"
          >
            保存
          </Button>
        </Space>
      </div>

      <Content style={{
        padding: '0 0 32px 0',
        overflow: 'hidden',
        background: 'transparent'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100% - 64px)',
            gap: '16px'
          }}>
            <Spin size="large" />
            <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
              加载中...
            </span>
          </div>
        ) : (
          <div style={{
            height: 'calc(100% - 64px)',
            overflow: 'hidden'
          }}>
            <MarkdownEditor
              value={currentContent}
              onChange={handleContentChange}
              isDarkMode={isDarkMode}
              placeholder="在此编辑 Claude 全局提示词..."
              height="100%"
            />
          </div>
        )}
      </Content>
      </div>

      {/* 模板管理模态框 */}
      <TemplateModal
        visible={templateLibraryVisible}
        onClose={() => setTemplateLibraryVisible(false)}
        templates={templates}
        onAddTemplate={handleAddTemplate}
        onEditTemplate={handleEditTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onSelectTemplate={handleSelectTemplate}
        isDarkMode={isDarkMode}
      />
    </Layout>
  );
};

export default ClaudePromptsManager;
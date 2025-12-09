/**
 * Claude全局提示词管理器主组件
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Button,
  Typography,
  Modal,
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
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  // 初始化内置模板
  useEffect(() => {
    promptsStorage.setBuiltinTemplates(BUILTIN_TEMPLATES);
  }, []);

  // 加载初始数据
  const loadInitialData = useCallback(async (showSuccessMessage = false) => {
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

      // 只在明确要求时显示成功消息，避免首次加载时的重复提示
      if (showSuccessMessage) {
        message.success('数据加载成功');
      } else if (isInitialLoad) {
        // 首次加载静默完成，只标记状态
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [message, isInitialLoad]);

  // 组件挂载时加载数据
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 刷新数据
  const handleRefresh = async () => {
    await loadInitialData(true);
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

    // 先检查CLAUDE.md文件是否存在
    const checkResult = await promptsStorage.checkClaudeMdExists();

    if (checkResult.success && checkResult.exists) {
      // 文件存在，询问是否覆盖
      Modal.confirm({
        title: '确认覆盖',
        content: 'CLAUDE.md 文件已存在，是否覆盖现有内容？',
        okText: '是',
        cancelText: '否',
        onOk: async () => {
          setSaving(true);
          try {
            const result = await promptsStorage.saveClaudeMd(currentContent);
            if (result.success) {
              setOriginalContent(currentContent);
              message.success('文件覆盖成功');
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
    } else {
      // 文件不存在，直接保存
      setSaving(true);
      try {
        const result = await promptsStorage.saveClaudeMd(currentContent);
        if (result.success) {
          setOriginalContent(currentContent);
          message.success('文件创建成功');
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
        {/* 精致的顶部工具栏 */}
        <div
          style={{
            padding: '8px 16px',
            background: isDarkMode ? 'linear-gradient(to right, #2a2a2a, #1f1f1f)' : 'linear-gradient(to right, #fafafa, #f5f5f5)',
            borderBottom: isDarkMode ? '1px solid #404040' : '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '48px',
            boxShadow: isDarkMode
              ? 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 1px 3px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* 左侧标题区域 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: 1
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
              borderRadius: '20px',
              border: isDarkMode ? '1px solid #404040' : '1px solid #e0e0e0'
            }}>
              <FileText size={18} style={{
                color: isDarkMode ? '#1890ff' : '#0969da',
                flexShrink: 0
              }} />
              <Text strong style={{
                color: isDarkMode ? '#ffffff' : '#24292f',
                fontSize: '14px',
                letterSpacing: '0.3px'
              }}>
                CLAUDE.md
              </Text>
            </div>

            {selectedTemplate && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: isDarkMode ? 'rgba(24, 144, 255, 0.1)' : 'rgba(9, 105, 218, 0.08)',
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? '#404040' : '#d0d7de'}`
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isDarkMode ? '#40a9ff' : '#0969da',
                  flexShrink: 0
                }} />
                <Text style={{
                  color: isDarkMode ? '#40a9ff' : '#0969da',
                  fontSize: '12px'
                }}>
                  {selectedTemplate.name}
                </Text>
              </div>
            )}
          </div>

          {/* 右侧操作按钮区域 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {hasUnsavedChanges && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: isDarkMode ? 'rgba(250, 173, 20, 0.1)' : 'rgba(255, 185, 0, 0.08)',
                borderRadius: '12px',
                border: `1px solid ${isDarkMode ? '#d48806' : '#d97706'}`,
                animation: 'pulse 2s infinite'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isDarkMode ? '#d48806' : '#d97706',
                  animation: 'pulse 1.5s infinite'
                }} />
                <Text style={{
                  color: isDarkMode ? '#d48806' : '#d97706',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  未保存
                </Text>
              </div>
            )}

            {/* 按钮组 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px',
              background: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '8px',
              border: isDarkMode ? '1px solid #333333' : '1px solid #e0e0e0'
            }}>
              <Tooltip title="刷新内容">
                <Button
                  type="text"
                  icon={<RefreshCw size={16} />}
                  onClick={handleRefresh}
                  loading={loading}
                  style={{
                    color: isDarkMode ? '#ffffff' : '#24292f',
                    borderRadius: '6px',
                    border: 'none',
                    boxShadow: 'none',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#404040' : '#f3f4f6';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </Tooltip>

              <Tooltip title="模板库">
                <Button
                  type="text"
                  icon={<Plus size={16} />}
                  onClick={() => setTemplateLibraryVisible(true)}
                  style={{
                    color: isDarkMode ? '#ffffff' : '#24292f',
                    borderRadius: '6px',
                    border: 'none',
                    boxShadow: 'none',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#404040' : '#f3f4f6';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </Tooltip>

              <div style={{
                width: '1px',
                height: '20px',
                background: isDarkMode ? '#404040' : '#d0d7de',
                margin: '0 4px'
              }} />

              <Tooltip title="复制全部内容">
                <Button
                  type="text"
                  icon={<Copy size={16} />}
                  onClick={() => {
                    navigator.clipboard.writeText(currentContent);
                    message.success('内容已复制到剪贴板');
                  }}
                  style={{
                    color: isDarkMode ? '#ffffff' : '#24292f',
                    borderRadius: '6px',
                    border: 'none',
                    boxShadow: 'none',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#404040' : '#f3f4f6';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </Tooltip>

              <Tooltip title="导出文件">
                <Button
                  type="text"
                  icon={<Download size={16} />}
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
                  style={{
                    color: isDarkMode ? '#ffffff' : '#24292f',
                    borderRadius: '6px',
                    border: 'none',
                    boxShadow: 'none',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#404040' : '#f3f4f6';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </Tooltip>

              <Tooltip title="导入文件">
                <Button
                  type="text"
                  icon={<Upload size={16} />}
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
                  style={{
                    color: isDarkMode ? '#ffffff' : '#24292f',
                    borderRadius: '6px',
                    border: 'none',
                    boxShadow: 'none',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#404040' : '#f3f4f6';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              </Tooltip>
            </div>

            {/* 保存按钮 - 特殊样式 */}
            <Button
              type="primary"
              icon={<Save size={16} />}
              onClick={handleSave}
              loading={saving}
              disabled={!hasUnsavedChanges}
              style={{
                borderRadius: '8px',
                boxShadow: hasUnsavedChanges ? '0 2px 8px rgba(24, 144, 255, 0.3)' : 'none',
                border: hasUnsavedChanges ? 'none' : undefined,
                height: '36px',
                paddingLeft: '16px',
                paddingRight: '16px',
                fontWeight: 500,
                transition: 'all 0.3s',
                transform: hasUnsavedChanges ? 'scale(1.02)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (!saving && hasUnsavedChanges) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = hasUnsavedChanges ? 'scale(1.02)' : 'scale(1)';
                e.currentTarget.style.boxShadow = hasUnsavedChanges ? '0 2px 8px rgba(24, 144, 255, 0.3)' : 'none';
              }}
            >
              保存
            </Button>
          </div>
        </div>

        {/* 添加脉冲动画的样式 */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0% {
                opacity: 1;
              }
              50% {
                opacity: 0.5;
              }
              100% {
                opacity: 1;
              }
            }
          `
        }} />

      <Content style={{
        padding: 0,
        overflow: 'hidden',
        background: 'transparent',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            gap: '16px'
          }}>
            <Spin size="large" />
            <span style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
              加载中...
            </span>
          </div>
        ) : (
          <div style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
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
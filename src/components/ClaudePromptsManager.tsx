/**
 * Claude全局提示词管理器主组件
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Space,
  Typography,
  message,
  Modal,
  Divider,
  Alert,
  Spin
} from 'antd';
import {
  Save,
  RefreshCw,
  FileText,
  Database,
  Info,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import MarkdownEditor from './MarkdownEditor';
import TemplateLibrary from './TemplateLibrary';
import { ClaudePromptsManagerProps, PromptTemplate } from '../types/prompts';
import { promptsStorage } from '../utils/promptsStorage';
import { BUILTIN_TEMPLATES } from '../data/builtinTemplates';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const ClaudePromptsManager: React.FC<ClaudePromptsManagerProps> = ({
  isDarkMode,
  collapsed = false
}) => {
  // 状态管理
  const [currentContent, setCurrentContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);

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

      message.success('数据加载成功');
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  // 组件挂载时加载数据
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 监听新建模板事件
  useEffect(() => {
    const triggerAddTemplate = () => {
      // 触发TemplateLibrary的新建模板功能
      const event = new CustomEvent('triggerAddTemplate');
      window.dispatchEvent(event);
    };

    window.addEventListener('addTemplate', triggerAddTemplate);
    return () => {
      window.removeEventListener('addTemplate', triggerAddTemplate);
    };
  }, []);

  // 刷新数据
  const handleRefresh = async () => {
    await loadInitialData();
  };

  // 处理模板选择
  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setCurrentContent(template.content);
    message.success(`已选择模板: ${template.name}`);
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
    <Layout style={{ height: '100%', background: 'transparent' }}>
      {/* 顶部工具栏 */}
      <Header
        style={{
          height: 'auto',
          padding: '16px 24px',
          background: 'transparent',
          borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8'
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <FileText size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
              <div>
                <Title level={4} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
                  全局提示词管理
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  管理Claude全局提示词模板
                </Text>
              </div>
            </Space>
          </Col>

          <Col>
            <Space>
              {hasUnsavedChanges && (
                <Alert
                  message="有未保存的更改"
                  type="warning"
                  showIcon
                  style={{ padding: '4px 8px', fontSize: '12px' }}
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
                type="primary"
                icon={<Save size={16} />}
                onClick={handleSave}
                loading={saving}
                disabled={!hasUnsavedChanges}
                size="small"
              >
                保存到CLAUDE.md
              </Button>
            </Space>
          </Col>
        </Row>
      </Header>

      <Content style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 当前编辑区域 */}
            <div style={{
              flex: 1,
              marginBottom: '16px',
              border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
              borderRadius: '8px',
              background: isDarkMode ? '#1f1f1f' : '#ffffff',
              overflow: 'hidden'
            }}>
              {/* 当前选中模板信息 */}
              {selectedTemplate && (
                <div style={{
                  padding: '12px 16px',
                  borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
                  background: isDarkMode ? '#2a2a2a' : '#f5f5f5'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle size={16} color="#52c41a" />
                    <div>
                      <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                        {selectedTemplate.name}
                      </Text>
                      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '2px' }}>
                        {selectedTemplate.description}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 编辑器 */}
              <div style={{ height: selectedTemplate ? 'calc(100% - 60px)' : '100%' }}>
                <MarkdownEditor
                  value={currentContent}
                  onChange={handleContentChange}
                  isDarkMode={isDarkMode}
                  placeholder="请选择模板或直接编辑内容..."
                  height="100%"
                />
              </div>
            </div>

            {/* 模板列表区域 */}
            <div style={{
              height: '300px',
              border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
              borderRadius: '8px',
              background: isDarkMode ? '#1f1f1f' : '#ffffff',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
                background: isDarkMode ? '#2a2a2a' : '#fafafa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Space>
                  <Database size={16} />
                  <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                    模板列表
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    (内置: {BUILTIN_TEMPLATES.length}, 自定义: {templates.length - BUILTIN_TEMPLATES.length})
                  </Text>
                </Space>
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  onClick={() => {
                    // 触发添加模板的模态框
                    const event = new CustomEvent('addTemplate');
                    window.dispatchEvent(event);
                  }}
                  size="small"
                >
                  新建模板
                </Button>
              </div>

              <div style={{ height: 'calc(100% - 53px)', overflow: 'auto' }}>
                <TemplateLibrary
                  templates={templates}
                  onSelectTemplate={handleSelectTemplate}
                  onAddTemplate={handleAddTemplate}
                  onEditTemplate={handleEditTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                  isDarkMode={isDarkMode}
                  loading={loading}
                  simplified={true}
                />
              </div>
            </div>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default ClaudePromptsManager;
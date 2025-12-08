/**
 * 模板管理模态框组件
 */

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  List,
  Card,
  Tag,
  Popconfirm,
  App,
  Empty,
  Tooltip,
  Typography
} from 'antd';
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  FileText,
  CornerUpLeft,
  Eye,
  Copy
} from 'lucide-react';
import { PromptTemplate } from '../types/prompts';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// 类别映射
const categoryMap = {
  general: { name: '通用', color: '#1890ff' },
  development: { name: '开发', color: '#52c41a' },
  education: { name: '教育', color: '#722ed1' },
  writing: { name: '写作', color: '#fa8c16' },
  data: { name: '数据', color: '#13c2c2' },
  management: { name: '管理', color: '#eb2f96' },
  content: { name: '内容', color: '#f5222d' },
  language: { name: '语言', color: '#a0d911' },
  research: { name: '研究', color: '#2f54eb' },
  business: { name: '商业', color: '#fa541c' },
  creative: { name: '创意', color: '#fa8c16' },
  health: { name: '健康', color: '#52c41a' },
  technical: { name: '技术', color: '#1890ff' },
  presentation: { name: '演示', color: '#722ed1' },
  ai: { name: 'AI', color: '#13c2c2' },
  legal: { name: '法律', color: '#eb2f96' },
  design: { name: '设计', color: '#f5222d' },
  marketing: { name: '营销', color: '#a0d911' },
  product: { name: '产品', color: '#2f54eb' },
  security: { name: '安全', color: '#fa541c' },
  finance: { name: '金融', color: '#52c41a' },
  hr: { name: '人力', color: '#1890ff' },
  sustainability: { name: '可持续', color: '#722ed1' },
  agile: { name: '敏捷', color: '#13c2c2' },
  entertainment: { name: '娱乐', color: '#eb2f96' },
  analysis: { name: '分析', color: '#fa8c16' },
  productivity: { name: '效率', color: '#f5222d' }
};

interface TemplateModalProps {
  visible: boolean;
  onClose: () => void;
  templates: PromptTemplate[];
  onAddTemplate: (templateData: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltin'>) => void;
  onEditTemplate: (template: PromptTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onSelectTemplate: (template: PromptTemplate, mode: 'overwrite' | 'append') => void;
  isDarkMode: boolean;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  visible,
  onClose,
  templates,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onSelectTemplate,
  isDarkMode
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<PromptTemplate | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 处理新建模板
  const handleAdd = () => {
    setEditingTemplate(null);
    setIsAddMode(true);
    form.resetFields();
  };

  // 处理编辑模板
  const handleEdit = (template: PromptTemplate) => {
    if (template.isBuiltin) {
      message.warning('内置模板不能编辑');
      return;
    }
    setEditingTemplate(template);
    setIsAddMode(false);
    form.setFieldsValue(template);
  };

  // 处理删除模板
  const handleDelete = (templateId: string) => {
    onDeleteTemplate(templateId);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingTemplate) {
        // 编辑模式
        await onEditTemplate({
          ...editingTemplate,
          ...values
        });
      } else {
        // 新建模式
        await onAddTemplate(values);
      }

      setIsAddMode(false);
      setEditingTemplate(null);
      form.resetFields();
    } catch (error) {
      console.error('保存模板失败:', error);
    }
  };

  // 取消操作
  const handleCancel = () => {
    setIsAddMode(false);
    setEditingTemplate(null);
    form.resetFields();
  };

  // 处理预览模板
  const handlePreview = (template: PromptTemplate) => {
    setPreviewTemplate(template);
    setPreviewVisible(true);
  };

  // 关闭预览
  const handleClosePreview = () => {
    setPreviewVisible(false);
    setPreviewTemplate(null);
  };

  // 处理复制模板内容到剪贴板
  const handleCopyToClipboard = async (template: PromptTemplate) => {
    try {
      await navigator.clipboard.writeText(template.content);
      message.success('模板内容已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败，请手动复制');
    }
  };

  // 过滤模板
  const filteredTemplates = filterCategory === 'all'
    ? templates
    : templates.filter(t => t.category === filterCategory);

  return (
    <Modal
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 40 }}>
          <span style={{ fontSize: 16, fontWeight: 500 }}>模板管理</span>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleAdd}
            size="small"
          >
            新建模板
          </Button>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnHidden
      styles={{
        body: {
          padding: 0,
          height: 600,
          overflow: 'hidden'
        }
      }}
    >
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {isAddMode || editingTemplate ? (
          // 编辑表单
          <div style={{
            padding: '24px',
            height: '100%',
            overflowY: 'auto'
          }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="name"
                label="模板名称"
                rules={[{ required: true, message: '请输入模板名称' }]}
              >
                <Input placeholder="请输入模板名称" />
              </Form.Item>

              <Form.Item
                name="description"
                label="描述"
                rules={[{ required: true, message: '请输入模板描述' }]}
              >
                <Input placeholder="请输入模板描述" />
              </Form.Item>

              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
                initialValue="general"
              >
                <Select>
                  {Object.entries(categoryMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.name}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="tags"
                label="标签"
              >
                <Select
                  mode="tags"
                  placeholder="输入标签后按回车"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="内容"
                rules={[{ required: true, message: '请输入模板内容' }]}
              >
                <TextArea
                  rows={12}
                  placeholder="请输入模板内容（支持Markdown格式）"
                  style={{ fontFamily: 'Monaco, Consolas, monospace' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 24 }}>
                <Space>
                  <Button onClick={handleCancel}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit">
                    {editingTemplate ? '更新' : '创建'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        ) : (
          // 模板列表
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px'
          }}>
            {/* 过滤器 */}
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Filter size={16} />
                <Select
                  value={filterCategory}
                  onChange={setFilterCategory}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="all">全部</Option>
                  {Object.entries(categoryMap).map(([key, value]) => (
                    <Option key={key} value={key}>{value.name}</Option>
                  ))}
                </Select>
              </Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                共 {filteredTemplates.length} 个模板
              </Text>
            </div>

            {/* 模板列表 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
              {filteredTemplates.length === 0 ? (
                <Empty description="暂无模板" style={{ marginTop: 80 }} />
              ) : (
                <List
                  dataSource={filteredTemplates}
                  renderItem={(template) => (
                    <Card
                    size="small"
                    style={{
                      marginBottom: 8,
                      background: isDarkMode ? '#2a2a2a' : '#ffffff',
                      border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8'
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, marginRight: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Text strong>{template.name}</Text>
                          {template.isBuiltin && (
                            <Tag color="blue" size="small">内置</Tag>
                          )}
                          <Tag color={categoryMap[template.category as keyof typeof categoryMap]?.color} size="small">
                            {categoryMap[template.category as keyof typeof categoryMap]?.name}
                          </Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {template.description}
                        </Text>
                        {template.tags && template.tags.length > 0 && (
                          <div style={{ marginTop: 4 }}>
                            {template.tags.map(tag => (
                              <Tag key={tag} size="small" style={{ fontSize: 10, marginRight: 4 }}>
                                {tag}
                              </Tag>
                            ))}
                          </div>
                        )}
                      </div>
                      <Space>
                        <Tooltip title="预览模板内容">
                          <Button
                            type="text"
                            size="small"
                            icon={<Eye size={14} />}
                            onClick={() => handlePreview(template)}
                            style={{ color: isDarkMode ? '#1890ff' : '#0969da' }}
                          />
                        </Tooltip>
                        <Tooltip title="复制模板内容到剪贴板">
                          <Button
                            type="text"
                            size="small"
                            icon={<Copy size={14} />}
                            onClick={() => handleCopyToClipboard(template)}
                            style={{ color: isDarkMode ? '#52c41a' : '#52a970' }}
                          />
                        </Tooltip>
                        <Tooltip title="覆盖模式（替换当前内容）">
                          <Button
                            type="text"
                            size="small"
                            icon={<FileText size={14} />}
                            onClick={() => onSelectTemplate(template, 'overwrite')}
                          />
                        </Tooltip>
                        <Tooltip title="追加模式（添加到末尾）">
                          <Button
                            type="text"
                            size="small"
                            icon={<CornerUpLeft size={14} />}
                            onClick={() => onSelectTemplate(template, 'append')}
                          />
                        </Tooltip>
                        {!template.isBuiltin && (
                          <>
                            <Tooltip title="编辑模板">
                              <Button
                                type="text"
                                size="small"
                                icon={<Edit size={14} />}
                                onClick={() => handleEdit(template)}
                              />
                            </Tooltip>
                            <Popconfirm
                              title="确认删除"
                              description="确定要删除这个模板吗？"
                              onConfirm={() => handleDelete(template.id)}
                              okText="确定"
                              cancelText="取消"
                            >
                              <Tooltip title="删除模板">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<Trash2 size={14} />}
                                  danger
                                />
                              </Tooltip>
                            </Popconfirm>
                          </>
                        )}
                      </Space>
                    </div>
                  </Card>
                  )}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 预览模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={18} />
            <span>模板预览 - {previewTemplate?.name}</span>
          </div>
        }
        open={previewVisible}
        onCancel={handleClosePreview}
        footer={[
          <Button key="close" onClick={handleClosePreview}>
            关闭
          </Button>,
          <Button
            key="copy"
            icon={<Copy size={14} />}
            onClick={() => {
              if (previewTemplate) {
                handleCopyToClipboard(previewTemplate);
              }
            }}
            style={{ color: isDarkMode ? '#52c41a' : '#52a970' }}
          >
            复制内容
          </Button>,
          <Button
            key="overwrite"
            type="primary"
            onClick={() => {
              if (previewTemplate) {
                onSelectTemplate(previewTemplate, 'overwrite');
                handleClosePreview();
              }
            }}
          >
            使用模板
          </Button>
        ]}
        width={800}
        destroyOnClose
        styles={{
          body: {
            padding: '20px',
            maxHeight: '60vh',
            overflowY: 'auto'
          }
        }}
      >
        {previewTemplate && (
          <div>
            {/* 模板信息 */}
            <div style={{
              marginBottom: 20,
              padding: '16px',
              background: isDarkMode ? '#2a2a2a' : '#f5f5f5',
              borderRadius: '8px',
              border: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Text strong style={{ fontSize: 16 }}>{previewTemplate.name}</Text>
                {previewTemplate.isBuiltin && (
                  <Tag color="blue">内置</Tag>
                )}
                <Tag color={categoryMap[previewTemplate.category as keyof typeof categoryMap]?.color}>
                  {categoryMap[previewTemplate.category as keyof typeof categoryMap]?.name}
                </Tag>
              </div>

              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                {previewTemplate.description}
              </Text>

              {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {previewTemplate.tags.map(tag => (
                    <Tag key={tag} size="small">{tag}</Tag>
                  ))}
                </div>
              )}
            </div>

            {/* 模板内容预览 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 12 }}>模板内容：</Text>
              <div style={{
                padding: '16px',
                background: isDarkMode ? '#1f1f1f' : '#fafafa',
                borderRadius: '8px',
                border: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                color: isDarkMode ? '#ffffff' : '#000000',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {previewTemplate.content}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Modal>
  );
};

export default TemplateModal;
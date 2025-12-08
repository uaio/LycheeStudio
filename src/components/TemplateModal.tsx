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
  CornerUpLeft
} from 'lucide-react';
import { PromptTemplate } from '../types/prompts';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

// 类别映射
const categoryMap = {
  development: { name: '开发', color: '#1890ff' },
  analysis: { name: '分析', color: '#722ed1' },
  creative: { name: '创意', color: '#fa8c16' },
  productivity: { name: '效率', color: '#52c41a' }
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
                initialValue="development"
              >
                <Select>
                  <Option value="development">开发</Option>
                  <Option value="analysis">分析</Option>
                  <Option value="creative">创意</Option>
                  <Option value="productivity">效率</Option>
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
    </Modal>
  );
};

export default TemplateModal;
/**
 * 模板库组件
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Typography,
  Modal,
  Form,
  message,
  Empty,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Code,
  Lightbulb,
  Brain,
  Zap,
  Filter
} from 'lucide-react';
import { TemplateLibraryProps, PromptTemplate, PromptCategory } from '../types/prompts';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 类别映射
const categoryMap = {
  development: { name: '开发', icon: <Code size={16} />, color: '#1890ff' },
  analysis: { name: '分析', icon: <Brain size={16} />, color: '#722ed1' },
  creative: { name: '创意', icon: <Lightbulb size={16} />, color: '#fa8c16' },
  productivity: { name: '效率', icon: <Zap size={16} />, color: '#52c41a' }
};

const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  templates,
  onSelectTemplate,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  isDarkMode,
  loading = false,
  simplified = false
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [form] = Form.useForm();

  // 简化模式直接使用所有模板，不进行过滤
  const displayTemplates = templates;

  // 监听触发新建模板事件
  useEffect(() => {
    const handleTriggerAddTemplate = () => {
      handleAddTemplate();
    };

    window.addEventListener('triggerAddTemplate', handleTriggerAddTemplate);
    return () => {
      window.removeEventListener('triggerAddTemplate', handleTriggerAddTemplate);
    };
  }, []);

  // 处理模板选择
  const handleSelectTemplate = (template: PromptTemplate) => {
    onSelectTemplate(template);
  };

  // 处理新增模板
  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  // 处理编辑模板
  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setIsModalVisible(true);
    form.setFieldsValue(template);
  };

  // 处理删除模板
  const handleDeleteTemplate = (templateId: string) => {
    onDeleteTemplate(templateId);
    message.success('模板删除成功');
  };

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingTemplate) {
        // 编辑模式
        await onEditTemplate({
          ...editingTemplate,
          ...values
        });
        message.success('模板更新成功');
      } else {
        // 新增模式
        await onAddTemplate(values);
        message.success('模板添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('保存模板失败:', error);
    }
  };

  // 处理模态框取消
  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingTemplate(null);
  };

  // 获取用户模板（不包括内置模板）
  const userTemplates = displayTemplates.filter(template => !template.isBuiltin);
  const builtinTemplates = displayTemplates.filter(template => template.isBuiltin);

  if (simplified) {
    // 简化模式：紧凑的列表布局
    return (
      <div style={{ padding: '8px' }}>
        <List
          size="small"
          loading={loading}
          dataSource={displayTemplates}
          renderItem={(template) => (
            <List.Item
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '6px',
                marginBottom: '4px',
                background: isDarkMode ? '#2a2a2a' : '#fafafa',
                border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8'
              }}
              onClick={() => handleSelectTemplate(template)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#3a3a3a' : '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#2a2a2a' : '#fafafa';
              }}
              actions={template.isBuiltin ? [] : [
                <Tooltip title="编辑模板" key="edit">
                  <Button
                    type="text"
                    size="small"
                    icon={<Edit size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTemplate(template);
                    }}
                  />
                </Tooltip>,
                <Popconfirm
                  title="确定要删除这个模板吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDeleteTemplate(template.id);
                  }}
                  key="delete"
                >
                  <Tooltip title="删除模板">
                    <Button
                      type="text"
                      size="small"
                      icon={<Trash2 size={14} />}
                      danger
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Tooltip>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      background: categoryMap[template.category].color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: categoryMap[template.category].color,
                      fontSize: '12px'
                    }}
                  >
                    {categoryMap[template.category].icon}
                  </div>
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Text strong style={{
                      color: isDarkMode ? '#ffffff' : '#000000',
                      fontSize: '13px'
                    }}>
                      {template.name}
                    </Text>
                    <Tag
                      size="small"
                      color={categoryMap[template.category].color}
                      style={{ fontSize: '10px', padding: '1px 4px' }}
                    >
                      {categoryMap[template.category].name}
                    </Tag>
                    {template.isBuiltin && (
                      <Tag size="small" color="blue" style={{ fontSize: '10px', padding: '1px 4px' }}>
                        内置
                      </Tag>
                    )}
                  </div>
                }
                description={
                  <Text
                    type="secondary"
                    style={{ fontSize: '11px', display: 'block' }}
                    ellipsis={{ tooltip: template.description }}
                  >
                    {template.description}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );
  }

  // 完整模式（原有的布局）
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 搜索和筛选区域 */}
      <div style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Input
            placeholder="搜索模板..."
            allowClear
            prefix={<Search size={16} />}
            // value={searchText}
            // onChange={(e) => setSearchText(e.target.value)}
            style={{ width: '100%' }}
          />

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Select
              // value={selectedCategory}
              // onChange={setSelectedCategory}
              style={{ flex: 1 }}
              placeholder="选择类别"
              suffixIcon={<Filter size={14} />}
            >
              <Option value="all">全部类别</Option>
              {Object.entries(categoryMap).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Space>
                    {config.icon}
                    {config.name}
                  </Space>
                </Option>
              ))}
            </Select>

            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={handleAddTemplate}
              size="small"
            >
              新建模板
            </Button>
          </div>
        </Space>
      </div>

      {/* 内置模板区域 */}
      <div style={{ marginBottom: '16px' }}>
        <Title level={5} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
          内置模板
        </Title>
        <List
          size="small"
          loading={loading}
          dataSource={builtinTemplates}
          renderItem={(template) => (
            <List.Item
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: '6px',
                marginBottom: '4px',
                background: isDarkMode ? '#2a2a2a' : '#fafafa',
                border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8'
              }}
              onClick={() => handleSelectTemplate(template)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#3a3a3a' : '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#2a2a2a' : '#fafafa';
              }}
            >
              <List.Item.Meta
                avatar={
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: categoryMap[template.category].color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: categoryMap[template.category].color
                    }}
                  >
                    {categoryMap[template.category].icon}
                  </div>
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                      {template.name}
                    </Text>
                    <Tag size="small" color={categoryMap[template.category].color}>
                      {categoryMap[template.category].name}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <Text
                      type="secondary"
                      style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}
                    >
                      {template.description}
                    </Text>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {template.tags.slice(0, 3).map(tag => (
                        <Tag key={tag} size="small" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>

      {/* 用户模板区域 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Title level={5} style={{ margin: 0, color: isDarkMode ? '#ffffff' : '#000000' }}>
          我的模板
        </Title>
        <div style={{ height: 'calc(100% - 24px)', overflow: 'auto' }}>
          {userTemplates.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无自定义模板"
              style={{ marginTop: '40px' }}
            />
          ) : (
            <List
              size="small"
              loading={loading}
              dataSource={userTemplates}
              renderItem={(template) => (
                <List.Item
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '4px',
                    background: isDarkMode ? '#2a2a2a' : '#fafafa',
                    border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8'
                  }}
                  actions={[
                    <Tooltip title="使用模板" key="use">
                      <Button
                        type="text"
                        size="small"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        使用
                      </Button>
                    </Tooltip>,
                    <Tooltip title="编辑模板" key="edit">
                      <Button
                        type="text"
                        size="small"
                        icon={<Edit size={14} />}
                        onClick={() => handleEditTemplate(template)}
                      />
                    </Tooltip>,
                    <Popconfirm
                      title="确定要删除这个模板吗？"
                      onConfirm={() => handleDeleteTemplate(template.id)}
                      key="delete"
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
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: categoryMap[template.category].color + '20',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: categoryMap[template.category].color
                        }}
                      >
                        {categoryMap[template.category].icon}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>
                          {template.name}
                        </Text>
                        <Tag size="small" color={categoryMap[template.category].color}>
                          {categoryMap[template.category].name}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <Text
                          type="secondary"
                          style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}
                        >
                          {template.description}
                        </Text>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {template.tags.slice(0, 3).map(tag => (
                            <Tag key={tag} size="small" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </div>

      {/* 新建/编辑模板模态框 */}
      <Modal
        title={editingTemplate ? '编辑模板' : '新建模板'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category: 'development',
            tags: []
          }}
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
            label="模板描述"
            rules={[{ required: true, message: '请输入模板描述' }]}
          >
            <Input.TextArea
              placeholder="请输入模板描述"
              rows={2}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="模板类别"
            rules={[{ required: true, message: '请选择模板类别' }]}
          >
            <Select placeholder="请选择模板类别">
              {Object.entries(categoryMap).map(([key, config]) => (
                <Option key={key} value={key}>
                  <Space>
                    {config.icon}
                    {config.name}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="模板内容"
            rules={[{ required: true, message: '请输入模板内容' }]}
          >
            <TextArea
              placeholder="请输入模板内容，支持Markdown格式"
              rows={8}
              style={{ fontFamily: 'Monaco, Consolas, monospace' }}
            />
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
          >
            <Select
              mode="tags"
              placeholder="请输入标签，按回车添加"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TemplateLibrary;
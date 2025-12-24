/**
 * MCP 服务管理页面
 */

import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  List,
  Divider,
} from 'antd';
import { Plus, Trash2, RefreshCw, Server, Check } from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';
import { MCPManager } from '@ai-tools/core';
import { useMCPManager } from '@ai-tools/ui';
import type { MCPServer } from '@ai-tools/core';

interface MCPManagerPageProps {
  adapter: PlatformAdapter;
}

export default function MCPManagerPage({ adapter }: MCPManagerPageProps) {
  const { servers, recommended, loading, refresh, addServer, removeServer } = useMCPManager({
    adapter,
  });

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addingServer, setAddingServer] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleAddRecommended = async (name: string, server: Omit<MCPServer, 'name'>) => {
    setAddingServer(name);
    try {
      await addServer(name, server);
      message.success(`已添加 MCP 服务: ${name}`);
    } catch (error) {
      message.error('添加失败');
    } finally {
      setAddingServer(null);
    }
  };

  const handleAddCustom = async () => {
    try {
      const values = await form.validateFields();
      await addServer(values.name, {
        command: values.command,
        args: values.args.split('\n').filter(Boolean),
      });
      message.success('添加成功');
      setAddModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleRemove = async (name: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 MCP 服务 "${name}" 吗？`,
      onOk: async () => {
        await removeServer(name);
        message.success('删除成功');
      },
    });
  };

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <strong>{name}</strong>,
    },
    {
      title: '命令',
      dataIndex: 'command',
      key: 'command',
      render: (command: string) => <code>{command}</code>,
    },
    {
      title: '参数',
      dataIndex: 'args',
      key: 'args',
      render: (args: string[]) => (
        <div>
          {args.map((arg, i) => (
            <Tag key={i} style={{ marginBottom: 4 }}>{arg}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: MCPServer) => (
        <Button
          danger
          size="small"
          icon={<Trash2 size={14} />}
          onClick={() => handleRemove(record.name)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card
        title="MCP 服务"
        extra={
          <Space>
            <Button icon={<RefreshCw size={16} />} onClick={refresh} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<Plus size={16} />} onClick={() => setAddModalVisible(true)}>
              添加服务
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={servers}
          columns={columns}
          rowKey="name"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Card title="推荐服务">
        <List
          dataSource={recommended}
          renderItem={item => {
            const isAdded = servers.some(s => s.name === item.name);
            return (
              <List.Item
                actions={[
                  isAdded ? (
                    <Tag color="success">已添加</Tag>
                  ) : (
                    <Button
                      type="primary"
                      size="small"
                      icon={<Plus size={14} />}
                      onClick={() => handleAddRecommended(item.name, item.server)}
                      loading={addingServer === item.name}
                    >
                      添加
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  avatar={<Server size={20} />}
                  title={item.name}
                  description={
                    <Space direction="vertical" size="small">
                      <div>{item.description}</div>
                      <code>{item.server.command} {item.server.args.join(' ')}</code>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Modal
        title="添加自定义 MCP 服务"
        open={addModalVisible}
        onOk={handleAddCustom}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="服务名称"
            rules={[{ required: true, message: '请输入服务名称' }]}
          >
            <Input placeholder="例如: my-mcp-server" />
          </Form.Item>

          <Form.Item
            name="command"
            label="命令"
            rules={[{ required: true, message: '请输入命令' }]}
          >
            <Input placeholder="例如: npx" />
          </Form.Item>

          <Form.Item
            name="args"
            label="参数（每行一个）"
            rules={[{ required: true, message: '请输入参数' }]}
          >
            <Input.TextArea
              placeholder="例如:&#10;-y&#10;@my-org/my-mcp-server"
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}

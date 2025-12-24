/**
 * MCP 管理页面（Web 版 - 预览模式）
 */

import { Card, Table, Space, Tag, Alert, List, Modal } from 'antd';
import { Eye, Plus, Server } from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';

interface Props {
  adapter: PlatformAdapter | null;
}

const mockServers = [
  {
    name: 'filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/Users/anan/Projects'],
    description: '文件系统访问',
  },
  {
    name: 'brave-search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    description: 'Brave 搜索',
  },
  {
    name: 'github',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    description: 'GitHub 集成',
  },
];

export default function MCPManagerPage({ adapter }: Props) {
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
            <Tag key={i}>{arg}</Tag>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="Web 版本 - 预览模式"
        description="此页面仅用于预览 MCP 服务配置。实际配置需要通过桌面应用修改。"
        type="info"
        showIcon
        icon={<Eye size={16} />}
      />

      <Card title="已配置的 MCP 服务">
        <Table
          dataSource={mockServers}
          columns={columns}
          rowKey="name"
          pagination={false}
        />
      </Card>

      <Card title="推荐的 MCP 服务">
        <List
          dataSource={mockServers}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Server size={20} />}
                title={item.name}
                description={
                  <Space direction="vertical" size="small">
                    <div>{item.description}</div>
                    <code>{item.command} {item.args.join(' ')}</code>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </Space>
  );
}

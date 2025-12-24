/**
 * Web 应用头部组件
 */

import { Layout, Space, Button, Typography } from 'antd';
import { Hexagon, Github, Download } from 'lucide-react';

const { Header } = Layout;

export default function Header() {
  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px',
      }}
    >
      <Space>
        <Hexagon size={24} style={{ color: '#7c4dff' }} />
        <Typography.Title level={4} style={{ margin: 0 }}>
          AI Tools Manager
        </Typography.Title>
        <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>Web 版</span>
      </Space>

      <Space>
        <Button
          type="default"
          size="small"
          icon={<Github size={16} />}
          href="https://github.com/your-repo"
          target="_blank"
        >
          GitHub
        </Button>
        <Button
          type="primary"
          size="small"
          icon={<Download size={16} />}
          href="https://github.com/your-repo/releases"
          target="_blank"
        >
          下载桌面版
        </Button>
      </Space>
    </Header>
  );
}

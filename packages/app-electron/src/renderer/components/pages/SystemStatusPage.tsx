/**
 * 系统状态页面
 * 显示各工具的安装状态
 */

import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Space, Alert } from 'antd';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';
import { FNMManager } from '@ai-tools/core';

interface SystemStatusPageProps {
  adapter: PlatformAdapter;
}

interface ToolStatus {
  name: string;
  displayName: string;
  status: 'active' | 'warning' | 'error';
  version?: string;
  path?: string;
}

export default function SystemStatusPage({ adapter }: SystemStatusPageProps) {
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<ToolStatus[]>([]);

  useEffect(() => {
    const checkStatuses = async () => {
      setLoading(true);
      const fnmManager = new FNMManager(adapter);

      const results: ToolStatus[] = [];

      // 检查 FNM
      const fnmInstalled = await fnmManager.isInstalled();
      const fnmVersion = await fnmManager.getVersion();
      results.push({
        name: 'fnm',
        displayName: 'Fast Node Manager (FNM)',
        status: fnmInstalled ? 'active' : 'warning',
        version: fnmVersion || undefined,
      });

      // 检查 Node
      const nodeResult = await adapter.executeCommand('node --version');
      results.push({
        name: 'node',
        displayName: 'Node.js',
        status: nodeResult.success ? 'active' : 'warning',
        version: nodeResult.stdout?.trim(),
      });

      // 检查 AI 工具
      const aiTools = await fnmManager.checkAITools(['claude-code', 'gemini-cli', 'codex']);
      results.push(...aiTools);

      setStatuses(results);
      setLoading(false);
    };

    checkStatuses();
  }, [adapter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 size={20} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="success">已安装</Tag>;
      case 'warning':
        return <Tag color="warning">未安装</Tag>;
      case 'error':
        return <Tag color="error">错误</Tag>;
    }
  };

  if (loading) {
    return (
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card loading />
      </Space>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Alert
        message="系统工具状态"
        description="查看开发工具的安装和运行状态"
        type="info"
        showIcon
      />

      <Row gutter={[16, 16]}>
        {statuses.map(tool => (
          <Col xs={24} sm={12} md={8} key={tool.name}>
            <Card
              title={tool.displayName}
              extra={getStatusTag(tool.status)}
              style={{ height: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {getStatusIcon(tool.status)}
                  <span>{tool.status === 'active' ? '运行正常' : '未安装'}</span>
                </div>
                {tool.version && (
                  <div>
                    <span style={{ color: '#888' }}>版本: </span>
                    <span>{tool.version}</span>
                  </div>
                )}
                {tool.path && (
                  <div>
                    <span style={{ color: '#888' }}>路径: </span>
                    <span style={{ fontSize: 12 }}>{tool.path}</span>
                  </div>
                )}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}

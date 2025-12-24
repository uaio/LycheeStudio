/**
 * Node 版本管理页面
 */

import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  Modal,
  message,
  Progress,
  Tooltip,
} from 'antd';
import { Download, Trash2, Check, RefreshCw } from 'lucide-react';
import type { PlatformAdapter } from '@ai-tools/core';
import { NodeManager } from '@ai-tools/core';
import type { NodeVersion } from '@ai-tools/core';
import { useNodeManager } from '@ai-tools/ui';

interface NodeManagerPageProps {
  adapter: PlatformAdapter;
}

export default function NodeManagerPage({ adapter }: NodeManagerPageProps) {
  const { installedVersions, currentVersion, loading, refreshVersions, useVersion, uninstallVersion } =
    useNodeManager({ adapter });

  const [installModalVisible, setInstallModalVisible] = useState(false);
  const [installVersion, setInstallVersion] = useState('');
  const [installing, setInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  const handleUseVersion = async (version: string) => {
    const success = await useVersion(version, true);
    if (success) {
      message.success(`已切换到 Node ${version}`);
    } else {
      message.error('切换版本失败');
    }
  };

  const handleUninstallVersion = async (version: string) => {
    Modal.confirm({
      title: '确认卸载',
      content: `确定要卸载 Node ${version} 吗？`,
      onOk: async () => {
        const success = await uninstallVersion(version);
        if (success) {
          message.success(`已卸载 Node ${version}`);
        } else {
          message.error('卸载失败');
        }
      },
    });
  };

  const handleInstall = async () => {
    if (!installVersion) {
      message.warning('请输入版本号');
      return;
    }

    setInstalling(true);
    setInstallProgress(0);

    // 模拟安装进度
    const progressInterval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const nodeManager = new NodeManager(adapter);
      const result = await nodeManager.installVersion(installVersion, { setAsDefault: true });

      clearInterval(progressInterval);
      setInstallProgress(100);

      if (result.success) {
        message.success(`Node ${result.version} 安装成功`);
        setInstallModalVisible(false);
        setInstallVersion('');
        await refreshVersions();
      } else {
        message.error(`安装失败: ${result.error}`);
      }
    } catch (error: any) {
      message.error(`安装失败: ${error.message}`);
    } finally {
      setInstalling(false);
      setInstallProgress(0);
    }
  };

  const columns = [
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: (version: string, record: NodeVersion) => (
        <Space>
          <span>{version}</span>
          {record.isDefault && <Tag color="blue">默认</Tag>}
          {record.isActive && <Tag color="green">当前</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: NodeVersion) => (
        <Space>
          {!record.isActive && (
            <Button
              type="primary"
              size="small"
              icon={<Check size={14} />}
              onClick={() => handleUseVersion(record.version)}
            >
              切换
            </Button>
          )}
          <Button
            danger
            size="small"
            icon={<Trash2 size={14} />}
            onClick={() => handleUninstallVersion(record.version)}
          >
            卸载
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card
        title="Node 版本管理"
        extra={
          <Space>
            <Button icon={<RefreshCw size={16} />} onClick={refreshVersions} loading={loading}>
              刷新
            </Button>
            <Button type="primary" icon={<Download size={16} />} onClick={() => setInstallModalVisible(true)}>
              安装版本
            </Button>
          </Space>
        }
      >
        {currentVersion && (
          <div style={{ marginBottom: 16 }}>
            当前版本: <Tag color="green" style={{ fontSize: 14 }}>{currentVersion}</Tag>
          </div>
        )}

        <Table
          dataSource={installedVersions}
          columns={columns}
          rowKey="version"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title="安装 Node 版本"
        open={installModalVisible}
        onOk={handleInstall}
        onCancel={() => {
          setInstallModalVisible(false);
          setInstallVersion('');
          setInstallProgress(0);
        }}
        confirmLoading={installing}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <div style={{ marginBottom: 8 }}>版本号:</div>
            <Input
              placeholder="例如: 20, 20.0.0, latest"
              value={installVersion}
              onChange={e => setInstallVersion(e.target.value)}
              onPressEnter={handleInstall}
            />
            <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
              支持主版本号（如 "20"）或完整版本号（如 "20.0.0"）
            </div>
          </div>

          {installing && (
            <div>
              <div>安装进度:</div>
              <Progress percent={installProgress} />
            </div>
          )}
        </Space>
      </Modal>
    </Space>
  );
}

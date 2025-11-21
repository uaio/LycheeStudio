import React, { useState } from 'react';
import { Modal, Button, Typography, Space, Alert, Steps, Tag } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { ToolStatus, InstallationError } from '../types/installation';

const { Title, Text, Paragraph } = Typography;

interface InstallDialogProps {
  visible: boolean;
  tool: ToolStatus | null;
  mode: 'confirm' | 'error' | 'installing';
  error?: InstallationError | null;
  onConfirm?: () => Promise<void>;
  onRetry?: () => Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
}

export const InstallDialog: React.FC<InstallDialogProps> = ({
  visible,
  tool,
  mode,
  error,
  onConfirm,
  onRetry,
  onCancel,
  onClose
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;

    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('安装失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!onRetry) return;

    setLoading(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('重试失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!tool) return null;

    switch (mode) {
      case 'confirm':
        return (
          <Space direction="vertical" size="large">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <InfoCircleOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </div>

            <Title level={4} style={{ textAlign: 'center', margin: '20px 0 10px 0' }}>
              确认安装 {tool.name}
            </Title>

            <Paragraph style={{ textAlign: 'center', marginBottom: 20 }}>
              {tool.description}
            </Paragraph>

            {tool.dependencies.length > 0 && (
              <Alert
                message="依赖检查"
                description={
                  <div>
                    <div>将首先安装以下依赖：</div>
                    <Space wrap style={{ marginTop: 8 }}>
                      {tool.dependencies.map(dep => (
                        <Tag key={dep} color="blue">{dep}</Tag>
                      ))}
                    </Space>
                  </div>
                }
                type="info"
                showIcon
              />
            )}

            {tool.installCommand && (
              <div>
                <Text strong>安装命令：</Text>
                <div style={{
                  backgroundColor: '#f5f5f5',
                  padding: 12,
                  borderRadius: 6,
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: 12,
                  marginTop: 8
                }}>
                  {tool.installCommand}
                </div>
              </div>
            )}
          </Space>
        );

      case 'error':
        return (
          <Space direction="vertical" size="large">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />
            </div>

            <Title level={4} style={{ textAlign: 'center', margin: '20px 0 10px 0' }}>
              安装失败：{tool.name}
            </Title>

            {error && (
              <>
                <Alert
                  message="错误信息"
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>原始错误：</Text>
                        <div style={{
                          backgroundColor: '#fff2f0',
                          padding: 12,
                          borderRadius: 4,
                          border: '1px solid #ffccc7',
                          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                          fontSize: 12,
                          marginTop: 8,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word'
                        }}>
                          {error.originalError}
                        </div>
                      </div>

                      {error.solution && (
                        <div>
                          <Text strong>解决方案：</Text>
                          <div style={{
                            backgroundColor: '#f6ffed',
                            padding: 12,
                            borderRadius: 4,
                            border: '1px solid #b7eb8f',
                            marginTop: 8
                          }}>
                            {error.solution}
                          </div>
                        </div>
                      )}
                    </div>
                  }
                  type="error"
                  showIcon
                />

                {error.canRetry && (
                  <div style={{ textAlign: 'center', marginTop: 20 }}>
                    <Text>重试次数：{error.retryCount} / {error.maxRetries}</Text>
                  </div>
                )}
              </>
            )}
          </Space>
        );

      case 'installing':
        return (
          <Space direction="vertical" size="large" align="center">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div className="loading-spinner" style={{
                width: 48,
                height: 48,
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #1890ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>

            <Title level={4} style={{ textAlign: 'center', margin: '20px 0 10px 0' }}>
              正在安装 {tool.name}...
            </Title>

            <Paragraph style={{ textAlign: 'center' }}>
              请稍候，安装过程可能需要几分钟时间
            </Paragraph>

            <div style={{
              backgroundColor: '#e6f7ff',
              padding: 12,
              borderRadius: 4,
              border: '1px solid #91d5ff',
              textAlign: 'center'
            }}>
              <Text style={{ color: '#1890ff' }}>
                📦 正在下载和安装 {tool.name}
              </Text>
            </div>
          </Space>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => {
    switch (mode) {
      case 'confirm':
        return (
          <Space>
            <Button onClick={onCancel || onClose}>
              取消
            </Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              loading={loading}
              icon={<CheckCircleOutlined />}
            >
              确认安装
            </Button>
          </Space>
        );

      case 'error':
        return (
          <Space>
            <Button onClick={onCancel || onClose}>
              关闭
            </Button>
            {error?.canRetry && onRetry && (
              <Button
                type="primary"
                onClick={handleRetry}
                loading={loading}
              >
                重试安装
              </Button>
            )}
          </Space>
        );

      case 'installing':
        return (
          <Button onClick={onCancel || onClose}>
            后台运行
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel || onClose}
      footer={renderFooter()}
      width={600}
      centered
      maskClosable={mode !== 'installing'}
      keyboard={mode !== 'installing'}
      styles={{
        body: {
          padding: mode === 'error' ? 24 : 40
        }
      }}
    >
      {renderContent()}
    </Modal>
  );
};

// 添加旋转动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
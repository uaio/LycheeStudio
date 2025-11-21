import React, { useEffect, useRef } from 'react';
import { Card, Button, Typography, Progress, Space, Tag } from 'antd';
import { MinusOutlined, CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { InstallationProgress, InstallationLog } from '../types/installation';

const { Text } = Typography;

interface InstallationLogPanelProps {
  show: boolean;
  isMinimized: boolean;
  progress?: InstallationProgress | null;
  logs: InstallationLog[];
  onMinimize: () => void;
  onClose: () => void;
}

export const InstallationLogPanel: React.FC<InstallationLogPanelProps> = ({
  show,
  isMinimized,
  progress,
  logs,
  onMinimize,
  onClose
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (logContainerRef.current && !isMinimized) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isMinimized]);

  if (!show) {
    return null;
  }

  const getStageText = (stage: string) => {
    const stageMap = {
      checking: '检查环境',
      preparing: '准备安装',
      downloading: '下载中',
      installing: '安装中',
      configuring: '配置中',
      completed: '完成',
      error: '错误'
    };
    return stageMap[stage] || stage;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}分${remainingSeconds}秒`;
  };

  const getProgressInfo = () => {
    if (!progress) return null;

    return (
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ color: '#fff', fontSize: 12 }}>
            {progress.tool} - {getStageText(progress.stage)}
          </Text>
          <Tag color={progress.stage === 'error' ? 'red' : progress.stage === 'completed' ? 'green' : 'blue'}>
            {progress.progress}%
          </Tag>
        </div>

        {progress.stage !== 'completed' && (
          <Progress
            percent={progress.progress}
            size="small"
            status={progress.stage === 'error' ? 'exception' : 'active'}
            strokeColor={progress.stage === 'error' ? '#ff4d4f' : '#1890ff'}
          />
        )}

        {progress.message && (
          <Text style={{ color: '#d9d9d9', fontSize: 12 }}>
            {progress.message}
          </Text>
        )}

        {progress.downloaded && progress.total && (
          <Text style={{ color: '#d9d9d9', fontSize: 12 }}>
            {formatBytes(progress.downloaded)} / {formatBytes(progress.total)}
            {progress.speed && (
              <>
                <span style={{ margin: '0 8px' }}>•</span>
                {formatBytes(progress.speed)}/s
              </>
            )}
            {progress.eta && (
              <>
                <span style={{ margin: '0 8px' }}>•</span>
                剩余: {formatTime(progress.eta)}
              </>
            )}
          </Text>
        )}
      </Space>
    );
  };

  const renderLogs = () => (
    <div
      ref={logContainerRef}
      style={{
        height: 200,
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: '#1e1e1e',
        borderRadius: 4,
        padding: '8px',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
        fontSize: 11,
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}
    >
      {logs.length === 0 ? (
        <Text style={{ color: '#666', fontSize: 12 }}>等待日志输出...</Text>
      ) : (
        logs.map((log, index) => (
          <div
            key={`${log.timestamp}-${index}`}
            style={{
              color: log.color,
              marginBottom: 2,
              display: 'block'
            }}
          >
            {log.message}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 420,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderRadius: 8,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}
    >
      {/* 标题栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8
        }}
      >
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>
          安装日志
          {logs.length > 0 && (
            <Text style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
              ({logs.length} 条)
            </Text>
          )}
        </Text>
        <Space size="small">
          <Button
            size="small"
            icon={isMinimized ? <ExpandOutlined /> : <MinusOutlined />}
            onClick={onMinimize}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: '#fff'
            }}
          />
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 77, 79, 0.2)',
              border: 'none',
              color: '#ff4d4f'
            }}
          />
        </Space>
      </div>

      {/* 内容区域 */}
      {!isMinimized && (
        <div style={{ padding: 16 }}>
          {/* 进度信息 */}
          {progress && getProgressInfo()}

          {/* 日志内容 */}
          <div style={{ marginTop: 12 }}>
            {renderLogs()}
          </div>
        </div>
      )}
    </div>
  );
};
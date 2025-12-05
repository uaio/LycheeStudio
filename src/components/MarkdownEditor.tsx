/**
 * Markdown编辑器组件
 */

import React, { useState, useEffect } from 'react';
import { Input, Card, Button, Space, Typography, Divider } from 'antd';
import { Eye, Edit, Copy, Check } from 'lucide-react';
import { MarkdownEditorProps } from '../types/prompts';

const { TextArea } = Input;
const { Text } = Typography;

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  isDarkMode,
  placeholder = '请输入Markdown内容...',
  readonly = false,
  height = 400
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  // 同步外部值变化
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // 处理内容变化
  const handleChange = (val: string | undefined) => {
    const newValue = val || '';
    setInternalValue(newValue);
    onChange(newValue);
  };

  // 复制内容
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(internalValue);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 编辑器组件
  const renderEditor = () => {
    if (readonly) {
      return (
        <div style={{
          height: height,
          padding: '16px',
          background: isDarkMode ? '#1f1f1f' : '#ffffff',
          border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
          borderRadius: '6px',
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          overflow: 'auto',
          color: isDarkMode ? '#ffffff' : '#000000'
        }}>
          {internalValue || '暂无内容'}
        </div>
      );
    }

    return (
      <TextArea
        value={internalValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: height,
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          resize: 'none',
          background: isDarkMode ? '#1f1f1f' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          borderColor: isDarkMode ? '#424242' : '#e8e8e8'
        }}
      />
    );
  };

  return (
    <Card
      className={`markdown-editor-card ${isDarkMode ? 'dark-mode' : ''}`}
      style={{
        background: isDarkMode ? '#1f1f1f' : '#ffffff',
        border: isDarkMode ? '1px solid #424242' : '1px solid #e8e8e8',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
      bodyStyle={{ padding: 0 }}
    >
      {/* 编辑器工具栏 */}
      {!readonly && (
        <div
          style={{
            padding: '12px 16px',
            borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #f0f0f0',
            background: isDarkMode ? '#2a2a2a' : '#fafafa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Space>
            <Edit size={16} color={isDarkMode ? '#ffffff' : '#000000'} />
            <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 500 }}>
              Markdown编辑器
            </Text>
          </Space>

          <Space>
            <Text
              type="secondary"
              style={{ fontSize: '12px' }}
            >
              {internalValue.length} 字符
            </Text>
            <Button
              type="text"
              size="small"
              icon={copySuccess ? <Check size={14} /> : <Copy size={14} />}
              onClick={handleCopy}
              style={{
                color: copySuccess ? '#52c41a' : (isDarkMode ? '#ffffff' : '#000000')
              }}
            >
              {copySuccess ? '已复制' : '复制'}
            </Button>
          </Space>
        </div>
      )}

      {/* 编辑器主体 */}
      <div style={{ minHeight: height }}>
        {renderEditor()}
      </div>

      </Card>
  );
};

export default MarkdownEditor;
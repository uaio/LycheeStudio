/**
 * Markdown编辑器组件
 */

import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { MarkdownEditorProps } from '../types/prompts';

const { TextArea } = Input;

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  isDarkMode,
  placeholder = '请输入Markdown内容...',
  readonly = false,
  height = 400
}) => {
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

  // 编辑器组件
  const renderEditor = () => {
    if (readonly) {
      return (
        <div style={{
          height: '100%',
          padding: '20px',
          background: 'transparent',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
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
          height: '100%',
          fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          fontSize: '14px',
          lineHeight: '1.6',
          resize: 'none',
          border: 'none',
          background: 'transparent',
          color: isDarkMode ? '#ffffff' : '#000000',
          padding: '20px'
        }}
      />
    );
  };

  return (
    <div style={{ height: '100%' }}>
      {renderEditor()}
    </div>
  );
};

export default MarkdownEditor;
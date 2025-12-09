/**
 * 代码编辑器组件
 */

import React, { useRef, useEffect } from 'react';
import { Input } from 'antd';

const { TextArea } = Input;

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language: string;
  isDarkMode: boolean;
  placeholder?: string;
  height: string;
  readOnly?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  isDarkMode,
  placeholder,
  height,
  readOnly = false
}) => {
  const textAreaRef = useRef<any>(null);

  // 处理 Tab 键缩进
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);

      if (onChange) {
        onChange(newValue);
      }

      // 设置光标位置
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <TextArea
      ref={textAreaRef}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{
        height,
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        fontSize: '13px',
        lineHeight: '1.6',
        background: isDarkMode ? '#1f1f1f' : '#fafafa',
        color: isDarkMode ? '#ffffff' : '#000000',
        border: `1px solid ${isDarkMode ? '#404040' : '#e0e0e0'}`,
        borderRadius: '8px',
        resize: 'none',
        outline: 'none'
      }}
    />
  );
};

export default CodeEditor;
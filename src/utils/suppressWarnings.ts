/**
 * 抑制特定的 Ant Design 警告
 */

// 保存原始的 console.warn
const originalWarn = console.warn;

// 重写 console.warn 来过滤特定的警告
console.warn = (...args: any[]) => {
  const message = args.join(' ');

  // 抑制 Ant Design Menu children 警告
  if (message.includes('antd: Menu') && message.includes('children') && message.includes('deprecated')) {
    return;
  }

  // 对于其他警告，正常显示
  originalWarn.apply(console, args);
};

// 也可以选择在开发环境中抑制所有废弃警告
if (process.env.NODE_ENV === 'development') {
  const originalDeprecate = console.warn;
  console.warn = (...args: any[]) => {
    const message = args.join(' ');

    // 抑制常见的废弃警告
    const suppressedWarnings = [
      'antd: Menu',
      'Warning: componentWillReceiveProps has been renamed',
      'Warning: componentWillMount has been renamed',
    ];

    const shouldSuppress = suppressedWarnings.some(warning => message.includes(warning));

    if (!shouldSuppress) {
      originalDeprecate.apply(console, args);
    }
  };
}
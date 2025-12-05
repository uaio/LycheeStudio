/**
 * 内置提示词模板数据
 */

import { PromptTemplate } from '../types/prompts';

export const BUILTIN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'code-review',
    name: '代码审查助手',
    description: '帮助进行代码审查的提示词',
    content: `# 代码审查助手

请审查以下代码，重点关注：

## 审查要点
- **代码质量和可读性**: 代码是否清晰、易读、遵循最佳实践
- **潜在bug和安全问题**: 可能存在的错误、安全漏洞
- **性能优化建议**: 可以改进的性能点
- **最佳实践遵循情况**: 是否符合行业标准和最佳实践

## 代码内容
\`\`\`{{language}}
{{code}}
\`\`\`

## 审查要求
1. 提供具体的改进建议
2. 解释问题的原因
3. 给出修复方案
4. 标注优先级（高/中/低）`,
    category: 'development',
    tags: ['代码审查', '质量', '最佳实践', '安全'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltin: true
  },
  {
    id: 'debug-helper',
    name: '调试助手',
    description: '帮助分析和解决代码问题的提示词',
    content: `# 调试助手

## 问题描述
我遇到了以下问题：

**问题详情**: {{problem}}

**错误信息**:
\`\`\`
{{error}}
\`\`\`

**相关代码**:
\`\`\`{{language}}
{{code}}
\`\`\`

**环境信息**:
- 操作系统: {{os}}
- 运行环境: {{environment}}
- 版本信息: {{version}}

## 请帮我
1. **分析问题原因**: 解释可能的原因
2. **提供解决方案**: 给出具体的解决步骤
3. **建议预防措施**: 如何避免类似问题
4. **调试建议**: 推荐的调试方法和工具

## 期望的回复格式
- 问题分析：[详细说明]
- 解决方案：[具体步骤]
- 预防措施：[建议]
- 调试工具：[推荐]`,
    category: 'development',
    tags: ['调试', '问题解决', '错误分析', '故障排除'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltin: true
  },
  {
    id: 'documentation-generator',
    name: '文档生成助手',
    description: '帮助生成技术文档的提示词',
    content: `# 文档生成助手

## 代码信息
**功能模块**: {{module_name}}
**代码文件**: {{file_path}}
**作者**: {{author}}
**创建时间**: {{created_date}}

## 源代码
\`\`\`{{language}}
{{code}}
\`\`\`

## 请生成以下文档

### 1. 功能概述
- 模块的主要功能
- 核心算法或逻辑说明
- 与其他模块的关系

### 2. API文档（如果有函数或类）
- 函数/类名称和参数
- 返回值说明
- 使用示例
- 异常处理

### 3. 使用指南
- 如何使用这个模块
- 配置说明
- 常见用法示例

### 4. 注意事项
- 依赖关系
- 性能考虑
- 安全注意事项
- 兼容性说明

## 文档格式要求
- 使用Markdown格式
- 包含适当的代码示例
- 清晰的章节结构
- 简洁明了的描述`,
    category: 'development',
    tags: ['文档', 'API文档', '技术文档', '代码注释'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltin: true
  },
  {
    id: 'refactoring-advisor',
    name: '重构建议助手',
    description: '提供代码重构建议的提示词',
    content: `# 重构建议助手

## 当前代码
\`\`\`{{language}}
{{code}}
\`\`\`

## 代码背景
**文件用途**: {{purpose}}
**维护频率**: {{maintenance_frequency}}
**团队熟悉度**: {{team_familiarity}}
**性能要求**: {{performance_requirements}}

## 重构目标
- [ ] 提高代码可读性
- [ ] 增强可维护性
- [ ] 优化性能
- [ ] 减少代码重复
- [ ] 提高测试覆盖率
- [ ] 其他: {{other_goals}}

## 请提供重构建议

### 1. 代码结构优化
- 函数/方法拆分建议
- 类设计改进
- 模块化建议

### 2. 性能优化
- 时间复杂度改进
- 内存使用优化
- 缓存策略

### 3. 代码质量提升
- 设计模式应用
- 错误处理改进
- 代码规范遵循

### 4. 具体重构步骤
请按照优先级提供具体的重构步骤，包括：
1. 重构内容
2. 实施方法
3. 风险评估
4. 测试建议

## 输出要求
- 优先级排序（高/中/低）
- 具体的代码示例
- 改进前后的对比
- 实施建议和注意事项`,
    category: 'development',
    tags: ['重构', '代码优化', '性能', '设计模式'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltin: true
  },
  {
    id: 'algorithm-analyzer',
    name: '算法分析助手',
    description: '帮助分析算法复杂度和优化建议的提示词',
    content: `# 算法分析助手

## 算法代码
\`\`\`{{language}}
{{code}}
\`\`\`

## 算法信息
**算法类型**: {{algorithm_type}}
**输入规模**: {{input_size}}
**应用场景**: {{use_case}}
**性能要求**: {{performance_requirements}}

## 请分析以下方面

### 1. 时间复杂度分析
- 最佳情况时间复杂度
- 平均情况时间复杂度
- 最坏情况时间复杂度
- 空间复杂度

### 2. 算法正确性
- 边界条件处理
- 逻辑正确性验证
- 潜在的错误场景

### 3. 性能优化建议
- 算法改进方向
- 数据结构优化
- 实现技巧优化

### 4. 替代方案
- 更优的算法选择
- 不同场景下的算法对比
- 权衡分析（时间 vs 空间）

## 分析格式要求
1. **复杂度分析**: 使用大O表示法，详细解释推导过程
2. **性能测试建议**: 推荐测试用例和基准测试方法
3. **优化代码示例**: 提供具体的优化代码
4. **对比分析**: 与同类算法的详细对比

## 额外要求
- 如果算法有已知问题，请明确指出
- 提供学习资源和参考文献
- 考虑实际应用场景的特殊要求`,
    category: 'development',
    tags: ['算法', '复杂度分析', '性能优化', '数据结构'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltin: true
  },
  {
    id: 'unit-test-generator',
    name: '单元测试生成助手',
    description: '帮助生成单元测试代码的提示词',
    content: `# 单元测试生成助手

## 源代码
**文件路径**: {{file_path}}
**编程语言**: {{language}}
**测试框架**: {{test_framework}}

\`\`\`{{language}}
{{code}}
\`\`\`

## 测试要求
- **覆盖率目标**: {{coverage_target}}
- **测试类型**: 单元测试、集成测试
- **特殊场景**: {{special_scenarios}}

## 请生成测试代码

### 1. 正常情况测试
- 各个功能的正常输入测试
- 边界值测试
- 典型用例测试

### 2. 异常情况测试
- 错误输入处理
- 异常抛出测试
- 边界条件测试

### 3. 性能测试
- 大数据量测试
- 执行时间测试
- 内存使用测试

## 测试代码要求
1. **完整的测试结构**: 包含setup、teardown、测试用例
2. **清晰的测试描述**: 每个测试用例都有明确的说明
3. **断言完整**: 验证输入、输出、副作用
4. **模拟对象**: 如需要，提供mock对象的使用
5. **测试数据**: 提供测试用的输入和预期输出

## 代码格式
请使用以下格式生成测试代码：

\`\`\`{{test_language}}
// 导入必要的依赖
// 测试代码
\`\`\`

## 额外要求
- 测试代码应该可以直接运行
- 包含必要的注释说明
- 提供测试运行指南
- 考虑测试的可维护性`,
    category: 'development',
    tags: ['单元测试', '测试自动化', 'TDD', '代码质量'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltin: true
  },
  {
    id: 'code-explainer',
    name: '代码解释助手',
    description: '帮助解释复杂代码逻辑的提示词',
    content: `# 代码解释助手

## 代码内容
\`\`\`{{language}}
{{code}}
\`\`\`

## 背景信息
**代码来源**: {{source}}
**使用场景**: {{context}}
**读者背景**: {{audience_background}}

## 请提供以下解释

### 1. 整体功能概述
- 这段代码的主要功能
- 在整个系统中的作用
- 与其他模块的关系

### 2. 逐行/逐段解释
- 关键代码逻辑说明
- 重要算法或设计模式解释
- 变量和函数的作用

### 3. 设计思路
- 代码的设计原理
- 为什么这样实现
- 有哪些设计考量

### 4. 关键概念
- 涉及的技术概念
- 专业术语解释
- 背景知识说明

## 解释要求
- **层次分明**: 从宏观到微观的层次结构
- **通俗易懂**: 适合目标读者群体
- **图文并茂**: 如需要，建议使用图表说明
- **实例说明**: 提供具体的例子帮助理解

## 输出格式
请使用Markdown格式，包含适当的：
- 标题层级
- 代码块高亮
- 列表和表格
- 强调和说明

## 特别要求
- 如果代码有特殊技巧或优化，请重点说明
- 指出可能的改进空间
- 提供相关的学习资源`,
    category: 'development',
    tags: ['代码解释', '技术文档', '教学', '知识分享'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltin: true
  }
];
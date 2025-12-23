/**
 * Prompts 管理服务
 */

import type { PlatformAdapter } from '../adapters/interface.js';
import type {
  PromptTemplate,
  PromptsData,
} from '../types/claude.js';

/**
 * 路径工具函数
 */
function joinPath(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}

/**
 * Prompts 管理服务
 * 负责管理 CLAUDE.md 文件和 Prompt 模板
 */
export class PromptsManager {
  constructor(private adapter: PlatformAdapter) {}

  /**
   * 获取 CLAUDE.md 文件路径
   * @returns 文件路径
   */
  private getClaudeMdPath(): string {
    return joinPath(
      this.adapter.environment.getUserHomeDir.toString(),
      '.claude',
      'CLAUDE.md'
    ) as any;
  }

  /**
   * 获取 Prompts 数据文件路径
   * @returns 文件路径
   */
  private getPromptsDataPath(): string {
    return joinPath(
      this.adapter.environment.getUserHomeDir.toString(),
      '.claude',
      'prompts-data.json'
    ) as any;
  }

  /**
   * 读取 CLAUDE.md 文件内容
   * @returns 文件内容
   */
  async readClaudeMd(): Promise<string> {
    const claudePath = this.getClaudeMdPath();
    const exists = await this.adapter.fileSystem.exists(claudePath);

    if (!exists) {
      return '';
    }

    return await this.adapter.fileSystem.readFile(claudePath);
  }

  /**
   * 写入 CLAUDE.md 文件内容
   * @param content - 文件内容
   */
  async writeClaudeMd(content: string): Promise<void> {
    const claudePath = this.getClaudeMdPath();

    // 确保目录存在
    const dir = claudePath.substring(0, claudePath.lastIndexOf('/'));
    await this.adapter.fileSystem.mkdir(dir, { recursive: true });

    await this.adapter.fileSystem.writeFile(claudePath, content);
  }

  /**
   * 检查 CLAUDE.md 是否存在
   * @returns 是否存在
   */
  async claudeMdExists(): Promise<boolean> {
    const claudePath = this.getClaudeMdPath();
    return await this.adapter.fileSystem.exists(claudePath);
  }

  /**
   * 读取 Prompts 数据
   * @returns Prompts 数据
   */
  async readPromptsData(): Promise<PromptsData> {
    const dataPath = this.getPromptsDataPath();
    const exists = await this.adapter.fileSystem.exists(dataPath);

    if (!exists) {
      return this.getDefaultPromptsData();
    }

    try {
      const content = await this.adapter.fileSystem.readFile(dataPath);
      return JSON.parse(content);
    } catch {
      return this.getDefaultPromptsData();
    }
  }

  /**
   * 写入 Prompts 数据
   * @param data - Prompts 数据
   */
  async writePromptsData(data: PromptsData): Promise<void> {
    const dataPath = this.getPromptsDataPath();
    const content = JSON.stringify(data, null, 2);

    // 确保目录存在
    const dir = dataPath.substring(0, dataPath.lastIndexOf('/'));
    await this.adapter.fileSystem.mkdir(dir, { recursive: true });

    await this.adapter.fileSystem.writeFile(dataPath, content);
  }

  /**
   * 获取所有模板（包括内置模板）
   * @returns 模板列表
   */
  async getAllTemplates(): Promise<PromptTemplate[]> {
    const data = await this.readPromptsData();
    const builtinTemplates = this.getBuiltinTemplates();
    return [...builtinTemplates, ...data.templates];
  }

  /**
   * 获取用户模板
   * @returns 用户模板列表
   */
  async getUserTemplates(): Promise<PromptTemplate[]> {
    const data = await this.readPromptsData();
    return data.templates;
  }

  /**
   * 添加用户模板
   * @param template - 模板数据
   */
  async addUserTemplate(
    template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltin'>
  ): Promise<void> {
    const data = await this.readPromptsData();

    const newTemplate: PromptTemplate = {
      ...template,
      id: `user_${Date.now()}`,
      isBuiltin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.templates.push(newTemplate);
    await this.writePromptsData(data);
  }

  /**
   * 更新用户模板
   * @param template - 模板数据
   */
  async updateUserTemplate(template: PromptTemplate): Promise<void> {
    const data = await this.readPromptsData();
    const index = data.templates.findIndex(
      t => t.id === template.id && !t.isBuiltin
    );

    if (index === -1) {
      throw new Error('模板不存在或是内置模板');
    }

    data.templates[index] = {
      ...template,
      updatedAt: new Date().toISOString(),
    };

    await this.writePromptsData(data);
  }

  /**
   * 删除用户模板
   * @param templateId - 模板ID
   */
  async deleteUserTemplate(templateId: string): Promise<void> {
    const data = await this.readPromptsData();
    data.templates = data.templates.filter(
      t => t.id !== templateId || t.isBuiltin
    );
    await this.writePromptsData(data);
  }

  /**
   * 将模板内容写入 CLAUDE.md
   * @param template - 模板数据
   */
  async applyTemplate(template: PromptTemplate): Promise<void> {
    await this.writeClaudeMd(template.content);
  }

  /**
   * 获取内置模板
   * @returns 内置模板列表
   */
  private getBuiltinTemplates(): PromptTemplate[] {
    return [
      {
        id: 'builtin_development',
        name: '开发指南',
        description: '通用开发项目指南',
        content: `# Development Guidelines

## Language

Always communicate with me in Chinese.

## Philosophy

### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Process

### 1. Planning & Staging

Break complex work into 3-5 stages. Document in \`IMPLEMENTATION_PLAN.md\`:

\`\`\`markdown
## Stage N: [Name]
**Goal**: [Specific deliverable]
**Success Criteria**: [Testable outcomes]
**Tests**: [Specific test cases]
**Status**: [Not Started|In Progress|Complete]
\`\`\`

### 2. Implementation Flow

1. **Understand** - Study existing patterns in codebase
2. **Test** - Write test first (red)
3. **Implement** - Minimal code to pass (green)
4. **Refactor** - Clean up with tests passing
5. **Commit** - With clear message linking to plan

### 3. When Stuck (After 3 Attempts)

**CRITICAL**: Maximum 3 attempts per issue, then STOP.

1. **Document what failed**
2. **Research alternatives**
3. **Question fundamentals**
4. **Try different angle**
`,
        isBuiltin: true,
        tags: ['development', 'general'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'builtin_code_review',
        name: '代码审查',
        description: '代码审查指南',
        content: `# Code Review Guidelines

## Review Process

1. **Understand the context** - What problem is being solved?
2. **Check for bugs** - Look for edge cases and error handling
3. **Assess readability** - Is the code clear and maintainable?
4. **Verify tests** - Are tests covering the functionality?
5. **Check documentation** - Is the code well-documented?

## Common Issues to Look For

- Missing error handling
- Hardcoded values
- Inconsistent naming
- Lack of tests
- Over-complicated logic
- Missing type definitions
- Security vulnerabilities

## Feedback Style

- Be specific and constructive
- Explain why something is a problem
- Suggest improvements
- Recognize good work
`,
        isBuiltin: true,
        tags: ['review', 'quality'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * 获取默认 Prompts 数据
   * @returns 默认数据
   */
  private getDefaultPromptsData(): PromptsData {
    return {
      version: '1.0.0',
      templates: [],
      lastSyncTime: null,
    };
  }
}

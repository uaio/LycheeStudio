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
  },
  {
    id: 'sop_requirements_analysis',
    name: '需求分析SOP',
    description: '标准化的软件开发需求分析流程，确保需求收集、分析、验证的完整性',
    content: `# 软件需求分析标准操作程序 (SOP)

## 1. 需求收集阶段

### 1.1 初步沟通
- 目标: 了解项目背景和基本需求
- 参与人员: 产品经理、业务分析师、客户代表
- 关键活动:
  - 召开项目启动会议
  - 收集业务文档和资料
  - 了解项目范围和约束条件
  - 识别关键利益相关者

### 1.2 详细调研
- 目标: 深入理解业务流程和用户需求
- 关键活动:
  - 用户访谈和问卷调查
  - 业务流程观察和记录
  - 竞品分析和市场调研
  - 技术可行性评估

## 2. 需求分析阶段

### 2.1 需求分类
- 功能需求: 系统应该具备的具体功能
- 非功能需求: 性能、安全、可用性等质量属性
- 约束需求: 技术栈、法规、预算等限制条件
- 接口需求: 系统间交互和数据交换要求

### 2.2 需求优先级排序
使用MoSCoW方法：
- Must have: 必须实现的核心需求
- Should have: 重要的但非必需的需求
- Could have: 有了更好的需求
- Won't have: 本次不考虑的需求

### 2.3 需求建模
- 用例图: 描述用户与系统的交互
- 活动图: 展示业务流程和工作流
- 状态图: 表示对象状态变化
- 数据流图: 展示数据在系统中的流动

## 3. 需求文档编写

### 3.1 软件需求规格说明书 (SRS)
项目概述
- 项目背景和目标
- 项目范围说明
- 术语和定义

总体描述
- 产品功能概述
- 用户特征
- 运行环境
- 设计和实现约束

具体需求
- 功能需求详述
- 非功能需求详述
- 接口需求详述
- 数据需求详述

### 3.2 用户故事格式
作为一个 [角色]
我希望 [功能描述]
以便 [价值/收益]

验收标准：
- 给定 [前置条件]
- 当 [操作执行]
- 那么 [预期结果]

## 4. 需求验证阶段

### 4.1 需求评审
- 评审类型:
  - 正式评审（会议形式）
  - 走查（逐步检查）
  - 检查（清单验证）
- 评审内容:
  - 需求的完整性
  - 需求的一致性
  - 需求的可测试性
  - 需求的可行性

### 4.2 原型验证
- 低保真原型: 纸质原型或线框图
- 高保真原型: 可交互的界面原型
- 用户测试: 真实用户使用验证

## 5. 需求管理

### 5.1 需求跟踪
- 需求跟踪矩阵: 建立需求与设计、代码、测试的关联
- 变更控制: 需求变更的申请、评估、审批流程
- 版本管理: 需求文档的版本控制和历史记录

### 5.2 风险识别
- 需求风险: 需求不明确、频繁变更
- 技术风险: 技术难度、技术选型
- 资源风险: 人力、时间、预算限制
- 业务风险: 市场变化、竞争压力

## 6. 质量保证

### 6.1 质量检查清单
- [ ] 需求是否完整明确
- [ ] 是否与业务目标一致
- [ ] 是否可测试验证
- [ ] 是否有明确的验收标准
- [ ] 是否考虑了异常情况
- [ ] 是否符合相关法规标准

### 6.2 度量指标
- 需求稳定性指数
- 需求变更率
- 需求覆盖率
- 缺陷密度
- 用户满意度

## 7. 工具和模板

### 7.1 推荐工具
- 需求管理: JIRA, Confluence, Azure DevOps
- 原型设计: Axure, Figma, Sketch
- 文档协作: Notion, SharePoint, Google Docs
- 流程图: Visio, Lucidchart, Draw.io

### 7.2 输出文档
- [ ] 项目启动会议纪要
- [ ] 利益相关者分析表
- [ ] 用户访谈记录
- [ ] 业务流程文档
- [ ] 软件需求规格说明书
- [ ] 原型设计稿
- [ ] 需求评审报告
- [ ] 需求跟踪矩阵

## 项目信息
- 项目名称：{{project_name}}
- 项目经理：{{project_manager}}
- 业务分析师：{{business_analyst}}
- 开始日期：{{start_date}}
- 预计完成：{{estimated_completion}}`,
    category: 'development',
    tags: ['需求分析', 'SOP', '软件开发', '需求管理'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltin: true
  },
  {
    id: 'sop_system_design',
    name: '系统设计SOP',
    description: '完整的系统架构设计标准流程，包括架构设计、接口设计、数据库设计等',
    content: `# 系统设计标准操作程序 (SOP)

## 1. 设计准备阶段

### 1.1 需求理解
- 输入文档:
  - 软件需求规格说明书 (SRS)
  - 用户故事和验收标准
  - 非功能性需求文档
  - 技术约束条件

### 1.2 技术调研
- 技术栈选型:
  - 前端框架选择 (React, Vue, Angular等)
  - 后端技术栈 (Java, Python, Node.js等)
  - 数据库选择 (MySQL, PostgreSQL, MongoDB等)
  - 中间件选择 (Redis, Kafka, RabbitMQ等)

### 1.3 架构模式选择
- 单体架构: 适合小型应用
- 微服务架构: 适合大型分布式系统
- 服务化架构: 介于单体和微服务之间
- 无服务架构: 适合事件驱动型应用

## 2. 架构设计阶段

### 2.1 系统分层架构
表现层 (Presentation)
- Web应用 / 移动端 / 桌面应用

应用层 (Application)
- 业务逻辑 / 工作流 / 服务编排

领域层 (Domain)
- 实体模型 / 业务规则 / 领域服务

基础设施层 (Infrastructure)
- 数据访问 / 外部服务 / 技术服务

### 2.2 微服务拆分原则
- 单一职责原则: 每个服务专注一个业务领域
- 自治性: 服务独立开发、部署、扩展
- 业务能力: 围绕业务能力而非技术层次拆分
- 数据隔离: 每个服务拥有独立的数据存储

### 2.3 关键设计决策
1. 通信机制:
   - 同步调用: REST API, gRPC
   - 异步消息: 事件驱动, 消息队列

2. 数据一致性:
   - 强一致性: 分布式事务, 2PC
   - 最终一致性: 事件溯源, CQRS, Saga模式

3. 缓存策略:
   - 缓存穿透: 布隆过滤器
   - 缓存击穿: 互斥锁, 永不过期
   - 缓存雪崩: 随机过期时间

## 3. 详细设计阶段

### 3.1 接口设计
#### REST API设计规范
用户管理API
/users:
  get:    # 获取用户列表
  post:   # 创建用户
/users/{id}:
  get:    # 获取用户详情
  put:    # 更新用户信息
  delete: # 删除用户

响应格式标准
{
  "code": 200,           # 状态码
  "message": "success",  # 提示信息
  "data": {},            # 响应数据
  "timestamp": 1234567890 # 时间戳
}

#### 数据库设计规范
表命名规范: 业务模块_具体表名 (user_profile)
字段命名规范: 使用下划线分隔 (created_at)
索引命名规范: idx_表名_字段名 (idx_user_email)

CREATE TABLE user_profile (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_user_email (email),
    INDEX idx_user_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

### 3.2 安全设计
#### 认证授权机制
JWT Token结构
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": "12345",
    "username": "john_doe",
    "roles": ["user", "admin"],
    "exp": 1640995200,
    "iat": 1640908800
  }
}

#### 数据加密策略
- 传输加密: HTTPS/TLS 1.3
- 存储加密: AES-256 for sensitive data
- 密码存储: bcrypt with salt
- API签名: HMAC-SHA256

### 3.3 性能优化设计
#### 数据库优化
查询优化示例
EXPLAIN SELECT * FROM orders
WHERE user_id = 123
AND created_at >= '2023-01-01'
ORDER BY created_at DESC
LIMIT 10;

索引优化
CREATE INDEX idx_orders_user_date
ON orders (user_id, created_at DESC);

#### 缓存策略设计
多级缓存架构
L1 Cache (本地缓存): Guava Cache
├── 容量: 1000 entries
├── 过期: 5分钟
└── 淘汰策略: LRU

L2 Cache (分布式缓存): Redis
├── 集群模式: Redis Cluster
├── 持久化: RDB + AOF
└── 高可用: Sentinel + Master-Slave

## 4. 设计文档编写

### 4.1 架构设计文档
系统架构设计文档

## 1. 架构概述
### 1.1 系统目标
### 1.2 架构原则
### 1.3 技术选型

## 2. 系统架构
### 2.1 整体架构图
### 2.2 核心组件说明
### 2.3 部署架构
### 2.4 数据流向

## 3. 详细设计
### 3.1 模块设计
### 3.2 接口设计
### 3.3 数据库设计
### 3.4 安全设计

## 4. 非功能性设计
### 4.1 性能设计
### 4.2 可用性设计
### 4.3 扩展性设计
### 4.4 运维设计

### 4.2 API文档
API接口文档

接口基础信息
- Base URL: https://api.example.com/v1
- 认证方式: Bearer Token
- 数据格式: JSON

用户管理接口

获取用户列表
请求: GET /users
参数:
- page: 页码 (default: 1)
- size: 每页数量 (default: 20)
响应: 用户列表数据

创建用户
请求: POST /users
请求体: 用户信息
响应: 创建结果

## 5. 设计评审阶段

### 5.1 评审检查项
- [ ] 功能性: 是否满足所有功能需求
- [ ] 性能: 是否满足性能指标要求
- [ ] 安全性: 是否有完善的安全措施
- [ ] 可维护性: 代码结构是否清晰
- [ ] 可扩展性: 是否支持未来扩展
- [ ] 可用性: 是否有容错和恢复机制

### 5.2 评审流程
1. 设计人员讲解: 架构师介绍设计方案
2. 技术评审: 技术专家评估技术可行性
3. 业务评审: 产品经理确认业务符合性
4. 运维评审: 运维团队评估部署可行性
5. 安全评审: 安全团队检查安全风险

## 6. 设计工具和模板

### 6.1 设计工具
- 架构图: Draw.io, Lucidchart, Visio
- UML图: PlantUML, StarUML, Enterprise Architect
- API设计: Swagger/OpenAPI, Postman
- 数据库设计: MySQL Workbench, Navicat, ER/Studio

### 6.2 设计模板
- [ ] 架构设计说明书
- [ ] 接口设计文档
- [ ] 数据库设计文档
- [ ] 安全设计方案
- [ ] 部署架构图
- [ ] 数据流图
- [ ] 状态机图
- [ ] 时序图

## 项目信息
- 系统名称：{{system_name}}
- 架构师：{{architect_name}}
- 技术栈：{{tech_stack}}
- 设计开始：{{design_start_date}}
- 预计完成：{{design_completion_date}}`,
    category: 'development',
    tags: ['系统设计', '架构设计', 'SOP', '技术设计'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltin: true
  }
];
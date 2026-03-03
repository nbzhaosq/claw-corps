---
name: claw-corps
description: Multi-agent development orchestration system for OpenClaw - Coordinate AI teams to build complex software projects
homepage: https://github.com/nbzhaosq/claw-corps
metadata:
  {
    "openclaw":
      {
        "emoji": "🦞",
        "requires": { "bins": ["node", "npm"] },
        "install":
          [
            {
              "id": "npm-deps",
              "kind": "npm",
              "cwd": "{baseDir}",
              "label": "Install npm dependencies",
            },
          ],
      },
  }
---

# Claw Corps 🦞

**Multi-agent development orchestration skill for OpenClaw**

Claw Corps 是一个革命性的开发协调系统，通过模拟虚拟"龙虾公司"的方式，使用多个 sub agents（员工）协作完成复杂的软件开发项目。

## 概念

想象你在运营一家软件开发公司：
- 📋 **项目经理** - 拆解任务、协调团队
- 🏗️ **架构师** - 设计系统、选择技术栈
- 💻 **开发者** - 编写代码、实现功能
- 🧪 **测试工程师** - 质量保证、验收测试
- 🎨 **设计师** - UI/UX 设计
- ⚙️ **运维工程师** - 部署、监控

根据项目的复杂程度，Claw Corps 会自动组建合适的团队，并协调他们完成项目。

## 安装

```bash
cd project/claw-corps
npm install
npm link  # 全局安装 CLI
```

## 使用

### 1. 创建项目

```bash
claw-corps init "我的项目" --description "项目描述"
```

### 2. 评估复杂度

```bash
claw-corps assess <project-id>
```

系统会通过交互式问答评估项目复杂度，并建议团队配置。

### 3. 分配团队

```bash
claw-corps assign <project-id>
```

根据评估结果分配团队成员（可以是 sub agents）。

### 4. 开始执行

```bash
claw-corps run <project-id> --workflow hybrid
```

支持的执行模式：
- `serial` - 串行执行（适合简单项目）
- `parallel` - 并行执行（适合独立任务）
- `hybrid` - 混合模式（自动根据依赖关系选择）

### 5. 查看状态

```bash
claw-corps status <project-id>
claw-corps logs <project-id>
```

## CLI 命令

### 项目管理

```bash
claw-corps init <name>              # 创建新项目
claw-corps list [--status <status>] # 列出项目
claw-corps status <project-id>      # 查看项目状态
```

### 团队管理

```bash
claw-corps assess <project-id>      # 评估复杂度
claw-corps assign <project-id>      # 分配团队
```

### 执行控制

```bash
claw-corps run <project-id>         # 开始执行
claw-corps stop <project-id>        # 停止执行
```

### 日志和配置

```bash
claw-corps logs <project-id>        # 查看日志
claw-corps config --list            # 配置管理
```

## 复杂度等级

| 等级 | 描述 | 团队配置 |
|------|------|---------|
| **Simple** | 简单项目 | 1-2 个开发者 |
| **Medium** | 中等项目 | PM + 开发者 + QA |
| **Complex** | 复杂项目 | PM + 架构师 + 开发者 + QA + 设计师 |
| **Enterprise** | 企业级 | 完整团队 + DevOps |

## 工作流程

```
接单 → 分析 → 排人 → 分工 → 执行 → 验收 → 交付
```

每个阶段都有对应的状态跟踪和日志记录。

## 数据存储

所有项目数据存储在 `~/.claw-corps/` 目录：

```
~/.claw-corps/
├── projects/
│   └── {project-id}/
│       ├── meta.json          # 项目元信息
│       ├── team.json          # 团队配置
│       ├── progress.json      # 进度追踪
│       └── logs/
│           ├── workflow.log   # 工作流日志
│           └── {agent-id}.log # Agent 日志
├── templates/                 # Prompt 模板
└── config.json               # 全局配置
```

## 与 OpenClaw 集成

### 作为 Skill 使用

在你的 OpenClaw 工作区中引用此 skill：

```markdown
使用 claw-corps 创建一个新项目...
```

OpenClaw 会自动调用相应的 CLI 命令。

### Sub Agent 集成

Claw Corps 通过 OpenClaw 的 `sessions_spawn` API 创建 sub agents：

```javascript
// 代码示例在 src/core/orchestrator.js
await sessions_spawn({
  runtime: "acp",
  agentId: "claude-code",
  task: taskDescription,
  mode: "session",
  thread: true
});
```

### Agent 通信

- 使用 `sessions_send` 发送消息给 sub agents
- 使用 `sessions_history` 获取工作日志
- 使用 `subagents` 管理运行中的 agents

### 工作模式

**🔧 模拟模式**（默认）
- 不在 OpenClaw 环境时自动使用
- 任务执行为模拟延时
- 适合测试和演示

**🚀 真实模式**
- 检测到 OpenClaw 环境时自动启用
- 创建真实的 sub agents
- 通过 OpenClaw API 通信
- 实时执行和跟踪

详细集成文档：[docs/openclaw-integration.md](docs/openclaw-integration.md)

## 示例工作流

### 创建一个 Web 应用

```bash
# 1. 初始化
claw-corps init "电商网站" \
  --description "一个完整的电商平台，包含用户系统、商品管理、购物车、订单系统和支付集成"

# 2. 评估（交互式）
claw-corps assess proj_abc123
# 输出: 复杂度: COMPLEX, 建议: PM + 架构师 + 2个开发者 + QA + 设计师

# 3. 分配团队
claw-corps assign proj_abc123

# 4. 开始执行
claw-corps run proj_abc123 --workflow hybrid

# 5. 监控进度
claw-corps status proj_abc123
claw-corps logs proj_abc123 -f
```

## 开发

### 项目结构

```
claw-corps/
├── src/
│   ├── index.js           # CLI 入口
│   ├── commands/          # CLI 命令
│   │   ├── init.js
│   │   ├── list.js
│   │   ├── status.js
│   │   ├── assess.js
│   │   ├── assign.js
│   │   ├── run.js
│   │   ├── stop.js
│   │   ├── logs.js
│   │   └── config.js
│   └── core/             # 核心逻辑
│       ├── storage.js    # 数据存储
│       ├── complexity.js # 复杂度评估
│       └── orchestrator.js # Agent 调度
├── docs/
│   ├── architecture.md   # 架构设计
│   └── task-breakdown.md # 任务拆解
├── package.json
└── SKILL.md             # 本文件
```

### 扩展

#### 添加新角色

在 `src/core/complexity.js` 中定义新角色：

```javascript
export const ROLE_DEFINITIONS = {
  // ...existing roles
  'data-scientist': {
    name: '数据科学家',
    emoji: '📊',
    description: '负责数据分析和机器学习模型',
    systemPrompt: `你是一位数据科学家...`
  }
};
```

#### 自定义复杂度算法

修改 `ComplexityAssessor.assess()` 方法中的评分逻辑。

## 限制

- 真实 sub agent 执行需要 OpenClaw 运行时环境
- 在模拟模式下，任务执行为延时模拟（不生成实际代码）
- 暂不支持 Web UI（规划中）
- 当前版本不支持 agent 间的直接通信（规划中）

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT

---

**Created by Nick Zhao | Powered by OpenClaw 🦞**

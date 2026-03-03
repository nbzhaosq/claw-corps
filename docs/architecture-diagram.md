# OpenClaw Subagent + Claw Corps + Claude Code/OpenCode 架构关系

## 🏗️ 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        OpenClaw 平台                          │
│  (智能体编排和管理平台)                                        │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Main Agent (例如: codemanager)                        │  │
│  │  - 你的主要助手                                          │  │
│  │  - 可以创建 subagents                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           │ sessions_spawn                    │
│                           ↓                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Subagents (并发子智能体)                       │  │
│  │                                                          │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │ Agent 1  │  │ Agent 2  │  │ Agent 3  │  ...       │  │
│  │  │ (独立会话)│  │ (独立会话)│  │ (独立会话)│            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  │                                                          │  │
│  │  特性:                                                   │  │
│  │  - 并发执行 (受 maxConcurrent 限制)                      │  │
│  │  - 自动队列管理                                          │  │
│  │  - 完成后自动通告结果                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🦞 Claw Corps 在其中的位置

```
┌─────────────────────────────────────────────────────────────┐
│                       Claw Corps                             │
│              (多 agent 开发协调系统)                          │
│                                                               │
│  定位: 项目管理层                                             │
│  - 评估项目复杂度                                             │
│  - 分配团队角色                                               │
│  - 协调 subagents 工作                                       │
│  - 追踪进度和结果                                             │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │  工作流程:                                            │    │
│  │                                                       │    │
│  │  1. init → 创建项目                                   │    │
│  │  2. assess → 评估复杂度                               │    │
│  │  3. assign → 分配团队 (PM, 架构师, 开发者, QA...)     │    │
│  │  4. run → 创建 subagents 执行任务                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ 通过 sessions_spawn 调用
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              OpenClaw Subagents API                          │
│         (实际创建和运行子智能体的引擎)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Claude Code / OpenCode 的角色

```
┌─────────────────────────────────────────────────────────────┐
│              Coding Agents (写代码的智能体)                   │
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Claude Code      │         │  OpenCode         │         │
│  │  (Anthropic)      │         │  (开源替代)        │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                               │
│  能力:                                                        │
│  - 真正编写代码                                               │
│  - 执行 shell 命令                                            │
│  - 读写文件                                                   │
│  - 运行测试                                                   │
│  - Git 操作                                                   │
│                                                               │
│  特点:                                                        │
│  - 专注于编程任务                                              │
│  - 有完整的开发工具链                                          │
│  - 可以作为 subagent 被调用                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 三者的关系

### 关系图

```
┌──────────────┐
│   OpenClaw   │ ← 平台层：提供智能体运行环境
│   (平台)     │   - subagents 机制
└──────┬───────┘   - API 接口
       │
       ├─────────────────────┐
       │                     │
       ↓                     ↓
┌──────────────┐      ┌──────────────┐
│  Claw Corps  │      │ Claude Code  │
│  (协调层)    │      │  (执行层)     │
└──────┬───────┘      └──────────────┘
       │                     ↑
       │  调度/协调           │
       │                     │
       └─────────────────────┘
              通过 subagent 调用
```

### 层次关系

| 层次 | 组件 | 职责 |
|------|------|------|
| **平台层** | OpenClaw | 提供智能体运行环境、subagents API、并发控制 |
| **协调层** | Claw Corps | 项目管理、团队分配、任务调度、进度追踪 |
| **执行层** | Claude Code/OpenCode | 真正写代码、执行任务、生成产出 |

---

## 🎯 工作流程

### 完整的协作流程

```
1. 用户请求
   "帮我创建一个电商项目"
         │
         ↓
2. Claw Corps (协调层)
   - 评估复杂度: Complex (需要完整团队)
   - 分配角色: PM + 架构师 + 开发者 + QA + 设计师
   - 生成任务列表
         │
         ↓
3. 通过 sessions_spawn 创建 subagents
   │
   ├─→ sessions_spawn({
   │     agentId: "codemanager",
   │     task: "PM: 分析需求..."
   │   })
   │
   ├─→ sessions_spawn({
   │     agentId: "claude-code",  ← 这里调用 coding agent
   │     task: "Developer: 实现 xxx 功能",
   │     cwd: "/path/to/project"
   │   })
   │
   └─→ sessions_spawn({
         agentId: "claude-code",
         task: "QA: 编写测试..."
       })
         │
         ↓
4. OpenClaw (平台层)
   - 创建独立会话
   - 并发执行 (受 maxConcurrent 限制)
   - 自动管理队列
         │
         ↓
5. Claude Code/OpenCode (执行层)
   - PM: 生成需求文档
   - Developer: 编写真实代码
   - QA: 编写测试文件
         │
         ↓
6. 自动通告结果
   - 运行时间、token 使用量
   - 执行摘要
   - 产出文件
         │
         ↓
7. Claw Corps 汇总
   - 更新项目进度
   - 记录执行日志
   - 生成交付报告
```

---

## 📊 对比表格

| 维度 | OpenClaw Subagent | Claw Corps | Claude Code/OpenCode |
|------|-------------------|------------|----------------------|
| **类型** | 平台机制 | 应用/工具 | 执行器 |
| **职责** | 并发控制、会话管理 | 项目协调、任务调度 | 代码编写、任务执行 |
| **位置** | 底层 API | 中间层应用 | 执行层 agent |
| **关系** | 提供能力 | 使用 subagent API | 被作为 subagent 调用 |
| **产出** | 运行环境 | 项目管理、进度追踪 | 代码、文档、测试 |

---

## 🔧 配置和使用

### 配置示例

```json5
// OpenClaw 配置
{
  agents: {
    list: [
      {
        id: "codemanager",  // Claw Corps 使用的 agent
        subagents: {
          allowAgents: ["claude-code", "opencode"]  // 允许调用 coding agents
        }
      },
      {
        id: "claude-code",  // Claude Code agent
        model: "claude-3-opus",
        tools: {
          allow: ["read", "write", "edit", "exec", "process"]
        }
      }
    ]
  }
}
```

### 使用示例

```javascript
// 在 Claw Corps 中
const orchestrator = new Orchestrator(projectId);

// 创建 PM subagent
await sessions_spawn({
  agentId: "codemanager",
  task: "PM: 分析需求...",
  label: "PM-项目名"
});

// 创建 Developer subagent (使用 Claude Code)
await sessions_spawn({
  agentId: "claude-code",  // ← 使用 coding agent
  task: "Developer: 实现 xxx 功能",
  cwd: "/path/to/project"
});
```

---

## 💡 关键理解

### 1. OpenClaw Subagent
- **是平台能力**，不是具体应用
- 提供并发创建和管理子智能体的机制
- 所有 agent 都通过这个机制运行

### 2. Claw Corps
- **是应用层工具**，使用 subagent API
- 专注于软件开发的项目管理
- 负责协调多个 subagents 协作

### 3. Claude Code/OpenCode
- **是执行层 agent**，被 subagent 调用
- 真正编写代码和执行任务
- 作为工具被 Claw Corps 调度

---

## 🎯 实际使用场景

### 场景 1：只用 OpenClaw Subagent

```javascript
// 直接创建子智能体
await sessions_spawn({
  task: "帮我分析这段代码",
  label: "code-review"
});
```

**适合：** 简单的单任务

---

### 场景 2：Claw Corps + Subagent

```bash
# 使用 Claw Corps 管理项目
claw-corps init "我的项目"
claw-corps assess <id>
claw-corps assign <id>
claw-corps run <id>  # 内部调用 sessions_spawn
```

**适合：** 需要协调多个角色的项目

---

### 场景 3：Claw Corps + Subagent + Claude Code

```javascript
// Claw Corps 协调，Claude Code 执行
await sessions_spawn({
  agentId: "claude-code",  // 真正写代码
  task: "实现用户认证模块",
  cwd: projectDir
});
```

**适合：** 需要真正编写代码的项目

---

## 🎊 总结

**关系本质：**

```
OpenClaw Subagent (平台)
    ↓ 提供 API
Claw Corps (应用)
    ↓ 调度任务
Claude Code/OpenCode (执行)
    ↓ 产出代码
```

**选择建议：**
- 简单任务 → 直接用 subagent
- 项目管理 → 用 Claw Corps
- 真写代码 → Claw Corps + Claude Code

**当前 Claw Corps：**
- ✅ 已实现项目管理流程
- ✅ 已集成 OpenClaw subagent API
- ⚠️ 需要配置 Claude Code/OpenCode agent 才能真正写代码

---

**版本**: 1.0
**日期**: 2026-03-03

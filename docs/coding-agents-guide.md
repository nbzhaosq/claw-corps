# 🦞 Claw Corps + Coding Agents 使用指南

## 概念

Claw Corps 会**根据角色自动选择**合适的 agent：

```
📋 PM / 🏗️ 架构师 / 🎨 设计师 → codemanager (管理任务)
💻 Developer / 🧪 QA / 👨‍💻 Senior Dev → claude-code (代码任务) ⭐
```

---

## 🚀 在 OpenClaw 中使用

### 1. 创建项目

```javascript
// 在 OpenClaw 会话中
const projectId = 'proj_xxx';  // 已创建的项目

// 导入 Claw Corps 集成模块
const { runProjectFromClawCorps } = await import('./src/openclaw-integration.js');

// 运行项目（自动使用 coding agents）
await runProjectFromClawCorps(projectId);
```

### 2. 自动分配 coding agents

```javascript
const { createTeamWithCodingAgents } = await import('./src/openclaw-integration.js');

// 创建团队（自动区分代码/非代码任务）
const runs = await createTeamWithCodingAgents(projectId, {
  codingAgent: 'claude-code',    // 代码任务用的 agent
  managerAgent: 'codemanager',    // 管理任务用的 agent
  timeout: 300                    // 超时（秒）
});
```

---

## 📊 工作流程

### 完整流程

```
1. 创建项目
   claw-corps init "项目名" --description "描述"

2. 评估复杂度
   claw-corps assess <id> --tech-stack Node.js --features 5 --accept

3. 分配团队
   claw-corps assign <id> --confirm

4. 在 OpenClaw 中运行（使用 coding agents）
   await runProjectFromClawCorps(projectId)

   自动执行:
   ├─ PM (codemanager) → 分析需求
   ├─ 架构师 (codemanager) → 设计架构
   ├─ Developer (claude-code) → 真正写代码 ✨
   └─ QA (claude-code) → 编写测试 ✨
```

---

## 🎯 角色与 Agent 映射

| 角色 | Agent | 原因 |
|------|-------|------|
| 📋 项目经理 | codemanager | 管理任务，不写代码 |
| 🏗️ 架构师 | codemanager | 设计任务，不写代码 |
| 💻 开发者 | **claude-code** | 需要写代码 ⭐ |
| 👨‍💻 高级开发者 | **claude-code** | 需要写代码 ⭐ |
| 🧪 测试工程师 | **claude-code** | 需要写测试 ⭐ |
| 🎨 设计师 | codemanager | 设计任务，不写代码 |

---

## 🔧 配置

### OpenClaw 配置

确保 `~/.config/openclaw/config.json` 中允许 coding agents:

```json5
{
  agents: {
    list: [
      {
        id: "codemanager",
        subagents: {
          allowAgents: ["claude-code", "opencode"]  // 允许调用 coding agents
        }
      }
    ]
  }
}
```

### 项目配置

在创建项目时指定 coding agent:

```bash
# 使用 claude-code（默认）
claw-corps init "项目" --tool claude-code

# 或使用 opencode
claw-corps init "项目" --tool opencode
```

---

## 💡 使用示例

### 示例 1：全栈 Web 应用

```javascript
// 1. 创建项目
claw-corps init "电商平台" \
  --description "全栈电商应用，包含用户系统、商品管理、订单处理" \
  --tool claude-code

// 2. 评估
claw-corps assess proj_xxx \
  --tech-stack React Node.js Express PostgreSQL Redis \
  --features 15 \
  --integrations 5 \
  --needs-ui \
  --accept

// 3. 分配
claw-corps assign proj_xxx --confirm

// 4. 在 OpenClaw 中运行
const { runProjectFromClawCorps } = await import('./src/openclaw-integration.js');

await runProjectFromClawCorps('proj_xxx', {
  codingAgent: 'claude-code',
  workflow: 'hybrid'
});

// 结果:
// - PM (codemanager) → 需求文档
// - 架构师 (codemanager) → 架构文档
// - Developer (claude-code) → 真实代码 ✨
// - QA (claude-code) → 测试代码 ✨
// - 设计师 (codemanager) → UI 设计
```

### 示例 2：API 服务

```javascript
// 1. 创建
claw-corps init "REST API" \
  --description "用户认证和数据管理 API" \
  --tool opencode  // 使用 opencode

// 2-3... 同上

// 4. 运行
await runProjectFromClawCorps('proj_xxx', {
  codingAgent: 'opencode'  // 使用 opencode
});

// Developer 和 QA 会用 opencode 写代码
```

---

## 🎨 高级用法

### 自定义 Agent 映射

```javascript
const { createTeamWithCodingAgents } = await import('./src/openclaw-integration.js');

// 完全自定义
await createTeamWithCodingAgents(projectId, {
  codingAgent: 'claude-code',      // 代码任务
  managerAgent: 'main',             // 管理任务用不同的 agent
  timeout: 600                      // 10分钟超时
});
```

### 混合使用多个 Coding Agents

```javascript
// 可以在同一个项目中混合使用
// 例如：前端用 claude-code，后端用 opencode

// 1. 先用 claude-code 完成前端
await createTeamWithCodingAgents(projectId, {
  codingAgent: 'claude-code'
});

// 等待完成后，再用 opencode 完成后端
await createTeamWithCodingAgents(projectId, {
  codingAgent: 'opencode'
});
```

---

## 📊 监控和日志

### 查看活跃的子智能体

```bash
# 在 OpenClaw 聊天中
/subagents list
```

### 查看项目日志

```bash
claw-corps logs <projectId>
```

### 查看项目状态

```bash
claw-corps status <projectId>
```

---

## 🎯 最佳实践

### 1. 选择合适的 Coding Agent

| 场景 | 推荐 Agent |
|------|-----------|
| 复杂业务逻辑 | claude-code |
| 简单 CRUD | opencode |
| 前端开发 | claude-code |
| 后端 API | opencode 或 claude-code |
| 测试代码 | claude-code |

### 2. 超时设置

```javascript
// 简单任务：5分钟
await runProjectFromClawCorps(projectId, { timeout: 300 });

// 复杂任务：10-15分钟
await runProjectFromClawCorps(projectId, { timeout: 900 });
```

### 3. 工作流选择

- **serial**: 适合简单项目，串行执行
- **parallel**: 适合独立任务，并发执行
- **hybrid**: 适合复杂项目，自动处理依赖

---

## 🔍 故障排查

### Coding Agent 未被调用

**症状：** Developer/QA 用的是 codemanager

**解决：**
1. 检查 OpenClaw 配置中的 `allowAgents`
2. 确认项目 tool 设置正确
3. 使用 `runProjectFromClawCorps()` 而非 CLI

### 子智能体失败

**症状：** runId 存在但状态为 failed

**解决：**
1. 查看日志：`/subagents log <runId>`
2. 检查 coding agent 配置
3. 确认模型可用

---

## 📚 相关文档

- [OpenClaw Subagents 文档](https://docs.openclaw.ai/zh-CN/tools/subagents)
- [架构关系图](./architecture-diagram.md)
- [API 集成说明](./openclaw-integration.md)

---

**版本**: 0.3.0
**更新日期**: 2026-03-03
**关键变更**: 自动根据角色选择 coding agents

# OpenClaw Subagents 集成说明

## 概述

Claw Corps 使用 OpenClaw **原生的 subagents API** 来创建并发子智能体！

## 🎯 工作原理

### Subagents 机制

```
Claw Corps (主智能体)
  ├─ PM Subagent (独立会话, 并发运行)
  ├─ 架构师 Subagent (独立会话, 并发运行)
  ├─ 开发者 Subagent (独立会话, 并发运行)
  ├─ QA Subagent (独立会话, 并发运行)
  └─ 设计师 Subagent (独立会话, 并发运行)

完成后 → 自动通告结果回主聊天
```

### 关键特性

1. **真正并发** - 多个子智能体同时运行
2. **自动队列** - 受 `maxConcurrent` 限制，自动排队
3. **非阻塞** - `sessions_spawn` 立即返回
4. **自动通告** - 完成后自动汇报结果到主聊天
5. **独立会话** - 每个子智能体有自己的上下文

---

## ⚙️ 配置

### 1. Allow Agents 配置

编辑 OpenClaw 配置文件（`~/.config/openclaw/config.json`）：

```json5
{
  agents: {
    list: [
      {
        id: "codemanager",
        subagents: {
          allowAgents: ["*"]  // 允许任意 agentId
          // 或指定特定 agents: ["codemanager"]
        }
      }
    ]
  }
}
```

### 2. 并发控制

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxConcurrent: 8,  // 最多同时8个子智能体
        archiveAfterMinutes: 60,  // 60分钟后自动归档
        model: "claude-3-opus"  // 默认模型
      }
    }
  }
}
```

### 3. 工具策略

```json5
{
  tools: {
    subagents: {
      tools: {
        deny: ["gateway", "cron"],  // 禁止的工具
        // allow: ["read", "exec", "process"]  // 或只允许特定工具
      }
    }
  }
}
```

---

## 🚀 使用方式

### 检查环境

```bash
claw-corps env
```

输出示例：
```
🔍 OpenClaw 环境检查

📍 OpenClaw 环境:
  ✅ 运行在 OpenClaw 环境中

🤖 Subagents 支持:
  ✅ Subagents API 可用
  ✅ 并发支持: 0 个活跃 subagent

🎯 运行模式:
  ✅ 真实模式
  • 子智能体会真实创建
  • 自动并发控制
  • 完成后自动通告结果
```

### 创建项目

```bash
# 1. 初始化
claw-corps init "我的项目" --description "项目描述"

# 2. 评估复杂度
claw-corps assess <id> --tech-stack Node.js React --features 10 --accept

# 3. 分配团队
claw-corps assign <id> --confirm

# 4. 执行项目
claw-corps run <id> --workflow hybrid
```

### 查看执行

```bash
# 查看状态
claw-corps status <id>

# 查看日志
claw-corps logs <id>

# 查看团队
claw-corps team <id>
```

---

## 🔧 API 说明

### SubagentsClient

```javascript
const client = new SubagentsClient(projectId);

// 创建子智能体（非阻塞）
const result = await client.spawn({
  role: 'pm',
  task: '分析需求...',
  label: 'PM-项目名称',
  model: 'claude-3-opus',
  thinking: 'high',
  timeout: 300
});
// 返回: { runId, sessionKey, status: 'accepted' }

// 并行创建
await client.spawnParallel([agent1, agent2, agent3]);

// 查看活跃的
const active = await client.listActive();

// 发送消息
await client.send(runId, '新任务...');

// 引导方向
await client.steer(runId, '调整方向...');

// 停止
await client.kill(runId);
await client.killAll();

// 等待完成
await client.waitForCompletion(runId, timeout);
await client.waitForAll(timeout);
```

### Orchestrator

```javascript
const orchestrator = new Orchestrator(projectId, {
  model: 'claude-3-opus',      // 覆盖模型
  thinking: 'high',             // 覆盖思考级别
  timeout: 600,                 // 超时（秒）
  workDir: '/path/to/code'      // 工作目录
});

// 初始化团队
await orchestrator.initializeTeam();

// 串行执行
await orchestrator.executeSerial(tasks);

// 并行执行
await orchestrator.executeParallel(tasks);

// 混合执行
await orchestrator.executeHybrid(tasks, dependencies);

// 停止
await orchestrator.stopAll();
```

---

## 📊 模型选择

根据角色和复杂度自动选择模型：

| 角色 | 复杂项目 | 中等项目 | 简单项目 |
|------|---------|---------|---------|
| PM | claude-3-opus | claude-3-sonnet | - |
| 架构师 | claude-3-opus | claude-3-sonnet | - |
| 开发者 | claude-3-sonnet | claude-3-sonnet | claude-3-sonnet |
| QA | claude-3-sonnet | claude-3-sonnet | - |
| 设计师 | claude-3-sonnet | claude-3-sonnet | claude-3-sonnet |

思考级别：
- PM, 架构师: `high`
- 开发者, QA, 设计师: `medium`

---

## 🎭 模式对比

### 真实模式（在 OpenClaw 环境中）

- ✅ 子智能体真实创建
- ✅ 自动并发控制
- ✅ 完成后自动通告
- ✅ 独立会话和上下文
- ✅ 真正的并行执行

### 模拟模式（不在 OpenClaw 环境中）

- ⚠️ 子智能体为模拟
- ⚠️ 简单延时模拟
- ⚠️ 适合测试和演示
- ⚠️ 不消耗实际成本

---

## 💡 最佳实践

### 1. 合理设置并发数

```json5
{
  agents: {
    defaults: {
      subagents: {
        maxConcurrent: 5  // 根据项目复杂度调整
      }
    }
  }
}
```

### 2. 为子智能体设置经济模型

```json5
{
  agents: {
    defaults: {
      subagents: {
        model: "claude-3-sonnet"  // 使用经济模型
      }
    }
  }
}
```

### 3. 控制超时时间

```bash
claw-corps run <id> --timeout 600  # 10分钟超时
```

### 4. 监控活跃的 subagents

```bash
# 在 OpenClaw 聊天中
/subagents list
/subagents info <runId>
/subagents log <runId>
```

---

## 🔍 故障排查

### Subagents 不可用

**症状：** 运行在模拟模式

**解决：**
1. 确认在 OpenClaw 会话中运行
2. 检查 `agents.list[].subagents.allowAgents` 配置
3. 运行 `claw-corps env` 检查环境

### 并发数不足

**症状：** 子智能体排队等待

**解决：** 增加 `maxConcurrent` 配置

### 超时失败

**症状：** 子智能体超时

**解决：** 增加 `--timeout` 参数

---

## 📚 相关文档

- [OpenClaw Subagents 文档](https://docs.openclaw.ai/zh-CN/tools/subagents)
- [Claw Corps 架构设计](./architecture.md)
- [任务拆解说明](./task-breakdown.md)

---

**版本**: 0.2.0
**更新日期**: 2026-03-03
**重大变更**: 使用原生 subagents API 替代 ACP runtime

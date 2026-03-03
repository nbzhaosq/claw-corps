# Claw Corps - 架构设计

## 概念模型

### 龙虾公司 (Claw Corps)
一个虚拟的软件开发公司，通过 sub agent 协作完成复杂项目。

### 核心流程
```
接单 → 分析 → 排人 → 分工 → 执行 → 验收 → 交付
```

## 角色体系

### 角色定义
| 角色 | 职责 | 复杂度要求 |
|------|------|-----------|
| 项目经理 (PM) | 任务拆解、协调、进度跟踪 | 中等及以上 |
| 架构师 (Architect) | 系统设计、技术选型、架构文档 | 复杂项目 |
| 开发者 (Developer) | 编写代码、实现功能 | 所有项目 |
| 测试 (QA) | 编写测试、验收检查 | 中等及以上 |
| 设计 (Designer) | UI/UX设计、视觉方案 | 需要前端的项目 |

### 复杂度分级
- **简单 (Simple)**: 1-2个开发者
- **中等 (Medium)**: PM + 开发者 + QA
- **复杂 (Complex)**: 完整团队（PM + 架构师 + 开发者 + QA + 设计）
- **超复杂 (Enterprise)**: 多个开发小组 + 专项角色

## 数据结构

### 目录结构
```
~/.claw-corps/
├── projects/
│   └── {project-id}/
│       ├── meta.json          # 项目元信息
│       ├── team.json          # 团队配置
│       ├── progress.json      # 进度追踪
│       └── logs/
│           ├── {agent-id}.log # 各员工日志
│           └── workflow.log   # 工作流日志
├── templates/
│   └── agent-prompts/         # 各角色的prompt模板
└── config.json                # 全局配置
```

### meta.json
```json
{
  "id": "proj_abc123",
  "name": "项目名称",
  "description": "项目描述",
  "complexity": "medium",
  "tool": "claude-code",
  "status": "running",
  "created_at": "2026-03-03T21:00:00+08:00",
  "updated_at": "2026-03-03T21:30:00+08:00"
}
```

### team.json
```json
{
  "project_id": "proj_abc123",
  "members": [
    {
      "role": "pm",
      "agent_id": "agent_pm_001",
      "status": "active",
      "assigned_at": "2026-03-03T21:00:00+08:00"
    },
    {
      "role": "developer",
      "agent_id": "agent_dev_001",
      "status": "active",
      "assigned_at": "2026-03-03T21:00:00+08:00"
    }
  ]
}
```

### progress.json
```json
{
  "project_id": "proj_abc123",
  "stages": [
    {
      "name": "analysis",
      "status": "completed",
      "started_at": "...",
      "completed_at": "..."
    },
    {
      "name": "development",
      "status": "in_progress",
      "started_at": "...",
      "tasks": [
        {
          "id": "task_001",
          "description": "实现用户认证模块",
          "assignee": "agent_dev_001",
          "status": "in_progress"
        }
      ]
    }
  ]
}
```

## Agent 协作模式

### 1. 串行协作
适用于有依赖关系的任务
```
架构师 → 开发者 → 测试
```

### 2. 并行协作
适用于独立任务
```
开发者A ┐
开发者B ├→ 测试
开发者C ┘
```

### 3. 混合协作
```
        ┌→ 开发者A →┐
架构师 →├→ 开发者B →┼→ 测试
        └→ 开发者C →┘
```

## 技术实现

### Sub Agent 调用
```javascript
// 通过 ACP 方式调用
const agent = await sessions_spawn({
  runtime: "acp",
  agentId: "claude-code", // 或 "opencode"
  task: taskDescription,
  mode: "session",
  thread: true
});
```

### 工具选择
- **claude-code**: 默认，功能全面
- **opencode**: 备选，特定场景

### Agent 通信
- 通过 sessions_send 发送消息
- 通过 sessions_history 获取工作日志
- 通过 progress.json 共享状态

## 复杂度判断算法

### 评估维度
1. **功能点数量**: 需求中的功能模块数
2. **技术栈复杂度**: 涉及的技术数量和难度
3. **集成需求**: 需要对接的外部系统
4. **UI/UX需求**: 界面复杂度
5. **非功能需求**: 性能、安全、可扩展性要求

### 判断逻辑
```javascript
function assessComplexity(requirements) {
  let score = 0;
  
  // 功能点评分
  score += countFeatures(requirements) * 2;
  
  // 技术栈评分
  score += assessTechStack(requirements.techStack);
  
  // 集成评分
  score += requirements.integrations?.length * 5 || 0;
  
  // UI需求评分
  if (requirements.needsUI) score += 10;
  
  // 映射到复杂度等级
  if (score < 20) return 'simple';
  if (score < 40) return 'medium';
  if (score < 70) return 'complex';
  return 'enterprise';
}
```

## 下一步

1. 实现 CLI 入口
2. 实现复杂度评估
3. 实现团队分配逻辑
4. 实现 agent 调度器
5. 实现进度追踪
6. 编写 SKILL.md

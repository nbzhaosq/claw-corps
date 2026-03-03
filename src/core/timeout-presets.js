/**
 * 推荐的 subagent 超时配置
 */

export const TIMEOUT_PRESETS = {
  // 简单任务（文档、配置）
  simple: {
    pm: 180,          // 3分钟
    architect: 180,   // 3分钟
    designer: 180,    // 3分钟
  },

  // 编码任务（需要更多时间）
  coding: {
    developer: 900,         // 15分钟 ⭐
    'senior-developer': 1200, // 20分钟 ⭐⭐
    qa: 600,               // 10分钟 ⭐
  },

  // 复杂项目
  complex: {
    developer: 1800,       // 30分钟 ⭐⭐⭐
    'senior-developer': 2400, // 40分钟
    qa: 900,              // 15分钟
  },

  // 企业级项目
  enterprise: {
    developer: 3600,       // 60分钟 ⭐⭐⭐⭐
    'senior-developer': 4800, // 80分钟
    qa: 1800,             // 30分钟
  }
};

/**
 * 根据项目复杂度选择超时配置
 */
export function selectTimeout(role, complexity) {
  const level = complexity.toLowerCase();

  if (level === 'simple') {
    return TIMEOUT_PRESETS.simple[role] || 180;
  }

  if (level === 'medium') {
    // Medium 项目：编码任务用更长时间
    if (TIMEOUT_PRESETS.coding[role]) {
      return TIMEOUT_PRESETS.coding[role];
    }
    return TIMEOUT_PRESETS.simple[role] || 180;
  }

  if (level === 'complex') {
    if (TIMEOUT_PRESETS.complex[role]) {
      return TIMEOUT_PRESETS.complex[role];
    }
    return 600; // 默认 10分钟
  }

  if (level === 'enterprise') {
    if (TIMEOUT_PRESETS.enterprise[role]) {
      return TIMEOUT_PRESETS.enterprise[role];
    }
    return 900; // 默认 15分钟
  }

  return 300; // 默认 5分钟
}

/**
 * 示例用法
 */
export const EXAMPLES = {
  simple: `
// 简单项目
claw-corps run proj_xxx --timeout 180
`,

  medium: `
// 中等项目
claw-corps run proj_xxx --timeout 600
`,

  complex: `
// 复杂项目
claw-corps run proj_xxx --timeout 1800
`,

  manual: `
// 手动控制每个角色
await sessions_spawn({
  agentId: 'claude-code',
  task: '实现完整功能',
  runTimeoutSeconds: 1800  // 30分钟 ⭐
})
`
};

/**
 * ACP Runtime 集成
 * 使用 ACP runtime 调用 coding agents
 */

import { sessions_spawn } from 'openclaw';

/**
 * ACP 支持的 harness IDs
 */
export const ACP_HARNESS_IDS = ['claude', 'opencode', 'codex', 'pi', 'gemini'];

/**
 * 检测是否是 ACP harness
 */
export function isAcpHarness(agentId) {
  return ACP_HARNESS_IDS.includes(agentId);
}

/**
 * 使用 ACP runtime 创建 coding agent
 */
export async function spawnAcpAgent(options) {
  const { agentId, task, cwd, label, model, thinking, timeout } = options;

  if (!isAcpHarness(agentId)) {
    throw new Error(`${agentId} is not a valid ACP harness. Supported: ${ACP_HARNESS_IDS.join(', ')}`);
  }

  const result = await sessions_spawn({
    runtime: "acp",              // ← 使用 ACP runtime
    agentId,                     // ACP harness id
    task,
    cwd,                         // 工作目录（重要！）
    label,
    model,
    thinking,
    runTimeoutSeconds: timeout || 600
  });

  return result;
}

/**
 * 智能选择 runtime 和 agentId
 */
export function selectRuntimeAndAgentId(options) {
  const { role, codingAgent = 'claude', managerAgent = 'codemanager' } = options;

  // Coding roles 使用 ACP runtime
  const codingRoles = ['developer', 'senior-developer', 'qa'];

  if (codingRoles.includes(role)) {
    return {
      runtime: 'acp',
      agentId: codingAgent  // 'claude', 'opencode', etc.
    };
  }

  // Management roles 使用 native subagent
  return {
    runtime: 'subagent',  // 或省略（默认）
    agentId: managerAgent
  };
}

/**
 * 示例用法
 */
export const EXAMPLES = {
  developer: `
// Developer 使用 ACP runtime + Claude Code
await spawnAcpAgent({
  agentId: 'claude',
  task: '实现用户认证模块',
  cwd: '/path/to/project'
})
`,

  opencode: `
// 使用 OpenCode
await spawnAcpAgent({
  agentId: 'opencode',
  task: '优化性能',
  cwd: '/path/to/project'
})
`,

  pm: `
// PM 使用 native subagent
await sessions_spawn({
  runtime: 'subagent',  // 或省略
  agentId: 'codemanager',
  task: '分析需求'
})
`
};

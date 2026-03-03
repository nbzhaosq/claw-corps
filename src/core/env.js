/**
 * 环境检测 - 检测是否在 OpenClaw 环境中
 */

/**
 * 检测是否在 OpenClaw 环境中
 */
export function isOpenClawEnv() {
  // 检查 sessions_spawn 是否可用
  return typeof sessions_spawn === 'function';
}

/**
 * 检测 subagents 工具是否可用
 */
export function isSubagentsAvailable() {
  return typeof subagents === 'function';
}

/**
 * 检测是否支持并发子智能体
 */
export async function checkConcurrentSupport() {
  if (!isOpenClawEnv()) {
    return {
      available: false,
      reason: 'Not in OpenClaw environment'
    };
  }

  try {
    const result = await subagents({ action: 'list' });
    return {
      available: true,
      active: result.active?.length || 0
    };
  } catch (error) {
    return {
      available: false,
      reason: error.message
    };
  }
}

/**
 * 获取环境信息
 */
export async function getEnvironmentInfo() {
  const isOC = isOpenClawEnv();
  const hasSubagents = isSubagentsAvailable();

  let concurrentInfo = null;
  if (hasSubagents) {
    concurrentInfo = await checkConcurrentSupport();
  }

  return {
    isOpenClaw: isOC,
    hasSubagents,
    concurrentSupport: concurrentInfo,
    mode: isOC ? 'real' : 'mock'
  };
}

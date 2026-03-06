/**
 * OpenClaw Subagents 客户端 - 使用原生的 subagents API
 */
import { Storage } from './storage.js';

/**
 * OpenClaw Subagents 客户端
 * 
 * 使用 OpenClaw 原生的 sessions_spawn 创建并发子智能体
 * - 非阻塞执行
 * - 自动并发控制（受 maxConcurrent 限制）
 * - 完成后自动通告结果
 */
export class SubagentsClient {
  constructor(projectId) {
    this.projectId = projectId;
    this.activeRuns = new Map(); // runId -> { role, sessionKey, status }
  }

  /**
   * 创建子智能体（非阻塞）
   * 自动选择 ACP runtime 或 native subagent runtime
   */
  async spawn(options) {
    const { role, agentId, task, label, model, thinking, timeout, cwd } = options;

    // 检测是否是 ACP harness
    const acpHarnessIds = ['claude', 'opencode', 'codex', 'pi', 'gemini'];
    const useAcpRuntime = acpHarnessIds.includes(agentId);

    const runtime = useAcpRuntime ? 'acp' : 'subagent';

    Storage.appendWorkflowLog(
      this.projectId,
      `🚀 Spawning subagent: ${role} (runtime: ${runtime}, agentId: ${agentId || 'default'}, model: ${model || 'default'})`
    );

    try {
      // 调用 OpenClaw 的 sessions_spawn
      // 注意：这是非阻塞的，立即返回
      const result = await sessions_spawn({
        runtime,  // ← 关键：根据 agentId 选择 runtime
        agentId,  // ACP harness id 或 OpenClaw agent id
        task,
        cwd,      // 工作目录（对 ACP coding agents 很重要）
        label: label || `claw-corps-${role}-${this.projectId}`,
        model,
        thinking,
        runTimeoutSeconds: timeout || 300,
        mode: 'run',   // 新增: 运行模式
        cleanup: 'keep', // 保留会话以便查看历史
        thread: true   // 新增: 启用线程模式
      });

      const { runId, childSessionKey } = result;

      // 记录活跃的运行
      this.activeRuns.set(runId, {
        role,
        agentId,
        sessionKey: childSessionKey,
        runtime,
        status: 'running',
        startedAt: new Date().toISOString()
      });

      Storage.appendWorkflowLog(
        this.projectId,
        `✅ Subagent spawned: ${role} (runtime: ${runtime}, runId: ${runId}, agent: ${agentId || 'default'})`
      );

      return {
        runId,
        sessionKey: childSessionKey,
        runtime,
        status: 'accepted'
      };
    } catch (error) {
      Storage.appendWorkflowLog(
        this.projectId,
        `❌ Failed to spawn subagent: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * 并行创建多个子智能体
   */
  async spawnParallel(agents) {
    const results = await Promise.all(
      agents.map(agent => this.spawn(agent))
    );

    return results;
  }

  /**
   * 查看活跃的子智能体
   */
  async listActive() {
    try {
      const result = await subagents({ action: 'list' });
      return result.active || [];
    } catch (error) {
      Storage.appendWorkflowLog(
        this.projectId,
        `❌ Failed to list subagents: ${error.message}`
      );
      return [];
    }
  }

  /**
   * 获取子智能体信息
   */
  async getInfo(runId) {
    try {
      const result = await subagents({
        action: 'info',
        target: runId
      });
      return result;
    } catch (error) {
      Storage.appendWorkflowLog(
        this.projectId,
        `⚠️ Failed to get info for ${runId}: ${error.message}`
      );
      // 返回错误对象而不是 null，让调用者知道发生了什么
      return { error: true, message: error.message, runId };
    }
  }

  /**
   * 获取子智能体日志
   */
  async getLog(runId, limit = 50, includeTools = false) {
    try {
      const result = await subagents({
        action: 'log',
        target: runId,
        limit,
        ...(includeTools && { tools: true })
      });
      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * 向子智能体发送消息
   */
  async send(runId, message) {
    try {
      await subagents({
        action: 'send',
        target: runId,
        message
      });

      Storage.appendWorkflowLog(
        this.projectId,
        `📨 Message sent to ${runId}: ${message.substring(0, 50)}...`
      );
    } catch (error) {
      Storage.appendWorkflowLog(
        this.projectId,
        `❌ Failed to send message: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * 引导子智能体
   */
  async steer(runId, message) {
    try {
      await subagents({
        action: 'steer',
        target: runId,
        message
      });

      Storage.appendWorkflowLog(
        this.projectId,
        `🎯 Steering ${runId}: ${message.substring(0, 50)}...`
      );
    } catch (error) {
      Storage.appendWorkflowLog(
        this.projectId,
        `❌ Failed to steer: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * 停止子智能体
   */
  async kill(runId) {
    try {
      await subagents({
        action: 'kill',
        target: runId
      });

      const run = this.activeRuns.get(runId);
      if (run) {
        run.status = 'stopped';
      }

      Storage.appendWorkflowLog(
        this.projectId,
        `🛑 Subagent stopped: ${runId}`
      );
    } catch (error) {
      Storage.appendWorkflowLog(
        this.projectId,
        `❌ Failed to kill subagent: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * 停止所有活跃的子智能体
   */
  async killAll() {
    try {
      await subagents({
        action: 'kill',
        target: 'all'
      });

      for (const [runId, run] of this.activeRuns) {
        run.status = 'stopped';
      }

      Storage.appendWorkflowLog(
        this.projectId,
        `🛑 All subagents stopped`
      );
    } catch (error) {
      Storage.appendWorkflowLog(
        this.projectId,
        `❌ Failed to kill all: ${error.message}`
      );
    }
  }

  /**
   * 等待子智能体完成（通过轮询）
   */
  async waitForCompletion(runId, timeout = 300000) {
    const startTime = Date.now();
    let pollInterval = 2000;  // 从2秒开始
    const maxPollInterval = 30000; // 最大30秒

    while (Date.now() - startTime < timeout) {
      const info = await this.getInfo(runId);
      
      if (!info) {
        // 如果获取不到信息，可能已经完成
        return { status: 'completed', runId };
      }

      if (info.status === 'completed' || info.status === 'error' || info.status === 'timeout') {
        const run = this.activeRuns.get(runId);
        if (run) {
          run.status = info.status;
        }
        // 清理内存，避免泄漏
        this.activeRuns.delete(runId);
        return { status: info.status, runId, info };
      }

      // 指数退避 + 随机抖动
      const jitter = Math.random() * 1000;  // 0-1秒随机抖动
      await new Promise(resolve => setTimeout(resolve, pollInterval + jitter));
      
      // 增加轮询间隔，但不超过最大值
      pollInterval = Math.min(pollInterval * 1.5, maxPollInterval);
    }

    throw new Error(`Subagent ${runId} timed out after ${timeout}ms`);
  }

  /**
   * 等待所有子智能体完成
   */
  async waitForAll(timeout = 600000) {
    const runIds = Array.from(this.activeRuns.keys());
    const results = await Promise.all(
      runIds.map(runId => this.waitForCompletion(runId, timeout))
    );

    return results;
  }

  /**
   * 获取活跃运行的统计
   */
  getStats() {
    const runs = Array.from(this.activeRuns.values());
    return {
      total: runs.length,
      running: runs.filter(r => r.status === 'running').length,
      completed: runs.filter(r => r.status === 'completed').length,
      failed: runs.filter(r => r.status === 'error').length,
      stopped: runs.filter(r => r.status === 'stopped').length
    };
  }
}

/**
 * 模型选择器 - 根据角色和复杂度选择合适的模型
 */
export function selectModel(role, complexity) {
  const modelMap = {
    // 复杂项目使用高级模型
    complex: {
      pm: 'claude-3-opus',
      architect: 'claude-3-opus',
      developer: 'claude-3-sonnet',
      'senior-developer': 'claude-3-opus',
      qa: 'claude-3-sonnet',
      designer: 'claude-3-sonnet',
      devops: 'claude-3-sonnet'
    },
    // 中等和简单项目使用经济模型
    medium: {
      pm: 'claude-3-sonnet',
      architect: 'claude-3-sonnet',
      developer: 'claude-3-sonnet',
      qa: 'claude-3-sonnet',
      designer: 'claude-3-sonnet'
    },
    simple: {
      developer: 'claude-3-sonnet',
      designer: 'claude-3-sonnet'
    }
  };

  return modelMap[complexity]?.[role] || 'claude-3-sonnet';
}

/**
 * 思考级别选择器
 */
export function selectThinking(role) {
  const thinkingMap = {
    pm: 'high',
    architect: 'high',
    'senior-developer': 'high',
    developer: 'medium',
    qa: 'medium',
    designer: 'medium',
    devops: 'medium'
  };

  return thinkingMap[role] || 'medium';
}

/**
 * Agent 调度器 - 使用 OpenClaw 原生 subagents API
 */
import chalk from 'chalk';
import ora from 'ora';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from './storage.js';
import { ROLE_DEFINITIONS } from './complexity.js';
import { SubagentsClient, selectModel, selectThinking } from './subagents-client.js';
import { isOpenClawEnv } from './env.js';

export class Orchestrator {
  constructor(projectId, options = {}) {
    this.projectId = projectId;
    this.project = Storage.getProject(projectId);
    this.agents = new Map();
    this.options = options;
    this.client = new SubagentsClient(projectId);
    this.sessions = new Map(); // runId -> agent role
    this.isRealMode = isOpenClawEnv();
    
    if (!this.isRealMode) {
      console.log(chalk.yellow('⚠️  Running in mock mode (not in OpenClaw environment)'));
    }
  }

  /**
   * 初始化团队 - 为每个角色创建 subagent
   */
  async initializeTeam() {
    const team = this.project.team.members;

    for (const member of team) {
      const { agentId, runId, sessionKey } = await this.createAgent(member.role);
      member.agent_id = agentId;
      member.run_id = runId;
      member.session_key = sessionKey;
      member.status = 'ready';

      this.agents.set(member.role, {
        id: agentId,
        runId,
        sessionKey,
        role: member.role,
        status: 'ready'
      });

      Storage.appendWorkflowLog(
        this.projectId,
        `✅ Agent initialized: ${member.role} (${agentId})${runId ? ` [RunId: ${runId}]` : ''}`
      );
    }

    Storage.updateProjectTeam(this.projectId, { members: team });

    return this.agents;
  }

  /**
   * 创建单个 agent（使用 subagents API 或 ACP runtime）
   */
  async createAgent(role) {
    const agentId = `agent_${role}_${uuidv4().split('-')[0]}`;
    const roleDef = ROLE_DEFINITIONS[role];
    const project = this.project.meta;

    // 准备任务描述
    const taskDescription = this.buildAgentTask(role, roleDef);

    if (!this.isRealMode) {
      // 模拟模式
      Storage.appendAgentLog(
        this.projectId,
        agentId,
        `Agent created for role: ${roleDef.name} [MOCK MODE]\nTask: ${taskDescription}`
      );
      
      return { agentId, runId: null, sessionKey: null };
    }

    // 选择模型和思考级别
    const model = this.options.model || selectModel(role, project.complexity);
    const thinking = this.options.thinking || selectThinking(role);
    
    // 根据角色选择 agentId 和 runtime
    const codingRoles = ['developer', 'senior-developer', 'qa'];
    const acpHarnessIds = ['claude', 'opencode', 'codex', 'pi', 'gemini'];
    
    // 获取配置的 coding agent
    const defaultCodingAgent = this.options.codingAgent || project.tool || 'claude';
    const defaultManagerAgent = this.options.managerAgent || 'codemanager';
    
    let subagentId;
    let useAcpRuntime = false;
    
    if (codingRoles.includes(role)) {
      // Coding role: 使用 ACP runtime
      subagentId = acpHarnessIds.includes(defaultCodingAgent) 
        ? defaultCodingAgent 
        : 'claude';  // 默认使用 claude
      useAcpRuntime = true;
    } else {
      // Management role: 使用 native subagent
      subagentId = defaultManagerAgent;
      useAcpRuntime = false;
    }

    try {
      // 调用 OpenClaw subagents API
      const result = await this.client.spawn({
        role,
        agentId: subagentId,
        task: taskDescription,
        label: `${role}-${project.name}`,
        model,
        thinking,
        cwd: this.options.workDir || project.workDir,  // 工作目录
        timeout: this.options.timeout || 300
      });

      const { runId, sessionKey, runtime } = result;

      // 记录映射
      this.sessions.set(runId, role);

      Storage.appendAgentLog(
        this.projectId,
        agentId,
        `Agent created for role: ${roleDef.name}\nRuntime: ${runtime || 'subagent'}\nAgentId: ${subagentId}\nRunId: ${runId}\nModel: ${model}\nThinking: ${thinking}\nTask: ${taskDescription}`
      );

      return { agentId, runId, sessionKey, subagentId, runtime };
    } catch (error) {
      Storage.appendAgentLog(
        this.projectId,
        agentId,
        `❌ Failed to create agent: ${error.message}`
      );

      throw error;
    }
  }

  /**
   * 构建 agent 任务描述
   */
  buildAgentTask(role, roleDef) {
    const project = this.project.meta;

    let task = `${roleDef.systemPrompt}\n\n`;
    task += `# 项目信息\n`;
    task += `项目名称: ${project.name}\n`;
    task += `项目描述: ${project.description}\n`;
    task += `复杂度: ${project.complexity}\n\n`;

    if (project.requirements) {
      task += `# 技术需求\n`;
      task += `技术栈: ${project.requirements.techStack?.join(', ') || '未指定'}\n`;
      task += `功能模块数: ${project.requirements.featureCount || '未指定'}\n`;
      task += `集成需求: ${project.requirements.integrationCount || 0} 个外部系统\n`;
      if (project.requirements.needsUI) task += `需要UI界面\n`;
      if (project.requirements.highPerformance) task += `高性能要求\n`;
      if (project.requirements.highSecurity) task += `高安全要求\n`;
      task += `\n`;
    }

    task += `你现在是这个项目的${roleDef.name}。请根据以上信息开始工作。`;

    return task;
  }

  /**
   * 分配任务给 agent（通过 steer 引导）
   */
  async assignTask(role, task) {
    const agent = this.agents.get(role);

    if (!agent) {
      throw new Error(`No agent found for role: ${role}`);
    }

    agent.status = 'working';
    agent.currentTask = task;

    const taskMessage = `📋 新任务: ${task.description}\n\n请开始执行此任务。完成后请汇报结果。`;

    Storage.appendAgentLog(
      this.projectId,
      agent.agentId,
      `\n${taskMessage}\n`
    );

    Storage.appendWorkflowLog(
      this.projectId,
      `📤 Task assigned to ${role}: ${task.id}`
    );

    // 通过 steer 引导子智能体
    if (agent.runId) {
      try {
        await this.client.steer(agent.runId, taskMessage);
      } catch (error) {
        Storage.appendAgentLog(
          this.projectId,
          agent.agentId,
          `❌ Failed to steer agent: ${error.message}\n`
        );
        // 标记 agent 为错误状态，而不是静默失败
        agent.status = 'error';
        agent.steerError = error.message;
        throw new Error(`Failed to assign task to ${role}: ${error.message}`);
      }
    }

    return agent;
  }

  /**
   * 执行单个任务并等待完成
   */
  async executeTask(agent, task, timeout = 300000) {
    if (this.isRealMode && agent.runId) {
      // 真实模式：等待 subagent 完成
      try {
        const result = await this.client.waitForCompletion(agent.runId, timeout);
        
        // 获取日志
        const log = await this.client.getLog(agent.runId, 10);
        
        return {
          taskId: task.id,
          status: result.status === 'error' ? 'failed' : 'completed',
          output: log?.content || 'Task completed',
          agentId: agent.agentId,
          runId: agent.runId
        };
      } catch (error) {
        return {
          taskId: task.id,
          status: 'failed',
          error: error.message,
          agentId: agent.agentId
        };
      }
    } else {
      // 模拟模式：简单延时
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        taskId: task.id,
        status: 'completed',
        output: `Completed: ${task.description} (mock mode)`,
        agentId: agent.agentId
      };
    }
  }

  /**
   * 串行执行任务
   */
  async executeSerial(tasks) {
    const results = [];

    for (const task of tasks) {
      console.log(chalk.cyan(`\n▶ Executing task: ${task.description}`));

      const spinner = ora(`Working on: ${task.description}`).start();

      try {
        const agent = await this.assignTask(task.role, task);

        // 执行任务
        const result = await this.executeTask(agent, task);

        results.push(result);

        agent.status = 'ready';
        delete agent.currentTask;

        if (result.status === 'completed') {
          Storage.appendAgentLog(
            this.projectId,
            agent.agentId,
            `✅ Task completed: ${task.id}\nOutput: ${result.output}\n`
          );
          spinner.succeed(`Completed: ${task.description}`);
        } else {
          spinner.fail(`Failed: ${task.description}`);
        }

      } catch (error) {
        spinner.fail(`Failed: ${task.description}`);

        Storage.appendAgentLog(
          this.projectId,
          this.agents.get(task.role)?.agentId || 'unknown',
          `❌ Task failed: ${error.message}\n`
        );

        results.push({
          taskId: task.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 并行执行任务（使用 subagents 的并发能力）
   */
  async executeParallel(tasks) {
    console.log(chalk.cyan(`\n▶ Executing ${tasks.length} tasks in parallel`));

    const spinner = ora('Spawning parallel subagents...').start();

    if (!this.isRealMode) {
      // 模拟模式
      spinner.text = `${tasks.length} tasks (mock mode)...`;
      await new Promise(resolve => setTimeout(resolve, 2000));

      const results = tasks.map(task => ({
        taskId: task.id,
        status: 'completed',
        output: `Completed: ${task.description} (mock mode)`
      }));

      spinner.succeed('All parallel tasks completed (mock mode)');
      return results;
    }

    // 真实模式：并行创建所有子智能体
    const spawnPromises = tasks.map(async task => {
      const agent = this.agents.get(task.role);
      if (!agent) {
        throw new Error(`No agent for role: ${task.role}`);
      }
      
      // 子智能体已经在 initializeTeam 时创建
      // 这里通过 steer 发送任务
      await this.assignTask(task.role, task);
      return { task, agent };
    });

    const spawned = await Promise.all(spawnPromises);
    spinner.text = `${spawned.length} subagents working in parallel...`;

    // 等待所有子智能体完成
    // 注意：subagents 会自动并发运行（受 maxConcurrent 限制）
    // 完成后会自动通告结果
    const timeout = this.options.timeout ? this.options.timeout * 1000 : 300000;
    
    try {
      // 等待所有活跃的子智能体
      await this.client.waitForAll(timeout);
      
      // 获取每个子智能体的实际状态
      const results = await Promise.all(
        spawned.map(async ({ task, agent }) => {
          let status = 'completed';
          let output = `Completed: ${task.description}`;
          
          if (agent.runId) {
            try {
              const info = await this.client.getInfo(agent.runId);
              if (info) {
                status = info.status === 'error' ? 'failed' : (info.status || 'completed');
                output = info.output || output;
              }
            } catch (e) {
              status = 'unknown';
              output = `Failed to get status: ${e.message}`;
            }
          }
          
          return {
            taskId: task.id,
            status,
            output,
            agentId: agent.agentId,
            runId: agent.runId
          };
        })
      );

      spinner.succeed('All parallel tasks completed');
      return results;
    } catch (error) {
      spinner.fail(`Parallel execution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * 混合执行 - 根据任务依赖关系自动选择串行或并行
   */
  async executeHybrid(tasks, dependencies = {}) {
    const results = [];
    const completed = new Set();
    const taskIds = new Set(tasks.map(t => t.id));
    
    while (completed.size < tasks.length) {
      // 找出所有依赖已满足的任务
      const ready = tasks.filter(task => {
        if (completed.has(task.id)) return false;
        const deps = dependencies[task.id] || [];
        // 对于不在当前任务列表中的依赖，假设已完成
        return deps.every(dep => !taskIds.has(dep) || completed.has(dep));
      });
      
      if (ready.length === 0) {
        throw new Error('Circular dependency detected or missing task');
      }
      
      // 并行执行所有就绪的任务
      const batchResults = await this.executeParallel(ready);
      results.push(...batchResults);
      
      ready.forEach(task => completed.add(task.id));
    }
    
    return results;
  }

  /**
   * 发送消息给 agent（通过 subagents send）
   */
  async sendToAgent(runId, message) {
    await this.client.send(runId, message);
    return { sent: true, runId };
  }

  /**
   * 从 agent 获取工作日志
   */
  async getAgentLog(runId, limit = 10) {
    const log = await this.client.getLog(runId, limit, true);
    return { runId, log };
  }

  /**
   * 停止所有 agents
   */
  async stopAll() {
    if (!this.isRealMode) {
      return; // 模拟模式无需停止
    }

    for (const [role, agent] of this.agents) {
      if (agent.status === 'working' && agent.runId) {
        try {
          await this.client.kill(agent.runId);
        } catch (error) {
          // 忽略停止失败的错误
        }

        agent.status = 'stopped';

        Storage.appendAgentLog(
          this.projectId,
          agent.agentId,
          `🛑 Agent stopped\n`
        );
      }
    }

    Storage.appendWorkflowLog(
      this.projectId,
      `🛑 All agents stopped`
    );
  }

  /**
   * 生成任务列表
   */
  static generateTasks(project) {
    const tasks = [];
    const teamRoles = project.team.members.map(m => m.role);
    const complexity = project.meta.complexity;
    
    // 只有当团队中有 PM 时才添加分析任务
    if (teamRoles.includes('pm')) {
      tasks.push({
        id: 'task_001',
        role: 'pm',
        description: '分析需求并创建任务拆解文档',
        stage: 'analysis'
      });
    }
    
    // 只有当团队中有架构师时才添加架构任务
    if (teamRoles.includes('architect')) {
      tasks.push({
        id: 'task_002',
        role: 'architect',
        description: '设计系统架构并编写技术方案',
        stage: 'analysis'
      });
    }
    
    // 开发任务（总是需要）
    if (teamRoles.includes('developer')) {
      tasks.push({
        id: 'task_003',
        role: 'developer',
        description: '搭建项目基础结构和配置',
        stage: 'development',
        dependencies: teamRoles.includes('pm') ? ['task_001'] : []
      });
      
      if (complexity === 'complex' || complexity === 'enterprise') {
        tasks.push({
          id: 'task_004',
          role: 'developer',
          description: '实现核心业务逻辑',
          stage: 'development',
          dependencies: teamRoles.includes('architect') ? ['task_002', 'task_003'] : ['task_003']
        });
      } else {
        tasks.push({
          id: 'task_004',
          role: 'developer',
          description: '实现功能模块',
          stage: 'development',
          dependencies: ['task_003']
        });
      }
    }
    
    // 设计任务
    if (teamRoles.includes('designer')) {
      tasks.splice(2, 0, {
        id: 'task_ui',
        role: 'designer',
        description: '设计UI界面和交互流程',
        stage: 'development',
        dependencies: teamRoles.includes('pm') ? ['task_001'] : []
      });
    }
    
    // QA 任务
    if (teamRoles.includes('qa')) {
      tasks.push({
        id: 'task_005',
        role: 'qa',
        description: '编写测试用例并执行测试',
        stage: 'testing',
        dependencies: ['task_004']
      });
    }
    
    return tasks;
  }
}

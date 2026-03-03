/**
 * Claw Corps - OpenClaw 集成版本
 * 
 * 这个版本直接在 OpenClaw 会话中运行，可以真实调用 sessions_spawn
 */

import { Storage } from './core/storage.js';
import { ROLE_DEFINITIONS, selectModel, selectThinking } from './core/complexity.js';

/**
 * 创建项目团队（使用 coding agents）
 */
export async function createTeamWithCodingAgents(projectId, options = {}) {
  const project = Storage.getProject(projectId);
  
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const team = project.team.members;
  const runs = [];
  
  // 定义哪些角色是代码任务
  const codingRoles = ['developer', 'senior-developer', 'qa'];
  const codingAgent = options.codingAgent || project.meta.tool || 'claude-code';
  const managerAgent = options.managerAgent || 'codemanager';
  
  console.log(`\n🦞 Creating team with coding agents...`);
  console.log(`   Coding tasks → ${codingAgent}`);
  console.log(`   Management tasks → ${managerAgent}\n`);

  for (const member of team) {
    const role = member.role;
    const roleDef = ROLE_DEFINITIONS[role];
    
    // 根据角色选择 agentId
    const agentId = codingRoles.includes(role) ? codingAgent : managerAgent;
    
    // 构建任务
    const task = buildTaskForRole(role, roleDef, project.meta);
    
    // 选择模型和思考级别
    const model = selectModel(role, project.meta.complexity);
    const thinking = selectThinking(role);

    console.log(`   ${roleDef.emoji} ${roleDef.name} → ${agentId} (model: ${model})`);

    try {
      // 调用 OpenClaw sessions_spawn
      const result = await sessions_spawn({
        agentId,  // 关键：根据角色选择不同的 agent
        task,
        label: `${role}-${project.meta.name}`,
        model,
        thinking,
        runTimeoutSeconds: options.timeout || 300
      });

      const { runId, childSessionKey } = result;

      // 更新团队成员信息
      member.agent_id = `agent_${role}_${Date.now()}`;
      member.run_id = runId;
      member.session_key = childSessionKey;
      member.subagent_id = agentId;
      member.status = 'running';

      runs.push({
        role,
        runId,
        sessionKey: childSessionKey,
        agentId
      });

      // 记录日志
      Storage.appendWorkflowLog(
        projectId,
        `✅ ${roleDef.name} spawned: ${agentId} (runId: ${runId})`
      );

    } catch (error) {
      console.error(`   ❌ Failed to spawn ${role}: ${error.message}`);
      member.status = 'failed';
      
      Storage.appendWorkflowLog(
        projectId,
        `❌ Failed to spawn ${roleDef.name}: ${error.message}`
      );
    }
  }

  // 保存更新后的团队配置
  Storage.updateProjectTeam(projectId, { members: team.members || team });

  console.log(`\n✅ Team created! ${runs.length} agents running.\n`);

  return runs;
}

/**
 * 为角色构建任务描述
 */
function buildTaskForRole(role, roleDef, projectMeta) {
  let task = `${roleDef.systemPrompt}\n\n`;
  
  task += `# 项目信息\n`;
  task += `项目名称: ${projectMeta.name}\n`;
  task += `项目描述: ${projectMeta.description}\n`;
  task += `复杂度: ${projectMeta.complexity}\n\n`;
  
  if (projectMeta.requirements) {
    task += `# 技术需求\n`;
    task += `技术栈: ${projectMeta.requirements.techStack?.join(', ') || '未指定'}\n`;
    task += `功能模块数: ${projectMeta.requirements.featureCount || '未指定'}\n\n`;
  }

  // 根据角色添加具体任务
  task += `# 你的任务\n`;
  
  switch (role) {
    case 'pm':
      task += `1. 分析项目需求\n2. 创建任务拆解文档\n3. 定义里程碑和交付物\n4. 协调团队进度`;
      break;
    case 'architect':
      task += `1. 设计系统整体架构\n2. 选择合适的技术栈\n3. 编写架构设计文档\n4. 定义模块和接口`;
      break;
    case 'developer':
      task += `1. 搭建项目基础结构\n2. 实现核心功能模块\n3. 编写干净的代码\n4. 编写单元测试`;
      break;
    case 'senior-developer':
      task += `1. 实现核心和复杂业务逻辑\n2. 审查代码质量\n3. 解决技术难题\n4. 指导最佳实践`;
      break;
    case 'qa':
      task += `1. 设计测试策略\n2. 编写测试用例\n3. 执行功能测试和集成测试\n4. 报告和跟踪缺陷`;
      break;
    case 'designer':
      task += `1. 设计用户界面和交互流程\n2. 创建视觉设计方案\n3. 确保良好用户体验\n4. 提供设计资源`;
      break;
    default:
      task += `完成分配给你的任务`;
  }

  return task;
}

/**
 * 运行完整项目（从 Claw Corps 数据读取）
 */
export async function runProjectFromClawCorps(projectId, options = {}) {
  const project = Storage.getProject(projectId);
  
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  console.log(`\n🦞 Claw Corps - Running Project\n`);
  console.log(`   项目: ${project.meta.name}`);
  console.log(`   复杂度: ${project.meta.complexity}`);
  console.log(`   团队: ${project.team.members.length} 人\n`);

  // 创建团队（自动使用 coding agents）
  const runs = await createTeamWithCodingAgents(projectId, options);

  console.log(`\n📊 执行摘要:\n`);
  console.log(`   活跃的子智能体: ${runs.length}`);
  console.log(`   工作流模式: ${options.workflow || 'hybrid'}`);
  console.log(`\n   子智能体会自动完成后通告结果\n`);

  return runs;
}

/**
 * 导出便捷函数
 */
export { Storage };

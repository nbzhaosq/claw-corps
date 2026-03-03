/**
 * assign 命令 - 分配团队
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '../core/storage.js';
import { ROLE_DEFINITIONS, COMPLEXITY_LEVELS } from '../core/complexity.js';

export async function assignTeam(projectId, options) {
  const project = Storage.getProject(projectId);
  
  if (!project) {
    console.log(chalk.red(`\n❌ 项目不存在: ${projectId}\n`));
    return;
  }
  
  if (!project.meta.complexity) {
    console.log(chalk.yellow('\n⚠️  项目尚未评估复杂度'));
    console.log(chalk.cyan(`请先运行: ${chalk.yellow(`claw-corps assess ${projectId}`)}\n`));
    return;
  }
  
  console.log(chalk.cyan.bold('\n🦞 团队分配\n'));
  
  // 获取建议的团队配置
  const suggestedTeam = project.meta.customTeam || 
                        COMPLEXITY_LEVELS[project.meta.complexity.toUpperCase()]?.team || 
                        ['developer'];
  
  // 显示建议
  console.log(chalk.cyan('建议团队配置:\n'));
  for (const role of suggestedTeam) {
    const roleDef = ROLE_DEFINITIONS[role];
    if (roleDef) {
      console.log(`  ${roleDef.emoji} ${roleDef.name} - ${roleDef.description}`);
    }
  }
  
  // 确认或调整
  let finalTeam = suggestedTeam;
  
  if (!options.confirm) {
    const { adjust } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'adjust',
        message: '是否需要调整团队配置?',
        default: false
      }
    ]);
    
    if (adjust) {
      finalTeam = await selectTeamManually(suggestedTeam);
    }
  }
  
  // 创建团队成员
  const members = finalTeam.map(role => ({
    role,
    agent_id: null, // 将在 orchestrator 中分配
    status: 'pending',
    assigned_at: new Date().toISOString()
  }));
  
  // 保存团队配置
  Storage.updateProjectTeam(projectId, { members });
  
  // 更新进度
  updateProgress(projectId, 'assignment', 'completed');
  
  console.log(chalk.green('\n✅ 团队分配完成!\n'));
  console.log(chalk.cyan('团队成员:'));
  
  for (const member of members) {
    const roleDef = ROLE_DEFINITIONS[member.role];
    console.log(`  ${roleDef?.emoji || '👤'} ${roleDef?.name || member.role}`);
  }
  
  console.log(chalk.cyan(`\n下一步: 运行 ${chalk.yellow(`claw-corps run ${projectId}`)} 开始执行\n`));
}

async function selectTeamManually(suggestedTeam) {
  const availableRoles = Object.keys(ROLE_DEFINITIONS);
  const roleChoices = availableRoles.map(role => ({
    name: `${ROLE_DEFINITIONS[role].emoji} ${ROLE_DEFINITIONS[role].name} - ${ROLE_DEFINITIONS[role].description}`,
    value: role,
    checked: suggestedTeam.includes(role)
  }));
  
  const { selectedRoles } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRoles',
      message: '选择团队成员:',
      choices: roleChoices,
      validate: (input) => input.length > 0 || '至少需要选择一个角色'
    }
  ]);
  
  return selectedRoles;
}

function updateProgress(projectId, stageName, status) {
  const project = Storage.getProject(projectId);
  const stages = project.progress.stages.map(stage => {
    if (stage.name === stageName) {
      return {
        ...stage,
        status,
        started_at: stage.started_at || new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : stage.completed_at
      };
    }
    return stage;
  });
  
  const currentIndex = stages.findIndex(s => s.name === stageName);
  const nextStage = stages[currentIndex + 1]?.name;
  
  Storage.updateProjectProgress(projectId, {
    stages,
    current_stage: nextStage || stageName
  });
}

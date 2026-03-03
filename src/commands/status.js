/**
 * status 命令 - 查看项目状态
 */
import chalk from 'chalk';
import { Storage } from '../core/storage.js';

export async function showStatus(projectId) {
  const project = Storage.getProject(projectId);
  
  if (!project) {
    console.log(chalk.red(`\n❌ 项目不存在: ${projectId}\n`));
    return;
  }
  
  const meta = project.meta;
  const team = project.team;
  const progress = project.progress;
  
  console.log(chalk.cyan.bold('\n🦞 项目状态\n'));
  console.log(chalk.gray('━'.repeat(70)));
  
  // 项目信息
  console.log(chalk.cyan.bold('\n📦 项目信息'));
  console.log(`   名称: ${chalk.bold(meta.name)}`);
  console.log(`   ID: ${meta.id}`);
  console.log(`   状态: ${getStatusColor(meta.status)(meta.status)}`);
  console.log(`   复杂度: ${meta.complexity || chalk.gray('未评估')}`);
  console.log(`   工具: ${meta.tool}`);
  console.log(`   描述: ${meta.description}`);
  
  // 团队信息
  console.log(chalk.cyan.bold('\n👥 团队配置'));
  if (team.members.length === 0) {
    console.log(chalk.gray('   暂未分配团队'));
  } else {
    for (const member of team.members) {
      const statusIcon = member.status === 'active' ? '✅' : 
                         member.status === 'working' ? '▶️' : '⏸️';
      console.log(`   ${statusIcon} ${member.role} (${member.agent_id || 'pending'})`);
    }
  }
  
  // 进度信息
  console.log(chalk.cyan.bold('\n📊 进度追踪'));
  const stageEmojis = {
    'intake': '📥',
    'analysis': '🔍',
    'assignment': '👥',
    'development': '💻',
    'testing': '🧪',
    'delivery': '📦'
  };
  
  for (const stage of progress.stages) {
    const emoji = stageEmojis[stage.name] || '❓';
    const statusIcon = stage.status === 'completed' ? '✅' :
                       stage.status === 'in_progress' ? '▶️' :
                       stage.status === 'pending' ? '⏳' : '❌';
    
    let line = `   ${emoji} ${stage.name}: ${statusIcon}`;
    
    if (stage.started_at) {
      line += chalk.gray(` (开始: ${new Date(stage.started_at).toLocaleString('zh-CN')})`);
    }
    if (stage.completed_at) {
      line += chalk.gray(` (完成: ${new Date(stage.completed_at).toLocaleString('zh-CN')})`);
    }
    
    console.log(line);
  }
  
  // 当前阶段
  console.log(chalk.cyan.bold('\n🎯 当前阶段'));
  console.log(`   ${progress.current_stage}`);
  
  console.log(chalk.gray('\n' + '━'.repeat(70)) + '\n');
}

function getStatusColor(status) {
  const colors = {
    'pending': chalk.yellow,
    'running': chalk.blue,
    'completed': chalk.green,
    'failed': chalk.red
  };
  return colors[status] || chalk.gray;
}

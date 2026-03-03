/**
 * list 命令 - 列出所有项目
 */
import chalk from 'chalk';
import { Storage } from '../core/storage.js';

export async function listProjects(options) {
  console.log(chalk.cyan.bold('\n🦞 Claw Corps - 项目列表\n'));
  
  const projects = Storage.listProjects(options);
  
  if (projects.length === 0) {
    console.log(chalk.gray('暂无项目'));
    console.log(chalk.cyan(`\n运行 ${chalk.yellow('claw-corps init <name>')} 创建新项目\n`));
    return;
  }
  
  console.log(chalk.gray('━'.repeat(70)));
  
  for (const project of projects) {
    const meta = project.meta;
    const team = project.team;
    
    const statusEmoji = {
      'pending': '⏳',
      'running': '▶️',
      'completed': '✅',
      'failed': '❌'
    }[meta.status] || '❓';
    
    console.log(`\n${statusEmoji} ${chalk.bold(meta.name)} ${chalk.gray(`(${meta.id})`)}`);
    console.log(`   状态: ${getStatusColor(meta.status)(meta.status)}`);
    console.log(`   复杂度: ${meta.complexity || chalk.gray('未评估')}`);
    console.log(`   团队: ${team.members.length > 0 ? team.members.length + ' 人' : chalk.gray('未分配')}`);
    console.log(`   创建时间: ${new Date(meta.created_at).toLocaleString('zh-CN')}`);
  }
  
  console.log(chalk.gray('\n' + '━'.repeat(70)));
  console.log(chalk.cyan(`\n共 ${projects.length} 个项目\n`));
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

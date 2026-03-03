/**
 * stop 命令 - 停止运行中的项目
 */
import chalk from 'chalk';
import { Storage } from '../core/storage.js';
import { Orchestrator } from '../core/orchestrator.js';

export async function stopProject(projectId) {
  const project = Storage.getProject(projectId);
  
  if (!project) {
    console.log(chalk.red(`\n❌ 项目不存在: ${projectId}\n`));
    return;
  }
  
  if (project.meta.status !== 'running') {
    console.log(chalk.yellow('\n⚠️  项目未在运行中\n'));
    return;
  }
  
  console.log(chalk.cyan.bold('\n🛑 停止项目\n'));
  
  const orchestrator = new Orchestrator(projectId);
  await orchestrator.stopAll();
  
  Storage.updateProjectMeta(projectId, { status: 'stopped' });
  
  console.log(chalk.green('\n✅ 项目已停止\n'));
}

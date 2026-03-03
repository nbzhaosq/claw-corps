/**
 * logs 命令 - 查看项目日志
 */
import chalk from 'chalk';
import { Storage } from '../core/storage.js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export async function viewLogs(projectId, options) {
  const project = Storage.getProject(projectId);
  
  if (!project) {
    console.log(chalk.red(`\n❌ 项目不存在: ${projectId}\n`));
    return;
  }
  
  const logsDir = join(homedir(), '.claw-corps', 'projects', projectId, 'logs');
  
  if (!existsSync(logsDir)) {
    console.log(chalk.yellow('\n⚠️  暂无日志\n'));
    return;
  }
  
  console.log(chalk.cyan.bold('\n📋 项目日志\n'));
  console.log(chalk.gray('━'.repeat(70)));
  
  // 显示工作流日志
  const workflowLog = join(logsDir, 'workflow.log');
  if (existsSync(workflowLog)) {
    console.log(chalk.cyan.bold('\n🔄 工作流日志:\n'));
    const content = readFileSync(workflowLog, 'utf-8');
    console.log(chalk.gray(content));
  }
  
  // 显示特定 agent 的日志
  if (options.agent) {
    const agentLog = join(logsDir, `${options.agent}.log`);
    if (existsSync(agentLog)) {
      console.log(chalk.cyan.bold(`\n👤 Agent ${options.agent} 日志:\n`));
      const content = readFileSync(agentLog, 'utf-8');
      console.log(chalk.gray(content));
    } else {
      console.log(chalk.yellow(`\n⚠️  Agent ${options.agent} 的日志不存在\n`));
    }
  } else {
    // 显示所有 agent 日志的概览
    console.log(chalk.cyan.bold('\n👥 Agent 日志:'));
    
    for (const member of project.team.members) {
      if (member.agent_id) {
        const agentLog = join(logsDir, `${member.agent_id}.log`);
        if (existsSync(agentLog)) {
          const content = readFileSync(agentLog, 'utf-8');
          const lines = content.split('\n').length;
          console.log(`  • ${member.agent_id}: ${lines} 行`);
        }
      }
    }
  }
  
  console.log(chalk.gray('\n' + '━'.repeat(70)) + '\n');
}

#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('claw-corps')
  .description('🦞 Claw Corps - Multi-agent development orchestration')
  .version(pkg.version);

// 项目管理命令
program
  .command('init <name>')
  .description('Initialize a new project')
  .option('-d, --description <desc>', 'Project description')
  .option('-t, --tool <tool>', 'Development tool (claude-code|opencode)', 'claude-code')
  .action(async (name, options) => {
    const { initProject } = await import('./commands/init.js');
    await initProject(name, options);
  });

program
  .command('list')
  .alias('ls')
  .description('List all projects')
  .option('-s, --status <status>', 'Filter by status (pending|running|completed|failed)')
  .action(async (options) => {
    const { listProjects } = await import('./commands/list.js');
    await listProjects(options);
  });

program
  .command('status <projectId>')
  .description('Show project status and progress')
  .action(async (projectId) => {
    const { showStatus } = await import('./commands/status.js');
    await showStatus(projectId);
  });

// 团队管理命令
program
  .command('assess <projectId>')
  .description('Assess project complexity and suggest team composition')
  .option('-t, --tech-stack <tech...>', 'Technology stack (comma-separated)')
  .option('-f, --features <number>', 'Number of features', parseInt)
  .option('-i, --integrations <number>', 'Number of integrations', parseInt)
  .option('--needs-ui', 'Project needs UI', false)
  .option('--no-ui', 'Project does not need UI')
  .option('--high-performance', 'High performance requirements')
  .option('--high-security', 'High security requirements')
  .option('--accept', 'Accept suggested configuration')
  .action(async (projectId, options) => {
    const { assessComplexity } = await import('./commands/assess.js');
    await assessComplexity(projectId, options);
  });

program
  .command('assign <projectId>')
  .description('Assign team members to project')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (projectId, options) => {
    const { assignTeam } = await import('./commands/assign.js');
    await assignTeam(projectId, options);
  });

// 执行命令
program
  .command('run <projectId>')
  .description('Start project execution')
  .option('-w, --workflow <type>', 'Workflow type (serial|parallel|hybrid)', 'hybrid')
  .option('-d, --work-dir <path>', 'Working directory for code output')
  .option('--timeout <seconds>', 'Task timeout in seconds (default: 300)', parseInt)
  .option('--coding-agent <agentId>', 'Agent for coding tasks (claude-code|opencode)', 'claude-code')
  .option('--manager-agent <agentId>', 'Agent for management tasks', 'codemanager')
  .action(async (projectId, options) => {
    const { runProject } = await import('./commands/run.js');
    await runProject(projectId, options);
  });

program
  .command('stop <projectId>')
  .description('Stop running project')
  .action(async (projectId) => {
    const { stopProject } = await import('./commands/stop.js');
    await stopProject(projectId);
  });

// 日志命令
program
  .command('logs <projectId>')
  .description('View project logs')
  .option('-a, --agent <agentId>', 'Filter by agent ID')
  .option('-f, --follow', 'Follow log output')
  .action(async (projectId, options) => {
    const { viewLogs } = await import('./commands/logs.js');
    await viewLogs(projectId, options);
  });

// 配置命令
program
  .command('config')
  .description('Manage configuration')
  .option('--set <key=value>', 'Set configuration value')
  .option('--get <key>', 'Get configuration value')
  .option('--list', 'List all configuration')
  .action(async (options) => {
    const { manageConfig } = await import('./commands/config.js');
    await manageConfig(options);
  });

program
  .command('env')
  .description('Check OpenClaw environment and subagents support')
  .action(async () => {
    const { checkEnvironment } = await import('./commands/env.js');
    await checkEnvironment();
  });

program.parse();

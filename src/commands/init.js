/**
 * init 命令 - 初始化新项目
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Storage } from '../core/storage.js';

export async function initProject(name, options) {
  console.log(chalk.cyan.bold('\n🦞 Claw Corps - 初始化新项目\n'));
  
  // 如果没有提供描述，询问用户
  let description = options.description;
  if (!description) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: '请输入项目描述:',
        validate: (input) => input.length > 0 || '请输入项目描述'
      },
      {
        type: 'confirm',
        name: 'needsUI',
        message: '项目是否需要UI界面?',
        default: true
      }
    ]);
    
    description = answers.description;
    options.needsUI = answers.needsUI;
  }
  
  // 创建项目
  const projectId = Storage.createProject(name, description, options.tool);
  
  console.log(chalk.green('\n✅ 项目创建成功!\n'));
  console.log(chalk.gray('━'.repeat(50)));
  console.log(chalk.cyan('项目信息:'));
  console.log(`  📦 名称: ${chalk.bold(name)}`);
  console.log(`  🆔 ID: ${chalk.yellow(projectId)}`);
  console.log(`  🔧 工具: ${options.tool}`);
  console.log(`  📝 描述: ${description}`);
  console.log(chalk.gray('━'.repeat(50)));
  
  console.log(chalk.cyan('\n下一步:'));
  console.log(`  1. 运行 ${chalk.yellow(`claw-corps assess ${projectId}`)} 评估复杂度`);
  console.log(`  2. 运行 ${chalk.yellow(`claw-corps assign ${projectId}`)} 分配团队`);
  console.log(`  3. 运行 ${chalk.yellow(`claw-corps run ${projectId}`)} 开始执行\n`);
  
  return projectId;
}

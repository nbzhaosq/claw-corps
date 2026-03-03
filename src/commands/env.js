/**
 * env 命令 - 检查 OpenClaw 环境和 subagents 支持
 */
import chalk from 'chalk';
import { getEnvironmentInfo } from '../core/env.js';

export async function checkEnvironment() {
  console.log(chalk.cyan.bold('\n🔍 OpenClaw 环境检查\n'));
  console.log(chalk.gray('━'.repeat(70)));
  
  const info = await getEnvironmentInfo();
  
  // OpenClaw 环境
  console.log(chalk.cyan('\n📍 OpenClaw 环境:'));
  if (info.isOpenClaw) {
    console.log(chalk.green('  ✅ 运行在 OpenClaw 环境中'));
  } else {
    console.log(chalk.yellow('  ⚠️  不在 OpenClaw 环境中（模拟模式）'));
  }
  
  // Subagents 支持
  console.log(chalk.cyan('\n🤖 Subagents 支持:'));
  if (info.hasSubagents) {
    console.log(chalk.green('  ✅ Subagents API 可用'));
    
    if (info.concurrentSupport) {
      if (info.concurrentSupport.available) {
        console.log(chalk.green(`  ✅ 并发支持: ${info.concurrentSupport.active} 个活跃 subagent`));
      } else {
        console.log(chalk.yellow(`  ⚠️  并发检查失败: ${info.concurrentSupport.reason}`));
      }
    }
  } else {
    console.log(chalk.yellow('  ⚠️  Subagents API 不可用（模拟模式）'));
  }
  
  // 运行模式
  console.log(chalk.cyan('\n🎯 运行模式:'));
  if (info.isOpenClaw && info.hasSubagents) {
    console.log(chalk.green('  ✅ 真实模式'));
    console.log(chalk.gray('  • 子智能体会真实创建'));
    console.log(chalk.gray('  • 自动并发控制'));
    console.log(chalk.gray('  • 完成后自动通告结果'));
  } else {
    console.log(chalk.yellow('  ⚠️  模拟模式'));
    console.log(chalk.gray('  • 子智能体为模拟执行'));
    console.log(chalk.gray('  • 简单延时模拟'));
    console.log(chalk.gray('  • 适合测试和演示'));
  }
  
  // 配置建议
  if (!info.isOpenClaw) {
    console.log(chalk.cyan('\n💡 如何启用真实模式:'));
    console.log(chalk.gray('  1. 在 OpenClaw 会话中运行 Claw Corps'));
    console.log(chalk.gray('  2. 配置 agents.list[].subagents.allowAgents'));
    console.log(chalk.gray('  3. 示例配置:'));
    console.log(chalk.gray('     {'));
    console.log(chalk.gray('       "agents": {'));
    console.log(chalk.gray('         "list": [{'));
    console.log(chalk.gray('           "id": "codemanager",'));
    console.log(chalk.gray('           "subagents": {'));
    console.log(chalk.gray('             "allowAgents": ["*"]'));
    console.log(chalk.gray('           }'));
    console.log(chalk.gray('         }]'));
    console.log(chalk.gray('       }'));
    console.log(chalk.gray('     }'));
  }
  
  console.log(chalk.gray('\n' + '━'.repeat(70)) + '\n');
  
  return info;
}

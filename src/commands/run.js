/**
 * run 命令 - 执行项目
 */
import chalk from 'chalk';
import ora from 'ora';
import { Storage } from '../core/storage.js';
import { Orchestrator } from '../core/orchestrator.js';

export async function runProject(projectId, options) {
  const project = Storage.getProject(projectId);
  
  if (!project) {
    console.log(chalk.red(`\n❌ 项目不存在: ${projectId}\n`));
    return;
  }
  
  // 检查项目状态
  if (project.meta.status === 'running') {
    console.log(chalk.yellow('\n⚠️  项目已在运行中\n'));
    return;
  }
  
  // 检查是否已完成团队分配
  if (project.team.members.length === 0) {
    console.log(chalk.yellow('\n⚠️  尚未分配团队'));
    console.log(chalk.cyan(`请先运行: ${chalk.yellow(`claw-corps assign ${projectId}`)}\n`));
    return;
  }
  
  console.log(chalk.cyan.bold('\n🦞 开始执行项目\n'));
  console.log(chalk.gray('━'.repeat(70)));
  console.log(chalk.cyan(`\n项目: ${project.meta.name}`));
  console.log(`复杂度: ${project.meta.complexity}`);
  console.log(`工作流: ${options.workflow}`);
  console.log(`团队: ${project.team.members.length} 人\n`);
  console.log(chalk.gray('━'.repeat(70)));
  
  // 更新项目状态
  Storage.updateProjectMeta(projectId, { status: 'running' });
  
  // 初始化 orchestrator
  const orchestrator = new Orchestrator(projectId, {
    workDir: options.workDir,
    timeout: options.timeout,
    codingAgent: options.codingAgent,
    managerAgent: options.managerAgent,
    workflow: options.workflow
  });
  
  try {
    // 阶段1: 分析
    await executeStage('analysis', async () => {
      console.log(chalk.cyan.bold('\n🔍 阶段 1/5: 需求分析\n'));
      
      await orchestrator.initializeTeam();
      
      const tasks = Orchestrator.generateTasks(project);
      
      // 执行分析任务
      const analysisTasks = tasks.filter(t => t.stage === 'analysis');
      await orchestrator.executeSerial(analysisTasks);
    });
    
    // 阶段2: 开发
    await executeStage('development', async () => {
      console.log(chalk.cyan.bold('\n💻 阶段 2/5: 开发实现\n'));
      
      const tasks = Orchestrator.generateTasks(project);
      const devTasks = tasks.filter(t => t.stage === 'development');
      
      // 根据工作流类型执行
      if (options.workflow === 'parallel') {
        await orchestrator.executeParallel(devTasks);
      } else if (options.workflow === 'hybrid') {
        // 构建依赖关系
        const dependencies = {};
        for (const task of devTasks) {
          dependencies[task.id] = task.dependencies || [];
        }
        await orchestrator.executeHybrid(devTasks, dependencies);
      } else {
        await orchestrator.executeSerial(devTasks);
      }
    });
    
    // 阶段3: 测试
    await executeStage('testing', async () => {
      console.log(chalk.cyan.bold('\n🧪 阶段 3/5: 测试验收\n'));
      
      const tasks = Orchestrator.generateTasks(project);
      const testTasks = tasks.filter(t => t.stage === 'testing');
      await orchestrator.executeSerial(testTasks);
    });
    
    // 阶段4: 交付
    await executeStage('delivery', async () => {
      console.log(chalk.cyan.bold('\n📦 阶段 4/5: 交付准备\n'));
      
      // 生成交付文档
      Storage.appendWorkflowLog(
        projectId,
        '📦 Preparing delivery artifacts...'
      );
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    // 完成
    Storage.updateProjectMeta(projectId, { status: 'completed' });
    
    console.log(chalk.green.bold('\n✅ 项目执行完成!\n'));
    console.log(chalk.gray('━'.repeat(70)));
    console.log(chalk.cyan('\n📊 执行摘要:'));
    console.log('  • 项目状态: 完成');
    console.log('  • 团队成员: ' + project.team.members.length + ' 人');
    console.log('  • 执行时间: ' + getExecutionTime(project.meta.created_at));
    console.log(chalk.gray('\n' + '━'.repeat(70)) + '\n');
    
  } catch (error) {
    console.error(chalk.red('\n❌ 项目执行失败:'), error.message);
    
    Storage.updateProjectMeta(projectId, { status: 'failed' });
    await orchestrator.stopAll();
    
    console.log(chalk.cyan(`\n查看日志: ${chalk.yellow(`claw-corps logs ${projectId}`)}\n`));
  }
}

async function executeStage(stageName, stageFn) {
  const spinner = ora(`执行阶段: ${stageName}`).start();
  
  try {
    await stageFn();
    spinner.succeed(`阶段完成: ${stageName}`);
  } catch (error) {
    spinner.fail(`阶段失败: ${stageName}`);
    throw error;
  }
}

function getExecutionTime(startTime) {
  const start = new Date(startTime);
  const now = new Date();
  const diff = Math.floor((now - start) / 1000);
  
  if (diff < 60) return `${diff} 秒`;
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟`;
  return `${Math.floor(diff / 3600)} 小时`;
}

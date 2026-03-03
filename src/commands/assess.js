/**
 * assess 命令 - 评估项目复杂度
 */
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Storage } from '../core/storage.js';
import { ComplexityAssessor, ROLE_DEFINITIONS } from '../core/complexity.js';

export async function assessComplexity(projectId, options = {}) {
  const project = Storage.getProject(projectId);
  
  if (!project) {
    console.log(chalk.red(`\n❌ 项目不存在: ${projectId}\n`));
    return;
  }
  
  console.log(chalk.cyan.bold('\n🦞 复杂度评估\n'));
  
  // 收集需求信息
  let requirements;
  
  if (isNonInteractive(options)) {
    // 非交互式模式
    requirements = buildRequirementsFromOptions(project, options);
  } else {
    // 交互式模式
    requirements = await collectRequirements(project);
  }
  
  // 执行评估
  const result = ComplexityAssessor.assess(requirements);
  
  // 显示评估结果
  console.log(ComplexityAssessor.formatAssessment(result));
  
  // 确认是否接受建议
  let shouldAccept = options.accept;
  
  if (shouldAccept === undefined) {
    const { accept } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'accept',
        message: '是否接受这个复杂度评估和团队配置建议?',
        default: true
      }
    ]);
    shouldAccept = accept;
  }
  
  if (shouldAccept) {
    // 保存评估结果
    Storage.updateProjectMeta(projectId, {
      complexity: result.complexity.level,
      requirements
    });
    
    console.log(chalk.green('\n✅ 复杂度评估已保存\n'));
  } else {
    // 允许手动调整
    await manualAdjust(projectId, result);
  }
  
  return result;
}

function isNonInteractive(options) {
  return options.techStack || 
         options.features || 
         options.integrations !== undefined ||
         options.needsUi !== undefined ||
         options.noUi ||
         options.highPerformance ||
         options.highSecurity;
}

function buildRequirementsFromOptions(project, options) {
  const techStack = options.techStack || [];
  
  let needsUI = true;
  if (options.noUi) needsUI = false;
  if (options.needsUi) needsUI = true;
  
  const featureCount = options.features || 3;
  const integrationCount = options.integrations || 0;
  
  return {
    techStack,
    featureCount,
    integrationCount,
    needsUI,
    highPerformance: options.highPerformance || false,
    highSecurity: options.highSecurity || false,
    description: project.meta.description,
    integrations: Array(integrationCount).fill('external-system')
  };
}

async function collectRequirements(project) {
  console.log(chalk.cyan('请回答以下问题以评估项目复杂度:\n'));
  
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'techStack',
      message: '项目使用哪些技术栈?',
      choices: [
        'React', 'Vue', 'Angular', 'Svelte',
        'Node.js', 'Express', 'NestJS', 'FastAPI',
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
        'Docker', 'Kubernetes', 'AWS', 'GCP',
        'GraphQL', 'gRPC', 'Microservices'
      ]
    },
    {
      type: 'number',
      name: 'featureCount',
      message: '预计有多少个主要功能模块?',
      default: 3,
      validate: (input) => input > 0 || '请输入大于0的数字'
    },
    {
      type: 'number',
      name: 'integrationCount',
      message: '需要对接多少个外部系统?',
      default: 0
    },
    {
      type: 'confirm',
      name: 'needsUI',
      message: '项目是否需要UI界面?',
      default: true
    },
    {
      type: 'confirm',
      name: 'highPerformance',
      message: '是否有高性能要求(高并发、低延迟)?',
      default: false
    },
    {
      type: 'confirm',
      name: 'highSecurity',
      message: '是否有高安全要求?',
      default: false
    }
  ]);
  
  return {
    ...answers,
    description: project.meta.description,
    integrations: Array(answers.integrationCount).fill('external-system')
  };
}

async function manualAdjust(projectId, result) {
  console.log(chalk.cyan('\n🔧 手动调整团队配置\n'));
  
  const availableRoles = Object.keys(ROLE_DEFINITIONS);
  const roleChoices = availableRoles.map(role => ({
    name: `${ROLE_DEFINITIONS[role].emoji} ${ROLE_DEFINITIONS[role].name} - ${ROLE_DEFINITIONS[role].description}`,
    value: role,
    checked: result.suggestedTeam.includes(role)
  }));
  
  const { selectedRoles } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedRoles',
      message: '选择需要的团队成员:',
      choices: roleChoices,
      validate: (input) => input.length > 0 || '至少需要选择一个角色'
    }
  ]);
  
  const { complexityLevel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'complexityLevel',
      message: '选择复杂度等级:',
      choices: ['simple', 'medium', 'complex', 'enterprise'],
      default: result.complexity.level
    }
  ]);
  
  // 保存调整后的结果
  Storage.updateProjectMeta(projectId, {
    complexity: complexityLevel,
    customTeam: selectedRoles
  });
  
  console.log(chalk.green('\n✅ 已保存自定义配置\n'));
}

/**
 * 复杂度评估 - 分析项目需求并评估复杂度
 */
import chalk from 'chalk';

export const COMPLEXITY_LEVELS = {
  SIMPLE: {
    level: 'simple',
    score: { min: 0, max: 19 },
    description: '简单项目 - 单个开发者可完成',
    team: ['developer']
  },
  MEDIUM: {
    level: 'medium',
    score: { min: 20, max: 39 },
    description: '中等项目 - 需要小型团队',
    team: ['pm', 'developer', 'qa']
  },
  COMPLEX: {
    level: 'complex',
    score: { min: 40, max: 69 },
    description: '复杂项目 - 需要完整团队',
    team: ['pm', 'architect', 'developer', 'qa', 'designer']
  },
  ENTERPRISE: {
    level: 'enterprise',
    score: { min: 70, max: 100 },
    description: '企业级项目 - 需要多团队协作',
    team: ['pm', 'architect', 'senior-developer', 'developer', 'qa', 'designer', 'devops']
  }
};

export const ROLE_DEFINITIONS = {
  pm: {
    name: '项目经理',
    emoji: '📋',
    description: '负责任务拆解、协调和进度跟踪',
    systemPrompt: `你是一位经验丰富的项目经理。你的职责是：
1. 将项目需求拆解为可执行的任务
2. 协调团队成员的工作
3. 跟踪项目进度并及时调整
4. 确保项目按时交付

请始终保持专业、清晰的沟通。`
  },
  architect: {
    name: '架构师',
    emoji: '🏗️',
    description: '负责系统设计、技术选型和架构文档',
    systemPrompt: `你是一位资深架构师。你的职责是：
1. 设计系统整体架构
2. 选择合适的技术栈
3. 编写架构设计文档
4. 指导开发团队实现架构

请关注系统的可扩展性、性能和维护性。`
  },
  developer: {
    name: '开发者',
    emoji: '💻',
    description: '负责编写代码和实现功能',
    systemPrompt: `你是一位优秀的开发者。你的职责是：
1. 按照设计文档编写高质量代码
2. 编写单元测试
3. 遵循代码规范和最佳实践
4. 与团队协作完成开发任务

请编写清晰、可维护的代码。`
  },
  'senior-developer': {
    name: '高级开发者',
    emoji: '👨‍💻',
    description: '负责核心功能开发和代码审查',
    systemPrompt: `你是一位高级开发者。你的职责是：
1. 实现核心和复杂的业务逻辑
2. 审查其他开发者的代码
3. 解决技术难题
4. 指导初级开发者

请展现出技术领导力。`
  },
  qa: {
    name: '测试工程师',
    emoji: '🧪',
    description: '负责编写测试和验收检查',
    systemPrompt: `你是一位专业的测试工程师。你的职责是：
1. 编写测试计划和测试用例
2. 执行功能测试和集成测试
3. 报告和跟踪缺陷
4. 确保产品质量

请全面覆盖各种测试场景。`
  },
  designer: {
    name: '设计师',
    emoji: '🎨',
    description: '负责UI/UX设计和视觉方案',
    systemPrompt: `你是一位有创意的设计师。你的职责是：
1. 设计用户界面和交互流程
2. 创建视觉设计方案
3. 确保良好的用户体验
4. 提供设计资源和规范

请注重美观性和易用性。`
  },
  devops: {
    name: '运维工程师',
    emoji: '⚙️',
    description: '负责部署、监控和基础设施',
    systemPrompt: `你是一位DevOps工程师。你的职责是：
1. 搭建和维护CI/CD流程
2. 配置监控和告警系统
3. 管理基础设施和部署
4. 优化系统性能

请确保系统的稳定性和可靠性。`
  }
};

export class ComplexityAssessor {
  /**
   * 评估项目复杂度
   */
  static assess(requirements) {
    const analysis = {
      features: this.countFeatures(requirements),
      techStack: this.assessTechStack(requirements),
      integrations: this.countIntegrations(requirements),
      uiNeeds: this.assessUI(requirements),
      nonFunctional: this.assessNonFunctional(requirements)
    };
    
    const score = this.calculateScore(analysis);
    const complexity = this.getComplexityLevel(score);
    
    return {
      analysis,
      score,
      complexity,
      suggestedTeam: this.suggestTeam(complexity, analysis)
    };
  }

  static countFeatures(requirements) {
    // 简单的特征计数逻辑
    const text = JSON.stringify(requirements).toLowerCase();
    
    const featureKeywords = [
      '用户', '认证', '登录', '注册', '权限', '角色',
      'crud', '增删改查', '搜索', '过滤', '排序',
      '文件', '上传', '下载', '导出', '导入',
      '通知', '消息', '邮件', '推送',
      '支付', '订单', '购物车',
      '报表', '统计', '图表',
      'api', '接口', '集成'
    ];
    
    let count = 0;
    for (const keyword of featureKeywords) {
      if (text.includes(keyword)) count++;
    }
    
    return {
      count,
      score: count * 2
    };
  }

  static assessTechStack(requirements) {
    const techList = requirements.techStack || [];
    
    const complexityScores = {
      // 前端框架
      'react': 2, 'vue': 2, 'angular': 3, 'svelte': 2,
      // 后端框架
      'express': 2, 'koa': 2, 'nestjs': 3, 'fastapi': 2, 'django': 3,
      // 数据库
      'mysql': 2, 'postgresql': 2, 'mongodb': 2, 'redis': 1, 'elasticsearch': 4,
      // 消息队列
      'rabbitmq': 3, 'kafka': 4, 'redis-pubsub': 2,
      // 微服务
      'microservices': 5, 'grpc': 4, 'graphql': 3,
      // 云服务
      'docker': 2, 'kubernetes': 4, 'aws': 3, 'gcp': 3, 'azure': 3
    };
    
    let totalScore = 0;
    const detected = [];
    
    for (const tech of techList) {
      const techLower = tech.toLowerCase();
      if (complexityScores[techLower]) {
        totalScore += complexityScores[techLower];
        detected.push(tech);
      } else {
        totalScore += 2; // 默认分数
        detected.push(tech);
      }
    }
    
    return {
      detected,
      score: totalScore
    };
  }

  static countIntegrations(requirements) {
    const integrations = requirements.integrations || [];
    return {
      count: integrations.length,
      score: integrations.length * 5
    };
  }

  static assessUI(requirements) {
    const text = JSON.stringify(requirements).toLowerCase();
    
    const uiKeywords = [
      'ui', 'ux', '界面', '设计', '前端', '页面',
      '移动端', 'app', '小程序', 'h5',
      '响应式', '动画', '交互'
    ];
    
    let score = 0;
    for (const keyword of uiKeywords) {
      if (text.includes(keyword)) score += 2;
    }
    
    return {
      needsUI: score > 0,
      score: Math.min(score, 10)
    };
  }

  static assessNonFunctional(requirements) {
    const text = JSON.stringify(requirements).toLowerCase();
    
    let score = 0;
    
    // 性能要求
    if (text.includes('性能') || text.includes('高并发')) score += 5;
    
    // 安全要求
    if (text.includes('安全') || text.includes('加密') || text.includes('认证')) score += 3;
    
    // 可扩展性
    if (text.includes('扩展') || text.includes('微服务')) score += 4;
    
    // 高可用
    if (text.includes('高可用') || text.includes('容灾')) score += 5;
    
    return {
      score: Math.min(score, 15)
    };
  }

  static calculateScore(analysis) {
    return (
      analysis.features.score +
      analysis.techStack.score +
      analysis.integrations.score +
      analysis.uiNeeds.score +
      analysis.nonFunctional.score
    );
  }

  static getComplexityLevel(score) {
    for (const [key, value] of Object.entries(COMPLEXITY_LEVELS)) {
      if (score >= value.score.min && score <= value.score.max) {
        return value;
      }
    }
    return COMPLEXITY_LEVELS.ENTERPRISE;
  }

  static suggestTeam(complexity, analysis) {
    const baseTeam = [...complexity.team];
    
    // 根据分析结果调整团队
    if (analysis.uiNeeds.needsUI && !baseTeam.includes('designer')) {
      baseTeam.push('designer');
    }
    
    // 如果功能点很多，增加开发者
    if (analysis.features.count > 10 && baseTeam.includes('developer')) {
      baseTeam.push('developer');
    }
    
    return [...new Set(baseTeam)]; // 去重
  }

  /**
   * 格式化评估结果用于显示
   */
  static formatAssessment(result) {
    const lines = [];
    
    lines.push(chalk.bold('\n📊 复杂度评估结果\n'));
    lines.push(chalk.gray('━'.repeat(50)));
    
    // 评分明细
    lines.push(chalk.cyan('\n📝 评分明细:'));
    lines.push(`  • 功能点: ${result.analysis.features.count} 个 (${result.analysis.features.score} 分)`);
    lines.push(`  • 技术栈: ${result.analysis.techStack.detected.join(', ') || '未指定'} (${result.analysis.techStack.score} 分)`);
    lines.push(`  • 集成需求: ${result.analysis.integrations.count} 个 (${result.analysis.integrations.score} 分)`);
    lines.push(`  • UI需求: ${result.analysis.uiNeeds.needsUI ? '是' : '否'} (${result.analysis.uiNeeds.score} 分)`);
    lines.push(`  • 非功能需求: ${result.analysis.nonFunctional.score} 分`);
    
    // 总分和复杂度
    lines.push(chalk.cyan('\n🎯 复杂度等级:'));
    lines.push(chalk.bold.yellow(`  ${result.complexity.level.toUpperCase()} (总分: ${result.score})`));
    lines.push(chalk.gray(`  ${result.complexity.description}`));
    
    // 建议团队
    lines.push(chalk.cyan('\n👥 建议团队配置:'));
    for (const role of result.suggestedTeam) {
      const roleDef = ROLE_DEFINITIONS[role];
      lines.push(`  ${roleDef.emoji} ${roleDef.name} - ${roleDef.description}`);
    }
    
    lines.push(chalk.gray('\n' + '━'.repeat(50)));
    
    return lines.join('\n');
  }
}

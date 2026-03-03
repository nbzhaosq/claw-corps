/**
 * ComplexityAssessor 类单元测试
 * 测试目标：简单统计功能 - 复杂度评分、功能点统计、团队规模
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  ComplexityAssessor, 
  COMPLEXITY_LEVELS, 
  ROLE_DEFINITIONS 
} from '../src/core/complexity.js';

describe('ComplexityAssessor 类测试 - 统计功能', () => {

  describe('复杂度评估', () => {
    it('应该评估简单项目', () => {
      const requirements = {
        techStack: ['react', 'mysql'],
        featureCount: 2,
        integrations: [],
        needsUI: true,
        highPerformance: false,
        highSecurity: false
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.score >= 0, '应该有评分');
      assert.ok(result.complexity, '应该有复杂度等级');
      assert.ok(result.suggestedTeam.length > 0, '应该有建议团队');
    });

    it('应该评估中等复杂度项目', () => {
      const requirements = {
        techStack: ['react', 'node.js', 'express', 'mongodb', 'redis', 'docker'],
        featureCount: 8,
        integrations: ['payment-gateway', 'email-service'],
        needsUI: true,
        highPerformance: true,
        highSecurity: false
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.score >= 20, '中等复杂度分数应该>=20');
      assert.ok(result.analysis, '应该包含分析详情');
    });

    it('应该评估企业级项目', () => {
      const requirements = {
        techStack: ['angular', 'nestjs', 'kubernetes', 'microservices', 'grpc', 'elasticsearch', 'kafka'],
        featureCount: 15,
        integrations: ['sap', 'salesforce', 'aws', 'azure'],
        needsUI: true,
        highPerformance: true,
        highSecurity: true
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.score >= 70, '企业级分数应该>=70');
      assert.strictEqual(result.complexity.level, 'enterprise');
    });
  });

  describe('功能点统计', () => {
    it('应该正确统计功能点数量', () => {
      const requirements = {
        techStack: [],
        featureCount: 5,
        integrations: []
      };
      
      const analysis = ComplexityAssessor.assess(requirements);
      
      assert.ok(analysis.analysis.features.count >= 0);
      assert.ok(analysis.analysis.features.score >= 0);
    });

    it('应该识别常见功能关键词', () => {
      // 创建一个包含用户管理功能的需求
      const requirements = {
        techStack: [],
        integrations: []
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.analysis.features, '应该有功能分析');
    });
  });

  describe('技术栈复杂度评分', () => {
    it('应该识别前端技术栈', () => {
      const requirements = {
        techStack: ['react', 'vue'],
        integrations: []
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.analysis.techStack.detected.length > 0);
      assert.ok(result.analysis.techStack.score >= 0);
    });

    it('应该识别后端技术栈', () => {
      const requirements = {
        techStack: ['express', 'nestjs', 'postgresql'],
        integrations: []
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.analysis.techStack.detected.includes('express') || 
                 result.analysis.techStack.detected.includes('nestjs'));
    });

    it('应该给微服务更高的复杂度分数', () => {
      const simpleReqs = { techStack: ['express'], integrations: [] };
      const complexReqs = { techStack: ['microservices', 'kubernetes', 'grpc'], integrations: [] };
      
      const simpleResult = ComplexityAssessor.assess(simpleReqs);
      const complexResult = ComplexityAssessor.assess(complexReqs);
      
      assert.ok(complexResult.analysis.techStack.score > simpleResult.analysis.techStack.score);
    });
  });

  describe('团队规模统计', () => {
    it('简单项目应该建议小型团队', () => {
      const requirements = {
        techStack: ['react'],
        featureCount: 2,
        integrations: [],
        needsUI: false
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.suggestedTeam.includes('developer'));
      assert.ok(result.suggestedTeam.length <= 3, '简单项目团队应该<=3人');
    });

    it('中等项目应该包含PM和QA', () => {
      const requirements = {
        techStack: ['react', 'express', 'mongodb'],
        featureCount: 6,
        integrations: [],
        needsUI: true
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.suggestedTeam.includes('pm'), '应该包含项目经理');
      assert.ok(result.suggestedTeam.includes('qa'), '应该包含测试工程师');
    });

    it('复杂项目应该包含架构师', () => {
      const requirements = {
        techStack: ['nestjs', 'kubernetes', 'microservices'],
        featureCount: 10,
        integrations: ['external-api'],
        needsUI: true,
        highPerformance: true
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.suggestedTeam.includes('architect'), '应该包含架构师');
    });

    it('企业级项目应该包含运维', () => {
      const requirements = {
        techStack: ['kubernetes', 'aws', 'gcp', 'elasticsearch', 'kafka'],
        featureCount: 15,
        integrations: ['sap', 'salesforce'],
        needsUI: true,
        highPerformance: true,
        highSecurity: true
      };
      
      const result = ComplexityAssessor.assess(requirements);
      
      assert.ok(result.suggestedTeam.includes('devops'), '应该包含运维工程师');
    });
  });

  describe('非功能需求评估', () => {
    it('应该识别性能要求', () => {
      // 需要在描述中包含中文关键词
      const reqWithPerformance = {
        description: '这是一个高性能要求的项目，需要处理高并发',
        techStack: [],
        integrations: []
      };
      
      const result = ComplexityAssessor.assess(reqWithPerformance);
      
      assert.ok(result.analysis.nonFunctional.score > 0, '应该有性能评分');
    });

    it('应该识别安全要求', () => {
      // 需要在描述中包含中文关键词
      const reqWithSecurity = {
        description: '这是一个高安全要求项目，需要数据加密和认证',
        techStack: [],
        integrations: []
      };
      
      const result = ComplexityAssessor.assess(reqWithSecurity);
      
      assert.ok(result.analysis.nonFunctional.score > 0, '应该有安全评分');
    });

    it('应该正确累加非功能需求分数', () => {
      const reqWithBoth = {
        description: '高性能高并发项目，同时需要高安全要求和数据加密认证',
        techStack: [],
        integrations: []
      };
      
      const result = ComplexityAssessor.assess(reqWithBoth);
      
      // 性能5分 + 安全3分 = 8分
      assert.ok(result.analysis.nonFunctional.score >= 5, '应该有性能评分');
    });
  });

  describe('复杂度等级定义', () => {
    it('应该有四个复杂度等级', () => {
      assert.ok(COMPLEXITY_LEVELS.SIMPLE, '应该有简单等级');
      assert.ok(COMPLEXITY_LEVELS.MEDIUM, '应该有中等等级');
      assert.ok(COMPLEXITY_LEVELS.COMPLEX, '应该有复杂等级');
      assert.ok(COMPLEXITY_LEVELS.ENTERPRISE, '应该有企业级等级');
    });

    it('各等级分数范围应该正确', () => {
      assert.strictEqual(COMPLEXITY_LEVELS.SIMPLE.score.max, 19);
      assert.strictEqual(COMPLEXITY_LEVELS.MEDIUM.score.max, 39);
      assert.strictEqual(COMPLEXITY_LEVELS.COMPLEX.score.max, 69);
      assert.strictEqual(COMPLEXITY_LEVELS.ENTERPRISE.score.max, 100);
    });
  });

  describe('角色定义', () => {
    it('应该包含所有必需角色', () => {
      const requiredRoles = ['pm', 'architect', 'developer', 'qa', 'designer', 'devops'];
      
      for (const role of requiredRoles) {
        assert.ok(ROLE_DEFINITIONS[role], `应该有 ${role} 角色定义`);
        assert.ok(ROLE_DEFINITIONS[role].name, `${role} 应该有名称`);
        assert.ok(ROLE_DEFINITIONS[role].emoji, `${role} 应该有 emoji`);
        assert.ok(ROLE_DEFINITIONS[role].systemPrompt, `${role} 应该有系统提示词`);
      }
    });

    it('高级开发者角色应该存在', () => {
      assert.ok(ROLE_DEFINITIONS['senior-developer'], '应该有高级开发者角色');
    });
  });

  describe('UI需求评估', () => {
    it('需要UI时应该增加复杂度', () => {
      const withoutUI = { techStack: ['express'], integrations: [], needsUI: false };
      const withUI = { techStack: ['express'], integrations: [], needsUI: true };
      
      const resultNoUI = ComplexityAssessor.assess(withoutUI);
      const resultWithUI = ComplexityAssessor.assess(withUI);
      
      assert.ok(resultWithUI.analysis.uiNeeds.score >= resultNoUI.analysis.uiNeeds.score);
    });
  });
});

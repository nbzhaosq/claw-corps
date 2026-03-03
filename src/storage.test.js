/**
 * Storage 类单元测试
 * 测试目标：用户管理、数据存储功能
 */
import { describe, it, before, beforeEach, afterEach, after } from 'node:test';
import assert from 'node:assert';
import { join } from 'path';
import { existsSync, rmSync, readFileSync } from 'fs';
import { Storage } from '../src/core/storage.js';

// 测试配置：使用独立测试目录
const TEST_HOME = join(process.cwd(), '.claw-corps-test');

// 备份原配置
const originalEnv = process.env.CLAW_CORPS_HOME;

describe('Storage 类测试', () => {
  
  before(() => {
    // 设置测试目录
    process.env.CLAW_CORPS_HOME = TEST_HOME;
    // 清理可能存在的旧测试数据
    if (existsSync(TEST_HOME)) {
      rmSync(TEST_HOME, { recursive: true, force: true });
    }
    Storage.init();
  });
  
  after(() => {
    // 恢复原配置
    if (originalEnv) {
      process.env.CLAW_CORPS_HOME = originalEnv;
    } else {
      delete process.env.CLAW_CORPS_HOME;
    }
    // 清理测试目录
    if (existsSync(TEST_HOME)) {
      rmSync(TEST_HOME, { recursive: true, force: true });
    }
  });

  describe('初始化功能', () => {
    it('应该正确初始化目录结构', () => {
      const configPath = join(TEST_HOME, 'config.json');
      const projectsPath = join(TEST_HOME, 'projects');
      
      assert.strictEqual(existsSync(TEST_HOME), true, '根目录应该存在');
      assert.strictEqual(existsSync(projectsPath), true, 'projects 目录应该存在');
      assert.strictEqual(existsSync(configPath), true, '配置文件应该存在');
    });

    it('应该创建默认配置', () => {
      const config = Storage.getConfig();
      
      assert.ok(config.defaultTool, '应该有默认工具配置');
      assert.ok(config.maxRetries, '应该有重试次数配置');
      assert.ok(config.agents, '应该有智能体配置');
    });
  });

  describe('项目创建功能', () => {
    it('应该成功创建项目并返回项目ID', () => {
      const projectId = Storage.createProject('测试项目', '这是一个测试项目');
      
      assert.ok(projectId, '应该返回项目ID');
      assert.ok(projectId.startsWith('proj_'), '项目ID应该以 proj_ 开头');
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', projectId), { recursive: true, force: true });
    });

    it('应该创建完整的项目文件结构', () => {
      const projectId = Storage.createProject('测试项目', '描述');
      const projectDir = join(TEST_HOME, 'projects', projectId);
      
      assert.strictEqual(existsSync(join(projectDir, 'meta.json')), true);
      assert.strictEqual(existsSync(join(projectDir, 'team.json')), true);
      assert.strictEqual(existsSync(join(projectDir, 'progress.json')), true);
      assert.strictEqual(existsSync(join(projectDir, 'logs')), true);
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', projectId), { recursive: true, force: true });
    });

    it('创建的项目应该有正确的初始状态', () => {
      const name = '初始测试项目';
      const description = '项目描述';
      const projectId = Storage.createProject(name, description, 'claude-code');
      
      const project = Storage.getProject(projectId);
      
      assert.strictEqual(project.meta.name, name);
      assert.strictEqual(project.meta.description, description);
      assert.strictEqual(project.meta.status, 'pending');
      assert.strictEqual(project.meta.complexity, null);
      assert.ok(project.meta.created_at, '应该有创建时间');
      assert.deepStrictEqual(project.team.members, [], '团队成员应该为空数组');
      assert.ok(project.progress.stages.length > 0, '应该有进度阶段');
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', projectId), { recursive: true, force: true });
    });
  });

  describe('项目查询功能', () => {
    it('应该能获取已存在的项目', () => {
      const projectId = Storage.createProject('查询测试', '描述');
      const project = Storage.getProject(projectId);
      
      assert.ok(project, '应该返回项目对象');
      assert.strictEqual(project.meta.id, projectId);
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', projectId), { recursive: true, force: true });
    });

    it('查询不存在的项目应返回 null', () => {
      const project = Storage.getProject('proj_nonexistent');
      
      assert.strictEqual(project, null);
    });

    it('应该能列出所有项目', () => {
      const id1 = Storage.createProject('项目1', '描述1');
      const id2 = Storage.createProject('项目2', '描述2');
      const id3 = Storage.createProject('项目3', '描述3');
      
      const projects = Storage.listProjects();
      
      assert.strictEqual(projects.length, 3, '应该列出3个项目');
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', id1), { recursive: true, force: true });
      rmSync(join(TEST_HOME, 'projects', id2), { recursive: true, force: true });
      rmSync(join(TEST_HOME, 'projects', id3), { recursive: true, force: true });
    });

    it('应该支持按状态过滤项目', () => {
      const id1 = Storage.createProject('项目A', '描述');
      const id2 = Storage.createProject('项目B', '描述');
      
      Storage.updateProjectMeta(id1, { status: 'running' });
      
      const pending = Storage.listProjects({ status: 'pending' });
      const running = Storage.listProjects({ status: 'running' });
      
      assert.strictEqual(pending.length, 1, '应有1个pending项目');
      assert.strictEqual(running.length, 1, '应有1个running项目');
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', id1), { recursive: true, force: true });
      rmSync(join(TEST_HOME, 'projects', id2), { recursive: true, force: true });
    });
  });

  describe('项目更新功能', () => {
    it('应该能更新项目元数据', () => {
      const projectId = Storage.createProject('更新测试', '原始描述');
      
      const updated = Storage.updateProjectMeta(projectId, {
        status: 'running',
        complexity: 'medium'
      });
      
      assert.strictEqual(updated.status, 'running');
      assert.strictEqual(updated.complexity, 'medium');
      assert.ok(updated.updated_at, '应该更新更新时间');
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', projectId), { recursive: true, force: true });
    });

    it('应该能更新团队信息', () => {
      const projectId = Storage.createProject('团队测试', '描述');
      
      const teamData = {
        members: [
          { role: 'developer', agent_id: 'agent-001', status: 'active' },
          { role: 'qa', agent_id: 'agent-002', status: 'pending' }
        ]
      };
      
      const updated = Storage.updateProjectTeam(projectId, teamData);
      
      assert.strictEqual(updated.members.length, 2, '应该有2个团队成员');
      assert.strictEqual(updated.members[0].role, 'developer');
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', projectId), { recursive: true, force: true });
    });

    it('应该能更新进度信息', () => {
      const projectId = Storage.createProject('进度测试', '描述');
      
      const updated = Storage.updateProjectProgress(projectId, {
        current_stage: 'development',
        stages: [
          { name: 'intake', status: 'completed' },
          { name: 'analysis', status: 'completed' },
          { name: 'development', status: 'in_progress' }
        ]
      });
      
      assert.strictEqual(updated.current_stage, 'development');
      assert.strictEqual(updated.stages[2].status, 'in_progress');
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', projectId), { recursive: true, force: true });
    });
  });

  describe('日志功能', () => {
    it('应该能写入智能体日志', () => {
      const projectId = Storage.createProject('日志测试', '描述');
      
      Storage.appendAgentLog(projectId, 'agent-001', '测试日志消息');
      
      const logPath = join(TEST_HOME, 'projects', projectId, 'logs', 'agent-001.log');
      const logContent = readFileSync(logPath, 'utf-8');
      
      assert.ok(logContent.includes('测试日志消息'), '日志应该包含写入的内容');
      assert.ok(logContent.includes('['), '日志应该有时间戳');
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', projectId), { recursive: true, force: true });
    });

    it('应该能写入工作流日志', () => {
      const projectId = Storage.createProject('工作流日志测试', '描述');
      
      Storage.appendWorkflowLog(projectId, '工作流开始执行');
      
      const logPath = join(TEST_HOME, 'projects', projectId, 'logs', 'workflow.log');
      const logContent = readFileSync(logPath, 'utf-8');
      
      assert.ok(logContent.includes('工作流开始执行'));
      
      // 清理
      rmSync(join(TEST_HOME, 'projects', projectId), { recursive: true, force: true });
    });
  });
});

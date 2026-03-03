/**
 * CLI 命令集成测试
 * 测试目标：验证命令行交互流程
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { join } from 'path';
import { existsSync, rmSync } from 'fs';

const CLI_PATH = join(process.cwd(), 'src', 'index.js');
const TEST_HOME = join(process.cwd(), '.claw-corps-integration-test');

// 备份和恢复环境
const originalEnv = process.env.CLAW_CORPS_HOME;

describe('CLI 命令集成测试', () => {
  
  before(() => {
    process.env.CLAW_CORPS_HOME = TEST_HOME;
  });
  
  after(() => {
    if (originalEnv) {
      process.env.CLAW_CORPS_HOME = originalEnv;
    } else {
      delete process.env.CLAW_CORPS_HOME;
    }
    // 清理测试数据
    if (existsSync(TEST_HOME)) {
      rmSync(TEST_HOME, { recursive: true, force: true });
    }
  });

  /**
   * 执行 CLI 命令的辅助函数
   */
  function runCLI(args) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [CLI_PATH, ...args], {
        env: { ...process.env, CLAW_CORPS_HOME: TEST_HOME },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });
      
      child.on('error', (err) => {
        reject(err);
      });
      
      // 超时保护
      setTimeout(() => {
        child.kill();
        reject(new Error('CLI command timeout'));
      }, 10000);
    });
  }

  describe('init 命令 - 项目创建', () => {
    it('应该能创建新项目', async () => {
      const result = await runCLI(['init', '测试项目', '-d', '这是一个集成测试项目']);
      
      assert.strictEqual(result.code, 0, '命令应该成功执行');
      assert.ok(result.stdout.includes('项目创建成功') || result.stdout.includes('projectId'), 
        '输出应该包含成功信息');
    });

    it('应该能列出帮助信息', async () => {
      const result = await runCLI(['--help']);
      
      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes('claw-corps') || result.stdout.includes('Command'));
    });
  });

  describe('list 命令 - 项目列表', () => {
    it('应该能列出项目（空列表）', async () => {
      const result = await runCLI(['list']);
      
      assert.strictEqual(result.code, 0, 'list 命令应该成功');
      // 空项目列表时应该显示提示信息
      assert.ok(result.stdout.includes('暂无项目') || result.stdout.includes('项目列表') || result.stdout.includes('Claw Corps'));
    });

    it('应该能按状态过滤', async () => {
      // 先创建一个项目
      await runCLI(['init', '过滤测试', '-d', '测试']);
      
      const result = await runCLI(['list', '--status', 'pending']);
      
      assert.strictEqual(result.code, 0);
    });
  });

  describe('config 命令 - 配置管理', () => {
    it('应该能获取配置', async () => {
      const result = await runCLI(['config', '--get', 'defaultTool']);
      
      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes('claude-code') || result.stdout.includes('config'));
    });

    it('应该能列出所有配置', async () => {
      const result = await runCLI(['config', '--list']);
      
      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes('defaultTool') || result.stdout.includes('agents'));
    });
  });

  describe('env 命令 - 环境检查', () => {
    it('应该能检查环境', async () => {
      const result = await runCLI(['env']);
      
      // 环境检查命令应该执行
      assert.ok(result.code === 0 || result.code === 1); // 0=成功, 1=环境问题但命令正常
    });
  });

  describe('错误处理', () => {
    it('应该处理无效命令', async () => {
      const result = await runCLI(['invalid-command']);
      
      assert.notStrictEqual(result.code, 0, '无效命令应该返回错误');
    });

    it('应该处理不存在的项目', async () => {
      const result = await runCLI(['status', 'proj_nonexistent']);
      
      assert.strictEqual(result.code, 0);
      assert.ok(result.stdout.includes('不存在') || result.stdout.includes('not exist'));
    });
  });
});

/**
 * Claw Corps - 并发安全的工作流管理
 */

/**
 * 任务分配策略
 */
export const WORKFLOW_STRATEGIES = {
  // 串行：逐个执行，无冲突
  serial: {
    name: '串行工作流',
    description: '逐个执行任务，确保无冲突',
    maxConcurrency: 1,
    suitableFor: ['small', 'simple'],
    risks: []
  },
  
  // 模块并行：按模块分组并行
  moduleParallel: {
    name: '模块并行',
    description: '不同开发者负责不同模块，避免文件冲突',
    maxConcurrency: 3,
    suitableFor: ['medium', 'complex'],
    risks: ['需要明确的模块边界', '接口依赖需要提前定义'],
    mitigation: ['先由架构师定义接口', '每个模块独立目录']
  },
  
  // 完全并行：所有任务并发（有风险）
  fullParallel: {
    name: '完全并行',
    description: '所有任务同时执行，最快但有冲突风险',
    maxConcurrency: 10,
    suitableFor: ['enterprise'],
    risks: ['文件冲突', 'Git 冲突', '依赖问题'],
    mitigation: ['使用不同的分支', '每个 agent 独立目录', '定期 merge']
  },
  
  // 混合：根据依赖关系自动选择
  hybrid: {
    name: '混合工作流',
    description: '根据任务依赖自动串行/并行',
    maxConcurrency: 5,
    suitableFor: ['all'],
    risks: [],
    mitigation: ['自动检测依赖', '动态调整执行顺序']
  }
};

/**
 * 模块边界定义
 */
export function defineModuleBoundaries(tasks) {
  // 为每个任务分配独立的工作目录
  return tasks.map(task => ({
    ...task,
    workDir: `modules/${task.module || task.id}`,
    allowedFiles: getAllowedFiles(task.role),
    gitBranch: `feature/${task.id}`
  }));
}

/**
 * 根据角色定义允许访问的文件
 */
function getAllowedFiles(role) {
  const roleFileAccess = {
    pm: ['docs/*.md', '*.md'],
    architect: ['docs/*.md', 'architecture/**', 'src/**/*.interface.ts'],
    developer: ['src/**', '!src/**/*.test.ts'],
    'senior-developer': ['src/**', 'lib/**', '!src/**/*.test.ts'],
    qa: ['tests/**', 'src/**/*.test.ts', 'test/**'],
    designer: ['design/**', 'assets/**', 'ui/**']
  };
  
  return roleFileAccess[role] || ['*'];
}

/**
 * 检测任务依赖
 */
export function detectDependencies(tasks) {
  const dependencies = {};
  
  for (const task of tasks) {
    const deps = [];
    
    // PM 任务通常是基础
    if (task.role !== 'pm') {
      const pmTask = tasks.find(t => t.role === 'pm');
      if (pmTask) deps.push(pmTask.id);
    }
    
    // 开发任务依赖架构设计
    if (task.role === 'developer' || task.role === 'senior-developer') {
      const archTask = tasks.find(t => t.role === 'architect');
      if (archTask) deps.push(archTask.id);
    }
    
    // 测试任务依赖开发任务
    if (task.role === 'qa') {
      const devTasks = tasks.filter(t => 
        t.role === 'developer' || t.role === 'senior-developer'
      );
      deps.push(...devTasks.map(t => t.id));
    }
    
    dependencies[task.id] = deps;
  }
  
  return dependencies;
}

/**
 * 按依赖关系排序任务
 */
export function sortTasksByDependency(tasks, dependencies) {
  const sorted = [];
  const visited = new Set();
  
  function visit(taskId) {
    if (visited.has(taskId)) return;
    visited.add(taskId);
    
    const deps = dependencies[taskId] || [];
    for (const dep of deps) {
      visit(dep);
    }
    
    const task = tasks.find(t => t.id === taskId);
    if (task) sorted.push(task);
  }
  
  for (const task of tasks) {
    visit(task.id);
  }
  
  return sorted;
}

/**
 * 分组并行执行（避免冲突）
 */
export function groupTasksForParallelExecution(tasks, dependencies) {
  const groups = [];
  const assigned = new Set();
  
  // 第一组：PM 和架构师（通常串行）
  const phase1 = tasks.filter(t => 
    t.role === 'pm' || t.role === 'architect'
  );
  if (phase1.length > 0) {
    groups.push({ phase: 1, tasks: phase1, parallel: false });
    phase1.forEach(t => assigned.add(t.id));
  }
  
  // 第二组：开发者（可并行，但要分模块）
  const devTasks = tasks.filter(t => 
    (t.role === 'developer' || t.role === 'senior-developer') &&
    !assigned.has(t.id)
  );
  if (devTasks.length > 0) {
    groups.push({ 
      phase: 2, 
      tasks: devTasks, 
      parallel: true,
      strategy: 'module-based'  // 每个开发者独立模块
    });
    devTasks.forEach(t => assigned.add(t.id));
  }
  
  // 第三组：设计师（可与开发并行）
  const designTasks = tasks.filter(t => 
    t.role === 'designer' && !assigned.has(t.id)
  );
  if (designTasks.length > 0) {
    groups.push({ phase: 2, tasks: designTasks, parallel: true });
    designTasks.forEach(t => assigned.add(t.id));
  }
  
  // 第四组：QA（在开发完成后）
  const qaTasks = tasks.filter(t => 
    t.role === 'qa' && !assigned.has(t.id)
  );
  if (qaTasks.length > 0) {
    groups.push({ phase: 3, tasks: qaTasks, parallel: true });
    qaTasks.forEach(t => assigned.add(t.id));
  }
  
  return groups;
}

/**
 * 创建冲突检测规则
 */
export function createConflictResolutionRules() {
  return {
    // 文件锁：同一时间只有一个 agent 可以修改
    fileLocks: new Map(),
    
    // Git 分支策略：每个 agent 用独立分支
    branchStrategy: 'feature-per-agent',
    
    // 冲突解决策略
    resolution: {
      file: 'last-write-wins',  // 或 'fail-fast'
      git: 'auto-merge',        // 或 'manual'
      dependency: 'wait'        // 或 'skip'
    },
    
    // 安全措施
    safeguards: [
      '每个 agent 独立工作目录',
      '定期 checkpoint',
      '冲突时暂停并通知',
      'PM agent 监控和协调'
    ]
  };
}

/**
 * 安全并发执行器
 */
export class SafeConcurrentExecutor {
  constructor(projectId, options = {}) {
    this.projectId = projectId;
    this.maxConcurrency = options.maxConcurrency || 3;
    this.activeAgents = new Map();
    this.fileLocks = new Map();
    this.completedTasks = new Set();
  }
  
  /**
   * 执行任务组（带冲突检测）
   */
  async executeGroup(group) {
    const { phase, tasks, parallel, strategy } = group;
    
    console.log(`\n📦 Phase ${phase}: ${tasks.length} tasks (${parallel ? 'parallel' : 'serial'})`);
    
    if (!parallel) {
      // 串行执行
      for (const task of tasks) {
        await this.executeTask(task);
      }
    } else if (strategy === 'module-based') {
      // 模块并行（每个任务独立目录）
      await this.executeParallelWithModules(tasks);
    } else {
      // 常规并行
      await this.executeParallel(tasks);
    }
  }
  
  /**
   * 模块并行执行
   */
  async executeParallelWithModules(tasks) {
    // 为每个任务分配独立模块
    const moduleTasks = defineModuleBoundaries(tasks);
    
    // 并发执行
    const promises = moduleTasks.map(task => this.executeTask(task));
    await Promise.all(promises);
  }
  
  /**
   * 常规并行执行
   */
  async executeParallel(tasks) {
    const promises = tasks.map(task => this.executeTask(task));
    await Promise.all(promises);
  }
  
  /**
   * 执行单个任务（带文件锁）
   */
  async executeTask(task) {
    const { role, agentId, workDir } = task;
    
    // 检查文件锁
    const lockedFiles = this.checkFileLocks(task.allowedFiles);
    if (lockedFiles.length > 0) {
      console.log(`   ⚠️  ${role} 等待文件解锁: ${lockedFiles.join(', ')}`);
      await this.waitForFileUnlock(lockedFiles);
    }
    
    // 获取文件锁
    this.acquireFileLocks(task.allowedFiles, role);
    
    try {
      // 执行任务
      console.log(`   🚀 ${role} 开始执行 (${agentId})`);
      
      const result = await sessions_spawn({
        agentId,
        task: task.description,
        cwd: workDir || process.cwd(),
        label: `${role}-${this.projectId}`
      });
      
      // 等待完成
      await this.waitForCompletion(result.runId);
      
      this.completedTasks.add(task.id);
      console.log(`   ✅ ${role} 完成`);
      
      return result;
    } finally {
      // 释放文件锁
      this.releaseFileLocks(task.allowedFiles);
    }
  }
  
  /**
   * 文件锁管理
   */
  checkFileLocks(patterns) {
    const locked = [];
    // 实现文件锁检查
    return locked;
  }
  
  acquireFileLocks(patterns, owner) {
    // 实现文件锁获取
  }
  
  releaseFileLocks(patterns) {
    // 实现文件锁释放
  }
  
  waitForFileUnlock(files) {
    // 等待文件解锁
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  waitForCompletion(runId) {
    // 等待 subagent 完成
    return new Promise((resolve) => {
      const check = async () => {
        const info = await subagents({ action: 'info', target: runId });
        if (info && (info.status === 'done' || info.status === 'error')) {
          resolve(info);
        } else {
          setTimeout(check, 5000);
        }
      };
      check();
    });
  }
}

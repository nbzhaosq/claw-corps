/**
 * 存储管理 - 处理 ~/.claw-corps 下的所有数据
 */
import { homedir } from 'os';
import { join } from 'path';
import { 
  existsSync, 
  mkdirSync, 
  readFileSync, 
  writeFileSync,
  readdirSync 
} from 'fs';
import { v4 as uuidv4 } from 'uuid';

const CLAW_CORPS_DIR = join(homedir(), '.claw-corps');
const PROJECTS_DIR = join(CLAW_CORPS_DIR, 'projects');
const CONFIG_FILE = join(CLAW_CORPS_DIR, 'config.json');

export class Storage {
  static init() {
    // 创建目录结构
    if (!existsSync(CLAW_CORPS_DIR)) {
      mkdirSync(CLAW_CORPS_DIR, { recursive: true });
    }
    if (!existsSync(PROJECTS_DIR)) {
      mkdirSync(PROJECTS_DIR, { recursive: true });
    }
    
    // 初始化配置文件
    if (!existsSync(CONFIG_FILE)) {
      const defaultConfig = {
        defaultTool: 'claude-code',
        maxRetries: 3,
        logLevel: 'info',
        agents: {
          'claude-code': {
            available: true,
            defaultModel: 'claude-3-opus'
          },
          'opencode': {
            available: true,
            defaultModel: 'gpt-4'
          }
        }
      };
      writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    }
  }

  static getConfig() {
    this.init();
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  }

  static setConfig(key, value) {
    const config = this.getConfig();
    const keys = key.split('.');
    let current = config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  static createProject(name, description, tool = 'claude-code') {
    this.init();
    
    const projectId = `proj_${uuidv4().split('-')[0]}`;
    const projectDir = join(PROJECTS_DIR, projectId);
    
    mkdirSync(projectDir, { recursive: true });
    mkdirSync(join(projectDir, 'logs'), { recursive: true });
    
    const meta = {
      id: projectId,
      name,
      description,
      tool,
      complexity: null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    writeFileSync(join(projectDir, 'meta.json'), JSON.stringify(meta, null, 2));
    
    const team = {
      project_id: projectId,
      members: []
    };
    
    writeFileSync(join(projectDir, 'team.json'), JSON.stringify(team, null, 2));
    
    const progress = {
      project_id: projectId,
      stages: [
        { name: 'intake', status: 'pending' },
        { name: 'analysis', status: 'pending' },
        { name: 'assignment', status: 'pending' },
        { name: 'development', status: 'pending' },
        { name: 'testing', status: 'pending' },
        { name: 'delivery', status: 'pending' }
      ],
      current_stage: 'intake'
    };
    
    writeFileSync(join(projectDir, 'progress.json'), JSON.stringify(progress, null, 2));
    
    return projectId;
  }

  static getProject(projectId) {
    const projectDir = join(PROJECTS_DIR, projectId);
    
    if (!existsSync(projectDir)) {
      return null;
    }
    
    return {
      meta: JSON.parse(readFileSync(join(projectDir, 'meta.json'), 'utf-8')),
      team: JSON.parse(readFileSync(join(projectDir, 'team.json'), 'utf-8')),
      progress: JSON.parse(readFileSync(join(projectDir, 'progress.json'), 'utf-8'))
    };
  }

  static updateProjectMeta(projectId, updates) {
    const projectDir = join(PROJECTS_DIR, projectId);
    const metaPath = join(projectDir, 'meta.json');
    
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
    Object.assign(meta, updates, { updated_at: new Date().toISOString() });
    
    writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    return meta;
  }

  static updateProjectProgress(projectId, updates) {
    const projectDir = join(PROJECTS_DIR, projectId);
    const progressPath = join(projectDir, 'progress.json');
    
    const progress = JSON.parse(readFileSync(progressPath, 'utf-8'));
    Object.assign(progress, updates);
    
    writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    return progress;
  }

  static updateProjectTeam(projectId, updates) {
    const projectDir = join(PROJECTS_DIR, projectId);
    const teamPath = join(projectDir, 'team.json');
    
    const team = JSON.parse(readFileSync(teamPath, 'utf-8'));
    Object.assign(team, updates);
    
    writeFileSync(teamPath, JSON.stringify(team, null, 2));
    return team;
  }

  static listProjects(filters = {}) {
    this.init();
    
    const projects = [];
    const projectDirs = readdirSync(PROJECTS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const projectId of projectDirs) {
      const project = this.getProject(projectId);
      
      if (filters.status && project.meta.status !== filters.status) {
        continue;
      }
      
      projects.push(project);
    }
    
    return projects.sort((a, b) => 
      new Date(b.meta.created_at) - new Date(a.meta.created_at)
    );
  }

  static appendAgentLog(projectId, agentId, message) {
    const projectDir = join(PROJECTS_DIR, projectId);
    const logPath = join(projectDir, 'logs', `${agentId}.log`);
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    writeFileSync(logPath, logEntry, { flag: 'a' });
  }

  static appendWorkflowLog(projectId, message) {
    const projectDir = join(PROJECTS_DIR, projectId);
    const logPath = join(projectDir, 'logs', 'workflow.log');
    
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;
    
    writeFileSync(logPath, logEntry, { flag: 'a' });
  }
}

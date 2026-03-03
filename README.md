# 🦞 Claw Corps

**Multi-Agent Development Orchestration for OpenClaw**

Coordinate AI developers, architects, and testers to build complex software projects collaboratively using OpenClaw subagents.

[![npm version](https://badge.fury.io/js/claw-corps.svg)](https://badge.fury.io/js/claw-corps)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### 🎯 Intelligent Project Management
- **Complexity Assessment** - Automatically evaluate project complexity (Simple/Medium/Complex/Enterprise)
- **Team Allocation** - Assign optimal team composition based on complexity
- **Progress Tracking** - Real-time project status and milestone tracking

### 🤖 Multi-Agent Coordination
- **Role-Based Agents** - PM, Architect, Developer, Senior Developer, QA, Designer, DevOps
- **Automatic Agent Selection** - Coding tasks → claude-code/opencode, Management tasks → codemanager
- **Concurrent Execution** - Multiple agents work in parallel safely
- **Conflict Prevention** - Module-based parallelization with file locking

### 🔧 OpenClaw Integration
- **Native Subagents API** - Direct integration with OpenClaw's subagent mechanism
- **Non-Blocking Execution** - Spawn agents asynchronously
- **Auto-Announcement** - Results automatically posted back to chat
- **Session Isolation** - Each agent has independent context

### 📊 Complete Workflow
```
Init → Assess → Assign → Run → Track → Deliver
```

---

## 🤖 For Agent - Quick Setup Guide

**Copy this section to any AI agent to get started with Claw Corps:**

```
# 🦞 Claw Corps - Agent Quick Start

You now have access to Claw Corps, a multi-agent development orchestration system for OpenClaw.

## Prerequisites Check

Before using Claw Corps, check your OpenClaw environment:

```bash
# 1. Install Claw Corps
cd /tmp
git clone https://github.com/nbzhaosq/claw-corps.git
cd claw-corps
npm install  # Uses your configured npm registry
npm link     # Makes 'claw-corps' command globally available

**Note**: This project doesn't include lock files (package-lock.json).
Run `npm install` to generate one with your own registry configuration.

# 2. Check your available agents (in OpenClaw session)
# Use agents_list tool or check your OpenClaw config

# 3. Check environment
claw-corps env
```

## Basic Commands

```bash
# 1. Create a new project
claw-corps init "项目名称" --description "项目描述" --tool claude-code

# 2. Assess complexity (non-interactive)
claw-corps assess <PROJECT_ID> \
  --tech-stack "Node.js React TypeScript" \
  --features 10 \
  --needs-ui \
  --accept

# 3. Assign team
claw-corps assign <PROJECT_ID> --confirm

# 4. Check status
claw-corps status <PROJECT_ID>
claw-corps list
```

## Key Concepts

- **Project Workflow**: Init → Assess → Assign → Run → Deliver
- **Complexity Levels**: Simple (0-19) / Medium (20-39) / Complex (40-69) / Enterprise (70+)
- **Agent Roles**: PM, Architect, Developer, Senior Developer, QA, Designer, DevOps

## Runtime Selection

**Important**: Claw Corps uses two types of runtimes:

1. **ACP Runtime** - For coding agents (Developer/QA)
   - `claude` (Claude Code)
   - `opencode` (OpenCode)
   - `codex` (OpenAI Codex)
   - `pi` (Pi agent)
   - `gemini` (Gemini CLI)

2. **Native Subagent Runtime** - For management agents (PM/Architect/Designer)
   - Your main OpenClaw agent

**Claw Corps automatically selects the correct runtime based on the agent type.**

## Agent Configuration

**Important**: Claw Corps uses two types of agents:

1. **Manager Agent** - For PM, Architect, Designer roles (planning/design tasks)
2. **Coding Agent** - For Developer, QA roles (code writing tasks)

**Default Configuration:**
- Manager Agent: Uses your main agent (configurable via --manager-agent)
- Coding Agent: Uses claude-code or opencode (configurable via --coding-agent)

**Check Available Agents:**

```bash
# In OpenClaw session, check what agents are available:
# - Look for agents with coding capabilities (claude-code, opencode, etc.)
# - Note your main agent ID for management tasks

# Update project to use your available agents:
claw-corps config --coding-agent <your-coding-agent-id>
claw-corps config --manager-agent <your-manager-agent-id>
```

**OpenClaw Configuration Required:**

Ensure your OpenClaw config (`~/.config/openclaw/config.json`) allows your main agent to spawn subagents:

```json5
{
  agents: {
    list: [
      {
        id: "your-main-agent",  // Replace with your agent ID
        subagents: {
          allowAgents: ["*"]  // Or list specific agents: ["claude-code", "opencode"]
        }
      }
    ]
  }
}
```

## Data Location

- Projects: `~/.claw-corps/projects/`
- Each project: `~/.claw-corps/projects/<project-id>/`
  - meta.json - Project metadata
  - team.json - Team configuration
  - progress.json - Progress tracking
  - logs/ - Execution logs

## Example Workflow

```bash
# Example: Create a web application
# Step 1: Initialize project
claw-corps init "Task Manager" \
  --description "A task management web app with user authentication and real-time updates"

# Step 2: Assess complexity (will generate PROJECT_ID like proj_xxxxxxxx)
claw-corps assess proj_12345678 \
  --tech-stack "Next.js React Node.js SQLite" \
  --features 15 \
  --integrations 2 \
  --needs-ui \
  --high-performance \
  --accept

# Step 3: Assign team
claw-corps assign proj_12345678 --confirm

# Step 4: Check status
claw-corps status proj_12345678
```

**To execute in OpenClaw environment:**

```javascript
// Import the integration module
const { runProjectFromClawCorps } = await import('/tmp/claw-corps/src/openclaw-integration.js');

// Run with your available agents
await runProjectFromClawCorps('proj_12345678', {
  codingAgent: 'your-coding-agent',    // e.g., 'claude-code', 'opencode'
  managerAgent: 'your-manager-agent',  // e.g., 'main', 'assistant'
  timeout: 900
});
```

## Notes

- Claw Corps uses OpenClaw's native subagents API
- Developer and QA roles automatically use claude-code for coding tasks
- Projects are stored locally in `~/.claw-corps/`
- Use `--accept` or `--confirm` flags for non-interactive mode
```

---

## 🚀 Quick Start

### Installation

```bash
npm install -g claw-corps
```

### Basic Usage

```bash
# 1. Create a new project
claw-corps init "My Project" --description "Project description"

# 2. Assess complexity
claw-corps assess proj_xxx \
  --tech-stack Node.js React \
  --features 10 \
  --needs-ui \
  --accept

# 3. Assign team
claw-corps assign proj_xxx --confirm

# 4. Run project (in OpenClaw environment)
claw-corps run proj_xxx --workflow hybrid
```

---

## 🎭 How It Works

### Architecture

```
OpenClaw (Platform)
  └─ Subagents API (Mechanism)
       └─ Claw Corps (Application)
            ├─ PM/Architect/Designer → codemanager agent
            └─ Developer/QA → claude-code agent ✨
```

### Workflow

```
User Request
    ↓
Claw Corps (Coordination)
    ├─ PM (codemanager) → Requirements & Planning
    ├─ Architect (codemanager) → System Design
    ├─ Developer (claude-code) → Implementation ✨
    └─ QA (claude-code) → Testing ✨
    ↓
Auto-Announce Results
```

### Agent Selection

| Role | Agent | Reason |
|------|-------|--------|
| 📋 Project Manager | codemanager | Management tasks |
| 🏗️ Architect | codemanager | Design tasks |
| 💻 Developer | **claude-code** | Needs to write code |
| 👨‍💻 Senior Developer | **claude-code** | Needs to write code |
| 🧪 QA | **claude-code** | Needs to write tests |
| 🎨 Designer | codemanager | Design tasks |
| ⚙️ DevOps | codemanager | Infrastructure tasks |

---

## 📖 Documentation

- [Architecture Design](docs/architecture.md)
- [OpenClaw Integration](docs/openclaw-integration.md)
- [Coding Agents Guide](docs/coding-agents-guide.md)
- [Architecture Diagram](docs/architecture-diagram.md)

---

## 🎯 Use Cases

### Simple Project (1 Developer)
```bash
claw-corps init "CLI Tool"
claw-corps assess proj_xxx --features 3 --accept
claw-corps assign proj_xxx --confirm
claw-corps run proj_xxx
```

### Medium Project (3-4 Agents)
```bash
claw-corps init "Web Application"
claw-corps assess proj_xxx \
  --tech-stack Next.js React SQLite \
  --features 15 \
  --needs-ui \
  --accept
claw-corps assign proj_xxx --confirm
claw-corps run proj_xxx --workflow hybrid
```

### Complex Project (5+ Agents)
```bash
claw-corps init "Enterprise System"
claw-corps assess proj_xxx \
  --tech-stack "Microservices Kubernetes PostgreSQL Redis" \
  --features 30 \
  --integrations 5 \
  --high-performance \
  --high-security \
  --accept
claw-corps assign proj_xxx --confirm
claw-corps run proj_xxx --workflow hybrid --timeout 900
```

---

## 🔧 Configuration

### For Agent: Check Prerequisites

```bash
# 1. Check if Claw Corps is installed
which claw-corps || echo "Need to install Claw Corps first"

# 2. Check environment and available agents
claw-corps env

# 3. Check current agent configuration
cat ~/.claw-corps/config.json 2>/dev/null || echo "No config yet"

# 4. Check available projects
claw-corps list

# 5. Check specific project
claw-corps status <PROJECT_ID>
```

**Configure Available Agents:**

```bash
# Set your coding agent (for Developer/QA roles)
claw-corps config --coding-agent claude-code  # or opencode, etc.

# Set your manager agent (for PM/Architect roles)
claw-corps config --manager-agent main  # or your main agent ID
```

### OpenClaw Config

**Required**: Enable ACP runtime and allow subagent spawning.

Check your OpenClaw configuration (`~/.openclaw/openclaw.json`):

```json5
{
  // Enable ACP runtime for coding agents
  acp: {
    enabled: true,
    defaultAgent: "claude",  // Default coding agent
    dispatch: {
      enabled: true
    }
  },

  agents: {
    list: [
      {
        id: "your-main-agent-id",  // Your main agent
        subagents: {
          allowAgents: ["*"]  // Allow spawning subagents
        }
      }
    ]
  }
}
```

**How to Find Your Agent ID:**
1. Check your OpenClaw config file
2. Or use `agents_list` tool in OpenClaw session
3. Or check the "agent" field in your OpenClaw environment

**ACP Harness IDs:**
- `claude` - Claude Code (recommended for coding tasks)
- `opencode` - OpenCode
- `codex` - OpenAI Codex
- `pi` - Pi agent
- `gemini` - Gemini CLI

**Note**: You do NOT need to create OpenClaw agents for coding harnesses!
Claw Corps uses ACP runtime to call them directly.

### Project Config

```bash
# Use claude-code (default)
claw-corps init "Project" --tool claude-code

# Use opencode
claw-corps init "Project" --tool opencode
```

---

## 📊 CLI Commands

```bash
# Project Management
claw-corps init <name>              # Create new project
claw-corps list [--status <status>] # List projects
claw-corps status <projectId>       # Show project status

# Team Management
claw-corps assess <projectId>       # Assess complexity
claw-corps assign <projectId>       # Assign team

# Execution
claw-corps run <projectId>          # Start execution
claw-corps stop <projectId>         # Stop execution

# Monitoring
claw-corps logs <projectId>         # View logs
claw-corps env                      # Check environment

# Configuration
claw-corps config --list            # Manage config
```

---

## 🛡️ Concurrent Safety

### Module-Based Parallelization
Each developer works on independent modules:
```
Developer A → modules/auth/    (independent)
Developer B → modules/product/ (independent)
Developer C → modules/order/   (independent)
```

### File Locking
Only one agent can modify a file at a time.

### Dependency Management
Tasks are executed in dependency order:
```
PM → Architect → Developers → QA
```

---

## 📈 Project Stats

- **Code Files**: 20+
- **Lines of Code**: 3000+
- **CLI Commands**: 9
- **Agent Roles**: 7
- **Node.js**: 18+

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🤖 Agent Best Practices

### When to Use Claw Corps

**Use Claw Corps when:**
- Building a new software project from scratch
- Project requires multiple roles (PM + Developer + QA)
- Need structured project management workflow
- Want concurrent multi-agent execution
- Working on Medium+ complexity projects

**Don't use Claw Corps when:**
- Simple one-off coding tasks
- Single file modifications
- Quick fixes or patches
- Learning/experimental projects

### Recommended Timeout Settings

| Project Complexity | Developer Timeout | QA Timeout |
|-------------------|------------------|-----------|
| Simple | 5 minutes | 3 minutes |
| **Medium** | **15 minutes** | **10 minutes** |
| Complex | 30 minutes | 15 minutes |
| Enterprise | 60 minutes | 30 minutes |

### Common Agent Tasks

```bash
# Task 1: Create a simple CLI tool
claw-corps init "CLI Tool"
claw-corps assess <ID> --tech-stack Node.js --features 3 --accept
claw-corps assign <ID> --confirm

# Task 2: Create a web application
claw-corps init "Web App" --description "Full-stack web app"
claw-corps assess <ID> \
  --tech-stack "Next.js React Node.js" \
  --features 10 \
  --needs-ui \
  --accept
claw-corps assign <ID> --confirm

# Task 3: Create an API service
claw-corps init "REST API"
claw-corps assess <ID> \
  --tech-stack "Node.js Express PostgreSQL" \
  --features 8 \
  --integrations 2 \
  --high-security \
  --accept
claw-corps assign <ID> --confirm
```

**Note**: You don't need to specify --tool at init time. Configure your agents once using:
```bash
claw-corps config --coding-agent <your-coding-agent>
claw-corps config --manager-agent <your-manager-agent>
```

### Troubleshooting for Agents

**Problem: Agent not found / subagent spawn failed**
```bash
# Solution 1: Check available agents in your OpenClaw environment
# Use agents_list tool or check ~/.config/openclaw/config.json

# Solution 2: Configure Claw Corps to use your available agents
claw-corps config --coding-agent <your-available-coding-agent>
claw-corps config --manager-agent <your-available-manager-agent>

# Solution 3: Check OpenClaw config allows subagents
# Ensure your main agent has: subagents: { allowAgents: ["*"] }
```

**Problem: Project not found**
```bash
# Solution: List all projects
claw-corps list
# Use the correct PROJECT_ID from the list
```

**Problem: Assessment shows 0 features**
```bash
# Solution: Use --features flag explicitly
claw-corps assess <ID> --features 10 --accept
```

**Problem: Team assignment failed**
```bash
# Solution: Use --confirm flag for non-interactive mode
claw-corps assign <ID> --confirm
```

**Problem: Want to check what agents will do**
```bash
# Solution: Review team configuration
claw-corps status <ID>
cat ~/.claw-corps/projects/<ID>/team.json
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Built on [OpenClaw](https://github.com/openclaw/openclaw)
- Inspired by the concept of AI-powered development teams
- Powered by subagents for true concurrent execution

---

## 📮 Contact

- **Author**: Nick Zhao
- **Project**: [https://github.com/your-username/claw-corps](https://github.com/your-username/claw-corps)
- **Documentation**: [docs/](docs/)

---

**🦞 Building software with AI teams, one project at a time.**

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

## Installation

```bash
# Clone and install
cd /tmp
git clone https://github.com/nbzhaosq/claw-corps.git
cd claw-corps
npm install
npm link  # Makes 'claw-corps' command globally available
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
- **Auto Selection**: Developer/QA → claude-code (coding), PM/Architect → codemanager (management)

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
claw-corps init "Task Manager" \
  --description "A task management web app with user authentication and real-time updates" \
  --tool claude-code

# Assess (will generate PROJECT_ID like proj_xxxxxxxx)
claw-corps assess proj_12345678 \
  --tech-stack "Next.js React Node.js SQLite" \
  --features 15 \
  --integrations 2 \
  --needs-ui \
  --high-performance \
  --accept

# Assign team
claw-corps assign proj_12345678 --confirm

# In OpenClaw environment, use the integration module:
# const { runProjectFromClawCorps } = await import('/tmp/claw-corps/src/openclaw-integration.js');
# await runProjectFromClawCorps('proj_12345678', { codingAgent: 'claude-code' });
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
# Check if Claw Corps is installed
which claw-corps

# Check environment
claw-corps env

# Check available projects
claw-corps list

# Check specific project
claw-corps status <PROJECT_ID>
```

### OpenClaw Config

Ensure your OpenClaw configuration allows coding agents:

```json5
{
  agents: {
    list: [
      {
        id: "codemanager",
        subagents: {
          allowAgents: ["claude-code", "opencode"]
        }
      }
    ]
  }
}
```

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
claw-corps init "CLI Tool" --tool claude-code
claw-corps assess <ID> --tech-stack Node.js --features 3 --accept
claw-corps assign <ID> --confirm

# Task 2: Create a web application
claw-corps init "Web App" --tool claude-code --description "Full-stack web app"
claw-corps assess <ID> \
  --tech-stack "Next.js React Node.js" \
  --features 10 \
  --needs-ui \
  --accept
claw-corps assign <ID> --confirm

# Task 3: Create an API service
claw-corps init "REST API" --tool claude-code
claw-corps assess <ID> \
  --tech-stack "Node.js Express PostgreSQL" \
  --features 8 \
  --integrations 2 \
  --high-security \
  --accept
claw-corps assign <ID> --confirm
```

### Troubleshooting for Agents

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

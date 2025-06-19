# Advanced Memory Bank MCP v6.0.0

[![npm version](https://badge.fury.io/js/@andrebuzeli%2Fadvanced-memory-bank-mcp.svg)](https://badge.fury.io/js/@andrebuzeli%2Fadvanced-memory-bank-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Advanced Memory Bank MCP Server with topic-based storage and MEMORY_BANK_ROOT support**

## 🚀 Features

- ✅ **14 MCP Tools** - Complete set of memory management tools
- ✅ **Topic-Based Organization** - Organize memories by topics (fixed and custom)
- ✅ **MEMORY_BANK_ROOT Support** - Choose where to store your memories
- ✅ **Fixed Topics** - Predefined topics for common use cases
- ✅ **Custom Topics** - Create any topic you need
- ✅ **Search & Filter** - Advanced search across all memories
- ✅ **Creative Analysis** - AI-powered content analysis
- ✅ **Sequential Thinking** - Step-by-step problem solving

## 📦 Installation

### NPM (Recommended)
```bash
npm install -g @andrebuzeli/advanced-memory-bank-mcp
```

### VS Code MCP Configuration
Add to your VS Code `settings.json`:

```json
{
  "mcp.servers": {
    "advanced-json-memory-bank": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@andrebuzeli/advanced-memory-bank-mcp@6.0.0"
      ],
      "env": {
        "MEMORY_BANK_ROOT": "/path/to/your/memories"
      }
    }
  }
}
```

## 🗂️ MEMORY_BANK_ROOT Configuration

### Environment Variable
```bash
# Windows
set MEMORY_BANK_ROOT=D:\MyProjects\Memories

# Linux/Mac
export MEMORY_BANK_ROOT=/home/user/memories
```

### Behavior
- **With MEMORY_BANK_ROOT**: Uses your specified directory
- **Without MEMORY_BANK_ROOT**: Uses `~/.advanced-memory-bank` (default)

## 🛠️ Available Tools

### Core Memory Tools
1. **store-topic-memory** - Store information in a specific topic
2. **get-topic-memory** - Retrieve topic content
3. **list-topics** - List all project topics
4. **list-all-topic-memories** - List all memories by topics
5. **search-topic-memories** - Search across all topics
6. **update-topic-memory** - Update existing topic content
7. **delete-topic-memory** - Remove a topic completely

### Project Management
8. **get-project-info** - Get detailed project information
9. **list-projects** - List all available projects
10. **reset-project** - Remove all project memories
11. **initialize-fixed-topics** - Create standard topic structure
12. **list-fixed-topics** - List available fixed topics

### Advanced Features
13. **analyze-creative-content** - AI-powered content analysis
14. **sequential-thinking** - Structured problem-solving process

## 📋 Fixed Topics

The system includes 10 predefined topics:

- `summary` - Project overview and summary
- `libraries` - Dependencies and libraries used
- `change-history` - Record of changes and updates
- `architecture` - System architecture decisions
- `todo` - Tasks and action items
- `bugs` - Known issues and problems
- `features` - Implemented functionalities
- `documentation` - Technical documentation
- `testing` - Test strategies and results
- `deployment` - Deployment configurations

## 💡 Usage Examples

### Store a Memory
```json
{
  "tool": "store-topic-memory",
  "projectName": "my-app",
  "topic": "bugs",
  "content": "Critical bug in user authentication - needs immediate fix",
  "tags": ["critical", "auth", "security"],
  "importance": 9
}
```

### Search Memories
```json
{
  "tool": "search-topic-memories",
  "projectName": "my-app",
  "query": "authentication",
  "limit": 10
}
```

### Initialize Project Structure
```json
{
  "tool": "initialize-fixed-topics",
  "projectName": "new-project"
}
```

## 📁 Directory Structure

```
[MEMORY_BANK_ROOT]/
├── project-1.json
├── project-2.json
└── project-3.json
```

Each project file contains all topics organized as:
```json
{
  "summary": { "content": "...", "tags": [...], "importance": 8 },
  "bugs": { "content": "...", "tags": [...], "importance": 9 },
  "custom-topic": { "content": "...", "tags": [...], "importance": 7 }
}
```

## 🔧 Development

### Local Development
```bash
git clone https://github.com/andrebuzeli/advanced-memory-bank-mcp.git
cd advanced-memory-bank-mcp
npm install
npm run build
npm start
```

### Testing
```bash
# Test MEMORY_BANK_ROOT functionality
node test-memory-bank-root.mjs

# Demo complete functionality
node demo-memory-bank-root.mjs
```

## 📚 Documentation

- [TOOLS-REFERENCE.md](TOOLS-REFERENCE.md) - Complete tools reference
- [MEMORY_BANK_ROOT-GUIDE.md](MEMORY_BANK_ROOT-GUIDE.md) - Configuration guide
- [TOPIC-SYSTEM-GUIDE-v6.0.0.md](TOPIC-SYSTEM-GUIDE-v6.0.0.md) - Topic system guide

## 🔄 Version History

### v6.0.0 (Latest)
- ✅ **MEMORY_BANK_ROOT support** - Configure storage location
- ✅ **Topic-based memory system** - Organized by topics instead of IDs
- ✅ **14 complete MCP tools** - Full feature set
- ✅ **Fixed and custom topics** - Flexible organization
- ✅ **Enhanced search** - Find memories across topics
- ✅ **Creative analysis** - AI-powered insights
- ✅ **Sequential thinking** - Structured problem solving

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/andrebuzeli/advanced-memory-bank-mcp/issues)
- **NPM Package**: [@andrebuzeli/advanced-memory-bank-mcp](https://www.npmjs.com/package/@andrebuzeli/advanced-memory-bank-mcp)
- **Email**: andrebuzeli2@gmail.com

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our GitHub repository.

---

**Made with ❤️ by André Buzeli**

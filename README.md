# Advanced Memory Bank MCP v6.0.0

[![npm version](https://img.shields.io/npm/v/@andrebuzeli/advanced-memory-bank-mcp.svg)](https://www.npmjs.com/package/@andrebuzeli/advanced-memory-bank-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Advanced Memory Bank MCP Server with topic-based storage and customizable storage location using `MEMORY_BANK_ROOT`.

## 🚀 Quick Start

### Installation

```bash
npm install -g @andrebuzeli/advanced-memory-bank-mcp
```

### Configuration

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

### Usage

```bash
# Set custom storage location (optional)
export MEMORY_BANK_ROOT="/your/custom/path"

# Run the server
advanced-memory-bank
```

## 🆕 New in v6.0.0

- ✅ **MEMORY_BANK_ROOT Support**: Full support for custom storage directories
- ✅ **Topic-Based System**: Organize memories by topics (fixed and custom)
- ✅ **14 MCP Tools**: Complete set of memory management tools
- ✅ **NPM Package**: Available on npmjs.org
- ✅ **Global Binary**: Install and run globally

## 🛠️ Available Tools

### Core Memory Tools
1. **store-topic-memory** - Store information in a specific topic
2. **get-topic-memory** - Retrieve content from a topic
3. **list-topics** - List all topics in a project
4. **list-all-topic-memories** - List all memories organized by topics
5. **search-topic-memories** - Search across all topics
6. **update-topic-memory** - Update existing topic content
7. **delete-topic-memory** - Remove a topic and its content

### Project Management
8. **get-project-info** - Get detailed project information
9. **list-projects** - List all available projects
10. **reset-project** - Remove all memories from a project
11. **initialize-fixed-topics** - Create default fixed topics
12. **list-fixed-topics** - List available fixed topics

### Advanced Features
13. **analyze-creative-content** - Analyze content for insights
14. **sequential-thinking** - Process complex problems step by step

## 📁 Storage Locations

### With MEMORY_BANK_ROOT
```
MEMORY_BANK_ROOT/
├── project-1.json
├── project-2.json
└── project-3.json
```

### Default (without MEMORY_BANK_ROOT)
```
~/.advanced-memory-bank/
├── project-1.json
├── project-2.json
└── project-3.json
```

## 🗂️ Fixed Topics

The system includes predefined topics for organization:

- `summary` - Project overview
- `libraries` - Dependencies and libraries
- `change-history` - Change log
- `architecture` - Design decisions
- `todo` - Tasks and to-dos
- `bugs` - Known issues
- `features` - Implemented features
- `documentation` - Technical docs
- `testing` - Test strategies
- `deployment` - Deployment configs

## 🎯 Usage Examples

### Store Memory
```json
{
  "tool": "store-topic-memory",
  "projectName": "my-project",
  "topic": "bugs",
  "content": "Critical bug in checkout process",
  "tags": ["critical", "checkout"],
  "importance": 9
}
```

### Search Memories
```json
{
  "tool": "search-topic-memories",
  "projectName": "my-project",
  "query": "checkout bug",
  "limit": 10
}
```

### Creative Analysis
```json
{
  "tool": "analyze-creative-content",
  "content": "Design requirements for new feature",
  "analysisType": "comprehensive"
}
```

## 🔧 Development

```bash
# Clone repository
git clone https://github.com/andrebuzeli/advanced-memory-bank-mcp.git
cd advanced-memory-bank-mcp

# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start
```

## 📖 Documentation

- [Tools Reference](./TOOLS-REFERENCE.md) - Detailed tool documentation
- [MEMORY_BANK_ROOT Guide](./MEMORY_BANK_ROOT-GUIDE.md) - Storage configuration guide
- [Migration Guide](./MIGRATION-GUIDE-v6.0.0.md) - Upgrading from previous versions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/@andrebuzeli/advanced-memory-bank-mcp)
- [GitHub Repository](https://github.com/andrebuzeli/advanced-memory-bank-mcp)
- [Issue Tracker](https://github.com/andrebuzeli/advanced-memory-bank-mcp/issues)

## 📊 Version History

- **v6.0.0** - Topic-based system, MEMORY_BANK_ROOT support, NPM package
- **v5.x** - Previous versions with basic memory management

---

Made with ❤️ by [André Buzeli](https://github.com/andrebuzeli)

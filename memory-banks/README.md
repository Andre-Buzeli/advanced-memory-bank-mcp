# Memory Banks Directory

This directory contains the memory banks for different projects. Each project gets its own subdirectory with organized memory files.

## Structure

```
memory-banks/
├── project-name/
│   ├── summary.md
│   ├── status.md
│   ├── decisions/
│   ├── analyses/
│   └── workflows/
└── another-project/
    ├── summary.md
    └── ...
```

## Usage

Memory banks are automatically created when you start using the Advanced Memory Bank MCP with a new project. Each project maintains its own isolated memory space with semantic search capabilities.

## Note

Individual memory bank contents are ignored by git (see .gitignore) to keep personal project data private. Only this structural documentation is tracked.
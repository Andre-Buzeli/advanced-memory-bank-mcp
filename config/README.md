# Configuration Files

This directory contains configuration files for the Advanced Memory Bank MCP.

## Files

### `vscode-settings-example.json`
Example VS Code/Cursor configuration for integrating the Advanced Memory Bank MCP. Copy this to your VS Code settings.json file and adjust the paths as needed.

### `init.sql` (Optional)
Database initialization script for PostgreSQL with pgvector. Only needed if you want to use the optional database features instead of the default file-based storage.

### `optimization-rules.yaml` (Optional)
Configuration for memory optimization rules and consolidation settings.

### `templates/`
Template files for different types of memory documents.

## Usage

The Advanced Memory Bank MCP works completely without configuration files by default. These files are provided for advanced customization and optional features like PostgreSQL integration.

For basic usage, just add the MCP to your settings.json:

```json
{
  "mcp.servers": {
    "advanced-memory-bank": {
      "command": "npx",
      "args": ["-y", "@andrebuzeli/advanced-memory-bank"],
      "env": {
        "MEMORY_BANK_ROOT": "/path/to/your/memory/folder"
      }
    }
  }
}
```
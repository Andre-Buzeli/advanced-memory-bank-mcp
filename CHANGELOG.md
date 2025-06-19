# Changelog

All notable changes to this project will be documented in this file.

## [4.3.0] - 2025-06-17

### 🚨 CRITICAL FIX: User Settings.json Compatibility

### Fixed
- **VS Code Variable Error**: Resolved "Variable workspaceFolderBasename can not be resolved" error in user settings.json
- **User Settings Support**: Full compatibility with `C:\Users\...\AppData\Roaming\Code\User\settings.json`
- **Variable Independence**: No longer depends on problematic VS Code variables in user settings

### Added
- **Advanced Workspace Detection**: New `detectVSCodeActiveWorkspaceAdvanced()` method for user settings.json
- **Multiple Detection Strategies**: 
  - VS Code storage.json analysis for recent folders
  - Workspace storage directory analysis
  - Process command line extraction (Windows)
  - Smart pattern detection in common project directories
- **Zero Configuration**: Works automatically without any variables or manual configuration

### Enhanced
- **Detection Priority**: Advanced workspace detection gets highest priority for user settings.json
- **Robust Fallbacks**: Multiple strategies ensure project detection even without VS Code variables
- **Better Error Handling**: Graceful degradation when individual detection methods fail

### Recommended Configuration
```json
{
  "mcp": {
    "mcpServers": {
      "advanced-memory": {
        "command": "npx",
        "args": ["@andrebuzeli/advanced-json-memory-bank@4.3.0"]
      }
    }
  }
}
```

## [4.2.0] - 2025-06-17

### ✨ VS Code Variable Resolution (for .vscode/settings.json only)

### Added
- **VS Code Variable Support**: Automatic resolution of `${workspaceFolderBasename}`, `${workspaceFolder}`, `${userHome}`
- **Variable Detection Methods**: `resolveVSCodeVariables()` and `resolveVSCodeVariablesInString()`
- **Enhanced Active Workspace Detection**: `detectActiveVSCodeWorkspace()` with multiple strategies

### Enhanced
- **Priority System**: Variable resolution gets highest priority when available
- **Debug Output**: Detailed logging shows variable resolution process
- **Type Safety**: Improved TypeScript compatibility throughout

## [4.0.4] - 2025-06-17

### 🎯 Enhanced Project Detection Display

### Added

- **Startup Output Enhancement**: Clear project detection results displayed when MCP server starts
- **Visual Project Info**: Formatted output showing project name, detection method, and paths
- **IDE Integration Improvement**: Better visibility of detected project name in VS Code MCP context

### Enhanced

- **Initialization Display**: Added comprehensive project detection summary on server startup
- **User Experience**: Clear visual confirmation of which project was detected and how
- **Debugging Support**: Enhanced output format for easier validation and troubleshooting

### Technical Details

- **Server Initialization**: Enhanced `initialize()` method with detailed project detection output
- **Memory Manager Integration**: Improved project context interface with detection metadata
- **Non-Intrusive Logging**: Uses stderr to avoid interference with MCP protocol while providing clear feedback

### Output Format

```text
🎯 Advanced Memory Bank MCP v4.0.4 - Project Detection Results:
📋 Project Name: "your-project-name"
🔍 Detection Method: Package.json
📁 Project Path: /path/to/your/project
💾 Memory Directory: /path/to/memory/storage
✅ Ready for memory operations!
```

## [4.0.3] - 2025-06-17

### 🎯 Final Fix for Project Detection in VS Code MCP

### Fixed

- **User Directory Detection**: Fixed issue where user directories like "andre" were being detected as project names
- **MCP Environment Validation**: Enhanced detection algorithm to properly handle VS Code MCP server execution context
- **Fallback Behavior**: Improved fallback to "unknown-project" when running from invalid directories

### Enhanced

- **Detection Priority Reordered**: Package.json → Directory Name → VS Code Workspace → Fallback
- **Stricter Directory Validation**: Added comprehensive validation for project indicators before accepting directory names
- **Environment Variable Validation**: Enhanced VSCODE_CWD and VSCODE_WORKSPACE_FOLDER validation with project indicator checks

### Technical Details

- **Test Suite**: Added comprehensive MCP environment simulation tests (4/4 scenarios passing)
- **Path Blocking**: Enhanced `isSystemOrVSCodePath` to block user directories and system paths
- **Project Indicators**: Strengthened `hasProjectIndicators` validation for all detection methods
- **Error Recovery**: Improved error handling and logging for detection failures

### Validated Scenarios

✅ VS Code MCP with package.json in project directory  
✅ VS Code MCP with VSCODE_WORKSPACE_FOLDER set  
✅ VS Code MCP from user directory (correctly fallbacks to unknown-project)  
✅ VS Code MCP without environment variables

## [4.0.2] - 2025-06-17

### 🔧 Bug Fixes

- **Project Detection**: Implemented aggressive VS Code path blocking to prevent "microsoft-vs-code" detection
  - Enhanced `isValidProjectName` with `forbiddenPatterns` array for stricter validation
  - Added `isSystemOrVSCodePath` method to block system/VS Code directories
  - Strengthened VSCODE_CWD environment variable detection with enhanced validation
  - Added comprehensive blocking of VS Code system paths, extensions, and crash folders

## [4.0.1] - 2025-06-17

### 🎯 Enhanced Project Detection Fix

### Fixed

- **VS Code Workspace Detection**: Fixed issue where MCP server was detecting wrong project when running from user home directory
- **Improved Environment Variable Support**: Added support for VSCODE_WORKSPACE_FOLDER, VSCODE_CWD, and PROJECT_ROOT
- **Better Project Validation**: Enhanced validation to avoid user directories like "andre", "user", etc.
- **Multiple Package.json Search**: Now searches for package.json in multiple potential project directories

### Enhanced

- **Detection Priority**: Improved detection order - Package.json → Git repository → Directory name → VS Code workspace
- **Project Indicators**: Added detection of project indicators (.git, package.json, tsconfig.json, .vscode) to improve accuracy
- **Error Handling**: Better error handling and logging for detection failures

### Added

- **hasProjectIndicators()**: New method to validate directories contain actual project files
- **Enhanced Invalid Names List**: Added VS Code-specific names to avoid (microsoft-vs-code, vs-code, electron, etc.)
- **Stricter Validation**: Environment variables are now validated for project indicators before being trusted

### Technical Details

- **Detection Algorithm Rewritten**: Complete rewrite prioritizing reliable sources over environment variables
- **Path Validation**: Added multiple checks to avoid system directories, user folders, and VS Code installation paths
- **Project Indicators**: Now checks for 13+ different project file types for validation
- **Fallback Safety**: Multiple fallback mechanisms to ensure valid project names

## [4.0.0] - 2025-06-17ngelog

All notable changes to this project will be documented in this file.

## [4.0.1] - 2025-06-17

### 🎯 Enhanced Project Detection Fix

### Fixed

- **VS Code Workspace Detection**: Fixed issue where MCP server was detecting wrong project when running from user home directory
- **Improved Environment Variable Support**: Added support for VSCODE_WORKSPACE_FOLDER, VSCODE_CWD, and PROJECT_ROOT
- **Better Project Validation**: Enhanced validation to avoid user directories like "andre", "user", etc.
- **Multiple Package.json Search**: Now searches for package.json in multiple potential project directories

### Enhanced

- **Detection Priority**: Improved detection order - VS Code workspace → Package.json → Directory name → Git repository
- **Project Indicators**: Added detection of project indicators (.git, package.json, tsconfig.json, .vscode) to improve accuracy
- **Error Handling**: Better error handling and logging for detection failures

### Added

- **Workspace Configuration**: Added .vscode/mcp.json with environment variables for better VS Code integration
- **Git Repository Detection**: Added detection of project name from git repository root

### Technical Details

- **Environment Variables**: Support for PROJECT_ROOT, VSCODE_WORKSPACE_FOLDER, VSCODE_CWD
- **Multi-path Search**: Searches multiple paths for package.json and project indicators
- **Validation**: Enhanced project name validation to exclude common user directory names

## [4.0.0] - 2025-06-17

### 🎯 Clean Architecture & Version Alignment

### Changed

- **Version Consistency**: Aligned all version numbers to 4.0.0 across package.json, server.ts, and memory-manager.ts
- **Architecture Refinement**: Ensured clean, modern TypeScript implementation
- **Description Update**: Updated package.json description to reflect clean architecture focus

### Technical Details

- **Unified Versioning**: All components now consistently use v4.0.0
- **Clean Implementation**: Maintained the robust dynamic project detection and memory management
- **Modern Standards**: Following TypeScript and Node.js best practices

## [3.5.2] - 2025-06-17

### 🎯 Enhanced Project Detection Display

### Added

- **Project Detection Info Display**: Now shows exactly how the project name was detected
- **Detection Method Logging**: Logs detection method to stderr for debugging
- **Enhanced get-project-info**: Shows detection method, source, and path in a beautiful format

### Enhanced

- **Improved ProjectContext**: Added `detectionMethod` and `detectionSource` fields
- **Better Debugging**: All detection steps are now logged for transparency
- **Enhanced Output**: `get-project-info` tool now shows complete detection information

### Details

- **Detection Methods Tracked**: VS Code Workspace, Directory Name, Package.json, Fallback
- **Detection Sources Logged**: Environment variables, file paths, terminal context
- **Debugging Info**: All detection steps logged to stderr (MCP-safe)

### Example Output

```text
🎯 Project Auto-Detection Results

Project Name: advanced-memory-bank
Detection Method: Package.json
Detection Source: z:\MCP\MCP v2\advanced-memory-bank-mcp\package.json
Project Path: z:\MCP\MCP v2\advanced-memory-bank-mcp
Memory Directory: C:\Users\Usuario\.advanced-memory-bank\advanced-memory-bank
Total Memories: 5
System Version: 3.5.2

✅ Project detected automatically - no configuration needed!
```

## [3.5.1] - 2025-06-17

### 🔧 MCP Protocol Fixes

### Fixed
- **MCP Protocol Interference**: Removed console.log that was causing parse errors
- **Handler Errors**: Fixed creative analysis handler to use correct properties
- **Logging**: Replaced all console output with stderr to avoid MCP conflicts

## [3.5.0] - 2025-06-17

### 🚀 Major Release - Clean Architecture & Dynamic Project Detection

### Added
- **Dynamic Project Detection**: Automatically detects project name from VS Code workspace, package.json, git repository, or current directory
- **Zero Configuration**: No need to specify project names manually - completely automatic
- **Clean Architecture**: Streamlined codebase with only essential components
- **11 Core Tools**: Optimized memory management tools for maximum efficiency

### Changed
- **Complete Refactor**: Rebuilt from ground up with modern TypeScript practices
- **Simplified Structure**: Removed all temporary files, test scripts, and legacy code
- **Performance Improvements**: Faster memory operations with optimized algorithms
- **Better Error Handling**: Robust error management and graceful failures

### Removed
- All hardcoded project names and paths
- Temporary test scripts and development files
- Legacy backup systems and unused dependencies
- Complex configuration requirements

### Fixed
- TypeScript compilation errors
- Memory storage consistency issues
- Project detection reliability
- Tool registration and execution

### Technical Details
- **Memory Storage**: JSON-based per-project memory files
- **Project Detection**: Multi-source detection algorithm
- **Architecture**: Modular design with clear separation of concerns
- **Tools**: Memory management, sequential thinking, workflow navigation, creative analysis

### Installation
```bash
npm install @andrebuzeli/advanced-json-memory-bank
```

### Usage
The package now works completely automatically - no configuration needed!

---

## Previous Versions
See git history for earlier version details.

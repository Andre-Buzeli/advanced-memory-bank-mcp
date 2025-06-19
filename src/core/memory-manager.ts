/**
 * Memory Manager v4.0.0 - Dynamic Project Detection
 * Automatically detects IDE workspace and manages memories dynamically
 */

import fs from 'fs/promises';
import { existsSync, mkdirSync, statSync } from 'fs';
import path from 'path';
import os from 'os';
import { LRUCache } from 'lru-cache';

export interface Memory {
  id: string;
  content: string;
  tags: string[];
  timestamp: number;
  importance: number;
  projectContext: string;
}

export interface ProjectContext {
  name: string;
  path: string;
  detectedAt: number;
  detectionMethod: string;
  detectionSource: string;
}

export class MemoryManager {
  private readonly cache: LRUCache<string, Memory>;
  private projectContext: ProjectContext | null = null;
  private readonly memoryDir: string;
  private readonly version = '3.0.0';

  constructor() {
    this.cache = new LRUCache<string, Memory>({
      max: 1000,
      ttl: 1000 * 60 * 60 * 24, // 24 hours
    });

    // Initialize with dynamic project detection
    this.initializeProjectContext();
    this.memoryDir = this.getMemoryDirectory();
    this.ensureMemoryDirectory();
  }

  /**
   * Dynamically detect the current project context
   */  private initializeProjectContext(): void {
    const detectionResult = this.detectProjectNameWithSource();
    const projectPath = this.detectProjectPath();

    this.projectContext = {
      name: detectionResult.name,
      path: projectPath,
      detectedAt: Date.now(),
      detectionMethod: detectionResult.method,
      detectionSource: detectionResult.source,
    };

    // Enhanced debug logging for VS Code MCP context
    const isVSCodeMCP = process.env.TERM_PROGRAM === 'vscode' || 
                       process.argv.some(arg => arg.includes('advanced-json-memory-bank'));
      if (isVSCodeMCP) {
      // Detailed debug for VS Code MCP to understand what's happening
      process.stderr.write(`[Memory Manager] 🔍 Detected: "${detectionResult.name}" via ${detectionResult.method}\n`);
      process.stderr.write(`[Memory Manager] 📍 Detection Details:\n`);
      process.stderr.write(`  - Source: ${detectionResult.source}\n`);
      process.stderr.write(`  - Process CWD: ${process.cwd()}\n`);
      process.stderr.write(`  - Project Path: ${projectPath}\n`);
      process.stderr.write(`  - Is VS Code Context: ${process.env.TERM_PROGRAM === 'vscode'}\n`);
      
      // Show all process.argv for debugging
      process.stderr.write(`  - Process Args: ${process.argv.slice(1).join(' ')}\n`);
      
      // Show relevant environment variables
      const envVars = ['VSCODE_WORKSPACE_FOLDER', 'VSCODE_CWD', 'VSCODE_WORKSPACE_NAME'];
      envVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
          process.stderr.write(`  - ${varName}: ${value}\n`);
        }
      });

      // Show configuration helper if still showing unknown-project
      if (detectionResult.name === 'unknown-project') {
        this.createProjectConfigHelper();
      }
    } else {
      // Simple log for non-VS Code contexts
      process.stderr.write(`[Memory Manager] 🔍 Detected: "${detectionResult.name}" via ${detectionResult.method}\n`);
    }
  }

  /**
   * Get project detection information
   */
  getProjectDetectionInfo(): { 
    projectName: string; 
    detectionMethod: string; 
    detectionSource: string; 
    projectPath: string;
    memoryDirectory: string;
  } {
    return {
      projectName: this.projectContext?.name || 'unknown-project',
      detectionMethod: this.projectContext?.detectionMethod || 'fallback',
      detectionSource: this.projectContext?.detectionSource || 'directory-name',
      projectPath: this.projectContext?.path || process.cwd(),
      memoryDirectory: this.memoryDir,
    };
  }
  /**
   * Detect project name from multiple sources with detection info   */  private detectProjectNameWithSource(): { name: string; method: string; source: string } {
    try {      // Method -1: VS Code Active Workspace Detection (NEW - highest priority for user settings.json)
      const advancedWorkspaceResult = this.detectVSCodeActiveWorkspaceAdvanced();
      if (advancedWorkspaceResult.name && this.isValidProjectName(advancedWorkspaceResult.name)) {
        return {
          name: this.sanitizeProjectName(advancedWorkspaceResult.name),
          method: 'VS Code Active Workspace Detection',
          source: advancedWorkspaceResult.source,
        };
      }

      // Method 0: User-specified project configuration (high priority)
      const userResult = this.detectUserSpecifiedProject();
      if (userResult.name && this.isValidProjectName(userResult.name)) {
        return {
          name: this.sanitizeProjectName(userResult.name),
          method: 'User Configuration',
          source: userResult.source,
        };
      }// Method 1: Active VS Code workspace detection (highest priority for VS Code MCP)
      const vsCodeActiveResult = this.detectActiveVSCodeWorkspace();
      if (vsCodeActiveResult.name && this.isValidProjectName(vsCodeActiveResult.name)) {
        return {
          name: this.sanitizeProjectName(vsCodeActiveResult.name),
          method: 'Active VS Code Workspace',
          source: vsCodeActiveResult.source,
        };
      }

      // Method 2: Check package.json name (most reliable for actual projects)
      const packageResult = this.detectPackageNameWithSource();
      if (packageResult.name && this.isValidProjectName(packageResult.name)) {
        return {
          name: this.sanitizeProjectName(packageResult.name),
          method: 'Package.json',
          source: packageResult.source,
        };
      }

      // Method 2: Use current directory name (with strict validation)
      const currentDir = process.cwd();
      const dirName = path.basename(currentDir);
      
      // Only use directory name if it's valid and has project indicators
      if (this.isValidProjectName(dirName) && 
          currentDir !== os.homedir() && 
          !this.isSystemOrVSCodePath(currentDir) &&
          this.hasProjectIndicators(currentDir)) {
        return {
          name: this.sanitizeProjectName(dirName),
          method: 'Directory Name',
          source: currentDir,
        };
      }      // Method 3: VS Code config-based detection (for npx context)
      const configResult = this.detectFromVSCodeConfig();
      if (configResult.name && this.isValidProjectName(configResult.name)) {
        return {
          name: this.sanitizeProjectName(configResult.name),
          method: 'VS Code Config Search',
          source: configResult.source,
        };
      }

      // Method 4: VS Code NPX context detection
      const npxResult = this.detectVSCodeWorkspaceFromParent();
      if (npxResult.name && this.isValidProjectName(npxResult.name)) {
        return {
          name: this.sanitizeProjectName(npxResult.name),
          method: 'VS Code NPX Context',
          source: npxResult.source,
        };
      }

      // Method 4: Enhanced VS Code workspace detection
      const enhancedResult = this.detectVSCodeWorkspaceEnhanced();
      if (enhancedResult.name && 
          this.isValidProjectName(enhancedResult.name) &&
          enhancedResult.name !== 'microsoft-vs-code' &&
          enhancedResult.name !== 'andre' &&
          enhancedResult.name !== 'user') {
        return {
          name: this.sanitizeProjectName(enhancedResult.name),
          method: 'Enhanced VS Code Detection',
          source: enhancedResult.source,
        };
      }

      // Method 4: Check VS Code workspace (traditional method)
      const workspaceResult = this.detectVSCodeWorkspaceWithSource();
      if (workspaceResult.name && 
          this.isValidProjectName(workspaceResult.name) &&
          workspaceResult.name !== 'microsoft-vs-code' &&
          workspaceResult.name !== 'andre' &&
          workspaceResult.name !== 'user') {
        return {
          name: this.sanitizeProjectName(workspaceResult.name),
          method: 'VS Code Workspace',
          source: workspaceResult.source,
        };      }

      // Method 3: Smart pattern detection (when in user directory)
      if (currentDir === os.homedir() || this.isSystemOrVSCodePath(currentDir)) {
        const patternResult = this.detectProjectFromCommonPatterns();
        if (patternResult.name && this.isValidProjectName(patternResult.name)) {
          return {
            name: this.sanitizeProjectName(patternResult.name),
            method: 'Smart Pattern Detection',
            source: patternResult.source,
          };
        }
      }      // Method 5: Command-based workspace detection (for VS Code MCP context)
      const commandResult = this.detectWorkspaceViaCommands();
      if (commandResult.name && this.isValidProjectName(commandResult.name)) {
        return {
          name: this.sanitizeProjectName(commandResult.name),
          method: 'Command Detection',
          source: commandResult.source,
        };
      }

      // Method 6: VS Code settings detection (for VS Code MCP context)
      const vsCodeSettingsResult = this.detectVSCodeWorkspaceFromSettings();
      if (vsCodeSettingsResult.name && this.isValidProjectName(vsCodeSettingsResult.name)) {
        return {
          name: this.sanitizeProjectName(vsCodeSettingsResult.name),
          method: 'VS Code Recent Workspace',
          source: vsCodeSettingsResult.source,
        };
      }

      // Ultimate solution: Detect active VS Code workspace regardless of settings.json location
      const activeWorkspaceResult = this.detectActiveVSCodeWorkspace();
      if (activeWorkspaceResult.name && this.isValidProjectName(activeWorkspaceResult.name)) {
        return {
          name: this.sanitizeProjectName(activeWorkspaceResult.name),
          method: 'Active VS Code Workspace Detection',
          source: activeWorkspaceResult.source,
        };
      }

      // Fallback: use sanitized directory name or default
      const fallbackName = dirName && this.isValidProjectName(dirName) 
        ? dirName 
        : 'unknown-project';
      
      return {
        name: this.sanitizeProjectName(fallbackName),
        method: 'Fallback',
        source: 'directory-basename-fallback',
      };
    } catch (error) {
      // Log error to stderr (not interfering with MCP protocol)
      process.stderr.write(`[MemoryManager] Error detecting project name: ${error}\n`);
      return {
        name: 'unknown-project',
        method: 'Error Fallback',
        source: 'error-recovery',
      };
    }
  }

  /**
   * Detect VS Code workspace name from environment or process with source info
   */  private detectVSCodeWorkspaceWithSource(): { name: string | null; source: string } {
    try {
      // Check workspace name environment variable first
      const workspaceName = process.env.VSCODE_WORKSPACE_NAME;
      if (workspaceName && this.isValidProjectName(workspaceName)) {
        return { name: workspaceName, source: 'VSCODE_WORKSPACE_NAME env var' };
      }

      // Check VSCODE_WORKSPACE_FOLDER environment variable
      const workspaceFolder = process.env.VSCODE_WORKSPACE_FOLDER;
      if (workspaceFolder && 
          workspaceFolder !== os.homedir() && 
          this.hasProjectIndicators(workspaceFolder) &&
          !this.isSystemOrVSCodePath(workspaceFolder)) {
        const baseName = path.basename(workspaceFolder);
        if (this.isValidProjectName(baseName)) {
          return { name: baseName, source: 'VSCODE_WORKSPACE_FOLDER env var' };
        }
      }

      // Check VSCODE_CWD (but be very restrictive)
      const vscodeCwd = process.env.VSCODE_CWD;
      if (vscodeCwd && 
          vscodeCwd !== os.homedir() && 
          this.hasProjectIndicators(vscodeCwd) &&
          !this.isSystemOrVSCodePath(vscodeCwd)) {
        const baseName = path.basename(vscodeCwd);
        if (this.isValidProjectName(baseName)) {
          return { name: baseName, source: 'VSCODE_CWD env var' };
        }
      }

      // Check if running in VS Code context (but only with strong validation)
      const term = process.env.TERM_PROGRAM;
      if (term === 'vscode') {
        const cwd = process.cwd();
        if (cwd !== os.homedir() && 
            this.hasProjectIndicators(cwd) &&
            !this.isSystemOrVSCodePath(cwd)) {
          const baseName = path.basename(cwd);
          if (this.isValidProjectName(baseName)) {
            return { name: baseName, source: 'VS Code terminal context with project indicators' };
          }
        }
      }

      return { name: null, source: 'not-detected' };
    } catch {
      return { name: null, source: 'detection-error' };
    }
  }

  /**
   * Detect package.json name with source info
   */
  private detectPackageNameWithSource(): { name: string | null; source: string } {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (existsSync(packagePath)) {
        const packageContent = require(packagePath);
        const name = packageContent.name;
        if (name && typeof name === 'string') {
          // Remove npm scope if present
          return { 
            name: name.replace(/^@[^/]+\//, ''), 
            source: packagePath 
          };
        }
      }
      return { name: null, source: 'package.json not found or invalid' };
    } catch {
      return { name: null, source: 'package.json read error' };
    }
  }

  /**
   * Check if a name is valid for a project
   */  private isValidProjectName(name: string): boolean {
    if (!name || name.length < 2) return false;
    
    const invalidNames = [
      'src', 'dist', 'build', 'out', 'bin', 'lib',
      'node_modules', 'Users', 'Documents', 'Desktop',
      'Downloads', 'AppData', 'Program Files', 'Windows',
      'System32', 'temp', 'tmp', '.', '..',
      'andre', 'user', 'admin', 'home', 'root', 'dev',
      'microsoft-vs-code', 'vs-code', 'vscode', 'code',
      'visual-studio-code', 'microsoft', 'electron',
      'extensions', 'extension', 'crash', 'crashes',
      'logs', 'log', 'cache', 'caches'
    ];

    const lowerName = name.toLowerCase();
    
    // Strict blocking of VS Code and system directories
    const forbiddenPatterns = [
      'microsoft', 'vs-code', 'vscode', 'visual-studio',
      'electron', 'extension', 'crash', 'log', 'cache',
      'user', 'admin', 'system', 'windows', 'appdata'
    ];
    
    for (const pattern of forbiddenPatterns) {
      if (lowerName.includes(pattern)) {
        return false;
      }
    }

    return !invalidNames.includes(lowerName) && 
           !/^[a-z]$/.test(lowerName) && // Single letter names
           !/^(c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)$/.test(lowerName); // Drive letters
  }

  /**
   * Sanitize project name for safe file system usage
   */
  private sanitizeProjectName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '-')
      .replace(/^(-+)|(-+)$/g, '')
      .replace(/-+/g, '-')
      .substring(0, 50) || 'project';
  }

  /**
   * Detect project path
   */
  private detectProjectPath(): string {
    try {
      // Try to find git root first
      let currentPath = process.cwd();
      while (currentPath !== path.dirname(currentPath)) {
        if (existsSync(path.join(currentPath, '.git'))) {
          return currentPath;
        }
        currentPath = path.dirname(currentPath);
      }

      // Fallback to current working directory
      return process.cwd();
    } catch {
      return process.cwd();
    }
  }

  /**
   * Get the memory directory path
   */
  private getMemoryDirectory(): string {
    const projectName = this.projectContext?.name ?? 'unknown-project';
    const homeDir = os.homedir();
    return path.join(homeDir, '.advanced-memory-bank', projectName);
  }

  /**
   * Ensure memory directory exists
   */
  private ensureMemoryDirectory(): void {
    try {
      if (!existsSync(this.memoryDir)) {
        mkdirSync(this.memoryDir, { recursive: true });
      }
    } catch (error) {
      process.stderr.write(`[MemoryManager] Error creating memory directory: ${error}\n`);
      throw new Error(`Failed to create memory directory: ${this.memoryDir}`);
    }
  }

  /**
   * Get current project context
   */
  getProjectContext(): ProjectContext | null {
    return this.projectContext;
  }

  /**
   * Retrieve memories by tags
   */
  async getMemoriesByTags(tags: string[]): Promise<Memory[]> {
    const allMemories = await this.loadAllMemories();
    
    return allMemories.filter(memory => 
      tags.some(tag => memory.tags.includes(tag))
    ).sort((a, b) => b.importance - a.importance || b.timestamp - a.timestamp);
  }

  /**
   * Get recent memories
   */
  async getRecentMemories(limit: number = 10): Promise<Memory[]> {
    const allMemories = await this.loadAllMemories();
    
    allMemories.sort((a, b) => b.timestamp - a.timestamp);
    return allMemories.slice(0, limit);
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<boolean> {
    try {
      // Remove from cache
      this.cache.delete(id);

      // Remove from disk
      const filePath = path.join(this.memoryDir, `${id}.json`);
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
      }

      return true;
    } catch (error) {
      process.stderr.write(`[MemoryManager] Error deleting memory: ${error}\n`);
      return false;
    }
  }

  /**
   * Generate unique memory ID
   */
  private generateMemoryId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2);
    return `mem-${timestamp}-${random}`;
  }

  /**
   * Persist memory to disk
   */
  private async persistMemory(memory: Memory): Promise<void> {
    try {
      const filePath = path.join(this.memoryDir, `${memory.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(memory, null, 2), 'utf-8');
    } catch (error) {
      process.stderr.write(`[MemoryManager] Error persisting memory: ${error}\n`);
      throw new Error(`Failed to persist memory: ${memory.id}`);
    }
  }

  /**
   * Load all memories from disk
   */
  private async loadAllMemories(): Promise<Memory[]> {
    try {
      if (!existsSync(this.memoryDir)) {
        return [];
      }

      const files = await fs.readdir(this.memoryDir);
      const memories: Memory[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(this.memoryDir, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const memory = JSON.parse(content) as Memory;
            memories.push(memory);
          } catch (error) {
            process.stderr.write(`[MemoryManager] Error loading memory file ${file}: ${error}\n`);
          }
        }
      }

      return memories;
    } catch (error) {
      process.stderr.write(`[MemoryManager] Error loading memories: ${error}\n`);
      return [];
    }
  }

  /**
   * Get memory statistics
   */
  async getStatistics(): Promise<{
    totalMemories: number;
    projectName: string;
    memoryPath: string;
    oldestMemory: number | undefined;
    newestMemory: number | undefined;
  }> {
    const memories = await this.loadAllMemories();
    
    return {
      totalMemories: memories.length,
      projectName: this.projectContext?.name ?? 'unknown',
      memoryPath: this.memoryDir,
      oldestMemory: memories.length > 0 ? Math.min(...memories.map(m => m.timestamp)) : undefined,
      newestMemory: memories.length > 0 ? Math.max(...memories.map(m => m.timestamp)) : undefined,
    };
  }

  /**
   * Clean up old memories
   */
  async cleanupOldMemories(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    const memories = await this.loadAllMemories();
    const cutoffTime = Date.now() - maxAge;
    let deletedCount = 0;

    for (const memory of memories) {
      if (memory.timestamp < cutoffTime && memory.importance < 5) {
        const deleted = await this.deleteMemory(memory.id);
        if (deleted) {
          deletedCount++;
        }
      }
    }

    return deletedCount;
  }

  /**
   * Store memory with simplified interface
   */
  async storeMemory(content: string, tags: string[] = [], importance: number = 5): Promise<Memory> {
    const id = this.generateMemoryId();
    const memory: Memory = {
      id,
      content,
      tags,
      importance: Math.max(1, Math.min(10, importance)),
      timestamp: Date.now(),
      projectContext: this.projectContext?.name ?? 'unknown',
    };

    // Store in cache
    this.cache.set(id, memory);

    // Persist to disk
    await this.persistMemory(memory);

    return memory;
  }

  /**
   * Get a specific memory by ID
   */
  async getMemory(id: string): Promise<Memory | null> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached) {
      return cached;
    }

    // Load from disk
    try {
      const filePath = path.join(this.memoryDir, `${id}.json`);
      if (existsSync(filePath)) {
        const data = await fs.readFile(filePath, 'utf-8');
        const memory = JSON.parse(data) as Memory;
        this.cache.set(id, memory);
        return memory;
      }
    } catch (error) {
      process.stderr.write(`[MemoryManager] Error loading memory: ${error}\n`);
    }

    return null;
  }

  /**
   * Search memories with advanced options
   */
  async searchMemories(query: string, tags?: string[], limit: number = 10): Promise<Memory[]> {
    const allMemories = await this.loadAllMemories();
    const lowerQuery = query.toLowerCase();

    let filtered = allMemories.filter(memory => {
      const contentMatch = memory.content.toLowerCase().includes(lowerQuery);
      const tagMatch = memory.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
      const tagFilter = !tags || tags.length === 0 || tags.some(tag => memory.tags.includes(tag));
      
      return (contentMatch || tagMatch) && tagFilter;
    });

    filtered.sort((a, b) => b.importance - a.importance || b.timestamp - a.timestamp);
    return filtered.slice(0, limit);
  }

  /**
   * List memories with filtering options
   */
  async listMemories(tags?: string[], limit: number = 20, sortBy: string = 'timestamp'): Promise<Memory[]> {
    const allMemories = await this.loadAllMemories();

    let filtered = allMemories;
    if (tags && tags.length > 0) {
      filtered = allMemories.filter(memory => 
        tags.some(tag => memory.tags.includes(tag))
      );
    }

    // Sort memories
    filtered.sort((a, b) => {
      if (sortBy === 'importance') {
        return b.importance - a.importance || b.timestamp - a.timestamp;
      } else {
        return b.timestamp - a.timestamp;
      }
    });

    return filtered.slice(0, limit);
  }

  /**
   * Update an existing memory
   */
  async updateMemory(id: string, content?: string, tags?: string[], importance?: number): Promise<boolean> {
    const memory = await this.getMemory(id);
    if (!memory) {
      return false;
    }

    // Update fields
    if (content !== undefined) memory.content = content;
    if (tags !== undefined) memory.tags = tags;
    if (importance !== undefined) memory.importance = Math.max(1, Math.min(10, importance));

    // Update cache
    this.cache.set(id, memory);

    // Persist to disk
    await this.persistMemory(memory);

    return true;
  }

  /**
   * Get project information
   */
  async getProjectInfo(): Promise<{
    projectName: string;
    projectPath: string;
    totalMemories: number;
    memoryDirectory: string;
    version: string;
  }> {
    const memories = await this.loadAllMemories();
    
    return {
      projectName: this.projectContext?.name ?? 'unknown',
      projectPath: this.projectContext?.path ?? process.cwd(),
      totalMemories: memories.length,
      memoryDirectory: this.memoryDir,
      version: this.version,
    };
  }
  /**
   * Check if a directory has project indicators (package.json, .git, etc.)
   */
  private hasProjectIndicators(dirPath: string): boolean {
    try {
      const indicators = [
        path.join(dirPath, 'package.json'),
        path.join(dirPath, '.git'),
        path.join(dirPath, 'tsconfig.json'),
        path.join(dirPath, 'pyproject.toml'),
        path.join(dirPath, 'Cargo.toml'),
        path.join(dirPath, '.vscode'),
        path.join(dirPath, 'src'),
        path.join(dirPath, 'README.md'),
        path.join(dirPath, 'yarn.lock'),
        path.join(dirPath, 'pnpm-lock.yaml'),
        path.join(dirPath, 'composer.json'),
        path.join(dirPath, 'go.mod'),
        path.join(dirPath, 'requirements.txt')
      ];
      
      return indicators.some(indicator => existsSync(indicator));
    } catch {
      return false;
    }
  }

  /**
   * Check if a path is a system or VS Code path that should be blocked
   */
  private isSystemOrVSCodePath(dirPath: string): boolean {
    const lowerPath = dirPath.toLowerCase();
    const blockedPaths = [
      'appdata', 'microsoft', 'vs-code', 'vscode', 'visual-studio',
      'electron', 'extension', 'extensions', 'crash', 'crashes',
      'logs', 'log', 'cache', 'caches', 'temp', 'tmp',
      'program files', 'windows', 'system32', 'users\\andre',
      'users\\user', 'users\\admin'
    ];
    
    return blockedPaths.some(blocked => lowerPath.includes(blocked));
  }

  /**
   * Enhanced VS Code workspace detection with multiple strategies
   */
  private detectVSCodeWorkspaceEnhanced(): { name: string | null; source: string } {
    try {      // Strategy 1: Check process.argv for potential folder paths passed by VS Code
      const argv = process.argv;
      for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg && (arg.includes('\\') || arg.includes('/'))) {
          // Check if this looks like a folder path
          const potentialPath = path.resolve(arg);
          if (existsSync(potentialPath) && this.isDirectory(potentialPath)) {
            const baseName = path.basename(potentialPath);
            if (this.isValidProjectName(baseName) && 
                this.hasProjectIndicators(potentialPath) &&
                !this.isSystemOrVSCodePath(potentialPath)) {
              return { name: baseName, source: `process.argv[${i}]: ${potentialPath}` };
            }
          }
        }
      }

      // Strategy 2: Try to find recently opened folders in VS Code
      // Check common VS Code storage locations for workspace info
      const userHome = os.homedir();
      const vsCodeDirs = [
        path.join(userHome, 'AppData', 'Roaming', 'Code', 'User', 'workspaceStorage'),
        path.join(userHome, '.vscode', 'extensions'),
        path.join(userHome, 'Library', 'Application Support', 'Code', 'User', 'workspaceStorage'), // macOS
      ];

      // Strategy 3: Check parent processes environment
      // Sometimes VS Code passes workspace info through parent processes
      const parentPid = process.ppid;
      if (parentPid && process.env.TERM_PROGRAM === 'vscode') {
        // If we're in VS Code context, try to infer from process tree
        // This is a fallback strategy
      }

      // Strategy 4: Look for common project indicators in nearby directories
      const currentDir = process.cwd();
      const parentDir = path.dirname(currentDir);
      
      // Check if current directory has project indicators but failed validation
      if (this.hasProjectIndicators(currentDir) && !this.isSystemOrVSCodePath(currentDir)) {
        const baseName = path.basename(currentDir);
        if (this.isValidProjectName(baseName)) {
          return { name: baseName, source: 'enhanced-current-directory-validation' };
        }
      }

      // Check parent directory for project indicators
      if (this.hasProjectIndicators(parentDir) && !this.isSystemOrVSCodePath(parentDir)) {
        const baseName = path.basename(parentDir);
        if (this.isValidProjectName(baseName)) {
          return { name: baseName, source: 'enhanced-parent-directory-validation' };
        }
      }

      return { name: null, source: 'enhanced-detection-failed' };
    } catch (error) {
      return { name: null, source: `enhanced-detection-error: ${error}` };
    }
  }
  /**
   * Check if a path is a directory
   */
  private isDirectory(dirPath: string): boolean {
    try {
      return existsSync(dirPath) && statSync(dirPath).isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Try to detect VS Code workspace through process parent and recent files
   */
  private detectVSCodeWorkspaceFromParent(): { name: string | null; source: string } {
    try {
      // Strategy 1: Check if we can find VS Code workspace info through file system
      const userHome = os.homedir();
      
      // Try to read VS Code recent workspaces/folders
      const vscodePaths = [
        path.join(userHome, 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'storage.json'),
        path.join(userHome, 'AppData', 'Roaming', 'Code', 'User', 'settings.json'),
        path.join(userHome, '.vscode', 'extensions'),
      ];

      // Strategy 2: Use VSCODE_CWD if it points to a valid project directory
      const vscodeCwd = process.env.VSCODE_CWD;
      if (vscodeCwd && vscodeCwd.includes('Microsoft VS Code')) {
        // This is VS Code installation path, not useful
        // But we know we're in VS Code context
      }

      // Strategy 3: Check for recently accessed folders pattern
      // VS Code often has patterns in process arguments or environment
      const processArgs = process.argv.join(' ');
      
      // Look for folder patterns in the execution context
      if (processArgs.includes('npx') && process.env.VSCODE_CWD) {
        // We're running via npx from VS Code
        // Try to find the actual workspace through other means
        
        // Check if there are any path-like arguments
        const pathArgs = process.argv.filter(arg => 
          arg && (arg.includes('\\') || arg.includes('/')) && 
          !arg.includes('node_modules') && 
          !arg.includes('npm-cache') &&
          !arg.includes('Microsoft VS Code')
        );
        
        for (const pathArg of pathArgs) {
          try {
            const resolvedPath = path.resolve(pathArg);
            if (this.isDirectory(resolvedPath) && 
                this.hasProjectIndicators(resolvedPath) &&
                !this.isSystemOrVSCodePath(resolvedPath)) {
              const baseName = path.basename(resolvedPath);
              if (this.isValidProjectName(baseName)) {
                return { name: baseName, source: `npx-context-path: ${resolvedPath}` };
              }
            }
          } catch {
            // Ignore path resolution errors
          }
        }
      }

      return { name: null, source: 'parent-detection-failed' };
    } catch (error) {
      return { name: null, source: `parent-detection-error: ${error}` };
    }
  }

  /**
   * Try to detect VS Code workspace from VS Code settings and recent workspaces
   */
  private detectVSCodeWorkspaceFromSettings(): { name: string | null; source: string } {
    try {
      const userHome = os.homedir();
      const vsCodeSettingsPath = path.join(userHome, 'AppData', 'Roaming', 'Code', 'User');
      
      // Try to read recently opened workspaces
      const recentlyOpenedPath = path.join(vsCodeSettingsPath, 'globalStorage', 'storage.json');
      if (existsSync(recentlyOpenedPath)) {
        try {
          const storageContent = JSON.parse(require('fs').readFileSync(recentlyOpenedPath, 'utf8'));
          
          // Look for recently opened folders
          const openedPathsList = storageContent?.['history.recentlyOpenedPathsList'];
          if (openedPathsList && openedPathsList.entries && Array.isArray(openedPathsList.entries)) {
            // Get the most recent folder (not workspace file)
            for (const entry of openedPathsList.entries) {
              if (entry.folderUri && entry.folderUri.path) {
                const folderPath = entry.folderUri.path;
                // Convert URI path to local path
                const localPath = folderPath.replace(/^\/([a-zA-Z]):/, '$1:');
                
                if (existsSync(localPath) && this.hasProjectIndicators(localPath)) {
                  const projectName = path.basename(localPath);
                  if (this.isValidProjectName(projectName) && !this.isSystemOrVSCodePath(localPath)) {
                    return { 
                      name: projectName, 
                      source: `VS Code recent workspace: ${localPath}` 
                    };
                  }
                }
              }
            }
          }
        } catch (error) {
          // Silent fail - continue with other methods
        }
      }

      // Try to read workspace settings for current session
      const workspaceStoragePath = path.join(vsCodeSettingsPath, 'workspaceStorage');
      if (existsSync(workspaceStoragePath)) {
        try {
          const workspaceDirs = require('fs').readdirSync(workspaceStoragePath);
          
          // Look for recent workspace directories
          for (const workspaceDir of workspaceDirs) {
            const workspaceConfigPath = path.join(workspaceStoragePath, workspaceDir, 'workspace.json');
            if (existsSync(workspaceConfigPath)) {
              try {
                const workspaceConfig = JSON.parse(require('fs').readFileSync(workspaceConfigPath, 'utf8'));
                if (workspaceConfig.folder) {
                  const folderPath = workspaceConfig.folder;
                  if (existsSync(folderPath) && this.hasProjectIndicators(folderPath)) {
                    const projectName = path.basename(folderPath);
                    if (this.isValidProjectName(projectName) && !this.isSystemOrVSCodePath(folderPath)) {
                      return { 
                        name: projectName, 
                        source: `VS Code workspace storage: ${folderPath}` 
                      };
                    }
                  }
                }
              } catch (error) {
                // Continue to next workspace
                continue;
              }
            }
          }
        } catch (error) {
          // Silent fail
        }
      }

      return { name: null, source: 'vs-code-settings-not-found' };
    } catch (error) {
      return { name: null, source: `vs-code-settings-error: ${error}` };
    }
  }

  /**
   * Enhanced detection using VS Code configuration files
   */
  private detectFromVSCodeConfig(): { name: string | null; source: string } {
    try {
      // For synchronous operation, we'll check common patterns
      const userHome = os.homedir();
      
      // Check if we're in npx context from VS Code
      const isNpxFromVSCode = process.argv.some(arg => arg.includes('npm-cache')) && 
                             process.env.VSCODE_CWD;
      
      if (isNpxFromVSCode) {
        // When VS Code runs MCP via npx, we need to be creative
        // Check if there's a pattern in the file system that indicates recent activity
        
        // Strategy: Look for .vscode folders in common project locations
        const commonProjectPaths = [
          path.join(userHome, 'Documents'),
          path.join(userHome, 'Desktop'),
          path.join(userHome, 'Projects'), 
          'C:\\Projects',
          'D:\\Projects',
          'Z:\\',
        ];
        
        for (const basePath of commonProjectPaths) {
          if (existsSync(basePath)) {
            try {
              const entries = require('fs').readdirSync(basePath, { withFileTypes: true });
              for (const entry of entries) {
                if (entry.isDirectory()) {
                  const projectPath = path.join(basePath, entry.name);
                  if (this.hasProjectIndicators(projectPath) && 
                      this.isValidProjectName(entry.name) &&
                      !this.isSystemOrVSCodePath(projectPath)) {
                    
                    // Check if this folder was recently accessed
                    const vscodeFolder = path.join(projectPath, '.vscode');
                    if (existsSync(vscodeFolder)) {
                      return { 
                        name: entry.name, 
                        source: `vscode-config-search: ${projectPath}` 
                      };
                    }
                  }
                }
              }
            } catch {
              // Ignore directory read errors
            }
          }
        }
      }
      
      return { name: null, source: 'vscode-config-not-found' };
    } catch (error) {
      return { name: null, source: `vscode-config-error: ${error}` };
    }
  }
  /**
   * Check for user-specified project configuration with VS Code variable resolution
   */
  private detectUserSpecifiedProject(): { name: string | null; source: string } {
    try {
      // Method 1: Environment variable override with variable resolution
      let envProject = process.env.MCP_PROJECT_NAME;
      if (envProject) {
        // Resolve VS Code-style variables
        envProject = this.resolveVSCodeVariablesInString(envProject);
        if (this.isValidProjectName(envProject)) {
          return { name: envProject, source: 'MCP_PROJECT_NAME environment variable (with variable resolution)' };
        }
      }

      // Method 1b: Project path override with variable resolution
      let envPath = process.env.MCP_PROJECT_PATH;
      if (envPath) {
        // Resolve VS Code-style variables
        envPath = this.resolveVSCodeVariablesInString(envPath);
        if (existsSync(envPath) && !this.isSystemOrVSCodePath(envPath)) {
          const pathBasename = path.basename(envPath);
          if (this.isValidProjectName(pathBasename)) {
            return { name: pathBasename, source: 'MCP_PROJECT_PATH environment variable (with variable resolution)' };
          }
        }
      }      // Method 2: Command line argument
      const argIndex = process.argv.findIndex(arg => arg === '--project' || arg === '-p');
      if (argIndex !== -1 && argIndex + 1 < process.argv.length) {
        let projectName = process.argv[argIndex + 1];
        if (projectName) {
          // Resolve variables in command line arguments too
          projectName = this.resolveVSCodeVariablesInString(projectName);
          if (this.isValidProjectName(projectName)) {
            return { name: projectName, source: `command line argument: ${projectName}` };
          }
        }
      }

      // Method 3: Check for .mcp-project file in current directory or parents
      let currentDir = process.cwd();
      for (let i = 0; i < 5; i++) { // Check up to 5 levels up
        const mcpProjectFile = path.join(currentDir, '.mcp-project');
        if (existsSync(mcpProjectFile)) {
          try {
            let projectName = require('fs').readFileSync(mcpProjectFile, 'utf-8').trim();
            // Resolve variables in .mcp-project file content
            projectName = this.resolveVSCodeVariablesInString(projectName);
            if (projectName && this.isValidProjectName(projectName)) {
              return { name: projectName, source: `mcp-project file: ${mcpProjectFile} (with variable resolution)` };
            }
          } catch {
            // Ignore file read errors
          }
        }
        
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) break; // Reached root
        currentDir = parentDir;
      }

      return { name: null, source: 'no-user-config-found' };
    } catch (error) {
      return { name: null, source: `user-config-error: ${error}` };
    }
  }
  /**
   * Allow manual project configuration via environment variable
   */
  private detectManualProjectConfiguration(): { name: string | null; source: string } {
    try {      // Check for manual project name configuration
      let manualProjectName = process.env.MCP_PROJECT_NAME;
      if (manualProjectName) {
        // Resolve VS Code variables
        manualProjectName = this.resolveVSCodeVariablesInString(manualProjectName);
        if (manualProjectName && this.isValidProjectName(manualProjectName)) {
          return { 
            name: manualProjectName, 
            source: `MCP_PROJECT_NAME environment variable: ${manualProjectName}` 
          };
        }
      }      // Check for manual project path configuration
      let manualProjectPath = process.env.MCP_PROJECT_PATH;
      if (manualProjectPath) {
        // Resolve VS Code variables
        manualProjectPath = this.resolveVSCodeVariablesInString(manualProjectPath);
        if (manualProjectPath && existsSync(manualProjectPath)) {
          const projectName = path.basename(manualProjectPath);
          if (this.isValidProjectName(projectName) && 
              this.hasProjectIndicators(manualProjectPath) &&
              !this.isSystemOrVSCodePath(manualProjectPath)) {
            return { 
              name: projectName, 
              source: `MCP_PROJECT_PATH environment variable: ${manualProjectPath}` 
            };
          }
        }
      }

      return { name: null, source: 'no-manual-configuration' };
    } catch (error) {
      return { name: null, source: `manual-config-error: ${error}` };
    }
  }

  /**
   * Try to detect workspace by executing commands that can reveal VS Code workspace
   */
  private detectWorkspaceViaCommands(): { name: string | null; source: string } {
    try {
      // Strategy 1: Try to find VS Code process and get its working directory
      const isWindows = os.platform() === 'win32';
      
      if (isWindows) {
        try {
          // Try to get VS Code process information
          const { execSync } = require('child_process');
          
          // Get VS Code processes and their command lines
          const cmd = 'wmic process where "name=\'Code.exe\'" get commandline,processid /format:csv';
          const output = execSync(cmd, { encoding: 'utf8', timeout: 5000 });
          
          const lines = output.split('\n').filter((line: string) => line.trim() && !line.startsWith('Node'));
          
          for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 2) {
              const commandLine = parts[1];
              
              // Look for folder paths in VS Code command line
              const folderMatch = commandLine.match(/(?:"([^"]+)"|([^\s]+))\s*$/);
              if (folderMatch) {
                const folderPath = folderMatch[1] || folderMatch[2];
                
                if (folderPath && existsSync(folderPath) && this.isDirectory(folderPath)) {
                  const baseName = path.basename(folderPath);
                  if (this.isValidProjectName(baseName) && 
                      this.hasProjectIndicators(folderPath) &&
                      !this.isSystemOrVSCodePath(folderPath)) {
                    return { 
                      name: baseName, 
                      source: `VS Code process command line: ${folderPath}` 
                    };
                  }
                }
              }
            }
          }
        } catch (error) {
          // Continue to next strategy
        }
      }

      // Strategy 2: Try to read recent VS Code workspace from registry (Windows)
      if (isWindows) {
        try {
          const { execSync } = require('child_process');
          const regCmd = 'reg query "HKCU\\Software\\Microsoft\\VSCode" /s /f "workspaceStorage" 2>nul';
          const regOutput = execSync(regCmd, { encoding: 'utf8', timeout: 3000 });
          
          // Parse registry output for workspace paths
          const pathMatches = regOutput.match(/[A-Z]:\\[^\\r\\n]+/g);
          if (pathMatches) {
            for (const pathMatch of pathMatches) {
              if (existsSync(pathMatch) && this.hasProjectIndicators(pathMatch)) {
                const baseName = path.basename(pathMatch);
                if (this.isValidProjectName(baseName) && !this.isSystemOrVSCodePath(pathMatch)) {
                  return { 
                    name: baseName, 
                    source: `Windows registry workspace: ${pathMatch}` 
                  };
                }
              }
            }
          }
        } catch (error) {
          // Continue to next strategy
        }
      }

      // Strategy 3: Try to find workspace from VS Code recent files
      const userHome = os.homedir();
      const recentFilePath = path.join(userHome, 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'ms-vscode.vscode-workspace', 'workspaces.json');
      
      if (existsSync(recentFilePath)) {
        try {
          const workspacesContent = JSON.parse(require('fs').readFileSync(recentFilePath, 'utf8'));
          
          if (workspacesContent && workspacesContent.length > 0) {
            // Get the most recent workspace
            const recentWorkspace = workspacesContent[0];
            if (recentWorkspace && recentWorkspace.folder) {
              const workspacePath = recentWorkspace.folder;
              if (existsSync(workspacePath) && this.hasProjectIndicators(workspacePath)) {
                const baseName = path.basename(workspacePath);
                if (this.isValidProjectName(baseName) && !this.isSystemOrVSCodePath(workspacePath)) {
                  return { 
                    name: baseName, 
                    source: `VS Code recent workspaces: ${workspacePath}` 
                  };
                }
              }
            }
          }
        } catch (error) {
          // Continue
        }
      }

      return { name: null, source: 'command-detection-failed' };
    } catch (error) {
      return { name: null, source: `command-detection-error: ${error}` };
    }
  }
  /**
   * Create a simple project configuration helper
   */
  private createProjectConfigHelper(): void {
    const currentDir = process.cwd();
    const isUserDir = currentDir === os.homedir() || this.isSystemOrVSCodePath(currentDir);
    
    if (isUserDir) {
      // Only show helper when in user directory (VS Code MCP context)
      process.stderr.write('\n🔧 CONFIGURAÇÃO RÁPIDA DE PROJETO:\n');
      process.stderr.write('   Para definir o nome do seu projeto, escolha uma opção:\n\n');
      process.stderr.write('   📝 Opção 1 - Variável de ambiente:\n');
      process.stderr.write('      Adicione ao MCP config: "env": {"MCP_PROJECT_NAME": "meu-projeto"}\n\n');
      process.stderr.write('   📁 Opção 2 - Arquivo .mcp-project:\n');
      process.stderr.write('      Crie um arquivo .mcp-project na raiz do projeto com o nome\n\n');
      
      // Generate ready-to-use configuration
      this.generateMCPConfig('seu-projeto-aqui');
    }
  }
  /**
   * Generate ready-to-use MCP configuration for the user
   */
  private generateMCPConfig(projectName: string): void {
    const configJson = {
      "mcp": {
        "servers": {
          "advanced-json-memory-bank": {
            "command": "npx",
            "args": ["@andrebuzeli/advanced-json-memory-bank"],
            "env": {
              "MCP_PROJECT_NAME": "${workspaceFolderBasename}"
            }
          }
        }
      }
    };

    process.stderr.write('\n📋 CONFIGURAÇÃO AUTOMÁTICA PRONTA:\n');
    process.stderr.write('   Esta configuração detecta automaticamente o nome da pasta:\n\n');
    process.stderr.write(JSON.stringify(configJson, null, 2) + '\n\n');
    process.stderr.write('   🎯 Use ${workspaceFolderBasename} para pegar o nome da pasta automaticamente!\n');
    process.stderr.write('   ✅ Funciona com qualquer projeto - não precisa configurar manualmente!\n\n');
  }

  /**
   * Simple and direct approach: try to find the most likely project folder
   */
  private detectProjectFromCommonPatterns(): { name: string | null; source: string } {
    try {
      // Strategy 1: Check if we're in a subdirectory of a project
      let currentPath = process.cwd();
      
      // Go up directories looking for project indicators
      for (let i = 0; i < 3; i++) {
        if (this.hasProjectIndicators(currentPath)) {
          const baseName = path.basename(currentPath);
          if (this.isValidProjectName(baseName) && !this.isSystemOrVSCodePath(currentPath)) {
            return { 
              name: baseName, 
              source: `project indicators found: ${currentPath}` 
            };
          }
        }
        const parentPath = path.dirname(currentPath);
        if (parentPath === currentPath) break; // reached root
        currentPath = parentPath;
      }

      // Strategy 2: Check VS Code common workspace locations
      const userHome = os.homedir();
      const commonDirs = [
        path.join(userHome, 'Documents', 'GitHub'),
        path.join(userHome, 'Documents', 'Projects'),
        path.join(userHome, 'GitHub'),
        path.join(userHome, 'Projects'),
        path.join(userHome, 'Dev'),
        path.join(userHome, 'Development'),
        'C:\\Projects',
        'C:\\Dev',
        'C:\\GitHub',
        'D:\\Projects',
        'D:\\Dev'
      ];

      for (const commonDir of commonDirs) {
        if (existsSync(commonDir)) {
          try {
            const projects = require('fs').readdirSync(commonDir);
            // Get the most recently modified project folder
            let mostRecent = null;
            let mostRecentTime = 0;

            for (const project of projects) {
              const projectPath = path.join(commonDir, project);
              if (this.isDirectory(projectPath) && this.hasProjectIndicators(projectPath)) {
                const stats = require('fs').statSync(projectPath);
                if (stats.mtime.getTime() > mostRecentTime) {
                  mostRecentTime = stats.mtime.getTime();
                  mostRecent = { name: project, path: projectPath };
                }
              }
            }

            if (mostRecent && this.isValidProjectName(mostRecent.name)) {
              return { 
                name: mostRecent.name, 
                source: `recent project in ${commonDir}: ${mostRecent.path}` 
              };
            }
          } catch (error) {
            // Continue to next directory
            continue;
          }
        }
      }

      return { name: null, source: 'no-common-patterns-found' };
    } catch (error) {
      return { name: null, source: `pattern-detection-error: ${error}` };
    }
  }

  /**
   * Resolve VS Code variables from command line arguments or environment
   * This handles cases where VS Code passes variables like ${workspaceFolderBasename}
   */  private resolveVSCodeVariables(): { name: string | null; source: string } {
    try {
      // Strategy 1: Check if any command line argument contains VS Code variables
      for (let i = 0; i < process.argv.length; i++) {
        const arg = process.argv[i];
        
        if (!arg) continue; // Skip undefined arguments
        
        // Look for ${workspaceFolderBasename} variable
        if (arg.includes('${workspaceFolderBasename}')) {
          // Try to resolve the variable by checking the actual workspace folder
          const resolvedName = this.resolveWorkspaceFolderBasename();
          if (resolvedName) {
            return { 
              name: resolvedName, 
              source: `Resolved ${arg} -> ${resolvedName}` 
            };
          }
        }
        
        // Look for ${workspaceFolder} variable
        if (arg.includes('${workspaceFolder}')) {
          const resolvedPath = this.resolveWorkspaceFolder();
          if (resolvedPath) {
            const baseName = path.basename(resolvedPath);
            if (this.isValidProjectName(baseName)) {
              return { 
                name: baseName, 
                source: `Resolved ${arg} -> ${resolvedPath}` 
              };
            }
          }
        }
        
        // Look for direct project name patterns in args
        if (arg.startsWith('--project=') || arg.startsWith('-p=')) {
          const projectName = arg.split('=')[1];
          if (projectName && this.isValidProjectName(projectName)) {
            return { 
              name: projectName, 
              source: `Command line argument: ${arg}` 
            };
          }
        }
      }
      
      // Strategy 2: Check environment variables that might contain resolved values
      const envVars = [
        'MCP_PROJECT_NAME',
        'VSCODE_WORKSPACE_NAME', 
        'WORKSPACE_FOLDER_BASENAME',
        'PROJECT_NAME'
      ];
      
      for (const envVar of envVars) {
        const value = process.env[envVar];
        if (value && this.isValidProjectName(value)) {
          return { 
            name: value, 
            source: `Environment variable: ${envVar}=${value}` 
          };
        }
      }
      
      return { name: null, source: 'no-variables-found' };
    } catch (error) {
      return { name: null, source: `variable-resolution-error: ${error}` };
    }
  }

  /**
   * Resolve ${workspaceFolderBasename} variable
   */
  private resolveWorkspaceFolderBasename(): string | null {
    const workspaceFolder = this.resolveWorkspaceFolder();
    if (workspaceFolder) {
      const baseName = path.basename(workspaceFolder);
      if (this.isValidProjectName(baseName)) {
        return baseName;
      }
    }
    return null;
  }

  /**
   * Resolve ${workspaceFolder} variable
   */
  private resolveWorkspaceFolder(): string | null {
    // Try multiple sources to find the actual workspace folder
    
    // 1. Environment variables
    const envSources = [
      process.env.VSCODE_WORKSPACE_FOLDER,
      process.env.VSCODE_CWD,
      process.env.WORKSPACE_FOLDER
    ];
    
    for (const source of envSources) {
      if (source && existsSync(source) && this.hasProjectIndicators(source)) {
        return source;
      }
    }
    
    // 2. Current working directory if it has project indicators
    const cwd = process.cwd();
    if (this.hasProjectIndicators(cwd) && !this.isSystemOrVSCodePath(cwd)) {
      return cwd;
    }
    
    // 3. Try to find git root from current directory
    let currentPath = cwd;
    while (currentPath !== path.dirname(currentPath)) {
      if (existsSync(path.join(currentPath, '.git'))) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }
    
    return null;
  }

  /**
   * Detect active VS Code workspace using multiple advanced strategies
   * This is the ultimate method for VS Code MCP context detection
   */
  private detectActiveVSCodeWorkspace(): { name: string | null; source: string } {
    try {
      // Strategy 1: Use VS Code workspace storage (most reliable for active workspace)
      const userHome = os.homedir();
      const workspaceStoragePath = path.join(userHome, 'AppData', 'Roaming', 'Code', 'User', 'workspaceStorage');
      
      if (existsSync(workspaceStoragePath)) {
        try {
          const workspaceDirs = require('fs').readdirSync(workspaceStoragePath);
          
          // Look for the most recently modified workspace
          let mostRecentWorkspace = null;
          let mostRecentTime = 0;
          
          for (const workspaceDir of workspaceDirs) {
            const workspacePath = path.join(workspaceStoragePath, workspaceDir);
            const statePath = path.join(workspacePath, 'state.vscdb');
            
            if (existsSync(statePath)) {
              const stats = statSync(statePath);
              if (stats.mtime.getTime() > mostRecentTime) {
                mostRecentTime = stats.mtime.getTime();
                mostRecentWorkspace = workspaceDir;
              }
            }
          }
          
          if (mostRecentWorkspace) {
            // Try to decode the workspace name from the hash
            const workspacePath = path.join(workspaceStoragePath, mostRecentWorkspace);
            const workspaceJsonPath = path.join(workspacePath, 'workspace.json');
            
            if (existsSync(workspaceJsonPath)) {
              const workspaceData = JSON.parse(require('fs').readFileSync(workspaceJsonPath, 'utf8'));
              if (workspaceData.folder) {
                const folderPath = workspaceData.folder;
                const projectName = path.basename(folderPath);
                if (this.isValidProjectName(projectName)) {
                  return { 
                    name: projectName, 
                    source: `Active VS Code workspace storage: ${folderPath}` 
                  };
                }
              }
            }
          }
        } catch (error) {
          // Continue to next strategy
        }
      }
      
      // Strategy 2: Check VS Code recent files and deduce active project
      const recentlyOpenedPath = path.join(
        userHome, 
        'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 
        'storage.json'
      );
      
      if (existsSync(recentlyOpenedPath)) {
        try {
          const storageData = JSON.parse(require('fs').readFileSync(recentlyOpenedPath, 'utf8'));
          const recentPaths = storageData?.['history.recentlyOpenedPathsList'];
          
          if (recentPaths && recentPaths.entries && Array.isArray(recentPaths.entries)) {
            // Get the most recent folder (not workspace file)
            for (const entry of recentPaths.entries) {
              if (entry.folderUri && entry.folderUri.path) {
                let folderPath = entry.folderUri.path;
                
                // Convert from URI format to Windows path
                if (folderPath.startsWith('/') && folderPath.includes(':')) {
                  folderPath = folderPath.substring(1).replace(/\//g, '\\');
                }
                
                if (existsSync(folderPath) && this.hasProjectIndicators(folderPath)) {
                  const projectName = path.basename(folderPath);
                  if (this.isValidProjectName(projectName) && !this.isSystemOrVSCodePath(folderPath)) {
                    return { 
                      name: projectName, 
                      source: `VS Code recent active folder: ${folderPath}` 
                    };
                  }
                }
              }
            }
          }
        } catch (error) {
          // Continue to next strategy
        }
      }
      
      // Strategy 3: Try to find VS Code window title from process (Windows)
      if (os.platform() === 'win32') {
        try {
          const { execSync } = require('child_process');
          // Get VS Code window titles which often contain the project name
          const cmd = 'powershell "Get-Process Code | Where-Object {$_.MainWindowTitle -ne \"\"} | Select-Object MainWindowTitle"';
          const output = execSync(cmd, { encoding: 'utf8', timeout: 3000 });
          
          const lines = output.split('\n');
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.includes('MainWindowTitle') && !trimmedLine.includes('---')) {
              // VS Code title format: "filename - project-name - Visual Studio Code"
              const titleMatch = trimmedLine.match(/(.+)\s+-\s+(.+)\s+-\s+Visual Studio Code/);
              if (titleMatch) {
                const projectName = titleMatch[2];
                if (this.isValidProjectName(projectName)) {
                  return { 
                    name: projectName, 
                    source: `VS Code active window title: ${trimmedLine}` 
                  };
                }
              }
            }
          }
        } catch (error) {
          // Continue
        }
      }
      
      return { name: null, source: 'active-workspace-not-detected' };
    } catch (error) {
      return { name: null, source: `active-workspace-detection-error: ${error}` };
    }
  }

  /**
   * Advanced VS Code Active Workspace Detection for User Settings.json
   * This method works specifically when VS Code variables don't work in user settings
   * Uses multiple strategies to detect the currently active workspace
   */
  private detectVSCodeActiveWorkspaceAdvanced(): { name: string | null; source: string } {
    try {
      // Strategy 1: Check VS Code's most recent workspace data
      const userHome = os.homedir();
      const storageJsonPath = path.join(userHome, 'AppData', 'Roaming', 'Code', 'User', 'globalStorage', 'storage.json');
      
      if (existsSync(storageJsonPath)) {
        try {
          const storageData = JSON.parse(require('fs').readFileSync(storageJsonPath, 'utf8'));
          
          // Check recently opened folders (most recent first)
          const recentlyOpened = storageData['history.recentlyOpenedPathsList'];
          if (recentlyOpened && recentlyOpened.entries && Array.isArray(recentlyOpened.entries)) {
            // Get the most recent folder (not workspace file)
            for (const entry of recentlyOpened.entries) {
              if (entry.folderUri && entry.folderUri.path) {
                let folderPath = entry.folderUri.path;
                
                // Convert from URI format to Windows path
                if (folderPath.startsWith('/') && folderPath.includes(':')) {
                  folderPath = folderPath.substring(1).replace(/\//g, '\\');
                }
                
                // Check if this folder exists and has project indicators
                if (existsSync(folderPath) && this.hasProjectIndicators(folderPath)) {
                  const projectName = path.basename(folderPath);
                  if (this.isValidProjectName(projectName) && !this.isSystemOrVSCodePath(folderPath)) {
                    return { 
                      name: projectName, 
                      source: `VS Code recent active folder: ${folderPath}` 
                    };
                  }
                }
              }
            }
          }
        } catch (error) {
          // Continue to next strategy
        }
      }
      
      // Strategy 2: Check VS Code workspace storage for active sessions
      const workspaceStoragePath = path.join(userHome, 'AppData', 'Roaming', 'Code', 'User', 'workspaceStorage');
      
      if (existsSync(workspaceStoragePath)) {
        try {
          const workspaceDirs = require('fs').readdirSync(workspaceStoragePath);
          
          // Find the most recently modified workspace storage
          let mostRecentWorkspace = null;
          let mostRecentTime = 0;
          
          for (const workspaceDir of workspaceDirs) {
            const workspacePath = path.join(workspaceStoragePath, workspaceDir);
            try {
              const stats = statSync(workspacePath);
              if (stats.mtime.getTime() > mostRecentTime) {
                mostRecentTime = stats.mtime.getTime();
                mostRecentWorkspace = workspaceDir;
              }
            } catch (error) {
              continue; // Skip if can't read stats
            }
          }
          
          if (mostRecentWorkspace) {
            // Try to decode workspace information from the directory name or contents
            const workspacePath = path.join(workspaceStoragePath, mostRecentWorkspace);
            
            // Look for workspace.json or meta.json files that might contain path info
            const possibleFiles = ['workspace.json', 'meta.json', 'state.vscdb'];
            for (const fileName of possibleFiles) {
              const filePath = path.join(workspacePath, fileName);
              if (existsSync(filePath)) {
                try {
                  const content = require('fs').readFileSync(filePath, 'utf8');
                  
                  // Look for folder paths in the content
                  const pathMatches = content.match(/[a-zA-Z]:[\\\/][^\s"']+/g);
                  if (pathMatches) {
                    for (const matchedPath of pathMatches) {
                      const normalizedPath = matchedPath.replace(/\//g, '\\');
                      if (existsSync(normalizedPath) && this.hasProjectIndicators(normalizedPath)) {
                        const projectName = path.basename(normalizedPath);
                        if (this.isValidProjectName(projectName) && !this.isSystemOrVSCodePath(normalizedPath)) {
                          return { 
                            name: projectName, 
                            source: `VS Code workspace storage: ${normalizedPath}` 
                          };
                        }
                      }
                    }
                  }
                } catch (error) {
                  continue; // Try next file
                }
              }
            }
          }
        } catch (error) {
          // Continue to next strategy
        }
      }
      
      // Strategy 3: Check for VS Code process and extract workspace from command line (Windows)
      if (os.platform() === 'win32') {
        try {
          const { execSync } = require('child_process');
          
          // Get VS Code processes with their command lines
          const cmd = 'wmic process where "name=\'Code.exe\'" get CommandLine /format:list';
          const output = execSync(cmd, { encoding: 'utf8', timeout: 5000 });
          
          const lines = output.split('\n');
          for (const line of lines) {
            if (line.includes('CommandLine=') && line.includes('--folder-uri')) {
              // Extract folder URI from command line
              const folderUriMatch = line.match(/--folder-uri\s+([^\s]+)/);
              if (folderUriMatch) {
                let folderPath = folderUriMatch[1];
                
                // Decode URI if needed
                if (folderPath.startsWith('file:///')) {
                  folderPath = folderPath.replace('file:///', '').replace(/\//g, '\\');
                  folderPath = decodeURIComponent(folderPath);
                }
                
                if (existsSync(folderPath) && this.hasProjectIndicators(folderPath)) {
                  const projectName = path.basename(folderPath);
                  if (this.isValidProjectName(projectName) && !this.isSystemOrVSCodePath(folderPath)) {
                    return { 
                      name: projectName, 
                      source: `VS Code active process folder: ${folderPath}` 
                    };
                  }
                }
              }
            }
          }
        } catch (error) {
          // Continue to next strategy
        }
      }
      
      // Strategy 4: Smart detection by analyzing common project directories
      const commonProjectDirs = [
        path.join(userHome, 'Documents'),
        path.join(userHome, 'Desktop'),
        path.join(userHome, 'projects'),
        path.join(userHome, 'workspace'),
        path.join(userHome, 'dev'),
        'C:\\projects',
        'C:\\workspace',
        'C:\\dev'
      ];
      
      for (const baseDir of commonProjectDirs) {
        if (existsSync(baseDir)) {
          try {
            const entries = require('fs').readdirSync(baseDir, { withFileTypes: true });
            const projectDirs = entries
              .filter(entry => entry.isDirectory())
              .map(entry => path.join(baseDir, entry.name))
              .filter(dirPath => this.hasProjectIndicators(dirPath))
              .sort((a, b) => {
                // Sort by modification time (most recent first)
                try {
                  const aStats = statSync(a);
                  const bStats = statSync(b);
                  return bStats.mtime.getTime() - aStats.mtime.getTime();
                } catch {
                  return 0;
                }
              });
            
            // Return the most recently modified project directory
            for (const projectDir of projectDirs) {
              const projectName = path.basename(projectDir);
              if (this.isValidProjectName(projectName)) {
                return { 
                  name: projectName, 
                  source: `Smart pattern detection: ${projectDir}` 
                };
              }
            }
          } catch (error) {
            continue; // Try next directory
          }
        }
      }
      
      return { name: null, source: 'advanced-workspace-detection-failed' };
    } catch (error) {
      return { name: null, source: `advanced-detection-error: ${error}` };
    }
  }

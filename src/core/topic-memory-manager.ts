/**
 * Topic Memory Manager v6.0.0 - Topic-based memory system
 * Uses MEMORY_BANK_ROOT environment variable for storage location
 */

import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import os from 'os';

export interface TopicMemory {
  content: string;
  tags: string[];
  importance: number;
  timestamp: number;
  lastModified: number;
}

export interface ProjectTopics {
  [topicName: string]: TopicMemory;
}

export interface ProjectInfo {
  name: string;
  createdAt: number;
  lastModified: number;
  topicCount: number;
  memoryCount: number;
  totalImportance: number;
}

// Tópicos fixos predefinidos
export const FIXED_TOPICS = [
  'summary',
  'libraries', 
  'change-history',
  'architecture',
  'todo',
  'bugs',
  'features',
  'documentation',
  'testing',
  'deployment'
] as const;

export class TopicMemoryManager {
  private readonly memoryRoot: string;
  private readonly version = '6.0.0';

  constructor() {
    this.memoryRoot = this.getMemoryRoot();
    this.ensureMemoryRoot();
  }

  /**
   * Obtém o diretório raiz das memórias a partir de MEMORY_BANK_ROOT ou padrão
   */
  private getMemoryRoot(): string {
    // Primeiro, tenta usar a variável de ambiente MEMORY_BANK_ROOT
    const envRoot = process.env.MEMORY_BANK_ROOT;
    if (envRoot) {
      const normalizedPath = path.resolve(envRoot);
      process.stderr.write(`[TopicMemoryManager] Using MEMORY_BANK_ROOT: ${normalizedPath}\n`);
      return normalizedPath;
    }

    // Se não definida, usa o diretório padrão na home do usuário
    const defaultRoot = path.join(os.homedir(), '.advanced-memory-bank');
    process.stderr.write(`[TopicMemoryManager] MEMORY_BANK_ROOT not set, using default: ${defaultRoot}\n`);
    return defaultRoot;
  }

  /**
   * Garante que o diretório raiz existe
   */
  private ensureMemoryRoot(): void {
    try {
      if (!existsSync(this.memoryRoot)) {
        mkdirSync(this.memoryRoot, { recursive: true });
        process.stderr.write(`[TopicMemoryManager] Created memory root directory: ${this.memoryRoot}\n`);
      }
    } catch (error) {
      process.stderr.write(`[TopicMemoryManager] Error creating memory root: ${error}\n`);
      throw new Error(`Failed to create memory root directory: ${this.memoryRoot}`);
    }
  }

  /**
   * Obtém o caminho do arquivo do projeto
   */
  private getProjectPath(projectName: string): string {
    return path.join(this.memoryRoot, `${projectName}.json`);
  }

  /**
   * Carrega os tópicos de um projeto
   */
  private async loadProject(projectName: string): Promise<ProjectTopics> {
    const projectPath = this.getProjectPath(projectName);
    
    try {
      if (existsSync(projectPath)) {
        const data = await fs.readFile(projectPath, 'utf-8');
        return JSON.parse(data);
      }
      return {};
    } catch (error) {
      process.stderr.write(`[TopicMemoryManager] Error loading project ${projectName}: ${error}\n`);
      return {};
    }
  }

  /**
   * Salva os tópicos de um projeto
   */
  private async saveProject(projectName: string, topics: ProjectTopics): Promise<void> {
    const projectPath = this.getProjectPath(projectName);
    
    try {
      await fs.writeFile(projectPath, JSON.stringify(topics, null, 2), 'utf-8');
    } catch (error) {
      process.stderr.write(`[TopicMemoryManager] Error saving project ${projectName}: ${error}\n`);
      throw new Error(`Failed to save project: ${projectName}`);
    }
  }

  /**
   * Armazena memória em um tópico
   */
  async storeTopicMemory(
    projectName: string,
    topic: string,
    content: string,
    tags: string[] = [],
    importance: number = 5
  ): Promise<void> {
    const topics = await this.loadProject(projectName);
    const now = Date.now();

    topics[topic] = {
      content,
      tags,
      importance: Math.max(1, Math.min(10, importance)),
      timestamp: topics[topic]?.timestamp || now,
      lastModified: now
    };

    await this.saveProject(projectName, topics);
  }

  /**
   * Recupera memória de um tópico
   */
  async getTopicMemory(projectName: string, topic: string): Promise<TopicMemory | null> {
    const topics = await this.loadProject(projectName);
    return topics[topic] || null;
  }

  /**
   * Lista todos os tópicos de um projeto
   */
  async listTopics(projectName: string): Promise<string[]> {
    const topics = await this.loadProject(projectName);
    return Object.keys(topics);
  }

  /**
   * Lista todas as memórias organizadas por tópicos
   */
  async listAllTopicMemories(projectName: string): Promise<ProjectTopics> {
    return await this.loadProject(projectName);
  }

  /**
   * Busca em todos os tópicos
   */
  async searchTopicMemories(
    projectName: string, 
    query: string, 
    limit: number = 100
  ): Promise<Array<{ topic: string; memory: TopicMemory; score: number }>> {
    const topics = await this.loadProject(projectName);
    const results: Array<{ topic: string; memory: TopicMemory; score: number }> = [];
    const queryLower = query.toLowerCase();

    for (const [topicName, memory] of Object.entries(topics)) {
      let score = 0;
      const contentLower = memory.content.toLowerCase();
      const tagsLower = memory.tags.map(tag => tag.toLowerCase());

      // Busca no conteúdo
      if (contentLower.includes(queryLower)) {
        score += 3;
      }

      // Busca nas tags
      if (tagsLower.some(tag => tag.includes(queryLower))) {
        score += 2;
      }

      // Busca no nome do tópico
      if (topicName.toLowerCase().includes(queryLower)) {
        score += 1;
      }

      if (score > 0) {
        results.push({ topic: topicName, memory, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score || b.memory.importance - a.memory.importance)
      .slice(0, limit);
  }

  /**
   * Atualiza memória de um tópico
   */
  async updateTopicMemory(
    projectName: string,
    topic: string,
    content?: string,
    tags?: string[],
    importance?: number
  ): Promise<void> {
    const topics = await this.loadProject(projectName);
    const existing = topics[topic];

    if (!existing) {
      throw new Error(`Topic '${topic}' not found in project '${projectName}'`);
    }

    topics[topic] = {
      content: content !== undefined ? content : existing.content,
      tags: tags !== undefined ? tags : existing.tags,
      importance: importance !== undefined ? Math.max(1, Math.min(10, importance)) : existing.importance,
      timestamp: existing.timestamp,
      lastModified: Date.now()
    };

    await this.saveProject(projectName, topics);
  }

  /**
   * Remove um tópico
   */
  async deleteTopicMemory(projectName: string, topic: string): Promise<void> {
    const topics = await this.loadProject(projectName);
    
    if (topics[topic]) {
      delete topics[topic];
      await this.saveProject(projectName, topics);
    }
  }

  /**
   * Obtém informações sobre um projeto
   */
  async getProjectInfo(projectName: string): Promise<ProjectInfo | null> {
    const projectPath = this.getProjectPath(projectName);
    
    if (!existsSync(projectPath)) {
      return null;
    }

    const topics = await this.loadProject(projectName);
    const memories = Object.values(topics);
    
    return {
      name: projectName,
      createdAt: Math.min(...memories.map(m => m.timestamp), Date.now()),
      lastModified: Math.max(...memories.map(m => m.lastModified), 0),
      topicCount: Object.keys(topics).length,
      memoryCount: memories.length,
      totalImportance: memories.reduce((sum, m) => sum + m.importance, 0)
    };
  }

  /**
   * Lista todos os projetos
   */
  async listProjects(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.memoryRoot);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      process.stderr.write(`[TopicMemoryManager] Error listing projects: ${error}\n`);
      return [];
    }
  }

  /**
   * Reseta um projeto (remove todas as memórias)
   */
  async resetProject(projectName: string): Promise<void> {
    const projectPath = this.getProjectPath(projectName);
    
    try {
      if (existsSync(projectPath)) {
        await fs.unlink(projectPath);
      }
    } catch (error) {
      process.stderr.write(`[TopicMemoryManager] Error resetting project ${projectName}: ${error}\n`);
      throw new Error(`Failed to reset project: ${projectName}`);
    }
  }

  /**
   * Inicializa tópicos fixos para um projeto
   */
  async initializeFixedTopics(projectName: string): Promise<void> {
    const topics = await this.loadProject(projectName);
    const now = Date.now();

    for (const topic of FIXED_TOPICS) {
      if (!topics[topic]) {
        topics[topic] = {
          content: `# ${topic.charAt(0).toUpperCase() + topic.slice(1)}\n\nAguardando conteúdo...`,
          tags: ['fixed-topic', topic],
          importance: 5,
          timestamp: now,
          lastModified: now
        };
      }
    }

    await this.saveProject(projectName, topics);
  }

  /**
   * Lista tópicos fixos disponíveis
   */
  getFixedTopics(): readonly string[] {
    return FIXED_TOPICS;
  }

  /**
   * Obtém o diretório raiz atual das memórias
   */
  getMemoryRootPath(): string {
    return this.memoryRoot;
  }
}

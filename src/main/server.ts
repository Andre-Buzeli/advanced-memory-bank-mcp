/**
 * Advanced Memory Bank MCP Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { MemoryManager } from '../core/memory-manager.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

/**
 * Advanced Memory Bank MCP Server class
 */
export class AdvancedMemoryBankServer {
  private server: Server;
  private memoryManager: MemoryManager;

  constructor() {
    this.server = new Server(
      {
        name: 'advanced-memory-bank-mcp',
        version: '3.2.4',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.memoryManager = new MemoryManager();
    this.setupToolHandlers();
  }

  /**
   * Setup MCP tool handlers
   */
  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_projects',
            description: 'List all projects in the enhanced memory bank',
            inputSchema: {
              type: 'object',
              properties: {},
              required: [],
            },
          },
          {
            name: 'list_project_files',
            description: 'List all files within a specific project',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  description: 'The name of the project',
                },
              },
              required: ['projectName'],
            },
          },
          {
            name: 'memory_bank_read',
            description: 'Read a memory bank file for a specific project',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  description: 'The name of the project',
                },
                fileName: {
                  type: 'string',
                  description: 'The name of the file',
                },
              },
              required: ['projectName', 'fileName'],
            },
          },
          {
            name: 'memory_bank_write',
            description: 'Create a new enhanced memory bank file for a specific project',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  description: 'The name of the project',
                },
                fileName: {
                  type: 'string',
                  description: 'The name of the file',
                },
                content: {
                  type: 'string',
                  description: 'The content of the file',
                },
              },
              required: ['projectName', 'fileName', 'content'],
            },
          },
          {
            name: 'memory_bank_update',
            description: 'Update an existing enhanced memory bank file for a specific project',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  description: 'The name of the project',
                },
                fileName: {
                  type: 'string',
                  description: 'The name of the file',
                },
                content: {
                  type: 'string',
                  description: 'The content of the file',
                },
              },
              required: ['projectName', 'fileName', 'content'],
            },
          },
          {
            name: 'semantic_search',
            description: 'Search memory bank using natural language queries and semantic understanding',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  description: 'Project name to search within',
                },
                query: {
                  type: 'string',
                  description: 'Natural language search query',
                },
                limit: {
                  type: 'integer',
                  description: 'Maximum number of results (default: 5)',
                  minimum: 1,
                  maximum: 20,
                },
                similarityThreshold: {
                  type: 'number',
                  description: 'Minimum similarity score (0-1, default: 0.7)',
                  minimum: 0,
                  maximum: 1,
                },
              },
              required: ['projectName', 'query'],
            },
          },
          {
            name: 'context_intelligence',
            description: 'AI-powered context suggestions for relevant memory bank files based on current task',
            inputSchema: {
              type: 'object',
              properties: {
                taskDescription: {
                  type: 'string',
                  description: 'Current task or question being worked on',
                },
                projectName: {
                  type: 'string',
                  description: 'Target project name',
                },
                currentContext: {
                  type: 'string',
                  description: 'Additional context about current work (optional)',
                },
                maxSuggestions: {
                  type: 'integer',
                  description: 'Maximum suggestions to return (default: 5)',
                  minimum: 1,
                  maximum: 10,
                },
              },
              required: ['taskDescription', 'projectName'],
            },
          },
          {
            name: 'memory_analyzer',
            description: 'Analyze memory bank dependencies, detect orphaned files, suggest cleanup',
            inputSchema: {
              type: 'object',
              properties: {
                projectName: {
                  type: 'string',
                  description: 'Target project name',
                },
                analysisType: {
                  type: 'string',
                  description: 'Type of analysis to perform (default: all)',
                  enum: ['dependencies', 'orphans', 'cleanup', 'all'],
                },
                includeMetrics: {
                  type: 'boolean',
                  description: 'Include detailed metrics in response (default: true)',
                },
              },
              required: ['projectName'],
            },
          },
          {
            name: 'sequential_thinking',
            description: 'A detailed tool for dynamic and reflective problem-solving through thoughts',
            inputSchema: {
              type: 'object',
              properties: {
                thought: {
                  type: 'string',
                  description: 'Your current thinking step',
                },
                nextThoughtNeeded: {
                  type: 'boolean',
                  description: 'Whether another thought step is needed',
                },
                thoughtNumber: {
                  type: 'integer',
                  description: 'Current thought number',
                  minimum: 1,
                },
                totalThoughts: {
                  type: 'integer',
                  description: 'Estimated total thoughts needed',
                  minimum: 1,
                },
                isRevision: {
                  type: 'boolean',
                  description: 'Whether this revises previous thinking',
                },
                revisesThought: {
                  type: 'integer',
                  description: 'Which thought is being reconsidered',
                  minimum: 1,
                },
                branchFromThought: {
                  type: 'integer',
                  description: 'Branching point thought number',
                  minimum: 1,
                },
                branchId: {
                  type: 'string',
                  description: 'Branch identifier',
                },
                needsMoreThoughts: {
                  type: 'boolean',
                  description: 'If more thoughts are needed',
                },
              },
              required: ['thought', 'nextThoughtNeeded', 'thoughtNumber', 'totalThoughts'],
            },
          },
          {
            name: 'workflow_navigator',
            description: 'Navigate through enhanced development workflow with visual guidance',
            inputSchema: {
              type: 'object',
              properties: {
                currentMode: {
                  type: 'string',
                  description: 'Current development mode',
                  enum: ['VAN', 'PLAN', 'CREATIVE', 'IMPLEMENT', 'QA'],
                },
                targetMode: {
                  type: 'string',
                  description: 'Target development mode',
                  enum: ['VAN', 'PLAN', 'CREATIVE', 'IMPLEMENT', 'QA'],
                },
                projectName: {
                  type: 'string',
                  description: 'Name of the project',
                },
                complexityLevel: {
                  type: 'integer',
                  description: 'Project complexity level (optional, defaults to 2)',
                  minimum: 1,
                  maximum: 4,
                },
              },
              required: ['currentMode', 'targetMode', 'projectName'],
            },
          },
          {
            name: 'creative_analyzer',
            description: 'Advanced creative analysis tool with trade-off matrices and decision trees',
            inputSchema: {
              type: 'object',
              properties: {
                component: {
                  type: 'string',
                  description: 'Component or feature being analyzed',
                },
                options: {
                  type: 'array',
                  description: 'Array of options to analyze',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Option name',
                      },
                      description: {
                        type: 'string',
                        description: 'Option description',
                      },
                      pros: {
                        type: 'array',
                        description: 'Advantages of this option',
                        items: {
                          type: 'string',
                        },
                      },
                      cons: {
                        type: 'array',
                        description: 'Disadvantages of this option',
                        items: {
                          type: 'string',
                        },
                      },
                    },
                    required: ['name', 'description'],
                  },
                },
                criteria: {
                  type: 'array',
                  description: 'Evaluation criteria for comparison',
                  items: {
                    type: 'string',
                  },
                },
                projectName: {
                  type: 'string',
                  description: 'Name of the project',
                },
              },
              required: ['component', 'options', 'criteria', 'projectName'],
            },
          },
        ] as Tool[],
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_projects':
            return { content: [{ type: 'text', text: await this.memoryManager.listProjects() }] };

          case 'list_project_files':
            return { content: [{ type: 'text', text: await this.memoryManager.listProjectFiles(args.projectName) }] };

          case 'memory_bank_read':
            return { content: [{ type: 'text', text: await this.memoryManager.readMemory(args.projectName, args.fileName) }] };

          case 'memory_bank_write':
            return { content: [{ type: 'text', text: await this.memoryManager.writeMemory(args.projectName, args.fileName, args.content) }] };

          case 'memory_bank_update':
            return { content: [{ type: 'text', text: await this.memoryManager.updateMemory(args.projectName, args.fileName, args.content) }] };

          case 'semantic_search':
            return { content: [{ type: 'text', text: await this.memoryManager.semanticSearch(args.projectName, args.query, args.limit, args.similarityThreshold) }] };

          case 'context_intelligence':
            return { content: [{ type: 'text', text: await this.memoryManager.contextIntelligence(args.taskDescription, args.projectName, args.currentContext, args.maxSuggestions) }] };

          case 'memory_analyzer':
            return { content: [{ type: 'text', text: await this.memoryManager.memoryAnalyzer(args.projectName, args.analysisType, args.includeMetrics) }] };

          case 'sequential_thinking':
            return { content: [{ type: 'text', text: await this.memoryManager.sequentialThinking(args) }] };

          case 'workflow_navigator':
            return { content: [{ type: 'text', text: await this.memoryManager.workflowNavigator(args.currentMode, args.targetMode, args.projectName, args.complexityLevel) }] };

          case 'creative_analyzer':
            return { content: [{ type: 'text', text: await this.memoryManager.creativeAnalyzer(args.component, args.options, args.criteria, args.projectName) }] };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new Error(`Tool execution failed: ${error.message}`);
      }
    });
  }

  /**
   * Connect to transport
   */
  async connect(transport: any): Promise<void> {
    await this.server.connect(transport);
  }
}
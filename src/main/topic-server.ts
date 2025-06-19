/**
 * Topic Server v6.0.0 - MCP Server with topic-based memory system
 * Uses MEMORY_BANK_ROOT environment variable for storage
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TopicMemoryManager } from '../core/topic-memory-manager.js';
import { CreativeAnalyzer } from '../core/creative-analyzer.js';
import { SequentialThinking } from '../core/sequential-thinking.js';
import { MemoryManager } from '../core/memory-manager.js';

const server = new Server(
  {
    name: 'advanced-memory-bank',
    version: '6.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Instanciar gerenciadores
const memoryManager = new MemoryManager();
const topicManager = new TopicMemoryManager();
const creativeAnalyzer = new CreativeAnalyzer(memoryManager);
const sequentialThinking = new SequentialThinking();

// Lista de ferramentas (14 no total)
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'store-topic-memory',
        description: 'Armazena informações em um tópico específico do projeto',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' },
            topic: { type: 'string', description: 'Nome do tópico (fixo ou personalizado)' },
            content: { type: 'string', description: 'Conteúdo a ser armazenado' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Tags para categorização' },
            importance: { type: 'number', minimum: 1, maximum: 10, description: 'Nível de importância 1-10' }
          },
          required: ['projectName', 'topic', 'content']
        }
      },
      {
        name: 'get-topic-memory',
        description: 'Recupera todo o conteúdo armazenado em um tópico',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' },
            topic: { type: 'string', description: 'Nome do tópico a recuperar' }
          },
          required: ['projectName', 'topic']
        }
      },
      {
        name: 'list-topics',
        description: 'Lista todos os tópicos existentes no projeto',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' }
          },
          required: ['projectName']
        }
      },
      {
        name: 'list-all-topic-memories',
        description: 'Lista todas as memórias organizadas por tópicos',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' },
            sortBy: { type: 'string', enum: ['timestamp', 'importance'], description: 'Critério de ordenação' },
            limit: { type: 'number', minimum: 1, maximum: 200, description: 'Máximo de resultados' }
          },
          required: ['projectName']
        }
      },
      {
        name: 'search-topic-memories',
        description: 'Busca conteúdo em todos os tópicos do projeto',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' },
            query: { type: 'string', description: 'Termo de busca' },
            limit: { type: 'number', minimum: 1, maximum: 100, description: 'Máximo de resultados' }
          },
          required: ['projectName', 'query']
        }
      },
      {
        name: 'update-topic-memory',
        description: 'Atualiza o conteúdo de um tópico existente',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' },
            topic: { type: 'string', description: 'Nome do tópico' },
            content: { type: 'string', description: 'Novo conteúdo' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Novas tags' },
            importance: { type: 'number', minimum: 1, maximum: 10, description: 'Nova importância' }
          },
          required: ['projectName', 'topic']
        }
      },
      {
        name: 'delete-topic-memory',
        description: 'Remove completamente um tópico e seu conteúdo',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' },
            topic: { type: 'string', description: 'Nome do tópico a remover' }
          },
          required: ['projectName', 'topic']
        }
      },
      {
        name: 'get-project-info',
        description: 'Obtém informações detalhadas sobre o projeto',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' }
          },
          required: ['projectName']
        }
      },
      {
        name: 'list-projects',
        description: 'Lista todos os projetos disponíveis no sistema',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'reset-project',
        description: 'Remove todas as memórias de um projeto',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' },
            confirmReset: { type: 'boolean', description: 'Confirmação para reset' }
          },
          required: ['projectName', 'confirmReset']
        }
      },
      {
        name: 'initialize-fixed-topics',
        description: 'Cria automaticamente todos os tópicos fixos padrão',
        inputSchema: {
          type: 'object',
          properties: {
            projectName: { type: 'string', description: 'Nome do projeto' }
          },
          required: ['projectName']
        }
      },
      {
        name: 'list-fixed-topics',
        description: 'Lista todos os tópicos fixos disponíveis no sistema',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'analyze-creative-content',
        description: 'Analisa conteúdo para extrair insights e padrões criativos',
        inputSchema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'Conteúdo a ser analisado' },
            analysisType: { 
              type: 'string', 
              enum: ['structure', 'themes', 'style', 'comprehensive'],
              description: 'Tipo de análise'
            }
          },
          required: ['content']
        }
      },
      {
        name: 'sequential-thinking',
        description: 'Processa problemas complexos através de pensamento sequencial estruturado',
        inputSchema: {
          type: 'object',
          properties: {
            thought: { type: 'string', description: 'Pensamento/análise atual' },
            thoughtNumber: { type: 'number', minimum: 1, description: 'Número do pensamento atual' },
            totalThoughts: { type: 'number', minimum: 1, description: 'Total estimado de pensamentos' },
            nextThoughtNeeded: { type: 'boolean', description: 'Se precisa de próximo pensamento' }
          },
          required: ['thought', 'thoughtNumber', 'totalThoughts', 'nextThoughtNeeded']
        }
      }
    ]
  };
});

// Handler para execução das ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'store-topic-memory':
        await topicManager.storeTopicMemory(
          args.projectName,
          args.topic,
          args.content,
          args.tags || [],
          args.importance || 5
        );
        return {
          content: [{ type: 'text', text: `Memória armazenada no tópico '${args.topic}' do projeto '${args.projectName}'` }]
        };

      case 'get-topic-memory':
        const memory = await topicManager.getTopicMemory(args.projectName, args.topic);
        if (!memory) {
          return {
            content: [{ type: 'text', text: `Tópico '${args.topic}' não encontrado no projeto '${args.projectName}'` }]
          };
        }
        return {
          content: [{ 
            type: 'text', 
            text: `**Tópico: ${args.topic}**\n\n${memory.content}\n\n**Tags:** ${memory.tags.join(', ')}\n**Importância:** ${memory.importance}/10\n**Modificado:** ${new Date(memory.lastModified).toLocaleString()}`
          }]
        };

      case 'list-topics':
        const topics = await topicManager.listTopics(args.projectName);
        return {
          content: [{ 
            type: 'text', 
            text: `**Tópicos do projeto '${args.projectName}':**\n${topics.length > 0 ? topics.map(t => `- ${t}`).join('\n') : 'Nenhum tópico encontrado'}`
          }]
        };

      case 'list-all-topic-memories':
        const allMemories = await topicManager.listAllTopicMemories(args.projectName);
        const memoryList = Object.entries(allMemories)
          .map(([topic, memory]) => `**${topic}** (${memory.importance}/10) - ${memory.content.substring(0, 100)}...`)
          .join('\n\n');
        return {
          content: [{ 
            type: 'text', 
            text: `**Todas as memórias do projeto '${args.projectName}':**\n\n${memoryList || 'Nenhuma memória encontrada'}`
          }]
        };

      case 'search-topic-memories':
        const searchResults = await topicManager.searchTopicMemories(
          args.projectName, 
          args.query, 
          args.limit || 100
        );
        const resultsText = searchResults
          .map(r => `**${r.topic}** (score: ${r.score}) - ${r.memory.content.substring(0, 150)}...`)
          .join('\n\n');
        return {
          content: [{ 
            type: 'text', 
            text: `**Resultados da busca por '${args.query}' no projeto '${args.projectName}':**\n\n${resultsText || 'Nenhum resultado encontrado'}`
          }]
        };

      case 'update-topic-memory':
        await topicManager.updateTopicMemory(
          args.projectName,
          args.topic,
          args.content,
          args.tags,
          args.importance
        );
        return {
          content: [{ type: 'text', text: `Tópico '${args.topic}' atualizado no projeto '${args.projectName}'` }]
        };

      case 'delete-topic-memory':
        await topicManager.deleteTopicMemory(args.projectName, args.topic);
        return {
          content: [{ type: 'text', text: `Tópico '${args.topic}' removido do projeto '${args.projectName}'` }]
        };

      case 'get-project-info':
        const projectInfo = await topicManager.getProjectInfo(args.projectName);
        if (!projectInfo) {
          return {
            content: [{ type: 'text', text: `Projeto '${args.projectName}' não encontrado` }]
          };
        }
        return {
          content: [{ 
            type: 'text', 
            text: `**Projeto: ${projectInfo.name}**\n\n- Tópicos: ${projectInfo.topicCount}\n- Memórias: ${projectInfo.memoryCount}\n- Importância total: ${projectInfo.totalImportance}\n- Criado: ${new Date(projectInfo.createdAt).toLocaleString()}\n- Modificado: ${new Date(projectInfo.lastModified).toLocaleString()}`
          }]
        };

      case 'list-projects':
        const projects = await topicManager.listProjects();
        return {
          content: [{ 
            type: 'text', 
            text: `**Projetos disponíveis:**\n${projects.length > 0 ? projects.map(p => `- ${p}`).join('\n') : 'Nenhum projeto encontrado'}\n\n**Diretório de memórias:** ${topicManager.getMemoryRootPath()}`
          }]
        };

      case 'reset-project':
        if (!args.confirmReset) {
          return {
            content: [{ type: 'text', text: `Reset cancelado. Para confirmar, defina confirmReset como true.` }]
          };
        }
        await topicManager.resetProject(args.projectName);
        return {
          content: [{ type: 'text', text: `Projeto '${args.projectName}' resetado com sucesso` }]
        };

      case 'initialize-fixed-topics':
        await topicManager.initializeFixedTopics(args.projectName);
        const fixedTopics = topicManager.getFixedTopics();
        return {
          content: [{ 
            type: 'text', 
            text: `Tópicos fixos inicializados no projeto '${args.projectName}':\n${fixedTopics.map(t => `- ${t}`).join('\n')}`
          }]
        };

      case 'list-fixed-topics':
        const availableTopics = topicManager.getFixedTopics();
        return {
          content: [{ 
            type: 'text', 
            text: `**Tópicos fixos disponíveis:**\n${availableTopics.map(t => `- ${t}`).join('\n')}`
          }]
        };

      case 'analyze-creative-content':
        const analysis = await creativeAnalyzer.analyzeContent(
          args.content,
          args.analysisType || 'comprehensive'
        );
        return {
          content: [{ 
            type: 'text', 
            text: `**Análise Criativa:**\n\n**Estrutura:** ${analysis.structure}\n**Temas:** ${analysis.themes.join(', ')}\n**Estilo:** ${analysis.style}\n**Insights:** ${analysis.insights.join('\n- ')}`
          }]
        };

      case 'sequential-thinking':
        const thinkingResult = await sequentialThinking.processThought(
          args.thought,
          args.thoughtNumber,
          args.totalThoughts,
          args.nextThoughtNeeded
        );
        return {
          content: [{ 
            type: 'text', 
            text: `**Pensamento ${thinkingResult.currentThought}/${thinkingResult.totalThoughts}:**\n\n${thinkingResult.thought}\n\n**Status:** ${thinkingResult.nextThoughtNeeded ? 'Continuando...' : 'Concluído'}\n**Progresso:** ${thinkingResult.progress}`
          }]
        };

      default:
        throw new Error(`Ferramenta desconhecida: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ 
        type: 'text', 
        text: `Erro ao executar ${name}: ${error instanceof Error ? error.message : String(error)}` 
      }],
      isError: true
    };
  }
});

// Inicializar servidor
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log do diretório sendo usado
  console.error(`[TopicServer v6.0.0] Iniciado`);
  console.error(`[TopicServer v6.0.0] Diretório de memórias: ${topicManager.getMemoryRootPath()}`);
  console.error(`[TopicServer v6.0.0] MEMORY_BANK_ROOT: ${process.env.MEMORY_BANK_ROOT || 'não definido'}`);
}

main().catch(console.error);

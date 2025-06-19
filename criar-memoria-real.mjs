#!/usr/bin/env node

/**
 * Teste Real - Criando memória e mostrando localização
 */

import { TopicMemoryManager } from './dist/core/topic-memory-manager.js';

async function criarMemoriaReal() {
  console.log('🎯 === CRIANDO MEMÓRIA REAL ===\n');
  
  // Mostrar configuração atual
  console.log('📍 Configuração atual:');
  console.log(`   MEMORY_BANK_ROOT: ${process.env.MEMORY_BANK_ROOT || 'NÃO DEFINIDA'}`);
  
  // Instanciar gerenciador
  const manager = new TopicMemoryManager();
  console.log(`   ➜ Diretório que será usado: ${manager.getMemoryRootPath()}\n`);
  
  // Criar uma memória real
  const projectName = 'meu-projeto-teste';
  
  console.log('💾 Criando memória real...');
  
  // Armazenar informações em diferentes tópicos
  await manager.storeTopicMemory(
    projectName, 
    'summary', 
    'Este é meu projeto de teste do MCP Advanced Memory Bank v6.0.0.\nEle demonstra como o sistema armazena memórias usando a variável MEMORY_BANK_ROOT.',
    ['projeto', 'teste', 'demonstracao'],
    8
  );
  
  await manager.storeTopicMemory(
    projectName,
    'bugs',
    'Bug #1: Sistema não respeitava MEMORY_BANK_ROOT - RESOLVIDO! ✅\nBug #2: Faltavam logs informativos - RESOLVIDO! ✅',
    ['bug', 'resolvido'],
    7
  );
  
  await manager.storeTopicMemory(
    projectName,
    'features',
    'Feature implementada: Suporte completo a MEMORY_BANK_ROOT\n- Sistema detecta e usa a variável de ambiente\n- Cria diretórios automaticamente\n- Logs informativos sobre localização',
    ['feature', 'memory-bank-root', 'implementado'],
    9
  );
  
  console.log('✅ Memórias criadas com sucesso!\n');
  
  // Mostrar onde os arquivos foram salvos
  const projectPath = `${manager.getMemoryRootPath()}\\${projectName}.json`;
  console.log('📁 LOCALIZAÇÃO DOS ARQUIVOS:');
  console.log(`   ➜ Diretório raiz: ${manager.getMemoryRootPath()}`);
  console.log(`   ➜ Arquivo do projeto: ${projectPath}\n`);
  
  // Listar tópicos criados
  const topics = await manager.listTopics(projectName);
  console.log('📋 Tópicos criados:');
  topics.forEach(topic => console.log(`   - ${topic}`));
  
  // Mostrar info do projeto
  const projectInfo = await manager.getProjectInfo(projectName);
  console.log(`\n📊 Informações do projeto '${projectInfo.name}':`);
  console.log(`   - Tópicos: ${projectInfo.topicCount}`);
  console.log(`   - Memórias: ${projectInfo.memoryCount}`);
  console.log(`   - Importância total: ${projectInfo.totalImportance}`);
  console.log(`   - Criado: ${new Date(projectInfo.createdAt).toLocaleString()}`);
  
  console.log('\n🎉 TESTE CONCLUÍDO!');
  console.log(`📍 Suas memórias estão em: ${manager.getMemoryRootPath()}`);
  console.log(`📄 Arquivo do projeto: ${projectName}.json`);
}

// Executar teste
criarMemoriaReal().catch(console.error);

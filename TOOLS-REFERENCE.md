# MCP v6.0.0 - Ferramentas Completas

## 1. store-topic-memory
**Função:** Armazena informações em um tópico específico do projeto
**Tipo:** Armazenamento
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto
- `topic` (obrigatório): Nome do tópico (fixo ou personalizado)
- `content` (obrigatório): Conteúdo a ser armazenado
- `tags` (opcional): Array de tags para categorização
- `importance` (opcional): Nível de importância 1-10

**Exemplo de uso:**
```json
{
  "projectName": "e-commerce-app",
  "topic": "bugs",
  "content": "Erro de validação no checkout - campo CPF aceita caracteres especiais",
  "tags": ["critico", "checkout", "validacao"],
  "importance": 9
}
```

**Casos de uso:**
- Documentar bugs críticos
- Registrar decisões arquiteturais
- Salvar snippets de código importantes
- Guardar links de referência
- Anotar requisitos específicos

## 2. get-topic-memory
**Função:** Recupera todo o conteúdo armazenado em um tópico
**Tipo:** Recuperação
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto
- `topic` (obrigatório): Nome do tópico a recuperar

**Exemplo de uso:**
```json
{
  "projectName": "e-commerce-app",
  "topic": "architecture"
}
```

**Retorna:**
- Conteúdo completo do tópico
- Metadata (tags, importância, timestamp)
- Histórico de modificações

**Casos de uso:**
- Revisar documentação de arquitetura
- Consultar lista de bugs conhecidos
- Verificar dependências do projeto
- Acessar notas de deployment

## 3. list-topics
**Função:** Lista todos os tópicos existentes no projeto
**Tipo:** Listagem
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto

**Exemplo de uso:**
```json
{
  "projectName": "e-commerce-app"
}
```

**Retorna:**
- Lista de tópicos fixos utilizados
- Lista de tópicos personalizados criados
- Contagem de memórias por tópico
- Status de cada tópico

**Casos de uso:**
- Explorar estrutura do projeto
- Verificar organização das informações
- Identificar tópicos vazios ou subutilizados

## 4. list-all-topic-memories
**Função:** Lista todas as memórias organizadas por tópicos
**Tipo:** Listagem completa
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto
- `sortBy` (opcional): "timestamp" ou "importance"
- `limit` (opcional): Máximo de resultados (padrão: 200)

**Exemplo de uso:**
```json
{
  "projectName": "e-commerce-app",
  "sortBy": "importance",
  "limit": 50
}
```

**Retorna:**
- Todas as memórias agrupadas por tópico
- Resumo executivo do projeto
- Estatísticas de uso dos tópicos

**Casos de uso:**
- Obter visão geral completa do projeto
- Exportar todas as informações
- Fazer backup das memórias
- Análise de conteúdo

## 5. search-topic-memories
**Função:** Busca conteúdo em todos os tópicos do projeto
**Tipo:** Busca
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto
- `query` (obrigatório): Termo de busca
- `limit` (opcional): Máximo de resultados (padrão: 100)

**Exemplo de uso:**
```json
{
  "projectName": "e-commerce-app",
  "query": "pagamento PIX",
  "limit": 10
}
```

**Retorna:**
- Resultados relevantes com score de similaridade
- Contexto onde foi encontrado
- Tópico de origem

**Casos de uso:**
- Encontrar informações específicas
- Localizar menções a tecnologias
- Buscar bugs relacionados
- Encontrar decisões anteriores

## 6. update-topic-memory
**Função:** Atualiza o conteúdo de um tópico existente
**Tipo:** Modificação
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto
- `topic` (obrigatório): Nome do tópico
- `content` (opcional): Novo conteúdo
- `tags` (opcional): Novas tags
- `importance` (opcional): Nova importância

**Exemplo de uso:**
```json
{
  "projectName": "e-commerce-app",
  "topic": "bugs",
  "content": "Erro de validação no checkout - RESOLVIDO: implementada validação regex para CPF",
  "tags": ["resolvido", "checkout", "validacao"],
  "importance": 3
}
```

**Casos de uso:**
- Marcar bugs como resolvidos
- Atualizar documentação
- Modificar importância de itens
- Adicionar novas informações

## 7. delete-topic-memory
**Função:** Remove completamente um tópico e seu conteúdo
**Tipo:** Remoção
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto
- `topic` (obrigatório): Nome do tópico a remover

**Exemplo de uso:**
```json
{
  "projectName": "e-commerce-app",
  "topic": "features-obsoletas"
}
```

**⚠️ Atenção:** Operação irreversível

**Casos de uso:**
- Remover tópicos obsoletos
- Limpar informações incorretas
- Reorganizar estrutura de tópicos

## 8. get-project-info
**Função:** Obtém informações detalhadas sobre o projeto
**Tipo:** Informação
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto

**Exemplo de uso:**
```json
{
  "projectName": "e-commerce-app"
}
```

**Retorna:**
- Estatísticas do projeto
- Data de criação e última modificação
- Contagem de tópicos e memórias
- Tópicos mais utilizados
- Distribuição de importância

**Casos de uso:**
- Análise de projeto
- Relatórios de status
- Monitoramento de atividade

## 9. list-projects
**Função:** Lista todos os projetos disponíveis no sistema
**Tipo:** Listagem global
**Parâmetros:** Nenhum

**Exemplo de uso:**
```json
{}
```

**Retorna:**
- Lista de todos os projetos
- Informações básicas de cada projeto
- Status de atividade

**Casos de uso:**
- Explorar projetos existentes
- Mudança entre projetos
- Visão geral do sistema

## 10. reset-project
**Função:** Remove todas as memórias de um projeto (mantém a estrutura)
**Tipo:** Reset
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto
- `confirmReset` (obrigatório): true para confirmar

**Exemplo de uso:**
```json
{
  "projectName": "projeto-teste",
  "confirmReset": true
}
```

**⚠️ Atenção:** Remove TODAS as memórias do projeto

**Casos de uso:**
- Reiniciar projeto do zero
- Limpar dados de teste
- Reset completo após migração

## 11. initialize-fixed-topics
**Função:** Cria automaticamente todos os tópicos fixos padrão
**Tipo:** Inicialização
**Parâmetros:**
- `projectName` (obrigatório): Nome do projeto

**Exemplo de uso:**
```json
{
  "projectName": "novo-projeto"
}
```

**Cria os tópicos:**
- `summary` - Resumo geral do projeto
- `libraries` - Dependências e bibliotecas
- `change-history` - Histórico de mudanças
- `architecture` - Decisões arquiteturais
- `todo` - Tarefas pendentes
- `bugs` - Problemas conhecidos
- `features` - Funcionalidades implementadas
- `documentation` - Documentação técnica
- `testing` - Estratégias de teste
- `deployment` - Configurações de deploy

**Casos de uso:**
- Setup inicial de projeto
- Padronização de estrutura
- Organização automática

## 12. list-fixed-topics
**Função:** Lista todos os tópicos fixos disponíveis no sistema
**Tipo:** Listagem de sistema
**Parâmetros:** Nenhum

**Exemplo de uso:**
```json
{}
```

**Retorna:**
- Lista completa de tópicos fixos
- Descrição de cada tópico
- Casos de uso recomendados

**Casos de uso:**
- Consultar tópicos disponíveis
- Planejar organização do projeto
- Referência de estrutura

## 13. analyze-creative-content
**Função:** Analisa conteúdo para extrair insights e padrões criativos
**Tipo:** Análise
**Parâmetros:**
- `content` (obrigatório): Conteúdo a ser analisado
- `analysisType` (opcional): "structure", "themes", "style", "comprehensive"

**Exemplo de uso:**
```json
{
  "content": "Nossa aplicação de e-commerce precisa de um sistema de recomendações que aprenda com o comportamento do usuário e sugira produtos relevantes baseados em compras anteriores, navegação e preferências declaradas.",
  "analysisType": "comprehensive"
}
```

**Retorna:**
- Estrutura e organização do conteúdo
- Temas principais identificados
- Estilo e tom da comunicação
- Insights criativos e sugestões
- Padrões reconhecidos

**Casos de uso:**
- Análise de requisitos
- Identificação de padrões em documentação
- Extração de insights de feedback
- Análise de especificações

## 14. sequential-thinking
**Função:** Processa problemas complexos através de pensamento sequencial estruturado
**Tipo:** Processamento cognitivo
**Parâmetros:**
- `thought` (obrigatório): Pensamento/análise atual
- `thoughtNumber` (obrigatório): Número do pensamento atual
- `totalThoughts` (obrigatório): Total estimado de pensamentos
- `nextThoughtNeeded` (obrigatório): Se precisa de próximo pensamento

**Exemplo de uso:**
```json
{
  "thought": "Para implementar o sistema de recomendações, primeiro preciso analisar os dados disponíveis: histórico de compras, navegação, perfil do usuário e catálogo de produtos.",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "nextThoughtNeeded": true
}
```

**Processo:**
1. Decomposição do problema
2. Análise sequencial
3. Construção de solução
4. Validação de hipóteses
5. Conclusão estruturada

**Casos de uso:**
- Resolução de problemas complexos
- Planejamento arquitetural
- Análise de requisitos complexos
- Debugging de problemas sistêmicos
- Tomada de decisões técnicas


```

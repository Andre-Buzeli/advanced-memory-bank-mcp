# Configuração MEMORY_BANK_ROOT - MCP v6.0.0

## Objetivo
O MCP v6.0.0 agora respeita a variável de ambiente `MEMORY_BANK_ROOT` para definir onde as memórias são armazenadas, proporcionando controle total sobre o local de armazenamento.

## Como Funciona

### 1. **Variável de Ambiente MEMORY_BANK_ROOT**
```bash
# Windows
set MEMORY_BANK_ROOT=C:\MinhasMemoriasCustomizadas

# Linux/Mac
export MEMORY_BANK_ROOT=/home/usuario/minhas-memorias
```

### 2. **Comportamento do Sistema**
- **Se MEMORY_BANK_ROOT estiver definida**: Usa o diretório especificado
- **Se MEMORY_BANK_ROOT não estiver definida**: Usa `~/.advanced-memory-bank` (diretório padrão)

### 3. **Logs de Verificação**
O sistema sempre imprime no stderr qual diretório está sendo usado:
```
[TopicMemoryManager] Using MEMORY_BANK_ROOT: C:\MinhasMemoriasCustomizadas
[TopicServer v6.0.0] Diretório de memórias: C:\MinhasMemoriasCustomizadas
```

## Configuração Prática

### **Windows**
```cmd
# Temporário (sessão atual)
set MEMORY_BANK_ROOT=D:\MeusProjetos\Memorias

# Permanente (variável do sistema)
setx MEMORY_BANK_ROOT "D:\MeusProjetos\Memorias"

# Verificar
echo %MEMORY_BANK_ROOT%
```

### **Linux/Mac**
```bash
# Temporário (sessão atual)
export MEMORY_BANK_ROOT=/home/usuario/projetos/memorias

# Permanente (adicionar ao ~/.bashrc ou ~/.zshrc)
echo 'export MEMORY_BANK_ROOT=/home/usuario/projetos/memorias' >> ~/.bashrc

# Verificar
echo $MEMORY_BANK_ROOT
```

### **VS Code Settings.json**
```json
{
  "terminal.integrated.env.windows": {
    "MEMORY_BANK_ROOT": "D:\\MeusProjetos\\Memorias"
  },
  "terminal.integrated.env.linux": {
    "MEMORY_BANK_ROOT": "/home/usuario/projetos/memorias"
  },
  "terminal.integrated.env.osx": {
    "MEMORY_BANK_ROOT": "/Users/usuario/projetos/memorias"
  }
}
```

## Estrutura de Diretórios

### **Com MEMORY_BANK_ROOT definida**
```
D:\MeusProjetos\Memorias\
├── projeto-ecommerce.json
├── projeto-blog.json
├── projeto-api.json
└── projeto-mobile.json
```

### **Sem MEMORY_BANK_ROOT (padrão)**
```
C:\Users\Usuario\.advanced-memory-bank\
├── projeto-ecommerce.json
├── projeto-blog.json
├── projeto-api.json
└── projeto-mobile.json
```

## Verificação e Troubleshooting

### **1. Verificar se a variável está definida**
```bash
# Windows
echo %MEMORY_BANK_ROOT%

# Linux/Mac
echo $MEMORY_BANK_ROOT
```

### **2. Testar com o MCP**
```bash
# Execute o MCP e verifique os logs no stderr
node dist/main/topic-index.js

# Você deve ver:
# [TopicMemoryManager] Using MEMORY_BANK_ROOT: [seu-diretório]
# [TopicServer v6.0.0] Diretório de memórias: [seu-diretório]
```

### **3. Verificar permissões**
- O diretório deve ter permissões de leitura e escrita
- O MCP criará o diretório automaticamente se não existir

### **4. Usar ferramenta list-projects**
```json
{
  "name": "list-projects",
  "arguments": {}
}
```
O resultado mostrará o diretório sendo usado:
```
**Projetos disponíveis:**
- projeto-teste

**Diretório de memórias:** D:\MeusProjetos\Memorias
```

## Casos de Uso

### **1. Desenvolvimento Local**
```bash
export MEMORY_BANK_ROOT=./memorias-dev
```

### **2. Projeto Específico**
```bash
export MEMORY_BANK_ROOT=/projeto/importante/memorias
```

### **3. Backup e Sincronização**
```bash
# Usar diretório sincronizado (Google Drive, OneDrive, etc.)
export MEMORY_BANK_ROOT=/Users/usuario/GoogleDrive/MCP-Memorias
```

### **4. Ambiente de Produção**
```bash
export MEMORY_BANK_ROOT=/var/lib/mcp-memorias
```

## Migração de Dados

### **De versões anteriores**
```bash
# Copiar arquivos do diretório antigo para o novo
cp ~/.advanced-memory-bank/* $MEMORY_BANK_ROOT/
```

### **Entre diferentes diretórios**
```bash
# Backup atual
cp -r $MEMORY_BANK_ROOT /backup/memorias-$(date +%Y%m%d)

# Mudar para novo diretório
export MEMORY_BANK_ROOT=/novo/diretorio

# Copiar dados
cp /backup/memorias-*/* $MEMORY_BANK_ROOT/
```

## Segurança e Backup

### **1. Permissões Recomendadas**
```bash
# Linux/Mac
chmod 700 $MEMORY_BANK_ROOT  # Apenas o usuário pode acessar
chmod 600 $MEMORY_BANK_ROOT/*.json  # Arquivos apenas para o usuário
```

### **2. Backup Automático**
```bash
#!/bin/bash
# Script de backup
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "backup_memorias_$DATE.tar.gz" -C "$MEMORY_BANK_ROOT" .
```

### **3. Exclusão de VCS**
```gitignore
# .gitignore - se MEMORY_BANK_ROOT estiver dentro do projeto
memorias-dev/
*.json
```

## Exemplos Práticos

### **Configuração por Projeto**
```bash
# Projeto A
cd /projeto-a
export MEMORY_BANK_ROOT=./memorias-projeto-a
npm start

# Projeto B  
cd /projeto-b
export MEMORY_BANK_ROOT=./memorias-projeto-b
npm start
```

### **Configuração Global**
```bash
# Uma vez só no sistema
export MEMORY_BANK_ROOT=/home/usuario/todas-memorias
```

## Conclusão
A variável `MEMORY_BANK_ROOT` oferece flexibilidade total para organizar e localizar suas memórias MCP, permitindo:
- Organização por projeto
- Backup centralizado
- Sincronização com serviços de nuvem
- Controle de permissões
- Separação de ambientes (dev/prod)

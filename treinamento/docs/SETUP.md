# 🔧 Guia de Configuração Inicial

## Pré-requisitos

### Sistema
- Node.js 18+ (recomendado 25+)
- NPM ou Yarn
- 4GB+ RAM disponível
- Conexão com internet estável

### Contas Necessárias (Gratuitas)
1. **Google Account** - Para Google AI Studio (Gemini)
2. **Microsoft Account** - Para Bing Image Creator
3. **Leonardo.ai Account** - Para geração de imagens
4. **OpenAI Account** - Para ChatGPT Free (opcional)

## Instalação

### 1. Clonar e instalar dependências
```bash
git clone <seu-repositorio>
cd fabrica-de-conteudo-e-vamos-iterar
npm install
```

### 2. Instalar Playwright com navegadores
```bash
# Instalar apenas Chromium (recomendado - mais leve)
npx playwright install chromium --with-deps

# OU instalar todos os navegadores
npx playwright install --with-deps
```

### 3. Criar arquivo de configuração
```bash
cp .env.example .env
```

### 4. Configurar variáveis de ambiente
Edite o arquivo `.env`:
```env
# Configurações do Playwright
PLAYWRIGHT_HEADLESS=false
PLAYWRIGHT_SLOW_MO=100
PLAYWRIGHT_USER_DATA_DIR=./browser-data

# Configurações de sessão
SESSION_TIMEOUT=3600000
AUTO_LOGIN=true

# Diretórios
ASSETS_DIR=./assets
OUTPUT_DIR=./output
STRATEGIES_DIR=./strategies
```

## Configuração de Sessão Persistente

### Por que sessão persistente?
- Evita fazer login toda vez que executar
- Mantém cookies e dados de autenticação
- Permite uso contínuo sem interrupção

### Configurar sessão pela primeira vez

1. Execute o gerenciador de sessão:
```bash
node treinamento/automation/browser-session-manager.js --setup
```

2. O navegador abrirá em modo visível
3. Faça login em cada serviço:
   - Google AI Studio: https://aistudio.google.com
   - Bing Image Creator: https://www.bing.com/images/create
   - Leonardo.ai: https://leonardo.ai
   
4. Após fazer login, pressione Enter no terminal
5. A sessão será salva automaticamente

### Verificar sessão
```bash
node treinamento/automation/browser-session-manager.js --check
```

## Estrutura de Diretórios

Após a configuração, você terá:
```
fabrica-de-conteudo-e-vamos-iterar/
├── browser-data/           # Dados de sessão do navegador
│   ├── Default/
│   └── ...
├── assets/
│   ├── images/            # Imagens geradas
│   ├── videos/            # Vídeos gerados
│   └── temp/              # Arquivos temporários
├── output/
│   └── campaigns/         # Campanhas geradas
└── strategies/            # Arquivos de estratégia .md
```

## Testando a Configuração

### Teste básico
```bash
node treinamento/examples/generate-text.js "Olá, teste de configuração"
```

### Teste de geração de imagem
```bash
node treinamento/examples/generate-image.js "Um pôr do sol na praia"
```

## Solução de Problemas

### Erro: "Browser not found"
```bash
npx playwright install chromium --with-deps
```

### Erro: "Session expired"
```bash
node treinamento/automation/browser-session-manager.js --setup
```

### Erro: "Rate limit exceeded"
Aguarde alguns minutos e tente novamente. Cada serviço tem seus próprios limites.

### Navegador não abre
Verifique se `PLAYWRIGHT_HEADLESS=false` no `.env`

## Próximos Passos

1. [Configuração do Playwright](PLAYWRIGHT_CONFIG.md)
2. [Automação de Navegador](BROWSER_AUTOMATION.md)
3. [Serviços de IA Gratuitos](FREE_AI_SERVICES.md)

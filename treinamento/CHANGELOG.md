# Changelog - Módulo de Treinamento

## v1.0.0 - Lançamento Inicial

### 🎯 Objetivo
Permitir geração de conteúdo de marketing usando **IAs gratuitas** via automação de navegador, sem necessidade de APIs pagas.

### ✨ Funcionalidades

#### Geradores de Texto
- **Google AI Studio (Gemini)** - Geração de texto de alta qualidade
- **ChatGPT Free** - Alternativa gratuita do ChatGPT
- Posts para redes sociais (Instagram, Twitter, LinkedIn, Facebook, TikTok)
- Emails marketing
- Artigos de blog
- Copy para anúncios
- Hashtags

#### Geradores de Imagem
- **Google AI Studio (Imagen)** - Imagens via Gemini
- **Bing Image Creator (DALL-E 3)** - Imagens de alta qualidade
- **Leonardo.ai** - Múltiplos modelos de imagem
- Suporte a diferentes plataformas (Instagram, Stories, YouTube thumbnails, etc.)
- Geração de variações

#### Geradores de Vídeo
- **Runway ML** - Vídeos curtos (text-to-video e image-to-video)

#### Automação
- **Sessões Persistentes** - Login uma vez, use sempre
- **Fallback Automático** - Se um serviço falhar, tenta outro
- **Modo Headless** - Execução em background para produção
- **Docker Ready** - Pronto para containers

### 📁 Estrutura de Arquivos

```
treinamento/
├── automation/
│   ├── browser-session-manager.js   # Gerenciador de sessões
│   ├── google-ai-studio.js          # Automação do Google AI Studio
│   ├── image-generators/
│   │   ├── gemini-image.js          # Gerador via Gemini
│   │   ├── bing-image-creator.js    # Gerador via Bing/DALL-E 3
│   │   └── leonardo-ai.js           # Gerador via Leonardo.ai
│   ├── text-generators/
│   │   ├── gemini-text.js           # Gerador de texto via Gemini
│   │   └── chatgpt-free.js          # Gerador via ChatGPT Free
│   └── video-generators/
│       └── runway-free.js           # Gerador de vídeo via Runway
├── config/
│   ├── playwright.config.js         # Configuração do Playwright
│   └── services.json                # Configuração dos serviços
├── docs/
│   ├── SETUP.md                     # Guia de configuração
│   ├── PLAYWRIGHT_CONFIG.md         # Configuração do Playwright
│   ├── BROWSER_AUTOMATION.md        # Guia de automação
│   └── FREE_AI_SERVICES.md          # Lista de serviços gratuitos
├── examples/
│   ├── generate-image.js            # Exemplo de geração de imagem
│   ├── generate-text.js             # Exemplo de geração de texto
│   └── full-campaign.js             # Exemplo de campanha completa
├── tests/
│   └── automation.test.js           # Testes de automação
├── index.js                         # Módulo principal
└── README.md                        # Documentação
```

### 🚀 Como Usar

```bash
# 1. Instalar dependências
npm install
npx playwright install chromium --with-deps

# 2. Configurar sessões (uma vez)
npm run setup:sessions

# 3. Gerar conteúdo
npm run generate:image -- "Um café aconchegante"
npm run generate:text -- post instagram "Lançamento de produto"
npm run generate:campaign -- "Black Friday 2025"
```

### 🐳 Docker

```bash
# Build
docker-compose up -d

# Configurar sessões
docker exec -it mcp-platform node treinamento/index.js --setup
```

### ⚠️ Limitações

- Requer login manual inicial nos serviços
- Respeitar rate limits de cada serviço
- Alguns serviços podem ter captchas ocasionais
- Vídeos limitados a créditos gratuitos do Runway

### 🔮 Próximas Versões

- [ ] Suporte a mais serviços de IA
- [ ] Agendamento de geração
- [ ] Interface web para gerenciamento
- [ ] Integração com mais plataformas de vídeo
- [ ] Cache inteligente de resultados

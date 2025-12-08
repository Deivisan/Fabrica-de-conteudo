# 🎓 Treinamento - MCP Marketing Content Platform

## Visão Geral

Este módulo de treinamento contém toda a documentação e código funcional para usar a MCP de forma **100% gratuita**, utilizando automação via Playwright para acessar IAs gratuitas através do navegador.

## 🎯 Objetivo Principal

Permitir geração de conteúdo (imagens, textos, vídeos) usando IAs gratuitas via navegador, sem necessidade de APIs pagas.

## 📁 Estrutura do Módulo

```
treinamento/
├── README.md                    # Este arquivo
├── docs/
│   ├── SETUP.md                 # Guia de configuração inicial
│   ├── PLAYWRIGHT_CONFIG.md     # Configuração do Playwright
│   ├── BROWSER_AUTOMATION.md    # Guia de automação de navegador
│   └── FREE_AI_SERVICES.md      # Lista de serviços de IA gratuitos
├── automation/
│   ├── browser-session-manager.js   # Gerenciador de sessões do navegador
│   ├── google-ai-studio.js          # Automação do Google AI Studio
│   ├── image-generators/
│   │   ├── gemini-image.js          # Gerador via Gemini
│   │   ├── bing-image-creator.js    # Gerador via Bing Image Creator
│   │   └── leonardo-ai.js           # Gerador via Leonardo.ai
│   ├── text-generators/
│   │   ├── gemini-text.js           # Gerador de texto via Gemini
│   │   └── chatgpt-free.js          # Gerador via ChatGPT Free
│   └── video-generators/
│       └── runway-free.js           # Gerador de vídeo via Runway
├── config/
│   ├── playwright.config.js     # Configuração do Playwright
│   └── services.json            # Configuração dos serviços de IA
├── examples/
│   ├── generate-image.js        # Exemplo de geração de imagem
│   ├── generate-text.js         # Exemplo de geração de texto
│   └── full-campaign.js         # Exemplo de campanha completa
└── tests/
    └── automation.test.js       # Testes de automação
```

## 🚀 Quick Start

### 1. Instalar dependências
```bash
npm install
npx playwright install chromium --with-deps
```

### 2. Configurar sessão do navegador
```bash
node treinamento/automation/browser-session-manager.js --setup
```

### 3. Fazer login manual (uma vez)
O navegador abrirá para você fazer login nas plataformas de IA. Após o login, a sessão será salva.

### 4. Gerar conteúdo
```bash
node treinamento/examples/generate-image.js "Um gato astronauta no espaço"
```

## 🔧 Serviços de IA Gratuitos Suportados

| Serviço | Tipo | Limite Gratuito |
|---------|------|-----------------|
| Google AI Studio (Gemini) | Texto/Imagem | Generoso |
| Bing Image Creator | Imagem | 15 boosts/dia |
| Leonardo.ai | Imagem | 150 tokens/dia |
| ChatGPT Free | Texto | Limitado |
| Runway ML | Vídeo | 125 créditos |

## 📖 Documentação Completa

- [Configuração Inicial](docs/SETUP.md)
- [Configuração do Playwright](docs/PLAYWRIGHT_CONFIG.md)
- [Automação de Navegador](docs/BROWSER_AUTOMATION.md)
- [Serviços de IA Gratuitos](docs/FREE_AI_SERVICES.md)

## ⚠️ Importante

- **Sessões persistentes**: O Playwright mantém cookies e dados de sessão para evitar login repetido
- **Rate limiting**: Respeite os limites de uso de cada serviço
- **Uso responsável**: Use apenas para fins legítimos de marketing

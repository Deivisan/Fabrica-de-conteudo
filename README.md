# MCP - Marketing Content Platform 🚀

Bem-vindo à **MCP (Marketing Content Platform)** - uma plataforma avançada para geração e automação inteligente de conteúdo multimídia para todas as redes sociais, usando **IAs GRATUITAS via automação de navegador** (Google AI Studio, Bing Image Creator, Leonardo.ai e mais).

## 🎯 Objetivo

Criar uma plataforma inteligente que:
- Leia estratégias de marketing descritas em arquivos Markdown
- Gere automaticamente conteúdo (textos, imagens, vídeos) usando **IAs gratuitas**
- Use **Playwright para automação de navegador** - sem necessidade de APIs pagas
- Mantenha sessões persistentes para evitar login repetido
- Funcione em containers Docker para fácil deploy

## 🆓 100% Gratuito

Esta plataforma usa **automação de navegador** para acessar serviços de IA gratuitos:
- **Google AI Studio (Gemini)** - Texto e imagens
- **Bing Image Creator (DALL-E 3)** - Imagens de alta qualidade
- **Leonardo.ai** - Imagens com múltiplos modelos
- **Runway ML** - Vídeos curtos
- E mais...

## 🧠 Arquitetura Geral

O sistema é estruturamente modular com os seguintes componentes principais:

### 1. **Parser de Estratégias**
- Lê arquivos `.md` contendo estratégias de marketing
- Extrai informações estruturadas sobre o tipo de conteúdo, público-alvo, estilo, etc.

### 2. **Gerador de Conteúdo Multimídia**
- **Texto**: Geração de copy, legendas, emails, artigos, etc.
- **Imagem**: Criação de designs gráficos, banners, stories, posts, etc.
- **Vídeo**: Montagem e edição de vídeos curtos para redes sociais
- **Sites**: Geração de páginas simples e landing pages

### 3. **Automatizador via Playwright**
- Publicação automática em redes sociais
- Integração com APIs de redes sociais
- Agendamento de postagens

### 4. **Sistema de Agentes**
- Agentes especializados para diferentes tipos de tarefas
- Capacidade de aprendizado e adaptação contínua
- Integração com modelos de IA avançados (OpenAI, Anthropic, etc.)

## 🛠️ Tecnologias Utilizadas

- **Node.js 25** - Ambiente de execução
- **Alpine Linux** - Base leve do container
- **Playwright** - Automação de navegadores e testes
- **Docker** - Contêinerização
- **OpenAI API (ChatGPT)** - Geração de texto e imagens
- **Google AI Studio** - Geração de conteúdo multimodal
- **Grok (xAI)** - Alternativa de IA avançada
- **Anthropic** - Geração de conteúdo com Claude
- **Puppeteer** - Manipulação de conteúdo visual
- **FFmpeg** - Processamento de vídeo
- **Express.js** - API para integração
- **Cheerio** - Web scraping e parsing HTML
- **Axios** - Requisições HTTP

## 📁 Estrutura de Pastas

```
mcp-platform/
├── src/                    # Código fonte principal
│   ├── parser/             # Parser de estratégias Markdown
│   ├── generators/         # Geradores (texto, imagem, vídeo, website)
│   ├── agents/             # Agente de conteúdo
│   ├── platforms/          # Integrações com redes sociais
│   └── utils/              # Utilitários
├── treinamento/            # 🆕 MÓDULO DE AUTOMAÇÃO GRATUITA
│   ├── automation/         # Automações de navegador
│   │   ├── browser-session-manager.js
│   │   ├── google-ai-studio.js
│   │   ├── image-generators/
│   │   ├── text-generators/
│   │   └── video-generators/
│   ├── config/             # Configurações do Playwright
│   ├── docs/               # Documentação completa
│   └── examples/           # Exemplos práticos
├── strategies/             # Arquivos .md com estratégias
├── assets/                 # Arquivos gerados
├── browser-data/           # Sessões do navegador (persistente)
├── config/
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🚀 Como Começar

### Opção 1: Usando IAs Gratuitas (Recomendado)

```bash
# 1. Instalar dependências
npm install
npx playwright install chromium --with-deps

# 2. Configurar sessões (login manual uma vez)
node treinamento/index.js --setup

# 3. Gerar conteúdo!
node treinamento/examples/generate-image.js "Um café aconchegante"
node treinamento/examples/generate-text.js post instagram "Lançamento de produto"
node treinamento/examples/full-campaign.js "Black Friday 2025"
```

### Opção 2: Com Docker

```bash
# Build e execução
docker-compose up -d

# Configurar sessões (primeira vez)
docker exec -it mcp-platform node treinamento/index.js --setup
```

### Opção 3: Com APIs Pagas (Opcional)

Se você tiver chaves de API, configure no `.env`:
```bash
cp .env.example .env
# Edite .env com suas chaves
```

## 📝 Exemplo de Estratégia (Markdown)

```markdown
# Campanha de Lançamento - Produto X

## Objetivo
Promover o novo Produto X para público jovem (18-30) interessado em tecnologia.

## Plataformas
- Instagram: 3 posts por semana
- TikTok: 2 vídeos por semana
- LinkedIn: 1 artigo por semana

## Estilo de Conteúdo
- Linguagem jovem e informal
- Tendências atuais
- Humor leve
- Foco em benefícios práticos

## Tipos de Conteúdo
- Posts explicativos com GIFs
- Stories interativos
- Reels curtos e dinâmicos
- Artigos técnicos para LinkedIn
```

## 🤖 Funcionalidades do Sistema

### Automação Gratuita (Módulo Treinamento)
- **Sessões Persistentes**: Login uma vez, use sempre
- **Google AI Studio**: Texto e imagens via Gemini
- **Bing Image Creator**: Imagens DALL-E 3 gratuitas
- **Leonardo.ai**: Múltiplos modelos de imagem
- **Runway ML**: Geração de vídeos curtos

### Funcionalidades Principais
- **Análise de Estratégia**: Extrai automaticamente objetivos, públicos-alvo, plataformas e estilos
- **Geração Multimodal**: Cria conteúdo em texto, imagem e vídeo
- **Publicação Automática**: Agenda e publica automaticamente nas redes
- **Multi-IA**: Suporte a múltiplos provedores de IA
- **Web Scraping**: Monitoramento de tendências e análise de conteúdo
- **APIs Próprias**: Criação e gerenciamento de APIs personalizadas
- **Campanhas Completas**: Geração de campanhas inteiras com um comando

## 🔄 Processo de Iteração

1. **Leia**: O sistema processa arquivos `.md` com estratégias
2. **Plano**: Gera um plano de conteúdo baseado na estratégia
3. **Crie**: Cria o conteúdo multimídia necessários
4. **Publique**: Publica automaticamente nas plataformas
5. **Analise**: Avalia o desempenho e adapta para próximas iterações
6. **Itere**: Refina continuamente com base nos resultados

## 🛡️ Segurança

- Todas as chaves de API são mantidas em variáveis de ambiente
- Validação de conteúdo antes da publicação
- Monitoramento constante de limites de API

## 📈 Futuro

- Integração com mais plataformas
- Sistema de métricas avançadas
- Interface de usuário web
- Geração multimodal avançada
- Integração com ferramentas de análise de dados

## 🚀 Configuração e Uso

### Configuração de APIs

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis com suas chaves de API:
   - `OPENAI_API_KEY`: Chave da API OpenAI
   - `GOOGLE_AI_API_KEY`: Chave da API Google AI Studio
   - `GROK_API_KEY`: Chave da API Grok (xAI)
      - `GROK_ENDPOINT`: Endpoint da API Grok (opcional, padrão: https://api.x.ai/v1)
      - `GROK_MODEL`: Modelo Grok a ser usado (opcional, padrão: xai/grok-code-fast-1)

      Nota: O modelo Grok (xai/grok-code-fast-1) é focado em tarefas de texto/código; não fornece suporte para visão (image/vision). Para geração de imagens, continue usando `GOOGLE_AI_STUDIO`, `BING_IMAGE_CREATOR` ou outros provedores de imagem. Se você utiliza Grok via GitHub Copilot, lembre-se que a integração do editor usa o modelo do Copilot — esta configuração se aplica somente quando você chama a API diretamente (via chave/API).
   - Credenciais das redes sociais

### Testando a integração com Grok

- Se você quiser testar localmente a conexão com Grok, copie `.env.example` para `.env` e preencha `GROK_API_KEY`.
- Em seguida rode:
```bash
npm run test:grok
```

Isso fará uma chamada rápida ao endpoint de chat/completions com o modelo configurado e informará se a chave, o endpoint e o modelo estão corretos.

Observação sobre Copilot: Se você utiliza o Grok como modelo embutido no GitHub Copilot, as requisições do Copilot não usam necessariamente `GROK_API_KEY` do projeto — a integração do editor usa fluxos próprios. Essas configurações valem quando você chama a API diretamente (por este projeto).

### Uso da MCP

1. Execute com Docker:
   ```bash
   docker-compose up -d
   ```

2. Acesse as funcionalidades:
   - Aplicação principal: `http://localhost:3000`
   - APIs personalizadas: `http://localhost:3001`

### Exemplo de Estratégia com APIs

A MCP pode gerar estratégias automaticamente com base em tendências da web:
```javascript
// Atualizar estratégias com base em tendências
await contentFactory.updateStrategiesFromTrends(['inteligencia artificial', 'marketing digital']);

// Gerar API personalizada
await contentFactory.generateCustomAPI('conteudo-criativo', 'text', { modelo: 'gpt-4' });

// Gerar conteúdo com API personalizada
const resultado = await contentFactory.generateContentWithCustomAPI('text', 'Como usar IA no marketing?', { temperatura: 0.8 });
```

---

**Vamos criar, automatizar e iterar!** 💡
# MCP - Marketing Content Platform 🚀

Bem-vindo à **MCP (Marketing Content Platform)** - uma plataforma avançada para geração e automação inteligente de conteúdo multimídia para todas as redes sociais, usando múltiplas fontes de IA (ChatGPT, Google AI, Grok e mais) e automação via Playwright.

## 🎯 Objetivo

Criar uma plataforma inteligente que leia estratégias de marketing descritas em arquivos Markdown, realize scraping de tendências da web e gere automaticamente conteúdo em diversos formatos (textos, imagens, vídeos, sites) para qualquer rede social, usando múltiplas fontes de IA e automação via Playwright. A plataforma também permite a criação e gerenciamento de APIs próprias para geração de conteúdo.

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
fabrica-conteudo/
├── docker/
│   ├── Dockerfile          # Dockerfile base com Alpine e Node.js 25
│   └── docker-compose.yml  # Compose para ambientes de desenvolvimento
├── src/
│   ├── parser/
│   │   └── md-parser.js    # Parser de arquivos Markdown
│   ├── generators/
│   │   ├── text/
│   │   ├── image/
│   │   ├── video/
│   │   └── website/
│   ├── agents/
│   │   └── content-agent.js # Agente principal de geração de conteúdo
│   ├── platforms/
│   │   ├── instagram.js
│   │   ├── facebook.js
│   │   ├── youtube.js
│   │   └── linkedin.js
│   └── utils/
├── strategies/             # Pasta para arquivos .md com estratégias
├── assets/                 # Arquivos temporários e gerados
├── config/
│   └── config.json
├── package.json
└── README.md
```

## 🚀 Como Começar

1. Clone o repositório
2. Configure suas chaves de API no arquivo de configuração
3. Inicie o container Docker
4. Adicione seus arquivos de estratégia em `./strategies`
5. Execute o sistema para processar as estratégias

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

- **Análise de Estratégia**: Extrai automaticamente objetivos, públicos-alvo, plataformas e estilos
- **Geração Multimodal**: Cria conteúdo em texto, imagem e vídeo
- **Publicação Automática**: Agenda e publica automaticamente nas redes
- **Aprendizado Contínuo**: Adapta-se com base em métricas e feedback
- **Template Personalizado**: Cria templates reutilizáveis
- **Multi-IA**: Suporte a ChatGPT, Google AI, Grok e outras IAs
- **Web Scraping**: Monitoramento de tendências e análise de conteúdo
- **APIs Próprias**: Criação e gerenciamento de APIs personalizadas
- **Geração Automática de Estratégias**: Criação de estratégias baseadas em tendências

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
   - Credenciais das redes sociais

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
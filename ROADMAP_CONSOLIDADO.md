# ROADMAP CONSOLIDADO - Fábrica de Conteúdo

> **Versão:** 2.0.0  
> **Data:** 21 Janeiro 2026  
> **Autor:** DevSan A.G.I. (@deivisan)  
> **Status:** Planejamento Estratégico

---

## TL;DR - Resumo Executivo

O projeto **Fábrica de Conteúdo** é um sistema de automação de navegador para geração de conteúdo usando IAs gratuitas. O código tem ~1 mês sem manutenção e precisa de atualização. Este roadmap consolida o que funciona, o que precisa ser corrigido e os próximos passos.

**Decisão Principal:** Migrar de **Playwright** para **Puppeteer Stealth** em sites com Cloudflare (Grok, alguns serviços de IA) mantendo Playwright para sites sem proteção anti-bot.

---

## 1. ANÁLISE DO ESTADO ATUAL

### 1.1 O Que Funciona (Manter)

| Componente | Status | Notas |
|------------|--------|-------|
| `services.json` | ✅ Excelente | Config de 13 serviços (texto, imagem, vídeo, áudio) |
| `playwright.config.js` | ✅ Bom | Timeouts, viewports, user agents configurados |
| `google-ai-studio-mapping.json` | ⚠️ Desatualizado | Seletores de 08/12/2025 - precisam atualização |
| `browser-session-manager.js` | ✅ Bom | Gerenciamento de sessões persistentes |
| `gemini-image.js` | ✅ Bom | Gerador de imagens com variações e social media |
| `gemini-text.js` | ✅ Bom | Posts, emails, artigos, hashtags |
| `bing-image-creator.js` | ⚠️ Verificar | Seletores podem estar desatualizados |
| `leonardo-ai.js` | ⚠️ Verificar | Seletores podem estar desatualizados |
| `full-campaign.js` | ✅ Bom | Orquestrador de campanhas completas |
| `clients/Thamires/*` | ✅ Completo | Sistema MeuCão 100% documentado |

### 1.2 O Que Tem Problemas (Corrigir)

| Problema | Causa | Solução |
|----------|-------|---------|
| Seletores Google AI Studio | Interface atualizada | Re-mapear com `auto-mapper.js` |
| Cloudflare em alguns sites | Playwright detectado | Usar Puppeteer Stealth |
| `google-ai-studio.js` (v1) | Código legado | Usar v2 ou refatorar |
| Falta de testes automatizados | Código sem CI | Criar suite de testes |
| Logs não estruturados | Console.log solto | Implementar logger |

### 1.3 O Que Falta Implementar (Criar)

| Feature | Prioridade | Esforço |
|---------|------------|---------|
| Migração Puppeteer Stealth | 🔴 Alta | 2 dias |
| Atualização de seletores | 🔴 Alta | 1 dia |
| Integração com clientes | 🟡 Média | 1 dia |
| CLI unificada | 🟡 Média | 1 dia |
| Dashboard web | 🟢 Baixa | 3 dias |
| Geração de PDF | 🟢 Baixa | 1 dia |

---

## 2. ARQUITETURA PROPOSTA

### 2.1 Estrutura de Diretórios (Atual vs Proposta)

```
Fabrica-de-conteudo/
├── src/                          # Core do MCP (manter)
├── treinamento/                  # Módulo de automação
│   ├── automation/
│   │   ├── core/                 # 🆕 Abstrações centrais
│   │   │   ├── browser-engine.js     # Switch Playwright/Puppeteer
│   │   │   ├── session-manager.js    # Gerenciador unificado
│   │   │   └── selector-engine.js    # Auto-discovery de seletores
│   │   ├── image-generators/     # ✅ Manter
│   │   ├── text-generators/      # ✅ Manter
│   │   ├── video-generators/     # ✅ Manter
│   │   └── mapper/               # ✅ Manter (atualizar)
│   ├── config/
│   │   ├── services.json         # ✅ Manter
│   │   ├── selectors/            # 🆕 Seletores por serviço
│   │   │   ├── google-ai-studio.json
│   │   │   ├── bing-image.json
│   │   │   └── leonardo.json
│   │   └── playwright.config.js  # ✅ Manter
│   └── cli/                      # 🆕 CLI unificada
│       ├── generate.js           # fab generate --image/--text
│       ├── campaign.js           # fab campaign --from-strategy
│       └── map.js                # fab map --service google-ai
├── clients/                      # ✅ Sistema de clientes
│   ├── Thamires/                 # ✅ MeuCão completo
│   └── [outros]/
├── browser-data/                 # Sessões persistentes
├── assets/generated/             # Output
└── tests/                        # 🆕 Testes automatizados
```

### 2.2 Fluxo de Decisão Browser

```
┌─────────────────────────────────────────────────────┐
│                 REQUISIÇÃO DE GERAÇÃO                │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   Qual Site?   │
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   Google AI     Bing Image    Leonardo
   Studio        Creator       ai.com
        │             │             │
        ▼             ▼             ▼
   ┌────────┐   ┌────────┐   ┌────────┐
   │  TEM   │   │  TEM   │   │  SEM   │
   │CLOUD-  │   │CLOUD-  │   │CLOUD-  │
   │FLARE?  │   │FLARE?  │   │FLARE   │
   └───┬────┘   └───┬────┘   └───┬────┘
       │            │            │
       ▼            ▼            ▼
   Playwright   Playwright   Playwright
   (testado)    (testado)    (padrão)
       │            │            │
       └────────────┴────────────┘
                    │
                    ▼
         ┌────────────────────┐
         │  Se falhar 3x →    │
         │  PUPPETEER STEALTH │
         └────────────────────┘
```

### 2.3 Engine de Browser Híbrido

```javascript
// browser-engine.js (proposta)
class BrowserEngine {
  constructor() {
    this.playwright = null;
    this.puppeteer = null;
    this.currentEngine = 'playwright'; // default
  }

  async getPage(service) {
    const config = SERVICES[service];
    
    // Tentar Playwright primeiro
    if (config.engine === 'playwright' || !config.engine) {
      try {
        return await this.getPlaywrightPage();
      } catch (e) {
        console.log('⚠️ Playwright falhou, tentando Puppeteer Stealth...');
      }
    }
    
    // Fallback para Puppeteer Stealth
    return await this.getPuppeteerStealthPage();
  }
}
```

---

## 3. SERVIÇOS SUPORTADOS

### 3.1 Geração de Imagem

| Serviço | URL | Limite/Dia | Engine Recomendado | Status |
|---------|-----|------------|-------------------|--------|
| **Google AI Studio** | aistudio.google.com | ~100 | Playwright | ✅ Funcional |
| **Bing Image Creator** | bing.com/images/create | 15 boosts | Playwright | ⚠️ Testar |
| **Leonardo.ai** | app.leonardo.ai | 150 tokens | Playwright | ⚠️ Testar |
| **Ideogram** | ideogram.ai | 25 | Playwright | ❌ Implementar |
| **Playground AI** | playground.com | 500 | Playwright | ❌ Implementar |

### 3.2 Geração de Texto

| Serviço | URL | Limite/Dia | Engine Recomendado | Status |
|---------|-----|------------|-------------------|--------|
| **Google AI Studio** | aistudio.google.com | 1500+ | Playwright | ✅ Funcional |
| **ChatGPT Free** | chat.openai.com | ~50 | Puppeteer Stealth | ⚠️ Captchas |
| **Perplexity** | perplexity.ai | 100+ | Playwright | ❌ Implementar |
| **Grok** | grok.com | 1000+ | Puppeteer Stealth | ⚠️ Cloudflare |

### 3.3 Geração de Vídeo/Áudio

| Serviço | Limite | Status |
|---------|--------|--------|
| Runway ML | 125 créditos | ⚠️ Testar |
| Pika Labs | 10/dia | ❌ Implementar |
| Suno AI | 50 créditos/dia | ❌ Implementar |
| ElevenLabs | 10k chars/mês | ❌ Implementar |

---

## 4. SISTEMA DE CLIENTES

### 4.1 Estrutura por Cliente

```
clients/
├── Thamires/                     # Cliente ativo
│   ├── MASTER_INDEX.md           # Navegação
│   ├── SUMMARY_MEUCAO.md         # Resumo executivo
│   ├── brand/                    # Identidade visual
│   │   ├── meucao-brand-identity.md
│   │   └── yorkshire-terrier-guide.md
│   ├── content/
│   │   └── instagram/
│   │       └── meucao-post-templates.md
│   ├── prompts/                  # Prompts otimizados
│   │   └── nano-banana-meucao-prompts.md
│   ├── strategy/                 # Estratégia completa
│   │   └── meucao-instagram-strategy.md
│   └── media/                    # 🆕 Mídia gerada
│       ├── images/
│       ├── videos/
│       └── pdfs/
└── [template]/                   # Template para novos clientes
    └── ...
```

### 4.2 Workflow de Geração por Cliente

```bash
# CLI proposta
fab generate --client Thamires --type instagram --week 1

# O que acontece:
# 1. Lê clients/Thamires/prompts/nano-banana-meucao-prompts.md
# 2. Para cada prompt da semana 1:
#    a. Abre Google AI Studio
#    b. Insere prompt
#    c. Aguarda geração
#    d. Captura imagem em 100% qualidade
#    e. Salva em clients/Thamires/media/images/
# 3. Gera PDF compilado (opcional)
# 4. Retorna relatório
```

---

## 5. ROADMAP DE IMPLEMENTAÇÃO

### FASE 1: Estabilização (Semana 1)

**Objetivo:** Fazer o sistema funcionar com Google AI Studio

| Task | Prioridade | Esforço | Responsável |
|------|------------|---------|-------------|
| Atualizar seletores Google AI Studio | 🔴 Alta | 2h | DevSan |
| Testar `gemini-image.js` end-to-end | 🔴 Alta | 1h | DevSan |
| Testar `gemini-text.js` end-to-end | 🔴 Alta | 1h | DevSan |
| Corrigir bugs encontrados | 🔴 Alta | 2h | DevSan |
| Documentar seletores atualizados | 🟡 Média | 1h | DevSan |

**Entregável:** Geração de imagem e texto funcionando via Google AI Studio

### FASE 2: Integração com Clientes (Semana 2)

**Objetivo:** Conectar sistema de geração com documentação de clientes

| Task | Prioridade | Esforço | Responsável |
|------|------------|---------|-------------|
| Criar parser de prompts do cliente | 🔴 Alta | 2h | DevSan |
| Implementar geração batch | 🔴 Alta | 3h | DevSan |
| Criar estrutura de saída organizada | 🟡 Média | 1h | DevSan |
| Testar com cliente MeuCão | 🔴 Alta | 2h | DevSan |
| Gerar primeira semana de posts | 🟡 Média | 1h | Thamires |

**Entregável:** Gerar 6 posts de Instagram do MeuCão automaticamente

### FASE 3: Expansão de Serviços (Semana 3)

**Objetivo:** Adicionar mais serviços de geração de imagem

| Task | Prioridade | Esforço | Responsável |
|------|------------|---------|-------------|
| Testar e atualizar Bing Image Creator | 🟡 Média | 2h | DevSan |
| Testar e atualizar Leonardo.ai | 🟡 Média | 2h | DevSan |
| Implementar fallback automático | 🟡 Média | 2h | DevSan |
| Criar comparativo de qualidade | 🟢 Baixa | 1h | DevSan |

**Entregável:** 3 serviços de imagem funcionando com fallback

### FASE 4: CLI e Automação (Semana 4)

**Objetivo:** Interface de linha de comando unificada

| Task | Prioridade | Esforço | Responsável |
|------|------------|---------|-------------|
| Criar CLI `fab` | 🟡 Média | 4h | DevSan |
| Implementar `fab generate` | 🟡 Média | 2h | DevSan |
| Implementar `fab campaign` | 🟡 Média | 2h | DevSan |
| Implementar `fab map` | 🟢 Baixa | 1h | DevSan |
| Documentar uso | 🟢 Baixa | 1h | DevSan |

**Entregável:** CLI funcional para todas as operações

### FASE 5: Puppeteer Stealth (Quando Necessário)

**Objetivo:** Suporte a sites com proteção anti-bot

| Task | Prioridade | Esforço | Responsável |
|------|------------|---------|-------------|
| Criar `browser-engine.js` híbrido | 🟡 Média | 3h | DevSan |
| Integrar Puppeteer Stealth do Metodologia-Scrape | 🟡 Média | 2h | DevSan |
| Testar em sites problemáticos | 🟡 Média | 2h | DevSan |
| Documentar quando usar cada engine | 🟢 Baixa | 1h | DevSan |

**Entregável:** Engine híbrido Playwright + Puppeteer Stealth

---

## 6. COMANDOS DE DESENVOLVIMENTO

### 6.1 Setup Inicial

```bash
# Instalar dependências
cd C:\Projetos\Fabrica-de-conteudo
bun install

# Instalar Playwright browsers
bunx playwright install chromium

# Criar sessão de browser (fazer login manual)
node treinamento/automation/browser-session-manager.js --setup
```

### 6.2 Mapeamento de Seletores

```bash
# Mapear Google AI Studio
node treinamento/automation/mapper/auto-mapper.js

# Ver resultado
cat treinamento/config/google-ai-studio-mapping.json | jq
```

### 6.3 Testar Geradores

```bash
# Gerar imagem simples
node treinamento/automation/image-generators/gemini-image.js "Um cachorro Yorkshire fofo"

# Gerar imagem para Instagram
node treinamento/automation/image-generators/gemini-image.js --social instagram "Ração premium para cães"

# Gerar post de texto
node treinamento/automation/text-generators/gemini-text.js --post instagram "Benefícios da ração super premium"

# Campanha completa
node treinamento/examples/full-campaign.js "MeuCão Prime - Lançamento"
```

### 6.4 Estrutura de Arquivos Gerados

```
assets/generated/
├── gemini/
│   ├── gemini_1737456789012.png
│   └── instagram_1737456789012.png
├── bing/
│   └── bing_1737456789012_1.jpg
├── leonardo/
│   └── leonardo_1737456789012_1.png
└── text/
    ├── instagram_post_1737456789012.txt
    └── article_1737456789012.md
```

---

## 7. SELETORES ATUALIZADOS

### 7.1 Google AI Studio (Janeiro 2026)

```javascript
const GOOGLE_AI_STUDIO = {
  // Navegação
  url: 'https://aistudio.google.com',
  
  // Input de prompt
  promptInput: [
    'textarea[aria-label*="Type something"]',
    'textarea[aria-label*="prompt" i]',
    'ms-autosize-textarea textarea',
    'textarea.textarea'
  ],
  
  // Botão de execução
  runButton: [
    'button[aria-label*="Run" i]',
    'ms-run-button button',
    'button.run-button'
  ],
  
  // Seletor de modelo (Imagen/Nano Banana)
  modelSelector: 'button.content-button:has-text("Nano Banana")',
  
  // Filtro de imagens
  imagesFilter: 'button.ms-button-filter-chip:has-text("Images")',
  
  // Resposta/Imagem gerada
  generatedImage: [
    'img[src*="googleusercontent"]',
    '.response-image img',
    'ms-image-result img'
  ],
  
  // Loading indicator
  loadingIndicator: '.loading, .generating, [data-generating]'
};
```

### 7.2 Bing Image Creator

```javascript
const BING_IMAGE_CREATOR = {
  url: 'https://www.bing.com/images/create',
  
  promptInput: '#sb_form_q, textarea[name="q"]',
  submitButton: '#create_btn_c, button[type="submit"]',
  
  // Imagens geradas (grid)
  images: '.mimg, .imgpt img, img.mimg',
  
  // Download
  downloadButton: '.btn_dwnld, a[download]',
  
  // Boost counter
  boostCount: '.credits, .boost-count'
};
```

---

## 8. MÉTRICAS DE SUCESSO

### 8.1 KPIs Técnicos

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Taxa de sucesso de geração | > 90% | Logs de execução |
| Tempo médio por imagem | < 60s | Timestamp |
| Imagens por sessão (sem re-login) | > 20 | Contador |
| Uptime dos serviços | > 95% | Health checks |

### 8.2 KPIs de Negócio

| Métrica | Meta | Como Medir |
|---------|------|------------|
| Posts gerados/semana | 6+ por cliente | Output count |
| Tempo economizado | > 2h/semana | Antes vs depois |
| Qualidade visual | Aprovação cliente | Feedback |
| Consistência de marca | 100% | Checklist |

---

## 9. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Google muda interface | Alta | Alto | Auto-mapper + fallback |
| Rate limiting | Média | Médio | Delays + múltiplos serviços |
| Cloudflare bloqueia | Média | Alto | Puppeteer Stealth |
| Conta banida | Baixa | Alto | Múltiplas contas + delays |
| Qualidade inconsistente | Média | Baixo | Variações + seleção manual |

---

## 10. PRÓXIMOS PASSOS IMEDIATOS

### Hoje (21 Jan 2026) - ✅ FEITO!

1. [x] ~~Ler e analisar código existente~~
2. [x] ~~Criar ROADMAP consolidado~~
3. [x] Criar core/browser-engine.ts (Engine Playwright persistente)
4. [x] Criar core/ai-interaction.ts (Interação com IAs)
5. [x] Criar core/selectors.ts (Seletores Google AI Studio, Bing, Leonardo)
6. [x] Criar generators/image-generator.ts
7. [x] Criar generators/text-generator.ts
8. [x] Criar generators/campaign-generator.ts
9. [x] Commit e push (fa43a05, 5e7cbe2)

### Esta Semana - 🏃 EM ANDAMENTO

1. [ ] FASE 1.5: Testar geração end-to-end
   - [ ] Rodar `bun run test:quick` para verificar automação
   - [ ] Fazer login se necessário: `bun run browser:setup`
   - [ ] Gerar 1 imagem de teste para MeuCão
2. [ ] FASE 2: Integração com Clientes (70% concluída)
   - [x] Generators prontos para ler prompts de clientes
   - [ ] Testar com cliente MeuCão
   - [ ] Gerar primeira semana de posts

### Próxima Semana

1. [ ] FASE 3: Expansão de Serviços
   - [ ] Testar Bing Image Creator
   - [ ] Testar Leonardo.ai
   - [ ] Implementar fallback automático
2. [ ] FASE 4: CLI Unificada
   - [ ] Criar CLI `fab` global
   - [ ] Documentar uso

---

## CHANGELOG

| Data | Versão | Mudanças | Commit |
|------|--------|----------|--------|
| 21/01/2026 | 2.1.0 | Core migration Bun TypeScript + Generators | 5e7cbe2 |
| 21/01/2026 | 2.0.0 | Criação do roadmap consolidado | 171361d |
| - | 1.0.0 | Versão inicial do projeto (Dez 2025) | - |

---

**Mantido por:** DevSan A.G.I.  
**Repositório:** https://github.com/Deivisan/Fabrica-de-conteudo

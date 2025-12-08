# 🆓 Serviços de IA Gratuitos

## Visão Geral

Este documento lista todos os serviços de IA que podem ser usados gratuitamente via automação de navegador.

## 📝 Geração de Texto

### Google AI Studio (Gemini)
- **URL**: https://aistudio.google.com
- **Limite**: Generoso (milhares de requisições/dia)
- **Qualidade**: Excelente
- **Suporte**: Texto, código, análise de imagens
- **Automação**: ✅ Fácil

```javascript
// Seletores principais
const SELECTORS = {
  promptInput: 'textarea[aria-label="Type something"]',
  submitButton: 'button[aria-label="Run"]',
  response: '.response-container'
};
```

### ChatGPT Free
- **URL**: https://chat.openai.com
- **Limite**: Limitado (algumas mensagens/hora)
- **Qualidade**: Muito boa
- **Suporte**: Texto, código
- **Automação**: ⚠️ Moderada (captchas frequentes)

### Claude Free
- **URL**: https://claude.ai
- **Limite**: Limitado
- **Qualidade**: Excelente
- **Suporte**: Texto, código, documentos
- **Automação**: ⚠️ Moderada

### Perplexity AI
- **URL**: https://perplexity.ai
- **Limite**: Generoso
- **Qualidade**: Boa (com fontes)
- **Suporte**: Pesquisa, texto
- **Automação**: ✅ Fácil

## 🖼️ Geração de Imagens

### Google AI Studio (Imagen)
- **URL**: https://aistudio.google.com
- **Limite**: Generoso
- **Qualidade**: Excelente
- **Resolução**: Até 1024x1024
- **Automação**: ✅ Fácil

```javascript
// Fluxo de geração
1. Acessar AI Studio
2. Selecionar modelo Gemini com capacidade de imagem
3. Inserir prompt de imagem
4. Aguardar geração
5. Baixar imagem gerada
```

### Bing Image Creator (DALL-E 3)
- **URL**: https://www.bing.com/images/create
- **Limite**: 15 boosts/dia (depois fica lento)
- **Qualidade**: Excelente (DALL-E 3)
- **Resolução**: 1024x1024
- **Automação**: ✅ Fácil

```javascript
const SELECTORS = {
  promptInput: '#sb_form_q',
  submitButton: '#create_btn_c',
  images: '.mimg',
  downloadButton: '.btn_dwnld'
};
```

### Leonardo.ai
- **URL**: https://leonardo.ai
- **Limite**: 150 tokens/dia
- **Qualidade**: Muito boa
- **Resolução**: Variável
- **Automação**: ✅ Fácil

```javascript
const SELECTORS = {
  promptInput: 'textarea[placeholder*="prompt"]',
  generateButton: 'button:has-text("Generate")',
  resultImages: '.generated-image'
};
```

### Ideogram
- **URL**: https://ideogram.ai
- **Limite**: 25 imagens/dia
- **Qualidade**: Excelente (especialmente texto em imagens)
- **Resolução**: Até 1024x1024
- **Automação**: ✅ Fácil

### Playground AI
- **URL**: https://playground.com
- **Limite**: 500 imagens/dia
- **Qualidade**: Boa
- **Resolução**: Variável
- **Automação**: ✅ Fácil

### Craiyon (DALL-E Mini)
- **URL**: https://www.craiyon.com
- **Limite**: Ilimitado (com ads)
- **Qualidade**: Básica
- **Resolução**: 256x256
- **Automação**: ✅ Muito fácil

## 🎬 Geração de Vídeos

### Runway ML
- **URL**: https://runwayml.com
- **Limite**: 125 créditos grátis
- **Qualidade**: Excelente
- **Duração**: Até 4 segundos
- **Automação**: ⚠️ Moderada

### Pika Labs
- **URL**: https://pika.art
- **Limite**: Limitado
- **Qualidade**: Muito boa
- **Duração**: 3 segundos
- **Automação**: ⚠️ Moderada

### Kaiber
- **URL**: https://kaiber.ai
- **Limite**: Créditos iniciais grátis
- **Qualidade**: Boa
- **Automação**: ⚠️ Moderada

## 🎵 Geração de Áudio

### Suno AI
- **URL**: https://suno.ai
- **Limite**: 50 créditos/dia
- **Qualidade**: Excelente
- **Tipo**: Música completa
- **Automação**: ✅ Fácil

### ElevenLabs
- **URL**: https://elevenlabs.io
- **Limite**: 10.000 caracteres/mês
- **Qualidade**: Excelente
- **Tipo**: Text-to-Speech
- **Automação**: ✅ Fácil

## 📊 Comparativo

| Serviço | Tipo | Limite Diário | Qualidade | Facilidade |
|---------|------|---------------|-----------|------------|
| Google AI Studio | Texto/Imagem | Alto | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Bing Image Creator | Imagem | 15 boosts | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Leonardo.ai | Imagem | 150 tokens | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Ideogram | Imagem | 25 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Playground AI | Imagem | 500 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Runway ML | Vídeo | Créditos | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Suno AI | Música | 50 créditos | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🎯 Recomendações por Caso de Uso

### Marketing de Redes Sociais
1. **Imagens**: Bing Image Creator + Leonardo.ai
2. **Textos**: Google AI Studio
3. **Vídeos curtos**: Runway ML

### Conteúdo de Blog
1. **Textos**: Google AI Studio + Perplexity
2. **Imagens de capa**: Ideogram
3. **Infográficos**: Leonardo.ai

### E-commerce
1. **Descrições**: Google AI Studio
2. **Imagens de produto**: Leonardo.ai
3. **Banners**: Bing Image Creator

### YouTube
1. **Roteiros**: Google AI Studio
2. **Thumbnails**: Ideogram (texto em imagens)
3. **Música de fundo**: Suno AI

## ⚠️ Considerações Importantes

1. **Termos de Uso**: Sempre verifique os termos de cada serviço
2. **Rate Limiting**: Respeite os limites para evitar bloqueios
3. **Qualidade**: Serviços gratuitos podem ter filas de espera
4. **Persistência**: Mantenha sessões ativas para evitar re-login
5. **Backup**: Tenha alternativas caso um serviço fique indisponível

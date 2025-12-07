/**
 * Gerador de Conteúdo de Texto
 * Este módulo gera diferentes tipos de conteúdo textual baseado em estratégias
 */

const AIProviderManager = require('../../utils/ai-provider-manager');

class TextGenerator {
  constructor(config) {
    this.config = config;
    this.aiProviderManager = new AIProviderManager(config);
  }

  /**
   * Gera copy para postagens sociais
   */
  async generateSocialPost(strategy, platform, options = {}) {
    const prompt = this.buildSocialPostPrompt(strategy, platform);
    const provider = this.aiProviderManager.selectBestProvider('text', options);
    return await this.aiProviderManager.generateText(prompt, { ...options, provider });
  }

  /**
   * Gera e-mail marketing
   */
  async generateEmail(strategy, options = {}) {
    const prompt = this.buildEmailPrompt(strategy);
    const provider = this.aiProviderManager.selectBestProvider('text', options);
    return await this.aiProviderManager.generateText(prompt, { ...options, provider });
  }

  /**
   * Gera artigo completo
   */
  async generateArticle(strategy, options = {}) {
    const prompt = this.buildArticlePrompt(strategy);
    const provider = this.aiProviderManager.selectBestProvider('text', options);
    return await this.aiProviderManager.generateText(prompt, { ...options, provider });
  }

  /**
   * Gera legenda para vídeos
   */
  async generateVideoCaption(strategy, options = {}) {
    const prompt = this.buildVideoCaptionPrompt(strategy);
    const provider = this.aiProviderManager.selectBestProvider('text', options);
    return await this.aiProviderManager.generateText(prompt, { ...options, provider });
  }

  // Métodos auxiliares para construção de prompts
  buildSocialPostPrompt(strategy, platform) {
    return `
      Escreva uma postagem para ${platform} baseada na seguinte estratégia:
      
      Objetivo: ${strategy.objective || ''}
      Público-alvo: ${strategy.target_audience || ''}
      Estilo: ${strategy.style || ''}
      Hashtags sugeridas: ${strategy.hashtags ? strategy.hashtags.join(', ') : ''}
      Plataforma: ${platform}
      
      Mantenha o texto dentro de 280 caracteres para Twitter/X, ou 2200 para outras plataformas.
    `;
  }

  buildEmailPrompt(strategy) {
    return `
      Escreva um e-mail de marketing com base na seguinte estratégia:
      
      Objetivo: ${strategy.objective || ''}
      Público-alvo: ${strategy.target_audience || ''}
      Estilo: ${strategy.style || ''}
      CTA (Call to Action): ${strategy.cta || ''}
      
      O e-mail deve ter introdução, corpo e fechamento com CTA.
    `;
  }

  buildArticlePrompt(strategy) {
    return `
      Escreva um artigo completo com base na seguinte estratégia:
      
      Título sugerido: ${strategy.title || ''}
      Objetivo: ${strategy.objective || ''}
      Público-alvo: ${strategy.target_audience || ''}
      Estilo: ${strategy.style || ''}
      Palavras-chave: ${strategy.keywords ? strategy.keywords.join(', ') : ''}
      
      O artigo deve ter introdução, desenvolvimento em subtópicos e conclusão.
    `;
  }

  buildVideoCaptionPrompt(strategy) {
    return `
      Escreva uma legenda para vídeo curto com base na seguinte estratégia:
      
      Objetivo: ${strategy.objective || ''}
      Público-alvo: ${strategy.target_audience || ''}
      Estilo: ${strategy.style || ''}
      Duração aproximada: ${strategy.duration || '30-60 segundos'}
      
      A legenda deve ser envolvente e adequada para vídeos curtos em redes sociais.
    `;
  }
}

module.exports = TextGenerator;
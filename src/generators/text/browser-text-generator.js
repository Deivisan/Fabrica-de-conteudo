/**
 * Gerador de Texto via Navegador
 * Integra o módulo de treinamento com o sistema principal
 * Usa IAs gratuitas via automação de navegador
 */

const path = require('path');
const fs = require('fs').promises;

// Importar geradores do módulo de treinamento
let GeminiTextGenerator, GoogleAIStudioAutomation;

try {
  GeminiTextGenerator = require('../../../treinamento/automation/text-generators/gemini-text');
  GoogleAIStudioAutomation = require('../../../treinamento/automation/google-ai-studio');
} catch (error) {
  console.warn('Módulo de treinamento não encontrado. Usando fallback.');
}

class BrowserTextGenerator {
  constructor(config) {
    this.config = config;
    this.assetsDir = config.assetsDir || './assets';
  }

  /**
   * Gera texto usando automação de navegador
   */
  async generateText(prompt, options = {}) {
    if (!GoogleAIStudioAutomation) {
      throw new Error('Módulo de automação não disponível');
    }
    
    console.log(`📝 Gerando texto via navegador...`);
    
    const automation = new GoogleAIStudioAutomation();
    
    try {
      await automation.initialize({ headless: this.config.headless ?? true });
      return await automation.generateText(prompt);
    } finally {
      await automation.close();
    }
  }

  /**
   * Gera post para redes sociais
   */
  async generateSocialPost(strategy, platform, options = {}) {
    if (!GeminiTextGenerator) {
      // Fallback para geração básica
      return await this.generateText(
        `Escreva um post para ${platform} sobre: ${strategy.objective || strategy.title}`
      );
    }
    
    const generator = new GeminiTextGenerator();
    
    try {
      await generator.initialize({ headless: this.config.headless ?? true });
      return await generator.generateSocialPost(
        strategy.objective || strategy.title,
        platform,
        {
          tone: strategy.style,
          targetAudience: strategy.target_audience
        }
      );
    } finally {
      await generator.close();
    }
  }

  /**
   * Gera email marketing
   */
  async generateEmail(strategy, options = {}) {
    if (!GeminiTextGenerator) {
      return await this.generateText(
        `Escreva um email marketing sobre: ${strategy.objective || strategy.title}`
      );
    }
    
    const generator = new GeminiTextGenerator();
    
    try {
      await generator.initialize({ headless: this.config.headless ?? true });
      return await generator.generateEmail(
        strategy.title,
        strategy.objective || 'engajamento',
        {
          tone: strategy.style,
          cta: strategy.cta
        }
      );
    } finally {
      await generator.close();
    }
  }

  /**
   * Gera artigo
   */
  async generateArticle(strategy, options = {}) {
    if (!GeminiTextGenerator) {
      return await this.generateText(
        `Escreva um artigo sobre: ${strategy.objective || strategy.title}`
      );
    }
    
    const generator = new GeminiTextGenerator();
    
    try {
      await generator.initialize({ headless: this.config.headless ?? true });
      return await generator.generateArticle(
        strategy.title || strategy.objective,
        {
          tone: strategy.style,
          targetAudience: strategy.target_audience,
          seoKeywords: strategy.keywords
        }
      );
    } finally {
      await generator.close();
    }
  }

  /**
   * Gera legenda para vídeo
   */
  async generateVideoCaption(strategy, options = {}) {
    const prompt = `Escreva uma legenda envolvente para vídeo sobre: ${strategy.objective || strategy.title}.
      Público-alvo: ${strategy.target_audience || 'geral'}.
      Estilo: ${strategy.style || 'engajador'}.
      Inclua call-to-action e hashtags relevantes.`;
    
    return await this.generateText(prompt);
  }

  /**
   * Gera copy para anúncio
   */
  async generateAdCopy(product, objective, options = {}) {
    if (!GeminiTextGenerator) {
      return await this.generateText(
        `Crie uma copy de anúncio para ${product} com objetivo de ${objective}`
      );
    }
    
    const generator = new GeminiTextGenerator();
    
    try {
      await generator.initialize({ headless: this.config.headless ?? true });
      return await generator.generateAdCopy(product, objective, options);
    } finally {
      await generator.close();
    }
  }

  /**
   * Gera hashtags
   */
  async generateHashtags(topic, platform = 'instagram', count = 30) {
    if (!GeminiTextGenerator) {
      return await this.generateText(
        `Gere ${count} hashtags para ${platform} sobre: ${topic}`
      );
    }
    
    const generator = new GeminiTextGenerator();
    
    try {
      await generator.initialize({ headless: this.config.headless ?? true });
      return await generator.generateHashtags(topic, platform, count);
    } finally {
      await generator.close();
    }
  }

  /**
   * Verifica se o módulo de automação está disponível
   */
  isAvailable() {
    return !!(GeminiTextGenerator || GoogleAIStudioAutomation);
  }
}

module.exports = BrowserTextGenerator;

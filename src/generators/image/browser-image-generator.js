/**
 * Gerador de Imagens via Navegador
 * Integra o módulo de treinamento com o sistema principal
 * Usa IAs gratuitas via automação de navegador
 */

const path = require('path');
const fs = require('fs').promises;

// Importar geradores do módulo de treinamento
let GeminiImageGenerator, BingImageCreatorAutomation, LeonardoAIAutomation;

try {
  GeminiImageGenerator = require('../../../treinamento/automation/image-generators/gemini-image');
  BingImageCreatorAutomation = require('../../../treinamento/automation/image-generators/bing-image-creator');
  LeonardoAIAutomation = require('../../../treinamento/automation/image-generators/leonardo-ai');
} catch (error) {
  console.warn('Módulo de treinamento não encontrado. Usando fallback.');
}

class BrowserImageGenerator {
  constructor(config) {
    this.config = config;
    this.assetsDir = config.assetsDir || './assets';
    this.currentGenerator = null;
    this.preferredService = config.preferredImageService || 'gemini';
  }

  /**
   * Gera imagem usando o serviço preferido
   */
  async generateImage(prompt, options = {}) {
    const service = options.service || this.preferredService;
    
    console.log(`🖼️ Gerando imagem via navegador (${service})...`);
    
    try {
      switch (service) {
        case 'gemini':
        case 'google':
          return await this.generateWithGemini(prompt, options);
          
        case 'bing':
        case 'dalle':
          return await this.generateWithBing(prompt, options);
          
        case 'leonardo':
          return await this.generateWithLeonardo(prompt, options);
          
        default:
          // Tentar todos os serviços em ordem de preferência
          return await this.generateWithFallback(prompt, options);
      }
    } catch (error) {
      console.error(`Erro ao gerar imagem com ${service}:`, error.message);
      
      // Tentar fallback
      if (options.fallback !== false) {
        return await this.generateWithFallback(prompt, { ...options, exclude: service });
      }
      
      throw error;
    }
  }

  /**
   * Gera imagem com Google Gemini
   */
  async generateWithGemini(prompt, options = {}) {
    if (!GeminiImageGenerator) {
      throw new Error('GeminiImageGenerator não disponível');
    }
    
    const generator = new GeminiImageGenerator();
    
    try {
      await generator.initialize({ headless: this.config.headless ?? true });
      
      if (options.platform) {
        return await generator.generateForSocialMedia(prompt, options.platform, options);
      } else if (options.variations) {
        return await generator.generateVariations(prompt, options.variations, options);
      } else {
        return await generator.generate(prompt, options);
      }
    } finally {
      await generator.close();
    }
  }

  /**
   * Gera imagem com Bing Image Creator
   */
  async generateWithBing(prompt, options = {}) {
    if (!BingImageCreatorAutomation) {
      throw new Error('BingImageCreatorAutomation não disponível');
    }
    
    const generator = new BingImageCreatorAutomation();
    
    try {
      await generator.initialize({ headless: this.config.headless ?? true });
      const results = await generator.generateImages(prompt, options);
      return results[0]; // Retorna primeira imagem
    } finally {
      await generator.close();
    }
  }

  /**
   * Gera imagem com Leonardo.ai
   */
  async generateWithLeonardo(prompt, options = {}) {
    if (!LeonardoAIAutomation) {
      throw new Error('LeonardoAIAutomation não disponível');
    }
    
    const generator = new LeonardoAIAutomation();
    
    try {
      await generator.initialize({ headless: this.config.headless ?? true });
      const results = await generator.generateImages(prompt, options);
      return results[0]; // Retorna primeira imagem
    } finally {
      await generator.close();
    }
  }

  /**
   * Tenta gerar com fallback para outros serviços
   */
  async generateWithFallback(prompt, options = {}) {
    const services = ['gemini', 'bing', 'leonardo'].filter(s => s !== options.exclude);
    
    for (const service of services) {
      try {
        console.log(`   Tentando ${service}...`);
        return await this.generateImage(prompt, { ...options, service, fallback: false });
      } catch (error) {
        console.log(`   ${service} falhou: ${error.message}`);
      }
    }
    
    throw new Error('Todos os serviços de imagem falharam');
  }

  /**
   * Gera banner para redes sociais
   */
  async generateSocialBanner(strategy, platform, options = {}) {
    const prompt = this.buildImagePrompt(strategy, platform, 'banner');
    return await this.generateImage(prompt, { ...options, platform });
  }

  /**
   * Gera post para Instagram
   */
  async generateInstagramPost(strategy, options = {}) {
    const prompt = this.buildImagePrompt(strategy, 'instagram', 'post');
    return await this.generateImage(prompt, { ...options, platform: 'instagram' });
  }

  /**
   * Gera stories
   */
  async generateStories(strategy, platform, options = {}) {
    const prompt = this.buildImagePrompt(strategy, platform, 'stories');
    return await this.generateImage(prompt, { ...options, platform: 'instagramStory' });
  }

  /**
   * Gera thumbnail
   */
  async generateThumbnail(strategy, videoTitle, options = {}) {
    const prompt = this.buildThumbnailPrompt(strategy, videoTitle);
    return await this.generateImage(prompt, { ...options, platform: 'youtube' });
  }

  /**
   * Constrói prompt de imagem baseado na estratégia
   */
  buildImagePrompt(strategy, platform, type) {
    let prompt = `Create a ${type} image for ${platform}. `;
    
    if (strategy.visual_style) {
      prompt += `Style: ${strategy.visual_style}. `;
    }
    
    if (strategy.brand_colors && strategy.brand_colors.length > 0) {
      prompt += `Colors: ${strategy.brand_colors.join(', ')}. `;
    }
    
    if (strategy.objective) {
      prompt += `Purpose: ${strategy.objective}. `;
    }
    
    if (strategy.target_audience) {
      prompt += `Target audience: ${strategy.target_audience}. `;
    }
    
    prompt += 'High quality, professional, modern design.';
    
    return prompt;
  }

  /**
   * Constrói prompt de thumbnail
   */
  buildThumbnailPrompt(strategy, videoTitle) {
    return `Create an engaging YouTube thumbnail for video titled "${videoTitle}".
      Style: ${strategy.visual_style || 'bold and eye-catching'}.
      Colors: ${strategy.brand_colors ? strategy.brand_colors.join(', ') : 'vibrant'}.
      Include space for text overlay. High contrast, attention-grabbing.`;
  }

  /**
   * Verifica se o módulo de automação está disponível
   */
  isAvailable() {
    return !!(GeminiImageGenerator || BingImageCreatorAutomation || LeonardoAIAutomation);
  }

  /**
   * Lista serviços disponíveis
   */
  getAvailableServices() {
    const services = [];
    if (GeminiImageGenerator) services.push('gemini');
    if (BingImageCreatorAutomation) services.push('bing');
    if (LeonardoAIAutomation) services.push('leonardo');
    return services;
  }
}

module.exports = BrowserImageGenerator;

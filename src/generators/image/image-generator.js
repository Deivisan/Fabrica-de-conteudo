/**
 * Gerador de Conteúdo de Imagem
 * Este módulo gera diferentes tipos de conteúdo visual baseado em estratégias
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const AIProviderManager = require('../../utils/ai-provider-manager');

class ImageGenerator {
  constructor(config) {
    this.config = config;
    this.aiProviderManager = new AIProviderManager(config);
    this.assetsDir = config.assetsDir || './assets';
  }

  /**
   * Gera banner para redes sociais
   */
  async generateSocialBanner(strategy, platform, options = {}) {
    const prompt = this.buildImagePrompt(strategy, platform, 'banner');
    const provider = this.aiProviderManager.selectBestProvider('image', options);

    try {
      // Para provedores que geram imagem diretamente
      const imageUrl = await this.aiProviderManager.generateImage(prompt, {
        ...options,
        provider,
        size: options.size || `${this.getOptimalWidth(platform, 'banner')}x${this.getOptimalHeight(platform, 'banner')}`
      });

      // Baixa e salva a imagem localmente
      return await this.downloadImage(imageUrl, 'banner');
    } catch (error) {
      console.error('Erro ao gerar banner:', error);
      // Se falhar com provedor de imagem, tenta usar um modelo de texto para descrever a imagem
      const textDescription = await this.aiProviderManager.generateImage(prompt, {
        ...options,
        provider: 'google' // Usando Google para gerar descrição de imagem
      });

      // Em último caso, pode-se usar uma técnica de geração local ou placeholder
      return this.generatePlaceholderImage(textDescription, platform, 'banner');
    }
  }

  /**
   * Gera post quadrado para Instagram
   */
  async generateInstagramPost(strategy, options = {}) {
    const prompt = this.buildImagePrompt(strategy, 'instagram', 'post');
    const provider = this.aiProviderManager.selectBestProvider('image', options);

    try {
      const imageUrl = await this.aiProviderManager.generateImage(prompt, {
        ...options,
        provider,
        size: options.size || '1080x1080'
      });

      return await this.downloadImage(imageUrl, 'instagram_post');
    } catch (error) {
      console.error('Erro ao gerar post do Instagram:', error);
      return this.generatePlaceholderImage(prompt, 'instagram', 'post');
    }
  }

  /**
   * Gera stories para Instagram/WhatsApp
   */
  async generateStories(strategy, platform, options = {}) {
    const prompt = this.buildImagePrompt(strategy, platform, 'stories');
    const provider = this.aiProviderManager.selectBestProvider('image', options);

    try {
      const imageUrl = await this.aiProviderManager.generateImage(prompt, {
        ...options,
        provider,
        size: options.size || '1080x1920'
      });

      return await this.downloadImage(imageUrl, 'stories');
    } catch (error) {
      console.error('Erro ao gerar stories:', error);
      return this.generatePlaceholderImage(prompt, platform, 'stories');
    }
  }

  /**
   * Gera imagem para cabeçalho de e-mail
   */
  async generateEmailHeader(strategy, options = {}) {
    const prompt = this.buildImagePrompt(strategy, 'email', 'header');
    const provider = this.aiProviderManager.selectBestProvider('image', options);

    try {
      const imageUrl = await this.aiProviderManager.generateImage(prompt, {
        ...options,
        provider,
        size: options.size || '600x300'
      });

      return await this.downloadImage(imageUrl, 'email_header');
    } catch (error) {
      console.error('Erro ao gerar cabeçalho de e-mail:', error);
      return this.generatePlaceholderImage(prompt, 'email', 'header');
    }
  }

  /**
   * Gera thumbnail para vídeo
   */
  async generateThumbnail(strategy, videoTitle, options = {}) {
    const prompt = this.buildThumbnailPrompt(strategy, videoTitle);
    const provider = this.aiProviderManager.selectBestProvider('image', options);

    try {
      const imageUrl = await this.aiProviderManager.generateImage(prompt, {
        ...options,
        provider,
        size: options.size || '1280x720'
      });

      return await this.downloadImage(imageUrl, 'thumbnail');
    } catch (error) {
      console.error('Erro ao gerar thumbnail:', error);
      return this.generatePlaceholderImage(prompt, 'video', 'thumbnail');
    }
  }

  // Métodos auxiliares
  buildImagePrompt(strategy, platform, type) {
    let baseDescription = `Create a ${type} image for ${platform} `;

    if (strategy.visual_style) {
      baseDescription += `in ${strategy.visual_style} style `;
    }

    if (strategy.brand_colors) {
      baseDescription += `using brand colors: ${strategy.brand_colors.join(', ')} `;
    }

    baseDescription += `with elements related to: ${strategy.objective || ''}. `;

    if (strategy.mood) {
      baseDescription += `The mood should be ${strategy.mood}. `;
    }

    if (strategy.products) {
      baseDescription += `Include representations of products: ${strategy.products.join(', ')}. `;
    }

    return baseDescription.trim();
  }

  buildThumbnailPrompt(strategy, videoTitle) {
    return `Create an engaging YouTube-style thumbnail for video titled "${videoTitle}" based on this strategy:
    Objective: ${strategy.objective || ''},
    Target audience: ${strategy.target_audience || ''},
    Style: ${strategy.visual_style || ''},
    Colors: ${strategy.brand_colors ? strategy.brand_colors.join(', ') : ''}.
    Include contrasting colors, bold typography space if needed, and attractive elements that would encourage clicks.`;
  }

  /**
   * Baixa imagem de URL e salva localmente
   */
  async downloadImage(imageUrl, type) {
    try {
      // Cria diretório de assets se não existir
      await fs.mkdir(path.join(this.assetsDir, 'images'), { recursive: true });

      // Gera nome de arquivo único
      const filename = `${type}_${Date.now()}_${uuidv4().slice(0, 8)}.jpg`;
      const filepath = path.join(this.assetsDir, 'images', filename);

      // Faz download da imagem
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filepath));
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('Erro ao baixar imagem:', error);
      throw error;
    }
  }

  /**
   * Gera imagem placeholder quando a geração falha
   */
  async generatePlaceholderImage(description, platform, type) {
    // Em um ambiente real, você pode usar bibliotecas como Canvas ou Sharp
    // para gerar imagens programaticamente como fallback
    console.log(`Gerando imagem placeholder para: ${description.substring(0, 50)}...`);

    // Cria diretório de assets se não existir
    await fs.mkdir(path.join(this.assetsDir, 'images'), { recursive: true });

    // Gera nome de arquivo único
    const filename = `placeholder_${type}_${Date.now()}_${uuidv4().slice(0, 8)}.jpg`;
    const filepath = path.join(this.assetsDir, 'images', filename);

    // Em um caso real, geraríamos uma imagem real com texto descritivo
    // Por enquanto, retornamos um caminho de placeholder
    console.log(`Imagem placeholder criada em: ${filepath}`);
    return filepath;
  }

  getOptimalWidth(platform, type) {
    const dimensions = {
      'facebook': {
        'banner': 1500,
        'post': 1200
      },
      'instagram': {
        'banner': 1500,
        'post': 1080,
        'stories': 1080
      },
      'twitter': {
        'banner': 1500,
        'post': 1200
      },
      'linkedin': {
        'banner': 1584,
        'post': 1200
      }
    };

    return dimensions[platform] && dimensions[platform][type] ? dimensions[platform][type] : 1200;
  }

  getOptimalHeight(platform, type) {
    const dimensions = {
      'facebook': {
        'banner': 400,
        'post': 630
      },
      'instagram': {
        'banner': 400,
        'post': 1080,
        'stories': 1920
      },
      'twitter': {
        'banner': 500,
        'post': 600
      },
      'linkedin': {
        'banner': 396,
        'post': 630
      }
    };

    return dimensions[platform] && dimensions[platform][type] ? dimensions[platform][type] : 630;
  }

  /**
   * Aplica overlay de marca d'água ou elementos de branding
   */
  async applyBranding(imagePath, brandElements) {
    // Esta função seria implementada com uma biblioteca como Sharp
    // para manipulação de imagens
    console.log(`Applying branding to ${imagePath}`);
    // Implementação real usaria Sharp ou similar
    return imagePath;
  }
}

module.exports = ImageGenerator;
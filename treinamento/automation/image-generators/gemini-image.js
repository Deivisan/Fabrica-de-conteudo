/**
 * Gerador de Imagens via Google Gemini
 * Wrapper especializado para geração de imagens
 */

const GoogleAIStudioAutomation = require('../google-ai-studio');
const fs = require('fs').promises;
const path = require('path');

class GeminiImageGenerator {
  constructor() {
    this.automation = new GoogleAIStudioAutomation();
    this.outputDir = path.join(__dirname, '../../../assets/generated/gemini');
  }

  /**
   * Inicializa o gerador
   */
  async initialize(options = {}) {
    await this.automation.initialize(options);
    await fs.mkdir(this.outputDir, { recursive: true });
    return this;
  }

  /**
   * Gera imagem com prompt otimizado
   */
  async generate(prompt, options = {}) {
    // Otimizar prompt para melhor resultado
    const optimizedPrompt = this.optimizePrompt(prompt, options);
    
    console.log(`🎨 Prompt otimizado: "${optimizedPrompt.substring(0, 80)}..."`);
    
    return await this.automation.generateImage(optimizedPrompt, {
      filename: options.filename || `gemini_${Date.now()}.png`
    });
  }

  /**
   * Gera múltiplas variações
   */
  async generateVariations(prompt, count = 4, options = {}) {
    const results = [];
    const variations = this.createVariations(prompt, count);
    
    for (let i = 0; i < variations.length; i++) {
      console.log(`\n📸 Gerando variação ${i + 1}/${count}...`);
      
      try {
        const result = await this.automation.generateImage(variations[i], {
          filename: `gemini_var${i + 1}_${Date.now()}.png`
        });
        results.push(result);
        
        // Delay entre gerações
        if (i < variations.length - 1) {
          await this.wait(3000);
        }
      } catch (error) {
        console.log(`   ⚠️ Erro na variação ${i + 1}: ${error.message}`);
      }
    }
    
    return results;
  }

  /**
   * Gera imagem para redes sociais
   */
  async generateForSocialMedia(prompt, platform, options = {}) {
    const platformSpecs = {
      instagram: {
        aspectRatio: '1:1',
        style: 'vibrant, eye-catching, social media ready',
        size: '1080x1080'
      },
      instagramStory: {
        aspectRatio: '9:16',
        style: 'vertical, mobile-friendly, engaging',
        size: '1080x1920'
      },
      facebook: {
        aspectRatio: '16:9',
        style: 'professional, shareable',
        size: '1200x630'
      },
      twitter: {
        aspectRatio: '16:9',
        style: 'attention-grabbing, clean',
        size: '1200x675'
      },
      linkedin: {
        aspectRatio: '1.91:1',
        style: 'professional, corporate',
        size: '1200x627'
      },
      youtube: {
        aspectRatio: '16:9',
        style: 'thumbnail, bold text space, clickbait-worthy',
        size: '1280x720'
      }
    };

    const spec = platformSpecs[platform] || platformSpecs.instagram;
    
    const socialPrompt = `${prompt}. 
      Style: ${spec.style}. 
      Aspect ratio: ${spec.aspectRatio}. 
      High quality, ${spec.size} resolution.`;
    
    return await this.generate(socialPrompt, {
      ...options,
      filename: `${platform}_${Date.now()}.png`
    });
  }

  /**
   * Gera banner para campanha
   */
  async generateCampaignBanner(strategy, options = {}) {
    const prompt = this.buildCampaignPrompt(strategy);
    return await this.generate(prompt, options);
  }

  /**
   * Constrói prompt baseado em estratégia
   */
  buildCampaignPrompt(strategy) {
    let prompt = 'Create a marketing banner image';
    
    if (strategy.title) {
      prompt += ` for "${strategy.title}"`;
    }
    
    if (strategy.objective) {
      prompt += `. Purpose: ${strategy.objective}`;
    }
    
    if (strategy.target_audience) {
      prompt += `. Target audience: ${strategy.target_audience}`;
    }
    
    if (strategy.visual_style) {
      prompt += `. Visual style: ${strategy.visual_style}`;
    }
    
    if (strategy.brand_colors && strategy.brand_colors.length > 0) {
      prompt += `. Use colors: ${strategy.brand_colors.join(', ')}`;
    }
    
    prompt += '. High quality, professional, modern design.';
    
    return prompt;
  }

  /**
   * Otimiza prompt para melhores resultados
   */
  optimizePrompt(prompt, options = {}) {
    let optimized = prompt;
    
    // Adicionar qualidade
    if (!prompt.toLowerCase().includes('quality')) {
      optimized += ', high quality';
    }
    
    // Adicionar estilo se especificado
    if (options.style) {
      optimized += `, ${options.style} style`;
    }
    
    // Adicionar iluminação
    if (options.lighting) {
      optimized += `, ${options.lighting} lighting`;
    }
    
    // Adicionar detalhes
    if (options.detailed) {
      optimized += ', highly detailed, intricate';
    }
    
    return optimized;
  }

  /**
   * Cria variações do prompt
   */
  createVariations(prompt, count) {
    const styles = [
      'photorealistic',
      'digital art',
      'illustration',
      'cinematic',
      'minimalist',
      'vibrant colors',
      'soft lighting',
      'dramatic'
    ];
    
    const variations = [prompt]; // Original
    
    for (let i = 1; i < count && i < styles.length; i++) {
      variations.push(`${prompt}, ${styles[i]} style`);
    }
    
    return variations.slice(0, count);
  }

  /**
   * Utilitário de espera
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fecha o gerador
   */
  async close() {
    await this.automation.close();
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  (async () => {
    const generator = new GeminiImageGenerator();
    
    try {
      await generator.initialize({ headless: false });
      
      if (args[0] === '--social' && args[1] && args[2]) {
        const platform = args[1];
        const prompt = args.slice(2).join(' ');
        const result = await generator.generateForSocialMedia(prompt, platform);
        console.log('\n🖼️ Imagem salva:', result);
      } else if (args[0] === '--variations' && args[1]) {
        const prompt = args.slice(1).join(' ');
        const results = await generator.generateVariations(prompt, 4);
        console.log('\n🖼️ Variações salvas:');
        results.forEach(p => console.log(`   ${p}`));
      } else if (args.length > 0) {
        const prompt = args.join(' ');
        const result = await generator.generate(prompt);
        console.log('\n🖼️ Imagem salva:', result);
      } else {
        console.log(`
Uso: node gemini-image.js [opção] [prompt]

Opções:
  [prompt]                      Gerar imagem simples
  --social [platform] [prompt]  Gerar para rede social
  --variations [prompt]         Gerar 4 variações

Plataformas: instagram, instagramStory, facebook, twitter, linkedin, youtube

Exemplos:
  node gemini-image.js "Um café aconchegante em dia de chuva"
  node gemini-image.js --social instagram "Promoção de verão"
  node gemini-image.js --variations "Paisagem futurista"
        `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      await generator.close();
    }
  })();
}

module.exports = GeminiImageGenerator;

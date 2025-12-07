/**
 * Agente Principal de Geração de Conteúdo
 * Coordena todos os geradores com base nas estratégias extraídas
 */

const TextGenerator = require('../generators/text/text-generator');
const ImageGenerator = require('../generators/image/image-generator');
const VideoGenerator = require('../generators/video/video-generator');
const WebsiteGenerator = require('../generators/website/website-generator');
const MdParser = require('../parser/md-parser');
const AIProviderManager = require('../utils/ai-provider-manager');

class ContentAgent {
  constructor(config) {
    this.config = config;
    this.parser = new MdParser(config);

    // Inicializa o gerenciador de provedores de IA
    this.aiProviderManager = new AIProviderManager(config);

    // Inicializa os geradores com configuração
    this.textGenerator = new TextGenerator(config);
    this.imageGenerator = new ImageGenerator(config);
    this.videoGenerator = new VideoGenerator(config);
    this.websiteGenerator = new WebsiteGenerator(config);
  }

  /**
   * Processa uma estratégia e gera todo o conteúdo necessário
   */
  async processStrategy(strategy) {
    console.log(`Processando estratégia: ${strategy.title || 'Sem título'}`);
    
    const results = {
      strategy_id: strategy.id || Date.now().toString(),
      strategy_title: strategy.title,
      generated_content: [],
      created_at: new Date().toISOString()
    };

    try {
      // Geração de texto
      if (this.shouldGenerate('text', strategy)) {
        const textResults = await this.generateTextContent(strategy);
        results.generated_content.push(...textResults);
      }

      // Geração de imagem
      if (this.shouldGenerate('image', strategy)) {
        const imageResults = await this.generateImageContent(strategy);
        results.generated_content.push(...imageResults);
      }

      // Geração de vídeo
      if (this.shouldGenerate('video', strategy)) {
        const videoResults = await this.generateVideoContent(strategy);
        results.generated_content.push(...videoResults);
      }

      // Geração de website
      if (this.shouldGenerate('website', strategy)) {
        const websiteResults = await this.generateWebsiteContent(strategy);
        results.generated_content.push(...websiteResults);
      }

      console.log(`Estratégia processada com sucesso: ${strategy.title || 'Sem título'}`);
      return results;
    } catch (error) {
      console.error(`Erro ao processar estratégia: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gera todo o conteúdo de texto para a estratégia
   */
  async generateTextContent(strategy) {
    const results = [];
    
    // Verifica se a estratégia especifica tipos de conteúdo de texto
    const textTypes = strategy.content_types?.filter(type => 
      ['text', 'texto', 'copy', 'email', 'post', 'article'].includes(type.toLowerCase())
    ) || ['post'];
    
    for (const type of textTypes) {
      try {
        let content;
        
        switch (type.toLowerCase()) {
          case 'social post':
          case 'post':
            content = await this.textGenerator.generateSocialPost(
              strategy, 
              strategy.platforms?.[0] || 'instagram'
            );
            break;
            
          case 'email':
            content = await this.textGenerator.generateEmail(strategy);
            break;
            
          case 'article':
          case 'artigo':
            content = await this.textGenerator.generateArticle(strategy);
            break;
            
          case 'video caption':
          case 'legenda de video':
          case 'legenda de vídeo':
            content = await this.textGenerator.generateVideoCaption(strategy);
            break;
            
          default:
            // Padrão: post social
            content = await this.textGenerator.generateSocialPost(
              strategy, 
              strategy.platforms?.[0] || 'instagram'
            );
        }
        
        results.push({
          type: 'text',
          subtype: type,
          content: content,
          platform: strategy.platforms?.[0] || 'all',
          generated_at: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Erro ao gerar conteúdo de texto (${type}):`, error);
      }
    }
    
    return results;
  }

  /**
   * Gera todo o conteúdo de imagem para a estratégia
   */
  async generateImageContent(strategy) {
    const results = [];
    
    // Verifica se a estratégia especifica tipos de conteúdo de imagem
    const imageTypes = strategy.content_types?.filter(type => 
      ['image', 'imagem', 'banner', 'post', 'stories', 'thumbnail'].includes(type.toLowerCase())
    ) || ['banner'];
    
    for (const type of imageTypes) {
      try {
        let content;
        
        switch (type.toLowerCase()) {
          case 'social banner':
          case 'banner':
            for (const platform of strategy.platforms || ['instagram']) {
              content = await this.imageGenerator.generateSocialBanner(strategy, platform);
              results.push({
                type: 'image',
                subtype: 'banner',
                platform: platform,
                path: content,
                generated_at: new Date().toISOString()
              });
            }
            break;
            
          case 'instagram post':
          case 'post':
            content = await this.imageGenerator.generateInstagramPost(strategy);
            results.push({
              type: 'image',
              subtype: 'instagram_post',
              platform: 'instagram',
              path: content,
              generated_at: new Date().toISOString()
            });
            break;
            
          case 'stories':
            for (const platform of strategy.platforms || ['instagram']) {
              content = await this.imageGenerator.generateStories(strategy, platform);
              results.push({
                type: 'image',
                subtype: 'stories',
                platform: platform,
                path: content,
                generated_at: new Date().toISOString()
              });
            }
            break;
            
          case 'thumbnail':
            content = await this.imageGenerator.generateThumbnail(strategy, strategy.title || 'Vídeo');
            results.push({
              type: 'image',
              subtype: 'thumbnail',
              platform: 'video',
              path: content,
              generated_at: new Date().toISOString()
            });
            break;
            
          default:
            // Padrão: banner
            for (const platform of strategy.platforms || ['instagram']) {
              content = await this.imageGenerator.generateSocialBanner(strategy, platform);
              results.push({
                type: 'image',
                subtype: 'banner',
                platform: platform,
                path: content,
                generated_at: new Date().toISOString()
              });
            }
        }
      } catch (error) {
        console.error(`Erro ao gerar conteúdo de imagem (${type}):`, error);
      }
    }
    
    return results;
  }

  /**
   * Gera todo o conteúdo de vídeo para a estratégia
   */
  async generateVideoContent(strategy) {
    const results = [];
    
    // Verifica se a estratégia especifica tipos de conteúdo de vídeo
    const videoTypes = strategy.content_types?.filter(type => 
      ['video', 'vídeo', 'short', 'reels', 'story'].includes(type.toLowerCase())
    ) || [];
    
    if (videoTypes.length > 0) {
      try {
        // Coleta assets relacionados para usar no vídeo
        const assets = await this.collectVideoAssets(strategy);
        
        // Gera vídeo curto
        const videoPath = await this.videoGenerator.generateShortVideo(strategy, assets);
        
        results.push({
          type: 'video',
          subtype: 'short',
          path: videoPath,
          platform: strategy.platforms?.[0] || 'all',
          generated_at: new Date().toISOString()
        });
      } catch (error) {
        console.error('Erro ao gerar conteúdo de vídeo:', error);
      }
    }
    
    return results;
  }

  /**
   * Gera conteúdo de website para a estratégia
   */
  async generateWebsiteContent(strategy) {
    const results = [];
    
    // Verifica se a estratégia especifica tipos de conteúdo de website
    const websiteTypes = strategy.content_types?.filter(type => 
      ['website', 'site', 'landing', 'page', 'microsite'].includes(type.toLowerCase())
    ) || [];
    
    if (websiteTypes.length > 0) {
      try {
        let websitePath;
        
        if (websiteTypes.includes('microsite') || websiteTypes.includes('site')) {
          // Gera microsite com múltiplas páginas
          websitePath = await this.websiteGenerator.generateMicrosite(strategy);
        } else if (websiteTypes.includes('landing') || websiteTypes.includes('page')) {
          // Gera landing page
          websitePath = await this.websiteGenerator.generateLandingPage(strategy);
        }
        
        if (websitePath) {
          results.push({
            type: 'website',
            subtype: websiteTypes.includes('microsite') ? 'microsite' : 'landing_page',
            path: websitePath,
            generated_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Erro ao gerar conteúdo de website:', error);
      }
    }
    
    return results;
  }

  /**
   * Coleta assets para uso em vídeos
   */
  async collectVideoAssets(strategy) {
    // Por enquanto, retorna um array vazio
    // Futuramente, pode coletar imagens geradas ou assets específicos
    return [];
  }

  /**
   * Determina se deve gerar um tipo específico de conteúdo
   */
  shouldGenerate(contentType, strategy) {
    if (!strategy.content_types || strategy.content_types.length === 0) {
      // Se não houver tipos específicos, gera todos
      return true;
    }
    
    const typeMap = {
      'text': ['text', 'texto', 'copy', 'email', 'post', 'article'],
      'image': ['image', 'imagem', 'banner', 'post', 'stories', 'thumbnail'],
      'video': ['video', 'vídeo', 'short', 'reels', 'story'],
      'website': ['website', 'site', 'landing', 'page', 'microsite']
    };
    
    const allowedTypes = typeMap[contentType] || [contentType];
    
    return strategy.content_types.some(stype => 
      allowedTypes.includes(stype.toLowerCase())
    );
  }

  /**
   * Processa um arquivo de estratégia diretamente
   */
  async processStrategyFile(filePath) {
    try {
      const strategy = await this.parser.parseStrategyFile(filePath);
      return await this.processStrategy(strategy);
    } catch (error) {
      console.error(`Erro ao processar arquivo de estratégia ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Processa todos os arquivos de estratégia em um diretório
   */
  async processAllStrategies() {
    try {
      const strategies = await this.parser.parseAllStrategies();
      const results = [];
      
      for (const strategy of strategies) {
        const result = await this.processStrategy(strategy);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('Erro ao processar todas as estratégias:', error);
      throw error;
    }
  }

  /**
   * Salva resultados em um arquivo de log
   */
  async saveResults(results, outputPath = null) {
    const fs = require('fs').promises;
    const path = require('path');
    
    const outputDir = outputPath || path.join(this.config.assetsDir || './assets', 'results');
    await fs.mkdir(outputDir, { recursive: true });
    
    const timestamp = Date.now();
    const resultsPath = path.join(outputDir, `generation_results_${timestamp}.json`);
    
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`Resultados salvos em: ${resultsPath}`);
    
    return resultsPath;
  }
}

module.exports = ContentAgent;
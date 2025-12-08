/**
 * MCP Training Module - Módulo Principal
 * Integração de todos os geradores de conteúdo via automação de navegador
 */

const BrowserSessionManager = require('./automation/browser-session-manager');
const GoogleAIStudioAutomation = require('./automation/google-ai-studio');
const GeminiTextGenerator = require('./automation/text-generators/gemini-text');
const GeminiImageGenerator = require('./automation/image-generators/gemini-image');
const BingImageCreatorAutomation = require('./automation/image-generators/bing-image-creator');
const LeonardoAIAutomation = require('./automation/image-generators/leonardo-ai');
const RunwayFreeAutomation = require('./automation/video-generators/runway-free');
const servicesConfig = require('./config/services.json');
const fs = require('fs').promises;
const path = require('path');

class MCPAutomation {
  constructor(options = {}) {
    this.options = {
      headless: options.headless ?? false,
      outputDir: options.outputDir || path.join(__dirname, '../assets/generated'),
      ...options
    };
    
    this.sessionManager = null;
    this.generators = {};
    this.initialized = false;
  }

  /**
   * Inicializa o módulo de automação
   */
  async initialize() {
    console.log('\n🚀 Inicializando MCP Automation...');
    
    // Criar diretórios necessários
    await fs.mkdir(this.options.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.options.outputDir, 'images'), { recursive: true });
    await fs.mkdir(path.join(this.options.outputDir, 'videos'), { recursive: true });
    await fs.mkdir(path.join(this.options.outputDir, 'text'), { recursive: true });
    
    // Inicializar gerenciador de sessão
    this.sessionManager = new BrowserSessionManager();
    
    this.initialized = true;
    console.log('✅ MCP Automation inicializado!');
    
    return this;
  }

  /**
   * Configura sessões (login manual)
   */
  async setupSessions() {
    if (!this.sessionManager) {
      this.sessionManager = new BrowserSessionManager();
    }
    await this.sessionManager.setupSession();
  }

  /**
   * Verifica status das sessões
   */
  async checkSessions() {
    if (!this.sessionManager) {
      this.sessionManager = new BrowserSessionManager();
    }
    return await this.sessionManager.checkAllSessions();
  }

  /**
   * Gera texto usando o melhor serviço disponível
   */
  async generateText(prompt, options = {}) {
    const generator = new GeminiTextGenerator();
    
    try {
      await generator.initialize({ headless: this.options.headless });
      
      if (options.type === 'post') {
        return await generator.generateSocialPost(prompt, options.platform || 'instagram', options);
      } else if (options.type === 'email') {
        return await generator.generateEmail(prompt, options.purpose || 'engajamento', options);
      } else if (options.type === 'article') {
        return await generator.generateArticle(prompt, options);
      } else if (options.type === 'ad') {
        return await generator.generateAdCopy(prompt, options.objective || 'vendas', options);
      } else {
        // Geração genérica
        const automation = new GoogleAIStudioAutomation();
        await automation.initialize({ headless: this.options.headless });
        const result = await automation.generateText(prompt);
        await automation.close();
        return result;
      }
    } finally {
      await generator.close();
    }
  }

  /**
   * Gera imagem usando o serviço especificado ou o melhor disponível
   */
  async generateImage(prompt, options = {}) {
    const service = options.service || 'gemini';
    
    let generator;
    
    switch (service) {
      case 'gemini':
      case 'google':
        generator = new GeminiImageGenerator();
        await generator.initialize({ headless: this.options.headless });
        
        if (options.platform) {
          return await generator.generateForSocialMedia(prompt, options.platform, options);
        } else if (options.variations) {
          return await generator.generateVariations(prompt, options.variations, options);
        } else {
          return await generator.generate(prompt, options);
        }
        
      case 'bing':
      case 'dalle':
        generator = new BingImageCreatorAutomation();
        await generator.initialize({ headless: this.options.headless });
        return await generator.generateImages(prompt, options);
        
      case 'leonardo':
        generator = new LeonardoAIAutomation();
        await generator.initialize({ headless: this.options.headless });
        return await generator.generateImages(prompt, options);
        
      default:
        throw new Error(`Serviço de imagem não suportado: ${service}`);
    }
  }

  /**
   * Gera vídeo usando o serviço especificado
   */
  async generateVideo(prompt, options = {}) {
    const service = options.service || 'runway';
    
    let generator;
    
    switch (service) {
      case 'runway':
        generator = new RunwayFreeAutomation();
        await generator.initialize({ headless: this.options.headless });
        
        if (options.imagePath) {
          return await generator.generateFromImage(options.imagePath, prompt, options);
        } else {
          return await generator.generateFromText(prompt, options);
        }
        
      default:
        throw new Error(`Serviço de vídeo não suportado: ${service}`);
    }
  }

  /**
   * Gera campanha completa
   */
  async generateCampaign(strategy, options = {}) {
    const CampaignGenerator = require('./examples/full-campaign');
    const generator = new CampaignGenerator();
    
    try {
      await generator.initialize();
      
      if (typeof strategy === 'string' && strategy.endsWith('.md')) {
        return await generator.generateFromStrategy(strategy);
      } else {
        return await generator.generateQuickCampaign(strategy, options.platforms);
      }
    } finally {
      await generator.close();
    }
  }

  /**
   * Lista serviços disponíveis
   */
  getAvailableServices() {
    return servicesConfig;
  }

  /**
   * Obtém informações de um serviço
   */
  getServiceInfo(serviceId) {
    const allServices = [
      ...servicesConfig.services.text,
      ...servicesConfig.services.image,
      ...servicesConfig.services.video,
      ...servicesConfig.services.audio
    ];
    
    return allServices.find(s => s.id === serviceId);
  }

  /**
   * Fecha todas as conexões
   */
  async close() {
    if (this.sessionManager) {
      await this.sessionManager.close();
    }
    
    for (const generator of Object.values(this.generators)) {
      if (generator && typeof generator.close === 'function') {
        await generator.close();
      }
    }
    
    console.log('🔒 MCP Automation fechado');
  }
}

// Exportar classes individuais também
module.exports = {
  MCPAutomation,
  BrowserSessionManager,
  GoogleAIStudioAutomation,
  GeminiTextGenerator,
  GeminiImageGenerator,
  BingImageCreatorAutomation,
  LeonardoAIAutomation,
  RunwayFreeAutomation
};

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  (async () => {
    const mcp = new MCPAutomation();
    
    try {
      if (args[0] === '--setup') {
        await mcp.setupSessions();
      } else if (args[0] === '--check') {
        await mcp.checkSessions();
      } else if (args[0] === '--text' && args[1]) {
        await mcp.initialize();
        const result = await mcp.generateText(args.slice(1).join(' '));
        console.log('\n📝 Resultado:\n', result);
      } else if (args[0] === '--image' && args[1]) {
        await mcp.initialize();
        const result = await mcp.generateImage(args.slice(1).join(' '));
        console.log('\n🖼️ Imagem:', result);
      } else if (args[0] === '--campaign' && args[1]) {
        await mcp.initialize();
        await mcp.generateCampaign(args.slice(1).join(' '));
      } else {
        console.log(`
MCP Automation - Módulo de Treinamento

Uso: node index.js [comando] [argumentos]

Comandos:
  --setup              Configurar sessões (login manual)
  --check              Verificar status das sessões
  --text [prompt]      Gerar texto
  --image [prompt]     Gerar imagem
  --campaign [topic]   Gerar campanha completa

Exemplos:
  node index.js --setup
  node index.js --text "Escreva um post sobre café"
  node index.js --image "Um pôr do sol na praia"
  node index.js --campaign "Lançamento de produto tech"
        `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      await mcp.close();
    }
  })();
}

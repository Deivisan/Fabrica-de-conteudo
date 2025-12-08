/**
 * Automação do Leonardo.ai
 * Geração de imagens com múltiplos modelos
 */

const BrowserSessionManager = require('../browser-session-manager');
const config = require('../../config/playwright.config');
const fs = require('fs').promises;
const path = require('path');

class LeonardoAIAutomation {
  constructor() {
    this.sessionManager = new BrowserSessionManager();
    this.page = null;
    this.serviceConfig = config.services.leonardoAI;
    this.outputDir = path.join(__dirname, '../../../assets/generated/leonardo');
  }

  /**
   * Inicializa a automação
   */
  async initialize(options = {}) {
    await this.sessionManager.initialize(options);
    this.page = this.sessionManager.getPage();
    
    await fs.mkdir(this.outputDir, { recursive: true });
    
    return this;
  }

  /**
   * Navega para o Leonardo.ai
   */
  async navigateToLeonardo() {
    await this.page.goto(this.serviceConfig.url, { waitUntil: 'networkidle' });
    
    const isLoggedIn = await this.checkLogin();
    if (!isLoggedIn) {
      throw new Error('Não está logado no Leonardo.ai. Execute: node browser-session-manager.js --setup');
    }
    
    await this.wait(2000);
    return this;
  }

  /**
   * Verifica se está logado
   */
  async checkLogin() {
    try {
      await this.page.waitForSelector('.user-menu, .avatar, [data-testid="user-menu"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gera imagens
   */
  async generateImages(prompt, options = {}) {
    console.log(`🖼️ Gerando imagens: "${prompt.substring(0, 50)}..."`);
    
    await this.navigateToLeonardo();
    
    // Navegar para a página de geração
    await this.navigateToGeneration();
    
    // Configurar modelo se especificado
    if (options.model) {
      await this.selectModel(options.model);
    }
    
    // Inserir prompt
    const promptSelector = this.serviceConfig.selectors.promptInput;
    await this.page.waitForSelector(promptSelector, { timeout: 10000 });
    await this.page.fill(promptSelector, prompt);
    
    // Configurar opções adicionais
    if (options.negativePrompt) {
      await this.setNegativePrompt(options.negativePrompt);
    }
    
    // Gerar
    const generateSelector = this.serviceConfig.selectors.generateButton;
    await this.page.click(generateSelector);
    
    // Aguardar geração
    console.log('⏳ Aguardando geração...');
    await this.waitForGeneration();
    
    // Capturar imagens
    const imagePaths = await this.captureImages(options.prefix);
    
    console.log(`✅ ${imagePaths.length} imagens geradas!`);
    return imagePaths;
  }

  /**
   * Navega para página de geração
   */
  async navigateToGeneration() {
    // Procurar botão de criar/gerar
    const createButton = await this.page.$('a[href*="generation"], button:has-text("Create"), button:has-text("Generate")');
    if (createButton) {
      await createButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Seleciona modelo de IA
   */
  async selectModel(modelName) {
    try {
      // Abrir seletor de modelo
      const modelSelector = await this.page.$('.model-selector, [data-testid="model-select"]');
      if (modelSelector) {
        await modelSelector.click();
        await this.wait(500);
        
        // Selecionar modelo
        await this.page.click(`text="${modelName}"`);
        await this.wait(500);
      }
    } catch (error) {
      console.log(`   ⚠️ Não foi possível selecionar modelo: ${error.message}`);
    }
  }

  /**
   * Define prompt negativo
   */
  async setNegativePrompt(negativePrompt) {
    try {
      const negativeInput = await this.page.$('textarea[placeholder*="negative"], input[placeholder*="negative"]');
      if (negativeInput) {
        await negativeInput.fill(negativePrompt);
      }
    } catch (error) {
      console.log(`   ⚠️ Não foi possível definir prompt negativo: ${error.message}`);
    }
  }

  /**
   * Aguarda geração das imagens
   */
  async waitForGeneration() {
    // Aguardar indicador de loading
    try {
      await this.page.waitForSelector('.generating, .loading, [data-generating="true"]', { 
        state: 'visible',
        timeout: 5000 
      });
      
      await this.page.waitForSelector('.generating, .loading, [data-generating="true"]', { 
        state: 'hidden',
        timeout: config.timeouts.imageGeneration 
      });
    } catch {
      // Loading pode não existir ou já ter terminado
    }
    
    // Aguardar imagens aparecerem
    const imageSelector = this.serviceConfig.selectors.resultImages;
    await this.page.waitForSelector(imageSelector, { 
      timeout: config.timeouts.imageGeneration,
      state: 'visible'
    });
    
    await this.wait(2000);
  }

  /**
   * Captura imagens geradas
   */
  async captureImages(prefix = 'leonardo') {
    const imageSelector = this.serviceConfig.selectors.resultImages;
    const images = await this.page.$$(imageSelector);
    
    const imagePaths = [];
    const timestamp = Date.now();
    
    for (let i = 0; i < images.length; i++) {
      try {
        const imageUrl = await images[i].evaluate(img => img.src);
        
        if (!imageUrl || imageUrl.startsWith('data:image/svg')) continue;
        
        const filename = `${prefix}_${timestamp}_${i + 1}.png`;
        const outputPath = path.join(this.outputDir, filename);
        
        await this.downloadImage(imageUrl, outputPath);
        imagePaths.push(outputPath);
        
        console.log(`   📥 Imagem ${i + 1} salva: ${filename}`);
      } catch (error) {
        console.log(`   ⚠️ Erro ao capturar imagem ${i + 1}: ${error.message}`);
      }
    }
    
    return imagePaths;
  }

  /**
   * Baixa imagem de URL
   */
  async downloadImage(url, outputPath) {
    const response = await this.page.request.get(url);
    const buffer = await response.body();
    await fs.writeFile(outputPath, buffer);
  }

  /**
   * Obtém tokens restantes
   */
  async getTokensRemaining() {
    try {
      const tokenElement = await this.page.$('.token-count, .credits, [data-tokens]');
      if (tokenElement) {
        const text = await tokenElement.textContent();
        const match = text.match(/\d+/);
        return match ? parseInt(match[0]) : null;
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Utilitário de espera
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fecha a automação
   */
  async close() {
    await this.sessionManager.close();
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  (async () => {
    const automation = new LeonardoAIAutomation();
    
    try {
      await automation.initialize({ headless: false });
      
      if (args.length > 0) {
        const prompt = args.join(' ');
        const results = await automation.generateImages(prompt);
        console.log('\n🖼️ Imagens salvas:');
        results.forEach(p => console.log(`   ${p}`));
      } else {
        console.log(`
Uso: node leonardo-ai.js [prompt]

Exemplo:
  node leonardo-ai.js "Uma floresta mágica com cogumelos brilhantes"
        `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      await automation.close();
    }
  })();
}

module.exports = LeonardoAIAutomation;

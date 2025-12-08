/**
 * Automação do Bing Image Creator (DALL-E 3)
 * Geração de imagens de alta qualidade via navegador
 */

const BrowserSessionManager = require('../browser-session-manager');
const config = require('../../config/playwright.config');
const fs = require('fs').promises;
const path = require('path');

class BingImageCreatorAutomation {
  constructor() {
    this.sessionManager = new BrowserSessionManager();
    this.page = null;
    this.serviceConfig = config.services.bingImageCreator;
    this.outputDir = path.join(__dirname, '../../../assets/generated/bing');
  }

  /**
   * Inicializa a automação
   */
  async initialize(options = {}) {
    await this.sessionManager.initialize(options);
    this.page = this.sessionManager.getPage();
    
    // Garantir diretório de saída
    await fs.mkdir(this.outputDir, { recursive: true });
    
    return this;
  }

  /**
   * Navega para o Bing Image Creator
   */
  async navigateToCreator() {
    await this.page.goto(this.serviceConfig.url, { waitUntil: 'networkidle' });
    
    // Verificar se está logado
    const isLoggedIn = await this.checkLogin();
    if (!isLoggedIn) {
      throw new Error('Não está logado no Bing. Execute: node browser-session-manager.js --setup');
    }
    
    await this.wait(2000);
    return this;
  }

  /**
   * Verifica se está logado
   */
  async checkLogin() {
    try {
      await this.page.waitForSelector('#id_n, .id_avatar, .mectrl_profilepic', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gera imagens usando DALL-E 3
   */
  async generateImages(prompt, options = {}) {
    console.log(`🖼️ Gerando imagens: "${prompt.substring(0, 50)}..."`);
    
    await this.navigateToCreator();
    
    // Encontrar campo de prompt
    const promptSelector = this.serviceConfig.selectors.promptInput;
    await this.page.waitForSelector(promptSelector, { timeout: 10000 });
    
    // Limpar e inserir prompt
    await this.page.fill(promptSelector, '');
    await this.page.fill(promptSelector, prompt);
    
    // Clicar no botão de criar
    const submitSelector = this.serviceConfig.selectors.submitButton;
    await this.page.click(submitSelector);
    
    // Aguardar geração
    console.log('⏳ Aguardando geração de imagens...');
    await this.waitForGeneration();
    
    // Capturar todas as imagens geradas
    const imagePaths = await this.captureAllImages(options.prefix);
    
    console.log(`✅ ${imagePaths.length} imagens geradas!`);
    return imagePaths;
  }

  /**
   * Aguarda geração das imagens
   */
  async waitForGeneration() {
    // Aguardar redirecionamento para página de resultados
    await this.page.waitForURL('**/images/create/**', { 
      timeout: config.timeouts.imageGeneration 
    });
    
    // Aguardar imagens aparecerem
    const imageSelector = this.serviceConfig.selectors.images;
    await this.page.waitForSelector(imageSelector, { 
      timeout: config.timeouts.imageGeneration,
      state: 'visible'
    });
    
    // Aguardar todas as imagens carregarem
    await this.page.waitForFunction(() => {
      const images = document.querySelectorAll('.mimg, .imgpt img');
      if (images.length === 0) return false;
      return Array.from(images).every(img => img.complete && img.naturalWidth > 0);
    }, { timeout: config.timeouts.imageGeneration });
    
    await this.wait(2000);
  }

  /**
   * Captura todas as imagens geradas
   */
  async captureAllImages(prefix = 'bing') {
    const imageSelector = this.serviceConfig.selectors.images;
    const images = await this.page.$$(imageSelector);
    
    const imagePaths = [];
    const timestamp = Date.now();
    
    for (let i = 0; i < images.length; i++) {
      try {
        // Obter URL da imagem em alta resolução
        const imageUrl = await images[i].evaluate(img => {
          // Tentar obter versão de alta resolução
          const src = img.src || img.getAttribute('src');
          // Bing usa parâmetros de tamanho na URL
          return src.replace(/w=\d+/, 'w=1024').replace(/h=\d+/, 'h=1024');
        });
        
        if (!imageUrl) continue;
        
        // Gerar nome de arquivo
        const filename = `${prefix}_${timestamp}_${i + 1}.jpg`;
        const outputPath = path.join(this.outputDir, filename);
        
        // Baixar imagem
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
   * Baixa uma imagem de URL
   */
  async downloadImage(url, outputPath) {
    const response = await this.page.request.get(url);
    const buffer = await response.body();
    await fs.writeFile(outputPath, buffer);
  }

  /**
   * Obtém número de boosts restantes
   */
  async getBoostsRemaining() {
    try {
      const boostElement = await this.page.$('.credits, .boost-count, [data-boost]');
      if (boostElement) {
        const text = await boostElement.textContent();
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
    const automation = new BingImageCreatorAutomation();
    
    try {
      await automation.initialize({ headless: false });
      
      if (args.length > 0) {
        const prompt = args.join(' ');
        const results = await automation.generateImages(prompt);
        console.log('\n🖼️ Imagens salvas:');
        results.forEach(p => console.log(`   ${p}`));
      } else {
        console.log(`
Uso: node bing-image-creator.js [prompt]

Exemplo:
  node bing-image-creator.js "Um castelo medieval ao pôr do sol, estilo fantasia"
        `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      await automation.close();
    }
  })();
}

module.exports = BingImageCreatorAutomation;

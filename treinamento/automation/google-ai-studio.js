/**
 * Automação do Google AI Studio (Gemini)
 * Geração de texto e imagens via navegador
 */

const BrowserSessionManager = require('./browser-session-manager');
const config = require('../config/playwright.config');
const fs = require('fs').promises;
const path = require('path');

class GoogleAIStudioAutomation {
  constructor() {
    this.sessionManager = new BrowserSessionManager();
    this.page = null;
    this.serviceConfig = config.services.googleAIStudio;
    this.outputDir = path.join(__dirname, '../../assets/generated');
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
   * Navega para o Google AI Studio
   */
  async navigateToStudio() {
    await this.page.goto(this.serviceConfig.url, { waitUntil: 'networkidle' });
    
    // Verificar se está logado
    const isLoggedIn = await this.checkLogin();
    if (!isLoggedIn) {
      throw new Error('Não está logado no Google AI Studio. Execute: node browser-session-manager.js --setup');
    }
    
    // Aguardar interface carregar
    await this.page.waitForLoadState('networkidle');
    await this.wait(2000);
    
    return this;
  }

  /**
   * Verifica se está logado
   */
  async checkLogin() {
    try {
      await this.page.waitForSelector('img[alt*="Account"], .user-avatar, [data-email]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gera texto usando Gemini
   */
  async generateText(prompt, options = {}) {
    console.log(`📝 Gerando texto: "${prompt.substring(0, 50)}..."`);
    
    await this.navigateToStudio();
    
    // Encontrar e preencher o campo de prompt
    const promptSelector = this.serviceConfig.selectors.promptInput;
    await this.page.waitForSelector(promptSelector, { timeout: 10000 });
    
    // Limpar campo existente
    await this.page.click(promptSelector);
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    
    // Inserir novo prompt
    await this.page.fill(promptSelector, prompt);
    
    // Clicar no botão de executar
    const submitSelector = this.serviceConfig.selectors.submitButton;
    await this.page.click(submitSelector);
    
    // Aguardar resposta
    console.log('⏳ Aguardando resposta...');
    await this.waitForResponse();
    
    // Capturar resposta
    const response = await this.captureTextResponse();
    
    console.log('✅ Texto gerado com sucesso!');
    return response;
  }

  /**
   * Gera imagem usando Gemini/Imagen
   */
  async generateImage(prompt, options = {}) {
    console.log(`🖼️ Gerando imagem: "${prompt.substring(0, 50)}..."`);
    
    await this.navigateToStudio();
    
    // Construir prompt para geração de imagem
    const imagePrompt = `Generate an image: ${prompt}`;
    
    // Encontrar e preencher o campo de prompt
    const promptSelector = this.serviceConfig.selectors.promptInput;
    await this.page.waitForSelector(promptSelector, { timeout: 10000 });
    
    // Limpar e inserir prompt
    await this.page.click(promptSelector);
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    await this.page.fill(promptSelector, imagePrompt);
    
    // Executar
    const submitSelector = this.serviceConfig.selectors.submitButton;
    await this.page.click(submitSelector);
    
    // Aguardar geração de imagem (pode demorar mais)
    console.log('⏳ Aguardando geração de imagem...');
    await this.waitForImageGeneration();
    
    // Capturar imagem
    const imagePath = await this.captureImage(options.filename);
    
    console.log(`✅ Imagem salva em: ${imagePath}`);
    return imagePath;
  }

  /**
   * Aguarda resposta de texto
   */
  async waitForResponse() {
    const responseSelector = this.serviceConfig.selectors.response;
    
    // Aguardar indicador de loading desaparecer
    try {
      await this.page.waitForSelector('.loading, .spinner, [data-loading="true"]', { 
        state: 'hidden', 
        timeout: config.timeouts.textGeneration 
      });
    } catch {
      // Loading pode não existir
    }
    
    // Aguardar resposta aparecer
    await this.page.waitForSelector(responseSelector, { 
      timeout: config.timeouts.textGeneration 
    });
    
    // Aguardar conteúdo estabilizar
    await this.wait(1000);
    
    // Verificar se a resposta tem conteúdo
    await this.page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        return el && el.textContent.trim().length > 10;
      },
      responseSelector,
      { timeout: config.timeouts.textGeneration }
    );
  }

  /**
   * Aguarda geração de imagem
   */
  async waitForImageGeneration() {
    const imageSelector = this.serviceConfig.selectors.imageResult;
    
    // Aguardar imagem aparecer
    await this.page.waitForSelector(imageSelector, { 
      timeout: config.timeouts.imageGeneration,
      state: 'visible'
    });
    
    // Aguardar imagem carregar completamente
    await this.page.waitForFunction(
      (selector) => {
        const img = document.querySelector(selector);
        return img && img.complete && img.naturalWidth > 0;
      },
      imageSelector,
      { timeout: config.timeouts.imageGeneration }
    );
    
    await this.wait(1000);
  }

  /**
   * Captura resposta de texto
   */
  async captureTextResponse() {
    const responseSelector = this.serviceConfig.selectors.response;
    
    const response = await this.page.$eval(responseSelector, el => {
      // Tentar obter texto formatado
      return el.innerText || el.textContent;
    });
    
    return response.trim();
  }

  /**
   * Captura e salva imagem gerada
   */
  async captureImage(filename) {
    const imageSelector = this.serviceConfig.selectors.imageResult;
    
    // Obter URL da imagem
    const imageUrl = await this.page.$eval(imageSelector, img => img.src);
    
    // Gerar nome de arquivo
    const outputFilename = filename || `gemini_${Date.now()}.png`;
    const outputPath = path.join(this.outputDir, outputFilename);
    
    // Baixar imagem
    if (imageUrl.startsWith('data:')) {
      // Imagem em base64
      const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
      await fs.writeFile(outputPath, Buffer.from(base64Data, 'base64'));
    } else {
      // Imagem de URL
      const response = await this.page.request.get(imageUrl);
      const buffer = await response.body();
      await fs.writeFile(outputPath, buffer);
    }
    
    return outputPath;
  }

  /**
   * Captura screenshot do elemento de imagem
   */
  async screenshotImage(filename) {
    const imageSelector = this.serviceConfig.selectors.imageResult;
    const element = await this.page.$(imageSelector);
    
    if (!element) {
      throw new Error('Elemento de imagem não encontrado');
    }
    
    const outputFilename = filename || `gemini_screenshot_${Date.now()}.png`;
    const outputPath = path.join(this.outputDir, outputFilename);
    
    await element.screenshot({ path: outputPath });
    
    return outputPath;
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
    const automation = new GoogleAIStudioAutomation();
    
    try {
      await automation.initialize({ headless: false });
      
      if (args[0] === '--text' && args[1]) {
        const result = await automation.generateText(args.slice(1).join(' '));
        console.log('\n📄 Resultado:');
        console.log(result);
      } else if (args[0] === '--image' && args[1]) {
        const result = await automation.generateImage(args.slice(1).join(' '));
        console.log('\n🖼️ Imagem salva em:', result);
      } else {
        console.log(`
Uso: node google-ai-studio.js [opção] [prompt]

Opções:
  --text "prompt"    Gerar texto
  --image "prompt"   Gerar imagem

Exemplos:
  node google-ai-studio.js --text "Escreva um post para Instagram sobre café"
  node google-ai-studio.js --image "Um gato astronauta no espaço"
        `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      await automation.close();
    }
  })();
}

module.exports = GoogleAIStudioAutomation;

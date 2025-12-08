/**
 * Automação do Runway ML (Versão Gratuita)
 * Geração de vídeos curtos via navegador
 */

const BrowserSessionManager = require('../browser-session-manager');
const config = require('../../config/playwright.config');
const fs = require('fs').promises;
const path = require('path');

class RunwayFreeAutomation {
  constructor() {
    this.sessionManager = new BrowserSessionManager();
    this.page = null;
    this.outputDir = path.join(__dirname, '../../../assets/generated/videos');
    this.serviceUrl = 'https://app.runwayml.com';
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
   * Navega para o Runway
   */
  async navigateToRunway() {
    await this.page.goto(this.serviceUrl, { waitUntil: 'networkidle' });
    
    const isLoggedIn = await this.checkLogin();
    if (!isLoggedIn) {
      throw new Error('Não está logado no Runway. Faça login manualmente primeiro.');
    }
    
    await this.wait(2000);
    return this;
  }

  /**
   * Verifica se está logado
   */
  async checkLogin() {
    try {
      await this.page.waitForSelector('.user-avatar, .profile-menu, [data-testid="user-menu"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gera vídeo a partir de texto (Text-to-Video)
   */
  async generateFromText(prompt, options = {}) {
    console.log(`🎬 Gerando vídeo: "${prompt.substring(0, 50)}..."`);
    
    await this.navigateToRunway();
    
    // Navegar para Gen-2
    await this.navigateToGen2();
    
    // Selecionar modo Text-to-Video
    await this.selectTextToVideo();
    
    // Inserir prompt
    await this.enterPrompt(prompt);
    
    // Configurar opções
    if (options.duration) {
      await this.setDuration(options.duration);
    }
    
    // Gerar
    await this.clickGenerate();
    
    // Aguardar geração
    console.log('⏳ Aguardando geração do vídeo (pode demorar alguns minutos)...');
    const videoUrl = await this.waitForVideoGeneration();
    
    // Baixar vídeo
    const videoPath = await this.downloadVideo(videoUrl, options.filename);
    
    console.log(`✅ Vídeo salvo em: ${videoPath}`);
    return videoPath;
  }

  /**
   * Gera vídeo a partir de imagem (Image-to-Video)
   */
  async generateFromImage(imagePath, prompt, options = {}) {
    console.log(`🎬 Gerando vídeo a partir de imagem...`);
    
    await this.navigateToRunway();
    
    // Navegar para Gen-2
    await this.navigateToGen2();
    
    // Selecionar modo Image-to-Video
    await this.selectImageToVideo();
    
    // Upload da imagem
    await this.uploadImage(imagePath);
    
    // Inserir prompt de movimento
    if (prompt) {
      await this.enterPrompt(prompt);
    }
    
    // Gerar
    await this.clickGenerate();
    
    // Aguardar geração
    console.log('⏳ Aguardando geração do vídeo...');
    const videoUrl = await this.waitForVideoGeneration();
    
    // Baixar vídeo
    const videoPath = await this.downloadVideo(videoUrl, options.filename);
    
    console.log(`✅ Vídeo salvo em: ${videoPath}`);
    return videoPath;
  }

  /**
   * Navega para Gen-2
   */
  async navigateToGen2() {
    try {
      // Procurar link para Gen-2
      const gen2Link = await this.page.$('a[href*="gen-2"], button:has-text("Gen-2"), [data-testid="gen-2"]');
      if (gen2Link) {
        await gen2Link.click();
        await this.page.waitForLoadState('networkidle');
      }
    } catch (error) {
      console.log('   ⚠️ Navegação para Gen-2 pode já estar na página correta');
    }
  }

  /**
   * Seleciona modo Text-to-Video
   */
  async selectTextToVideo() {
    try {
      const textMode = await this.page.$('button:has-text("Text"), [data-mode="text"]');
      if (textMode) {
        await textMode.click();
        await this.wait(500);
      }
    } catch (error) {
      console.log('   ⚠️ Modo texto pode já estar selecionado');
    }
  }

  /**
   * Seleciona modo Image-to-Video
   */
  async selectImageToVideo() {
    try {
      const imageMode = await this.page.$('button:has-text("Image"), [data-mode="image"]');
      if (imageMode) {
        await imageMode.click();
        await this.wait(500);
      }
    } catch (error) {
      console.log('   ⚠️ Modo imagem pode já estar selecionado');
    }
  }

  /**
   * Insere prompt
   */
  async enterPrompt(prompt) {
    const promptSelector = 'textarea[placeholder*="prompt"], textarea[placeholder*="Describe"], input[type="text"]';
    await this.page.waitForSelector(promptSelector, { timeout: 10000 });
    await this.page.fill(promptSelector, prompt);
  }

  /**
   * Upload de imagem
   */
  async uploadImage(imagePath) {
    const fileInput = await this.page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(imagePath);
      await this.wait(2000);
    }
  }

  /**
   * Define duração do vídeo
   */
  async setDuration(seconds) {
    try {
      const durationSelector = await this.page.$(`button:has-text("${seconds}s"), [data-duration="${seconds}"]`);
      if (durationSelector) {
        await durationSelector.click();
      }
    } catch (error) {
      console.log(`   ⚠️ Não foi possível definir duração: ${error.message}`);
    }
  }

  /**
   * Clica no botão de gerar
   */
  async clickGenerate() {
    const generateButton = await this.page.$('button:has-text("Generate"), button:has-text("Create"), button[type="submit"]');
    if (generateButton) {
      await generateButton.click();
    } else {
      throw new Error('Botão de gerar não encontrado');
    }
  }

  /**
   * Aguarda geração do vídeo
   */
  async waitForVideoGeneration() {
    // Aguardar indicador de progresso
    try {
      await this.page.waitForSelector('.progress, .generating, [data-status="generating"]', { 
        state: 'visible',
        timeout: 10000 
      });
    } catch {
      // Pode não ter indicador visível
    }
    
    // Aguardar vídeo aparecer
    const videoSelector = 'video, [data-testid="generated-video"], .video-result';
    await this.page.waitForSelector(videoSelector, { 
      timeout: config.timeouts.videoGeneration,
      state: 'visible'
    });
    
    // Obter URL do vídeo
    const videoUrl = await this.page.$eval(videoSelector, el => {
      if (el.tagName === 'VIDEO') {
        return el.src || el.querySelector('source')?.src;
      }
      return el.querySelector('video')?.src;
    });
    
    if (!videoUrl) {
      throw new Error('URL do vídeo não encontrada');
    }
    
    return videoUrl;
  }

  /**
   * Baixa o vídeo
   */
  async downloadVideo(videoUrl, filename) {
    const outputFilename = filename || `runway_${Date.now()}.mp4`;
    const outputPath = path.join(this.outputDir, outputFilename);
    
    // Tentar baixar via botão de download
    try {
      const downloadButton = await this.page.$('button:has-text("Download"), a[download]');
      if (downloadButton) {
        const [download] = await Promise.all([
          this.page.waitForEvent('download'),
          downloadButton.click()
        ]);
        await download.saveAs(outputPath);
        return outputPath;
      }
    } catch {
      // Fallback: baixar diretamente da URL
    }
    
    // Baixar diretamente
    const response = await this.page.request.get(videoUrl);
    const buffer = await response.body();
    await fs.writeFile(outputPath, buffer);
    
    return outputPath;
  }

  /**
   * Obtém créditos restantes
   */
  async getCreditsRemaining() {
    try {
      const creditsElement = await this.page.$('.credits, .credit-count, [data-credits]');
      if (creditsElement) {
        const text = await creditsElement.textContent();
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
    const automation = new RunwayFreeAutomation();
    
    try {
      await automation.initialize({ headless: false });
      
      if (args[0] === '--text' && args[1]) {
        const prompt = args.slice(1).join(' ');
        const result = await automation.generateFromText(prompt);
        console.log('\n🎬 Vídeo salvo:', result);
      } else if (args[0] === '--image' && args[1] && args[2]) {
        const imagePath = args[1];
        const prompt = args.slice(2).join(' ');
        const result = await automation.generateFromImage(imagePath, prompt);
        console.log('\n🎬 Vídeo salvo:', result);
      } else {
        console.log(`
Uso: node runway-free.js [opção] [argumentos]

Opções:
  --text [prompt]              Gerar vídeo a partir de texto
  --image [path] [prompt]      Gerar vídeo a partir de imagem

Exemplos:
  node runway-free.js --text "Um astronauta caminhando na lua"
  node runway-free.js --image ./imagem.png "Zoom suave para frente"
        `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      await automation.close();
    }
  })();
}

module.exports = RunwayFreeAutomation;

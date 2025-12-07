/**
 * Integração com YouTube
 * Publicação automática de vídeos no YouTube
 */

const fs = require('fs').promises;
const path = require('path');

class YouTubePlatform {
  constructor(config, playwright) {
    this.config = config;
    this.playwright = playwright;
    this.browser = null;
    this.page = null;
  }

  /**
   * Inicializa o navegador e faz login
   */
  async initialize() {
    try {
      this.browser = await this.playwright.chromium.launch({
        headless: this.config.headless !== false // Padrão para headless
      });
      
      this.page = await this.browser.newPage();
      
      // Configurações adicionais da página
      await this.page.setViewport({ width: 1920, height: 1080 });
      
      // Faz login
      await this.login();
      console.log('YouTube inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar YouTube:', error);
      throw error;
    }
  }

  /**
   * Realiza login no YouTube (através do Google)
   */
  async login() {
    await this.page.goto('https://accounts.google.com/signin');
    
    // Aguarda carregamento da página
    await this.page.waitForLoadState('networkidle');
    
    // Preenche credenciais do Google
    await this.page.fill('input[type="email"]', this.config.google_email || this.config.youtube_email);
    await this.page.click('#identifierNext');
    
    // Aguarda campo de senha
    await this.page.waitForSelector('input[type="password"]');
    await this.page.fill('input[type="password"]', this.config.google_password || this.config.youtube_password);
    await this.page.click('#passwordNext');
    
    // Aguarda redirecionamento para o YouTube
    await this.page.waitForURL('https://www.youtube.com/**');
    
    // Navega para a página de criação de vídeos
    await this.page.goto('https://studio.youtube.com');
  }

  /**
   * Publica um vídeo no YouTube
   */
  async postVideo(videoPath, title, description, tags = [], privacy = 'PUBLIC') {
    try {
      // Clique no botão de criar novo vídeo
      await this.page.click('ytcp-button#create-icon');
      await this.page.click('tp-yt-paper-item:has-text("Upload video")');
      
      // Aguarda carregamento do seletor de arquivos
      await this.page.waitForSelector('input[type="file"]');
      
      // Faz upload do vídeo
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(videoPath);
      
      // Aguarda processamento do upload
      await this.page.waitForSelector('ytcp-video-upload-progress', { state: 'detached' });
      
      // Preenche detalhes do vídeo
      await this.page.fill('#title-textarea', title);
      await this.page.fill('#description-textarea', description);
      
      // Adiciona tags
      if (tags.length > 0) {
        await this.page.fill('#tags-container input', tags.join(', '));
      }
      
      // Define privacidade
      await this.page.click('tp-yt-paper-radio-button[name="privacy-radios"][value="' + privacy + '"]');
      
      // Vai para a próxima etapa
      await this.page.click('ytcp-button:has-text("Next"), ytcp-button:has-text("Avançar")');
      await this.page.click('ytcp-button:has-text("Next"), ytcp-button:has-text("Avançar")');
      await this.page.click('ytcp-button:has-text("Next"), ytcp-button:has-text("Avançar")');
      
      // Publica o vídeo
      await this.page.click('ytcp-button:has-text("Publish"), ytcp-button:has-text("Publicar")');
      
      // Aguarda confirmação de publicação
      await this.page.waitForSelector('ytcp-button:has-text("Done"), ytcp-button:has-text("Concluído")');
      await this.page.click('ytcp-button:has-text("Done"), ytcp-button:has-text("Concluído")');
      
      console.log(`Vídeo publicado com sucesso no YouTube: ${title}`);
      return true;
    } catch (error) {
      console.error('Erro ao publicar vídeo no YouTube:', error);
      return false;
    }
  }

  /**
   * Publica um vídeo como rascunho (para revisão posterior)
   */
  async saveAsDraft(videoPath, title, description, tags = []) {
    try {
      // Clique no botão de criar novo vídeo
      await this.page.click('ytcp-button#create-icon');
      await this.page.click('tp-yt-paper-item:has-text("Upload video")');
      
      // Aguarda carregamento do seletor de arquivos
      await this.page.waitForSelector('input[type="file"]');
      
      // Faz upload do vídeo
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(videoPath);
      
      // Aguarda processamento do upload
      await this.page.waitForSelector('ytcp-video-upload-progress', { state: 'detached' });
      
      // Preenche detalhes do vídeo
      await this.page.fill('#title-textarea', title);
      await this.page.fill('#description-textarea', description);
      
      // Adiciona tags
      if (tags.length > 0) {
        await this.page.fill('#tags-container input', tags.join(', '));
      }
      
      // Define como rascunho
      await this.page.click('tp-yt-paper-radio-button[name="privacy-radios"][value="PRIVATE"]');
      
      // Vai para a próxima etapa
      await this.page.click('ytcp-button:has-text("Next"), ytcp-button:has-text("Avançar")');
      await this.page.click('ytcp-button:has-text("Next"), ytcp-button:has-text("Avançar")');
      await this.page.click('ytcp-button:has-text("Next"), ytcp-button:has-text("Avançar")');
      
      // Salva como rascunho
      await this.page.click('ytcp-button:has-text("Save as draft"), ytcp-button:has-text("Salvar como rascunho")');
      
      // Aguarda confirmação
      await this.page.waitForSelector('ytcp-button:has-text("Done"), ytcp-button:has-text("Concluído")');
      await this.page.click('ytcp-button:has-text("Done"), ytcp-button:has-text("Concluído")');
      
      console.log(`Vídeo salvo como rascunho no YouTube: ${title}`);
      return true;
    } catch (error) {
      console.error('Erro ao salvar vídeo como rascunho no YouTube:', error);
      return false;
    }
  }

  /**
   * Atualiza informações de um vídeo existente
   */
  async updateVideo(videoId, title, description, tags = [], privacy = null) {
    try {
      // Navega para o vídeo existente no YouTube Studio
      await this.page.goto(`https://studio.youtube.com/video/${videoId}/edit`);
      
      // Atualiza título e descrição
      await this.page.fill('#title-textarea', title);
      await this.page.fill('#description-textarea', description);
      
      // Atualiza tags
      if (tags.length > 0) {
        await this.page.fill('#tags-container input', tags.join(', '));
      }
      
      // Atualiza privacidade se especificada
      if (privacy) {
        await this.page.click('tp-yt-paper-radio-button[name="privacy-radios"][value="' + privacy + '"]');
      }
      
      // Salva alterações
      await this.page.click('ytcp-button:has-text("Save"), ytcp-button:has-text("Salvar")');
      
      // Aguarda confirmação
      await this.page.waitForSelector('ytcp-alert[status="INFO"]');
      
      console.log(`Vídeo atualizado com sucesso no YouTube: ${videoId}`);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar vídeo no YouTube:', error);
      return false;
    }
  }

  /**
   * Fecha o navegador
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = YouTubePlatform;
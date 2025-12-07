/**
 * Integração com Instagram
 * Publicação automática de conteúdo no Instagram
 */

const fs = require('fs').promises;
const path = require('path');

class InstagramPlatform {
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
      await this.page.setViewport({ width: 1080, height: 1920 });
      
      // Faz login
      await this.login();
      console.log('Instagram inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Instagram:', error);
      throw error;
    }
  }

  /**
   * Realiza login no Instagram
   */
  async login() {
    await this.page.goto('https://www.instagram.com/accounts/login/');
    
    // Aguarda carregamento da página
    await this.page.waitForLoadState('networkidle');
    
    // Preenche credenciais
    await this.page.fill('input[name="username"]', this.config.instagram_username);
    await this.page.fill('input[name="password"]', this.config.instagram_password);
    
    // Clica no botão de login
    await this.page.click('button[type="submit"]');
    
    // Aguarda redirecionamento ou confirmação
    await this.page.waitForURL('https://www.instagram.com/**');
    
    // Manipula pop-ups que possam aparecer
    await this.handlePopups();
  }

  /**
   * Publica uma imagem no Instagram
   */
  async postImage(imagePath, caption) {
    try {
      // Clica no botão de criar novo post
      await this.page.click('svg[aria-label="New Post"], [data-testid="new-post-button"]');
      
      // Aguarda carregamento do seletor de arquivos
      await this.page.waitForSelector('input[type="file"]');
      
      // Faz upload da imagem
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(imagePath);
      
      // Aguarda processamento da imagem
      await this.page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // Adiciona legenda
      await this.page.fill('textarea[aria-label="Write a caption..."]', caption);
      
      // Clica em compartilhar
      await this.page.click('button:has-text("Share"), button:has-text("Compartilhar")');
      
      // Aguarda confirmação de publicação
      await this.page.waitForURL('https://www.instagram.com/p/**', { timeout: 30000 });
      
      console.log(`Imagem publicada com sucesso no Instagram: ${imagePath}`);
      return true;
    } catch (error) {
      console.error('Erro ao publicar imagem no Instagram:', error);
      return false;
    }
  }

  /**
   * Publica um carrossel no Instagram
   */
  async postCarousel(imagePaths, caption) {
    try {
      // Clica no botão de criar novo post
      await this.page.click('svg[aria-label="New Post"]');
      
      // Aguarda carregamento do seletor de arquivos
      await this.page.waitForSelector('input[type="file"]');
      
      // Faz upload de múltiplas imagens
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(imagePaths);
      
      // Aguarda processamento das imagens
      await this.page.waitForSelector('[role="dialog"]', { state: 'visible' });
      
      // Adiciona legenda
      await this.page.fill('textarea[aria-label="Write a caption..."]', caption);
      
      // Clica em compartilhar
      await this.page.click('button:has-text("Share")');
      
      // Aguarda confirmação de publicação
      await this.page.waitForURL('https://www.instagram.com/p/**', { timeout: 30000 });
      
      console.log(`Carrossel publicado com sucesso no Instagram: ${imagePaths.length} imagens`);
      return true;
    } catch (error) {
      console.error('Erro ao publicar carrossel no Instagram:', error);
      return false;
    }
  }

  /**
   * Publica um vídeo no Instagram
   */
  async postVideo(videoPath, caption) {
    try {
      // Clica no botão de criar novo post
      await this.page.click('svg[aria-label="New Post"]');
      
      // Força o upload de vídeo
      await this.page.click('button:has-text("Go to post")'); // Selecão de tipo de post
      
      // Aguarda carregamento do seletor de arquivos
      await this.page.waitForSelector('input[type="file"]');
      
      // Faz upload do vídeo
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(videoPath);
      
      // Aguarda processamento do vídeo
      await this.page.waitForSelector('[role="dialog"]', { state: 'visible' });
      await this.page.waitForTimeout(10000); // Aguarda processamento do vídeo
      
      // Adiciona legenda
      await this.page.fill('textarea[aria-label="Write a caption..."]', caption);
      
      // Clica em compartilhar
      await this.page.click('button:has-text("Share")');
      
      // Aguarda confirmação de publicação
      await this.page.waitForURL('https://www.instagram.com/p/**', { timeout: 60000 });
      
      console.log(`Vídeo publicado com sucesso no Instagram: ${videoPath}`);
      return true;
    } catch (error) {
      console.error('Erro ao publicar vídeo no Instagram:', error);
      return false;
    }
  }

  /**
   * Publica uma história (story) no Instagram
   */
  async postStory(imagePath, text = null) {
    try {
      // Clica no seu perfil para acessar stories
      await this.page.click('div[role="button"]:has(img)');
      await this.page.click('div:has-text("Your Story")');
      
      // Faz upload da imagem
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(imagePath);
      
      if (text) {
        // Adiciona texto à história
        await this.page.click('button:has-text("Aa")');
        await this.page.fill('textarea[aria-label="Text"]', text);
      }
      
      // Clica em compartilhar em sua história
      await this.page.click('button:has-text("Your Story"), button:has-text("Share to your story")');
      
      console.log(`Story publicado com sucesso no Instagram: ${imagePath}`);
      return true;
    } catch (error) {
      console.error('Erro ao publicar story no Instagram:', error);
      return false;
    }
  }

  /**
   * Lida com pop-ups comuns após login
   */
  async handlePopups() {
    try {
      // Fecha pop-up de salvar informações de login
      await this.page.waitForSelector('button:has-text("Not Now"), button:has-text("Agora não")', { timeout: 5000 })
        .then(element => element.click())
        .catch(() => {}); // Não faz nada se o pop-up não aparecer
      
      // Fecha pop-up de notificações
      await this.page.waitForSelector('button:has-text("Not Now"), button:has-text("Agora não")', { timeout: 5000 })
        .then(element => element.click())
        .catch(() => {});
    } catch (error) {
      // Apenas loga se houver erro ao manipular pop-ups
      console.log('Nenhum pop-up para fechar ou erro ao manipular:', error.message);
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

module.exports = InstagramPlatform;
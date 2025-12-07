/**
 * Integração com Twitter/X
 * Publicação automática de tweets
 */

const fs = require('fs').promises;
const path = require('path');

class TwitterPlatform {
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
      console.log('Twitter/X inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Twitter/X:', error);
      throw error;
    }
  }

  /**
   * Realiza login no Twitter/X
   */
  async login() {
    await this.page.goto('https://twitter.com/i/flow/login');
    
    // Aguarda carregamento da página
    await this.page.waitForLoadState('networkidle');
    
    // Preenche credenciais
    await this.page.fill('input[autocomplete="username"]', this.config.twitter_username);
    await this.page.click('button:has-text("Next")');
    
    // Pode haver uma etapa intermediária para nome de usuário
    const nextButton = await this.page.$('button:has-text("Next")');
    if (nextButton) {
      await nextButton.click();
    }
    
    // Preenche senha
    await this.page.fill('input[autocomplete="current-password"]', this.config.twitter_password);
    await this.page.click('button[role="button"][data-testid="LoginForm_Login_Button"]');
    
    // Aguarda redirecionamento
    await this.page.waitForURL('https://twitter.com/**');
  }

  /**
   * Publica um tweet de texto
   */
  async postTweet(text) {
    try {
      // Aguarda carregamento do botão de tweet
      await this.page.waitForSelector('button[data-testid="tweetButtonInline"], button[data-testid="tweetButton"]');
      
      // Clica no campo de texto do tweet
      await this.page.click('br[data-text="true"]');
      await this.page.keyboard.type(text);
      
      // Clica no botão de tweet
      await this.page.click('button[data-testid="tweetButtonInline"], button[data-testid="tweetButton"]');
      
      // Aguarda confirmação de publicação
      await this.page.waitForSelector('[data-testid="primaryColumn"]', { timeout: 10000 });
      
      console.log(`Tweet publicado com sucesso no Twitter/X: ${text.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error('Erro ao publicar tweet no Twitter/X:', error);
      return false;
    }
  }

  /**
   * Publica um tweet com imagem
   */
  async postTweetWithImage(imagePath, text) {
    try {
      // Aguarda carregamento do botão de tweet
      await this.page.waitForSelector('button[data-testid="tweetButtonInline"], button[data-testid="tweetButton"]');
      
      // Clica no botão de adicionar mídia
      await this.page.click('button[data-testid="attachment"]');
      
      // Aguarda carregamento do seletor de arquivos
      await this.page.waitForSelector('input[type="file"]');
      
      // Faz upload da imagem
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(imagePath);
      
      // Aguarda carregamento da imagem
      await this.page.waitForSelector('[data-testid="attachments"] img', { timeout: 10000 });
      
      // Preenche o texto
      await this.page.click('br[data-text="true"]');
      await this.page.keyboard.type(text);
      
      // Clica no botão de tweet
      await this.page.click('button[data-testid="tweetButtonInline"], button[data-testid="tweetButton"]');
      
      // Aguarda confirmação de publicação
      await this.page.waitForSelector('[data-testid="primaryColumn"]', { timeout: 10000 });
      
      console.log(`Tweet com imagem publicado com sucesso no Twitter/X: ${text.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error('Erro ao publicar tweet com imagem no Twitter/X:', error);
      return false;
    }
  }

  /**
   * Publica um tweet com múltiplas imagens
   */
  async postTweetWithMultipleImages(imagePaths, text) {
    try {
      // Aguarda carregamento do botão de tweet
      await this.page.waitForSelector('button[data-testid="tweetButtonInline"], button[data-testid="tweetButton"]');
      
      // Clica no botão de adicionar mídia
      await this.page.click('button[data-testid="attachment"]');
      
      // Aguarda carregamento do seletor de arquivos
      await this.page.waitForSelector('input[type="file"]');
      
      // Faz upload das imagens
      const fileInput = await this.page.$('input[type="file"]');
      await fileInput.setInputFiles(imagePaths);
      
      // Aguarda carregamento das imagens
      await this.page.waitForSelector('[data-testid="attachments"] img', { timeout: 20000 });
      
      // Preenche o texto
      await this.page.click('br[data-text="true"]');
      await this.page.keyboard.type(text);
      
      // Clica no botão de tweet
      await this.page.click('button[data-testid="tweetButtonInline"], button[data-testid="tweetButton"]');
      
      // Aguarda confirmação de publicação
      await this.page.waitForSelector('[data-testid="primaryColumn"]', { timeout: 10000 });
      
      console.log(`Tweet com múltiplas imagens publicado com sucesso no Twitter/X: ${text.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error('Erro ao publicar tweet com múltiplas imagens no Twitter/X:', error);
      return false;
    }
  }

  /**
   * Faz retweet de um tweet específico
   */
  async retweet(tweetUrl) {
    try {
      // Vai para a URL do tweet
      await this.page.goto(tweetUrl);
      
      // Aguarda carregamento do tweet
      await this.page.waitForSelector('article');
      
      // Clica no botão de retweet
      await this.page.click('button[data-testid="retweet"] button');
      
      // Confirma retweet
      await this.page.click('button:has-text("Retweet"), button:has-text("ReTweet")');
      
      console.log(`Retweet realizado com sucesso: ${tweetUrl}`);
      return true;
    } catch (error) {
      console.error('Erro ao fazer retweet no Twitter/X:', error);
      return false;
    }
  }

  /**
   * Faz like em um tweet específico
   */
  async likeTweet(tweetUrl) {
    try {
      // Vai para a URL do tweet
      await this.page.goto(tweetUrl);
      
      // Aguarda carregamento do tweet
      await this.page.waitForSelector('article');
      
      // Clica no botão de like
      await this.page.click('button[data-testid="like"]');
      
      console.log(`Like realizado com sucesso: ${tweetUrl}`);
      return true;
    } catch (error) {
      console.error('Erro ao fazer like no Twitter/X:', error);
      return false;
    }
  }

  /**
   * Comenta em um tweet específico
   */
  async replyToTweet(tweetUrl, replyText) {
    try {
      // Vai para a URL do tweet
      await this.page.goto(tweetUrl);
      
      // Aguarda carregamento do tweet
      await this.page.waitForSelector('article');
      
      // Clica no botão de responder
      await this.page.click('button[data-testid="reply"]');
      
      // Preenche a resposta
      await this.page.click('br[data-text="true"]');
      await this.page.keyboard.type(replyText);
      
      // Publica a resposta
      await this.page.click('button[data-testid="tweetButton"]');
      
      console.log(`Resposta publicada com sucesso: ${replyText.substring(0, 50)}...`);
      return true;
    } catch (error) {
      console.error('Erro ao responder tweet no Twitter/X:', error);
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

module.exports = TwitterPlatform;
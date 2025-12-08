/**
 * Automação do ChatGPT Free
 * Geração de texto via navegador (versão gratuita)
 */

const BrowserSessionManager = require('../browser-session-manager');
const config = require('../../config/playwright.config');
const fs = require('fs').promises;
const path = require('path');

class ChatGPTFreeAutomation {
  constructor() {
    this.sessionManager = new BrowserSessionManager();
    this.page = null;
    this.serviceUrl = 'https://chat.openai.com';
    this.outputDir = path.join(__dirname, '../../../assets/generated/text');
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
   * Navega para o ChatGPT
   */
  async navigateToChatGPT() {
    await this.page.goto(this.serviceUrl, { waitUntil: 'networkidle' });
    
    const isLoggedIn = await this.checkLogin();
    if (!isLoggedIn) {
      throw new Error('Não está logado no ChatGPT. Faça login manualmente primeiro.');
    }
    
    await this.wait(2000);
    return this;
  }

  /**
   * Verifica se está logado
   */
  async checkLogin() {
    try {
      // Verificar se há campo de prompt (indica que está logado)
      await this.page.waitForSelector('#prompt-textarea, textarea[data-id="root"]', { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gera texto
   */
  async generateText(prompt, options = {}) {
    console.log(`📝 Gerando texto com ChatGPT: "${prompt.substring(0, 50)}..."`);
    
    await this.navigateToChatGPT();
    
    // Iniciar nova conversa se necessário
    if (options.newChat) {
      await this.startNewChat();
    }
    
    // Inserir prompt
    const promptSelector = '#prompt-textarea, textarea[data-id="root"]';
    await this.page.waitForSelector(promptSelector, { timeout: 10000 });
    await this.page.fill(promptSelector, prompt);
    
    // Enviar
    await this.page.keyboard.press('Enter');
    
    // Aguardar resposta
    console.log('⏳ Aguardando resposta...');
    const response = await this.waitForResponse();
    
    console.log('✅ Texto gerado com sucesso!');
    return response;
  }

  /**
   * Inicia nova conversa
   */
  async startNewChat() {
    try {
      const newChatButton = await this.page.$('a[href="/"], button:has-text("New chat")');
      if (newChatButton) {
        await newChatButton.click();
        await this.wait(1000);
      }
    } catch (error) {
      console.log('   ⚠️ Não foi possível iniciar nova conversa');
    }
  }

  /**
   * Aguarda resposta do ChatGPT
   */
  async waitForResponse() {
    // Aguardar indicador de digitação aparecer
    try {
      await this.page.waitForSelector('.result-streaming, [data-message-author-role="assistant"]', { 
        timeout: 10000 
      });
    } catch {
      // Pode não ter indicador visível
    }
    
    // Aguardar resposta completa (indicador de streaming desaparecer)
    await this.page.waitForFunction(() => {
      const streaming = document.querySelector('.result-streaming');
      return !streaming;
    }, { timeout: config.timeouts.textGeneration });
    
    // Capturar última resposta
    const response = await this.page.evaluate(() => {
      const messages = document.querySelectorAll('[data-message-author-role="assistant"]');
      if (messages.length === 0) return '';
      
      const lastMessage = messages[messages.length - 1];
      return lastMessage.textContent || '';
    });
    
    return response.trim();
  }

  /**
   * Continua conversa
   */
  async continueConversation(followUpPrompt) {
    return await this.generateText(followUpPrompt, { newChat: false });
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
    const automation = new ChatGPTFreeAutomation();
    
    try {
      await automation.initialize({ headless: false });
      
      if (args.length > 0) {
        const prompt = args.join(' ');
        const result = await automation.generateText(prompt);
        console.log('\n📝 Resposta:\n');
        console.log(result);
      } else {
        console.log(`
Uso: node chatgpt-free.js [prompt]

Exemplo:
  node chatgpt-free.js "Escreva um post para Instagram sobre café"
        `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      await automation.close();
    }
  })();
}

module.exports = ChatGPTFreeAutomation;

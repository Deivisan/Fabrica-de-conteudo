/**
 * Mapeador do Google AI Studio
 * Script interativo para mapear seletores e testar automação
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const USER_DATA_DIR = path.join(__dirname, '../../../browser-data');

class GoogleAIStudioMapper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.mappedSelectors = {};
  }

  /**
   * Inicia o navegador em modo interativo
   */
  async start() {
    console.log('\n🎭 MAPEADOR DO GOOGLE AI STUDIO');
    console.log('=' .repeat(60));
    
    // Garantir diretório de dados
    await fs.mkdir(USER_DATA_DIR, { recursive: true });
    
    console.log('\n📂 Diretório de sessão:', USER_DATA_DIR);
    console.log('🚀 Iniciando navegador...\n');
    
    // Lançar navegador com sessão persistente
    this.browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      slowMo: 100,
      viewport: { width: 1920, height: 1080 },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    
    // Obter página
    const pages = this.browser.pages();
    this.page = pages.length > 0 ? pages[0] : await this.browser.newPage();
    
    console.log('✅ Navegador iniciado!');
    console.log('\n📍 Navegando para Google AI Studio...');
    
    // Navegar para o Google AI Studio
    await this.page.goto('https://aistudio.google.com', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    console.log('✅ Página carregada!');
    
    return this;
  }

  /**
   * Verifica se está logado
   */
  async checkLogin() {
    console.log('\n🔐 Verificando login...');
    
    try {
      // Verificar se há indicador de usuário logado
      const loggedIn = await this.page.waitForSelector(
        'img[alt*="Account"], img[alt*="Google Account"], .gb_d, [data-email]',
        { timeout: 5000 }
      );
      
      if (loggedIn) {
        console.log('✅ Você está LOGADO!');
        return true;
      }
    } catch {
      console.log('❌ Você NÃO está logado.');
      console.log('\n⚠️  Por favor, faça login na janela do navegador.');
      console.log('   Após fazer login, pressione ENTER aqui.');
      
      await this.waitForInput();
      return await this.checkLogin();
    }
    
    return false;
  }

  /**
   * Mapeia os seletores da página
   */
  async mapSelectors() {
    console.log('\n🔍 MAPEANDO SELETORES...');
    console.log('=' .repeat(60));
    
    // Aguardar página carregar completamente
    await this.page.waitForLoadState('networkidle');
    await this.wait(2000);
    
    // Tirar screenshot inicial
    await this.screenshot('01_pagina_inicial');
    
    // Mapear campo de prompt
    console.log('\n📝 Procurando campo de prompt...');
    const promptSelectors = [
      'textarea[aria-label*="prompt" i]',
      'textarea[placeholder*="prompt" i]',
      'textarea[aria-label*="Type" i]',
      '.prompt-input textarea',
      'div[contenteditable="true"]',
      'textarea',
      '[data-testid="prompt-input"]',
      '.ql-editor',
      'ms-prompt-input textarea',
      'ms-prompt-input-wrapper textarea'
    ];
    
    for (const selector of promptSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            console.log(`   ✅ Encontrado: ${selector}`);
            this.mappedSelectors.promptInput = selector;
            
            // Destacar elemento
            await this.page.evaluate((sel) => {
              const el = document.querySelector(sel);
              if (el) {
                el.style.border = '3px solid red';
                el.style.backgroundColor = 'rgba(255,0,0,0.1)';
              }
            }, selector);
            
            await this.screenshot('02_campo_prompt');
            break;
          }
        }
      } catch (e) {
        // Continuar tentando
      }
    }
    
    if (!this.mappedSelectors.promptInput) {
      console.log('   ❌ Campo de prompt não encontrado automaticamente');
      console.log('   📋 Listando todos os textareas na página...');
      
      const textareas = await this.page.$$eval('textarea', els => 
        els.map(el => ({
          id: el.id,
          class: el.className,
          placeholder: el.placeholder,
          ariaLabel: el.getAttribute('aria-label'),
          visible: el.offsetParent !== null
        }))
      );
      
      console.log('   Textareas encontrados:', JSON.stringify(textareas, null, 2));
    }
    
    // Mapear botão de enviar/executar
    console.log('\n🔘 Procurando botão de executar...');
    const buttonSelectors = [
      'button[aria-label*="Run" i]',
      'button[aria-label*="Send" i]',
      'button[aria-label*="Submit" i]',
      'button:has-text("Run")',
      'button:has-text("Generate")',
      'button:has-text("Send")',
      '[data-testid="run-button"]',
      'button[type="submit"]',
      'ms-run-button button',
      '.run-button'
    ];
    
    for (const selector of buttonSelectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          if (isVisible) {
            console.log(`   ✅ Encontrado: ${selector}`);
            this.mappedSelectors.submitButton = selector;
            
            // Destacar elemento
            await this.page.evaluate((sel) => {
              const el = document.querySelector(sel);
              if (el) {
                el.style.border = '3px solid green';
                el.style.backgroundColor = 'rgba(0,255,0,0.1)';
              }
            }, selector);
            
            await this.screenshot('03_botao_executar');
            break;
          }
        }
      } catch (e) {
        // Continuar tentando
      }
    }
    
    if (!this.mappedSelectors.submitButton) {
      console.log('   ❌ Botão de executar não encontrado automaticamente');
      console.log('   📋 Listando todos os botões na página...');
      
      const buttons = await this.page.$$eval('button', els => 
        els.map(el => ({
          text: el.textContent?.trim().substring(0, 50),
          ariaLabel: el.getAttribute('aria-label'),
          class: el.className,
          visible: el.offsetParent !== null
        })).filter(b => b.visible)
      );
      
      console.log('   Botões visíveis:', JSON.stringify(buttons.slice(0, 10), null, 2));
    }
    
    return this.mappedSelectors;
  }

  /**
   * Testa geração de texto
   */
  async testTextGeneration(prompt = 'Olá, diga apenas "Teste OK"') {
    console.log('\n🧪 TESTANDO GERAÇÃO DE TEXTO');
    console.log('=' .repeat(60));
    console.log(`Prompt: "${prompt}"`);
    
    if (!this.mappedSelectors.promptInput) {
      console.log('❌ Campo de prompt não mapeado. Execute mapSelectors() primeiro.');
      return null;
    }
    
    try {
      // Limpar e preencher prompt
      console.log('\n📝 Preenchendo prompt...');
      await this.page.click(this.mappedSelectors.promptInput);
      await this.page.keyboard.press('Control+A');
      await this.page.keyboard.press('Backspace');
      await this.page.fill(this.mappedSelectors.promptInput, prompt);
      
      await this.screenshot('04_prompt_preenchido');
      
      // Clicar no botão de executar
      if (this.mappedSelectors.submitButton) {
        console.log('🔘 Clicando em executar...');
        await this.page.click(this.mappedSelectors.submitButton);
      } else {
        console.log('⌨️ Tentando Enter...');
        await this.page.keyboard.press('Enter');
      }
      
      // Aguardar resposta
      console.log('⏳ Aguardando resposta...');
      await this.wait(3000);
      
      await this.screenshot('05_resposta');
      
      // Tentar capturar resposta
      const responseSelectors = [
        '.response-container',
        '.model-response',
        '.output-text',
        '[data-testid="response"]',
        '.markdown-body',
        'ms-chat-turn:last-child',
        '.chat-message:last-child'
      ];
      
      for (const selector of responseSelectors) {
        try {
          const response = await this.page.$eval(selector, el => el.textContent);
          if (response && response.length > 0) {
            console.log(`\n✅ Resposta capturada (${selector}):`);
            console.log(response.substring(0, 200));
            this.mappedSelectors.responseContainer = selector;
            return response;
          }
        } catch {
          // Continuar tentando
        }
      }
      
      console.log('❌ Não foi possível capturar a resposta automaticamente');
      
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }
    
    return null;
  }

  /**
   * Testa geração de imagem
   */
  async testImageGeneration(prompt = 'A cute cat astronaut in space') {
    console.log('\n🖼️ TESTANDO GERAÇÃO DE IMAGEM');
    console.log('=' .repeat(60));
    console.log(`Prompt: "${prompt}"`);
    
    // Primeiro, precisamos navegar para a seção de imagens ou usar o prompt correto
    const imagePrompt = `Generate an image: ${prompt}`;
    
    return await this.testTextGeneration(imagePrompt);
  }

  /**
   * Salva os seletores mapeados
   */
  async saveSelectors() {
    const selectorsPath = path.join(__dirname, '../../config/google-ai-studio-selectors.json');
    
    const data = {
      mappedAt: new Date().toISOString(),
      url: 'https://aistudio.google.com',
      selectors: this.mappedSelectors,
      notes: [
        'Seletores mapeados automaticamente',
        'Podem precisar de atualização se o site mudar'
      ]
    };
    
    await fs.writeFile(selectorsPath, JSON.stringify(data, null, 2));
    console.log(`\n💾 Seletores salvos em: ${selectorsPath}`);
    
    return selectorsPath;
  }

  /**
   * Tira screenshot
   */
  async screenshot(name) {
    const screenshotDir = path.join(__dirname, '../../assets/screenshots');
    await fs.mkdir(screenshotDir, { recursive: true });
    
    const filepath = path.join(screenshotDir, `${name}_${Date.now()}.png`);
    await this.page.screenshot({ path: filepath, fullPage: false });
    console.log(`   📸 Screenshot: ${name}`);
    
    return filepath;
  }

  /**
   * Aguarda input do usuário
   */
  async waitForInput(message = '') {
    return new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question(message || 'Pressione ENTER para continuar...', () => {
        rl.close();
        resolve();
      });
    });
  }

  /**
   * Utilitário de espera
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Fecha o navegador
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n🔒 Navegador fechado');
    }
  }

  /**
   * Executa mapeamento completo
   */
  async runFullMapping() {
    try {
      await this.start();
      await this.checkLogin();
      await this.mapSelectors();
      
      console.log('\n📋 SELETORES MAPEADOS:');
      console.log(JSON.stringify(this.mappedSelectors, null, 2));
      
      const testText = await this.waitForInput('\nDeseja testar geração de texto? (s/n): ');
      if (testText.toLowerCase() === 's' || testText === '') {
        await this.testTextGeneration();
      }
      
      await this.saveSelectors();
      
      console.log('\n✅ Mapeamento concluído!');
      console.log('   Os seletores foram salvos e podem ser usados nos scripts de automação.');
      
      await this.waitForInput('\nPressione ENTER para fechar o navegador...');
      
    } finally {
      await this.close();
    }
  }
}

// CLI
if (require.main === module) {
  const mapper = new GoogleAIStudioMapper();
  mapper.runFullMapping().catch(console.error);
}

module.exports = GoogleAIStudioMapper;

/**
 * Google AI Studio Automation v2
 * Versão atualizada com seletores mapeados corretamente
 * Suporta geração de imagens com Nano Banana
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const USER_DATA_DIR = path.join(__dirname, '../../browser-data');
const OUTPUT_DIR = path.join(__dirname, '../../assets/generated');
const SCREENSHOTS_DIR = path.join(__dirname, '../assets/screenshots');

// Seletores mapeados do Google AI Studio
const SELECTORS = {
  // Input de prompt
  promptInput: 'textarea[aria-label*="prompt" i]',
  promptInputAlt: 'ms-autosize-textarea textarea',
  
  // Botão de executar
  runButton: 'button[aria-label="Run"]',
  runButtonAlt: 'ms-run-button button',
  
  // Filtros de modelo
  filterImages: 'button:has-text("Images")',
  filterGemini: 'button:has-text("Gemini")',
  filterVideo: 'button:has-text("Video")',
  
  // Modelos específicos
  nanoBananaPro: 'button:has-text("Nano Banana Pro")',
  nanoBanana: 'button:has-text("Nano Banana")',
  imagen4: 'button:has-text("Imagen 4")',
  
  // Área de resposta
  responseArea: 'ms-prompt-renderer',
  generatedImage: 'ms-prompt-renderer img',
  
  // Indicadores de loading
  loadingIndicator: '.loading, .spinner, [aria-busy="true"]',
  
  // Botões de ação
  newChatButton: 'button[aria-label="New chat"]',
  downloadButton: 'button[aria-label*="download" i], button[aria-label*="Download" i]',
  
  // Verificação de login
  accountButton: 'alkali-accountswitcher button',
  userEmail: 'button:has-text("@gmail.com")'
};

class GoogleAIStudioV2 {
  constructor(options = {}) {
    this.options = {
      headless: options.headless ?? false,
      slowMo: options.slowMo ?? 50,
      timeout: options.timeout ?? 60000,
      ...options
    };
    
    this.browser = null;
    this.page = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa o navegador com sessão persistente
   */
  async initialize() {
    console.log('\n🚀 Inicializando Google AI Studio Automation v2...');
    
    // Criar diretórios
    await fs.mkdir(USER_DATA_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    await fs.mkdir(path.join(OUTPUT_DIR, 'images'), { recursive: true });
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    
    // Lançar navegador com sessão persistente
    this.browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      viewport: { width: 1920, height: 1080 },
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    // Obter página
    const pages = this.browser.pages();
    this.page = pages.length > 0 ? pages[0] : await this.browser.newPage();
    
    // Configurar timeouts
    this.page.setDefaultTimeout(this.options.timeout);
    this.page.setDefaultNavigationTimeout(this.options.timeout);
    
    this.isInitialized = true;
    console.log('✅ Navegador iniciado com sessão persistente!');
    
    return this;
  }

  /**
   * Navega para o Google AI Studio
   */
  async navigateToStudio() {
    console.log('\n📍 Navegando para Google AI Studio...');
    
    await this.page.goto('https://aistudio.google.com', {
      waitUntil: 'networkidle',
      timeout: this.options.timeout
    });
    
    // Aguardar página carregar
    await this.page.waitForTimeout(2000);
    
    console.log('✅ Página carregada!');
    return this;
  }

  /**
   * Verifica se está logado
   */
  async checkLogin() {
    console.log('\n🔐 Verificando login...');
    
    try {
      // Procurar por indicadores de login
      const loggedIn = await this.page.$(SELECTORS.userEmail) || 
                       await this.page.$(SELECTORS.accountButton);
      
      if (loggedIn) {
        console.log('✅ Usuário está LOGADO!');
        return true;
      }
    } catch {}
    
    console.log('❌ Usuário NÃO está logado');
    return false;
  }

  /**
   * Seleciona o filtro de imagens
   */
  async selectImagesFilter() {
    console.log('\n🖼️ Selecionando filtro de imagens...');
    
    try {
      const imagesButton = await this.page.$(SELECTORS.filterImages);
      if (imagesButton) {
        await imagesButton.click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Filtro de imagens selecionado!');
        return true;
      }
    } catch (error) {
      console.log('⚠️ Não foi possível selecionar filtro:', error.message);
    }
    
    return false;
  }

  /**
   * Seleciona o modelo Nano Banana
   */
  async selectNanoBanana(pro = false) {
    console.log(`\n🍌 Selecionando modelo Nano Banana${pro ? ' Pro' : ''}...`);
    
    try {
      const selector = pro ? SELECTORS.nanoBananaPro : SELECTORS.nanoBanana;
      const modelButton = await this.page.$(selector);
      
      if (modelButton) {
        await modelButton.click();
        await this.page.waitForTimeout(1000);
        console.log(`✅ Modelo Nano Banana${pro ? ' Pro' : ''} selecionado!`);
        return true;
      }
    } catch (error) {
      console.log('⚠️ Não foi possível selecionar modelo:', error.message);
    }
    
    return false;
  }

  /**
   * Gera uma imagem com o prompt especificado
   */
  async generateImage(prompt, options = {}) {
    console.log('\n🎨 GERANDO IMAGEM');
    console.log('=' .repeat(60));
    console.log(`Prompt: "${prompt}"`);
    
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    await this.navigateToStudio();
    
    // Verificar login
    const isLoggedIn = await this.checkLogin();
    if (!isLoggedIn) {
      throw new Error('Não está logado. Execute setup de sessão primeiro.');
    }
    
    // Selecionar filtro de imagens
    await this.selectImagesFilter();
    
    // Selecionar modelo Nano Banana
    await this.selectNanoBanana(options.pro ?? false);
    
    // Encontrar e preencher o campo de prompt
    console.log('\n📝 Preenchendo prompt...');
    
    const promptInput = await this.page.$(SELECTORS.promptInput) ||
                        await this.page.$(SELECTORS.promptInputAlt);
    
    if (!promptInput) {
      throw new Error('Campo de prompt não encontrado');
    }
    
    // Limpar e preencher
    await promptInput.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.press('Backspace');
    await promptInput.fill(prompt);
    
    await this.screenshot('prompt_preenchido');
    
    // Clicar no botão de executar
    console.log('\n🔘 Executando geração...');
    
    const runButton = await this.page.$(SELECTORS.runButton) ||
                      await this.page.$(SELECTORS.runButtonAlt);
    
    if (!runButton) {
      throw new Error('Botão de executar não encontrado');
    }
    
    // Verificar se o botão está habilitado
    const isDisabled = await runButton.evaluate(el => el.disabled);
    if (isDisabled) {
      console.log('⚠️ Botão está desabilitado. Aguardando...');
      await this.page.waitForTimeout(1000);
    }
    
    await runButton.click();
    
    // Aguardar geração
    console.log('\n⏳ Aguardando geração da imagem...');
    console.log('   (Isso pode levar até 2 minutos)');
    
    const imagePath = await this.waitForImageGeneration(options);
    
    console.log('\n✅ Imagem gerada com sucesso!');
    console.log(`📁 Salva em: ${imagePath}`);
    
    return imagePath;
  }

  /**
   * Aguarda a geração da imagem e captura o resultado
   */
  async waitForImageGeneration(options = {}) {
    const timeout = options.timeout || 180000; // 3 minutos
    const startTime = Date.now();
    
    // Aguardar loading terminar
    try {
      await this.page.waitForSelector(SELECTORS.loadingIndicator, { 
        state: 'hidden',
        timeout: timeout 
      });
    } catch {
      // Loading pode não existir
    }
    
    // Aguardar imagem aparecer
    let imageElement = null;
    
    while (Date.now() - startTime < timeout) {
      try {
        // Procurar por imagens na área de resposta
        imageElement = await this.page.$('ms-prompt-renderer img[src*="blob:"], ms-prompt-renderer img[src*="data:"], img.generated-image');
        
        if (imageElement) {
          const src = await imageElement.getAttribute('src');
          if (src && (src.startsWith('blob:') || src.startsWith('data:') || src.includes('googleusercontent'))) {
            console.log('   🖼️ Imagem detectada!');
            break;
          }
        }
        
        // Também verificar por canvas
        const canvas = await this.page.$('ms-prompt-renderer canvas');
        if (canvas) {
          console.log('   🖼️ Canvas detectado!');
          imageElement = canvas;
          break;
        }
        
      } catch {}
      
      await this.page.waitForTimeout(2000);
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`   ⏳ Aguardando... (${elapsed}s)`);
    }
    
    if (!imageElement) {
      await this.screenshot('erro_sem_imagem');
      throw new Error('Timeout: Imagem não foi gerada');
    }
    
    // Capturar a imagem
    return await this.captureImage(imageElement, options);
  }

  /**
   * Captura e salva a imagem gerada
   */
  async captureImage(element, options = {}) {
    const timestamp = Date.now();
    const filename = options.filename || `gemini_image_${timestamp}.png`;
    const outputPath = path.join(OUTPUT_DIR, 'images', filename);
    
    // Tentar obter a URL da imagem
    const tagName = await element.evaluate(el => el.tagName.toLowerCase());
    
    if (tagName === 'img') {
      const src = await element.getAttribute('src');
      
      if (src.startsWith('data:')) {
        // Imagem em base64
        const base64Data = src.replace(/^data:image\/\w+;base64,/, '');
        await fs.writeFile(outputPath, Buffer.from(base64Data, 'base64'));
      } else if (src.startsWith('blob:') || src.startsWith('http')) {
        // Fazer screenshot do elemento
        await element.screenshot({ path: outputPath });
      }
    } else if (tagName === 'canvas') {
      // Capturar canvas como imagem
      await element.screenshot({ path: outputPath });
    } else {
      // Fallback: screenshot do elemento
      await element.screenshot({ path: outputPath });
    }
    
    return outputPath;
  }

  /**
   * Tira screenshot para debug
   */
  async screenshot(name) {
    const filepath = path.join(SCREENSHOTS_DIR, `${name}_${Date.now()}.png`);
    await this.page.screenshot({ path: filepath, fullPage: false });
    console.log(`   📸 Screenshot: ${name}`);
    return filepath;
  }

  /**
   * Inicia novo chat
   */
  async newChat() {
    console.log('\n🆕 Iniciando novo chat...');
    
    try {
      const newChatBtn = await this.page.$(SELECTORS.newChatButton);
      if (newChatBtn) {
        await newChatBtn.click();
        await this.page.waitForTimeout(1000);
        console.log('✅ Novo chat iniciado!');
        return true;
      }
    } catch (error) {
      console.log('⚠️ Não foi possível iniciar novo chat:', error.message);
    }
    
    return false;
  }

  /**
   * Fecha o navegador
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isInitialized = false;
      console.log('\n🔒 Navegador fechado');
    }
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  (async () => {
    const studio = new GoogleAIStudioV2({ headless: false });
    
    try {
      if (args.length > 0) {
        const prompt = args.join(' ');
        const imagePath = await studio.generateImage(prompt);
        console.log('\n🎉 Sucesso! Imagem salva em:', imagePath);
      } else {
        console.log(`
Uso: node google-ai-studio-v2.js [prompt]

Exemplo:
  node google-ai-studio-v2.js "A cute cat astronaut floating in space"
  node google-ai-studio-v2.js "Um pôr do sol na praia com palmeiras"
        `);
        
        // Teste padrão
        console.log('\n🧪 Executando teste padrão...');
        const imagePath = await studio.generateImage('A beautiful sunset over the ocean with palm trees');
        console.log('\n🎉 Teste concluído! Imagem:', imagePath);
      }
    } catch (error) {
      console.error('\n❌ Erro:', error.message);
    } finally {
      // Manter navegador aberto para inspeção
      console.log('\n🔍 Navegador mantido aberto. Feche manualmente quando terminar.');
    }
  })();
}

module.exports = GoogleAIStudioV2;

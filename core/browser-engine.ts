/**
 * Browser Engine - Fabrica de Conteudo
 * Engine híbrido Playwright + Puppeteer Stealth
 * 
 * @author DevSan A.G.I. (@deivisan)
 * @version 2.0.0
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Tipos
export interface BrowserConfig {
  headless?: boolean;
  userDataDir?: string;
  slowMo?: number;
  viewport?: { width: number; height: number };
  timeout?: number;
}

export interface EngineResult {
  success: boolean;
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  error?: string;
}

// Constantes
const DEFAULT_CONFIG: BrowserConfig = {
  headless: false, // Visível por padrão para debugging
  slowMo: 50,
  viewport: { width: 1920, height: 1080 },
  timeout: 60000
};

const BROWSER_DATA_DIR = join(process.cwd(), 'browser-data');
const USER_DATA_DIR = join(BROWSER_DATA_DIR, 'playwright-session');

/**
 * Browser Engine Class
 * Gerencia sessões de browser com persistência
 */
export class BrowserEngine {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: BrowserConfig;

  constructor(config: Partial<BrowserConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Garantir que diretório existe
    if (!existsSync(BROWSER_DATA_DIR)) {
      mkdirSync(BROWSER_DATA_DIR, { recursive: true });
    }
    if (!existsSync(USER_DATA_DIR)) {
      mkdirSync(USER_DATA_DIR, { recursive: true });
    }
  }

  /**
   * Lança browser com sessão persistente
   * O usuário já deve estar logado (sessão salva)
   */
  async launch(): Promise<EngineResult> {
    try {
      console.log('🚀 Iniciando browser com Playwright...');
      console.log(`📁 User data: ${USER_DATA_DIR}`);

      // Usar launchPersistentContext para manter login
      this.context = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: this.config.headless,
        slowMo: this.config.slowMo,
        viewport: this.config.viewport,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins,site-per-process',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        bypassCSP: true,
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo'
      });

      // Pegar página existente ou criar nova
      const pages = this.context.pages();
      this.page = pages.length > 0 ? pages[0] : await this.context.newPage();

      console.log('✅ Browser iniciado com sucesso!');
      
      return {
        success: true,
        context: this.context,
        page: this.page
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro ao iniciar browser:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Navega para URL
   */
  async navigate(url: string): Promise<boolean> {
    if (!this.page) {
      console.error('❌ Página não inicializada. Chame launch() primeiro.');
      return false;
    }

    try {
      console.log(`🌐 Navegando para: ${url}`);
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: this.config.timeout 
      });
      console.log('✅ Navegação concluída');
      return true;
    } catch (error) {
      console.error('❌ Erro na navegação:', error);
      return false;
    }
  }

  /**
   * Digita texto em elemento
   */
  async type(selector: string | string[], text: string): Promise<boolean> {
    if (!this.page) return false;

    const selectors = Array.isArray(selector) ? selector : [selector];
    
    for (const sel of selectors) {
      try {
        await this.page.waitForSelector(sel, { timeout: 10000 });
        await this.page.fill(sel, text);
        console.log(`✅ Texto inserido em: ${sel}`);
        return true;
      } catch {
        // Tentar próximo seletor
      }
    }
    
    console.error('❌ Nenhum seletor de input funcionou');
    return false;
  }

  /**
   * Clica em elemento
   */
  async click(selector: string | string[]): Promise<boolean> {
    if (!this.page) return false;

    const selectors = Array.isArray(selector) ? selector : [selector];
    
    for (const sel of selectors) {
      try {
        await this.page.waitForSelector(sel, { timeout: 10000 });
        await this.page.click(sel);
        console.log(`✅ Click em: ${sel}`);
        return true;
      } catch {
        // Tentar próximo seletor
      }
    }
    
    console.error('❌ Nenhum seletor de botão funcionou');
    return false;
  }

  /**
   * Aguarda elemento aparecer
   */
  async waitFor(selector: string | string[], timeout = 30000): Promise<boolean> {
    if (!this.page) return false;

    const selectors = Array.isArray(selector) ? selector : [selector];
    
    for (const sel of selectors) {
      try {
        await this.page.waitForSelector(sel, { timeout });
        console.log(`✅ Elemento encontrado: ${sel}`);
        return true;
      } catch {
        // Tentar próximo
      }
    }
    
    return false;
  }

  /**
   * Captura screenshot
   */
  async screenshot(path?: string): Promise<Buffer | null> {
    if (!this.page) return null;

    try {
      const screenshotPath = path || join(BROWSER_DATA_DIR, `screenshot_${Date.now()}.png`);
      const buffer = await this.page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      console.log(`📸 Screenshot salvo: ${screenshotPath}`);
      return buffer;
    } catch (error) {
      console.error('❌ Erro ao capturar screenshot:', error);
      return null;
    }
  }

  /**
   * Extrai texto de elemento
   */
  async getText(selector: string | string[]): Promise<string | null> {
    if (!this.page) return null;

    const selectors = Array.isArray(selector) ? selector : [selector];
    
    for (const sel of selectors) {
      try {
        const element = await this.page.waitForSelector(sel, { timeout: 10000 });
        if (element) {
          const text = await element.textContent();
          return text?.trim() || null;
        }
      } catch {
        // Tentar próximo
      }
    }
    
    return null;
  }

  /**
   * Extrai URL de imagem
   */
  async getImageUrl(selector: string | string[]): Promise<string | null> {
    if (!this.page) return null;

    const selectors = Array.isArray(selector) ? selector : [selector];
    
    for (const sel of selectors) {
      try {
        const element = await this.page.waitForSelector(sel, { timeout: 30000 });
        if (element) {
          const src = await element.getAttribute('src');
          console.log(`🖼️ Imagem encontrada: ${src?.substring(0, 50)}...`);
          return src;
        }
      } catch {
        // Tentar próximo
      }
    }
    
    return null;
  }

  /**
   * Retorna página atual
   */
  getPage(): Page | null {
    return this.page;
  }

  /**
   * Retorna contexto atual
   */
  getContext(): BrowserContext | null {
    return this.context;
  }

  /**
   * Fecha browser
   */
  async close(): Promise<void> {
    try {
      if (this.context) {
        await this.context.close();
        this.context = null;
        this.page = null;
      }
      console.log('🔒 Browser fechado');
    } catch (error) {
      console.error('❌ Erro ao fechar browser:', error);
    }
  }

  /**
   * Verifica se está logado em um serviço
   */
  async checkLogin(url: string, loggedInSelector: string): Promise<boolean> {
    if (!this.page) return false;

    try {
      await this.navigate(url);
      await this.page.waitForTimeout(2000);
      
      const isLoggedIn = await this.page.$(loggedInSelector);
      if (isLoggedIn) {
        console.log('✅ Sessão ativa - usuário logado');
        return true;
      } else {
        console.log('⚠️ Usuário não logado - fazer login manual');
        return false;
      }
    } catch {
      return false;
    }
  }
}

// CLI Mode - Executar diretamente
const isMainModule = import.meta.main || process.argv[1]?.endsWith('browser-engine.ts');

if (isMainModule) {
  const args = process.argv.slice(2);
  
  if (args.includes('--check')) {
    console.log('🔍 Verificando sessões de browser...');
    console.log(`📁 Diretório de dados: ${BROWSER_DATA_DIR}`);
    console.log(`📁 Sessão do usuário: ${USER_DATA_DIR}`);
    
    if (existsSync(USER_DATA_DIR)) {
      console.log('✅ Diretório de sessão existe');
    } else {
      console.log('⚠️ Diretório de sessão não existe - será criado no primeiro uso');
    }
  } else if (args.includes('--setup')) {
    console.log('🚀 Iniciando setup do browser...');
    console.log('📌 O browser abrirá. Faça login manualmente nos serviços desejados.');
    console.log('📌 Depois feche o browser para salvar a sessão.');
    
    const engine = new BrowserEngine({ headless: false });
    await engine.launch();
    await engine.navigate('https://aistudio.google.com');
    
    // Manter aberto por 5 minutos para login manual
    console.log('⏳ Browser aberto por 5 minutos para login manual...');
    console.log('🔒 Feche o browser quando terminar para salvar sessão.');
  } else {
    console.log(`
🚀 Browser Engine - Fabrica de Conteudo

Uso:
  bun run core/browser-engine.ts --check   Verificar sessões existentes
  bun run core/browser-engine.ts --setup   Configurar sessão (login manual)

Exemplo programático:
  import { BrowserEngine } from './core/browser-engine';
  
  const engine = new BrowserEngine();
  await engine.launch();
  await engine.navigate('https://aistudio.google.com');
`);
  }
}

export default BrowserEngine;

/**
 * Gerenciador de Sessões do Navegador
 * Mantém sessões persistentes para evitar login repetido
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/playwright.config');

class BrowserSessionManager {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.userDataDir = config.userDataDir;
  }

  /**
   * Inicializa o navegador com sessão persistente
   */
  async initialize(options = {}) {
    const headless = options.headless ?? config.browser.headless;
    
    console.log(`🚀 Iniciando navegador (headless: ${headless})...`);
    
    // Garantir que o diretório de dados existe
    await fs.mkdir(this.userDataDir, { recursive: true });
    
    // Lançar contexto persistente
    this.context = await chromium.launchPersistentContext(this.userDataDir, {
      headless,
      slowMo: config.browser.slowMo,
      viewport: config.viewport,
      acceptDownloads: true,
      ignoreHTTPSErrors: true,
      args: config.browser.args,
      userAgent: config.userAgents[Math.floor(Math.random() * config.userAgents.length)]
    });
    
    // Obter página existente ou criar nova
    const pages = this.context.pages();
    this.page = pages.length > 0 ? pages[0] : await this.context.newPage();
    
    // Configurar timeouts
    this.page.setDefaultTimeout(config.browser.timeout);
    this.page.setDefaultNavigationTimeout(config.timeouts.navigation);
    
    console.log('✅ Navegador iniciado com sucesso!');
    return this;
  }

  /**
   * Obtém uma nova página
   */
  async newPage() {
    return await this.context.newPage();
  }

  /**
   * Navega para uma URL
   */
  async navigate(url) {
    console.log(`📍 Navegando para: ${url}`);
    await this.page.goto(url, { waitUntil: 'networkidle' });
    return this.page;
  }

  /**
   * Verifica se está logado em um serviço
   */
  async checkLogin(service) {
    const serviceConfig = config.services[service];
    if (!serviceConfig) {
      throw new Error(`Serviço não configurado: ${service}`);
    }
    
    await this.navigate(serviceConfig.url);
    
    // Verificar indicadores de login (varia por serviço)
    const loginIndicators = {
      googleAIStudio: 'img[alt*="Account"], .user-avatar, [data-email]',
      bingImageCreator: '#id_n, .id_avatar, .mectrl_profilepic',
      leonardoAI: '.user-menu, .avatar, [data-testid="user-menu"]'
    };
    
    const indicator = loginIndicators[service];
    if (!indicator) return true;
    
    try {
      await this.page.waitForSelector(indicator, { timeout: 5000 });
      console.log(`✅ Logado em ${service}`);
      return true;
    } catch {
      console.log(`❌ Não logado em ${service}`);
      return false;
    }
  }

  /**
   * Configura sessão inicial (login manual)
   */
  async setupSession() {
    console.log('\n🔐 CONFIGURAÇÃO DE SESSÃO');
    console.log('=' .repeat(50));
    console.log('O navegador abrirá para você fazer login nos serviços.');
    console.log('Após fazer login em cada serviço, a sessão será salva.\n');
    
    // Abrir em modo visível para login manual
    await this.initialize({ headless: false });
    
    const services = [
      { name: 'Google AI Studio', url: 'https://aistudio.google.com', key: 'googleAIStudio' },
      { name: 'Bing Image Creator', url: 'https://www.bing.com/images/create', key: 'bingImageCreator' },
      { name: 'Leonardo.ai', url: 'https://app.leonardo.ai', key: 'leonardoAI' }
    ];
    
    for (const service of services) {
      console.log(`\n📌 ${service.name}`);
      console.log(`   URL: ${service.url}`);
      
      await this.navigate(service.url);
      
      const isLoggedIn = await this.checkLogin(service.key);
      
      if (!isLoggedIn) {
        console.log(`   ⏳ Aguardando login... (faça login no navegador)`);
        console.log(`   Pressione ENTER quando terminar o login.`);
        
        // Aguardar input do usuário
        await this.waitForUserInput();
      }
    }
    
    console.log('\n✅ Configuração de sessão concluída!');
    console.log('   As sessões foram salvas em:', this.userDataDir);
    
    return this;
  }

  /**
   * Aguarda input do usuário no terminal
   */
  async waitForUserInput() {
    return new Promise(resolve => {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('', () => {
        rl.close();
        resolve();
      });
    });
  }

  /**
   * Verifica status de todas as sessões
   */
  async checkAllSessions() {
    console.log('\n🔍 VERIFICANDO SESSÕES');
    console.log('=' .repeat(50));
    
    await this.initialize({ headless: true });
    
    const services = ['googleAIStudio', 'bingImageCreator', 'leonardoAI'];
    const results = {};
    
    for (const service of services) {
      results[service] = await this.checkLogin(service);
    }
    
    console.log('\n📊 Resultado:');
    for (const [service, isLoggedIn] of Object.entries(results)) {
      const status = isLoggedIn ? '✅ Logado' : '❌ Não logado';
      console.log(`   ${service}: ${status}`);
    }
    
    await this.close();
    return results;
  }

  /**
   * Faz backup da sessão
   */
  async backupSession(backupPath) {
    const backupDir = backupPath || path.join(this.userDataDir, '../browser-data-backup');
    
    console.log(`📦 Fazendo backup da sessão para: ${backupDir}`);
    
    // Copiar diretório recursivamente
    await this.copyDir(this.userDataDir, backupDir);
    
    console.log('✅ Backup concluído!');
    return backupDir;
  }

  /**
   * Restaura sessão de backup
   */
  async restoreSession(backupPath) {
    console.log(`📦 Restaurando sessão de: ${backupPath}`);
    
    // Remover sessão atual
    await fs.rm(this.userDataDir, { recursive: true, force: true });
    
    // Copiar backup
    await this.copyDir(backupPath, this.userDataDir);
    
    console.log('✅ Sessão restaurada!');
  }

  /**
   * Copia diretório recursivamente
   */
  async copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Limpa sessão (logout de todos os serviços)
   */
  async clearSession() {
    console.log('🗑️ Limpando sessão...');
    
    await fs.rm(this.userDataDir, { recursive: true, force: true });
    await fs.mkdir(this.userDataDir, { recursive: true });
    
    console.log('✅ Sessão limpa!');
  }

  /**
   * Fecha o navegador
   */
  async close() {
    if (this.context) {
      await this.context.close();
      this.context = null;
      this.page = null;
      console.log('🔒 Navegador fechado');
    }
  }

  /**
   * Obtém a página atual
   */
  getPage() {
    return this.page;
  }

  /**
   * Obtém o contexto atual
   */
  getContext() {
    return this.context;
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const manager = new BrowserSessionManager();
  
  (async () => {
    try {
      if (args.includes('--setup')) {
        await manager.setupSession();
      } else if (args.includes('--check')) {
        await manager.checkAllSessions();
      } else if (args.includes('--clear')) {
        await manager.clearSession();
      } else if (args.includes('--backup')) {
        await manager.initialize({ headless: true });
        await manager.backupSession();
        await manager.close();
      } else {
        console.log(`
Uso: node browser-session-manager.js [opção]

Opções:
  --setup    Configurar sessão (login manual)
  --check    Verificar status das sessões
  --clear    Limpar todas as sessões
  --backup   Fazer backup da sessão atual
        `);
      }
    } catch (error) {
      console.error('Erro:', error.message);
      process.exit(1);
    } finally {
      await manager.close();
    }
  })();
}

module.exports = BrowserSessionManager;

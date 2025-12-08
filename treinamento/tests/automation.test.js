/**
 * Testes de Automação
 * Verifica se os módulos de automação estão funcionando corretamente
 */

const BrowserSessionManager = require('../automation/browser-session-manager');
const config = require('../config/playwright.config');
const fs = require('fs').promises;
const path = require('path');

class AutomationTests {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Executa todos os testes
   */
  async runAll() {
    console.log('\n🧪 EXECUTANDO TESTES DE AUTOMAÇÃO');
    console.log('=' .repeat(60));
    
    await this.testConfig();
    await this.testDirectories();
    await this.testBrowserSession();
    await this.testServices();
    
    this.printResults();
    return this.results;
  }

  /**
   * Testa configuração
   */
  async testConfig() {
    console.log('\n📋 Testando configuração...');
    
    // Verificar se config existe
    this.assert(
      'Config existe',
      config !== null && config !== undefined
    );
    
    // Verificar userDataDir
    this.assert(
      'userDataDir configurado',
      config.userDataDir && typeof config.userDataDir === 'string'
    );
    
    // Verificar browser config
    this.assert(
      'Browser config existe',
      config.browser && typeof config.browser === 'object'
    );
    
    // Verificar services config
    this.assert(
      'Services config existe',
      config.services && typeof config.services === 'object'
    );
  }

  /**
   * Testa diretórios necessários
   */
  async testDirectories() {
    console.log('\n📁 Testando diretórios...');
    
    const dirs = [
      path.join(__dirname, '../../assets'),
      path.join(__dirname, '../../output'),
      path.join(__dirname, '../../strategies')
    ];
    
    for (const dir of dirs) {
      try {
        await fs.access(dir);
        this.assert(`Diretório existe: ${path.basename(dir)}`, true);
      } catch {
        // Tentar criar
        try {
          await fs.mkdir(dir, { recursive: true });
          this.assert(`Diretório criado: ${path.basename(dir)}`, true);
        } catch (error) {
          this.assert(`Diretório acessível: ${path.basename(dir)}`, false, error.message);
        }
      }
    }
  }

  /**
   * Testa gerenciador de sessão do navegador
   */
  async testBrowserSession() {
    console.log('\n🌐 Testando gerenciador de sessão...');
    
    const manager = new BrowserSessionManager();
    
    // Verificar instanciação
    this.assert(
      'BrowserSessionManager instanciado',
      manager !== null
    );
    
    // Verificar userDataDir
    this.assert(
      'userDataDir definido no manager',
      manager.userDataDir && typeof manager.userDataDir === 'string'
    );
    
    // Testar inicialização (sem abrir navegador real em CI)
    if (process.env.CI !== 'true') {
      try {
        await manager.initialize({ headless: true });
        this.assert('Navegador inicializado', true);
        
        // Verificar página
        const page = manager.getPage();
        this.assert('Página obtida', page !== null);
        
        await manager.close();
        this.assert('Navegador fechado', true);
      } catch (error) {
        this.assert('Navegador funcional', false, error.message);
      }
    } else {
      console.log('   ⏭️ Pulando teste de navegador em CI');
    }
  }

  /**
   * Testa configuração de serviços
   */
  async testServices() {
    console.log('\n🔌 Testando configuração de serviços...');
    
    const servicesConfig = require('../config/services.json');
    
    // Verificar estrutura
    this.assert(
      'Services config carregado',
      servicesConfig && servicesConfig.services
    );
    
    // Verificar serviços de texto
    this.assert(
      'Serviços de texto configurados',
      Array.isArray(servicesConfig.services.text) && servicesConfig.services.text.length > 0
    );
    
    // Verificar serviços de imagem
    this.assert(
      'Serviços de imagem configurados',
      Array.isArray(servicesConfig.services.image) && servicesConfig.services.image.length > 0
    );
    
    // Verificar serviços de vídeo
    this.assert(
      'Serviços de vídeo configurados',
      Array.isArray(servicesConfig.services.video) && servicesConfig.services.video.length > 0
    );
    
    // Verificar prioridades padrão
    this.assert(
      'Prioridades padrão configuradas',
      servicesConfig.defaultPriority && 
      servicesConfig.defaultPriority.text &&
      servicesConfig.defaultPriority.image
    );
  }

  /**
   * Função de asserção
   */
  assert(name, condition, errorMessage = null) {
    const result = {
      name,
      passed: condition,
      error: errorMessage
    };
    
    this.results.tests.push(result);
    
    if (condition) {
      this.results.passed++;
      console.log(`   ✅ ${name}`);
    } else {
      this.results.failed++;
      console.log(`   ❌ ${name}${errorMessage ? `: ${errorMessage}` : ''}`);
    }
    
    return condition;
  }

  /**
   * Imprime resultados
   */
  printResults() {
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESULTADOS DOS TESTES');
    console.log('=' .repeat(60));
    console.log(`   ✅ Passou: ${this.results.passed}`);
    console.log(`   ❌ Falhou: ${this.results.failed}`);
    console.log(`   📝 Total: ${this.results.tests.length}`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Testes que falharam:');
      this.results.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`   - ${t.name}${t.error ? `: ${t.error}` : ''}`));
    }
    
    console.log('\n' + (this.results.failed === 0 ? '✅ Todos os testes passaram!' : '⚠️ Alguns testes falharam'));
  }
}

// CLI
if (require.main === module) {
  (async () => {
    const tests = new AutomationTests();
    const results = await tests.runAll();
    process.exit(results.failed > 0 ? 1 : 0);
  })();
}

module.exports = AutomationTests;

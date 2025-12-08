# 🤖 Guia de Automação de Navegador

## Conceitos Fundamentais

### Por que automação de navegador?
- **APIs gratuitas são limitadas** - Muitos serviços de IA oferecem uso gratuito via interface web
- **Sessão persistente** - Login uma vez, use sempre
- **Sem custos** - Acesso às mesmas funcionalidades que usuários pagantes

### Fluxo de automação
```
1. Abrir navegador com sessão salva
2. Navegar para o serviço de IA
3. Inserir prompt/dados
4. Aguardar geração
5. Capturar resultado (imagem/texto/vídeo)
6. Salvar localmente
```

## Padrões de Automação

### Padrão Base
```javascript
class BaseAutomation {
  constructor(config) {
    this.config = config;
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    // Abrir navegador com sessão persistente
    this.browser = await chromium.launchPersistentContext(
      this.config.userDataDir,
      {
        headless: this.config.headless,
        viewport: this.config.viewport
      }
    );
    this.page = await this.browser.newPage();
  }

  async navigate(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async close() {
    await this.browser.close();
  }
}
```

### Padrão de Geração de Imagem
```javascript
async generateImage(prompt) {
  // 1. Navegar para o serviço
  await this.navigate('https://aistudio.google.com');
  
  // 2. Verificar se está logado
  await this.checkLogin();
  
  // 3. Inserir prompt
  await this.page.fill('#prompt-input', prompt);
  
  // 4. Clicar em gerar
  await this.page.click('#generate-button');
  
  // 5. Aguardar resultado
  await this.page.waitForSelector('#result-image', { timeout: 120000 });
  
  // 6. Capturar imagem
  const imageUrl = await this.page.$eval('#result-image', el => el.src);
  
  // 7. Baixar e salvar
  return await this.downloadImage(imageUrl);
}
```

## Estratégias de Espera

### Espera por elemento
```javascript
// Esperar elemento aparecer
await page.waitForSelector('.resultado');

// Esperar elemento desaparecer (loading)
await page.waitForSelector('.loading', { state: 'hidden' });

// Esperar elemento ter conteúdo
await page.waitForFunction(() => {
  const el = document.querySelector('.resultado');
  return el && el.textContent.length > 0;
});
```

### Espera por rede
```javascript
// Esperar todas as requisições terminarem
await page.waitForLoadState('networkidle');

// Esperar requisição específica
await page.waitForResponse(response => 
  response.url().includes('/api/generate') && 
  response.status() === 200
);
```

### Espera com timeout customizado
```javascript
// Geração de imagem pode demorar
await page.waitForSelector('#imagem', { 
  timeout: 120000,  // 2 minutos
  state: 'visible'
});
```

## Tratamento de Erros

### Retry automático
```javascript
async withRetry(fn, maxRetries = 3, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      console.log(`Tentativa ${i + 1} falhou: ${error.message}`);
      if (i < maxRetries - 1) {
        await this.wait(delay);
      } else {
        throw error;
      }
    }
  }
}
```

### Verificação de login
```javascript
async checkLogin() {
  // Verificar se há indicador de usuário logado
  const isLoggedIn = await this.page.$('.user-avatar');
  
  if (!isLoggedIn) {
    console.log('Sessão expirada. Por favor, faça login novamente.');
    // Pausar para login manual
    await this.page.pause();
  }
}
```

### Captcha handling
```javascript
async handleCaptcha() {
  const captcha = await this.page.$('.captcha-container');
  
  if (captcha) {
    console.log('Captcha detectado. Resolva manualmente...');
    // Esperar usuário resolver
    await this.page.waitForSelector('.captcha-container', { 
      state: 'hidden',
      timeout: 300000  // 5 minutos
    });
  }
}
```

## Captura de Resultados

### Capturar imagem de elemento
```javascript
async captureImage(selector, outputPath) {
  const element = await this.page.$(selector);
  
  if (!element) {
    throw new Error(`Elemento não encontrado: ${selector}`);
  }
  
  await element.screenshot({ path: outputPath });
  return outputPath;
}
```

### Baixar imagem de URL
```javascript
async downloadImage(imageUrl, outputPath) {
  const response = await this.page.request.get(imageUrl);
  const buffer = await response.body();
  
  await fs.writeFile(outputPath, buffer);
  return outputPath;
}
```

### Capturar texto gerado
```javascript
async captureText(selector) {
  await this.page.waitForSelector(selector);
  return await this.page.$eval(selector, el => el.textContent);
}
```

## Otimizações

### Pool de navegadores
```javascript
class BrowserPool {
  constructor(size = 3) {
    this.pool = [];
    this.size = size;
  }

  async getBrowser() {
    if (this.pool.length < this.size) {
      const browser = await this.createBrowser();
      this.pool.push(browser);
      return browser;
    }
    // Retornar browser menos ocupado
    return this.pool[0];
  }
}
```

### Cache de resultados
```javascript
class ResultCache {
  constructor() {
    this.cache = new Map();
  }

  async get(prompt) {
    const hash = this.hashPrompt(prompt);
    return this.cache.get(hash);
  }

  async set(prompt, result) {
    const hash = this.hashPrompt(prompt);
    this.cache.set(hash, result);
  }
}
```

## Debugging

### Modo visual
```javascript
// Sempre útil para debug
const browser = await chromium.launchPersistentContext('./browser-data', {
  headless: false,
  slowMo: 500  // Ações mais lentas para visualizar
});
```

### Logs detalhados
```javascript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
page.on('request', req => console.log('REQUEST:', req.url()));
```

### Screenshots de debug
```javascript
try {
  await this.generateImage(prompt);
} catch (error) {
  await this.page.screenshot({ path: `debug-${Date.now()}.png` });
  throw error;
}
```

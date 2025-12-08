# 🎭 Configuração do Playwright

## Visão Geral

O Playwright é a base da automação de navegador da MCP. Ele permite:
- Manter sessões persistentes (login salvo)
- Automatizar interações com sites de IA
- Capturar imagens/vídeos gerados
- Executar em modo headless ou visível

## Configuração Principal

### Arquivo: `treinamento/config/playwright.config.js`

```javascript
module.exports = {
  // Diretório para dados de sessão persistente
  userDataDir: './browser-data',
  
  // Configurações do navegador
  browser: {
    headless: false,  // false = navegador visível
    slowMo: 100,      // Delay entre ações (ms)
    timeout: 60000,   // Timeout padrão (ms)
  },
  
  // Viewport padrão
  viewport: {
    width: 1920,
    height: 1080
  },
  
  // Configurações de download
  downloads: {
    path: './assets/downloads',
    acceptDownloads: true
  }
};
```

## Modos de Execução

### Modo Visível (Desenvolvimento)
```env
PLAYWRIGHT_HEADLESS=false
```
- Navegador aparece na tela
- Útil para debug e configuração inicial
- Permite intervenção manual se necessário

### Modo Headless (Produção)
```env
PLAYWRIGHT_HEADLESS=true
```
- Navegador roda em background
- Mais rápido e usa menos recursos
- Ideal para containers Docker

## Sessão Persistente

### Como funciona
1. O Playwright usa um diretório de dados do usuário (`userDataDir`)
2. Cookies, localStorage e sessões são salvos neste diretório
3. Ao reiniciar, o navegador carrega esses dados automaticamente

### Configuração
```javascript
const browser = await chromium.launchPersistentContext('./browser-data', {
  headless: false,
  viewport: { width: 1920, height: 1080 },
  // Aceitar downloads automaticamente
  acceptDownloads: true,
  // Ignorar erros de HTTPS
  ignoreHTTPSErrors: true
});
```

### Backup de sessão
```bash
# Fazer backup
cp -r browser-data browser-data-backup

# Restaurar backup
rm -rf browser-data
cp -r browser-data-backup browser-data
```

## Configurações Avançadas

### Proxy (se necessário)
```javascript
const browser = await chromium.launchPersistentContext('./browser-data', {
  proxy: {
    server: 'http://proxy.example.com:8080',
    username: 'user',
    password: 'pass'
  }
});
```

### User Agent personalizado
```javascript
const browser = await chromium.launchPersistentContext('./browser-data', {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
});
```

### Geolocalização
```javascript
const browser = await chromium.launchPersistentContext('./browser-data', {
  geolocation: { latitude: -23.5505, longitude: -46.6333 },
  permissions: ['geolocation']
});
```

## Timeouts e Esperas

### Configuração global
```javascript
// Timeout padrão para navegação
page.setDefaultNavigationTimeout(60000);

// Timeout padrão para ações
page.setDefaultTimeout(30000);
```

### Esperas inteligentes
```javascript
// Esperar elemento aparecer
await page.waitForSelector('#resultado', { timeout: 30000 });

// Esperar rede ficar ociosa
await page.waitForLoadState('networkidle');

// Esperar função retornar true
await page.waitForFunction(() => {
  return document.querySelector('#imagem')?.src !== '';
});
```

## Captura de Screenshots e Downloads

### Screenshot
```javascript
// Capturar página inteira
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// Capturar elemento específico
const element = await page.$('#imagem-gerada');
await element.screenshot({ path: 'imagem.png' });
```

### Download de arquivos
```javascript
// Configurar listener de download
const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('#botao-download')
]);

// Salvar arquivo
await download.saveAs('./assets/images/imagem.png');
```

## Debugging

### Modo debug
```bash
PWDEBUG=1 node treinamento/examples/generate-image.js
```

### Gravar trace
```javascript
await context.tracing.start({ screenshots: true, snapshots: true });
// ... ações
await context.tracing.stop({ path: 'trace.zip' });
```

### Visualizar trace
```bash
npx playwright show-trace trace.zip
```

## Boas Práticas

1. **Sempre use sessão persistente** para evitar logins repetidos
2. **Configure timeouts adequados** - sites de IA podem ser lentos
3. **Use waitForSelector** antes de interagir com elementos
4. **Trate erros graciosamente** - sites podem mudar
5. **Respeite rate limits** - adicione delays entre requisições

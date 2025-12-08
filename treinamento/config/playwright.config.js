/**
 * Configuração do Playwright para MCP
 * Gerencia sessões persistentes e configurações de navegador
 */

const path = require('path');

module.exports = {
  // Diretório para dados de sessão persistente
  userDataDir: process.env.PLAYWRIGHT_USER_DATA_DIR || path.join(__dirname, '../../browser-data'),
  
  // Configurações do navegador
  browser: {
    headless: process.env.PLAYWRIGHT_HEADLESS === 'true',
    slowMo: parseInt(process.env.PLAYWRIGHT_SLOW_MO) || 50,
    timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT) || 60000,
    
    // Args do Chromium para melhor performance
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  },
  
  // Viewport padrão
  viewport: {
    width: 1920,
    height: 1080
  },
  
  // Configurações de download
  downloads: {
    path: path.join(__dirname, '../../assets/downloads'),
    acceptDownloads: true
  },
  
  // Timeouts específicos por operação
  timeouts: {
    navigation: 60000,
    action: 30000,
    imageGeneration: 180000,  // 3 minutos para geração de imagem
    videoGeneration: 300000,  // 5 minutos para geração de vídeo
    textGeneration: 60000
  },
  
  // Configurações de retry
  retry: {
    maxAttempts: 3,
    delayMs: 2000
  },
  
  // User agents para parecer mais humano
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ],
  
  // Serviços de IA configurados
  services: {
    googleAIStudio: {
      url: 'https://aistudio.google.com',
      loginUrl: 'https://accounts.google.com',
      selectors: {
        promptInput: 'textarea[aria-label="Type something"], .prompt-textarea, textarea',
        submitButton: 'button[aria-label="Run"], button:has-text("Run"), button:has-text("Generate")',
        response: '.response-container, .model-response, .output-text',
        imageResult: 'img.generated-image, .image-result img'
      }
    },
    bingImageCreator: {
      url: 'https://www.bing.com/images/create',
      loginUrl: 'https://login.live.com',
      selectors: {
        promptInput: '#sb_form_q, textarea[name="q"]',
        submitButton: '#create_btn_c, button[type="submit"]',
        images: '.mimg, .imgpt img',
        downloadButton: '.btn_dwnld, a[download]'
      }
    },
    leonardoAI: {
      url: 'https://app.leonardo.ai',
      loginUrl: 'https://app.leonardo.ai/auth/login',
      selectors: {
        promptInput: 'textarea[placeholder*="prompt"], textarea[placeholder*="Prompt"]',
        generateButton: 'button:has-text("Generate"), button[type="submit"]',
        resultImages: '.generated-image, img[src*="cdn.leonardo.ai"]'
      }
    }
  }
};

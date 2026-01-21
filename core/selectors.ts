/**
 * Seletores para serviços de IA - Fabrica de Conteudo
 * Atualizado: Janeiro 2026
 * 
 * IMPORTANTE: Seletores podem mudar quando as IAs atualizam interfaces.
 * Usar array de fallbacks para maior resiliência.
 */

export interface ServiceSelectors {
  url: string;
  name: string;
  promptInput: string[];
  submitButton: string[];
  responseContainer: string[];
  generatedImage?: string[];
  loadingIndicator?: string[];
  errorIndicator?: string[];
}

/**
 * Google AI Studio (Gemini)
 * Suporta: Texto, Imagem (Imagen/Nano Banana)
 */
export const GOOGLE_AI_STUDIO: ServiceSelectors = {
  url: 'https://aistudio.google.com',
  name: 'Google AI Studio',
  
  promptInput: [
    'textarea[aria-label*="Type something"]',
    'textarea[aria-label*="prompt" i]',
    'ms-autosize-textarea textarea',
    'textarea.textarea',
    '[contenteditable="true"]',
    'div[role="textbox"]'
  ],
  
  submitButton: [
    'button[aria-label*="Run" i]',
    'ms-run-button button',
    'button.run-button',
    'button:has-text("Run")',
    '[data-testid="run-button"]'
  ],
  
  responseContainer: [
    '.response-content',
    '.model-response',
    'ms-chat-turn-container',
    '[data-message-role="model"]',
    '.markdown-body'
  ],
  
  generatedImage: [
    'img[src*="googleusercontent"]',
    '.response-image img',
    'ms-image-result img',
    'img[src*="lh3.google"]',
    '.generated-image img'
  ],
  
  loadingIndicator: [
    '.loading',
    '.generating',
    '[data-generating]',
    'ms-loading-indicator',
    '.spinner'
  ],
  
  errorIndicator: [
    '.error-message',
    '[data-error]',
    '.generation-error'
  ]
};

/**
 * Bing Image Creator (DALL-E)
 * Suporta: Imagem
 * Limite: 15 boosts/dia
 */
export const BING_IMAGE_CREATOR: ServiceSelectors = {
  url: 'https://www.bing.com/images/create',
  name: 'Bing Image Creator',
  
  promptInput: [
    '#sb_form_q',
    'textarea[name="q"]',
    'input[name="q"]',
    '.b_searchbox'
  ],
  
  submitButton: [
    '#create_btn_c',
    'button[type="submit"]',
    '.b_searchboxSubmit',
    'button:has-text("Create")'
  ],
  
  responseContainer: [
    '.imgpt',
    '.img_cont',
    '#girrcc'
  ],
  
  generatedImage: [
    '.mimg',
    '.imgpt img',
    'img.mimg',
    'a.iusc img'
  ],
  
  loadingIndicator: [
    '.loading',
    '.gir_loading',
    '#gir_loading'
  ]
};

/**
 * Leonardo.ai
 * Suporta: Imagem
 * Limite: 150 tokens/dia
 */
export const LEONARDO_AI: ServiceSelectors = {
  url: 'https://app.leonardo.ai/ai-generations',
  name: 'Leonardo.ai',
  
  promptInput: [
    'textarea[placeholder*="prompt" i]',
    'textarea[data-testid="prompt-input"]',
    '.prompt-input textarea'
  ],
  
  submitButton: [
    'button:has-text("Generate")',
    '[data-testid="generate-button"]',
    '.generate-btn'
  ],
  
  responseContainer: [
    '.generation-result',
    '.image-grid',
    '[data-testid="generation-container"]'
  ],
  
  generatedImage: [
    '.generation-image img',
    '[data-testid="generated-image"]',
    '.image-card img'
  ],
  
  loadingIndicator: [
    '.generating',
    '[data-generating="true"]',
    '.progress-indicator'
  ]
};

/**
 * ChatGPT Free
 * Suporta: Texto
 * NOTA: Pode ter Cloudflare - usar Puppeteer Stealth se necessário
 */
export const CHATGPT_FREE: ServiceSelectors = {
  url: 'https://chat.openai.com',
  name: 'ChatGPT',
  
  promptInput: [
    'textarea[data-id="root"]',
    '#prompt-textarea',
    'textarea[placeholder*="message" i]'
  ],
  
  submitButton: [
    'button[data-testid="send-button"]',
    'button[aria-label*="Send" i]',
    'form button[type="submit"]'
  ],
  
  responseContainer: [
    '[data-message-author-role="assistant"]',
    '.agent-turn',
    '.markdown.prose'
  ],
  
  loadingIndicator: [
    '.result-streaming',
    '[data-testid="loading"]',
    '.typing-indicator'
  ]
};

/**
 * Grok (X.com)
 * Suporta: Texto, Imagem
 * NOTA: Cloudflare ativo - REQUER Puppeteer Stealth
 */
export const GROK: ServiceSelectors = {
  url: 'https://grok.com',
  name: 'Grok',
  
  promptInput: [
    'textarea[placeholder*="Ask" i]',
    'textarea.chat-input',
    '[contenteditable="true"]'
  ],
  
  submitButton: [
    'button[aria-label*="Send" i]',
    'button:has-text("Send")',
    '.send-button'
  ],
  
  responseContainer: [
    '.message-content',
    '[data-role="assistant"]',
    '.grok-response'
  ],
  
  generatedImage: [
    '.generated-image img',
    'img[src*="grok"]'
  ],
  
  loadingIndicator: [
    '.loading',
    '.generating'
  ]
};

/**
 * Mapa de todos os serviços
 */
export const SERVICES = {
  'google-ai-studio': GOOGLE_AI_STUDIO,
  'gemini': GOOGLE_AI_STUDIO,
  'bing-image-creator': BING_IMAGE_CREATOR,
  'bing': BING_IMAGE_CREATOR,
  'leonardo-ai': LEONARDO_AI,
  'leonardo': LEONARDO_AI,
  'chatgpt': CHATGPT_FREE,
  'grok': GROK
} as const;

export type ServiceName = keyof typeof SERVICES;

/**
 * Helper para encontrar seletor que funciona
 */
export async function findWorkingSelector(
  page: any,
  selectors: string[],
  timeout = 5000
): Promise<string | null> {
  for (const selector of selectors) {
    try {
      const element = await page.waitForSelector(selector, { timeout });
      if (element) {
        console.log(`✅ Seletor encontrado: ${selector}`);
        return selector;
      }
    } catch {
      // Tentar próximo
    }
  }
  console.log(`❌ Nenhum seletor funcionou de ${selectors.length} tentativas`);
  return null;
}

/**
 * Helper para obter serviço pelo nome
 */
export function getService(name: string): ServiceSelectors | null {
  const key = name.toLowerCase().replace(/\s+/g, '-');
  return SERVICES[key as ServiceName] || null;
}

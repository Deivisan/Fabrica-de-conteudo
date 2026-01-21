/**
 * AI Interaction - Fabrica de Conteudo
 * Módulo para interagir com IAs via browser automation
 * 
 * @author DevSan A.G.I. (@deivisan)
 * @version 2.0.0
 */

import { BrowserEngine } from './browser-engine';
import { 
  GOOGLE_AI_STUDIO, 
  BING_IMAGE_CREATOR,
  SERVICES,
  ServiceSelectors,
  getService 
} from './selectors';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

// Tipos
export interface AIInteractionConfig {
  service: string;
  headless?: boolean;
  timeout?: number;
  screenshotsDir?: string;
}

export interface GenerationResult {
  success: boolean;
  prompt: string;
  response?: string;
  imageUrl?: string;
  imagePath?: string;
  screenshotPath?: string;
  duration?: number;
  error?: string;
}

// Constantes
const DEFAULT_CONFIG: AIInteractionConfig = {
  service: 'gemini',
  headless: false,
  timeout: 120000, // 2 minutos para geração
  screenshotsDir: join(process.cwd(), 'assets', 'generated')
};

/**
 * AI Interaction Class
 * Abstração para interagir com diferentes serviços de IA
 */
export class AIInteraction {
  private engine: BrowserEngine;
  private config: AIInteractionConfig;
  private selectors: ServiceSelectors;

  constructor(config: Partial<AIInteractionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.engine = new BrowserEngine({ 
      headless: this.config.headless,
      timeout: this.config.timeout 
    });
    
    // Obter seletores do serviço
    const service = getService(this.config.service);
    if (!service) {
      throw new Error(`Serviço não suportado: ${this.config.service}`);
    }
    this.selectors = service;

    // Garantir diretório de screenshots
    if (!existsSync(this.config.screenshotsDir!)) {
      mkdirSync(this.config.screenshotsDir!, { recursive: true });
    }
  }

  /**
   * Inicializa conexão com o serviço
   */
  async connect(): Promise<boolean> {
    console.log(`🔌 Conectando a: ${this.selectors.name}`);
    
    const result = await this.engine.launch();
    if (!result.success) {
      console.error('❌ Falha ao iniciar browser');
      return false;
    }

    const navigated = await this.engine.navigate(this.selectors.url);
    if (!navigated) {
      console.error('❌ Falha ao navegar para o serviço');
      return false;
    }

    // Aguardar carregamento
    await this.engine.getPage()?.waitForTimeout(2000);
    
    console.log(`✅ Conectado a ${this.selectors.name}`);
    return true;
  }

  /**
   * Envia prompt para a IA e aguarda resposta
   */
  async sendPrompt(prompt: string): Promise<GenerationResult> {
    const startTime = Date.now();
    const timestamp = startTime;
    
    console.log(`📝 Enviando prompt: "${prompt.substring(0, 50)}..."`);

    try {
      // 1. Encontrar e preencher input
      const typed = await this.engine.type(this.selectors.promptInput, prompt);
      if (!typed) {
        return {
          success: false,
          prompt,
          error: 'Não foi possível encontrar campo de input'
        };
      }

      // Pequeno delay antes de clicar
      await this.engine.getPage()?.waitForTimeout(500);

      // 2. Clicar no botão de submit
      const clicked = await this.engine.click(this.selectors.submitButton);
      if (!clicked) {
        return {
          success: false,
          prompt,
          error: 'Não foi possível encontrar botão de submit'
        };
      }

      console.log('⏳ Aguardando resposta da IA...');

      // 3. Aguardar loading terminar (se houver indicador)
      if (this.selectors.loadingIndicator) {
        try {
          // Esperar loading aparecer
          await this.engine.waitFor(this.selectors.loadingIndicator, 5000);
          // Esperar loading desaparecer
          await this.engine.getPage()?.waitForFunction(
            (selector: string) => !document.querySelector(selector),
            this.selectors.loadingIndicator[0],
            { timeout: this.config.timeout }
          );
        } catch {
          // Loading pode não aparecer, continuar
        }
      }

      // 4. Aguardar resposta aparecer
      const hasResponse = await this.engine.waitFor(
        this.selectors.responseContainer, 
        this.config.timeout
      );

      if (!hasResponse) {
        // Tirar screenshot do estado atual para debug
        const screenshotPath = join(
          this.config.screenshotsDir!, 
          `error_${timestamp}.png`
        );
        await this.engine.screenshot(screenshotPath);
        
        return {
          success: false,
          prompt,
          screenshotPath,
          error: 'Timeout aguardando resposta'
        };
      }

      // 5. Extrair resposta
      const responseText = await this.engine.getText(this.selectors.responseContainer);
      
      // 6. Tentar extrair imagem (se serviço suporta)
      let imageUrl: string | null = null;
      let imagePath: string | null = null;
      
      if (this.selectors.generatedImage) {
        await this.engine.getPage()?.waitForTimeout(2000); // Esperar imagem carregar
        imageUrl = await this.engine.getImageUrl(this.selectors.generatedImage);
        
        if (imageUrl) {
          // Baixar imagem
          imagePath = await this.downloadImage(imageUrl, timestamp);
        }
      }

      // 7. Screenshot final
      const screenshotPath = join(
        this.config.screenshotsDir!, 
        `result_${timestamp}.png`
      );
      await this.engine.screenshot(screenshotPath);

      const duration = Date.now() - startTime;
      console.log(`✅ Resposta recebida em ${(duration / 1000).toFixed(1)}s`);

      return {
        success: true,
        prompt,
        response: responseText || undefined,
        imageUrl: imageUrl || undefined,
        imagePath: imagePath || undefined,
        screenshotPath,
        duration
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Erro durante geração:', errorMessage);
      
      // Screenshot de erro
      const screenshotPath = join(
        this.config.screenshotsDir!, 
        `error_${timestamp}.png`
      );
      await this.engine.screenshot(screenshotPath);

      return {
        success: false,
        prompt,
        screenshotPath,
        error: errorMessage,
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Baixa imagem de URL
   */
  private async downloadImage(url: string, timestamp: number): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error('❌ Falha ao baixar imagem:', response.status);
        return null;
      }

      const buffer = await response.arrayBuffer();
      const imagePath = join(
        this.config.screenshotsDir!,
        `generated_${timestamp}.png`
      );
      
      writeFileSync(imagePath, Buffer.from(buffer));
      console.log(`💾 Imagem salva: ${imagePath}`);
      
      return imagePath;
    } catch (error) {
      console.error('❌ Erro ao baixar imagem:', error);
      return null;
    }
  }

  /**
   * Gera texto usando a IA
   */
  async generateText(prompt: string): Promise<GenerationResult> {
    return this.sendPrompt(prompt);
  }

  /**
   * Gera imagem usando a IA
   * Adiciona prefixo para forçar geração de imagem
   */
  async generateImage(prompt: string): Promise<GenerationResult> {
    // Adicionar contexto de imagem se necessário
    const imagePrompt = prompt.toLowerCase().includes('generate') || 
                        prompt.toLowerCase().includes('create') ||
                        prompt.toLowerCase().includes('draw')
      ? prompt
      : `Generate a high quality image of: ${prompt}`;
    
    return this.sendPrompt(imagePrompt);
  }

  /**
   * Retorna engine de browser (para operações avançadas)
   */
  getEngine(): BrowserEngine {
    return this.engine;
  }

  /**
   * Fecha conexão
   */
  async disconnect(): Promise<void> {
    await this.engine.close();
    console.log('🔌 Desconectado');
  }
}

/**
 * Factory function para criar interação rapidamente
 */
export async function createAISession(service: string = 'gemini'): Promise<AIInteraction> {
  const ai = new AIInteraction({ service });
  await ai.connect();
  return ai;
}

// CLI Mode
const isMainModule = import.meta.main || process.argv[1]?.endsWith('ai-interaction.ts');

if (isMainModule) {
  const args = process.argv.slice(2);
  const service = args[0] || 'gemini';
  const prompt = args[1] || 'Hello! Tell me a short joke.';

  console.log(`
🤖 AI Interaction - Fabrica de Conteudo

Serviço: ${service}
Prompt: ${prompt}
`);

  try {
    const ai = new AIInteraction({ service, headless: false });
    
    const connected = await ai.connect();
    if (!connected) {
      console.error('❌ Falha ao conectar');
      process.exit(1);
    }

    // Aguardar um pouco para garantir carregamento
    console.log('⏳ Aguardando 3s para carregamento completo...');
    await ai.getEngine().getPage()?.waitForTimeout(3000);

    const result = await ai.sendPrompt(prompt);
    
    console.log('\n📊 Resultado:');
    console.log(JSON.stringify(result, null, 2));

    // Manter browser aberto por 10s para visualização
    console.log('\n⏳ Browser ficará aberto por 10s para visualização...');
    await ai.getEngine().getPage()?.waitForTimeout(10000);

    await ai.disconnect();
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

export default AIInteraction;

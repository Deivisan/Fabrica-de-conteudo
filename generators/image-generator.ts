/**
 * Image Generator - Fabrica de Conteudo
 * Gerador de imagens via IAs gratuitas (Gemini, Bing, Leonardo)
 * 
 * Uso: 
 *   bun run generators/image-generator.ts --prompt "cachorro fofo"
 *   bun run generators/image-generator.ts --client MeuCao --post 1
 * 
 * @author DevSan A.G.I. (@deivisan)
 * @version 2.0.0
 */

import { AIInteraction, createAISession, getService, GOOGLE_AI_STUDIO } from '../core';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';

// Tipos
export interface ImageGenerationConfig {
  service?: string;
  prompt?: string;
  client?: string;
  postNumber?: number;
  outputDir?: string;
  headless?: boolean;
}

export interface ImageResult {
  success: boolean;
  prompt: string;
  imagePath?: string;
  thumbnailPath?: string;
  service: string;
  duration: number;
  error?: string;
}

// Constantes
const DEFAULT_OUTPUT_DIR = join(process.cwd(), 'assets', 'generated', 'images');
const CLIENTS_DIR = join(process.cwd(), 'clients');

/**
 * Ler prompt de cliente específico
 */
async function getClientPrompt(client: string, postNumber: number): Promise<string | null> {
  const promptsPath = join(CLIENTS_DIR, client, 'prompts');
  
  // Tentar encontrar arquivo de prompts
  const possibleFiles = [
    join(promptsPath, `${client.toLowerCase()}-prompts.md`),
    join(promptsPath, 'image-prompts.md'),
    join(promptsPath, 'prompts.md')
  ];

  for (const file of possibleFiles) {
    if (existsSync(file)) {
      console.log(`📄 Lendo prompts de: ${file}`);
      const content = readFileSync(file, 'utf-8');
      
      // Extrair prompt baseado em post number (formato #1, #2, etc)
      const postMatch = content.match(new RegExp(`#?\\s*${postNumber}[\\s\\.\\-](.+?)(?=#\\d|#|$)`, 'i'));
      if (postMatch) {
        return postMatch[1].trim();
      }
      
      // Fallback: procurar por padrão de lista
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.includes(`${postNumber}`) || line.includes(`Post ${postNumber}`)) {
          return line.replace(/^[\d\.\-\*]+\s*/, '').trim();
        }
      }
    }
  }
  
  return null;
}

/**
 * Gerador de Imagens Principal
 */
export class ImageGenerator {
  private config: ImageGenerationConfig;
  private outputDir: string;

  constructor(config: Partial<ImageGenerationConfig> = {}) {
    this.config = {
      service: 'gemini',
      outputDir: DEFAULT_OUTPUT_DIR,
      headless: false,
      ...config
    };
    this.outputDir = this.config.outputDir!;

    // Garantir diretório
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Gerar imagem a partir de prompt direto
   */
  async generate(prompt?: string): Promise<ImageResult> {
    const effectivePrompt = prompt || this.config.prompt;
    
    if (!effectivePrompt) {
      return {
        success: false,
        prompt: '',
        service: this.config.service!,
        duration: 0,
        error: 'Nenhum prompt fornecido'
      };
    }

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          🖼️  GERADOR DE IMAGENS - FABRICA DE CONTEÚDO        ║
╠═══════════════════════════════════════════════════════════════╣
║  Serviço: ${this.config.service?.padEnd(44)}║
║  Prompt: ${effectivePrompt.substring(0, 42).padEnd(44)}║
╚═══════════════════════════════════════════════════════════════╝`);

    const startTime = Date.now();

    try {
      // Criar sessão com IA
      const ai = await createAISession(this.config.service!);
      
      // Gerar imagem
      const result = await ai.generateImage(effectivePrompt);
      
      // Fechar sessão
      await ai.disconnect();

      const duration = Date.now() - startTime;

      if (result.success && result.imagePath) {
        // Mover para diretório correto se necessário
        const finalPath = this.saveToOutputDir(result.imagePath);
        
        console.log(`
✅ SUCESSO!
⏱️  Duração: ${(duration / 1000).toFixed(1)}s
💾 Salvo em: ${finalPath}`);

        return {
          success: true,
          prompt: effectivePrompt,
          imagePath: finalPath,
          service: this.config.service!,
          duration
        };
      } else {
        console.log(`
❌ FALHA: ${result.error || 'Erro desconhecido'}`);

        if (result.screenshotPath) {
          console.log(`📸 Screenshot: ${result.screenshotPath}`);
        }

        return {
          success: false,
          prompt: effectivePrompt,
          service: this.config.service!,
          duration,
          error: result.error
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`\n❌ ERRO CRÍTICO: ${errorMessage}`);

      return {
        success: false,
        prompt: effectivePrompt,
        service: this.config.service!,
        duration: Date.now() - startTime,
        error: errorMessage
      };
    }
  }

  /**
   * Gerar imagem para cliente específico
   */
  async generateForClient(client: string, postNumber: number): Promise<ImageResult> {
    console.log(`\n📋 Gerando imagem para cliente: ${client}, Post #${postNumber}`);

    // Buscar prompt do cliente
    const prompt = await getClientPrompt(client, postNumber);
    
    if (!prompt) {
      return {
        success: false,
        prompt: '',
        service: this.config.service!,
        duration: 0,
        error: `Prompt não encontrado para ${client} post #${postNumber}`
      };
    }

    console.log(`📝 Prompt encontrado: "${prompt.substring(0, 50)}..."`);

    // Gerar imagem
    return this.generate(prompt);
  }

  /**
   * Gerar múltiplas variações de um prompt
   */
  async generateVariations(basePrompt: string, count = 4): Promise<ImageResult[]> {
    console.log(`\n🔄 Gerando ${count} variações do prompt base`);

    const results: ImageResult[] = [];
    const variations = [
      '',
      ' with vibrant colors',
      ' in minimalist style',
      ' with dramatic lighting'
    ];

    for (let i = 0; i < count; i++) {
      const prompt = basePrompt + (variations[i] || '');
      const result = await this.generate(prompt);
      results.push(result);

      // Delay entre gerações para evitar rate limiting
      if (i < count - 1) {
        console.log('⏳ Aguardando 5s para próxima geração...');
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    return results;
  }

  /**
   * Salvar arquivo no diretório de output
   */
  private saveToOutputDir(sourcePath: string): string {
    const filename = `${this.config.service}_${Date.now()}.png`;
    const destPath = join(this.outputDir, filename);

    try {
      const content = readFileSync(sourcePath);
      writeFileSync(destPath, content);
      
      // Tentar remover original
      try {
        readFileSync(sourcePath); // Verificar se existe
      } catch {
        // Arquivo já movido ou não existe
      }
      
      return destPath;
    } catch {
      return sourcePath;
    }
  }
}

// CLI Mode
const isMainModule = import.meta.main || process.argv[1]?.endsWith('image-generator.ts');

if (isMainModule) {
  const args = process.argv.slice(2);
  
  // Parse args
  const config: ImageGenerationConfig = {
    service: 'gemini',
    headless: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--service' || arg === '-s') {
      config.service = args[++i];
    } else if (arg === '--prompt' || arg === '-p') {
      config.prompt = args[++i];
    } else if (arg === '--client' || arg === '-c') {
      config.client = args[++i];
    } else if (arg === '--post' || arg === '-n') {
      config.postNumber = parseInt(args[++i]);
    } else if (arg === '--headless' || arg === '-h') {
      config.headless = true;
    } else if (arg === '--variations' || arg === '-v') {
      config.prompt = args[++i]; // Próximo arg é o prompt base
    }
  }

  // Validar
  if (!config.prompt && !config.client) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          🖼️  GERADOR DE IMAGENS - CLI                         ║
╚═══════════════════════════════════════════════════════════════╝

Uso:
  bun run generators/image-generator.ts --prompt "cachorro fofo"
  bun run generators/image-generator.ts --service bing --prompt "gato"
  bun run generators/image-generator.ts --client MeuCao --post 1
  bun run generators/image-generator.ts --variations 4 --prompt "paisagem"

Opções:
  -s, --service    Serviço: gemini, bing, leonardo (default: gemini)
  -p, --prompt     Prompt direto para geração
  -c, --client     Nome do cliente (lê de clients/<client>/prompts/)
  -n, --post       Número do post do cliente
  -v, --variations Gerar N variações do prompt
  -h, --headless   Modo headless (sem interface)

Exemplos:
  bun run generators/image-generator.ts -p " Yorkshire Terrier fofo"
  bun run generators/image-generator.ts -c MeuCao -n 1
  bun run generators/image-generator.ts -s bing -p "cachorro brincando"
`);
    process.exit(0);
  }

  // Executar
  const generator = new ImageGenerator(config);

  if (config.client && config.postNumber) {
    generator.generateForClient(config.client, config.postNumber)
      .then(result => {
        console.log('\n📊 Resultado:', JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
      });
  } else {
    generator.generate()
      .then(result => {
        console.log('\n📊 Resultado:', JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
      });
  }
}

export default ImageGenerator;

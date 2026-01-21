/**
 * Text Generator - Fabrica de Conteudo
 * Gerador de textos/posts via IAs gratuitas (Gemini, ChatGPT, Grok)
 * 
 * Uso:
 *   bun run generators/text-generator.ts --prompt "escreva um post sobre ração"
 *   bun run generators/text-generator.ts --type instagram --topic "Yorkshire"
 *   bun run generators/text-generator.ts --client MeuCao --post 1
 * 
 * @author DevSan A.G.I. (@deivisan)
 * @version 2.0.0
 */

import { AIInteraction, createAISession, GOOGLE_AI_STUDIO } from '../core';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';

// Tipos
export interface TextGenerationConfig {
  service?: string;
  prompt?: string;
  type?: 'instagram' | 'facebook' | 'blog' | 'email' | 'linkedin' | 'twitter';
  topic?: string;
  client?: string;
  postNumber?: number;
  tone?: 'professional' | 'casual' | 'humorous' | 'informative';
  length?: 'short' | 'medium' | 'long';
  outputDir?: string;
  headless?: boolean;
}

export interface TextResult {
  success: boolean;
  prompt: string;
  content: string;
  type?: string;
  wordCount: number;
  service: string;
  duration: number;
  error?: string;
}

// Constantes
const DEFAULT_OUTPUT_DIR = join(process.cwd(), 'assets', 'generated', 'text');
const CLIENTS_DIR = join(process.cwd(), 'clients');

/**
 * Templates de prompt por tipo de conteúdo
 */
const PROMPT_TEMPLATES = {
  instagram: (topic: string, tone: string) => 
    `Write an engaging Instagram post about "${topic}". 
     Tone: ${tone}.
     Include: hook, main content with emojis, call-to-action, and relevant hashtags.
     Max 2200 characters. Format: Line breaks between sections.`,

  facebook: (topic: string, tone: string) =>
    `Write a Facebook post about "${topic}".
     Tone: ${tone}.
     Include: engaging hook, valuable content, and call-to-action.
     Encourage comments and shares.`,

  blog: (topic: string, tone: string) =>
    `Write a blog article introduction and main points about "${topic}".
     Tone: ${tone}.
     Structure: Hook → Problem → Solution → Key Points.
     Make it SEO-friendly with natural keyword placement.`,

  email: (topic: string, tone: string) =>
    `Write a professional email about "${topic}".
     Tone: ${tone}.
     Structure: Subject line, greeting, body with clear value proposition, call-to-action, signature.
     Keep it concise and actionable.`,

  linkedin: (topic: string, tone: string) =>
    `Write a LinkedIn post about "${topic}".
     Tone: Professional but approachable.
     Structure: Hook with insight → Personal experience → Key takeaways → Question for engagement.
     Include relevant hashtags.`,

  twitter: (topic: string, tone: string) =>
    `Write a Twitter/X thread (3-5 tweets) about "${topic}".
     Tone: ${tone}.
     Make it engaging, use emojis sparingly, include hashtags.
     Each tweet should be under 280 characters.`
};

/**
 * Ler prompt de cliente específico
 */
async function getClientPrompt(client: string, postNumber: number, type: string): Promise<string | null> {
  const promptsPath = join(CLIENTS_DIR, client, 'prompts');
  
  const possibleFiles = [
    join(promptsPath, `${client.toLowerCase()}-prompts.md`),
    join(promptsPath, 'text-prompts.md'),
    join(promptsPath, 'prompts.md')
  ];

  for (const file of possibleFiles) {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      
      // Extrair prompt baseado em post number
      const patterns = [
        new RegExp(`#?\\s*${postNumber}[\\s\\.\\-](.+?)(?=#\\d|#|$)`, 'i'),
        new RegExp(`Post\\s*${postNumber}[^\\n]*?:\\s*(.+?)(\\n#|\\n\\d+\\.|\\n$)`, 'i')
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          return match[1].trim();
        }
      }
    }
  }
  
  return null;
}

/**
 * Gerador de Textos Principal
 */
export class TextGenerator {
  private config: TextGenerationConfig;
  private outputDir: string;

  constructor(config: Partial<TextGenerationConfig> = {}) {
    this.config = {
      service: 'gemini',
      type: 'instagram',
      tone: 'professional',
      length: 'medium',
      outputDir: DEFAULT_OUTPUT_DIR,
      headless: false,
      ...config
    };
    this.outputDir = this.config.outputDir!;

    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Gerar texto a partir de prompt direto
   */
  async generate(prompt?: string): Promise<TextResult> {
    const effectivePrompt = prompt || this.buildPrompt();
    
    if (!effectivePrompt) {
      return {
        success: false,
        prompt: '',
        content: '',
        wordCount: 0,
        service: this.config.service!,
        duration: 0,
        error: 'Nenhum prompt fornecido'
      };
    }

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          📝 GERADOR DE TEXTOS - FABRICA DE CONTEÚDO          ║
╠═══════════════════════════════════════════════════════════════╣
║  Serviço: ${this.config.service?.padEnd(44)}║
║  Tipo: ${this.config.type?.padEnd(45)}║
║  Tom: ${this.config.tone?.padEnd(45)}║
╚═══════════════════════════════════════════════════════════════╝`);

    const startTime = Date.now();

    try {
      const ai = await createAISession(this.config.service!);
      const result = await ai.generateText(effectivePrompt);
      await ai.disconnect();

      const duration = Date.now() - startTime;
      const wordCount = result.response?.split(/\s+/).length || 0;

      if (result.success && result.response) {
        // Salvar arquivo
        const filePath = this.saveToFile(result.response);
        
        console.log(`
✅ SUCESSO!
⏱️  Duração: ${(duration / 1000).toFixed(1)}s
📏 Palavras: ${wordCount}
💾 Salvo em: ${filePath}`);

        console.log(`
💬 Conteúdo Gerado:
${'─'.repeat(60)}
${result.response.substring(0, 800)}${result.response.length > 800 ? '...' : ''}
${'─'.repeat(60)}`);

        return {
          success: true,
          prompt: effectivePrompt,
          content: result.response,
          type: this.config.type,
          wordCount,
          service: this.config.service!,
          duration
        };
      } else {
        console.log(`\n❌ FALHA: ${result.error || 'Erro desconhecido'}`);
        
        return {
          success: false,
          prompt: effectivePrompt,
          content: '',
          wordCount: 0,
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
        content: '',
        wordCount: 0,
        service: this.config.service!,
        duration: Date.now() - startTime,
        error: errorMessage
      };
    }
  }

  /**
   * Construir prompt baseado em configuração
   */
  private buildPrompt(): string {
    if (this.config.prompt) {
      return this.config.prompt;
    }

    if (!this.config.topic) {
      return '';
    }

    const template = PROMPT_TEMPLATES[this.config.type!];
    if (!template) {
      return this.config.topic;
    }

    return template(this.config.topic, this.config.tone!);
  }

  /**
   * Gerar texto para cliente específico
   */
  async generateForClient(client: string, postNumber: number): Promise<TextResult> {
    console.log(`\n📋 Gerando texto para cliente: ${client}, Post #${postNumber}`);

    const prompt = await getClientPrompt(client, postNumber, this.config.type!);
    
    if (!prompt) {
      return {
        success: false,
        prompt: '',
        content: '',
        wordCount: 0,
        service: this.config.service!,
        duration: 0,
        error: `Prompt não encontrado para ${client} post #${postNumber}`
      };
    }

    console.log(`📝 Prompt encontrado: "${prompt.substring(0, 50)}..."`);
    return this.generate(prompt);
  }

  /**
   * Gerar múltiplos posts para uma semana
   */
  async generateWeek(client: string, startPost = 1, count = 6): Promise<TextResult[]> {
    console.log(`\n📅 Gerando ${count} posts para semana do cliente: ${client}`);

    const results: TextResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const postNum = startPost + i;
      console.log(`\n--- Post #${postNum} ---`);
      
      const result = await this.generateForClient(client, postNum);
      results.push(result);

      // Delay entre gerações
      if (i < count - 1) {
        console.log('⏳ Aguardando 3s...');
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    // Salvar todos em um arquivo
    if (results.every(r => r.success)) {
      this.saveWeekToFile(client, results);
    }

    return results;
  }

  /**
   * Salvar conteúdo em arquivo
   */
  private saveToFile(content: string): string {
    const filename = `${this.config.type}_${Date.now()}.txt`;
    const filePath = join(this.outputDir, filename);
    
    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  /**
   * Salvar semana completa em arquivo único
   */
  private saveWeekToFile(client: string, results: TextResult[]): string {
    const filename = `${client}_week_${Date.now()}.md`;
    const filePath = join(this.outputDir, filename);

    let content = `# ${client} - Semana de Posts\n\n`;
    content += `Gerado em: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    content += `---\n\n`;

    results.forEach((result, i) => {
      content += `## Post ${i + 1}\n\n`;
      content += `**Prompt:** ${result.prompt}\n\n`;
      content += `**Tipo:** ${result.type}\n\n`;
      content += `${result.content}\n\n`;
      content += `---\n\n`;
    });

    writeFileSync(filePath, content, 'utf-8');
    console.log(`\n💾 Semana salva em: ${filePath}`);
    return filePath;
  }
}

// CLI Mode
const isMainModule = import.meta.main || process.argv[1]?.endsWith('text-generator.ts');

if (isMainModule) {
  const args = process.argv.slice(2);
  
  const config: TextGenerationConfig = {
    service: 'gemini',
    type: 'instagram',
    tone: 'professional',
    headless: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--service' || arg === '-s') {
      config.service = args[++i];
    } else if (arg === '--prompt' || arg === '-p') {
      config.prompt = args[++i];
    } else if (arg === '--type' || arg === '-t') {
      config.type = args[++i] as any;
    } else if (arg === '--topic' || arg === '-k') {
      config.topic = args[++i];
    } else if (arg === '--tone' || arg === '-T') {
      config.tone = args[++i] as any;
    } else if (arg === '--client' || arg === '-c') {
      config.client = args[++i];
    } else if (arg === '--post' || arg === '-n') {
      config.postNumber = parseInt(args[++i]);
    } else if (arg === '--week' || arg === '-w') {
      config.postNumber = parseInt(args[++i]); // start post
      // Flag para gerar semana
      config.prompt = '__WEEK_MODE__';
    } else if (arg === '--headless' || arg === '-h') {
      config.headless = true;
    }
  }

  if (!config.prompt && !config.client && !config.topic) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          📝 GERADOR DE TEXTOS - CLI                           ║
╚═══════════════════════════════════════════════════════════════╝

Uso:
  bun run generators/text-generator.ts --prompt "escreva sobre cães"
  bun run generators/text-generator.ts --type instagram --topic "Yorkshire"
  bun run generators/text-generator.ts --client MeuCao --post 1
  bun run generators/text-generator.ts --client MeuCao --week 1

Opções:
  -s, --service    Serviço: gemini, chatgpt, grok (default: gemini)
  -p, --prompt     Prompt direto para geração
  -t, --type       Tipo: instagram, facebook, blog, email, linkedin, twitter
  -k, --topic      Tópico do conteúdo (usa template)
  -c, --client     Nome do cliente (lê de clients/<client>/prompts/)
  -n, --post       Número do post do cliente
  -w, --start      Iniciar geração de semana a partir do post N
  -T, --tone       Tom: professional, casual, humorous, informative
  -h, --headless   Modo headless (sem interface)

Exemplos:
  bun run generators/text-generator.ts -t instagram -k "ração premium"
  bun run generators/text-generator.ts -c MeuCao -n 1
  bun run generators/text-generator.ts -c MeuCao -w 1 -t instagram
`);
    process.exit(0);
  }

  // Executar
  const generator = new TextGenerator(config);

  if (config.client && config.prompt === '__WEEK_MODE__') {
    // Gerar semana
    const startPost = config.postNumber || 1;
    generator.generateWeek(config.client, startPost)
      .then(results => {
        const successCount = results.filter(r => r.success).length;
        console.log(`\n📊 Semana gerada: ${successCount}/${results.length} posts`);
        process.exit(successCount === results.length ? 0 : 1);
      });
  } else if (config.client && config.postNumber) {
    generator.generateForClient(config.client, config.postNumber)
      .then(result => {
        console.log('\n📊 Resultado:', JSON.stringify({
          success: result.success,
          wordCount: result.wordCount,
          duration: result.duration
        }, null, 2));
        process.exit(result.success ? 0 : 1);
      });
  } else {
    generator.generate()
      .then(result => {
        console.log('\n📊 Resultado:', JSON.stringify({
          success: result.success,
          wordCount: result.wordCount,
          duration: result.duration
        }, null, 2));
        process.exit(result.success ? 0 : 1);
      });
  }
}

export default TextGenerator;

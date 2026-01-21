/**
 * Campaign Generator - Fabrica de Conteudo
 * Orquestrador de campanhas completas (imagem + texto)
 * 
 * Uso:
 *   bun run generators/campaign-generator.ts --client MeuCao --week 1
 *   bun run generators/campaign-generator.ts --client MeuCao --all
 * 
 * @author DevSan A.G.I. (@deivisan)
 * @version 2.0.0
 */

import { ImageGenerator } from './image-generator';
import { TextGenerator } from './text-generator';
import { join } from 'path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs';

// Tipos
export interface CampaignConfig {
  client: string;
  week?: number;
  postStart?: number;
  postEnd?: number;
  posts?: number[]; // Lista específica de posts
  generateImages?: boolean;
  generateTexts?: boolean;
  outputDir?: string;
  headless?: boolean;
}

export interface CampaignPost {
  number: number;
  image?: {
    success: boolean;
    path?: string;
    error?: string;
  };
  text?: {
    success: boolean;
    content?: string;
    wordCount?: number;
    error?: string;
  };
}

export interface CampaignResult {
  client: string;
  week?: number;
  totalPosts: number;
  successfulImages: number;
  successfulTexts: number;
  posts: CampaignPost[];
  duration: number;
  reportPath?: string;
}

// Constantes
const CLIENTS_DIR = join(process.cwd(), 'clients');
const OUTPUT_DIR = join(process.cwd(), 'assets', 'generated', 'campaigns');

/**
 * Verificar se cliente existe
 */
function clientExists(client: string): boolean {
  return existsSync(join(CLIENTS_DIR, client));
}

/**
 * Obter lista de posts do cliente
 */
async function getClientPosts(client: string): Promise<number[]> {
  const promptsPath = join(CLIENTS_DIR, client, 'prompts');
  
  if (!existsSync(promptsPath)) {
    return [];
  }

  const files = [
    join(promptsPath, `${client.toLowerCase()}-prompts.md`),
    join(promptsPath, 'prompts.md')
  ];

  const posts: number[] = [];
  
  for (const file of files) {
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');
      const matches = content.match(/^#?\s*(\d+)/gm);
      
      if (matches) {
        for (const match of matches) {
          const num = parseInt(match.replace(/^#?\s*/, ''));
          if (!posts.includes(num)) {
            posts.push(num);
          }
        }
      }
    }
  }

  return posts.sort((a, b) => a - b);
}

/**
 * Gerenciador de Campanhas
 */
export class CampaignGenerator {
  private config: CampaignConfig;
  private imageGenerator: ImageGenerator;
  private textGenerator: TextGenerator;

  constructor(config: Partial<CampaignConfig> = {}) {
    this.config = {
      client: '',
      generateImages: true,
      generateTexts: true,
      outputDir: OUTPUT_DIR,
      headless: false,
      ...config
    };

    // Garantir diretório
    if (!existsSync(this.config.outputDir!)) {
      mkdirSync(this.config.outputDir!, { recursive: true });
    }

    this.imageGenerator = new ImageGenerator({
      service: 'gemini',
      headless: this.config.headless
    });

    this.textGenerator = new TextGenerator({
      service: 'gemini',
      type: 'instagram',
      headless: this.config.headless
    });
  }

  /**
   * Gerar campanha completa
   */
  async run(): Promise<CampaignResult> {
    const startTime = Date.now();
    
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          📊 GERADOR DE CAMPANHAS - FABRICA DE CONTEÚDO       ║
╚═══════════════════════════════════════════════════════════════╝

👤 Cliente: ${this.config.client}
🖼️  Imagens: ${this.config.generateImages ? '✅' : '❌'}
📝 Textos:  ${this.config.generateTexts ? '✅' : '❌'}
`);

    // Validar cliente
    if (!this.config.client) {
      return {
        client: '',
        totalPosts: 0,
        successfulImages: 0,
        successfulTexts: 0,
        posts: [],
        duration: 0,
        error: 'Cliente não especificado'
      };
    }

    if (!clientExists(this.config.client)) {
      return {
        client: this.config.client,
        totalPosts: 0,
        successfulImages: 0,
        successfulTexts: 0,
        posts: [],
        duration: 0,
        error: `Cliente não encontrado: ${this.config.client}`
      };
    }

    // Obter posts a gerar
    const allPosts = await getClientPosts(this.config.client);
    
    if (allPosts.length === 0) {
      return {
        client: this.config.client,
        totalPosts: 0,
        successfulImages: 0,
        successfulTexts: 0,
        posts: [],
        duration: 0,
        error: 'Nenhum post encontrado para este cliente'
      };
    }

    // Filtrar posts por range ou lista específica
    let postsToGenerate: number[] = [];
    
    if (this.config.posts && this.config.posts.length > 0) {
      postsToGenerate = this.config.posts.filter(p => allPosts.includes(p));
    } else if (this.config.postStart && this.config.postEnd) {
      postsToGenerate = allPosts.filter(p => p >= this.config.postStart! && p <= this.config.postEnd!);
    } else if (this.config.postStart) {
      postsToGenerate = allPosts.filter(p => p >= this.config.postStart!);
    } else if (this.config.week) {
      const start = (this.config.week - 1) * 6 + 1;
      postsToGenerate = allPosts.filter(p => p >= start && p < start + 6);
    } else {
      postsToGenerate = allPosts;
    }

    console.log(`📋 Posts a gerar: ${postsToGenerate.join(', ')}`);
    console.log(`\n🚀 Iniciando geração de ${postsToGenerate.length} posts...\n`);

    const results: CampaignPost[] = [];

    // Gerar cada post
    for (const postNum of postsToGenerate) {
      const postResult = await this.generatePost(postNum);
      results.push(postResult);

      // Delay entre posts
      if (postsToGenerate.indexOf(postNum) < postsToGenerate.length - 1) {
        console.log('\n⏳ Aguardando 5s antes do próximo post...\n');
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    const duration = Date.now() - startTime;

    // Gerar relatório
    const reportPath = this.generateReport(results, duration);

    // Resumo
    const successfulImages = results.filter(p => p.image?.success).length;
    const successfulTexts = results.filter(p => text => p.text?.success).length;

    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    📊 RESUMO DA CAMPANHA                     ║
╠═══════════════════════════════════════════════════════════════╣
║  Cliente: ${this.config.client}
║  Posts processados: ${results.length}
║  Imagens geradas: ${successfulImages}/${results.length}
║  Textos gerados: ${results.filter(p => p.text?.success).length}/${results.length}
║  Duração total: ${(duration / 1000).toFixed(1)}s
║  Relatório: ${reportPath}
╚═══════════════════════════════════════════════════════════════╝`);

    return {
      client: this.config.client,
      week: this.config.week,
      totalPosts: results.length,
      successfulImages,
      successfulTexts: results.filter(p => p.text?.success).length,
      posts: results,
      duration,
      reportPath
    };
  }

  /**
   * Gerar um único post (imagem + texto)
   */
  private async generatePost(postNumber: number): Promise<CampaignPost> {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📝 PROCESSANDO POST #${postNumber}`);
    console.log(`${'─'.repeat(60)}`);

    const result: CampaignPost = { number: postNumber };

    // Gerar imagem
    if (this.config.generateImages) {
      console.log('\n🖼️  Gerando imagem...');
      try {
        const imageResult = await this.imageGenerator.generateForClient(
          this.config.client!,
          postNumber
        );
        result.image = {
          success: imageResult.success,
          path: imageResult.imagePath,
          error: imageResult.error
        };
      } catch (error) {
        result.image = {
          success: false,
          error: String(error)
        };
      }
    }

    // Gerar texto
    if (this.config.generateTexts) {
      console.log('\n📝 Gerando texto...');
      try {
        const textResult = await this.textGenerator.generateForClient(
          this.config.client!,
          postNumber
        );
        result.text = {
          success: textResult.success,
          content: textResult.content,
          wordCount: textResult.wordCount,
          error: textResult.error
        };
      } catch (error) {
        result.text = {
          success: false,
          error: String(error)
        };
      }
    }

    return result;
  }

  /**
   * Gerar relatório da campanha
   */
  private generateReport(posts: CampaignPost[], duration: number): string {
    const timestamp = Date.now();
    const filename = `${this.config.client}_campaign_${timestamp}.md`;
    const filePath = join(this.config.outputDir!, filename);

    let content = `# 📊 Relatório de Campanha - ${this.config.client}\n\n`;
    content += `**Data:** ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    content += `---\n\n`;
    content += `## Resumo\n\n`;
    content += `- **Total de posts:** ${posts.length}\n`;
    content += `- **Imagens geradas:** ${posts.filter(p => p.image?.success).length}\n`;
    content += `- **Textos gerados:** ${posts.filter(p => p.text?.success).length}\n`;
    content += `- **Duração:** ${(duration / 1000).toFixed(1)}s\n\n`;
    content += `---\n\n`;

    // Detalhes de cada post
    for (const post of posts) {
      content += `## Post #${post.number}\n\n`;
      
      content += `### Imagem\n`;
      if (post.image?.success) {
        content += `✅ Gerada com sucesso\n`;
        content += `📁 ${post.image.path}\n`;
      } else {
        content += `❌ Falha: ${post.image?.error || 'Erro desconhecido'}\n`;
      }
      
      content += `\n### Texto\n`;
      if (post.text?.success) {
        content += `✅ Gerado com sucesso (${post.text.wordCount} palavras)\n\n`;
        content += `**Conteúdo:**\n\n${post.text.content}\n\n`;
      } else {
        content += `❌ Falha: ${post.text?.error || 'Erro desconhecido'}\n`;
      }
      
      content += `---\n\n`;
    }

    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }
}

// CLI Mode
const isMainModule = import.meta.main || process.argv[1]?.endsWith('campaign-generator.ts');

if (isMainModule) {
  const args = process.argv.slice(2);
  
  const config: CampaignConfig = {
    client: '',
    generateImages: true,
    generateTexts: true,
    headless: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--client' || arg === '-c') {
      config.client = args[++i];
    } else if (arg === '--week' || arg === '-w') {
      config.week = parseInt(args[++i]);
    } else if (arg === '--start' || arg === '-s') {
      config.postStart = parseInt(args[++i]);
    } else if (arg === '--end' || arg === '-e') {
      config.postEnd = parseInt(args[++i]);
    } else if (arg === '--posts' || arg === '-p') {
      config.posts = args[++i].split(',').map(n => parseInt(n.trim()));
    } else if (arg === '--images-only') {
      config.generateTexts = false;
    } else if (arg === '--texts-only') {
      config.generateImages = false;
    } else if (arg === '--headless' || arg === '-h') {
      config.headless = true;
    } else if (arg === '--all') {
      config.posts = []; // Gerar todos
    }
  }

  if (!config.client) {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          📊 GERADOR DE CAMPANHAS - CLI                        ║
╚═══════════════════════════════════════════════════════════════╝

Uso:
  bun run generators/campaign-generator.ts --client MeuCao
  bun run generators/campaign-generator.ts --client MeuCao --week 1
  bun run generators/campaign-generator.ts --client MeuCao --start 1 --end 6
  bun run generators/campaign-generator.ts --client MeuCao --posts 1,3,5

Opções:
  -c, --client     Nome do cliente (obrigatório)
  -w, --week       Gerar posts de uma semana específica (6 posts)
  -s, --start      Post inicial
  -e, --end        Post final
  -p, --posts      Lista específica: 1,3,5
  --images-only    Gerar apenas imagens
  --texts-only     Gerar apenas textos
  --all            Gerar todos os posts do cliente
  -h, --headless   Modo headless (sem interface)

Exemplos:
  bun run generators/campaign-generator.ts -c MeuCao -w 1
  bun run generators/campaign-generator.ts -c MeuCao -s 1 -e 6
  bun run generators/campaign-generator.ts -c MeuCao --posts 1,2,3
`);
    process.exit(0);
  }

  // Executar
  const campaign = new CampaignGenerator(config);
  campaign.run()
    .then(result => {
      console.log('\n📊 Resultado:', JSON.stringify({
        client: result.client,
        totalPosts: result.totalPosts,
        successfulImages: result.successfulImages,
        successfulTexts: result.successfulTexts,
        duration: result.duration
      }, null, 2));
      
      const exitCode = 
        (result.successfulImages + result.successfulTexts) > 0 ? 0 : 1;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('\n❌ ERRO:', error);
      process.exit(1);
    });
}

export default CampaignGenerator;

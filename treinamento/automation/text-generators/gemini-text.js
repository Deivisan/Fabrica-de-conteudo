/**
 * Gerador de Texto via Google Gemini
 * Especializado em geração de conteúdo de marketing
 */

const GoogleAIStudioAutomation = require('../google-ai-studio');
const fs = require('fs').promises;
const path = require('path');

class GeminiTextGenerator {
  constructor() {
    this.automation = new GoogleAIStudioAutomation();
    this.outputDir = path.join(__dirname, '../../../assets/generated/text');
  }

  /**
   * Inicializa o gerador
   */
  async initialize(options = {}) {
    await this.automation.initialize(options);
    await fs.mkdir(this.outputDir, { recursive: true });
    return this;
  }

  /**
   * Gera post para redes sociais
   */
  async generateSocialPost(topic, platform, options = {}) {
    const platformSpecs = {
      instagram: { maxLength: 2200, style: 'visual, emoji-friendly, hashtags' },
      twitter: { maxLength: 280, style: 'concise, punchy, trending' },
      linkedin: { maxLength: 3000, style: 'professional, insightful' },
      facebook: { maxLength: 63206, style: 'engaging, shareable' },
      tiktok: { maxLength: 2200, style: 'trendy, gen-z friendly, viral' }
    };

    const spec = platformSpecs[platform] || platformSpecs.instagram;
    
    const prompt = `Escreva um post para ${platform} sobre: ${topic}

Requisitos:
- Máximo de ${spec.maxLength} caracteres
- Estilo: ${spec.style}
- Inclua call-to-action
- ${platform === 'instagram' || platform === 'tiktok' ? 'Inclua hashtags relevantes' : ''}
- Linguagem: Português brasileiro
${options.tone ? `- Tom: ${options.tone}` : ''}
${options.targetAudience ? `- Público-alvo: ${options.targetAudience}` : ''}

Retorne apenas o texto do post, pronto para publicar.`;

    const result = await this.automation.generateText(prompt);
    
    // Salvar resultado
    if (options.save) {
      await this.saveText(result, `${platform}_post_${Date.now()}.txt`);
    }
    
    return result;
  }

  /**
   * Gera copy para anúncio
   */
  async generateAdCopy(product, objective, options = {}) {
    const prompt = `Crie uma copy de anúncio para:

Produto/Serviço: ${product}
Objetivo: ${objective}
${options.targetAudience ? `Público-alvo: ${options.targetAudience}` : ''}
${options.tone ? `Tom: ${options.tone}` : 'Tom: persuasivo e profissional'}
${options.platform ? `Plataforma: ${options.platform}` : ''}

Inclua:
1. Headline chamativa (máx 40 caracteres)
2. Texto principal (máx 125 caracteres)
3. Call-to-action
4. 3 variações de headline

Formato de saída:
HEADLINE: [headline]
TEXTO: [texto principal]
CTA: [call-to-action]
VARIAÇÕES:
1. [variação 1]
2. [variação 2]
3. [variação 3]`;

    return await this.automation.generateText(prompt);
  }

  /**
   * Gera email marketing
   */
  async generateEmail(subject, purpose, options = {}) {
    const prompt = `Escreva um email marketing:

Assunto/Tema: ${subject}
Propósito: ${purpose}
${options.recipientType ? `Tipo de destinatário: ${options.recipientType}` : ''}
${options.tone ? `Tom: ${options.tone}` : 'Tom: profissional e amigável'}
${options.cta ? `Call-to-action desejado: ${options.cta}` : ''}

Estrutura:
1. Linha de assunto (máx 50 caracteres)
2. Pré-header (máx 100 caracteres)
3. Saudação
4. Corpo do email (3-4 parágrafos)
5. Call-to-action
6. Assinatura

Formato de saída:
ASSUNTO: [linha de assunto]
PRÉ-HEADER: [pré-header]

[corpo do email completo]`;

    return await this.automation.generateText(prompt);
  }

  /**
   * Gera artigo/blog post
   */
  async generateArticle(topic, options = {}) {
    const prompt = `Escreva um artigo de blog sobre: ${topic}

Requisitos:
- Tamanho: ${options.length || '800-1200'} palavras
- ${options.seoKeywords ? `Palavras-chave SEO: ${options.seoKeywords.join(', ')}` : ''}
- ${options.tone ? `Tom: ${options.tone}` : 'Tom: informativo e engajador'}
- ${options.targetAudience ? `Público-alvo: ${options.targetAudience}` : ''}

Estrutura:
1. Título chamativo (otimizado para SEO)
2. Introdução (hook + contexto)
3. 3-5 seções com subtítulos
4. Conclusão com call-to-action
5. Meta description (máx 160 caracteres)

Formato de saída em Markdown.`;

    const result = await this.automation.generateText(prompt);
    
    // Salvar como markdown
    if (options.save) {
      const filename = `article_${Date.now()}.md`;
      await this.saveText(result, filename);
    }
    
    return result;
  }

  /**
   * Gera descrição de produto
   */
  async generateProductDescription(product, features, options = {}) {
    const prompt = `Crie uma descrição de produto:

Produto: ${product}
Características: ${Array.isArray(features) ? features.join(', ') : features}
${options.targetAudience ? `Público-alvo: ${options.targetAudience}` : ''}
${options.tone ? `Tom: ${options.tone}` : 'Tom: persuasivo e informativo'}
${options.platform ? `Plataforma: ${options.platform}` : ''}

Inclua:
1. Título do produto (máx 80 caracteres)
2. Descrição curta (máx 160 caracteres)
3. Descrição completa (200-300 palavras)
4. Lista de benefícios (5 itens)
5. Especificações técnicas formatadas

Formato de saída estruturado.`;

    return await this.automation.generateText(prompt);
  }

  /**
   * Gera script para vídeo
   */
  async generateVideoScript(topic, duration, options = {}) {
    const prompt = `Escreva um roteiro de vídeo:

Tema: ${topic}
Duração: ${duration} segundos
${options.platform ? `Plataforma: ${options.platform}` : 'Plataforma: YouTube/TikTok'}
${options.style ? `Estilo: ${options.style}` : 'Estilo: dinâmico e engajador'}

Estrutura:
1. Hook (primeiros 3 segundos)
2. Introdução
3. Conteúdo principal (dividido em seções)
4. Call-to-action
5. Encerramento

Formato:
[TEMPO] - [CENA/AÇÃO]
NARRAÇÃO: "texto"
TEXTO NA TELA: "texto"`;

    return await this.automation.generateText(prompt);
  }

  /**
   * Gera hashtags relevantes
   */
  async generateHashtags(topic, platform, count = 30) {
    const prompt = `Gere ${count} hashtags para ${platform} sobre: ${topic}

Requisitos:
- Mix de hashtags populares e de nicho
- Relevantes para o tema
- Em português brasileiro
- Ordenadas por relevância

Formato: lista de hashtags separadas por espaço, começando com #`;

    return await this.automation.generateText(prompt);
  }

  /**
   * Gera conteúdo baseado em estratégia
   */
  async generateFromStrategy(strategy, contentType) {
    const prompt = `Com base na seguinte estratégia de marketing, gere ${contentType}:

ESTRATÉGIA:
Título: ${strategy.title || 'N/A'}
Objetivo: ${strategy.objective || 'N/A'}
Público-alvo: ${strategy.target_audience || 'N/A'}
Plataformas: ${strategy.platforms ? strategy.platforms.join(', ') : 'N/A'}
Estilo: ${strategy.style || 'N/A'}
Hashtags: ${strategy.hashtags ? strategy.hashtags.join(', ') : 'N/A'}
CTA: ${strategy.cta || 'N/A'}

Gere conteúdo alinhado com esta estratégia.`;

    return await this.automation.generateText(prompt);
  }

  /**
   * Salva texto em arquivo
   */
  async saveText(content, filename) {
    const outputPath = path.join(this.outputDir, filename);
    await fs.writeFile(outputPath, content, 'utf8');
    console.log(`📄 Texto salvo em: ${outputPath}`);
    return outputPath;
  }

  /**
   * Fecha o gerador
   */
  async close() {
    await this.automation.close();
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  (async () => {
    const generator = new GeminiTextGenerator();
    
    try {
      await generator.initialize({ headless: false });
      
      if (args[0] === '--post' && args[1] && args[2]) {
        const platform = args[1];
        const topic = args.slice(2).join(' ');
        const result = await generator.generateSocialPost(topic, platform);
        console.log('\n📝 Post gerado:\n');
        console.log(result);
      } else if (args[0] === '--email' && args[1]) {
        const subject = args.slice(1).join(' ');
        const result = await generator.generateEmail(subject, 'engajamento');
        console.log('\n📧 Email gerado:\n');
        console.log(result);
      } else if (args[0] === '--article' && args[1]) {
        const topic = args.slice(1).join(' ');
        const result = await generator.generateArticle(topic, { save: true });
        console.log('\n📰 Artigo gerado:\n');
        console.log(result);
      } else if (args[0] === '--hashtags' && args[1]) {
        const topic = args.slice(1).join(' ');
        const result = await generator.generateHashtags(topic, 'instagram');
        console.log('\n#️⃣ Hashtags:\n');
        console.log(result);
      } else {
        console.log(`
Uso: node gemini-text.js [opção] [argumentos]

Opções:
  --post [platform] [topic]    Gerar post para rede social
  --email [subject]            Gerar email marketing
  --article [topic]            Gerar artigo de blog
  --hashtags [topic]           Gerar hashtags

Plataformas: instagram, twitter, linkedin, facebook, tiktok

Exemplos:
  node gemini-text.js --post instagram "Lançamento de produto tech"
  node gemini-text.js --email "Promoção de Black Friday"
  node gemini-text.js --article "Tendências de marketing digital 2025"
        `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      await generator.close();
    }
  })();
}

module.exports = GeminiTextGenerator;

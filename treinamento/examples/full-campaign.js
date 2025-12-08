/**
 * Exemplo: Campanha Completa
 * Demonstra como gerar uma campanha de marketing completa
 */

const fs = require('fs').promises;
const path = require('path');
const GeminiTextGenerator = require('../automation/text-generators/gemini-text');
const GeminiImageGenerator = require('../automation/image-generators/gemini-image');
const MdParser = require('../../src/parser/md-parser');

class CampaignGenerator {
  constructor() {
    this.textGenerator = new GeminiTextGenerator();
    this.imageGenerator = new GeminiImageGenerator();
    this.parser = new MdParser({ strategiesDir: './strategies' });
    this.outputDir = path.join(__dirname, '../../output/campaigns');
  }

  /**
   * Inicializa os geradores
   */
  async initialize() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await this.textGenerator.initialize({ headless: false });
    // Nota: imageGenerator usa a mesma sessão
    return this;
  }

  /**
   * Gera campanha completa a partir de estratégia
   */
  async generateFromStrategy(strategyPath) {
    console.log('\n🚀 GERAÇÃO DE CAMPANHA COMPLETA');
    console.log('=' .repeat(60));
    
    // Parsear estratégia
    console.log('\n📄 Carregando estratégia...');
    const strategy = await this.parser.parseStrategyFile(strategyPath);
    console.log(`   Título: ${strategy.title}`);
    console.log(`   Objetivo: ${strategy.objective}`);
    console.log(`   Plataformas: ${strategy.platforms?.join(', ') || 'N/A'}`);
    
    const campaign = {
      strategy: strategy,
      content: {
        posts: [],
        images: [],
        emails: [],
        articles: []
      },
      generatedAt: new Date().toISOString()
    };
    
    // Gerar conteúdo para cada plataforma
    const platforms = strategy.platforms || ['instagram'];
    
    for (const platform of platforms) {
      console.log(`\n📱 Gerando conteúdo para ${platform}...`);
      
      try {
        // Gerar post
        const post = await this.textGenerator.generateSocialPost(
          strategy.objective || strategy.title,
          platform.toLowerCase().split(':')[0], // Remove frequência
          {
            tone: strategy.style,
            targetAudience: strategy.target_audience
          }
        );
        
        campaign.content.posts.push({
          platform,
          content: post,
          generatedAt: new Date().toISOString()
        });
        
        console.log(`   ✅ Post gerado para ${platform}`);
      } catch (error) {
        console.log(`   ❌ Erro ao gerar post: ${error.message}`);
      }
    }
    
    // Gerar imagens
    console.log('\n🖼️ Gerando imagens...');
    
    try {
      // Banner principal
      const bannerPrompt = this.buildImagePrompt(strategy, 'banner');
      const banner = await this.imageGenerator.generate(bannerPrompt, {
        filename: `campaign_banner_${Date.now()}.png`
      });
      
      campaign.content.images.push({
        type: 'banner',
        path: banner,
        prompt: bannerPrompt
      });
      
      console.log('   ✅ Banner gerado');
      
      // Post para Instagram
      if (platforms.some(p => p.toLowerCase().includes('instagram'))) {
        const instagramPrompt = this.buildImagePrompt(strategy, 'instagram');
        const instagramImage = await this.imageGenerator.generateForSocialMedia(
          instagramPrompt,
          'instagram'
        );
        
        campaign.content.images.push({
          type: 'instagram_post',
          path: instagramImage,
          prompt: instagramPrompt
        });
        
        console.log('   ✅ Imagem para Instagram gerada');
      }
    } catch (error) {
      console.log(`   ❌ Erro ao gerar imagens: ${error.message}`);
    }
    
    // Gerar email se necessário
    if (strategy.content_types?.some(t => t.toLowerCase().includes('email'))) {
      console.log('\n📧 Gerando email marketing...');
      
      try {
        const email = await this.textGenerator.generateEmail(
          strategy.title,
          strategy.objective,
          {
            tone: strategy.style,
            cta: strategy.cta
          }
        );
        
        campaign.content.emails.push({
          subject: strategy.title,
          content: email,
          generatedAt: new Date().toISOString()
        });
        
        console.log('   ✅ Email gerado');
      } catch (error) {
        console.log(`   ❌ Erro ao gerar email: ${error.message}`);
      }
    }
    
    // Salvar campanha
    const campaignPath = await this.saveCampaign(campaign);
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ CAMPANHA GERADA COM SUCESSO!');
    console.log(`📁 Salva em: ${campaignPath}`);
    console.log(`📝 Posts: ${campaign.content.posts.length}`);
    console.log(`🖼️ Imagens: ${campaign.content.images.length}`);
    console.log(`📧 Emails: ${campaign.content.emails.length}`);
    
    return campaign;
  }

  /**
   * Gera campanha rápida a partir de parâmetros
   */
  async generateQuickCampaign(topic, platforms = ['instagram', 'twitter']) {
    console.log('\n⚡ GERAÇÃO RÁPIDA DE CAMPANHA');
    console.log('=' .repeat(60));
    console.log(`Tema: ${topic}`);
    console.log(`Plataformas: ${platforms.join(', ')}`);
    
    const campaign = {
      topic,
      platforms,
      content: {
        posts: [],
        images: [],
        hashtags: null
      },
      generatedAt: new Date().toISOString()
    };
    
    // Gerar posts para cada plataforma
    for (const platform of platforms) {
      console.log(`\n📱 Gerando para ${platform}...`);
      
      try {
        const post = await this.textGenerator.generateSocialPost(topic, platform);
        campaign.content.posts.push({ platform, content: post });
        console.log(`   ✅ Post gerado`);
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
    
    // Gerar hashtags
    console.log('\n#️⃣ Gerando hashtags...');
    try {
      campaign.content.hashtags = await this.textGenerator.generateHashtags(topic, 'instagram');
      console.log('   ✅ Hashtags geradas');
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    
    // Gerar imagem
    console.log('\n🖼️ Gerando imagem...');
    try {
      const image = await this.imageGenerator.generate(
        `Marketing visual for: ${topic}. Modern, professional, eye-catching.`
      );
      campaign.content.images.push({ type: 'main', path: image });
      console.log('   ✅ Imagem gerada');
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    
    // Salvar
    const campaignPath = await this.saveCampaign(campaign);
    
    console.log('\n✅ Campanha rápida gerada!');
    console.log(`📁 Salva em: ${campaignPath}`);
    
    return campaign;
  }

  /**
   * Constrói prompt de imagem baseado na estratégia
   */
  buildImagePrompt(strategy, type) {
    let prompt = '';
    
    switch (type) {
      case 'banner':
        prompt = `Create a professional marketing banner for "${strategy.title}". `;
        break;
      case 'instagram':
        prompt = `Create an Instagram post image for "${strategy.title}". Square format, 1:1 aspect ratio. `;
        break;
      default:
        prompt = `Create a marketing image for "${strategy.title}". `;
    }
    
    if (strategy.visual_style) {
      prompt += `Style: ${strategy.visual_style}. `;
    }
    
    if (strategy.brand_colors && strategy.brand_colors.length > 0) {
      prompt += `Colors: ${strategy.brand_colors.join(', ')}. `;
    }
    
    if (strategy.target_audience) {
      prompt += `Target audience: ${strategy.target_audience}. `;
    }
    
    prompt += 'High quality, professional, modern design.';
    
    return prompt;
  }

  /**
   * Salva campanha em arquivo
   */
  async saveCampaign(campaign) {
    const timestamp = Date.now();
    const campaignDir = path.join(this.outputDir, `campaign_${timestamp}`);
    await fs.mkdir(campaignDir, { recursive: true });
    
    // Salvar JSON da campanha
    const jsonPath = path.join(campaignDir, 'campaign.json');
    await fs.writeFile(jsonPath, JSON.stringify(campaign, null, 2));
    
    // Salvar posts em arquivos separados
    for (let i = 0; i < campaign.content.posts.length; i++) {
      const post = campaign.content.posts[i];
      const postPath = path.join(campaignDir, `post_${post.platform}_${i + 1}.txt`);
      await fs.writeFile(postPath, post.content);
    }
    
    // Salvar emails
    for (let i = 0; i < campaign.content.emails.length; i++) {
      const email = campaign.content.emails[i];
      const emailPath = path.join(campaignDir, `email_${i + 1}.txt`);
      await fs.writeFile(emailPath, email.content);
    }
    
    return campaignDir;
  }

  /**
   * Fecha os geradores
   */
  async close() {
    await this.textGenerator.close();
    // imageGenerator compartilha sessão, não precisa fechar separadamente
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  (async () => {
    const generator = new CampaignGenerator();
    
    try {
      await generator.initialize();
      
      if (args[0] === '--strategy' && args[1]) {
        await generator.generateFromStrategy(args[1]);
      } else if (args[0] === '--quick' && args[1]) {
        const topic = args.slice(1).join(' ');
        await generator.generateQuickCampaign(topic);
      } else if (args.length > 0) {
        const topic = args.join(' ');
        await generator.generateQuickCampaign(topic);
      } else {
        console.log(`
Uso: node full-campaign.js [opção] [argumentos]

Opções:
  --strategy [path]    Gerar campanha a partir de arquivo de estratégia
  --quick [topic]      Gerar campanha rápida sobre um tema
  [topic]              Mesmo que --quick

Exemplos:
  node full-campaign.js --strategy ./strategies/campanha_lancamento.md
  node full-campaign.js --quick "Lançamento de produto tech"
  node full-campaign.js "Black Friday 2025"
        `);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    } finally {
      await generator.close();
    }
  })();
}

module.exports = CampaignGenerator;

/**
 * Exemplo: Geração de Texto
 * Demonstra como usar os geradores de texto
 */

const GeminiTextGenerator = require('../automation/text-generators/gemini-text');

async function generateSocialPost(topic, platform = 'instagram') {
  console.log('\n📝 GERAÇÃO DE POST PARA REDES SOCIAIS');
  console.log('=' .repeat(50));
  
  const generator = new GeminiTextGenerator();
  
  try {
    await generator.initialize({ headless: false });
    const result = await generator.generateSocialPost(topic, platform);
    console.log(`\n✅ Post para ${platform}:\n`);
    console.log(result);
    return result;
  } finally {
    await generator.close();
  }
}

async function generateEmail(subject, purpose = 'engajamento') {
  console.log('\n📧 GERAÇÃO DE EMAIL MARKETING');
  console.log('=' .repeat(50));
  
  const generator = new GeminiTextGenerator();
  
  try {
    await generator.initialize({ headless: false });
    const result = await generator.generateEmail(subject, purpose);
    console.log('\n✅ Email gerado:\n');
    console.log(result);
    return result;
  } finally {
    await generator.close();
  }
}

async function generateArticle(topic, options = {}) {
  console.log('\n📰 GERAÇÃO DE ARTIGO');
  console.log('=' .repeat(50));
  
  const generator = new GeminiTextGenerator();
  
  try {
    await generator.initialize({ headless: false });
    const result = await generator.generateArticle(topic, { ...options, save: true });
    console.log('\n✅ Artigo gerado:\n');
    console.log(result);
    return result;
  } finally {
    await generator.close();
  }
}

async function generateAdCopy(product, objective) {
  console.log('\n📢 GERAÇÃO DE COPY PARA ANÚNCIO');
  console.log('=' .repeat(50));
  
  const generator = new GeminiTextGenerator();
  
  try {
    await generator.initialize({ headless: false });
    const result = await generator.generateAdCopy(product, objective);
    console.log('\n✅ Copy gerada:\n');
    console.log(result);
    return result;
  } finally {
    await generator.close();
  }
}

async function generateHashtags(topic, platform = 'instagram') {
  console.log('\n#️⃣ GERAÇÃO DE HASHTAGS');
  console.log('=' .repeat(50));
  
  const generator = new GeminiTextGenerator();
  
  try {
    await generator.initialize({ headless: false });
    const result = await generator.generateHashtags(topic, platform);
    console.log('\n✅ Hashtags:\n');
    console.log(result);
    return result;
  } finally {
    await generator.close();
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  (async () => {
    if (args.length === 0) {
      console.log(`
Uso: node generate-text.js [tipo] [argumentos]

Tipos:
  post [platform] [topic]      Gerar post para rede social
  email [subject]              Gerar email marketing
  article [topic]              Gerar artigo de blog
  ad [product] [objective]     Gerar copy de anúncio
  hashtags [topic]             Gerar hashtags

Plataformas: instagram, twitter, linkedin, facebook, tiktok

Exemplos:
  node generate-text.js post instagram "Lançamento de produto"
  node generate-text.js email "Promoção de Black Friday"
  node generate-text.js article "Tendências de marketing 2025"
  node generate-text.js ad "Curso de programação" "vendas"
  node generate-text.js hashtags "marketing digital"
      `);
      return;
    }
    
    const type = args[0];
    
    try {
      switch (type) {
        case 'post':
          const platform = args[1] || 'instagram';
          const postTopic = args.slice(2).join(' ') || 'marketing digital';
          await generateSocialPost(postTopic, platform);
          break;
          
        case 'email':
          const subject = args.slice(1).join(' ') || 'Newsletter semanal';
          await generateEmail(subject);
          break;
          
        case 'article':
          const articleTopic = args.slice(1).join(' ') || 'Inteligência Artificial';
          await generateArticle(articleTopic);
          break;
          
        case 'ad':
          const product = args[1] || 'Produto';
          const objective = args.slice(2).join(' ') || 'vendas';
          await generateAdCopy(product, objective);
          break;
          
        case 'hashtags':
          const hashtagTopic = args.slice(1).join(' ') || 'marketing';
          await generateHashtags(hashtagTopic);
          break;
          
        default:
          // Tratar como prompt direto
          const prompt = args.join(' ');
          await generateSocialPost(prompt, 'instagram');
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  })();
}

module.exports = {
  generateSocialPost,
  generateEmail,
  generateArticle,
  generateAdCopy,
  generateHashtags
};

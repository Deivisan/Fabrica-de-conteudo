/**
 * Exemplo: Geração de Imagem
 * Demonstra como usar os geradores de imagem
 */

const GeminiImageGenerator = require('../automation/image-generators/gemini-image');
const BingImageCreatorAutomation = require('../automation/image-generators/bing-image-creator');
const LeonardoAIAutomation = require('../automation/image-generators/leonardo-ai');

async function generateWithGemini(prompt) {
  console.log('\n🎨 GERAÇÃO COM GOOGLE GEMINI');
  console.log('=' .repeat(50));
  
  const generator = new GeminiImageGenerator();
  
  try {
    await generator.initialize({ headless: false });
    const result = await generator.generate(prompt);
    console.log(`✅ Imagem salva: ${result}`);
    return result;
  } finally {
    await generator.close();
  }
}

async function generateWithBing(prompt) {
  console.log('\n🎨 GERAÇÃO COM BING IMAGE CREATOR (DALL-E 3)');
  console.log('=' .repeat(50));
  
  const generator = new BingImageCreatorAutomation();
  
  try {
    await generator.initialize({ headless: false });
    const results = await generator.generateImages(prompt);
    console.log(`✅ ${results.length} imagens salvas`);
    return results;
  } finally {
    await generator.close();
  }
}

async function generateWithLeonardo(prompt) {
  console.log('\n🎨 GERAÇÃO COM LEONARDO.AI');
  console.log('=' .repeat(50));
  
  const generator = new LeonardoAIAutomation();
  
  try {
    await generator.initialize({ headless: false });
    const results = await generator.generateImages(prompt);
    console.log(`✅ ${results.length} imagens salvas`);
    return results;
  } finally {
    await generator.close();
  }
}

async function generateWithAllServices(prompt) {
  console.log('\n🎨 GERAÇÃO COM TODOS OS SERVIÇOS');
  console.log('=' .repeat(50));
  
  const results = {
    gemini: null,
    bing: null,
    leonardo: null
  };
  
  // Tentar cada serviço
  try {
    results.gemini = await generateWithGemini(prompt);
  } catch (error) {
    console.log(`❌ Gemini falhou: ${error.message}`);
  }
  
  try {
    results.bing = await generateWithBing(prompt);
  } catch (error) {
    console.log(`❌ Bing falhou: ${error.message}`);
  }
  
  try {
    results.leonardo = await generateWithLeonardo(prompt);
  } catch (error) {
    console.log(`❌ Leonardo falhou: ${error.message}`);
  }
  
  return results;
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  (async () => {
    if (args.length === 0) {
      console.log(`
Uso: node generate-image.js [opção] [prompt]

Opções:
  --gemini [prompt]     Usar Google Gemini
  --bing [prompt]       Usar Bing Image Creator (DALL-E 3)
  --leonardo [prompt]   Usar Leonardo.ai
  --all [prompt]        Usar todos os serviços
  [prompt]              Usar serviço padrão (Gemini)

Exemplos:
  node generate-image.js "Um gato astronauta no espaço"
  node generate-image.js --bing "Castelo medieval ao pôr do sol"
  node generate-image.js --all "Paisagem futurista cyberpunk"
      `);
      return;
    }
    
    let service = 'gemini';
    let prompt = args.join(' ');
    
    if (args[0].startsWith('--')) {
      service = args[0].replace('--', '');
      prompt = args.slice(1).join(' ');
    }
    
    if (!prompt) {
      console.log('❌ Por favor, forneça um prompt');
      return;
    }
    
    console.log(`\n📝 Prompt: "${prompt}"`);
    
    try {
      switch (service) {
        case 'gemini':
          await generateWithGemini(prompt);
          break;
        case 'bing':
          await generateWithBing(prompt);
          break;
        case 'leonardo':
          await generateWithLeonardo(prompt);
          break;
        case 'all':
          await generateWithAllServices(prompt);
          break;
        default:
          console.log(`❌ Serviço desconhecido: ${service}`);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  })();
}

module.exports = {
  generateWithGemini,
  generateWithBing,
  generateWithLeonardo,
  generateWithAllServices
};

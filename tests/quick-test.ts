/**
 * Quick Test - Fabrica de Conteudo
 * Teste rápido de interação com Google AI Studio
 * 
 * Uso: bun run tests/quick-test.ts
 * 
 * @author DevSan A.G.I. (@deivisan)
 */

import { AIInteraction } from '../core';

async function quickTest() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          🧪 TESTE RÁPIDO - FABRICA DE CONTEÚDO               ║
╠═══════════════════════════════════════════════════════════════╣
║  Serviço: Google AI Studio (Gemini)                          ║
║  Objetivo: Verificar se a automação funciona                 ║
║  Ação: Enviar prompt simples e capturar resposta             ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const testPrompt = 'Olá! Diga apenas "Teste OK" se você está funcionando.';
  
  try {
    // Criar instância
    console.log('📦 Criando instância de AIInteraction...');
    const ai = new AIInteraction({ 
      service: 'gemini',
      headless: false,
      timeout: 60000
    });

    // Conectar
    console.log('\n🔌 Conectando ao Google AI Studio...');
    const connected = await ai.connect();
    
    if (!connected) {
      console.error('❌ FALHA: Não foi possível conectar');
      console.log('\n💡 Dica: Verifique se você está logado no Google.');
      console.log('   Execute: bun run browser:setup');
      process.exit(1);
    }

    console.log('✅ Conectado com sucesso!\n');

    // Aguardar carregamento
    console.log('⏳ Aguardando carregamento da página...');
    await ai.getEngine().getPage()?.waitForTimeout(3000);

    // Enviar prompt
    console.log(`📝 Enviando prompt: "${testPrompt}"\n`);
    const result = await ai.sendPrompt(testPrompt);

    // Mostrar resultado
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESULTADO DO TESTE:');
    console.log('═'.repeat(60));
    
    if (result.success) {
      console.log('✅ STATUS: SUCESSO');
      console.log(`⏱️  Duração: ${((result.duration || 0) / 1000).toFixed(1)}s`);
      
      if (result.response) {
        console.log(`\n💬 Resposta da IA:`);
        console.log('─'.repeat(40));
        console.log(result.response.substring(0, 500));
        if (result.response.length > 500) {
          console.log('... (truncado)');
        }
      }
      
      if (result.imageUrl) {
        console.log(`\n🖼️  Imagem gerada: ${result.imageUrl.substring(0, 50)}...`);
      }
      
      if (result.imagePath) {
        console.log(`💾 Imagem salva: ${result.imagePath}`);
      }
      
      console.log(`📸 Screenshot: ${result.screenshotPath}`);
      
    } else {
      console.log('❌ STATUS: FALHA');
      console.log(`🔴 Erro: ${result.error}`);
      
      if (result.screenshotPath) {
        console.log(`📸 Screenshot de erro: ${result.screenshotPath}`);
      }
    }
    
    console.log('═'.repeat(60));

    // Manter browser aberto para visualização
    console.log('\n⏳ Browser ficará aberto por 15 segundos...');
    console.log('   Você pode verificar o resultado visualmente.');
    await ai.getEngine().getPage()?.waitForTimeout(15000);

    // Fechar
    await ai.disconnect();
    
    console.log('\n🎉 Teste concluído!');
    
    if (result.success) {
      console.log('✅ Sistema funcionando corretamente.');
      process.exit(0);
    } else {
      console.log('⚠️  Verifique os erros acima.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error);
    console.log('\n💡 Possíveis soluções:');
    console.log('   1. Verifique se Playwright está instalado: bun add playwright');
    console.log('   2. Instale os browsers: bunx playwright install chromium');
    console.log('   3. Faça login manual: bun run browser:setup');
    process.exit(1);
  }
}

// Executar teste
quickTest();

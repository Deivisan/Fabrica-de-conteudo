/**
 * Teste de Geração de Imagem - Google AI Studio
 * Testa o fluxo completo com Nano Banana
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Usar o diretório principal com sessão logada
const USER_DATA_DIR = path.join(__dirname, '../../browser-data');
const SCREENSHOTS_DIR = path.join(__dirname, '../assets/screenshots');
const OUTPUT_DIR = path.join(__dirname, '../assets/generated/images');

// Seletores atualizados baseados no mapeamento
const SELECTORS = {
  // Prompt input - aria-label exato do mapeamento
  promptInput: 'textarea[aria-label="Type something or tab to choose an example prompt"]',
  promptInputAlt: 'ms-autosize-textarea textarea',
  
  // Run button - aria-label="Run"
  runButton: 'button[aria-label="Run"]',
  runButtonAlt: 'ms-run-button button',
  
  // Filtros
  filterImages: 'button:has-text("Images")',
  filterImagesActive: 'button.ms-button-active:has-text("Images")',
  
  // Modelos - texto exato do mapeamento
  nanoBananaPro: 'button.content-button:has-text("Nano Banana Pro")',
  nanoBanana: 'button.content-button:has-text("Nano Banana")',
  
  // Model selector no painel direito
  modelSelectorCard: 'button.model-selector-card',
  
  // Verificação de login
  userEmail: 'button:has-text("@gmail.com")',
  accountSwitcher: 'alkali-accountswitcher button',
  
  // Área de resposta
  responseArea: 'ms-prompt-renderer',
  generatedImage: 'ms-prompt-renderer img',
  
  // New chat
  newChatButton: 'button[aria-label="New chat"]'
};

async function testImageGeneration() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTE DE GERAÇÃO DE IMAGEM - GOOGLE AI STUDIO');
  console.log('='.repeat(70));
  
  // Criar diretórios
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Lançar navegador com sessão persistente
  console.log('\n🚀 Iniciando navegador com sessão persistente...');
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    slowMo: 100,
    viewport: { width: 1920, height: 1080 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ]
  });
  
  const pages = browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();
  page.setDefaultTimeout(60000);
  
  try {
    // 1. Navegar para o AI Studio
    console.log('\n📍 Navegando para Google AI Studio...');
    await page.goto('https://aistudio.google.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await screenshot(page, '01_pagina_inicial');
    
    // 2. Verificar login
    console.log('\n🔐 Verificando login...');
    const userEmail = await page.$(SELECTORS.userEmail);
    if (userEmail) {
      const emailText = await userEmail.textContent();
      console.log(`   ✅ Logado como: ${emailText}`);
    } else {
      console.log('   ❌ NÃO LOGADO - Faça login manualmente');
      console.log('   Aguardando 30 segundos para login...');
      await page.waitForTimeout(30000);
    }
    
    // 3. Verificar se filtro Images está ativo
    console.log('\n🖼️ Verificando filtro de imagens...');
    const imagesActive = await page.$(SELECTORS.filterImagesActive);
    if (!imagesActive) {
      console.log('   Clicando no filtro Images...');
      const imagesBtn = await page.$(SELECTORS.filterImages);
      if (imagesBtn) {
        await imagesBtn.click();
        await page.waitForTimeout(1500);
      }
    } else {
      console.log('   ✅ Filtro Images já está ativo');
    }
    await screenshot(page, '02_filtro_images');
    
    // 4. Verificar modelo selecionado
    console.log('\n🍌 Verificando modelo Nano Banana...');
    const modelCard = await page.$(SELECTORS.modelSelectorCard);
    if (modelCard) {
      const modelText = await modelCard.textContent();
      console.log(`   Modelo atual: ${modelText.substring(0, 50)}...`);
      
      if (!modelText.includes('Nano Banana')) {
        console.log('   Selecionando Nano Banana...');
        // Clicar no Nano Banana Pro no carousel
        const nanoBanana = await page.$(SELECTORS.nanoBananaPro) || await page.$(SELECTORS.nanoBanana);
        if (nanoBanana) {
          await nanoBanana.click();
          await page.waitForTimeout(1500);
        }
      }
    }
    await screenshot(page, '03_modelo_selecionado');
    
    // 5. Encontrar campo de prompt
    console.log('\n📝 Localizando campo de prompt...');
    let promptInput = await page.$(SELECTORS.promptInput);
    if (!promptInput) {
      console.log('   Tentando seletor alternativo...');
      promptInput = await page.$(SELECTORS.promptInputAlt);
    }
    
    if (!promptInput) {
      // Tentar encontrar qualquer textarea visível
      console.log('   Procurando qualquer textarea...');
      promptInput = await page.$('textarea:visible');
    }
    
    if (!promptInput) {
      throw new Error('Campo de prompt não encontrado!');
    }
    console.log('   ✅ Campo de prompt encontrado!');
    
    // 6. Preencher prompt de teste
    const testPrompt = 'A cute orange cat wearing a tiny astronaut helmet, floating in space with stars and planets in the background, digital art style, vibrant colors';
    console.log(`\n✍️ Preenchendo prompt: "${testPrompt.substring(0, 50)}..."`);
    
    await promptInput.click();
    await page.waitForTimeout(500);
    await promptInput.fill(testPrompt);
    await page.waitForTimeout(1000);
    await screenshot(page, '04_prompt_preenchido');
    
    // 7. Encontrar e clicar no botão Run
    console.log('\n🔘 Localizando botão Run...');
    let runButton = await page.$(SELECTORS.runButton);
    if (!runButton) {
      console.log('   Tentando seletor alternativo...');
      runButton = await page.$(SELECTORS.runButtonAlt);
    }
    
    if (!runButton) {
      // Procurar por qualquer botão com "Run" ou seta
      runButton = await page.$('button:has-text("Run"), button[aria-label*="Run"]');
    }
    
    if (!runButton) {
      throw new Error('Botão Run não encontrado!');
    }
    
    // Verificar se está habilitado
    const isDisabled = await runButton.evaluate(el => el.disabled || el.classList.contains('disabled'));
    console.log(`   Botão Run encontrado! Disabled: ${isDisabled}`);
    
    if (isDisabled) {
      console.log('   ⚠️ Botão está desabilitado. Aguardando...');
      await page.waitForTimeout(2000);
    }
    
    await screenshot(page, '05_antes_run');
    
    // 8. Clicar no Run
    console.log('\n🚀 Executando geração...');
    await runButton.click();
    await screenshot(page, '06_apos_click_run');
    
    // 9. Aguardar geração
    console.log('\n⏳ Aguardando geração da imagem...');
    console.log('   (Isso pode levar até 2 minutos)');
    
    const startTime = Date.now();
    const timeout = 180000; // 3 minutos
    let imageFound = false;
    let imageElement = null;
    
    while (Date.now() - startTime < timeout && !imageFound) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      // Procurar por imagens geradas
      const images = await page.$$('ms-prompt-renderer img');
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src && (src.startsWith('blob:') || src.startsWith('data:') || src.includes('googleusercontent'))) {
          imageElement = img;
          imageFound = true;
          console.log(`   ✅ Imagem detectada após ${elapsed}s!`);
          break;
        }
      }
      
      // Também verificar canvas
      if (!imageFound) {
        const canvas = await page.$('ms-prompt-renderer canvas');
        if (canvas) {
          imageElement = canvas;
          imageFound = true;
          console.log(`   ✅ Canvas detectado após ${elapsed}s!`);
        }
      }
      
      if (!imageFound) {
        if (elapsed % 10 === 0) {
          console.log(`   ⏳ Aguardando... (${elapsed}s)`);
          await screenshot(page, `07_aguardando_${elapsed}s`);
        }
        await page.waitForTimeout(2000);
      }
    }
    
    await screenshot(page, '08_resultado_final');
    
    if (!imageFound) {
      console.log('\n❌ Timeout: Imagem não foi gerada');
      console.log('   Verifique os screenshots para diagnóstico');
      return;
    }
    
    // 10. Capturar imagem
    console.log('\n📸 Capturando imagem gerada...');
    const outputPath = path.join(OUTPUT_DIR, `test_image_${Date.now()}.png`);
    
    try {
      await imageElement.screenshot({ path: outputPath });
      console.log(`   ✅ Imagem salva em: ${outputPath}`);
    } catch (err) {
      console.log(`   ⚠️ Erro ao capturar: ${err.message}`);
      // Fallback: screenshot da área de resposta
      const responseArea = await page.$(SELECTORS.responseArea);
      if (responseArea) {
        await responseArea.screenshot({ path: outputPath });
        console.log(`   ✅ Screenshot da área de resposta salvo`);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    await screenshot(page, 'erro_' + Date.now());
  }
  
  // Manter navegador aberto para inspeção
  console.log('\n🔍 Navegador mantido aberto para inspeção.');
  console.log('   Feche manualmente quando terminar.');
}

async function screenshot(page, name) {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}_${Date.now()}.png`);
  await page.screenshot({ path: filepath, fullPage: false });
  console.log(`   📸 Screenshot: ${name}`);
  return filepath;
}

// Executar
testImageGeneration().catch(console.error);

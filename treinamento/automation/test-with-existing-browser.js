/**
 * Teste de Geração de Imagem - Conecta ao Chrome existente
 * Usa CDP para conectar ao navegador já aberto
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '../assets/screenshots');
const OUTPUT_DIR = path.join(__dirname, '../assets/generated/images');

// Seletores atualizados
const SELECTORS = {
  promptInput: 'textarea[aria-label="Type something or tab to choose an example prompt"]',
  promptInputAlt: 'ms-autosize-textarea textarea',
  runButton: 'button[aria-label="Run"]',
  filterImages: 'button:has-text("Images")',
  nanoBananaPro: 'button.content-button:has-text("Nano Banana Pro")',
  nanoBanana: 'button.content-button:has-text("Nano Banana")',
  modelSelectorCard: 'button.model-selector-card',
  userEmail: 'button:has-text("@gmail.com")',
  responseArea: 'ms-prompt-renderer',
  newChatButton: 'button[aria-label="New chat"]'
};

async function testWithExistingBrowser() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 TESTE - CONECTANDO AO CHROME EXISTENTE');
  console.log('='.repeat(70));
  
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  let browser, page;
  
  try {
    // Tentar conectar ao Chrome via CDP na porta padrão
    console.log('\n🔌 Tentando conectar ao Chrome existente...');
    browser = await chromium.connectOverCDP('http://localhost:9222');
    console.log('   ✅ Conectado ao Chrome existente!');
    
    const contexts = browser.contexts();
    const context = contexts[0];
    const pages = context.pages();
    
    // Procurar página do AI Studio ou criar nova
    page = pages.find(p => p.url().includes('aistudio.google.com'));
    if (!page) {
      page = await context.newPage();
    }
    
  } catch (err) {
    console.log('   ⚠️ Não foi possível conectar:', err.message);
    console.log('\n📋 INSTRUÇÕES:');
    console.log('   1. Feche TODOS os processos do Chrome');
    console.log('   2. Abra o Chrome com debugging habilitado:');
    console.log('');
    console.log('   chrome.exe --remote-debugging-port=9222 --user-data-dir="C:\\Projetos\\Fabrica-de-conteudo\\browser-data"');
    console.log('');
    console.log('   3. Execute este script novamente');
    return;
  }
  
  try {
    // Navegar para AI Studio
    console.log('\n📍 Navegando para Google AI Studio...');
    await page.goto('https://aistudio.google.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await screenshot(page, '01_pagina');
    
    // Verificar login
    console.log('\n🔐 Verificando login...');
    const userEmail = await page.$(SELECTORS.userEmail);
    if (userEmail) {
      const emailText = await userEmail.textContent();
      console.log(`   ✅ Logado como: ${emailText}`);
    } else {
      console.log('   ❌ NÃO LOGADO');
      return;
    }
    
    // Clicar em Images
    console.log('\n🖼️ Selecionando filtro Images...');
    const imagesBtn = await page.$(SELECTORS.filterImages);
    if (imagesBtn) {
      await imagesBtn.click();
      await page.waitForTimeout(1500);
    }
    await screenshot(page, '02_images');
    
    // Clicar em Nano Banana Pro
    console.log('\n🍌 Selecionando Nano Banana Pro...');
    const nanoBanana = await page.$(SELECTORS.nanoBananaPro);
    if (nanoBanana) {
      await nanoBanana.click();
      await page.waitForTimeout(1500);
    }
    await screenshot(page, '03_nano_banana');
    
    // Encontrar prompt
    console.log('\n📝 Localizando campo de prompt...');
    let promptInput = await page.$(SELECTORS.promptInput) || await page.$(SELECTORS.promptInputAlt);
    
    if (!promptInput) {
      // Listar todos os textareas para debug
      const textareas = await page.$$('textarea');
      console.log(`   Encontrados ${textareas.length} textareas`);
      for (let i = 0; i < textareas.length; i++) {
        const ta = textareas[i];
        const ariaLabel = await ta.getAttribute('aria-label');
        const visible = await ta.isVisible();
        console.log(`   [${i}] aria-label="${ariaLabel}" visible=${visible}`);
        if (visible) {
          promptInput = ta;
          break;
        }
      }
    }
    
    if (!promptInput) {
      throw new Error('Campo de prompt não encontrado!');
    }
    console.log('   ✅ Campo encontrado!');
    
    // Preencher prompt
    const testPrompt = 'A cute orange cat wearing astronaut helmet floating in space, digital art, vibrant colors';
    console.log(`\n✍️ Preenchendo: "${testPrompt.substring(0, 50)}..."`);
    
    await promptInput.click();
    await page.waitForTimeout(300);
    await promptInput.fill(testPrompt);
    await page.waitForTimeout(1000);
    await screenshot(page, '04_prompt');
    
    // Clicar Run
    console.log('\n🔘 Clicando Run...');
    const runButton = await page.$(SELECTORS.runButton);
    if (!runButton) {
      throw new Error('Botão Run não encontrado!');
    }
    
    const isDisabled = await runButton.evaluate(el => el.disabled);
    console.log(`   Disabled: ${isDisabled}`);
    
    await runButton.click();
    await screenshot(page, '05_run_clicked');
    
    // Aguardar imagem
    console.log('\n⏳ Aguardando geração (até 3 min)...');
    const startTime = Date.now();
    const timeout = 180000;
    let imageFound = false;
    let imageElement = null;
    
    while (Date.now() - startTime < timeout && !imageFound) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      
      // Procurar imagens
      const images = await page.$$('ms-prompt-renderer img, .response-container img');
      for (const img of images) {
        const src = await img.getAttribute('src');
        if (src && (src.startsWith('blob:') || src.startsWith('data:') || src.includes('googleusercontent'))) {
          imageElement = img;
          imageFound = true;
          console.log(`   ✅ Imagem encontrada após ${elapsed}s!`);
          break;
        }
      }
      
      if (!imageFound) {
        const canvas = await page.$('ms-prompt-renderer canvas');
        if (canvas) {
          imageElement = canvas;
          imageFound = true;
          console.log(`   ✅ Canvas encontrado após ${elapsed}s!`);
        }
      }
      
      if (!imageFound) {
        if (elapsed % 15 === 0) {
          console.log(`   ⏳ ${elapsed}s...`);
          await screenshot(page, `06_wait_${elapsed}s`);
        }
        await page.waitForTimeout(3000);
      }
    }
    
    await screenshot(page, '07_resultado');
    
    if (imageFound && imageElement) {
      const outputPath = path.join(OUTPUT_DIR, `test_${Date.now()}.png`);
      await imageElement.screenshot({ path: outputPath });
      console.log(`\n✅ SUCESSO! Imagem salva: ${outputPath}`);
    } else {
      console.log('\n❌ Timeout - imagem não gerada');
    }
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    await screenshot(page, 'erro');
  }
  
  console.log('\n🔍 Navegador mantido aberto.');
}

async function screenshot(page, name) {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}_${Date.now()}.png`);
  await page.screenshot({ path: filepath });
  console.log(`   📸 ${name}`);
}

testWithExistingBrowser().catch(console.error);

/**
 * Auto Mapeador do Google AI Studio
 * Versão automatizada sem necessidade de input manual
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

const USER_DATA_DIR = path.join(__dirname, '../../../browser-data');
const SCREENSHOTS_DIR = path.join(__dirname, '../../assets/screenshots');
const CONFIG_DIR = path.join(__dirname, '../../config');

async function autoMap() {
  console.log('\n🎭 AUTO MAPEADOR DO GOOGLE AI STUDIO');
  console.log('=' .repeat(60));
  
  // Criar diretórios
  await fs.mkdir(USER_DATA_DIR, { recursive: true });
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  
  console.log('\n📂 Diretório de sessão:', USER_DATA_DIR);
  console.log('🚀 Iniciando navegador...\n');
  
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    slowMo: 100,
    viewport: { width: 1920, height: 1080 },
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  
  const pages = browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();
  
  console.log('✅ Navegador iniciado!');
  
  const results = {
    timestamp: new Date().toISOString(),
    url: 'https://aistudio.google.com',
    loginStatus: false,
    selectors: {},
    pageStructure: {},
    screenshots: [],
    logs: []
  };
  
  const log = (msg) => {
    console.log(msg);
    results.logs.push({ time: new Date().toISOString(), message: msg });
  };
  
  const screenshot = async (name) => {
    const filepath = path.join(SCREENSHOTS_DIR, `${name}_${Date.now()}.png`);
    await page.screenshot({ path: filepath, fullPage: false });
    results.screenshots.push(filepath);
    log(`   📸 Screenshot: ${name}`);
    return filepath;
  };
  
  try {
    // Navegar para o Google AI Studio
    log('\n📍 Navegando para Google AI Studio...');
    await page.goto('https://aistudio.google.com', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    log('✅ Página carregada!');
    
    await screenshot('01_pagina_inicial');
    
    // Verificar login
    log('\n🔐 Verificando login...');
    try {
      await page.waitForSelector(
        'img[alt*="Account"], img[alt*="Google"], .gb_d, [data-email], button[aria-label*="Account"]',
        { timeout: 5000 }
      );
      log('✅ Usuário está LOGADO!');
      results.loginStatus = true;
    } catch {
      log('❌ Usuário NÃO está logado');
      results.loginStatus = false;
    }
    
    // Aguardar página estabilizar
    await page.waitForTimeout(3000);
    
    // Capturar estrutura da página
    log('\n🔍 ANALISANDO ESTRUTURA DA PÁGINA...');
    log('=' .repeat(60));
    
    // Listar todos os elementos interativos
    const pageAnalysis = await page.evaluate(() => {
      const analysis = {
        textareas: [],
        buttons: [],
        inputs: [],
        contentEditables: [],
        iframes: [],
        customElements: []
      };
      
      // Textareas
      document.querySelectorAll('textarea').forEach((el, i) => {
        analysis.textareas.push({
          index: i,
          id: el.id,
          class: el.className,
          placeholder: el.placeholder,
          ariaLabel: el.getAttribute('aria-label'),
          name: el.name,
          visible: el.offsetParent !== null,
          rect: el.getBoundingClientRect()
        });
      });
      
      // Buttons
      document.querySelectorAll('button').forEach((el, i) => {
        if (el.offsetParent !== null) { // Apenas visíveis
          analysis.buttons.push({
            index: i,
            text: el.textContent?.trim().substring(0, 100),
            ariaLabel: el.getAttribute('aria-label'),
            class: el.className.substring(0, 100),
            type: el.type,
            disabled: el.disabled
          });
        }
      });
      
      // Inputs
      document.querySelectorAll('input[type="text"], input:not([type])').forEach((el, i) => {
        analysis.inputs.push({
          index: i,
          id: el.id,
          class: el.className,
          placeholder: el.placeholder,
          ariaLabel: el.getAttribute('aria-label'),
          visible: el.offsetParent !== null
        });
      });
      
      // Content editables
      document.querySelectorAll('[contenteditable="true"]').forEach((el, i) => {
        analysis.contentEditables.push({
          index: i,
          tagName: el.tagName,
          class: el.className,
          ariaLabel: el.getAttribute('aria-label'),
          visible: el.offsetParent !== null
        });
      });
      
      // Iframes
      document.querySelectorAll('iframe').forEach((el, i) => {
        analysis.iframes.push({
          index: i,
          src: el.src,
          id: el.id
        });
      });
      
      // Custom elements (web components)
      const customTags = new Set();
      document.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) {
          customTags.add(el.tagName.toLowerCase());
        }
      });
      analysis.customElements = Array.from(customTags);
      
      return analysis;
    });
    
    results.pageStructure = pageAnalysis;
    
    log('\n📋 TEXTAREAS ENCONTRADOS:');
    pageAnalysis.textareas.forEach(t => {
      log(`   [${t.index}] id="${t.id}" placeholder="${t.placeholder}" aria-label="${t.ariaLabel}" visible=${t.visible}`);
    });
    
    log('\n📋 BOTÕES VISÍVEIS (primeiros 15):');
    pageAnalysis.buttons.slice(0, 15).forEach(b => {
      log(`   [${b.index}] "${b.text?.substring(0, 30)}" aria-label="${b.ariaLabel}" disabled=${b.disabled}`);
    });
    
    log('\n📋 CONTENT EDITABLES:');
    pageAnalysis.contentEditables.forEach(c => {
      log(`   [${c.index}] <${c.tagName}> class="${c.class?.substring(0, 50)}" visible=${c.visible}`);
    });
    
    log('\n📋 CUSTOM ELEMENTS (Web Components):');
    pageAnalysis.customElements.forEach(c => {
      log(`   <${c}>`);
    });
    
    // Tentar identificar seletores específicos
    log('\n🎯 IDENTIFICANDO SELETORES...');
    
    // Prompt input
    const promptSelectors = [
      'textarea[aria-label*="prompt" i]',
      'textarea[aria-label*="Type" i]',
      'textarea[placeholder*="prompt" i]',
      'textarea[placeholder*="Type" i]',
      '.ql-editor',
      'div[contenteditable="true"][role="textbox"]',
      'ms-autosize-textarea textarea',
      'ms-prompt-input textarea',
      'textarea.prompt-textarea'
    ];
    
    for (const selector of promptSelectors) {
      try {
        const el = await page.$(selector);
        if (el && await el.isVisible()) {
          log(`   ✅ PROMPT INPUT: ${selector}`);
          results.selectors.promptInput = selector;
          
          // Destacar
          await page.evaluate((sel) => {
            const e = document.querySelector(sel);
            if (e) e.style.border = '3px solid red';
          }, selector);
          
          break;
        }
      } catch {}
    }
    
    // Run button
    const runSelectors = [
      'button[aria-label*="Run" i]',
      'button:has-text("Run")',
      'button:has-text("Generate")',
      'button:has-text("Send")',
      'button[data-testid*="run" i]',
      'ms-run-button button',
      'button.run-button'
    ];
    
    for (const selector of runSelectors) {
      try {
        const el = await page.$(selector);
        if (el && await el.isVisible()) {
          log(`   ✅ RUN BUTTON: ${selector}`);
          results.selectors.runButton = selector;
          
          // Destacar
          await page.evaluate((sel) => {
            const e = document.querySelector(sel);
            if (e) e.style.border = '3px solid green';
          }, selector);
          
          break;
        }
      } catch {}
    }
    
    await screenshot('02_elementos_destacados');
    
    // Se não encontrou, tentar abordagem diferente
    if (!results.selectors.promptInput) {
      log('\n⚠️ Prompt input não encontrado com seletores padrão.');
      log('   Tentando encontrar por posição...');
      
      // Pegar o maior textarea visível
      const largestTextarea = await page.evaluate(() => {
        let largest = null;
        let maxArea = 0;
        
        document.querySelectorAll('textarea').forEach(el => {
          if (el.offsetParent !== null) {
            const rect = el.getBoundingClientRect();
            const area = rect.width * rect.height;
            if (area > maxArea) {
              maxArea = area;
              largest = {
                tagName: el.tagName,
                id: el.id,
                class: el.className,
                area: area
              };
            }
          }
        });
        
        return largest;
      });
      
      if (largestTextarea) {
        log(`   📐 Maior textarea: id="${largestTextarea.id}" class="${largestTextarea.class}" area=${largestTextarea.area}`);
        
        if (largestTextarea.id) {
          results.selectors.promptInput = `#${largestTextarea.id}`;
        } else if (largestTextarea.class) {
          results.selectors.promptInput = `textarea.${largestTextarea.class.split(' ')[0]}`;
        }
      }
    }
    
    // Salvar resultados
    const resultsPath = path.join(CONFIG_DIR, 'google-ai-studio-mapping.json');
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    log(`\n💾 Resultados salvos em: ${resultsPath}`);
    
    // Resumo final
    log('\n' + '=' .repeat(60));
    log('📊 RESUMO DO MAPEAMENTO');
    log('=' .repeat(60));
    log(`   Login: ${results.loginStatus ? '✅ Logado' : '❌ Não logado'}`);
    log(`   Textareas: ${pageAnalysis.textareas.length}`);
    log(`   Botões visíveis: ${pageAnalysis.buttons.length}`);
    log(`   Content editables: ${pageAnalysis.contentEditables.length}`);
    log(`   Custom elements: ${pageAnalysis.customElements.length}`);
    log(`   Screenshots: ${results.screenshots.length}`);
    log('\n   Seletores identificados:');
    log(`   - Prompt Input: ${results.selectors.promptInput || '❌ Não encontrado'}`);
    log(`   - Run Button: ${results.selectors.runButton || '❌ Não encontrado'}`);
    
    // Manter navegador aberto para inspeção
    log('\n🔍 Navegador mantido aberto para inspeção manual.');
    log('   Feche a janela do navegador quando terminar.');
    
    // Aguardar navegador fechar
    await new Promise(resolve => {
      browser.on('close', resolve);
    });
    
  } catch (error) {
    log(`\n❌ ERRO: ${error.message}`);
    console.error(error);
  }
  
  return results;
}

// Executar
autoMap().then(results => {
  console.log('\n✅ Mapeamento concluído!');
}).catch(console.error);

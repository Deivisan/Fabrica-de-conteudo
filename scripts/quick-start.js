#!/usr/bin/env node

/**
 * Quick Start Script
 * Configura e inicia a MCP rapidamente
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

function exec(cmd, options = {}) {
  console.log(`\n$ ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`Erro ao executar: ${cmd}`);
    return false;
  }
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 MCP - Marketing Content Platform                        ║
║   Quick Start Setup                                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

  // Verificar Node.js
  console.log('📋 Verificando requisitos...\n');
  
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    console.log(`   ✅ Node.js: ${nodeVersion}`);
  } catch {
    console.log('   ❌ Node.js não encontrado. Por favor, instale Node.js 18+');
    process.exit(1);
  }

  // Verificar npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`   ✅ npm: ${npmVersion}`);
  } catch {
    console.log('   ❌ npm não encontrado');
    process.exit(1);
  }

  // Verificar se node_modules existe
  const nodeModulesExists = fs.existsSync(path.join(__dirname, '../node_modules'));
  
  if (!nodeModulesExists) {
    console.log('\n📦 Instalando dependências...');
    if (!exec('npm install')) {
      console.log('❌ Falha ao instalar dependências');
      process.exit(1);
    }
  } else {
    console.log('   ✅ Dependências já instaladas');
  }

  // Verificar Playwright
  console.log('\n🎭 Verificando Playwright...');
  
  const browserDataExists = fs.existsSync(path.join(__dirname, '../browser-data'));
  
  try {
    execSync('npx playwright --version', { encoding: 'utf8' });
    console.log('   ✅ Playwright instalado');
  } catch {
    console.log('   📥 Instalando Playwright...');
    exec('npx playwright install chromium --with-deps');
  }

  // Criar diretórios necessários
  console.log('\n📁 Criando diretórios...');
  
  const dirs = [
    'assets',
    'assets/generated',
    'assets/generated/images',
    'assets/generated/videos',
    'assets/generated/text',
    'output',
    'output/campaigns',
    'browser-data',
    'logs'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`   📁 Criado: ${dir}`);
    }
  });

  // Criar .env se não existir
  const envPath = path.join(__dirname, '../.env');
  const envExamplePath = path.join(__dirname, '../.env.example');
  
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('   📄 Criado: .env');
  }

  // Perguntar sobre configuração de sessão
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🔐 Configuração de Sessão                                  ║
║                                                              ║
║   Para usar IAs gratuitas, você precisa fazer login          ║
║   nos serviços uma vez. O navegador abrirá para você         ║
║   fazer login manualmente.                                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

  const setupSession = await question('Deseja configurar as sessões agora? (s/n): ');
  
  if (setupSession.toLowerCase() === 's') {
    console.log('\n🔐 Iniciando configuração de sessão...');
    console.log('   O navegador abrirá. Faça login nos serviços e pressione ENTER quando terminar.\n');
    
    const setup = spawn('node', ['treinamento/index.js', '--setup'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    await new Promise(resolve => setup.on('close', resolve));
  }

  // Finalização
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ✅ Configuração Concluída!                                 ║
║                                                              ║
║   Comandos úteis:                                            ║
║                                                              ║
║   # Gerar imagem                                             ║
║   node treinamento/examples/generate-image.js "prompt"       ║
║                                                              ║
║   # Gerar texto                                              ║
║   node treinamento/examples/generate-text.js post instagram  ║
║                                                              ║
║   # Gerar campanha completa                                  ║
║   node treinamento/examples/full-campaign.js "tema"          ║
║                                                              ║
║   # Iniciar servidor web                                     ║
║   npm start                                                  ║
║                                                              ║
║   # Verificar sessões                                        ║
║   node treinamento/index.js --check                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

  rl.close();
}

main().catch(console.error);

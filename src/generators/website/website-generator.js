/**
 * Gerador de Websites
 * Este módulo gera páginas HTML estáticas baseadas em estratégias
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class WebsiteGenerator {
  constructor(config) {
    this.config = config;
    this.assetsDir = config.assetsDir || './assets';
    this.outputDir = config.outputDir || './output';
  }

  /**
   * Gera landing page
   */
  async generateLandingPage(strategy) {
    const html = this.buildLandingPageHTML(strategy);
    const filename = `landing_${Date.now()}_${uuidv4().slice(0, 8)}.html`;
    const filepath = await this.saveHTML(html, filename, strategy);
    return filepath;
  }

  /**
   * Gera página de agradecimento
   */
  async generateThankYouPage(strategy, redirectUrl = '/') {
    const html = this.buildThankYouPageHTML(strategy, redirectUrl);
    const filename = `thankyou_${Date.now()}_${uuidv4().slice(0, 8)}.html`;
    const filepath = await this.saveHTML(html, filename, strategy);
    return filepath;
  }

  /**
   * Gera página de captura de leads
   */
  async generateLeadCapturePage(strategy) {
    const html = this.buildLeadCapturePageHTML(strategy);
    const filename = `lead_capture_${Date.now()}_${uuidv4().slice(0, 8)}.html`;
    const filepath = await this.saveHTML(html, filename, strategy);
    return filepath;
  }

  /**
   * Gera microsite com múltiplas páginas
   */
  async generateMicrosite(strategy, pages = ['home', 'about', 'contact']) {
    const siteDir = path.join(this.outputDir, `microsite_${Date.now()}`);
    await fs.mkdir(siteDir, { recursive: true });

    const site = {};
    
    for (const pageType of pages) {
      let html, filename;
      
      switch (pageType) {
        case 'home':
          html = this.buildLandingPageHTML({ ...strategy, pageType: 'home' });
          filename = 'index.html';
          break;
        case 'about':
          html = this.buildAboutPageHTML(strategy);
          filename = 'about.html';
          break;
        case 'contact':
          html = this.buildContactPageHTML(strategy);
          filename = 'contact.html';
          break;
        default:
          html = this.buildBasicPageHTML(strategy, pageType);
          filename = `${pageType}.html`;
      }
      
      const filepath = path.join(siteDir, filename);
      await fs.writeFile(filepath, html, 'utf8');
      site[pageType] = filepath;
    }

    // Adiciona CSS comum
    const css = this.getDefaultCSS();
    await fs.writeFile(path.join(siteDir, 'styles.css'), css, 'utf8');

    // Adiciona JS comum
    const js = this.getDefaultJS();
    await fs.writeFile(path.join(siteDir, 'script.js'), js, 'utf8');

    return siteDir;
  }

  // Métodos para construção de HTML

  buildLandingPageHTML(strategy) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${strategy.title || 'Landing Page'}</title>
  <style>
    ${this.getDefaultCSS()}
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: ${strategy.primary_color || '#ffffff'};
      color: ${strategy.text_color || '#333333'};
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      text-align: center;
      padding: 40px 0;
    }
    .hero {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, ${strategy.primary_color || '#667eea'} 0%, ${strategy.secondary_color || '#764ba2'} 100%);
      color: white;
      margin-bottom: 40px;
    }
    .cta-button {
      display: inline-block;
      background: ${strategy.cta_color || '#ff6b6b'};
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-size: 1.2em;
      margin-top: 20px;
    }
    .features {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
      margin: 40px 0;
    }
    .feature {
      flex: 1;
      min-width: 250px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${strategy.headline || 'Bem-vindo!'}</h1>
      <p>${strategy.subheadline || 'Descubra como podemos ajudar você'}</p>
    </header>

    <section class="hero">
      <h2>${strategy.offer || 'Oferta Especial!'}</h2>
      <p>${strategy.benefits ? strategy.benefits.join('<br>') : 'Benefícios incríveis aguardam você!'}</p>
      <a href="#cta" class="cta-button">${strategy.cta_text || 'Saiba Mais'}</a>
    </section>

    <section class="features">
      ${strategy.features ? strategy.features.map(feat => `
        <div class="feature">
          <h3>${feat.title || 'Recurso'}</h3>
          <p>${feat.description || 'Descrição do recurso'}</p>
        </div>
      `).join('') : ''}
    </section>

    <section id="cta" style="text-align: center; padding: 40px 0;">
      <h2>${strategy.cta_header || 'Pronto para começar?'}</h2>
      <a href="${strategy.cta_link || '#'}" class="cta-button">${strategy.cta_text || 'Comece Agora'}</a>
    </section>

    <footer style="text-align: center; padding: 20px; margin-top: 40px; border-top: 1px solid #ddd;">
      <p>&copy; ${new Date().getFullYear()} ${strategy.company_name || 'Sua Empresa'}. Todos os direitos reservados.</p>
    </footer>
  </div>

  <script>
    ${this.getDefaultJS()}
  </script>
</body>
</html>`;
  }

  buildThankYouPageHTML(strategy, redirectUrl) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agradecimento - ${strategy.title || 'Obrigado!'}</title>
  <style>
    ${this.getDefaultCSS()}
    body {
      font-family: Arial, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, ${strategy.primary_color || '#667eea'} 0%, ${strategy.secondary_color || '#764ba2'} 100%);
      color: white;
      text-align: center;
    }
    .container {
      max-width: 600px;
      padding: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      backdrop-filter: blur(10px);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${strategy.thank_you_title || 'Obrigado!'}</h1>
    <p>${strategy.thank_you_message || 'Agradecemos pelo seu contato!'}</p>
    <p>Você será redirecionado em <span id="countdown">5</span> segundos...</p>
    <a href="${redirectUrl}" style="color: white; text-decoration: underline;">Clique aqui se não for redirecionado</a>
  </div>

  <script>
    ${this.getDefaultJS()}
    let count = 5;
    const countdownElement = document.getElementById('countdown');
    
    const countdown = setInterval(() => {
      count--;
      countdownElement.textContent = count;
      
      if (count <= 0) {
        clearInterval(countdown);
        window.location.href = '${redirectUrl}';
      }
    }, 1000);
  </script>
</body>
</html>`;
  }

  buildLeadCapturePageHTML(strategy) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Captura de Lead - ${strategy.title || 'Capture Leads'}</title>
  <style>
    ${this.getDefaultCSS()}
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, ${strategy.primary_color || '#667eea'} 0%, ${strategy.secondary_color || '#764ba2'} 100%);
      color: ${strategy.text_color || '#333333'};
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      text-align: center;
    }
    form {
      margin-top: 30px;
    }
    input {
      width: 100%;
      padding: 15px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
      box-sizing: border-box;
    }
    .submit-btn {
      background: ${strategy.cta_color || '#ff6b6b'};
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 16px;
      border-radius: 5px;
      cursor: pointer;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${strategy.lead_capture_headline || 'Capture Leads'}</h1>
    <p>${strategy.lead_capture_subheadline || 'Preencha o formulário abaixo para receber mais informações'}</p>
    
    <form id="leadForm">
      <input type="text" name="name" placeholder="Seu nome" required />
      <input type="email" name="email" placeholder="Seu email" required />
      <input type="tel" name="phone" placeholder="Seu telefone" />
      
      ${strategy.custom_fields ? strategy.custom_fields.map(field => `
        <input type="${field.type || 'text'}" name="${field.name}" placeholder="${field.placeholder || field.name}" 
        ${field.required ? 'required' : ''} />
      `).join('') : ''}
      
      <button type="submit" class="submit-btn">${strategy.form_cta || 'Enviar'}</button>
    </form>
  </div>

  <script>
    document.getElementById('leadForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Aqui você integraria com sua ferramenta de captura de leads
      alert('Lead capturado com sucesso!');
      this.reset();
    });
    
    ${this.getDefaultJS()}
  </script>
</body>
</html>`;
  }

  buildAboutPageHTML(strategy) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sobre - ${strategy.title || 'Sobre Nós'}</title>
  <style>
    ${this.getDefaultCSS()}
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: ${strategy.primary_color || '#ffffff'};
      color: ${strategy.text_color || '#333333'};
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${strategy.about_title || 'Sobre Nós'}</h1>
    <p>${strategy.about_description || 'Informações sobre a empresa e sua missão.'}</p>
    
    <h2>Nossa Equipe</h2>
    ${strategy.team ? strategy.team.map(member => `
      <div style="margin: 20px 0; text-align: center;">
        <h3>${member.name}</h3>
        <p>${member.role}</p>
      </div>
    `).join('') : '<p>Equipe não especificada</p>'}
    
    <h2>Nossa Missão</h2>
    <p>${strategy.mission || 'Nossa missão não está definida.'}</p>
    
    <h2>Nossa Visão</h2>
    <p>${strategy.vision || 'Nossa visão não está definida.'}</p>
    
    <footer style="text-align: center; padding: 20px; margin-top: 40px; border-top: 1px solid #ddd;">
      <p>&copy; ${new Date().getFullYear()} ${strategy.company_name || 'Sua Empresa'}. Todos os direitos reservados.</p>
    </footer>
  </div>
</body>
</html>`;
  }

  buildContactPageHTML(strategy) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contato - ${strategy.title || 'Fale Conosco'}</title>
  <style>
    ${this.getDefaultCSS()}
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: ${strategy.primary_color || '#ffffff'};
      color: ${strategy.text_color || '#333333'};
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${strategy.contact_title || 'Entre em Contato'}</h1>
    <p>${strategy.contact_description || 'Entre em contato conosco através do formulário abaixo.'}</p>
    
    <address style="margin: 20px 0;">
      <p><strong>Endereço:</strong> ${strategy.address || 'Endereço não especificado'}</p>
      <p><strong>Telefone:</strong> ${strategy.phone || 'Telefone não especificado'}</p>
      <p><strong>Email:</strong> <a href="mailto:${strategy.email || ''}">${strategy.email || 'Email não especificado'}</a></p>
    </address>
    
    <form id="contactForm" style="margin-top: 30px;">
      <div style="margin-bottom: 15px;">
        <input type="text" name="name" placeholder="Seu nome" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" required />
      </div>
      <div style="margin-bottom: 15px;">
        <input type="email" name="email" placeholder="Seu email" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" required />
      </div>
      <div style="margin-bottom: 15px;">
        <input type="text" name="subject" placeholder="Assunto" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" required />
      </div>
      <div style="margin-bottom: 15px;">
        <textarea name="message" placeholder="Sua mensagem" rows="5" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;" required></textarea>
      </div>
      <button type="submit" style="background: ${strategy.cta_color || '#ff6b6b'}; color: white; padding: 15px 30px; border: none; border-radius: 5px; cursor: pointer;">Enviar Mensagem</button>
    </form>
  </div>

  <script>
    document.getElementById('contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Mensagem enviada com sucesso!');
      this.reset();
    });
    
    ${this.getDefaultJS()}
  </script>
</body>
</html>`;
  }

  buildBasicPageHTML(strategy, pageType) {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageType.charAt(0).toUpperCase() + pageType.slice(1)} - ${strategy.title || 'Página'}</title>
  <style>
    ${this.getDefaultCSS()}
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: ${strategy.primary_color || '#ffffff'};
      color: ${strategy.text_color || '#333333'};
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${pageType.charAt(0).toUpperCase() + pageType.slice(1)}</h1>
    <p>Conteúdo para a página de ${pageType}.</p>
  </div>
</body>
</html>`;
  }

  // Métodos auxiliares

  getDefaultCSS() {
    return `
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
      }
      h1, h2, h3 {
        margin-top: 0;
      }
    `;
  }

  getDefaultJS() {
    return `
      // Funções JavaScript comuns para todas as páginas
      document.addEventListener('DOMContentLoaded', function() {
        console.log('Página carregada');
      });
    `;
  }

  async saveHTML(html, filename, strategy) {
    const outputDir = path.join(this.outputDir, 'websites');
    await fs.mkdir(outputDir, { recursive: true });
    
    const filepath = path.join(outputDir, filename);
    await fs.writeFile(filepath, html, 'utf8');
    
    console.log(`Website salvo em: ${filepath}`);
    return filepath;
  }
}

module.exports = WebsiteGenerator;
/**
 * Gerenciador de APIs Próprias
 * Cria e gerencia APIs personalizadas para geração de conteúdo
 */

const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

class OwnAPIManager {
  constructor(config) {
    this.config = config;
    this.apis = new Map(); // Armazena APIs criadas
    this.server = null;
    this.port = config.api_port || 3001;
  }

  normalizeModel(model) {
    if (!model) return 'xai/grok-code-fast-1';
    if (typeof model !== 'string') return model;
    if (model.includes('/') || model.includes('.')) return model;
    return `xai/${model}`;
  }

  /**
   * Inicia o servidor para gerenciamento de APIs
   */
  async startServer() {
    this.app = express();
    this.app.use(express.json());
    
    // Rota para criação de nova API
    this.app.post('/create-api', async (req, res) => {
      try {
        const { name, type, config } = req.body;
        const apiKey = await this.createAPI(name, type, config);
        res.json({ success: true, apiKey, name });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Rota para geração de conteúdo
    this.app.post('/generate/:apiType', async (req, res) => {
      try {
        const { apiType } = req.params;
        const { prompt, options = {} } = req.body;
        
        const result = await this.generate(apiType, prompt, options);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Rota para teste de API
    this.app.get('/test/:apiKey', async (req, res) => {
      try {
        const { apiKey } = req.params;
        const isValid = this.validateAPIKey(apiKey);
        res.json({ success: isValid, valid: isValid });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Inicia o servidor
    await new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        console.log(`Servidor de APIs próprias iniciado na porta ${this.port}`);
        resolve();
      });
    });
  }

  /**
   * Cria uma nova API personalizada
   */
  async createAPI(name, type, config) {
    const apiKey = this.generateAPIKey();
    
    const apiData = {
      id: apiKey,
      name,
      type,
      config,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    };
    
    this.apis.set(apiKey, apiData);
    await this.saveAPIs();
    
    console.log(`API criada: ${name} (${type}) - ${apiKey}`);
    return apiKey;
  }

  /**
   * Gera conteúdo usando uma API específica
   */
  async generate(apiType, prompt, options = {}) {
    // Primeiro, tenta identificar qual IA usar com base no tipo
    switch (apiType.toLowerCase()) {
      case 'text':
      case 'content':
        return await this.generateText(prompt, options);
        
      case 'image':
      case 'imagery':
        return await this.generateImage(prompt, options);
        
      case 'video':
        return await this.generateVideo(prompt, options);
        
      case 'scrape':
      case 'web':
        return await this.scrapeWeb(prompt, options);
        
      default:
        throw new Error(`Tipo de API não suportado: ${apiType}`);
    }
  }

  /**
   * Gera texto usando múltiplas fontes
   */
  async generateText(prompt, options = {}) {
    // Pode combinar múltiplas fontes de IA
    const results = [];
    
    // Tenta com OpenAI primeiro
    try {
      const openaiResponse = await this.callExternalAPI('openai', prompt, options);
      results.push({ source: 'openai', content: openaiResponse });
    } catch (e) {
      console.log('OpenAI não disponível ou falhou');
    }
    
    // Tenta com Google
    try {
      const googleResponse = await this.callExternalAPI('google', prompt, options);
      results.push({ source: 'google', content: googleResponse });
    } catch (e) {
      console.log('Google não disponível ou falhou');
    }
    
    // Tenta com Grok
    try {
      const grokResponse = await this.callExternalAPI('grok', prompt, options);
      results.push({ source: 'grok', content: grokResponse });
    } catch (e) {
      console.log('Grok não disponível ou falhou');
    }
    
    // Retorna o melhor resultado ou combinação
    return this.processResults(results, options);
  }

  /**
   * Gera imagem usando múltiplas fontes
   */
  async generateImage(prompt, options = {}) {
    // Pode combinar múltiplas fontes de IA
    const results = [];
    
    // Tenta com OpenAI (DALL-E) primeiro
    try {
      const openaiResponse = await this.callExternalAPI('openai-image', prompt, options);
      results.push({ source: 'openai-image', content: openaiResponse });
    } catch (e) {
      console.log('OpenAI Image não disponível ou falhou');
    }
    
    // Tenta com Google ou outros
    try {
      // Implementação para outras fontes de geração de imagem
    } catch (e) {
      console.log('Outra fonte de imagem falhou');
    }
    
    return this.processResults(results, options);
  }

  /**
   * Realiza web scraping e análise
   */
  async scrapeWeb(url, options = {}) {
    // Implementar scraping com Cheerio ou Puppeteer
    const { data } = await axios.get(url);
    // Processar e retornar dados relevantes
    return {
      url,
      title: this.extractTitle(data),
      description: this.extractDescription(data),
      content: this.extractContent(data),
      keywords: this.extractKeywords(data)
    };
  }

  /**
   * Extrai título da página
   */
  extractTitle(html) {
    const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
    return match ? match[1].trim() : '';
  }

  /**
   * Extrai descrição da página
   */
  extractDescription(html) {
    const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);
    return match ? match[1].trim() : '';
  }

  /**
   * Extrai conteúdo principal da página
   */
  extractContent(html) {
    // Simples extração de conteúdo - em produção, usaria Cheerio ou similar
    const contentMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return contentMatch ? contentMatch[1].replace(/<[^>]*>/g, '').substring(0, 500) : '';
  }

  /**
   * Extrai palavras-chave
   */
  extractKeywords(html) {
    // Simples extração de palavras-chave
    const content = this.extractContent(html);
    const words = content.toLowerCase().match(/\b(\w{4,})\b/g) || [];
    const wordCount = {};
    
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Chama API externa (OpenAI, Google, Grok, etc.)
   */
  async callExternalAPI(provider, prompt, options) {
    // Implementação simples para Grok via HTTP e placeholders para outros provedores
    console.log(`Chamando ${provider} com prompt: ${prompt.substring(0, 50)}...`);

    if (provider === 'grok') {
      // Não suportar modo imagem/vision para o Grok (texto apenas)
      if (options.type && options.type === 'image') {
        throw new Error('Grok não suporta geração de imagens/vision');
      }

      const endpoint = (this.config.grok_endpoint || 'https://api.x.ai/v1').replace(/\/$/, '');
      const model = this.normalizeModel(options.model || this.config.grok_model || 'xai/grok-code-fast-1');
      const headers = { 'Content-Type': 'application/json' };
      if (this.config.grok_api_key) headers['Authorization'] = `Bearer ${this.config.grok_api_key}`;

      const allowed = ['temperature','max_tokens','top_p','presence_penalty','frequency_penalty','stream','stop','n','logit_bias','functions','function_call'];
      const safeOptions = {};
      for (const k of allowed) {
        if (options[k] !== undefined) safeOptions[k] = options[k];
      }

      const body = {
        model,
        messages: [{ role: 'user', content: prompt }],
        ...safeOptions
      };

      try {
        const res = await require('axios').post(`${endpoint}/chat/completions`, body, { headers });
        if (res?.data?.choices?.[0]?.message?.content) return res.data.choices[0].message.content;
        if (res?.data?.choices?.[0]?.text) return res.data.choices[0].text;
        return res.data;
      } catch (err) {
        const resp = err?.response?.data;
        if (err?.response?.status === 400 && resp && resp.error && resp.error.code === 'invalid_request_body') {
          throw new Error(`Grok retornou 400 invalid_request_body — verifique se o modelo está correto (ex.: 'xai/grok-code-fast-1') e se o corpo da solicitação está conforme o esperado. Mensagem: ${resp.error.message}`);
        }
        throw new Error(`Erro ao chamar Grok: ${err.message}`);
      }
    }

    // Por enquanto, retornamos um mock para OpenAI/Google/local se não implementado
    return `Resposta simulada do provedor ${provider} para: ${prompt.substring(0, 100)}...`;
  }

  /**
   * Processa resultados de múltiplas fontes
   */
  processResults(results, options) {
    if (results.length === 0) {
      throw new Error('Nenhuma fonte de IA disponível');
    }
    
    if (options.combine) {
      // Combina resultados de múltiplas fontes
      return this.combineResults(results);
    } else {
      // Retorna o primeiro resultado disponível
      return results[0].content;
    }
  }

  /**
   * Combina resultados de múltiplas fontes
   */
  combineResults(results) {
    // Implementação para combinar respostas de múltiplas fontes
    return results.map(r => r.content).join('\n\n--- OU ---\n\n');
  }

  /**
   * Gera chave de API única
   */
  generateAPIKey() {
    return `mcp_${Date.now()}_${uuidv4().replace(/-/g, '')}`;
  }

  /**
   * Valida chave de API
   */
  validateAPIKey(key) {
    return this.apis.has(key);
  }

  /**
   * Salva APIs em arquivo
   */
  async saveAPIs() {
    const apisDir = path.join(this.config.assetsDir || './assets', 'apis');
    await fs.mkdir(apisDir, { recursive: true });
    
    const apisPath = path.join(apisDir, 'managed-apis.json');
    const apisArray = Array.from(this.apis.entries()).map(([key, value]) => ({ key, ...value }));
    
    await fs.writeFile(apisPath, JSON.stringify(apisArray, null, 2));
  }

  /**
   * Carrega APIs de arquivo
   */
  async loadAPIs() {
    const apisDir = path.join(this.config.assetsDir || './assets', 'apis');
    const apisPath = path.join(apisDir, 'managed-apis.json');
    
    try {
      const data = await fs.readFile(apisPath, 'utf8');
      const apisArray = JSON.parse(data);
      
      apisArray.forEach(api => {
        this.apis.set(api.key, api);
      });
      
      console.log(`Carregadas ${apisArray.length} APIs gerenciadas`);
    } catch (error) {
      console.log('Nenhuma API salva encontrada ou erro ao carregar');
    }
  }

  /**
   * Encerra o servidor de APIs
   */
  async stopServer() {
    if (this.server) {
      await new Promise((resolve, reject) => {
        this.server.close((err) => {
          if (err) return reject(err);
          console.log('Servidor de APIs próprias encerrado');
          resolve();
        });
      });
    }
  }
}

module.exports = OwnAPIManager;
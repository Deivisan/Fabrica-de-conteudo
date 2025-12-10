/**
 * Gerenciador de APIs de IA
 * Centraliza o acesso a diferentes provedores de IA (OpenAI, Google AI, Grok, etc.)
 */

const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Grok (xAI) provider will be implemented via HTTP using axios
const axios = require('axios');

class AIProviderManager {
  constructor(config) {
    this.config = config;
    this.providers = {};
    this.initializeProviders();
  }

  // Normaliza nomes de modelos Grok: aceita 'grok-code-fast-1' e converte para 'xai/grok-code-fast-1'
  normalizeModel(model) {
    if (!model) return 'xai/grok-code-fast-1';
    if (typeof model !== 'string') return model;
    if (model.includes('/') || model.includes('.')) return model;
    return `xai/${model}`;
  }

  /**
   * Inicializa os provedores de IA com base na configuração
   */
  initializeProviders() {
    // Inicializa OpenAI (ChatGPT)
    if (this.config.openai_api_key) {
      this.providers.openai = new OpenAI({
        apiKey: this.config.openai_api_key
      });
    }

    // Inicializa Google AI Studio
    if (this.config.google_ai_api_key) {
      this.providers.google = new GoogleGenerativeAI(this.config.google_ai_api_key);
    }

    // Inicializa Grok (xAI) - usa endpoint configurável via HTTP
    if (this.config.grok_api_key) {
      this.providers.grok = {
        apiKey: this.config.grok_api_key,
        endpoint: this.config.grok_endpoint || 'https://api.x.ai/v1',
        model: this.normalizeModel(this.config.grok_model || 'xai/grok-code-fast-1')
      };
    }

    // Inicializa provedor local/modelos próprios
    if (this.config.local_model_endpoint) {
      this.providers.local = {
        endpoint: this.config.local_model_endpoint,
        apiKey: this.config.local_model_api_key
      };
    }
  }

  /**
   * Gera texto usando o provedor mais apropriado
   */
  async generateText(prompt, options = {}) {
    const provider = options.provider || this.config.default_text_provider || 'openai';
    
    try {
      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(prompt, options);
          
        case 'google':
          return await this.generateWithGoogle(prompt, options);
          
        case 'grok':
          return await this.generateWithGrok(prompt, options);
          
        case 'local':
          return await this.generateWithLocalModel(prompt, options);
          
        default:
          throw new Error(`Provedor de IA não suportado: ${provider}`);
      }
    } catch (error) {
      console.error(`Erro ao gerar texto com ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Gera imagem usando o provedor mais apropriado
   */
  async generateImage(prompt, options = {}) {
    const provider = options.provider || this.config.default_image_provider || 'openai';
    
    try {
      switch (provider) {
        case 'openai':
          return await this.generateImageWithOpenAI(prompt, options);
          
        case 'google':
          return await this.generateImageWithGoogle(prompt, options);
          
        case 'local':
          return await this.generateImageWithLocalModel(prompt, options);
          
        default:
          throw new Error(`Provedor de IA para imagem não suportado: ${provider}`);
      }
    } catch (error) {
      console.error(`Erro ao gerar imagem com ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Geração de texto com OpenAI (ChatGPT)
   */
  async generateWithOpenAI(prompt, options = {}) {
    if (!this.providers.openai) {
      throw new Error('API OpenAI não está configurada');
    }

    const params = {
      model: options.model || this.config.openai_model || 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
      ...options
    };

    const response = await this.providers.openai.chat.completions.create(params);
    return response.choices[0].message.content;
  }

  /**
   * Geração de texto com Google AI Studio
   */
  async generateWithGoogle(prompt, options = {}) {
    if (!this.providers.google) {
      throw new Error('API Google AI não está configurada');
    }

    const model = this.providers.google.getGenerativeModel({
      model: options.model || this.config.google_model || 'gemini-pro'
    });

    const generationConfig = {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.max_tokens || 2000,
      topP: options.top_p || 0.95,
      ...options
    };

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig
    });

    return result.response.text();
  }

  /**
   * Geração de texto com Grok
   */
  async generateWithGrok(prompt, options = {}) {
    if (!this.providers.grok) {
      throw new Error('API Grok não está configurada');
    }

    // Grok Code Fast is a text model; do not allow image/vision requests
    if (options.type && options.type === 'image') {
      throw new Error('Grok (text model) não suporta geração de imagens/vision');
    }

    const model = this.normalizeModel(options.model || this.providers.grok.model || this.config.grok_model || 'xai/grok-code-fast-1');
    // Limpa/normaliza campos para a API Grok
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

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.providers.grok.apiKey}`
    };

    const url = `${this.providers.grok.endpoint.replace(/\/$/, '')}/chat/completions`;
    let response;
    try {
      response = await axios.post(url, body, { headers });
    } catch (err) {
      // Mapeia erros comuns para mensagens mais úteis
      const resp = err?.response?.data;
      if (err?.response?.status === 400 && resp && resp.error && resp.error.code === 'invalid_request_body') {
        throw new Error(`Grok retornou 400 invalid_request_body — verifique se o modelo está correto (ex.: 'xai/grok-code-fast-1') e se o corpo da solicitação está conforme o esperado. Mensagem: ${resp.error.message}`);
      }
      throw err;
    }

    // Compatibilidade: retorna dependendo da forma que a API responde
    if (response?.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }
    if (response?.data?.choices?.[0]?.text) {
      return response.data.choices[0].text;
    }

    // Caso não encontre, retorne o body bruto para inspeção
    return response.data;
  }

  /**
   * Geração de imagem com OpenAI
   */
  async generateImageWithOpenAI(prompt, options = {}) {
    if (!this.providers.openai) {
      throw new Error('API OpenAI não está configurada');
    }

    const params = {
      prompt: prompt,
      n: options.n || 1,
      size: options.size || '1024x1024',
      response_format: 'url',
      ...options
    };

    const response = await this.providers.openai.images.generate(params);
    return response.data[0].url;
  }

  /**
   * Geração de imagem com Google AI
   */
  async generateImageWithGoogle(prompt, options = {}) {
    if (!this.providers.google) {
      throw new Error('API Google AI não está configurada');
    }

    // Para geração de imagem com Google, podemos usar APIs de terceiros
    // ou redirecionar para provedores especializados
    const model = this.providers.google.getGenerativeModel({
      model: 'gemini-pro-vision' // ou modelo específico para imagens
    });

    // A geração de imagem com Google AI pode exigir uma abordagem diferente
    // Esta é uma implementação baseada em texto para simplificação
    const generationConfig = {
      temperature: options.temperature || 0.7,
      maxOutputTokens: options.max_tokens || 200,
      ...options
    };

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `Gere uma descrição de imagem para: ${prompt}` }]
      }],
      generationConfig
    });

    // Em um cenário real, você integraria com um provedor de geração de imagem
    // ou usaria a API do Google Imagen se disponível
    const imageDescription = result.response.text();
    
    // Por enquanto, retornando a descrição para possível uso com outro provedor
    return imageDescription;
  }

  /**
   * Geração com modelo local
   */
  async generateWithLocalModel(prompt, options = {}) {
    if (!this.providers.local) {
      throw new Error('Modelo local não está configurado');
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.providers.local.apiKey) {
      headers['Authorization'] = `Bearer ${this.providers.local.apiKey}`;
    }

    const data = {
      prompt: prompt,
      max_tokens: options.max_tokens || 2000,
      temperature: options.temperature || 0.7,
      ...options
    };

    const response = await axios.post(this.providers.local.endpoint, data, { headers });
    return response.data.choices?.[0]?.text || response.data.content;
  }

  /**
   * Geração de imagem com modelo local
   */
  async generateImageWithLocalModel(prompt, options = {}) {
    if (!this.providers.local) {
      throw new Error('Modelo local não está configurado');
    }

    // Implementação para geração de imagem com modelo local
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.providers.local.apiKey) {
      headers['Authorization'] = `Bearer ${this.providers.local.apiKey}`;
    }

    const data = {
      prompt: prompt,
      size: options.size || '1024x1024',
      ...options
    };

    const response = await axios.post(`${this.providers.local.endpoint}/images`, data, { headers });
    return response.data.url || response.data.data?.[0]?.url;
  }

  /**
   * Seleciona automaticamente o melhor provedor com base no tipo de conteúdo e disponibilidade
   */
  selectBestProvider(contentType, options = {}) {
    const availableProviders = Object.keys(this.providers);
    
    if (availableProviders.length === 0) {
      throw new Error('Nenhum provedor de IA está configurado');
    }

    // Prioridade de provedores com base no tipo de conteúdo
    const priority = {
      text: ['openai', 'google', 'grok', 'local'],
      image: ['openai', 'google', 'local']
    };

    const type = contentType.toLowerCase();
    const preferred = priority[type] || priority.text;

    // Retorna o primeiro provedor disponível na ordem de preferência
    for (const provider of preferred) {
      if (availableProviders.includes(provider)) {
        return provider;
      }
    }

    // Se não encontrar nenhum preferido, retorna o primeiro disponível
    return availableProviders[0];
  }

  /**
   * Testa a conexão com um provedor específico
   */
  async testProvider(providerName) {
    try {
      if (!this.providers[providerName]) {
        throw new Error(`Provedor ${providerName} não está inicializado`);
      }

      if (providerName === 'openai') {
        await this.providers.openai.models.list();
      } else if (providerName === 'google') {
        const model = this.providers.google.getGenerativeModel({ model: 'gemini-pro' });
        await model.generateContent({ contents: [{ role: 'user', parts: [{ text: 'test' }] }] });
      } else if (providerName === 'grok') {
        // Teste simples: faça uma chamada curta ao endpoint de chat/completions para verificar credenciais
        const body = { model: this.normalizeModel(this.providers.grok.model || this.config.grok_model || 'xai/grok-code-fast-1'), messages: [{ role: 'user', content: 'Teste de conexão' }], max_tokens: 10 };
        const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${this.providers.grok.apiKey}` };
        await axios.post(`${this.providers.grok.endpoint.replace(/\/$/, '')}/chat/completions`, body, { headers });
      }

      console.log(`Conexão com ${providerName} bem-sucedida`);
      return true;
    } catch (error) {
      console.error(`Erro ao testar ${providerName}:`, error.message);
      return false;
    }
  }

  /**
   * Testa todos os provedores configurados
   */
  async testAllProviders() {
    const results = {};
    const providerNames = Object.keys(this.providers);

    for (const providerName of providerNames) {
      results[providerName] = await this.testProvider(providerName);
    }

    return results;
  }
}

module.exports = AIProviderManager;
/**
 * MCP - Marketing Content Platform
 * Plataforma avançada para geração e automação de conteúdo
 */

require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const { chromium } = require('playwright');
const ContentAgent = require('./src/agents/content-agent');
const InstagramPlatform = require('./src/platforms/instagram');
const YouTubePlatform = require('./src/platforms/youtube');
const TwitterPlatform = require('./src/platforms/twitter');
const Utils = require('./src/utils');
const OwnAPIManager = require('./src/utils/own-api-manager');
const WebScrapingAnalyzer = require('./src/utils/web-scraping-analyzer');
const express = require('express');

class ContentFactory {
  constructor(configPath = './config/default.json') {
    this.config = require(configPath);
    this.agent = new ContentAgent(this.config);
    this.playwright = null;
    this.platforms = {};
    this.apiManager = null;
    this.webAnalyzer = null;
  }

  /**
   * Inicializa a MCP - Marketing Content Platform
   */
  async initialize() {
    console.log('Inicializando MCP - Marketing Content Platform...');

    // Inicializa Playwright
    this.playwright = chromium;

    // Cria diretórios necessários
    await Utils.ensureDir(this.config.assetsDir);
    await Utils.ensureDir(this.config.outputDir);
    await Utils.ensureDir(this.config.strategiesDir);

    // Inicializa plataformas de redes sociais
    await this.initializePlatforms();

    // Inicializa gerenciador de APIs próprias
    await this.initializeAPIManager();

    // Inicializa analisador de web scraping
    this.webAnalyzer = new WebScrapingAnalyzer(this.config);

    // Inicializa servidor web da interface
    await this.initializeWebServer();

    console.log('MCP - Marketing Content Platform inicializada com sucesso!');
  }

  /**
   * Inicializa o gerenciador de APIs próprias
   */
  async initializeAPIManager() {
    this.apiManager = new OwnAPIManager(this.config);
    await this.apiManager.loadAPIs(); // Carrega APIs salvas anteriormente
    await this.apiManager.startServer(); // Inicia servidor de APIs
  }

  /**
   * Inicializa as plataformas de redes sociais
   */
  async initializePlatforms() {
    // Inicializa Instagram se as credenciais estiverem presentes
    if (this.config.instagram_username && this.config.instagram_password) {
      this.platforms.instagram = new InstagramPlatform(this.config, this.playwright);
      await this.platforms.instagram.initialize();
    }

    // Inicializa YouTube se as credenciais estiverem presentes
    if (this.config.google_email && this.config.google_password) {
      this.platforms.youtube = new YouTubePlatform(this.config, this.playwright);
      await this.platforms.youtube.initialize();
    }

    // Inicializa Twitter se as credenciais estiverem presentes
    if (this.config.twitter_username && this.config.twitter_password) {
      this.platforms.twitter = new TwitterPlatform(this.config, this.playwright);
      await this.platforms.twitter.initialize();
    }
  }

  /**
   * Processa todas as estratégias de conteúdo
   */
  async processAllStrategies() {
    console.log('Processando todas as estratégias...');
    
    try {
      const results = await this.agent.processAllStrategies();
      
      // Salva resultados
      const resultsPath = await this.agent.saveResults(results);
      
      // Publica conteúdo se as plataformas estiverem configuradas
      await this.publishContent(results);
      
      console.log(`Processamento concluído. Resultados salvos em: ${resultsPath}`);
      return results;
    } catch (error) {
      console.error('Erro ao processar estratégias:', error);
      throw error;
    }
  }

  /**
   * Publica conteúdo gerado nas plataformas configuradas
   */
  async publishContent(results) {
    console.log('Publicando conteúdo gerado...');
    
    for (const result of results) {
      for (const content of result.generated_content) {
        switch (content.type) {
          case 'text':
            await this.publishText(content);
            break;
          case 'image':
            await this.publishImage(content);
            break;
          case 'video':
            await this.publishVideo(content);
            break;
          case 'website':
            await this.publishWebsite(content);
            break;
          default:
            console.log(`Tipo de conteúdo não suportado para publicação: ${content.type}`);
        }
      }
    }
  }

  /**
   * Publica conteúdo de texto
   */
  async publishText(content) {
    const platform = content.platform;
    
    if (platform === 'twitter' && this.platforms.twitter) {
      await this.platforms.twitter.postTweet(content.content);
    } else if (platform === 'instagram' && this.platforms.instagram) {
      // Para Instagram, normalmente o texto é publicado como legenda
      console.log(`Texto preparado para Instagram: ${content.content.substring(0, 100)}...`);
    } else {
      console.log(`Publicação de texto não configurada para ${platform}`);
    }
  }

  /**
   * Publica conteúdo de imagem
   */
  async publishImage(content) {
    const platform = content.platform;
    
    if (platform === 'instagram' && this.platforms.instagram) {
      await this.platforms.instagram.postImage(content.path, content.caption || '');
    } else if (platform === 'twitter' && this.platforms.twitter) {
      await this.platforms.twitter.postTweetWithImage(content.path, content.caption || '');
    } else {
      console.log(`Publicação de imagem não configurada para ${platform}`);
    }
  }

  /**
   * Publica conteúdo de vídeo
   */
  async publishVideo(content) {
    const platform = content.platform;
    
    if (platform === 'youtube' && this.platforms.youtube) {
      await this.platforms.youtube.postVideo(
        content.path,
        content.title || 'Vídeo Automático',
        content.description || 'Descrição automática',
        content.tags || []
      );
    } else {
      console.log(`Publicação de vídeo não configurada para ${platform}`);
    }
  }

  /**
   * Publica website
   */
  async publishWebsite(content) {
    // Websites normalmente são gerados e hospedados externamente
    console.log(`Website gerado: ${content.path}`);
  }

  /**
   * Processa um arquivo de estratégia específico
   */
  async processStrategyFile(filePath) {
    console.log(`Processando estratégia: ${filePath}`);
    
    try {
      const result = await this.agent.processStrategyFile(filePath);
      
      // Salva resultados
      const resultsPath = await this.agent.saveResults([result]);
      
      // Publica conteúdo
      await this.publishContent([result]);
      
      console.log(`Estratégia processada. Resultados salvos em: ${resultsPath}`);
      return result;
    } catch (error) {
      console.error(`Erro ao processar arquivo de estratégia ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Inicializa o servidor web da interface
   */
  async initializeWebServer() {
    this.webServer = express();
    this.webServer.use(express.json());

    // Servir arquivos estáticos da interface web
    this.webServer.use(express.static(path.join(__dirname, '../web')));

    // Rota para API de status
    this.webServer.get('/api/status', async (req, res) => {
      try {
        const status = {
          status: 'running',
          timestamp: new Date().toISOString(),
          strategies: await this.getStrategyCount(),
          contentGenerated: await this.getContentCount(),
          activeAPIs: this.apiManager ? this.apiManager.apis.size : 0
        };
        res.json(status);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Rota para obter estratégias
    this.webServer.get('/api/strategies', async (req, res) => {
      try {
        const strategies = await this.getStrategiesList();
        res.json(strategies);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Rota para gerar conteúdo
    this.webServer.post('/api/generate-content', async (req, res) => {
      try {
        const { type, prompt, provider } = req.body;
        const result = await this.generateContentFromAPI(type, prompt, provider);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Rota para atualizar tendências
    this.webServer.post('/api/update-trends', async (req, res) => {
      try {
        const { queries } = req.body;
        await this.updateStrategiesFromTrends(queries);
        res.json({ success: true, message: 'Tendências atualizadas com sucesso' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Inicia o servidor web
    const webPort = this.config.web_port || 3000;
    await new Promise((resolve) => {
      this.webServer.listen(webPort, () => {
        console.log(`Interface web da MCP iniciada na porta ${webPort}`);
        resolve();
      });
    });
  }

  /**
   * Obtém contagem de estratégias
   */
  async getStrategyCount() {
    // Lê o diretório de estratégias e conta os arquivos
    try {
      const files = await fs.readdir(this.config.strategiesDir);
      return files.filter(file => path.extname(file).toLowerCase() === '.md').length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtém contagem de conteúdo gerado
   */
  async getContentCount() {
    // Esta função pode consultar o histórico de conteúdo gerado
    // Por enquanto, retorna um valor simulado
    return 42; // Simulado
  }

  /**
   * Obtém lista de estratégias
   */
  async getStrategiesList() {
    try {
      const files = await fs.readdir(this.config.strategiesDir);
      const mdFiles = files.filter(file => path.extname(file).toLowerCase() === '.md');

      const strategies = [];
      for (const file of mdFiles) {
        const filePath = path.join(this.config.strategiesDir, file);
        const stats = await fs.stat(filePath);

        strategies.push({
          id: file.replace('.md', ''),
          title: file.replace('.md', '').replace(/_/g, ' '),
          filename: file,
          lastModified: stats.mtime.toISOString(),
          status: 'active' // Poderia ser determinado a partir do conteúdo
        });
      }

      return strategies;
    } catch (error) {
      console.error('Erro ao obter lista de estratégias:', error);
      return [];
    }
  }

  /**
   * Gera conteúdo via API
   */
  async generateContentFromAPI(type, prompt, provider) {
    switch (type) {
      case 'text':
        return await this.agent.textGenerator.generateSocialPost({ objective: prompt }, 'general', { provider });
      case 'image':
        return await this.agent.imageGenerator.generateSocialBanner({ objective: prompt }, 'general', { provider });
      default:
        throw new Error(`Tipo de conteúdo não suportado: ${type}`);
    }
  }

  /**
   * Fecha a MCP e todos os recursos
   */
  async close() {
    console.log('Fechando MCP - Marketing Content Platform...');

    // Fecha servidor web
    if (this.webServer) {
      // Em implementação real, você teria uma forma de fechar o servidor express
      console.log('Servidor web fechado');
    }

    // Fecha plataformas
    if (this.platforms.instagram) {
      await this.platforms.instagram.close();
    }

    if (this.platforms.youtube) {
      await this.platforms.youtube.close();
    }

    if (this.platforms.twitter) {
      await this.platforms.twitter.close();
    }

    // Fecha gerenciador de APIs
    if (this.apiManager) {
      await this.apiManager.stopServer();
    }

    console.log('MCP - Marketing Content Platform fechada com sucesso!');
  }

  /**
   * Realiza scraping de tendências e atualiza estratégias
   */
  async updateStrategiesFromTrends(searchQueries = []) {
    console.log('Atualizando estratégias com base em tendências...');

    // Usa termos padrão se nenhum for fornecido
    if (searchQueries.length === 0) {
      searchQueries = [
        'marketing digital',
        'mídia social',
        'automatização de conteúdo',
        'inteligência artificial',
        'estratégias de marketing'
      ];
    }

    try {
      // Monitora tendências
      const trends = await this.webAnalyzer.monitorTrends(searchQueries);

      // Analisa conteúdo relacionado
      for (const trend of trends) {
        if (trend.data && trend.data.urls && trend.data.urls.length > 0) {
          const trendData = await this.webAnalyzer.analyzeTrends([trend.data.urls[0]], { useAI: true });

          // Gera novo arquivo de estratégia baseado na tendência
          await this.generateStrategyFromTrend(trend.query, trendData);
        }
      }

      console.log('Estratégias atualizadas com base em tendências');
    } catch (error) {
      console.error('Erro ao atualizar estratégias com tendências:', error);
    }
  }

  /**
   * Gera novo arquivo de estratégia baseado em tendências
   */
  async generateStrategyFromTrend(query, trendData) {
    const strategyContent = `# Estratégia Baseada em Tendência: ${query}

## Análise de Tendência
${trendData.summary}

## Tópicos Relevantes
${trendData.trends.map(topic => `- ${topic}`).join('\n')}

## Palavras-Chave Associadas
${trendData.keywords.map(kw => `- ${kw}`).join('\n')}

## Sentimento Geral
${trendData.sentiment}

## Objetivo
Explorar a tendência "${query}" para gerar conteúdo relevante e engajador.

## Público-Alvo
Público interessado em ${query}.

## Plataformas
- LinkedIn: Conteúdo profissional
- Twitter/X: Discussões e insights
- Instagram: Conteúdo visual
- YouTube: Conteúdo em vídeo

## Estilo de Conteúdo
- Atualizado com as últimas tendências
- Informativo e engajador
- Baseado em dados reais

## Tipos de Conteúdo
- Posts explicativos
- Análises de mercado
- Dicas e tutoriais
- Conteúdo em vídeo

## Cronograma
- Início imediato
- Publicação semanal
- Reavaliação mensal
`;

    const strategyPath = path.join(this.config.strategiesDir, `trend_${query.replace(/\s+/g, '_')}_${Date.now()}.md`);
    await fs.writeFile(strategyPath, strategyContent, 'utf8');

    console.log(`Nova estratégia gerada: ${strategyPath}`);
  }

  /**
   * Gera API personalizada para um tipo específico de conteúdo
   */
  async generateCustomAPI(apiName, apiType, config = {}) {
    if (!this.apiManager) {
      throw new Error('Gerenciador de APIs não está inicializado');
    }

    const apiKey = await this.apiManager.createAPI(apiName, apiType, config);
    console.log(`API personalizada criada: ${apiName} (${apiType}) - Chave: ${apiKey}`);

    return { name: apiName, type: apiType, key: apiKey };
  }

  /**
   * Gera conteúdo usando API personalizada
   */
  async generateContentWithCustomAPI(apiType, prompt, options = {}) {
    try {
      const result = await this.apiManager.generate(apiType, prompt, options);
      return result;
    } catch (error) {
      console.error(`Erro ao gerar conteúdo com API ${apiType}:`, error);
      throw error;
    }
  }
}

// Se este arquivo for executado diretamente
if (require.main === module) {
  const contentFactory = new ContentFactory();

  // Função para lidar com encerramento adequado
  process.on('SIGINT', async () => {
    console.log('\nRecebido sinal de interrupção');
    await contentFactory.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nRecebido sinal de término');
    await contentFactory.close();
    process.exit(0);
  });

  // Inicializa e executa
  (async () => {
    try {
      await contentFactory.initialize();
      
      // Se houver argumentos de comando, processa arquivos específicos
      if (process.argv.length > 2) {
        for (let i = 2; i < process.argv.length; i++) {
          const file = process.argv[i];
          await contentFactory.processStrategyFile(file);
        }
      } else {
        // Processa todas as estratégias
        await contentFactory.processAllStrategies();
      }
    } catch (error) {
      console.error('Erro na execução da Fábrica de Conteúdo:', error);
      await contentFactory.close();
      process.exit(1);
    }
  })();
}

module.exports = ContentFactory;
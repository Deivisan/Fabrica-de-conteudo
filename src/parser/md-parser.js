/**
 * Parser de Arquivos Markdown para Estratégias
 * Lê arquivos .md e extrai informações estruturadas para uso nos geradores
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter'); // Para lidar com frontmatter nos arquivos MD

class MdParser {
  constructor(config = {}) {
    this.config = config;
    this.strategiesDir = config.strategiesDir || './strategies';
  }

  /**
   * Lê e processa um arquivo de estratégia
   */
  async parseStrategyFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return this.parseStrategyContent(content, filePath);
    } catch (error) {
      console.error(`Erro ao ler o arquivo ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Processa o conteúdo de uma estratégia e extrai informações estruturadas
   */
  parseStrategyContent(content, filePath = '') {
    // Parseia o frontmatter se existir
    const parsed = matter(content);
    const markdownContent = parsed.content;
    const frontmatter = parsed.data || {};

    // Extrai informações do markdown
    const extracted = this.extractFromMarkdown(markdownContent, filePath);

    // Combina frontmatter e informações extraídas
    const strategy = {
      ...frontmatter,
      ...extracted,
      source_file: filePath,
      processed_at: new Date().toISOString()
    };

    return strategy;
  }

  /**
   * Extrai informações estruturadas do conteúdo markdown
   */
  extractFromMarkdown(markdownContent, filePath) {
    const strategy = {};
    
    // Extrai título principal (h1)
    const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
    strategy.title = titleMatch ? titleMatch[1].trim() : '';

    // Extrai objetivos
    strategy.objective = this.extractSection(markdownContent, ['objetivo', 'meta', 'proposito', 'propósito', 'finalidade']);
    
    // Extrai público-alvo
    strategy.target_audience = this.extractSection(markdownContent, ['publico-alvo', 'público-alvo', 'audience', 'target']);
    
    // Extrai plataformas
    strategy.platforms = this.extractListSection(markdownContent, ['plataformas', 'redes', 'sociais', 'channels', 'platforms']);
    
    // Extrai estilo de conteúdo
    strategy.style = this.extractSection(markdownContent, ['estilo', 'tom', 'voice', 'style', 'linguagem']);
    
    // Extrai tipos de conteúdo
    strategy.content_types = this.extractListSection(markdownContent, ['tipos de conteúdo', 'formatos', 'formats', 'content types']);
    
    // Extrai hashtags
    strategy.hashtags = this.extractHashtags(markdownContent);
    
    // Extrai call-to-actions
    strategy.cta = this.extractSection(markdownContent, ['call to action', 'cta', 'ação', 'call-to-action']);
    
    // Extrai palavras-chave
    strategy.keywords = this.extractKeywords(markdownContent);
    
    // Extrai benefícios
    strategy.benefits = this.extractListSection(markdownContent, ['beneficios', 'benefícios', 'vantagens', 'benefits']);
    
    // Extrai recursos/funções
    strategy.features = this.extractFeatures(markdownContent);
    
    // Extrai cronograma
    strategy.schedule = this.extractSchedule(markdownContent);
    
    // Extrai elementos visuais
    strategy.visual_style = this.extractSection(markdownContent, ['estilo visual', 'cores', 'paleta', 'visual style']);
    strategy.brand_colors = this.extractBrandColors(markdownContent);
    
    // Extrai produtos ou serviços
    strategy.products = this.extractProducts(markdownContent);
    
    // Extrai etapas do tutorial (se for um tutorial)
    strategy.steps = this.extractSteps(markdownContent);
    
    // Extrai métricas e KPIs
    strategy.metrics = this.extractMetrics(markdownContent);

    return strategy;
  }

  /**
   * Extrai uma seção específica do markdown
   */
  extractSection(content, sectionNames) {
    for (const section of sectionNames) {
      // Procura por seções com diferentes níveis de cabeçalho
      const patterns = [
        new RegExp(`##\\s*${section}[\\s\\n]+([^#]+?)(?=\\n##\\s|\\n\\*\\*|\\n- |$)`, 'i'),
        new RegExp(`###\\s*${section}[\\s\\n]+([^#]+?)(?=\\n##\\s|\\n###\\s|\\n\\*\\*|\\n- |$)`, 'i'),
        new RegExp(`\\*\\*${section}:?\\*?\\s*([^\n]+)`, 'i'),
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }
    return null;
  }

  /**
   * Extrai uma lista de uma seção específica
   */
  extractListSection(content, sectionNames) {
    for (const section of sectionNames) {
      // Procura por seções que contenham listas
      const pattern = new RegExp(`##\\s*${section}[\\s\\n]+([^#]+?)(?=\\n##\\s|\\n\\*\\*|$)`, 'i');
      const match = content.match(pattern);
      
      if (match && match[1]) {
        const sectionContent = match[1];
        // Extrai itens de lista (começando com - ou *)
        const listItems = sectionContent.match(/[\-\*]\s+(.+?)(?=\n[\-\*]\s+|\n\n|$)/g);
        if (listItems) {
          return listItems.map(item => item.replace(/^[\-\*]\s+/, '').trim());
        }
      }
    }
    return [];
  }

  /**
   * Extrai hashtags do conteúdo
   */
  extractHashtags(content) {
    const hashtags = content.match(/#[\w\u00C0-\u00FF]+/g) || [];
    return [...new Set(hashtags.map(tag => tag.toLowerCase()))]; // Remove duplicados
  }

  /**
   * Extrai palavras-chave (destacadas com ** ou __)
   */
  extractKeywords(content) {
    const keywords = content.match(/\*{2}([^*]+)\*{2}|_{2}([^_]+)_{2}/g) || [];
    return [...new Set(keywords.map(kw => kw.replace(/[\*\_]/g, '').trim()))];
  }

  /**
   * Extrai recursos de um conteúdo
   */
  extractFeatures(content) {
    // Procura por padrões como "- Recurso: Descrição" ou "**Recurso:** Descrição"
    const featurePattern = /[\-\*]\s+(.+?):\s*(.+?)(?=\n[\-\*]\s+|\n\n|$)|\*{2}(.+?)\*{2}:\s*(.+?)(?=\n\*{2}|\n\n|$)/gi;
    const matches = [...content.matchAll(featurePattern)];
    
    return matches.map(match => {
      if (match[1] && match[2]) {
        return { title: match[1].trim(), description: match[2].trim() };
      } else if (match[3] && match[4]) {
        return { title: match[3].trim(), description: match[4].trim() };
      }
      return null;
    }).filter(Boolean);
  }

  /**
   * Extrai etapas de um tutorial ou processo
   */
  extractSteps(content) {
    // Procura por padrões de etapas como "1. Título" ou "## Etapa 1: Título"
    const stepPatterns = [
      /[\d]+\.\s+(.+?)(?=\n[\d]+\.\s+|\n\n|$)/g,
      /##\s*[Ee]tapa\s+[\d]+[:\-\s]+(.+?)(?=\n##\s*[Ee]tapa\s+|\n\n|$)/g,
      /###\s*[Ee]tapa\s+[\d]+[:\-\s]+(.+?)(?=\n###\s*[Ee]tapa\s+|\n\n|$)/g
    ];
    
    for (const pattern of stepPatterns) {
      const matches = [...content.matchAll(pattern)];
      if (matches.length > 0) {
        return matches.map((match, index) => ({
          number: index + 1,
          title: match[1].trim(),
          description: this.extractStepDescription(content, match[1].trim())
        }));
      }
    }
    return [];
  }

  /**
   * Extrai descrição de uma etapa específica
   */
  extractStepDescription(content, stepTitle) {
    // Procura por parágrafos que venham após o título da etapa
    const escapedTitle = stepTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`${escapedTitle}[\\s\\n]+(.+?)(?=\\n[\\d]+\\.|\\n##\\s*[Ee]tapa|\\n\\*\\*|$)`, 'i');
    const match = content.match(pattern);
    return match ? match[1].trim() : '';
  }

  /**
   * Extrai o cronograma
   */
  extractSchedule(content) {
    // Procura por padrões de datas e cronogramas
    const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/g;
    const dates = content.match(datePattern) || [];
    
    // Procura por frequências de postagem
    const frequencyPattern = /(\d+)\s*(vezes|post|posts|publicação|publicações)\s*(por semana|por mês|por dia|weekly|monthly|daily)/gi;
    const frequencies = [...content.matchAll(frequencyPattern)];
    
    return {
      dates: dates,
      frequencies: frequencies.map(match => match[0])
    };
  }

  /**
   * Extrai cores da marca
   */
  extractBrandColors(content) {
    // Procura por padrões de cores hexadecimais, RGB ou nomes
    const hexPattern = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
    const rgbPattern = /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/gi;
    const colorNames = /vermelho|red|azul|blue|verde|green|amarelo|yellow|preto|black|branco|white|laranja|orange|roxo|purple|rosa|pink/i;
    
    const hexColors = content.match(hexPattern) || [];
    const rgbColors = content.match(rgbPattern) || [];
    // Para nomes de cores, teríamos que implementar uma listagem mais completa
    
    return [...new Set([...hexColors, ...rgbColors])];
  }

  /**
   * Extrai produtos ou serviços mencionados
   */
  extractProducts(content) {
    // Procura por padrões como "Produto: Descrição" ou "**Produto:**"
    const productPattern = /\*{2}(Produto|Serviço|Item)[\s:]+\*{2}\s*([^\n]+?)(?=\n\*{2}|$)/gi;
    const matches = [...content.matchAll(productPattern)];
    
    return matches.map(match => match[2].trim());
  }

  /**
   * Extrai métricas e KPIs
   */
  extractMetrics(content) {
    // Procura por padrões de métricas como "taxa de cliques", "engajamento", etc.
    const metricNames = [
      'taxa de cliques', 'click-through rate', 'ctr', 
      'taxa de conversão', 'conversion rate',
      'engajamento', 'engagement',
      'alcance', 'reach',
      'impressões', 'impressions',
      'aberturas', 'open rate',
      'cliques', 'clicks'
    ];
    
    const foundMetrics = [];
    for (const metric of metricNames) {
      if (content.toLowerCase().includes(metric)) {
        foundMetrics.push(metric);
      }
    }
    
    return foundMetrics;
  }

  /**
   * Processa todos os arquivos MD no diretório de estratégias
   */
  async parseAllStrategies() {
    try {
      const files = await fs.readdir(this.strategiesDir);
      const mdFiles = files.filter(file => path.extname(file).toLowerCase() === '.md');
      
      const strategies = [];
      
      for (const file of mdFiles) {
        const filePath = path.join(this.strategiesDir, file);
        try {
          const strategy = await this.parseStrategyFile(filePath);
          strategies.push(strategy);
          console.log(`Estratégia processada: ${file}`);
        } catch (error) {
          console.error(`Erro ao processar ${file}:`, error);
        }
      }
      
      return strategies;
    } catch (error) {
      console.error('Erro ao ler diretório de estratégias:', error);
      throw error;
    }
  }
}

module.exports = MdParser;
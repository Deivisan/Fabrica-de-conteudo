/**
 * Módulo de Web Scraping e Análise de Tendências
 * Coleta dados da web para análise e geração de conteúdo baseado em tendências
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');

class WebScrapingAnalyzer {
  constructor(config) {
    this.config = config;
    this.aiProvider = config && config.google_ai_api_key ? 
      new GoogleGenerativeAI(config.google_ai_api_key) : null;
  }

  /**
   * Realiza scraping de uma URL específica
   */
  async scrapeURL(url, options = {}) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': options.userAgent || 'Mozilla/5.0 (compatible; ContentBot/1.0)'
        },
        timeout: options.timeout || 10000
      });

      const $ = cheerio.load(response.data);

      // Extrai informações principais
      const pageData = {
        url: url,
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        h1: $('h1').first().text().trim(),
        h2: $('h2').map((i, el) => $(el).text().trim()).get(),
        paragraphs: $('p').map((i, el) => $(el).text().trim()).get(),
        links: $('a[href]').map((i, el) => $(el).attr('href')).get(),
        images: $('img').map((i, el) => $(el).attr('src')).get(),
        content: this.extractMainContent($),
        timestamp: new Date().toISOString()
      };

      return pageData;
    } catch (error) {
      console.error(`Erro ao fazer scraping de ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Extrai o conteúdo principal da página (tenta identificar o conteúdo central)
   */
  extractMainContent($) {
    // Tenta encontrar o conteúdo principal da página
    // Esta é uma implementação simplificada
    let content = '';
    
    // Verifica se existe um seletor comum para conteúdo principal
    const mainSelectors = ['main', 'article', '.content', '#content', '.post', '.article', 'main-content'];
    
    for (const selector of mainSelectors) {
      if ($(selector).length > 0) {
        content = $(selector).text().trim();
        break;
      }
    }
    
    // Se não encontrar conteúdo principal, usa todo o body
    if (!content) {
      content = $('body').text().trim();
    }
    
    // Limpa o conteúdo removendo excesso de espaços
    content = content.replace(/\s+/g, ' ').substring(0, 2000);
    
    return content;
  }

  /**
   * Analisa tendências em uma lista de URLs
   */
  async analyzeTrends(urls, options = {}) {
    const pagesData = [];
    
    // Faz scraping de todas as URLs
    for (const url of urls) {
      try {
        const pageData = await this.scrapeURL(url);
        pagesData.push(pageData);
      } catch (error) {
        console.error(`Falha ao analisar ${url}:`, error.message);
      }
    }

    // Extrai tendências comuns
    const trends = await this.extractTrendsFromData(pagesData, options);
    return trends;
  }

  /**
   * Extrai tendências de dados de páginas
   */
  async extractTrendsFromData(pagesData, options = {}) {
    if (pagesData.length === 0) {
      return { trends: [], keywords: [], sentiment: 'neutral', summary: '' };
    }

    // Extrai palavras-chave frequentes
    const allText = pagesData.map(page => 
      `${page.title} ${page.description} ${page.content} ${page.h1} ${page.h2.join(' ')}`
    ).join(' ');

    const keywords = this.extractKeywords(allText, 20);
    
    // Extrai tópicos frequentes
    const topics = this.extractTopics(pagesData);
    
    // Se tivermos IA disponível, podemos analisar mais profundamente
    let sentiment = 'neutral';
    let summary = '';
    
    if (this.aiProvider && options.useAI) {
      try {
        const model = this.aiProvider.getGenerativeModel({ model: 'gemini-pro' });
        
        // Analisa sentimento
        const sentimentPrompt = `Analise o sentimento geral do seguinte texto coletado da web: ${allText.substring(0, 2000)}`;
        const sentimentResult = await model.generateContent(sentimentPrompt);
        sentiment = sentimentResult.response.text().substring(0, 100);
        
        // Gera resumo
        const summaryPrompt = `Gere um resumo conciso das principais tendências e tópicos do seguinte texto coletado da web: ${allText.substring(0, 3000)}`;
        const summaryResult = await model.generateContent(summaryPrompt);
        summary = summaryResult.response.text();
      } catch (error) {
        console.error('Erro ao usar IA para análise:', error.message);
      }
    }

    return {
      trends: topics,
      keywords: keywords,
      sentiment: sentiment,
      summary: summary || `Análise de ${pagesData.length} páginas`,
      pagesAnalyzed: pagesData.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extrai palavras-chave de texto
   */
  extractKeywords(text, limit = 10) {
    // Remove palavras comuns (stopwords)
    const stopwords = new Set([
      'e', 'o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'um', 'uma', 'para', 'com', 'não', 'na', 'no',
      'and', 'the', 'to', 'of', 'a', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i', 'have', 'from', 'at', 'by'
    ]);
    
    // Extrai palavras relevantes
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopwords.has(word))
      .map(word => word.trim());
    
    // Conta frequência
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Retorna as palavras mais frequentes
    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  /**
   * Extrai tópicos de páginas
   */
  extractTopics(pagesData) {
    const topics = new Set();
    
    pagesData.forEach(page => {
      // Adiciona títulos, descrições e cabeçalhos como possíveis tópicos
      if (page.title) topics.add(page.title);
      if (page.description) topics.add(page.description);
      if (page.h1) topics.add(page.h1);
      
      page.h2.forEach(h => {
        if (h.length > 0) topics.add(h);
      });
    });
    
    return Array.from(topics).slice(0, 10);
  }

  /**
   * Monitora tendências em tempo real
   */
  async monitorTrends(searchQueries, options = {}) {
    // Faz scraping de motores de busca ou redes sociais
    // Esta é uma implementação simplificada
    const results = [];
    
    for (const query of searchQueries) {
      try {
        // Simula scraping de resultados de busca
        const trendData = await this.searchAndScrape(query, options);
        results.push({ query, data: trendData });
      } catch (error) {
        console.error(`Erro ao monitorar tendência para "${query}":`, error.message);
      }
    }
    
    return results;
  }

  /**
   * Simula busca e scraping de tendências
   */
  async searchAndScrape(query, options = {}) {
    // Em uma implementação real, esta função faria scraping de motores de busca
    // ou APIs de redes sociais para encontrar tendências
    console.log(`Monitorando tendências para: ${query}`);
    
    // Simula resultados de scraping
    return {
      query: query,
      related_terms: this.generateRelatedTerms(query, 5),
      trend_score: Math.random(), // Score simulado
      urls: [`https://example.com/search?q=${encodeURIComponent(query)}`],
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Gera termos relacionados
   */
  generateRelatedTerms(term, count) {
    // Em implementação real, isso viria de scraping ou API específica
    const baseTerms = [
      ...term.split(' '),
      `${term} 2025`,
      `${term} tendências`,
      `como ${term}`,
      `o que é ${term}`,
      `benefícios de ${term}`,
      `melhores ${term}`,
      `novidades ${term}`
    ];
    
    return baseTerms.slice(0, count);
  }

  /**
   * Encontra conteúdo similar a um texto
   */
  async findSimilarContent(targetContent, options = {}) {
    // Em uma implementação real, isso faria scraping de páginas com conteúdo similar
    console.log(`Procurando conteúdo similar a: ${targetContent.substring(0, 100)}...`);
    
    return {
      similarContent: [],
      sources: [],
      similarityScore: 0
    };
  }
}

module.exports = WebScrapingAnalyzer;
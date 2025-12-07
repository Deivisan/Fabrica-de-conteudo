/**
 * Funções Utilitárias para a Fábrica de Conteúdo
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const Utils = {
  /**
   * Gera um ID único
   */
  generateId: () => {
    return crypto.randomBytes(16).toString('hex');
  },

  /**
   * Formata uma data para o formato YYYY-MM-DD HH:MM:SS
   */
  formatDate: (date = new Date()) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  /**
   * Espera um período específico em milissegundos
   */
  wait: async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Verifica se um arquivo existe
   */
  fileExists: async (filePath) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Lê um arquivo JSON
   */
  readJsonFile: async (filePath) => {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Erro ao ler arquivo JSON ${filePath}: ${error.message}`);
    }
  },

  /**
   * Escreve um objeto em um arquivo JSON
   */
  writeJsonFile: async (filePath, data) => {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      throw new Error(`Erro ao escrever arquivo JSON ${filePath}: ${error.message}`);
    }
  },

  /**
   * Obtém a extensão de um arquivo
   */
  getFileExtension: (filename) => {
    return path.extname(filename).toLowerCase();
  },

  /**
   * Verifica se um arquivo é uma imagem
   */
  isImageFile: (filename) => {
    const ext = Utils.getFileExtension(filename);
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext);
  },

  /**
   * Verifica se um arquivo é um vídeo
   */
  isVideoFile: (filename) => {
    const ext = Utils.getFileExtension(filename);
    return ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'].includes(ext);
  },

  /**
   * Verifica se um arquivo é um documento Markdown
   */
  isMarkdownFile: (filename) => {
    const ext = Utils.getFileExtension(filename);
    return ['.md', '.markdown'].includes(ext);
  },

  /**
   * Gera um nome de arquivo único
   */
  generateUniqueFilename: (originalName, prefix = '') => {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    
    return `${prefix}${name}_${timestamp}_${random}${ext}`;
  },

  /**
   * Formata um tamanho em bytes para uma representação legível
   */
  formatBytes: (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  /**
   * Remove caracteres especiais de uma string para uso em nomes de arquivos
   */
  sanitizeFilename: (filename) => {
    return filename.replace(/[^a-z0-9._-]/gi, '_');
  },

  /**
   * Verifica se um diretório existe e cria se não existir
   */
  ensureDir: async (dirPath) => {
    try {
      await fs.mkdir(dirPath, { recursive: true });
      return true;
    } catch (error) {
      throw new Error(`Erro ao criar diretório ${dirPath}: ${error.message}`);
    }
  },

  /**
   * Copia um arquivo de um caminho para outro
   */
  copyFile: async (srcPath, destPath) => {
    try {
      await fs.copyFile(srcPath, destPath);
    } catch (error) {
      throw new Error(`Erro ao copiar arquivo de ${srcPath} para ${destPath}: ${error.message}`);
    }
  },

  /**
   * Remove um arquivo
   */
  removeFile: async (filePath) => {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new Error(`Erro ao remover arquivo ${filePath}: ${error.message}`);
    }
  },

  /**
   * Lê todo o conteúdo de um diretório recursivamente
   */
  readDirRecursive: async (dirPath, options = {}) => {
    const { filter, maxDepth = 10, currentDepth = 0 } = options;
    const result = [];

    if (currentDepth > maxDepth) {
      return result;
    }

    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        const subDirItems = await Utils.readDirRecursive(fullPath, { 
          filter, 
          maxDepth, 
          currentDepth: currentDepth + 1 
        });
        result.push(...subDirItems);
      } else {
        if (!filter || filter(fullPath)) {
          result.push(fullPath);
        }
      }
    }

    return result;
  },

  /**
   * Calcula o hash SHA-256 de um arquivo
   */
  hashFile: async (filePath) => {
    const crypto = require('crypto');
    const stream = require('stream/promises');
    
    const hash = crypto.createHash('sha256');
    const input = await fs.readFile(filePath);
    
    hash.update(input);
    return hash.digest('hex');
  },

  /**
   * Converte um objeto para uma string de query parameters
   */
  objectToQueryParams: (obj) => {
    return Object.keys(obj)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
      .join('&');
  },

  /**
   * Normaliza uma URL removendo partes indesejadas
   */
  normalizeUrl: (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.href;
    } catch (error) {
      throw new Error(`URL inválida: ${url}`);
    }
  },

  /**
   * Escapa caracteres especiais para uso em expressões regulares
   */
  escapeRegExp: (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  /**
   * Substitui todas as ocorrências de uma string por outra
   */
  replaceAll: (str, find, replace) => {
    const escapedFind = Utils.escapeRegExp(find);
    const regex = new RegExp(escapedFind, 'g');
    return str.replace(regex, replace);
  },

  /**
   * Valida se um e-mail é válido
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Trunca uma string mantendo palavras completas
   */
  truncateWords: (str, maxLength, suffix = '...') => {
    if (str.length <= maxLength) return str;

    const truncated = str.substring(0, maxLength - suffix.length);
    const lastSpaceIndex = truncated.lastIndexOf(' ');

    if (lastSpaceIndex > 0) {
      return truncated.substring(0, lastSpaceIndex) + suffix;
    }

    return truncated + suffix;
  },

  /**
   * Converte um objeto para snake_case
   */
  toSnakeCase: (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(Utils.toSnakeCase);
    }

    const snakeObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snakeObj[snakeKey] = Utils.toSnakeCase(obj[key]);
      }
    }
    return snakeObj;
  },

  /**
   * Converte um objeto para camelCase
   */
  toCamelCase: (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(Utils.toCamelCase);
    }

    const camelObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
        camelObj[camelKey] = Utils.toCamelCase(obj[key]);
      }
    }
    return camelObj;
  }
};

module.exports = Utils;
/**
 * Core Module - Fabrica de Conteudo
 * Exportações centrais do módulo core
 * 
 * @author DevSan A.G.I. (@deivisan)
 * @version 2.0.0
 */

// Browser Engine
export { 
  BrowserEngine, 
  type BrowserConfig, 
  type EngineResult 
} from './browser-engine';

// AI Interaction
export { 
  AIInteraction, 
  createAISession,
  type AIInteractionConfig, 
  type GenerationResult 
} from './ai-interaction';

// Selectors
export { 
  GOOGLE_AI_STUDIO,
  BING_IMAGE_CREATOR,
  LEONARDO_AI,
  CHATGPT_FREE,
  GROK,
  SERVICES,
  getService,
  findWorkingSelector,
  type ServiceSelectors,
  type ServiceName
} from './selectors';

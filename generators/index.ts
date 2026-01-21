/**
 * Generators Module - Fabrica de Conteudo
 * Exportações dos geradores de conteúdo
 * 
 * @author DevSan A.G.I. (@deivisan)
 * @version 2.0.0
 */

// Image Generator
export { 
  ImageGenerator, 
  type ImageGenerationConfig, 
  type ImageResult 
} from './image-generator';

// Text Generator
export { 
  TextGenerator, 
  type TextGenerationConfig, 
  type TextResult 
} from './text-generator';

// Campaign Generator
export { 
  CampaignGenerator, 
  type CampaignConfig, 
  type CampaignPost, 
  type CampaignResult 
} from './campaign-generator';

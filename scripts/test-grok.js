// script to test Grok connectivity using configured environment variables
require('dotenv').config();
const config = require('../config/default.json');
const AIProviderManager = require('../src/utils/ai-provider-manager');

(async () => {
  const manager = new AIProviderManager({ ...config, grok_api_key: process.env.GROK_API_KEY, grok_endpoint: process.env.GROK_ENDPOINT, grok_model: process.env.GROK_MODEL });
  const ok = await manager.testProvider('grok');
  console.log('Grok test result:', ok);
})();

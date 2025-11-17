/**
 * Configuration Module
 * Centralized configuration management
 * @module Config
 */

const CONFIG = {
  APP: {
    NAME: 'Caderno Digital com IA',
    VERSION: '2.0.0',
    AUTHOR: 'Carlos Antonio de Oliveira Piquet',
    EMAIL: 'carlospiquet.projetos@gmail.com',
    GITHUB: 'https://github.com/carlospiquet2023'
  },
  
  STORAGE: {
    KEYS: {
      NOTEBOOKS: 'cadernos',
      CURRENT_NOTEBOOK: 'ultimoCaderno',
      SETTINGS: 'configuracoes',
      API_KEY: 'gemini_api_key'
    },
    AUTO_SAVE_INTERVAL: 10000, // 10 seconds
    DEBOUNCE_DELAY: 500 // 500ms
  },
  
  API: {
    GEMINI: {
      BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
      MODEL: 'gemini-1.5-flash-latest',
      MAX_RETRIES: 3,
      INITIAL_RETRY_DELAY: 1000,
      TIMEOUT: 30000
    }
  },
  
  UI: {
    FONTS: [
      { value: 'font-arial', label: 'Arial', family: 'Arial, sans-serif' },
      { value: 'font-times', label: 'Times New Roman', family: 'Times New Roman, serif' },
      { value: 'font-kalam', label: 'Kalam', family: 'Kalam, cursive' },
      { value: 'font-patrick', label: 'Patrick Hand', family: 'Patrick Hand, cursive' },
      { value: 'font-dancing', label: 'Dancing Script', family: 'Dancing Script, cursive' },
      { value: 'font-caveat', label: 'Caveat', family: 'Caveat, cursive' }
    ],
    ANIMATION_DURATION: 800,
    PAGE_FLIP_DURATION: 800
  },
  
  WHATSAPP: {
    MAX_SUMMARY_LENGTH: 500,
    COUNTRY_CODE: '55',
    DDD_LENGTH: 2,
    PHONE_LENGTH: 9
  },
  
  PDF: {
    MARGIN: 0.5,
    IMAGE_QUALITY: 0.98,
    SCALE: 2,
    FORMAT: 'letter',
    ORIENTATION: 'portrait'
  },
  
  VOICE: {
    LANGUAGE: 'pt-BR',
    CONTINUOUS: true,
    INTERIM_RESULTS: true
  }
};

// Freeze to prevent modifications
Object.freeze(CONFIG);

export default CONFIG;

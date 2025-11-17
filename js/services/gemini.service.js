/**
 * Gemini API Service
 * Handles AI text generation with retry logic and error handling
 * @module GeminiService
 */

import Logger from '../utils/logger.js';
import CONFIG from '../config.js';
import storageService from './storage.service.js';

const logger = new Logger('GeminiService');

class GeminiService {
  constructor() {
    this.baseUrl = CONFIG.API.GEMINI.BASE_URL;
    this.model = CONFIG.API.GEMINI.MODEL;
    this.maxRetries = CONFIG.API.GEMINI.MAX_RETRIES;
    this.timeout = CONFIG.API.GEMINI.TIMEOUT;
  }

  /**
   * Gets API key from storage
   * @private
   * @returns {string|null} API key
   */
  _getApiKey() {
    const apiKey = storageService.get(CONFIG.STORAGE.KEYS.API_KEY);
    
    if (!apiKey) {
      logger.warn('API key not found in storage');
    }
    
    return apiKey;
  }

  /**
   * Sets API key in storage
   * @param {string} apiKey - Gemini API key
   * @returns {boolean} Success status
   */
  setApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      logger.error('Invalid API key');
      return false;
    }

    return storageService.set(CONFIG.STORAGE.KEYS.API_KEY, apiKey);
  }

  /**
   * Generates text continuation using Gemini API
   * @param {string} prompt - Text to continue
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generated text and metadata
   */
  async generateContinuation(prompt, options = {}) {
    const apiKey = this._getApiKey();
    
    if (!apiKey) {
      throw new Error('API_KEY_MISSING');
    }

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('INVALID_PROMPT');
    }

    const payload = {
      contents: [{
        parts: [{
          text: `Continue o texto a seguir em português, começando de onde ele parou. Não repita o texto original, apenas escreva a continuação. Mantenha o mesmo estilo e tom. Texto:\n\n"${prompt}"`
        }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topK: options.topK || 40,
        topP: options.topP || 0.95,
        maxOutputTokens: options.maxTokens || 1024,
      }
    };

    logger.info('Generating text continuation', { promptLength: prompt.length });

    try {
      const result = await this._fetchWithRetry(apiKey, payload);
      
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error('NO_TEXT_GENERATED');
      }

      logger.info('Text generated successfully', { 
        length: generatedText.length,
        tokensUsed: result.usageMetadata?.totalTokenCount 
      });

      return {
        text: generatedText,
        metadata: {
          tokensUsed: result.usageMetadata?.totalTokenCount || 0,
          finishReason: result.candidates?.[0]?.finishReason,
          timestamp: Date.now()
        }
      };
    } catch (error) {
      logger.error('Failed to generate text', { error: error.message });
      throw this._handleError(error);
    }
  }

  /**
   * Fetches from API with exponential backoff retry
   * @private
   * @param {string} apiKey - API key
   * @param {Object} payload - Request payload
   * @returns {Promise<Object>} API response
   */
  async _fetchWithRetry(apiKey, payload) {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${apiKey}`;
    
    let lastError;
    let delay = CONFIG.API.GEMINI.INITIAL_RETRY_DELAY;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        logger.debug(`API request attempt ${attempt + 1}/${this.maxRetries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          logger.debug('API request successful');
          return data;
        }

        // Handle rate limiting and server errors with retry
        if (response.status === 429 || response.status >= 500) {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          logger.warn(`Retrying after ${delay}ms`, { status: response.status, attempt });
          
          await this._sleep(delay);
          delay *= 2; // Exponential backoff
          continue;
        }

        // Don't retry client errors (400, 401, 403, etc.)
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || response.statusText);

      } catch (error) {
        if (error.name === 'AbortError') {
          lastError = new Error('REQUEST_TIMEOUT');
        } else {
          lastError = error;
        }

        // Don't retry on non-retryable errors
        if (!this._isRetryableError(lastError)) {
          throw lastError;
        }

        if (attempt < this.maxRetries - 1) {
          await this._sleep(delay);
          delay *= 2;
        }
      }
    }

    throw lastError || new Error('MAX_RETRIES_EXCEEDED');
  }

  /**
   * Checks if error is retryable
   * @private
   * @param {Error} error - Error object
   * @returns {boolean} Is retryable
   */
  _isRetryableError(error) {
    const retryableErrors = [
      'REQUEST_TIMEOUT',
      'NETWORK_ERROR',
      'HTTP 429',
      'HTTP 500',
      'HTTP 502',
      'HTTP 503',
      'HTTP 504'
    ];

    return retryableErrors.some(msg => error.message.includes(msg));
  }

  /**
   * Sleep utility
   * @private
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handles and normalizes errors
   * @private
   * @param {Error} error - Original error
   * @returns {Error} Normalized error
   */
  _handleError(error) {
    const errorMap = {
      'API_KEY_MISSING': 'Chave da API não configurada. Configure em Configurações.',
      'INVALID_PROMPT': 'Texto inválido para continuação.',
      'NO_TEXT_GENERATED': 'A IA não conseguiu gerar uma continuação.',
      'REQUEST_TIMEOUT': 'Tempo limite excedido. Tente novamente.',
      'MAX_RETRIES_EXCEEDED': 'Serviço temporariamente indisponível. Tente mais tarde.',
      'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet.'
    };

    const message = errorMap[error.message] || error.message || 'Erro desconhecido ao gerar texto.';
    
    const normalizedError = new Error(message);
    normalizedError.code = error.message;
    normalizedError.originalError = error;

    return normalizedError;
  }

  /**
   * Checks if API key is configured and valid
   * @returns {Promise<Object>} Validation result
   */
  async validateApiKey() {
    const apiKey = this._getApiKey();
    
    if (!apiKey) {
      return {
        isValid: false,
        message: 'API key not configured'
      };
    }

    try {
      // Test with minimal request
      await this._fetchWithRetry(apiKey, {
        contents: [{ parts: [{ text: 'test' }] }]
      });

      return {
        isValid: true,
        message: 'API key is valid'
      };
    } catch (error) {
      return {
        isValid: false,
        message: error.message
      };
    }
  }
}

// Singleton instance
const geminiService = new GeminiService();

export default geminiService;

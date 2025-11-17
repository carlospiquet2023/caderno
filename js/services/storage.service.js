/**
 * Storage Service
 * Abstraction layer for localStorage with error handling and versioning
 * @module StorageService
 */

import Logger from '../utils/logger.js';
import CONFIG from '../config.js';

const logger = new Logger('StorageService');

class StorageService {
  constructor() {
    this.isAvailable = this._checkAvailability();
    this.version = '2.0';
    this._migrateIfNeeded();
  }

  /**
   * Checks if localStorage is available
   * @private
   * @returns {boolean}
   */
  _checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      logger.error('localStorage is not available', e);
      return false;
    }
  }

  /**
   * Migrates data from old versions
   * @private
   */
  _migrateIfNeeded() {
    try {
      const currentVersion = this.get('version');
      
      if (!currentVersion || currentVersion !== this.version) {
        logger.info('Migrating storage to version', this.version);
        this.set('version', this.version);
        // Add migration logic here if needed
      }
    } catch (error) {
      logger.error('Migration failed', error);
    }
  }

  /**
   * Gets item from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Stored value or default
   */
  get(key, defaultValue = null) {
    if (!this.isAvailable) {
      logger.warn('Storage not available, returning default value');
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      
      if (item === null) {
        return defaultValue;
      }

      // Try to parse as JSON
      try {
        return JSON.parse(item);
      } catch {
        // Return as string if not JSON
        return item;
      }
    } catch (error) {
      logger.error(`Failed to get item: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Sets item in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  set(key, value) {
    if (!this.isAvailable) {
      logger.warn('Storage not available');
      return false;
    }

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      logger.debug(`Stored item: ${key}`);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        logger.error('Storage quota exceeded', { key, error });
        this._handleQuotaExceeded();
      } else {
        logger.error(`Failed to set item: ${key}`, error);
      }
      return false;
    }
  }

  /**
   * Removes item from storage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  remove(key) {
    if (!this.isAvailable) return false;

    try {
      localStorage.removeItem(key);
      logger.debug(`Removed item: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove item: ${key}`, error);
      return false;
    }
  }

  /**
   * Clears all storage
   * @returns {boolean} Success status
   */
  clear() {
    if (!this.isAvailable) return false;

    try {
      localStorage.clear();
      logger.info('Storage cleared');
      return true;
    } catch (error) {
      logger.error('Failed to clear storage', error);
      return false;
    }
  }

  /**
   * Gets all keys in storage
   * @returns {Array<string>} Array of keys
   */
  keys() {
    if (!this.isAvailable) return [];

    try {
      return Object.keys(localStorage);
    } catch (error) {
      logger.error('Failed to get keys', error);
      return [];
    }
  }

  /**
   * Gets storage size in bytes
   * @returns {number} Size in bytes
   */
  getSize() {
    if (!this.isAvailable) return 0;

    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      logger.error('Failed to calculate size', error);
      return 0;
    }
  }

  /**
   * Handles storage quota exceeded
   * @private
   */
  _handleQuotaExceeded() {
    logger.warn('Attempting to free storage space');
    
    try {
      // Remove old error logs first
      this.remove('error_logs');
      
      // Remove old notebooks if necessary
      const notebooks = this.get(CONFIG.STORAGE.KEYS.NOTEBOOKS, {});
      const notebookIds = Object.keys(notebooks);
      
      if (notebookIds.length > 10) {
        // Sort by last updated and remove oldest
        const sorted = notebookIds.sort((a, b) => 
          (notebooks[b].atualizadoEm || 0) - (notebooks[a].atualizadoEm || 0)
        );
        
        // Keep only 10 most recent
        const toRemove = sorted.slice(10);
        toRemove.forEach(id => delete notebooks[id]);
        
        this.set(CONFIG.STORAGE.KEYS.NOTEBOOKS, notebooks);
        logger.info(`Removed ${toRemove.length} old notebooks`);
      }
    } catch (error) {
      logger.error('Failed to free storage space', error);
    }
  }

  /**
   * Exports all data as JSON
   * @returns {string} JSON string of all data
   */
  export() {
    if (!this.isAvailable) return '{}';

    try {
      const data = {};
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          data[key] = this.get(key);
        }
      }
      return JSON.stringify(data, null, 2);
    } catch (error) {
      logger.error('Failed to export data', error);
      return '{}';
    }
  }

  /**
   * Imports data from JSON
   * @param {string} jsonData - JSON string to import
   * @returns {boolean} Success status
   */
  import(jsonData) {
    if (!this.isAvailable) return false;

    try {
      const data = JSON.parse(jsonData);
      
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          this.set(key, data[key]);
        }
      }
      
      logger.info('Data imported successfully');
      return true;
    } catch (error) {
      logger.error('Failed to import data', error);
      return false;
    }
  }
}

// Singleton instance
const storageService = new StorageService();

export default storageService;

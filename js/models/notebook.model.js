/**
 * Notebook Model
 * Data model for notebooks with validation
 * @module NotebookModel
 */

import { sanitizeHTML } from '../utils/sanitizer.js';

class NotebookModel {
  /**
   * Creates a new notebook instance
   * @param {Object} data - Notebook data
   */
  constructor(data = {}) {
    this.id = data.id || `notebook-${Date.now()}`;
    this.name = data.name || 'Novo Caderno';
    this.date = data.date || new Date().toISOString().split('T')[0];
    this.subject = data.subject || '';
    this.content = data.content || '';
    this.font = data.font || 'font-kalam';
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
    this.metadata = data.metadata || {};
  }

  /**
   * Validates notebook data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push('ID is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (this.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    if (this.subject && this.subject.length > 100) {
      errors.push('Subject must be less than 100 characters');
    }

    const validFonts = ['font-arial', 'font-times', 'font-kalam', 'font-patrick', 'font-dancing', 'font-caveat'];
    if (!validFonts.includes(this.font)) {
      errors.push('Invalid font');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitizes notebook data
   * @returns {NotebookModel} Self for chaining
   */
  sanitize() {
    this.name = sanitizeHTML(this.name);
    this.subject = sanitizeHTML(this.subject);
    // Content allows basic formatting
    this.content = sanitizeHTML(this.content, true);
    
    return this;
  }

  /**
   * Updates notebook data
   * @param {Object} updates - Fields to update
   * @returns {NotebookModel} Self for chaining
   */
  update(updates) {
    const allowedFields = ['name', 'date', 'subject', 'content', 'font', 'metadata'];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        this[key] = updates[key];
      }
    });

    this.updatedAt = Date.now();
    
    return this;
  }

  /**
   * Converts to plain object
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      id: this.id,
      name: this.name,
      date: this.date,
      subject: this.subject,
      content: this.content,
      font: this.font,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata
    };
  }

  /**
   * Creates notebook from plain object
   * @static
   * @param {Object} data - Plain object
   * @returns {NotebookModel} Notebook instance
   */
  static fromObject(data) {
    return new NotebookModel(data);
  }

  /**
   * Creates default notebook
   * @static
   * @returns {NotebookModel} Default notebook
   */
  static createDefault() {
    return new NotebookModel({
      name: 'Meu Primeiro Caderno',
      content: 'Olá! Este é o seu caderno digital.<br>Você pode começar a digitar aqui. Tente escrever algo erado para ver o corretor ortográfico em ação.<br>Use o menu acima para mudar o estilo da sua "caneta"!<br><br>Escreva um texto longo aqui e depois clique no botão "Continuar com IA" para ver a IA continuar seu texto.'
    });
  }

  /**
   * Gets word count
   * @returns {number} Word count
   */
  getWordCount() {
    const text = this.content.replace(/<[^>]*>/g, '');
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Gets character count
   * @returns {number} Character count
   */
  getCharacterCount() {
    const text = this.content.replace(/<[^>]*>/g, '');
    return text.length;
  }

  /**
   * Gets reading time estimate in minutes
   * @param {number} wordsPerMinute - Reading speed
   * @returns {number} Estimated reading time
   */
  getReadingTime(wordsPerMinute = 200) {
    const words = this.getWordCount();
    return Math.ceil(words / wordsPerMinute);
  }

  /**
   * Clones the notebook
   * @returns {NotebookModel} Cloned notebook
   */
  clone() {
    return new NotebookModel({
      ...this.toObject(),
      id: `notebook-${Date.now()}`,
      name: `${this.name} (Cópia)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
}

export default NotebookModel;

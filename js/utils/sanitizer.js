/**
 * Sanitizer Utility
 * Sanitizes and validates user input
 * @module Sanitizer
 */

import Logger from './logger.js';

const logger = new Logger('Sanitizer');

/**
 * Sanitizes HTML input to prevent XSS attacks
 * @param {string} input - Raw HTML input
 * @param {boolean} allowBasicFormatting - Allow <br>, <b>, <i>, <u>
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(input, allowBasicFormatting = false) {
  if (!input) return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  let sanitized = div.innerHTML;
  
  if (allowBasicFormatting) {
    // Re-allow safe tags
    const safeTags = ['<br>', '</br>', '<b>', '</b>', '<i>', '</i>', '<u>', '</u>'];
    safeTags.forEach(tag => {
      const escaped = tag.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      sanitized = sanitized.replaceAll(escaped, tag);
    });
  }
  
  return sanitized;
}

/**
 * Validates and sanitizes phone number
 * @param {string} ddd - Area code
 * @param {string} number - Phone number
 * @returns {Object} Validation result
 */
export function validatePhone(ddd, number) {
  const cleanDDD = ddd.replace(/\D/g, '');
  const cleanNumber = number.replace(/\D/g, '');
  
  const errors = [];
  
  if (cleanDDD.length !== 2) {
    errors.push('DDD deve ter 2 dígitos');
  }
  
  if (cleanNumber.length !== 9) {
    errors.push('Número deve ter 9 dígitos');
  }
  
  const isValid = errors.length === 0;
  
  return {
    isValid,
    errors,
    formatted: isValid ? `+55 ${cleanDDD} ${cleanNumber}` : null,
    cleaned: isValid ? `55${cleanDDD}${cleanNumber}` : null
  };
}

/**
 * Validates email format
 * @param {string} email - Email address
 * @returns {boolean} Is valid
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Escapes special characters for URL
 * @param {string} text - Text to encode
 * @returns {string} URL-safe text
 */
export function encodeForURL(text) {
  try {
    return encodeURIComponent(text);
  } catch (error) {
    logger.error('Failed to encode URL', { text, error });
    return '';
  }
}

/**
 * Sanitizes filename
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9_\-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 200);
}

export default {
  sanitizeHTML,
  validatePhone,
  validateEmail,
  encodeForURL,
  sanitizeFilename
};

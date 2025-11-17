/**
 * Event Bus
 * Pub/Sub pattern for decoupled communication
 * @module EventBus
 */

import Logger from './logger.js';

const logger = new Logger('EventBus');

class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Set();
  }

  /**
   * Subscribes to an event
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   * @param {Object} context - Context for callback
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback, context = null) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const listener = { callback, context };
    this.events.get(eventName).push(listener);

    logger.debug(`Subscribed to event: ${eventName}`);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Subscribes to an event once
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function
   * @param {Object} context - Context for callback
   * @returns {Function} Unsubscribe function
   */
  once(eventName, callback, context = null) {
    const wrappedCallback = (...args) => {
      callback.apply(context, args);
      this.off(eventName, wrappedCallback);
    };

    this.onceEvents.add(wrappedCallback);
    return this.on(eventName, wrappedCallback, context);
  }

  /**
   * Unsubscribes from an event
   * @param {string} eventName - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(eventName, callback = null) {
    if (!this.events.has(eventName)) {
      return;
    }

    if (callback === null) {
      // Remove all listeners for this event
      this.events.delete(eventName);
      logger.debug(`Removed all listeners for event: ${eventName}`);
      return;
    }

    const listeners = this.events.get(eventName);
    const index = listeners.findIndex(listener => listener.callback === callback);

    if (index !== -1) {
      listeners.splice(index, 1);
      logger.debug(`Unsubscribed from event: ${eventName}`);

      if (listeners.length === 0) {
        this.events.delete(eventName);
      }
    }
  }

  /**
   * Emits an event
   * @param {string} eventName - Event name
   * @param {*} data - Data to pass to callbacks
   */
  emit(eventName, data = null) {
    if (!this.events.has(eventName)) {
      logger.debug(`No listeners for event: ${eventName}`);
      return;
    }

    const listeners = this.events.get(eventName);
    logger.debug(`Emitting event: ${eventName}`, { listenerCount: listeners.length });

    // Clone array to prevent issues if listeners modify the array
    [...listeners].forEach(({ callback, context }) => {
      try {
        callback.call(context, data);
      } catch (error) {
        logger.error(`Error in event listener: ${eventName}`, error);
      }
    });
  }

  /**
   * Emits an event asynchronously
   * @param {string} eventName - Event name
   * @param {*} data - Data to pass to callbacks
   * @returns {Promise<void>}
   */
  async emitAsync(eventName, data = null) {
    if (!this.events.has(eventName)) {
      logger.debug(`No listeners for event: ${eventName}`);
      return;
    }

    const listeners = this.events.get(eventName);
    logger.debug(`Emitting async event: ${eventName}`, { listenerCount: listeners.length });

    const promises = listeners.map(({ callback, context }) => {
      try {
        return Promise.resolve(callback.call(context, data));
      } catch (error) {
        logger.error(`Error in async event listener: ${eventName}`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  /**
   * Gets listener count for an event
   * @param {string} eventName - Event name
   * @returns {number} Listener count
   */
  listenerCount(eventName) {
    return this.events.has(eventName) ? this.events.get(eventName).length : 0;
  }

  /**
   * Gets all event names
   * @returns {Array<string>} Event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Clears all events
   */
  clear() {
    this.events.clear();
    this.onceEvents.clear();
    logger.info('EventBus cleared');
  }
}

// Singleton instance
const eventBus = new EventBus();

// Predefined events for type safety
export const EVENTS = {
  NOTEBOOK: {
    CREATED: 'notebook:created',
    UPDATED: 'notebook:updated',
    DELETED: 'notebook:deleted',
    LOADED: 'notebook:loaded',
    SAVED: 'notebook:saved',
    SWITCHED: 'notebook:switched'
  },
  UI: {
    SIDEBAR_TOGGLED: 'ui:sidebar:toggled',
    MODAL_OPENED: 'ui:modal:opened',
    MODAL_CLOSED: 'ui:modal:closed',
    FONT_CHANGED: 'ui:font:changed',
    PAGE_FLIPPED: 'ui:page:flipped'
  },
  STORAGE: {
    QUOTA_EXCEEDED: 'storage:quota:exceeded',
    ERROR: 'storage:error',
    CLEARED: 'storage:cleared'
  },
  API: {
    REQUEST_STARTED: 'api:request:started',
    REQUEST_SUCCESS: 'api:request:success',
    REQUEST_ERROR: 'api:request:error',
    API_KEY_UPDATED: 'api:key:updated'
  },
  VOICE: {
    STARTED: 'voice:started',
    STOPPED: 'voice:stopped',
    RESULT: 'voice:result',
    ERROR: 'voice:error'
  }
};

export default eventBus;

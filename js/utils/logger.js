/**
 * Logger Utility
 * Structured logging with levels and timestamps
 * @module Logger
 */

class Logger {
  static LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  };

  constructor(context = 'App', level = Logger.LEVELS.INFO) {
    this.context = context;
    this.level = level;
  }

  _log(level, levelName, message, data = null) {
    if (level < this.level) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${levelName}] [${this.context}] ${message}`;
    
    const logMethod = levelName === 'ERROR' ? console.error :
                      levelName === 'WARN' ? console.warn :
                      console.log;
    
    if (data) {
      logMethod(logMessage, data);
    } else {
      logMethod(logMessage);
    }

    // In production, send to analytics/monitoring service
    this._sendToMonitoring(level, levelName, message, data);
  }

  debug(message, data) {
    this._log(Logger.LEVELS.DEBUG, 'DEBUG', message, data);
  }

  info(message, data) {
    this._log(Logger.LEVELS.INFO, 'INFO', message, data);
  }

  warn(message, data) {
    this._log(Logger.LEVELS.WARN, 'WARN', message, data);
  }

  error(message, data) {
    this._log(Logger.LEVELS.ERROR, 'ERROR', message, data);
  }

  _sendToMonitoring(level, levelName, message, data) {
    // TODO: Implement monitoring service integration
    // Example: Send to Sentry, LogRocket, etc.
    if (level >= Logger.LEVELS.ERROR) {
      // Store in localStorage for later sync
      try {
        const errors = JSON.parse(localStorage.getItem('error_logs') || '[]');
        errors.push({
          timestamp: Date.now(),
          level: levelName,
          context: this.context,
          message,
          data,
          userAgent: navigator.userAgent
        });
        
        // Keep only last 50 errors
        if (errors.length > 50) {
          errors.shift();
        }
        
        localStorage.setItem('error_logs', JSON.stringify(errors));
      } catch (e) {
        console.error('Failed to store error log', e);
      }
    }
  }
}

export default Logger;

import pino, { LoggerOptions, Logger } from 'pino';

// 1. Detect the runtime environment
const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isProduction = process.env.NODE_ENV === 'production';

// 2. Define base configuration
const config: LoggerOptions = {
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL || 'info',
  // Basic security scrubbing
  redact: ['password', 'secret', 'token', 'creditCard'],
};

// 3. Apply Node-specific or Browser-specific configurations
if (isBrowser) {
  config.browser = {
    asObject: true, // Formats browser logs as structured objects
    // Optional: Add a transmit function here if you want to send client logs to a server
    /*
    transmit: {
      level: 'error',
      send: (level, logEvent) => {
        navigator.sendBeacon('/api/logs', JSON.stringify({ level, logEvent }));
      }
    }
    */
  };
} else {
  // Node.js specific: Use pino-pretty for clean local development console logs
  if (!isProduction) {
    config.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
      },
    };
  }
}

// 4. Initialize and export the logger instance
export const logger: Logger = pino(config);

// 5. Export a default fallback just in case
export default logger;

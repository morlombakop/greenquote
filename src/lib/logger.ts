import pino from "pino";

export const logger = pino({
  browser: {
    asObject: true // Formats client logs beautifully if shared
  },
  base: { env: process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
});

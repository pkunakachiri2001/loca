/**
 * FleetNest — Winston Logger Configuration
 * Always logs to Console for compatibility with Vercel and serverless environments.
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV !== 'production'
      ? combine(colorize(), logFormat)
      : logFormat
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

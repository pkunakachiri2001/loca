/**
 * FleetNest — Prisma Client Singleton
 * With auto-reconnect middleware for Neon Serverless PostgreSQL
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

prisma.$use(async (params, next) => {
  const before = Date.now();
  try {
    const result = await next(params);
    const after = Date.now();
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Prisma ${params.model}.${params.action} — ${after - before}ms`);
    }
    return result;
  } catch (err: any) {
    // If pool connection timed out or Neon dropped connection, disconnect stale pool and retry once
    const isConnErr =
      err?.code === 'P2024' ||
      err?.code === 'P1001' ||
      err?.message?.includes('Timed out fetching') ||
      err?.message?.includes('terminating connection');

    if (isConnErr) {
      logger.warn(`Prisma connection error (${err?.code || 'pool timeout'}). Reconnecting to database...`);
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        const retryResult = await next(params);
        logger.info(`Prisma query retry succeeded for ${params.model}.${params.action}`);
        return retryResult;
      } catch (retryErr) {
        logger.error('Prisma query retry failed after reconnecting', retryErr);
        throw retryErr;
      }
    }
    throw err;
  }
});

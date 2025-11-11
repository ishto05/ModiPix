/**
 * Database configuration with connection pooling
 * Provides optimized Prisma client instance
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

// Prisma client configuration with connection pooling
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Database query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Log database errors
prisma.$on('error', (e) => {
  logger.error('Database error', {
    message: e.message,
    target: e.target,
  });
});

// Log database info
prisma.$on('info', (e) => {
  logger.info('Database info', { message: e.message });
});

// Log database warnings
prisma.$on('warn', (e) => {
  logger.warn('Database warning', { message: e.message });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default prisma;

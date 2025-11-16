/**
 * Redis configuration for caching and session management
 * Provides optimized Redis client instance
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger.js';
import { REDIS_HOST, REDIS_PORT } from './env.config.js';

// Redis configuration
const redisConfig = {
  host: REDIS_HOST || 'localhost',
  port: REDIS_PORT || 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client
const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
  logger.info('Redis connected', { host: redisConfig.host, port: redisConfig.port });
});

redis.on('ready', () => {
  logger.info('Redis ready');
});

redis.on('error', (error) => {
  logger.error('Redis error', { error: error.message });
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('reconnecting', () => {
  logger.info('Redis reconnecting');
});

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Disconnecting from Redis...');
  await redis.quit();
  logger.info('Redis disconnected');
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default redis;

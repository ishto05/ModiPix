/**
 * Background job processor for image moderation
 * Handles heavy moderation tasks asynchronously
 */

import Bull from 'bull';
import ModerationService from '../services/moderation.service.js';
import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

// Create moderation queue
const moderationQueue = new Bull('moderation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0,
  },
  defaultJobOptions: {
    removeOnComplete: 10, // Keep last 10 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Process moderation jobs
moderationQueue.process(async (job) => {
  const { imageId, fileBuffer, fileName, userId } = job.data;
  
  logger.info('Processing moderation job', {
    jobId: job.id,
    imageId,
    fileName,
    userId
  });

  try {
    const moderationService = new ModerationService();
    const moderationResult = await moderationService.moderateImage(fileBuffer, fileName);

    // Determine status based on moderation result
    const hasViolations = moderationResult.categories?.some(cat => 
      cat.level === 'HIGH' || cat.level === 'CRITICAL'
    );
    
    const newStatus = hasViolations ? 'rejected' : 'approved';

    // Update image status
    await prisma.images.update({
      where: { id: imageId },
      data: { status: newStatus }
    });

    // Save moderation log
    await prisma.moderation_logs.create({
      data: {
        image_id: imageId,
        user_id: userId,
        result: moderationResult,
        verdict: newStatus
      }
    });

    logger.info('Moderation job completed', {
      jobId: job.id,
      imageId,
      status: newStatus,
      hasViolations
    });

    return {
      success: true,
      imageId,
      status: newStatus,
      moderationResult
    };

  } catch (error) {
    logger.error('Moderation job failed', {
      jobId: job.id,
      imageId,
      error: error.message,
      stack: error.stack
    });

    // Update image status to indicate failure
    await prisma.images.update({
      where: { id: imageId },
      data: { status: 'processing' }
    });

    throw error; // Re-throw to trigger retry mechanism
  }
});

// Queue event handlers
moderationQueue.on('completed', (job, result) => {
  logger.info('Moderation job completed', {
    jobId: job.id,
    imageId: result.imageId,
    status: result.status
  });
});

moderationQueue.on('failed', (job, err) => {
  logger.error('Moderation job failed', {
    jobId: job.id,
    imageId: job.data.imageId,
    error: err.message,
    attempts: job.attemptsMade
  });
});

moderationQueue.on('stalled', (job) => {
  logger.warn('Moderation job stalled', {
    jobId: job.id,
    imageId: job.data.imageId
  });
});

// Add job to queue
export const addModerationJob = async (imageId, fileBuffer, fileName, userId) => {
  try {
    const job = await moderationQueue.add('moderate', {
      imageId,
      fileBuffer,
      fileName,
      userId
    }, {
      priority: 1, // High priority for moderation jobs
      delay: 0, // Process immediately
    });

    logger.info('Moderation job added to queue', {
      jobId: job.id,
      imageId,
      fileName
    });

    return job;
  } catch (error) {
    logger.error('Failed to add moderation job to queue', {
      error: error.message,
      imageId
    });
    throw error;
  }
};

// Get queue statistics
export const getQueueStats = async () => {
  const waiting = await moderationQueue.getWaiting();
  const active = await moderationQueue.getActive();
  const completed = await moderationQueue.getCompleted();
  const failed = await moderationQueue.getFailed();

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    total: waiting.length + active.length + completed.length + failed.length
  };
};

// Clean up old jobs
export const cleanOldJobs = async () => {
  try {
    await moderationQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24 hours
    await moderationQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 7 days
    
    logger.info('Old jobs cleaned up');
  } catch (error) {
    logger.error('Failed to clean old jobs', { error: error.message });
  }
};

export default moderationQueue;

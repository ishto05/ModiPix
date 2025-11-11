/**
 * User controller for handling Clerk webhook events
 * Manages user creation, updates, and deletion
 */

import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Handle Clerk webhook events for user management
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleClerkWebhookUsers = async (req, res) => {
  const requestId = req.requestId;
  const requestLogger = req.logger || logger;
  
  try {
    const { type, data } = req.body;

    requestLogger.info('Processing Clerk webhook', {
      type,
      userId: data?.id,
      requestId
    });

    switch (type) {
      case "user.created":
      case "user.updated": {
        const userData = {
          clerk_id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          username: data.username,
          profile_image_url: data.image_url,
        };

        const user = await prisma.users.upsert({
          where: { clerk_id: data.id },
          update: userData,
          create: userData,
        });

        requestLogger.info('User upserted successfully', {
          userId: user.id,
          clerkId: data.id,
          email: user.email,
          requestId
        });
        break;
      }

      case "user.deleted": {
        const user = await prisma.users.update({
          where: { clerk_id: data.id },
          data: { is_active: false },
        });

        requestLogger.info('User deactivated successfully', {
          userId: user.id,
          clerkId: data.id,
          requestId
        });
        break;
      }

      default:
        requestLogger.warn('Unhandled Clerk event type', {
          type,
          requestId
        });
        break;
    }

    sendSuccess(res, { message: 'Webhook processed successfully' });
  } catch (err) {
    requestLogger.error('Error handling Clerk webhook', {
      error: err.message,
      stack: err.stack,
      type: req.body?.type,
      requestId
    });
    
    sendError(res, 'Failed to process webhook', 500, err.message);
  }
};

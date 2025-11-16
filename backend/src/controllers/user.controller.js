import prisma from '../config/database.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const handleClerkWebhookUsers = async (req, res) => {
  const requestId = req.requestId;
  const requestLogger = req.logger || logger;

  try {
    const { type, data } = req.body;

    requestLogger.info("Processing Clerk webhook", {
      type,
      clerkId: data?.id,
      requestId,
    });

    switch (type) {
      case "user.created":
      case "user.updated": {
        const userData = {
          clerk_id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          username: data.username,
          profile_image_url: data.image_url,
          is_active: true,
        };

        // Upsert your own user with internal UUID + Clerk ID
        const user = await prisma.users.upsert({
          where: { clerk_id: data.id },
          update: userData,
          create: userData,
        });

        requestLogger.info("User upserted", {
          internalUserId: user.id,
          clerkId: data.id,
          requestId,
        });

        break;
      }

      case "user.deleted": {
        await prisma.users.update({
          where: { clerk_id: data.id },
          data: { is_active: false },
        });

        requestLogger.info("User deactivated", {
          clerkId: data.id,
          requestId,
        });

        break;
      }

      default:
        requestLogger.warn("Unhandled Clerk event", { type, requestId });
    }

    return sendSuccess(res, { message: "Webhook processed successfully" });
  } catch (err) {
    requestLogger.error("Webhook error", {
      error: err.message,
      stack: err.stack,
      requestId,
    });
    return sendError(res, "Failed to process webhook", 500, err.message);
  }
};

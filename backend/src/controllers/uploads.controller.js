import { uploadToSupabase } from "../services/supabaseStorage.service.js";
import prisma from "../config/database.js";
import { validateFileContent } from "../utils/fileValidator.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { addModerationJob } from "../jobs/moderationQueue.js";
import { logger } from "../utils/logger.js";
import { getAuth } from "@clerk/express";

export const uploadImage = async (req, res) => {
  const requestId = req.requestId;
  const requestLogger = req.logger || logger;

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      requestLogger.warn("Unauthorized upload attempt", { requestId });
      return res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
    }

    // ⭐ Get DB user from Clerk ID
    const dbUser = await prisma.users.findUnique({
      where: { clerk_id: userId },
    });

    if (!dbUser) {
      return sendError(
        res,
        "User does not exist in database. Maybe webhook didn't sync?",
        404
      );
    }

    const file = req.file;
    if (!file) return sendError(res, "No file provided", 400);

    const validationResult = await validateFileContent(
      file.buffer,
      file.originalname
    );

    if (!validationResult.isValid) {
      return sendError(res, validationResult.error, 400);
    }

    requestLogger.info("File validation passed", {
      originalName: file.originalname,
      mimeType: validationResult.mimeType,
      size: validationResult.size,
      requestId,
    });

    const publicUrl = await uploadToSupabase(
      file.buffer,
      file.originalname,
      dbUser.id
    );

    // ⭐ Use internal UUID, NOT Clerk ID
    const image = await prisma.images.create({
      data: {
        user_id: dbUser.id,
        file_name: file.originalname,
        file_url: publicUrl,
        file_size: BigInt(file.size),
        status: "pending",
      },
    });

    requestLogger.info("Image metadata saved", {
      imageId: image.id,
      userId: dbUser.id,
      requestId,
    });

    try {
      await addModerationJob(image.id, file.buffer, file.originalname, dbUser.id);

      requestLogger.info("Moderation job queued", {
        imageId: image.id,
        requestId,
      });
    } catch (queueError) {
      requestLogger.error("Queue failure", {
        error: queueError.message,
        imageId: image.id,
        requestId,
      });

      await prisma.images.update({
        where: { id: image.id },
        data: { status: "processing" },
      });
    }

    return sendSuccess(
      res,
      {
        image: {
          id: image.id,
          file_name: image.file_name,
          file_url: image.file_url,
          file_size: image.file_size.toString(),
          status: image.status,
          created_at: image.created_at,
        },
        message: "Image uploaded successfully. Moderation in progress.",
      },
      201
    );
  } catch (err) {
    requestLogger.error("Error uploading image", {
      error: err.message,
      stack: err.stack,
      requestId,
    });

    return sendError(res, "Failed to upload image", 500, err.message);
  }
};

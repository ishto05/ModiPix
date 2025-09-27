import path from "path";
import ModerationService from "../services/moderation.service.js";

const moderationService = new ModerationService();

export const uploadImage = async (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "uploads", req.file.filename);

    // Now using abstraction layer instead of direct microservice call
    const moderationResult = await moderationService.moderateImage(filePath);

    return res.status(200).json({
      status: "success",
      moderationResult: moderationResult,
    });
  } catch (error) {
    console.error("Error in moderation:", error.message);
    return res.status(500).json({
      status: "error",
      message: "Moderation service failed.",
    });
  }
};
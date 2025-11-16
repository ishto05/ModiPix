import { Router } from "express";
import { upload } from "../middlewares/multer.config.middleware.js";
import { uploadImage } from "../controllers/uploads.controller.js";
import { getAuth } from "@clerk/express";

const moderationRoutes = Router();

// Clerk Auth
const authMiddleware = async (req, res, next) => {
  try {
    const auth = getAuth(req);

    console.log("AUTH DEBUG:", auth);

    if (!auth || !auth.userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    req.userId = auth.userId;
    next();

  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err.message);
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
};


moderationRoutes.post(
  "/uploads",
  authMiddleware,   // AUTH FIRST
  upload.single("image"),
  uploadImage
);


export default moderationRoutes;

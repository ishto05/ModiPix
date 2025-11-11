import { Router } from "express";
import { upload } from "../middlewares/multer.config.middleware.js";
import { uploadImage } from "../controllers/uploads.controller.js";
import { requireAuth } from "@clerk/express";

const moderationRoutes = Router();

// Mock auth middleware for development when Clerk is not configured
const mockAuth = (req, res, next) => {
  req.auth = { userId: 'dev-user-123' }; // Mock user ID for development
  next();
};

// Choose auth middleware based on Clerk configuration
const authMiddleware = (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) 
  ? requireAuth() 
  : mockAuth;

// Upload endpoint with validation and rate limiting
moderationRoutes.post(
  "/uploads", 
  upload.single("image"), 
  authMiddleware, 
  uploadImage
);

export default moderationRoutes;

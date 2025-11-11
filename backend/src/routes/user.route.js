import { Router } from "express";
import { handleClerkWebhookUsers } from "../controllers/user.controller.js";
import { verifyClerkWebhook } from "../middlewares/clerkSignatureVarification.middleware.js";

const userRoutes = Router();

// Clerk webhook → user created/updated
userRoutes.post("/clerk/webhook/users", verifyClerkWebhook, handleClerkWebhookUsers);

export default userRoutes;

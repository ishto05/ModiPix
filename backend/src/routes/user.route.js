import { Router } from "express";
import { verifyClerkWebhook } from "../middlewares/clerkSignatureVarification.middleware.js";
import { handleClerkWebhookUsers } from "../controllers/user.controller.js";

const userRoutes = Router();

userRoutes.post(
  "/clerk/webhook/users",
  verifyClerkWebhook,
  handleClerkWebhookUsers
);

export default userRoutes;

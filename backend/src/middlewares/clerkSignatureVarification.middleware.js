import { Webhook } from "svix"; // Clerk uses Svix under the hood
import { CLERK_WEBHOOK_SECRET } from "../config/env.config.js";

const clerkWebhookSecret = CLERK_WEBHOOK_SECRET;

export const verifyClerkWebhook = (req, res, next) => {
  try {
    const payload = req.body;
    const headers = req.headers;

    const wh = new Webhook(clerkWebhookSecret);
    wh.verify(JSON.stringify(payload), headers); // throws error if invalid

    next(); // valid, continue to controller
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    res.status(401).json({ error: "Invalid webhook signature" });
  }
};

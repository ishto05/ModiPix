import { Webhook } from "svix";
import { CLERK_WEBHOOK_SECRET } from "../config/env.config.js";

export const verifyClerkWebhook = (req, res, next) => {
  try {
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);

    wh.verify(req.body, {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    // Now safe to parse
    req.body = JSON.parse(req.body.toString());

    next();
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return res.status(401).json({ error: "Invalid webhook signature" });
  }
};

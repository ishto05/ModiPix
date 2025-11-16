import express from "express";
import { PORT, DEFAULTS, NODE_ENV } from "./config/env.config.js";
import "./config/redis.js";
import cors from "cors";
import moderationRoutes from "./routes/moderation.routes.js";
import userRoutes from "./routes/user.route.js";
import { clerkMiddleware } from "@clerk/express";

// Security + Rate limiting + Logging
import {
  securityHeaders,
  corsOptions,
  requestIdMiddleware,
  securityLogging,
  generalRateLimit,
  uploadRateLimit,
} from "./middlewares/security.middleware.js";

import {
  errorHandler,
  notFoundHandler,
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
} from "./middlewares/errorHandler.middleware.js";

import { addRequestId } from "./utils/logger.js";
import { sendSuccess } from "./utils/response.js";
import { logger } from "./utils/logger.js";
import { startModerationConsumer } from "./rabbitmq/consumer/moderation.consumer.js";

const app = express();

// Global exception handlers
uncaughtExceptionHandler();
unhandledRejectionHandler();

app.set("trust proxy", 1);

// 1) request id + logger
app.use(requestIdMiddleware);
app.use(addRequestId);

console.log("🧩 Clerk Publishable:", process.env.CLERK_PUBLISHABLE_KEY ? "Loaded" : "Missing");
console.log("🧩 Clerk Secret:", process.env.CLERK_SECRET_KEY ? "Loaded" : "Missing");

// 2) RAW BODY ONLY FOR WEBHOOK ROUTE (NO CLERK, NO JSON PARSER)
app.post(
  "/api/v1/users/clerk/webhook/users",
  express.raw({ type: "application/json" })
);

// 3) Clerk middleware AFTER webhook
if (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
  console.log("✅ Clerk middleware active");
}

// 4) Security + CORS AFTER webhook
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(securityLogging);

// 5) Body parsing for all OTHER routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 6) Rate limiting
app.use(generalRateLimit);

// 7) Routes
app.use("/api/v1/moderation", uploadRateLimit, moderationRoutes);
app.use("/api/v1/users", userRoutes);

console.log("✅ ROUTES MOUNTED");

// 8) Extras
app.get("/health", (req, res) => {
  sendSuccess(res, { status: "OK", timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = () => {
  const port = PORT || DEFAULTS.PORT;
  startModerationConsumer();
  app.listen(port, () =>
    logger.info("Server started successfully", { port, environment: NODE_ENV })
  );
};

startServer();

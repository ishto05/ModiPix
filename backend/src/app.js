import express from "express";
import { PORT, DEFAULTS, NODE_ENV } from "./config/env.config.js";
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

const app = express();

// Global exception handlers
uncaughtExceptionHandler();
unhandledRejectionHandler();

// Trust proxy
app.set("trust proxy", 1);

// --------------------------------------------
// 1️⃣ MUST RUN FIRST → attaches requestId + logger
// --------------------------------------------
app.use(requestIdMiddleware);
app.use(addRequestId);

// --------------------------------------------
// 2️⃣ Clerk MUST run BEFORE body parsing or routes
// --------------------------------------------
console.log("🧩 Clerk Publishable:", process.env.CLERK_PUBLISHABLE_KEY ? "Loaded" : "Missing");
console.log("🧩 Clerk Secret:", process.env.CLERK_SECRET_KEY ? "Loaded" : "Missing");

if (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
  console.log("✅ Clerk middleware active");
} else {
  console.warn("❌ Clerk keys missing — auth disabled");
}

// --------------------------------------------
// 3️⃣ Security middleware
// --------------------------------------------
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(securityLogging);

// --------------------------------------------
// 4️⃣ Body parsing (AFTER Clerk or it blocks auth!)
// --------------------------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// --------------------------------------------
// 5️⃣ General rate limiting
// --------------------------------------------
app.use(generalRateLimit);

// --------------------------------------------
// 5️⃣ Debugging uploads route 
// --------------------------------------------
app.get("/debug-auth", (req, res) => {
  console.log("🔍 DEBUG AUTH HIT");
  console.log("AUTH HEADER:", req.headers.authorization);
  console.log("REQ.AUTH:", req.auth);

  return res.json({
    authHeader: req.headers.authorization || null,
    reqAuth: req.auth || null
  });
});
  

// --------------------------------------------
// 6️⃣ Routes (NOW Clerk + logger are available)
// --------------------------------------------
app.use("/api/v1/moderation", uploadRateLimit, moderationRoutes);
app.use("/api/v1/users", userRoutes);
console.log("✅ MOD ROUTES MOUNTED");

// --------------------------------------------
// Extra endpoints
// --------------------------------------------
app.get("/health", (req, res) => {
  sendSuccess(res, {
    status: "OK",
    message: "ModiPix backend is live 🚀",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  });
});

app.get("/api/v1", (req, res) => {
  sendSuccess(res, {
    name: "ModiPix API",
    version: "1.0.0",
    description: "AI-powered image moderation service",
    endpoints: {
      health: "/health",
      moderation: "/api/v1/moderation",
      users: "/api/v1/users",
    },
  });
});

// --------------------------------------------
// 404 + Global error handling
// --------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

// --------------------------------------------
const startServer = async () => {
  try {
    const port = PORT || DEFAULTS.PORT;

    const server = app.listen(port, () => {
      logger.info("Server started successfully", {
        port,
        environment: NODE_ENV,
        pid: process.pid,
      });
    });

    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      server.close(() => process.exit(0));
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  } catch (error) {
    logger.error("Server startup failed", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

startServer();

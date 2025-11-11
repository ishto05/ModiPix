import express from "express";
import { PORT, DEFAULTS, NODE_ENV } from "./config/env.config.js";
import cors from "cors";
import ngrok from "ngrok";
import moderationRoutes from "./routes/moderation.routes.js";
import userRoutes from "./routes/user.route.js";
import { clerkMiddleware } from "@clerk/express";
// Import security and utility middleware
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

// Set up error handlers for uncaught exceptions
uncaughtExceptionHandler();
unhandledRejectionHandler();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set("trust proxy", 1);

// Security middleware (order matters!)
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(requestIdMiddleware);
app.use(addRequestId);
app.use(securityLogging);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use(generalRateLimit);

// Clerk auth middleware (only if keys are configured)
if (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
  app.use(clerkMiddleware());
} else {
  console.warn('Clerk keys not configured, skipping authentication middleware');
}

// Routes with specific rate limiting
app.use("/api/v1/moderation", uploadRateLimit, moderationRoutes);
app.use("/api/v1/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  sendSuccess(res, {
    status: "OK",
    message: "ModiPix backend is live 🚀",
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API info endpoint
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

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

const startServer = async () => {
  try {
    const port = PORT || DEFAULTS.PORT;

    // Start the server
    const server = app.listen(port, () => {
      logger.info("Server started successfully", {
        port,
        environment: NODE_ENV,
        pid: process.pid,
      });
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}, shutting down gracefully`);
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Start Ngrok tunnel in development (non-blocking)
    if (NODE_ENV === "development") {
      try {
        const url = await ngrok.connect(port);
        logger.info("Ngrok tunnel started", { url });
      } catch (ngrokError) {
        logger.warn("Failed to start Ngrok tunnel", {
          error: ngrokError.message,
        });
        // Don't fail the server if Ngrok fails
      }
    }
  } catch (error) {
    logger.error("Server startup failed", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Start the server
startServer();

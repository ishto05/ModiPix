import express from "express";
import { PORT } from "./config/env.config.js";
import cors from "cors";
import moderationRoutes from "./routes/moderation.routes.js"

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use('/api/v1/moderation', moderationRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ModiPix backend is live 🚀' });
});

const startServer = () => {
  try {
    app.listen(PORT || 4000, () => {
      console.log(`🚀 ModiPix backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

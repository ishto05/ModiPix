// backend/src/config/env.config.js
import { config } from "dotenv";

// Load environment-specific config file
const envFile = `.env.${process.env.NODE_ENV || "development"}.local`;
config({ path: envFile });

export const { 
  NODE_ENV, 
  MODERATION_SERVICE_URL,
  SIGHTENGINE_API_USER,
  SIGHTENGINE_API_SECRET,
  MODERATION_PROVIDER,
  CLERK_WEBHOOK_SECRET,
  CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY,
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
} = process.env;

// Handle PORT specifically to ensure it's properly parsed
export const PORT = process.env.PORT ? parseInt(process.env.PORT.trim()) : undefined;

// Set defaults
export const DEFAULTS = {
  PORT: PORT || 3000,
  NODE_ENV: NODE_ENV || 'development',
  MODERATION_PROVIDER: MODERATION_PROVIDER || 'nudenet', // Start with existing
  MODERATION_SERVICE_URL: MODERATION_SERVICE_URL || 'http://moderation_service:8000'
};
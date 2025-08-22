import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "Development"}.local` });

export const { PORT, NODE_ENV, MODERATION_SERVICE_URL } = process.env;

import { ROUTING_KEYS } from "../rabbitmq.keys.js";
import { RABBITMQ_EXCHANGE } from "../../config/env.config.js";
import { getRabbitMqChannel } from "../rabbitmq.config.js";

export const publishModerationJob = async (job) => {
  try {
    const channel = getRabbitMqChannel();

    // Convert buffer → base64 for safe transport
    const payload = {
      ...job,
      fileBuffer: job.fileBuffer.toString("base64"),
    };

    const buffer = Buffer.from(JSON.stringify(payload));

    const published = channel.publish(
      RABBITMQ_EXCHANGE,
      ROUTING_KEYS.MODERATION_PROCESS,
      buffer,
      { persistent: true }
    );

    if (published) {
      console.log("📤 Published moderation job:", job.imageId);
    } else {
      console.warn("⚠️ Moderation job publish failed!");
    }
  } catch (err) {
    console.error("❌ Producer error:", err.message);
  }
};

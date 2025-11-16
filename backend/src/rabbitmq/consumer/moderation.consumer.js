import { ROUTING_KEYS } from "../rabbitmq.keys.js";
import { RABBITMQ_EXCHANGE } from "../../config/env.config.js";
import prisma from "../../config/database.js";
import ModerationService from "../../services/moderation.service.js";
import { connectRabbitMq } from "../rabbitmq.config.js";

export const startModerationConsumer = async () => {
  try {
    const channel = await connectRabbitMq();

    const queue = ROUTING_KEYS.MODERATION_PROCESS;
    const failedQueue = ROUTING_KEYS.MODERATION_FAILED;

    await channel.assertQueue(queue, { durable: true });
    await channel.assertQueue(failedQueue, { durable: true });

    channel.bindQueue(
      queue,
      RABBITMQ_EXCHANGE,
      ROUTING_KEYS.MODERATION_PROCESS
    );
    channel.bindQueue(
      failedQueue,
      RABBITMQ_EXCHANGE,
      ROUTING_KEYS.MODERATION_FAILED
    );

    console.log(`🔁 Moderation consumer ready on: ${queue}`);

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const job = JSON.parse(msg.content.toString());

        if (!job?.imageId) {
          console.log("⚠️ Invalid job, acking.");
          channel.ack(msg);
          return;
        }

        console.log("👁️ Running moderation on:", job.imageId);

        const buffer = Buffer.from(job.fileBuffer, "base64");

        const mod = new ModerationService();
        const result = await mod.moderateImage(buffer, job.fileName);

        const rejected = result.categories?.some(
          (c) => c.level === "HIGH" || c.level === "CRITICAL"
        );

        const status = rejected ? "rejected" : "approved";

        await prisma.images.update({
          where: { id: job.imageId },
          data: { status },
        });

        await prisma.moderation_logs.create({
          data: {
            image_id: job.imageId,
            user_id: job.userId,
            result,
            verdict: status,
          },
        });

        console.log("✅ Moderation success:", job.imageId);
        channel.ack(msg);
      } catch (err) {
        console.error("❌ Moderation worker error:", err.message);

        // Move job to failed queue
        channel.publish(
          RABBITMQ_EXCHANGE,
          ROUTING_KEYS.MODERATION_FAILED,
          msg.content,
          { persistent: true }
        );

        channel.ack(msg); // prevent infinite loop
      }
    });
  } catch (err) {
    console.error("❌ Consumer init failed:", err.message);
  }
};

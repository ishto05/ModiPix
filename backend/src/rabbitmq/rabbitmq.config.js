import amqplib from "amqplib";
import {
  RABBITMQ_URL,
  RABBITMQ_EXCHANGE,
  RABBITMQ_EXCHANGE_TYPE,
} from "../config/env.config.js";

let channel = null;

export const connectRabbitMq = async () => {
  if (channel) return channel; // avoid multiple connections

  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertExchange(RABBITMQ_EXCHANGE, RABBITMQ_EXCHANGE_TYPE, {
      durable: true,
    });

    console.log("🐇 RabbitMQ connected:", RABBITMQ_EXCHANGE);
    return channel;
  } catch (error) {
    console.error("❌ RabbitMQ connection error:", error.message);
    throw error;
  }
};

export const getRabbitMqChannel = () => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
};

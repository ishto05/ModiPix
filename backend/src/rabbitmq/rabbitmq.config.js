import amqplib from "amqplib";
import {
  RABBITMQ_URL,
  RABBITMQ_EXCHANGE,
  RABBITMQ_EXCHANGE_TYPE,
} from "../config/env.config.js";

let channel = null;

export const connectRabbitMq = async () => {
  // ------------------------------------------------------
  //                     -JUST FOR DEV PUPOSES
  // -------------------------------------------------------

  const R = "\x1b[0m";
  const BOLD = "\x1b[1m";
  const BLINK = "\x1b[5m";
  const FG_BLACK = "\x1b[30m";
  const BG_YELLOW = "\x1b[43m";

  const banner = `${BG_YELLOW}${FG_BLACK}${BOLD}${BLINK}
    ███████████████████████████████████████████████████████████████████████████████████████████████████████████
    █  YOU PIECE OF SHIT                                                                                      █
    █  YOU FORGOT TO START RABBITMQ --DOCKER ENGIEN--                                                         █
    █  ALSO TURN ON NGROK             .                                                                       █
    █  WHILE YOU ARE HERE A REMINDER THAT TURN ON THAT NGROK TUNNLE AS WELL CAUSE OFFCOURSE FORGOT D*KHEAD    █
    ███████████████████████████████████████████████████████████████████████████████████████████████████████████
   ${R}`;
  // ------------------------------------------------------
  //                   JUST FOR DEV PURPOSES
  // ------------------------------------------------------

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
    console.log(banner);
    console.error("❌ RabbitMQ connection error:", error.message);
    throw error;
  }
};

export const getRabbitMqChannel = () => {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  return channel;
};

import pino from "pino";
import env from "../config/env";

const transport =
  env.NODE_ENV === "production"
    ? undefined
    : pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
        },
      });

const logger = pino(
  {
    level: env.NODE_ENV === "production" ? "info" : "debug",
  },
  transport,
);

export default logger;

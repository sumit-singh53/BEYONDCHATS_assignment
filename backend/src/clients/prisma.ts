import { PrismaClient } from "@prisma/client";
import env from "../config/env";
import logger from "../utils/logger";

const prisma = new PrismaClient({
  log: env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
});

async function connect() {
  try {
    await prisma.$connect();
    logger.info("Prisma connected");
  } catch (error) {
    logger.error({ error }, "Prisma connection failed");
    await prisma.$disconnect();
    process.exit(1);
  }
}

connect();

export default prisma;

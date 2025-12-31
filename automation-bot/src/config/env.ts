import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  BACKEND_API_BASE_URL: z.string().url().default("http://localhost:4000/api"),
  GOOGLE_SEARCH_API_KEY: z.string().min(1),
  GOOGLE_SEARCH_ENGINE_ID: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  MAX_ARTICLES_PER_RUN: z.coerce.number().int().positive().default(5),
});

const env = envSchema.parse(process.env);

export default env;

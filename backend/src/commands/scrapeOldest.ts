import logger from "../utils/logger";
import { scrapeOldestArticles } from "../services/scrapeService";
import * as articleService from "../services/articleService";

async function main() {
  logger.info("Starting scrape of oldest BeyondChats articles");
  const payloads = await scrapeOldestArticles();
  if (!payloads.length) {
    logger.warn("No articles scraped");
    return;
  }
  await Promise.all(payloads.map((payload) => articleService.upsertFromScrape(payload)));
  logger.info({ count: payloads.length }, "Scrape completed");
}

main().catch((error) => {
  logger.error({ error }, "Scrape failed");
  process.exit(1);
});

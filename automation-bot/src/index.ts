import env from "./config/env";
import logger from "./utils/logger";
import { fetchArticles, applyAIUpdate } from "./services/articleService";
import { searchWeb } from "./services/searchService";
import { scrapeArticle } from "./services/scraperService";
import { rewriteArticle } from "./services/llmService";
import { ArticleReference } from "./types/article";
import { URL } from "node:url";

async function processArticle(articleId: string, title: string, sourceUrl: string, originalContent: string) {
  try {
    const originHost = new URL(sourceUrl).host;
    const searchResults = await searchWeb(title, originHost, 6);
    const picks = searchResults.slice(0, 2);

    if (picks.length < 2) {
      logger.warn({ articleId, title }, "Insufficient reference articles found");
      return;
    }

    const scraped = await Promise.all(
      picks.map(async (result) => {
        const article = await scrapeArticle(result.link);
        return {
          reference: {
            title: article.title,
            url: article.url,
            summary: result.snippet,
            sourceDomain: new URL(article.url).host,
          } satisfies ArticleReference,
          content: article.content,
        };
      }),
    );

    const referenceSummaries = scraped
      .map((entry, index) => `${index + 1}. ${entry.reference.title} (${entry.reference.url})\n${entry.content.slice(0, 400)}`)
      .join("\n\n");

    const rewritten = await rewriteArticle({
      originalTitle: title,
      originalContent,
      referenceSummaries,
    });

    const references = scraped.map((entry) => entry.reference);
    await applyAIUpdate(articleId, rewritten, references);
    logger.info({ articleId }, "Article updated via automation bot");
  } catch (error) {
    logger.error({ articleId, error }, "Failed to automate article");
  }
}

async function run() {
  logger.info("Automation bot started");
  const articles = await fetchArticles();
  const pending = articles.filter((article) => !article.updatedContent);
  const batch = pending.slice(0, env.MAX_ARTICLES_PER_RUN);

  if (!batch.length) {
    logger.info("No pending articles detected");
    return;
  }

  for (const article of batch) {
    await processArticle(article.id, article.title, article.sourceUrl, article.originalContent);
  }

  logger.info({ processed: batch.length }, "Automation bot completed");
}

run().catch((error) => {
  logger.error({ error }, "Automation bot crashed");
  process.exit(1);
});

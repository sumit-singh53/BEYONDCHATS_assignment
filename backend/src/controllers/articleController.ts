import { Request, Response, NextFunction } from "express";
import * as articleService from "../services/articleService";
import { scrapeOldestArticles } from "../services/scrapeService";
import { slugify } from "../utils/slugify";
import { ArticleReference, UpdateArticleDTO } from "../types/article";
import { HttpError } from "../utils/httpError";

function ensureArticleId(req: Request): string {
  const { id } = req.params;
  if (!id) {
    throw new HttpError(400, "Article id is required");
  }
  return id;
}

export async function listArticles(_req: Request, res: Response, next: NextFunction) {
  try {
    const articles = await articleService.list();
    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
}

export async function getArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const id = ensureArticleId(req);
    const article = await articleService.getById(id);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
}

export async function createArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, author, sourceUrl, publishedAt, summary, coverImage, originalContent } = req.body;
    const payload = {
      title,
      slug: slugify(title),
      author: author ?? null,
      sourceUrl,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
      summary: summary ?? null,
      coverImage: coverImage ?? null,
      originalContent,
    };
    const created = await articleService.create(payload);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
}

export async function updateArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const id = ensureArticleId(req);
    const updatePayload: UpdateArticleDTO = { ...req.body };
    if (updatePayload.title) {
      updatePayload.slug = slugify(updatePayload.title);
    }
    if (updatePayload.publishedAt) {
      updatePayload.publishedAt = new Date(updatePayload.publishedAt);
    }
    const updated = await articleService.update(id, updatePayload);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const id = ensureArticleId(req);
    const deleted = await articleService.remove(id);
    res.json({ success: true, data: deleted });
  } catch (error) {
    next(error);
  }
}

export async function applyAIUpdate(req: Request, res: Response, next: NextFunction) {
  try {
    const id = ensureArticleId(req);
    const { updatedContent, references } = req.body as {
      updatedContent: string;
      references: ArticleReference[];
    };
    const updated = await articleService.applyAIUpdate(id, updatedContent, references);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function triggerScrape(_req: Request, res: Response, next: NextFunction) {
  try {
    const scrapedPayloads = await scrapeOldestArticles();
    const persisted = await Promise.all(scrapedPayloads.map((payload) => articleService.upsertFromScrape(payload)));
    res.json({ success: true, data: persisted, count: persisted.length });
  } catch (error) {
    next(error);
  }
}

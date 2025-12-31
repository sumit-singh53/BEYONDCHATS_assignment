import { Article } from "@prisma/client";
import { HttpError } from "../utils/httpError";
import * as articleRepository from "../repositories/articleRepository";
import { ArticleReference, CreateArticleDTO, UpdateArticleDTO } from "../types/article";

export async function list(): Promise<Article[]> {
  return articleRepository.listArticles();
}

export async function getById(id: string): Promise<Article> {
  const article = await articleRepository.getArticleById(id);
  if (!article) {
    throw new HttpError(404, "Article not found");
  }
  return article;
}

export async function create(payload: CreateArticleDTO): Promise<Article> {
  return articleRepository.createArticle(payload);
}

export async function update(id: string, payload: UpdateArticleDTO): Promise<Article> {
  await getById(id);
  return articleRepository.updateArticle(id, payload);
}

export async function remove(id: string): Promise<Article> {
  await getById(id);
  return articleRepository.deleteArticle(id);
}

export async function upsertFromScrape(payload: CreateArticleDTO): Promise<Article> {
  return articleRepository.upsertArticleBySlug(payload);
}

export async function applyAIUpdate(
  id: string,
  updatedContent: string,
  references: ArticleReference[],
): Promise<Article> {
  await getById(id);
  return articleRepository.updateArticleWithAI(id, updatedContent, references);
}

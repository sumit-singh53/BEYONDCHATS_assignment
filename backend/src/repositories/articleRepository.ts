import { Prisma } from "@prisma/client";
import prisma from "../clients/prisma";
import { ArticleReference, CreateArticleDTO, UpdateArticleDTO } from "../types/article";

function normalizeReferences(
  value?: ArticleReference[] | null,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return Prisma.JsonNull;
  }
  return value as unknown as Prisma.InputJsonValue;
}

function buildUpdateInput(data: UpdateArticleDTO): Prisma.ArticleUpdateInput {
  const payload: Prisma.ArticleUpdateInput = {};

  if (data.title !== undefined) payload.title = data.title;
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.author !== undefined) payload.author = data.author;
  if (data.publishedAt !== undefined) payload.publishedAt = data.publishedAt;
  if (data.summary !== undefined) payload.summary = data.summary;
  if (data.coverImage !== undefined) payload.coverImage = data.coverImage;
  if (data.originalContent !== undefined) payload.originalContent = data.originalContent;
  if (data.updatedContent !== undefined) payload.updatedContent = data.updatedContent;

  const references = normalizeReferences(data.references);
  if (references !== undefined) {
    payload.references = references;
  }

  return payload;
}

export async function listArticles() {
  return prisma.article.findMany({
    orderBy: { publishedAt: "asc" },
  });
}

export async function getArticleById(id: string) {
  return prisma.article.findUnique({ where: { id } });
}

export async function createArticle(data: CreateArticleDTO) {
  return prisma.article.create({ data });
}

export async function updateArticle(id: string, data: UpdateArticleDTO) {
  return prisma.article.update({ where: { id }, data: buildUpdateInput(data) });
}

export async function deleteArticle(id: string) {
  return prisma.article.delete({ where: { id } });
}

export async function upsertArticleBySlug(data: CreateArticleDTO) {
  return prisma.article.upsert({
    where: { slug: data.slug },
    update: {
      title: data.title,
      author: data.author ?? null,
      publishedAt: data.publishedAt ?? null,
      summary: data.summary ?? null,
      coverImage: data.coverImage ?? null,
      originalContent: data.originalContent,
      sourceUrl: data.sourceUrl,
    },
    create: data,
  });
}

export async function updateArticleWithAI(
  id: string,
  updatedContent: string,
  references: ArticleReference[],
) {
  return prisma.article.update({
    where: { id },
    data: {
      updatedContent,
      references: normalizeReferences(references) ?? Prisma.JsonNull,
      aiVersion: { increment: 1 },
    },
  });
}

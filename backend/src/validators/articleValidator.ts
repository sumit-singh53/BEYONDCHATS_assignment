import { z } from "zod";

const referenceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  summary: z.string().optional(),
  sourceDomain: z.string().optional(),
});

const createBody = z.object({
  title: z.string().min(3),
  author: z.string().optional(),
  sourceUrl: z.string().url(),
  publishedAt: z.string().datetime().or(z.date()).optional().nullable(),
  summary: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  originalContent: z.string().min(50),
});

const updateBody = createBody.partial().extend({
  updatedContent: z.string().min(10).optional().nullable(),
  references: z.array(referenceSchema).optional().nullable(),
});

export const createArticleSchema = z.object({
  body: createBody,
});

export const updateArticleSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: updateBody,
});

export const aiUpdateSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    updatedContent: z.string().min(100),
    references: z.array(referenceSchema).min(1),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

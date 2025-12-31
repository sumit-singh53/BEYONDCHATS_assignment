export interface ArticleReference {
  title: string;
  url: string;
  summary?: string;
  sourceDomain?: string;
}

export interface CreateArticleDTO {
  title: string;
  slug: string;
  author?: string | null;
  sourceUrl: string;
  publishedAt?: Date | null;
  summary?: string | null;
  coverImage?: string | null;
  originalContent: string;
}

export interface UpdateArticleDTO {
  title?: string;
  slug?: string;
  author?: string | null;
  publishedAt?: Date | null;
  summary?: string | null;
  coverImage?: string | null;
  originalContent?: string;
  updatedContent?: string | null;
  references?: ArticleReference[] | null;
}

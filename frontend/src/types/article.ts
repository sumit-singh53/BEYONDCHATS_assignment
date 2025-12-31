export interface ArticleReference {
  title: string;
  url: string;
  summary?: string;
  sourceDomain?: string;
}

export interface Article {
  id: string;
  title: string;
  author?: string | null;
  originalContent: string;
  updatedContent?: string | null;
  summary?: string | null;
  coverImage?: string | null;
  sourceUrl: string;
  publishedAt?: string | null;
  references?: ArticleReference[] | null;
}

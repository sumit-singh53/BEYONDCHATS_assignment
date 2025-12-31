export interface ArticleReference {
  title: string;
  url: string;
  summary?: string;
  sourceDomain?: string;
}

export interface ArticleDTO {
  id: string;
  title: string;
  slug: string;
  author?: string | null;
  originalContent: string;
  updatedContent?: string | null;
  sourceUrl: string;
  references?: ArticleReference[] | null;
}

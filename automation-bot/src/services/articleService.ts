import backendClient from "../clients/backendClient";
import { ArticleDTO, ArticleReference } from "../types/article";

export async function fetchArticles(): Promise<ArticleDTO[]> {
  const { data } = await backendClient.get<{ data: ArticleDTO[] }>("/articles");
  return data.data;
}

export async function applyAIUpdate(
  id: string,
  updatedContent: string,
  references: ArticleReference[],
) {
  await backendClient.post(`/articles/${id}/ai-update`, {
    updatedContent,
    references,
  });
}

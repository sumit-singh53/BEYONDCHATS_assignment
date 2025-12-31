import axios from "axios";
import type { Article } from "../types/article";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api",
  timeout: 10000,
});

export async function fetchArticles(): Promise<Article[]> {
  const { data } = await api.get<{ data: Article[] }>("/articles");
  return data.data;
}

export async function triggerScrape() {
  await api.post("/articles/scrape/oldest");
}

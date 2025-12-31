import axios from "axios";
import env from "../config/env";
import logger from "../utils/logger";
import { URL } from "node:url";

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
}

const SEARCH_ENDPOINT = "https://customsearch.googleapis.com/customsearch/v1";

export async function searchWeb(query: string, originHost: string, count = 5): Promise<SearchResult[]> {
  try {
    const { data } = await axios.get<{ items?: Array<Record<string, any>> }>(SEARCH_ENDPOINT, {
      params: {
        key: env.GOOGLE_SEARCH_API_KEY,
        cx: env.GOOGLE_SEARCH_ENGINE_ID,
        q: query,
        num: count,
      },
    });

    const items = data.items ?? [];
    const filtered = items
      .map((item) => ({
        title: item.title as string,
        link: item.link as string,
        snippet: item.snippet as string,
        displayLink: item.displayLink as string,
      }))
      .filter((item) => {
        if (!item.link) return false;
        try {
          const url = new URL(item.link);
          return url.host !== originHost;
        } catch (error) {
          logger.warn({ error, link: item.link }, "Skipping malformed search result");
          return false;
        }
      });

    return filtered;
  } catch (error) {
    logger.error({ error }, "Search API failed");
    throw error;
  }
}

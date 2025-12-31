import axios from "axios";
import * as cheerio from "cheerio";
import env from "../config/env";
import { slugify } from "../utils/slugify";
import logger from "../utils/logger";
import { CreateArticleDTO } from "../types/article";

const BLOG_BASE_URL = "https://beyondchats.com/blogs/";

interface ArticleMeta {
  title: string;
  url: string;
  author?: string | null;
  summary?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
}

function buildPageUrl(page: number): string {
  if (page <= 1) {
    return BLOG_BASE_URL;
  }
  return `${BLOG_BASE_URL}page/${page}/`;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value.trim());
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function extractText(scope: cheerio.Cheerio<any>, selector: string) {
  return scope.find(selector).first().text().trim();
}

async function fetchPageMeta(page: number): Promise<ArticleMeta[]> {
  const url = buildPageUrl(page);
  logger.debug({ url }, "Fetching blog listing page");
  const { data } = await axios.get<string>(url);
  const $ = cheerio.load(data);
  const metas: ArticleMeta[] = [];

  $("article").each((_, article) => {
    const scoped = $(article);
    const titleAnchor = scoped.find("h2 a, h3 a, .entry-title a").first();
    const title = titleAnchor.text().trim();
    const articleUrl = titleAnchor.attr("href");

    if (!title || !articleUrl) {
      return;
    }

    const author =
      extractText(scoped, "[rel='author']") ||
      extractText(scoped, ".author a") ||
      extractText(scoped, ".author") ||
      undefined;

    const summary =
      extractText(scoped, ".entry-summary p") ||
      extractText(scoped, "p") ||
      undefined;

    const coverImage = scoped.find("img").first().attr("src") ?? undefined;

    const dateText =
      scoped.find("time").attr("datetime") ||
      scoped.find("time").text() ||
      extractText(scoped, ".posted-on") ||
      extractText(scoped, ".entry-meta") ||
      undefined;

    metas.push({
      title,
      url: articleUrl,
      author: author ?? null,
      summary: summary ?? null,
      coverImage: coverImage ?? null,
      publishedAt: parseDate(dateText),
    });
  });

  return metas;
}

async function fetchArticleBody(url: string): Promise<string> {
  const { data } = await axios.get<string>(url);
  const $ = cheerio.load(data);
  const contentHtml = $(".entry-content").html() || $("article").find("p").parent().html() || "";
  return contentHtml.trim();
}

export async function scrapeOldestArticles(limit = 5): Promise<CreateArticleDTO[]> {
  const metas: ArticleMeta[] = [];
  let page = 1;

  while (page <= env.SCRAPE_MAX_PAGES) {
    const pageMetas = await fetchPageMeta(page);
    if (pageMetas.length === 0) {
      break;
    }
    metas.push(...pageMetas);
    page += 1;
  }

  if (metas.length === 0) {
    return [];
  }

  const sorted = metas
    .filter((meta) => meta.title && meta.url)
    .sort((a, b) => {
      const aTime = a.publishedAt?.getTime() ?? Number.POSITIVE_INFINITY;
      const bTime = b.publishedAt?.getTime() ?? Number.POSITIVE_INFINITY;
      return aTime - bTime;
    })
    .slice(0, limit);

  const unique = new Map<string, CreateArticleDTO>();

  for (const meta of sorted) {
    try {
      const originalContent = await fetchArticleBody(meta.url);
      const slug = slugify(meta.url.split("/").filter(Boolean).pop() ?? meta.title);
      unique.set(slug, {
        title: meta.title,
        slug,
        author: meta.author ?? null,
        sourceUrl: meta.url,
        publishedAt: meta.publishedAt ?? null,
        summary: meta.summary ?? null,
        coverImage: meta.coverImage ?? null,
        originalContent,
      });
    } catch (error) {
      logger.error({ error, url: meta.url }, "Failed to fetch article body");
    }
  }

  return Array.from(unique.values());
}

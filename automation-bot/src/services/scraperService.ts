import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedArticle {
  url: string;
  title: string;
  content: string;
}

export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
  const { data } = await axios.get<string>(url, { timeout: 20000 });
  const $ = cheerio.load(data);
  const title = $("title").text().trim() || url;
  const mainContent =
    $("article").text().trim() ||
    $("main").text().trim() ||
    $("body").text().trim().slice(0, 5000);

  return {
    url,
    title,
    content: mainContent,
  };
}

import clsx from "clsx";
import { Calendar, Sparkles } from "lucide-react";
import type { Article } from "../types/article";

interface ArticleListProps {
  articles: Article[];
  selectedArticleId: string | null;
  onSelect: (articleId: string) => void;
  isLoading?: boolean;
}

function getPreview(article: Article) {
  const raw = article.summary ?? article.originalContent ?? "";
  const text = raw.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ");
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157)}...`;
}

export function ArticleList({ articles, selectedArticleId, onSelect, isLoading }: ArticleListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="animate-pulse rounded-2xl border border-slate-200 bg-white/70 p-4"
          >
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-5 w-3/4 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center">
        <Sparkles className="mx-auto mb-3 text-primary-500" size={32} />
        <p className="text-sm text-slate-600">No articles available yet. Start a scrape to see curated content appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <button
          key={article.id}
          type="button"
          onClick={() => onSelect(article.id)}
          className={clsx(
            "w-full rounded-2xl border bg-white/80 p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400",
            selectedArticleId === article.id
              ? "border-primary-300 bg-primary-50/80 shadow"
              : "border-slate-200 hover:border-primary-200 hover:shadow-sm",
          )}
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
              {article.updatedContent ? (
                <>
                  <Sparkles size={14} /> AI Enhanced
                </>
              ) : (
                "Original"
              )}
            </span>
            {article.publishedAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{article.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{getPreview(article)}</p>
        </button>
      ))}
    </div>
  );
}

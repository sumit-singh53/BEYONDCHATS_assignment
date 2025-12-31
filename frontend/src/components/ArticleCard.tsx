import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import type { Article } from "../types/article";
import { Calendar, ExternalLink, Sparkles } from "lucide-react";
import clsx from "clsx";

interface ArticleCardProps {
  article: Article;
}

const tabStyles = "px-4 py-2 text-sm font-medium rounded-full transition";

function sanitize(content?: string | null) {
  if (!content) return "<p class='text-slate-500'>No content available.</p>";
  return DOMPurify.sanitize(content);
}

export function ArticleCard({ article }: ArticleCardProps) {
  const [activeTab, setActiveTab] = useState<"original" | "updated">(
    article.updatedContent ? "updated" : "original",
  );

  const referenceNodes = useMemo(
    () =>
      (article.references ?? []).map((reference) => (
        <li key={reference.url} className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{reference.title}</span>
          {reference.sourceDomain && <span className="text-slate-500"> · {reference.sourceDomain}</span>}
          <a
            href={reference.url}
            target="_blank"
            rel="noreferrer"
            className="ml-2 inline-flex items-center gap-1 text-primary-600 hover:underline"
          >
            Visit <ExternalLink size={14} />
          </a>
        </li>
      )),
    [article.references],
  );

  return (
    <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={clsx(
            "rounded-full px-3 py-1 text-xs font-semibold",
            article.updatedContent ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
          )}
        >
          {article.updatedContent ? "AI Enhanced" : "Original"}
        </span>
        <h2 className="text-xl font-semibold text-slate-900 flex-1">{article.title}</h2>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
        {article.author && <span>By {article.author}</span>}
        {article.publishedAt && (
          <span className="inline-flex items-center gap-1">
            <Calendar size={16} />
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
        )}
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary-600 hover:underline"
        >
          View Source <ExternalLink size={14} />
        </a>
      </div>

      <div className="mt-5 flex gap-2 rounded-full bg-slate-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("original")}
          className={clsx(tabStyles, activeTab === "original" && "bg-white shadow")}
        >
          Original Draft
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("updated")}
          disabled={!article.updatedContent}
          className={clsx(
            tabStyles,
            article.updatedContent ? "" : "cursor-not-allowed opacity-50",
            activeTab === "updated" && article.updatedContent && "bg-white shadow",
          )}
        >
          <Sparkles size={16} className="mr-1 inline" /> AI Rewrite
        </button>
      </div>

      <div className="prose mt-6 max-w-none text-slate-800" dangerouslySetInnerHTML={{
        __html: sanitize(activeTab === "original" ? article.originalContent : article.updatedContent),
      }} />

      {article.references && article.references.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            References
          </h3>
          <ul className="space-y-2">{referenceNodes}</ul>
        </div>
      )}
    </article>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { ArticleCard } from "./components/ArticleCard";
import { ArticleList } from "./components/ArticleList";
import { fetchArticles } from "./lib/api";
import type { Article } from "./types/article";

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const data = await fetchArticles();
      setArticles(data);
      setSelectedArticleId((current) => {
        if (!data.length) return null;
        if (current && data.some((article) => article.id === current)) return current;
        return data[0].id;
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load articles. Please try again.");
    } finally {
      if (mode === "initial") {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadArticles();
  }, [loadArticles]);

  const selectedArticle = useMemo(() => {
    if (!selectedArticleId) return null;
    return articles.find((article) => article.id === selectedArticleId) ?? null;
  }, [articles, selectedArticleId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/60 via-white to-sky-50 px-4 py-10 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="rounded-3xl border border-white/80 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Beyond Chats · Editorial Hub</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Automated Article Intelligence</h1>
              <p className="mt-2 text-base text-slate-600">
                Review original reporting alongside AI-enhanced insights. Select any article to explore both versions,
                compare drafts, and browse curated references.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadArticles("refresh")}
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-2 rounded-2xl border border-primary-200 bg-primary-50 px-5 py-3 text-sm font-semibold text-primary-600 shadow-sm transition hover:border-primary-300 hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRefreshing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              Refresh feed
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-rose-700">
            <div className="flex items-center justify-between">
              <p className="font-semibold">We hit a snag while reaching the newsroom.</p>
              <button
                type="button"
                onClick={() => void loadArticles()}
                className="text-sm font-semibold underline"
              >
                Try again
              </button>
            </div>
            <p className="text-sm text-rose-600/80">{error}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[340px,minmax(0,1fr)]">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Articles</p>
                <p className="text-2xl font-bold text-slate-900">{articles.length}</p>
              </div>
              <div className="text-right text-sm text-slate-500">
                {isLoading ? "Fetching latest" : "Tap any card"}
              </div>
            </div>
            <ArticleList
              articles={articles}
              selectedArticleId={selectedArticleId}
              onSelect={setSelectedArticleId}
              isLoading={isLoading}
            />
          </section>

          <section>
            {isLoading && !articles.length ? (
              <div className="animate-pulse rounded-2xl border border-slate-200 bg-white/80 p-6">
                <div className="h-6 w-48 rounded bg-slate-200" />
                <div className="mt-3 h-5 w-32 rounded bg-slate-100" />
                <div className="mt-6 space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`line-${index}`} className="h-4 rounded bg-slate-100" />
                  ))}
                </div>
              </div>
            ) : selectedArticle ? (
              <ArticleCard article={selectedArticle} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600">
                Select an article from the list to view its original and AI-updated versions side by side.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;

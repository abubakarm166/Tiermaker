"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTemplates } from "@/lib/api";
import type { Template, PaginatedResponse } from "@/types/api";

export default function TemplatesPage() {
  const [data, setData] = useState<PaginatedResponse<Template> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("newest");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: Record<string, string> = { ordering: ordering === "newest" ? "-created_at" : ordering };
    if (search) params.search = search;
    if (page > 1) params.page = String(page);
    fetchTemplates(params)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [search, ordering, page]);

  const templates = data?.results ?? [];
  const apiBase = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_API_BASE || "";

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-white">Templates</h1>
        <Link href="/app/templates/new" className="btn-primary">
          New template
        </Link>
      </div>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input max-w-xs"
        />
        <select
          value={ordering}
          onChange={(e) => {
            setOrdering(e.target.value);
            setPage(1);
          }}
          className="input max-w-[180px]"
        >
          <option value="newest">Newest</option>
          <option value="most_popular">Most popular</option>
        </select>
      </div>
      {loading ? (
        <div className="text-muted py-12 text-center">Loading…</div>
      ) : templates.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          No templates found.{" "}
          <Link href="/app/templates/new" className="link-primary hover:underline">
            Create one
          </Link>
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {templates.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/app/templates/${t.id}`}
                  className="group block rounded-xl overflow-hidden border border-app bg-surface-elevated hover:border-[#333] hover:shadow-lg transition-all"
                >
                  <div className="aspect-[4/3] relative bg-surface-elevated overflow-hidden">
                    {t.thumbnail ? (
                      <img
                        src={t.thumbnail.startsWith("http") ? t.thumbnail : `${apiBase}${t.thumbnail}`}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-strong text-3xl font-display font-semibold">
                        {t.title.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 rounded-md bg-black/70 px-2 py-0.5 text-white text-xs font-medium">
                      {t.popularity ?? 0} lists
                    </div>
                  </div>
                  <div className="p-3 border-t border-app bg-surface">
                    <h2 className="font-display font-medium text-white text-sm truncate">{t.title}</h2>
                    {t.category_name && (
                      <p className="text-muted-strong text-xs mt-0.5 truncate">{t.category_name}</p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {data && (data.next || data.previous) && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.previous}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-muted">Page {page}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.next}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

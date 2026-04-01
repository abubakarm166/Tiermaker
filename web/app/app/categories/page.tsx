"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCategories } from "@/lib/api";
import type { Category, PaginatedResponse } from "@/types/api";

export default function CategoriesPage() {
  const [data, setData] = useState<PaginatedResponse<Category> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
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
  }, []);

  const categories = data?.results ?? [];
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-white">Categories</h1>
        <Link href="/app/categories/new" className="btn-primary">
          New category
        </Link>
      </div>
      {loading ? (
        <div className="text-muted py-12 text-center">Loading…</div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          No categories yet.{" "}
          <Link href="/app/categories/new" className="link-primary hover:underline">
            Create one
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/app/categories/${c.id}`}
                className="block rounded-xl overflow-hidden border border-app bg-surface-elevated hover:border-[#333] p-4"
              >
                {c.image && (
                  <img
                    src={c.image.startsWith("http") ? c.image : `${apiBase}/media/${c.image}`}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <h2 className="font-display font-medium text-white">{c.name}</h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

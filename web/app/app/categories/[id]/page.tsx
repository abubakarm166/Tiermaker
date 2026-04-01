"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCategory, fetchTemplates } from "@/lib/api";
import type { Category, Template, PaginatedResponse } from "@/types/api";

export default function CategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [templates, setTemplates] = useState<PaginatedResponse<Template> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchCategory(id), fetchTemplates({ category: id })])
      .then(([cat, tmpl]) => {
        if (!cancelled) {
          setCategory(cat);
          setTemplates(tmpl);
        }
      })
      .catch(() => {
        if (!cancelled) setCategory(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="text-muted py-12 text-center">Loading…</div>;
  if (!category) return <div className="card p-8 text-muted">Category not found.</div>;

  const list = templates?.results ?? [];

  return (
    <div>
      <div className="flex gap-4 mb-6 items-center">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Back
        </button>
        <Link href={`/app/templates/new?category=${id}`} className="btn-primary">
          Create template for this category
        </Link>
      </div>
      <h1 className="font-display text-2xl font-semibold text-white mb-6">{category.name}</h1>
      {list.length === 0 ? (
        <div className="card p-8 text-muted text-center">
          No templates in this category.{" "}
          <Link href={`/app/templates/new?category=${id}`} className="link-primary hover:underline">
            Create one
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {list.map((t) => (
            <li key={t.id}>
              <Link
                href={`/app/templates/${t.id}`}
                className="block rounded-xl border border-app bg-surface-elevated hover:border-[#333] p-4"
              >
                <h2 className="font-display font-medium text-white">{t.title}</h2>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

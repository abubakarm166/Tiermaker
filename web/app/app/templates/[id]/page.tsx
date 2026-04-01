"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchTemplate } from "@/lib/api";
import { mediaSrc } from "@/lib/media";
import type { Template } from "@/types/api";

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchTemplate(id)
      .then((res) => {
        if (!cancelled) setTemplate(res);
      })
      .catch(() => {
        if (!cancelled) setTemplate(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <div className="text-muted py-12 text-center">Loading…</div>;
  if (!template)
    return (
      <div className="card p-8 text-muted">
        Template not found.
      </div>
    );

  return (
    <div className="relative">
      {/* ambient glow behind content */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#FF9F1C33] blur-3xl" />

      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-xl border border-app bg-surface px-3 py-1.5 text-xs font-medium text-muted-strong hover:bg-white/5"
            >
              <span className="text-lg leading-none">←</span>
              Back
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => router.push(`/app/templates/${id}/edit`)}
            >
              Edit template
            </button>
            <Link href={`/app/lists/new?template=${id}`} className="btn-primary text-sm px-5">
              Use this template
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-app bg-[#101010]/95 px-6 py-6 md:px-8 md:py-7 shadow-[0_18px_60px_rgba(0,0,0,0.85)]">
          <div className="absolute pointer-events-none inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF9F1C] to-transparent opacity-70" />

          <div className="flex flex-col gap-5 md:flex-row md:items-start">
            <div className="md:w-1/3">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#202020] bg-surface-elevated">
                {template.thumbnail ? (
                  // template thumbnail
                  <img
                    src={mediaSrc(template.thumbnail)}
                    alt={template.title}
                    className="h-full w-full object-cover"
                  />
                ) : template.items && template.items.length > 0 ? (
                  // simple collage of first few items
                  <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[1px] bg-[#111]">
                    {template.items.slice(0, 4).map((item) => (
                      <div key={item.id} className="relative bg-surface-elevated">
                        {item.image ? (
                          <img
                            src={mediaSrc(item.image)}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-strong">
                            {item.name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-strong text-xs uppercase tracking-[0.18em]">
                    Template preview
                  </div>
                )}
              </div>
            </div>

            <div className="md:flex-1 space-y-3">
              <p className="inline-flex items-center rounded-full bg-[#1a1a1a] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-strong">
                Tier template
              </p>

              <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
                {template.title}
              </h1>

              {template.category_name && (
                <p className="text-sm text-muted-strong">
                  Category: <span className="text-primary">{template.category_name}</span>
                </p>
              )}

              {template.description && (
                <p className="text-sm text-muted max-w-xl">
                  {template.description}
                </p>
              )}

              <div className="mt-4 grid gap-3 text-xs text-muted-strong sm:grid-cols-3">
                <div className="rounded-2xl bg-[#151515] border border-[#262626] px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-strong">
                    Visibility
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {template.visibility === "PUBLIC" ? "Public" : "Private"}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#151515] border border-[#262626] px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-strong">
                    Rows
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {template.tier_rows?.length ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#151515] border border-[#262626] px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-strong">
                    Items
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {template.items?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {template.tier_rows && template.tier_rows.length > 0 && (
            <div className="mt-8 border-t border-[#262626] pt-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-strong mb-3">
                Tier rows
              </p>
              <div className="flex flex-wrap gap-2">
                {template.tier_rows
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((row) => (
                    <span
                      key={row.id}
                      className="inline-flex items-center rounded-full border border-[#333] bg-[#151515] px-3 py-1 text-xs font-medium text-white"
                      style={{ borderColor: row.color, boxShadow: `0 0 0 1px ${row.color}33` }}
                    >
                      <span
                        className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold text-black"
                        style={{ backgroundColor: row.color }}
                      >
                        {row.label.charAt(0)}
                      </span>
                      {row.label}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {template.items && template.items.length > 0 && (
            <div className="mt-8 border-t border-[#262626] pt-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-strong mb-3">
                Items in this template
              </p>
              <div className="grid gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {template.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-center gap-2 rounded-2xl bg-[#151515] border border-[#262626] px-2 py-3"
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-[#333] bg-surface-elevated">
                      {item.image ? (
                        <img
                          src={mediaSrc(item.image)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-strong text-center px-1">
                          {item.name}
                        </div>
                      )}
                    </div>
                    <p className="w-full truncate text-center text-[11px] text-muted-strong">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

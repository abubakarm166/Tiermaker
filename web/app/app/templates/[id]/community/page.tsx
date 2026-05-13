"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchTemplate } from "@/lib/api";
import CommunityRankingView from "@/components/templates/CommunityRankingView";
import type { Template } from "@/types/api";

export default function TemplateCommunityRankingPage() {
  const params = useParams();
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

  if (loading) {
    return <div className="text-muted py-12 text-center">Loading…</div>;
  }

  if (!template) {
    return (
      <div className="card p-8 text-muted">
        Template not found.{" "}
        <Link href="/app/templates" className="text-[#FF9F1C] hover:underline">
          Browse templates
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#FF9F1C33] blur-3xl" />

      <div className="relative flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/app/templates/${id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-app bg-surface px-3 py-1.5 text-xs font-medium text-muted-strong hover:bg-white/5"
          >
            <span className="text-lg leading-none">←</span>
            Back to template
          </Link>
        </div>

        <header className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-strong">
            Community ranking
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight">{template.title}</h1>
          <p className="text-sm text-muted max-w-2xl">
            Public tier lists built from this template by the community. Open a card to view the full list or react.
          </p>
        </header>

        <CommunityRankingView templateId={id} />
      </div>
    </div>
  );
}

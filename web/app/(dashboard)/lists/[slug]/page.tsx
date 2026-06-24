"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchList,
  fetchRelatedLists,
  deleteList,
  exportListPng,
  reactToList,
  ApiError,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { mediaSrc } from "@/lib/media";
import { TierListCardCaption } from "@/components/TierListCardCaption";
import type { TierList, ReactionType } from "@/types/api";

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "laugh", emoji: "😂", label: "Laugh" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
];

const getContrastTextColor = (hex: string) => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
};

export default function ListDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const [list, setList] = useState<TierList | null>(null);
  const [related, setRelated] = useState<TierList[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reacting, setReacting] = useState(false);
  useAuth();

  useEffect(() => {
    if (!slug || slug === "undefined") {
      router.replace("/lists");
      return;
    }
    let cancelled = false;
    fetchList(slug)
      .then((l) => {
        if (!cancelled) setList(l);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load list");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, router]);

  useEffect(() => {
    if (!slug || slug === "undefined") return;
    let cancelled = false;
    setRelatedLoading(true);
    fetchRelatedLists(slug, 9)
      .then((res) => {
        if (!cancelled) setRelated(res);
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const canEdit = Boolean(list?.can_edit);

  const handleDelete = async () => {
    if (!slug || !list || !window.confirm("Delete this tier list?")) return;
    setDeleting(true);
    try {
      await deleteList(slug);
      router.push("/lists");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleReact = async (reactionType: ReactionType | null) => {
    if (!slug || !list) return;
    setReacting(true);
    try {
      const updated = await reactToList(slug, reactionType);
      setList((prev) =>
        prev
          ? {
              ...prev,
              reaction_counts: updated.reaction_counts ?? prev.reaction_counts,
              my_reaction: updated.my_reaction,
            }
          : updated
      );
    } finally {
      setReacting(false);
    }
  };

  const handleExport = async () => {
    if (!slug) return;
    setExporting(true);
    try {
      const blob = await exportListPng(slug);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tierlist-${slug}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (loading)
    return (
      <div className="text-muted py-8 text-center">Loading…</div>
    );
  if (error || !list) {
    return (
      <div className="card p-6 text-primary">
        {error || "List not found"}
        <Link
          href="/lists"
          className="block mt-2 text-primary hover:underline"
        >
          Back to my lists
        </Link>
      </div>
    );
  }

  const template = list.template_detail;
  const rawRows = template?.tier_rows ?? [];
  const rowOrder =
    list.row_order ?? rawRows.map((r: { label: string }) => r.label);
  const labelOverrides = list.label_overrides ?? {};
  const customRows = list.custom_rows ?? [];
  const rows: { key: string; label: string; color: string }[] = (() => {
    const byLabel = Object.fromEntries(
      rawRows.map((r: { label: string; color: string }) => [r.label, r])
    );
    const customByLabel = Object.fromEntries(
      customRows.map((c: { label: string; color: string }) => [c.label, c])
    );
    const out: { key: string; label: string; color: string }[] = [];
    for (const key of rowOrder) {
      const templateRow = byLabel[key];
      if (templateRow)
        out.push({
          key,
          label: labelOverrides[key] ?? templateRow.label,
          color: templateRow.color,
        });
      else {
        const custom = customByLabel[key];
        if (custom)
          out.push({
            key: custom.label,
            label: labelOverrides[custom.label] ?? custom.label,
            color: custom.color,
          });
      }
    }
    return out;
  })();
  const items = template?.items ?? [];
  const assignments = list.tier_assignments ?? {};

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-white">
            {list.title}
          </h1>
          {template && (
            <Link
              href={`/templates/${template.slug}`}
              className="text-muted hover:text-white text-sm mt-1 inline-block"
            >
              Template: {template.title}
            </Link>
          )}
        </div>
        {list.visibility === "PUBLIC" && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-muted text-sm">React:</span>
            {REACTIONS.map(({ type, emoji, label }) => {
              const count = list.reaction_counts?.[type] ?? 0;
              const isActive = list.my_reaction === type;
              return (
                <button
                  key={type}
                  type="button"
                  title={label}
                  disabled={reacting}
                  onClick={() => handleReact(isActive ? null : type)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${isActive ? "bg-[#FF9F1C]/20 text-[#ffb84d]" : "text-muted hover:bg-white/10 hover:text-white"}`}
                >
                  {emoji}
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExport}
            className="btn-primary"
            disabled={exporting}
          >
            {exporting ? "Exporting…" : "Export PNG"}
          </button>
          {canEdit ? (
            <>
              <Link
                href={`/lists/${slug}/edit`}
                className="btn-secondary"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className="btn-secondary text-primary hover:bg-[#FF9F1C]/10"
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </>
          ) : template ? (
            <Link
              href={`/lists/new?template=${template.slug}`}
              className="btn-secondary"
            >
              Create this tier list
            </Link>
          ) : null}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="divide-y divide-[#202020]">
          {rows.map((row) => (
            <div
              key={row.key}
              className="flex items-center gap-4 p-4"
            >
              <span
                className="inline-flex h-11 min-w-[132px] shrink-0 items-center justify-center rounded-lg px-3 text-sm font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: row.color,
                  color: getContrastTextColor(row.color),
                }}
              >
                {row.label}
              </span>
              <div className="h-10 w-px bg-white/10 shrink-0" />
              <div className="flex flex-wrap gap-2 min-h-[60px]">
                {(assignments[row.key] ?? []).map((itemId) => {
                  const item = items.find((i) => i.id === itemId);
                  return item ? (
                    <div
                      key={item.id}
                      className="w-14 h-14 rounded-lg overflow-hidden bg-surface-elevated shrink-0"
                    >
                      {item.image ? (
                        <img
                          src={mediaSrc(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="flex items-center justify-center h-full text-muted-strong text-xs px-1 text-center">
                          {item.name}
                        </span>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      {!canEdit && template && (
        <div className="mt-8 text-center">
          <Link
            href={`/lists/new?template=${template.slug}`}
            className="btn-primary inline-flex px-6 py-3"
          >
            Create this tier list
          </Link>
          <p className="text-muted-strong text-sm mt-2">
            Make your own ranking using the same template.
          </p>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl font-semibold text-white mb-3">
          You might also like
        </h2>
        <p className="text-muted text-sm mb-5">
          More tier lists made with the same template.
        </p>
        {relatedLoading ? (
          <div className="text-muted py-6 text-center">Loading…</div>
        ) : related.length === 0 ? (
          <div className="card p-6 text-muted text-sm">
            No other public tier lists for this template yet.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rl) => {
              const thumb = rl.thumbnail ?? rl.template_detail?.thumbnail;
              return (
                <li key={rl.id}>
                  <div className="rounded-xl overflow-hidden border border-app bg-surface-elevated">
                    <Link
                      href={`/lists/${rl.slug}`}
                      className="block aspect-[4/3] relative bg-surface-elevated overflow-hidden"
                    >
                      {thumb ? (
                        <img
                          src={mediaSrc(thumb)}
                          alt=""
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-strong text-2xl font-display font-semibold">
                          {rl.title?.charAt(0) || "?"}
                        </div>
                      )}
                      <TierListCardCaption
                        title={rl.title}
                        subtitle="Community member"
                        subtitleTone="muted"
                      />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

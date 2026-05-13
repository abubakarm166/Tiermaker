"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchList, fetchTierListsForTemplate } from "@/lib/api";
import { mediaSrc } from "@/lib/media";
import TierListBoardReadOnly from "@/components/TierListBoardReadOnly";
import type { TierList } from "@/types/api";

function TierGridIcon({ className }: { className?: string }) {
  const cells: { x: number; y: number; fill: string }[] = [];
  const palette = ["#e11d48", "#f97316", "#eab308", "#22c55e", "#6b7280"];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const fill = palette[Math.min(row + (col < 2 ? 0 : 1), palette.length - 1)];
      cells.push({ x: col * 4, y: row * 4, fill });
    }
  }
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 16 16" aria-hidden>
      {cells.map((c, i) => (
        <rect
          key={i}
          x={c.x + 0.2}
          y={c.y + 0.2}
          width="3.2"
          height="3.2"
          rx="0.4"
          fill={c.fill}
        />
      ))}
    </svg>
  );
}

export function CommunityRankingPageLink({ templateId }: { templateId: string }) {
  return (
    <Link
      href={`/app/templates/${templateId}/community`}
      className="inline-flex items-center gap-2 rounded-xl border border-[#3d3d3d] bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#151515] hover:border-[#555]"
    >
      <TierGridIcon className="shrink-0 opacity-95" />
      Community ranking
    </Link>
  );
}

export default function CommunityRankingView({ templateId }: { templateId: string }) {
  const [lists, setLists] = useState<TierList[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [spotlightId, setSpotlightId] = useState<number | null>(null);
  const [spotlightFull, setSpotlightFull] = useState<TierList | null>(null);
  const [spotlightLoading, setSpotlightLoading] = useState(false);

  useEffect(() => {
    setPage(1);
    setLists([]);
    setHasNext(false);
    setSpotlightId(null);
    setSpotlightFull(null);
  }, [templateId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTierListsForTemplate(templateId, page)
      .then((res) => {
        if (cancelled) return;
        setHasNext(Boolean(res.next));
        setLists((prev) => (page === 1 ? res.results : [...prev, ...res.results]));
      })
      .catch(() => {
        if (!cancelled) {
          if (page === 1) setLists([]);
          setHasNext(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId, page]);

  useEffect(() => {
    if (lists.length === 0) {
      setSpotlightId(null);
      return;
    }
    setSpotlightId((prev) => {
      if (prev == null || !lists.some((l) => l.id === prev)) return lists[0].id;
      return prev;
    });
  }, [lists]);

  useEffect(() => {
    if (spotlightId == null) {
      setSpotlightFull(null);
      return;
    }
    let cancelled = false;
    setSpotlightLoading(true);
    fetchList(String(spotlightId))
      .then((l) => {
        if (!cancelled) setSpotlightFull(l);
      })
      .catch(() => {
        if (!cancelled) setSpotlightFull(null);
      })
      .finally(() => {
        if (!cancelled) setSpotlightLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [spotlightId]);

  const openNextList = useCallback(() => {
    if (lists.length < 2) return;
    const idx = lists.findIndex((l) => l.id === spotlightId);
    const next = lists[(Math.max(0, idx) + 1) % lists.length];
    setSpotlightId(next.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lists, spotlightId]);

  /** Pick a different list at random (stay on community page; does not open the editor). */
  const openRandomList = useCallback(() => {
    if (lists.length < 2) return;
    const others = lists.filter((l) => l.id !== spotlightId);
    if (others.length === 0) return;
    const pick = others[Math.floor(Math.random() * others.length)];
    setSpotlightId(pick.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [lists, spotlightId]);

  const initialLoading = loading && page === 1 && lists.length === 0;
  const cardLists = spotlightId != null ? lists.filter((l) => l.id !== spotlightId) : lists;
  const spotlightSummary = lists.find((l) => l.id === spotlightId);

  return (
    <div className="space-y-10">
      {initialLoading ? (
        <div className="text-muted py-12 text-center">Loading community lists…</div>
      ) : lists.length === 0 ? (
        <div className="rounded-2xl border border-[#262626] bg-[#151515] px-6 py-10 text-center text-muted">
          No public tier lists for this template yet. Be the first to publish one.
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/app/templates/${templateId}`}
                className="inline-flex items-center justify-center rounded-xl border border-[#3b82f6] bg-[#1e3a5f] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#2563eb]/40 transition-colors"
              >
                Go to template
              </Link>
              <button
                type="button"
                title="Show another random public list from this template"
                onClick={openRandomList}
                disabled={lists.length < 2 || spotlightId == null}
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-black shadow transition-colors ${
                  lists.length >= 2 && spotlightId != null
                    ? "bg-[#FF9F1C] hover:bg-[#e58e18]"
                    : "bg-[#FF9F1C]/40 cursor-not-allowed opacity-50"
                }`}
              >
                Remix
              </button>
              {lists.length > 1 && (
                <button
                  type="button"
                  onClick={openNextList}
                  className="inline-flex items-center justify-center rounded-xl border border-[#444] bg-[#151515] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                >
                  Open another list
                </button>
              )}
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-app bg-[#101010]/95 px-6 py-6 md:px-8 md:py-7 shadow-[0_18px_60px_rgba(0,0,0,0.85)]">
              <div className="absolute pointer-events-none inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF9F1C] to-transparent opacity-70" />

              {spotlightLoading || !spotlightFull?.template_detail ? (
                <div className="text-muted py-16 text-center">Loading featured list…</div>
              ) : (
                <>
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className="md:w-1/3">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#202020] bg-surface-elevated">
                        {(() => {
                          const boardThumb = spotlightFull.thumbnail;
                          const heroThumb =
                            boardThumb == null ? spotlightFull.template_detail?.thumbnail : null;
                          if (boardThumb) {
                            return (
                              <img
                                src={mediaSrc(boardThumb)}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover object-left object-top"
                              />
                            );
                          }
                          if (heroThumb) {
                            return (
                              <img
                                src={mediaSrc(heroThumb)}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            );
                          }
                          const items = spotlightFull.template_detail?.items ?? [];
                          if (items.length > 0) {
                            return (
                              <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[1px] bg-[#111]">
                                {items.slice(0, 4).map((item) => (
                                  <div key={item.id} className="relative bg-surface-elevated">
                                    {item.image ? (
                                      <img
                                        src={mediaSrc(item.image)}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-strong px-1 text-center">
                                        {item.name}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          return (
                            <div className="absolute inset-0 flex items-center justify-center text-muted-strong text-xs uppercase tracking-[0.18em]">
                              Preview
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="md:flex-1 space-y-3">
                      <p className="inline-flex items-center rounded-full bg-[#1a1a1a] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-strong">
                        Community list
                      </p>
                      <h2 className="text-2xl md:text-3xl font-semibold text-white leading-tight">
                        {spotlightFull.title}
                      </h2>
                      <p className="text-sm text-muted-strong">
                        By <span className="text-white">{spotlightSummary?.user_email ?? "—"}</span>
                      </p>
                      <div className="mt-4 grid gap-3 text-xs text-muted-strong sm:grid-cols-3">
                        <div className="rounded-2xl bg-[#151515] border border-[#262626] px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-strong">Visibility</p>
                          <p className="mt-1 text-sm text-white">{spotlightFull.visibility}</p>
                        </div>
                        <div className="rounded-2xl bg-[#151515] border border-[#262626] px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-strong">Tier rows</p>
                          <p className="mt-1 text-sm text-white">
                            {spotlightFull.template_detail?.tier_rows?.length ?? 0}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[#151515] border border-[#262626] px-3 py-2.5">
                          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-strong">Items</p>
                          <p className="mt-1 text-sm text-white">
                            {spotlightFull.template_detail?.items?.length ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {spotlightFull.template_detail?.tier_rows &&
                    spotlightFull.template_detail.tier_rows.length > 0 && (
                      <div className="mt-8 border-t border-[#262626] pt-6">
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-strong mb-3">
                          Tier rows
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {spotlightFull.template_detail.tier_rows
                            .slice()
                            .sort((a, b) => a.order - b.order)
                            .map((row) => (
                              <span
                                key={row.id}
                                className="inline-flex items-center rounded-full border border-[#333] bg-[#151515] px-3 py-1 text-xs font-medium text-white"
                                style={{
                                  borderColor: row.color,
                                  boxShadow: `0 0 0 1px ${row.color}33`,
                                }}
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

                  <div className="mt-8 border-t border-[#262626] pt-6">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-strong mb-3">
                      Rankings
                    </p>
                    <TierListBoardReadOnly list={spotlightFull} />
                  </div>

                  <div className="mt-6">
                    <Link
                      href={`/app/lists/${spotlightFull.id}`}
                      className="text-sm text-[#FF9F1C] hover:underline"
                    >
                      Open full list page →
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>

          {cardLists.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-1">More tier lists</h2>
              <p className="text-sm text-muted mb-5">Other public lists from this template.</p>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cardLists.map((list) => {
                  /** Only the server-generated board snapshot — template hero / first-item fallbacks are wrong aspect and look broken in cards. */
                  const thumb = list.thumbnail;
                  const author = list.user_email ?? "Creator";
                  const initial = author.charAt(0).toUpperCase();
                  const titleInitial = (list.title?.trim().charAt(0) || "?").toUpperCase();
                  return (
                    <li key={list.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSpotlightId(list.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group w-full text-left rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#141414] hover:border-[#FF9F1C]/50 transition-colors"
                      >
                        <div className="aspect-[4/3] relative w-full overflow-hidden bg-[#0a0a0a]">
                          {thumb ? (
                            <img
                              src={mediaSrc(thumb)}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover object-left object-top group-hover:scale-[1.02] transition-transform duration-200"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] px-3 text-center">
                              <span className="text-3xl font-semibold text-white/90">{titleInitial}</span>
                              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-strong">
                                No preview yet
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3 p-3 items-start">
                          <div
                            className="h-9 w-9 shrink-0 rounded-full border border-[#333] bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center text-xs font-semibold text-white"
                            title={author}
                          >
                            {initial}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-strong truncate" title={author}>
                              {author}
                            </p>
                            <p className="text-sm font-medium text-white truncate group-hover:text-[#FF9F1C] transition-colors">
                              {list.title}
                            </p>
                            <p className="text-[11px] text-[#FF9F1C]/90 mt-1">Click to feature above</p>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {hasNext && (
            <div className="flex justify-center">
              <button
                type="button"
                className="btn-secondary text-sm"
                disabled={loading}
                onClick={() => setPage((p) => p + 1)}
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}

      <div className="flex justify-center pt-2">
        <Link href={`/app/lists/new?template=${templateId}`} className="btn-primary text-sm px-6">
          Create a tier list
        </Link>
      </div>
    </div>
  );
}

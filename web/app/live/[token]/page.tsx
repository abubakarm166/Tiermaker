"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiError,
  fetchLiveEvent,
  fetchLiveState,
  liveHostEnd,
  liveHostPause,
  liveHostResume,
  liveJoin,
  liveNextItem,
  liveVote,
} from "@/lib/api";
import { mediaSrc } from "@/lib/media";
import { RecentLiveEventsForTemplateSection } from "@/components/live/RecentLiveEventsForTemplate";
import { useAuth } from "@/contexts/AuthContext";
import type { LiveEventDetail, LiveNextItemResponse, LiveState, LiveStateItem } from "@/types/api";

function parseIsoMs(raw: string | undefined | null): number | null {
  if (raw == null || String(raw).trim() === "") return null;
  let s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2} \d/.test(s)) {
    s = s.replace(" ", "T");
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s += "Z";
  }
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

export default function LiveEventPage() {
  const params = useParams();
  const token = params.token as string;
  const { user, loading: authLoading } = useAuth();

  const [detail, setDetail] = useState<LiveEventDetail | null>(null);
  const [liveState, setLiveState] = useState<LiveState | null>(null);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [queue, setQueue] = useState<LiveNextItemResponse | null>(null);
  const [error, setError] = useState("");
  const [voteBusy, setVoteBusy] = useState(false);
  /** Gallery selection; null = use suggested next item from server. */
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());
  /** Invalidates in-flight /next-item/ responses so an older request cannot overwrite a newer queue. */
  const queueFetchGen = useRef(0);

  const loadDetail = useCallback(() => {
    return fetchLiveEvent(token).then(setDetail).catch(() => setDetail(null));
  }, [token]);

  const loadState = useCallback(() => {
    return fetchLiveState(token).then(setLiveState).catch(() => {});
  }, [token]);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    const t = window.setInterval(loadState, 2800);
    return () => clearInterval(t);
  }, [loadState, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setDetail(null);
      setSessionKey(null);
      setError("");
      return;
    }
    let cancelled = false;
    setError("");
    (async () => {
      try {
        const d = await fetchLiveEvent(token);
        if (cancelled) return;
        setDetail(d);
        try {
          const res = await liveJoin(token);
          if (cancelled) return;
          setSessionKey(res.session_key);
        } catch (joinErr) {
          if (cancelled) return;
          setSessionKey(null);
          setError(
            joinErr instanceof ApiError
              ? joinErr.message
              : "Could not join this live session."
          );
        }
      } catch {
        if (!cancelled) {
          setDetail(null);
          setError("This live event could not be loaded. Check the link or whether it has ended.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user, authLoading]);

  useEffect(() => {
    if (!sessionKey || !liveState?.voting_open) {
      queueFetchGen.current += 1;
      setQueue(null);
      return;
    }
    const gen = ++queueFetchGen.current;
    liveNextItem(token, sessionKey)
      .then((q) => {
        if (gen !== queueFetchGen.current) return;
        setQueue(q);
      })
      .catch(() => {
        if (gen !== queueFetchGen.current) return;
        setQueue(null);
      });
  }, [token, sessionKey, liveState?.voting_open]);

  const votedIdSet = useMemo(() => new Set(queue?.voted_item_ids ?? []), [queue?.voted_item_ids]);

  useEffect(() => {
    if (queue?.done) setSelectedItemId(null);
  }, [queue?.done]);

  const itemById = useMemo(() => {
    const m = new Map<number, LiveState["items"][0]>();
    for (const it of liveState?.items ?? []) m.set(it.item_id, it);
    return m;
  }, [liveState?.items]);

  const refreshQueue = useCallback(() => {
    if (!sessionKey) return Promise.resolve();
    const gen = ++queueFetchGen.current;
    return liveNextItem(token, sessionKey)
      .then((q) => {
        if (gen !== queueFetchGen.current) return;
        setQueue(q);
      })
      .catch(() => {
        if (gen !== queueFetchGen.current) return;
        setQueue(null);
      });
  }, [token, sessionKey]);

  const effectiveVoteId = selectedItemId ?? queue?.item?.id ?? null;

  const displayVoteItem = useMemo(() => {
    if (!effectiveVoteId) return null;
    const st = itemById.get(effectiveVoteId);
    if (st) return { id: st.item_id, name: st.name, image: st.image };
    if (queue?.item?.id === effectiveVoteId) return queue.item;
    return null;
  }, [effectiveVoteId, itemById, queue?.item]);

  const alreadyVotedOnSelection = Boolean(effectiveVoteId != null && votedIdSet.has(effectiveVoteId));

  const canSubmitTierVote = Boolean(
    liveState?.voting_open &&
      queue &&
      !queue.done &&
      effectiveVoteId != null &&
      !alreadyVotedOnSelection &&
      !voteBusy
  );

  const handleVote = async (tierLabel: string | null, skip: boolean) => {
    if (!sessionKey || effectiveVoteId == null || voteBusy) return;
    setVoteBusy(true);
    setError("");
    try {
      await liveVote(token, {
        session_key: sessionKey,
        template_item_id: effectiveVoteId,
        tier_label: skip ? undefined : tierLabel ?? undefined,
        skip,
      });
      setSelectedItemId(null);
      await refreshQueue();
      void loadState();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Vote failed");
    } finally {
      setVoteBusy(false);
    }
  };

  const handlePickGalleryItem = (itemId: number) => {
    if (queue?.done) return;
    if (liveState != null && !liveState.voting_open) return;
    setSelectedItemId(itemId);
  };

  const isHost = Boolean(user?.email && detail?.host_email && user.email === detail.host_email);

  const endsMs = detail ? parseIsoMs(detail.ends_at) : null;
  const startsMs = detail ? parseIsoMs(detail.starts_at) : null;
  const remainMs = endsMs != null ? Math.max(0, endsMs - nowTick) : null;
  const untilStartMs = startsMs != null ? Math.max(0, startsMs - nowTick) : 0;

  const formatRemain = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${d}d ${h}h ${m}m ${sec}s`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-muted">Loading…</p>
        <Link href="/live" className="text-sm text-muted hover:text-[#FF9F1C] hover:underline">
          Back to Live hub
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 gap-4 text-center max-w-md">
        <p className="text-white">
          Sign in to view this live session and vote. After signing in, you&apos;ll return to this page automatically.
        </p>
        <Link
          href={`/login?next=${encodeURIComponent(`/live/${token}`)}`}
          className="inline-flex min-w-[160px] justify-center rounded-xl bg-[#FF9F1C] px-6 py-3 text-sm font-semibold text-black hover:bg-[#e58e18]"
        >
          Sign in
        </Link>
        <Link href="/live" className="text-sm text-muted hover:text-[#FF9F1C] hover:underline">
          Back to Live hub
        </Link>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <p className="text-muted mb-4">{error || "Loading event…"}</p>
        <Link href="/live" className="text-[#FF9F1C] hover:underline">
          Back to Live hub
        </Link>
      </div>
    );
  }

  const locked = liveState?.locked ?? detail.summary.locked;
  /** Host must not see pause/resume/end once the room is finished (backend flag, status, or clock). */
  const eventOver =
    locked ||
    detail.status === "ENDED" ||
    (endsMs != null && endsMs <= nowTick);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-[#222] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link href="/live" className="text-sm text-muted hover:text-[#FF9F1C]">
          ← Live hub
        </Link>
        <div className="text-xs text-muted font-mono truncate max-w-[200px]">{typeof window !== "undefined" ? window.location.href : ""}</div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#FF9F1C] mb-1">TierMaker Live</p>
            <h1 className="text-2xl md:text-3xl font-semibold">{detail.title}</h1>
            <p className="text-sm text-muted mt-1">
              Template: <span className="text-white">{detail.template_title}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-[#333] bg-[#111] px-4 py-3 text-sm space-y-1">
            <div className="flex justify-between gap-8">
              <span className="text-muted">Time left</span>
              <span className="font-mono text-[#ffb84d]">
                {locked ? "Ended" : remainMs != null ? formatRemain(remainMs) : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted">Participants</span>
              <span>{liveState?.total_participants ?? detail.summary.total_participants}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-muted">Votes cast</span>
              <span>{liveState?.total_votes ?? detail.summary.total_votes}</span>
            </div>
          </div>
        </div>

        {untilStartMs > 0 && (
          <div className="mb-6 rounded-xl border border-amber-900/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
            Voting opens in <strong>{formatRemain(untilStartMs)}</strong>
          </div>
        )}

        {isHost && (
          <div className="mb-8 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted mr-2">Host:</span>
            {!eventOver && (
              <>
                <button
                  type="button"
                  className="rounded-lg border border-[#444] px-3 py-1.5 text-sm hover:bg-white/5"
                  onClick={async () => {
                    try {
                      await liveHostPause(token);
                      loadDetail();
                      loadState();
                    } catch (e) {
                      setError(e instanceof ApiError ? e.message : "Pause failed");
                    }
                  }}
                >
                  Pause
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-[#444] px-3 py-1.5 text-sm hover:bg-white/5"
                  onClick={async () => {
                    try {
                      await liveHostResume(token);
                      loadDetail();
                      loadState();
                    } catch (e) {
                      setError(e instanceof ApiError ? e.message : "Resume failed");
                    }
                  }}
                >
                  Resume
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-900/50 px-3 py-1.5 text-sm text-red-300 hover:bg-red-950/40"
                  onClick={async () => {
                    if (!window.confirm("End this event for everyone?")) return;
                    try {
                      await liveHostEnd(token);
                      loadDetail();
                      loadState();
                    } catch (e) {
                      setError(e instanceof ApiError ? e.message : "End failed");
                    }
                  }}
                >
                  End event
                </button>
              </>
            )}
            <button
              type="button"
              className="rounded-lg border border-[#444] px-3 py-1.5 text-sm hover:bg-white/5"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
            >
              Copy invite link
            </button>
          </div>
        )}

        {error && <div className="mb-4 rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-2 text-sm text-red-200">{error}</div>}

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-medium mb-3">Live board</h2>
            <p className="text-xs text-muted mb-4">Items grouped by community average (updates every few seconds).</p>
            <BoardRows tierRows={detail.tier_rows} board={liveState?.board ?? {}} itemById={itemById} />
          </div>

          <div>
            <h2 className="text-lg font-medium mb-3">Your vote</h2>
            {liveState && (
              <VoteTotalsByTier
                tierRows={detail.tier_rows}
                tierVoteCounts={liveState.tier_vote_counts}
                totalVotes={liveState.total_votes}
              />
            )}
            {!liveState?.voting_open && !locked && (
              <p className="text-muted text-sm mb-4">Waiting for voting to open…</p>
            )}
            {locked && <p className="text-muted text-sm mb-4">This event is closed. Final rankings are shown on the board.</p>}
            {liveState?.voting_open && queue && !queue.done && displayVoteItem && (
              <div className="rounded-2xl border border-[#333] bg-[#101010] p-4">
                <div className="aspect-video w-full overflow-hidden rounded-xl bg-black mb-4 flex items-center justify-center">
                  {displayVoteItem.image ? (
                    <img
                      key={displayVoteItem.id}
                      src={mediaSrc(displayVoteItem.image)}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-muted">{displayVoteItem.name}</span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-center mb-1">{displayVoteItem.name}</h3>
                <p className="text-center text-xs text-muted mb-4">
                  {alreadyVotedOnSelection
                    ? "You already voted on this item — choose another thumbnail."
                    : selectedItemId != null
                      ? "Voting on your selection — pick a tier or skip."
                      : `Suggested next: step ${queue.progress_index + 1} of ${queue.progress_total} — or tap any item below.`}
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {detail.tier_rows
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((row) => (
                      <button
                        key={row.label}
                        type="button"
                        disabled={voteBusy || !canSubmitTierVote}
                        onClick={() => handleVote(row.label, false)}
                        className="min-w-[44px] rounded-lg px-3 py-2 text-sm font-semibold text-black shadow disabled:opacity-40"
                        style={{ backgroundColor: row.color }}
                      >
                        {row.label}
                      </button>
                    ))}
                  <button
                    type="button"
                    disabled={voteBusy || !canSubmitTierVote}
                    onClick={() => handleVote(null, true)}
                    className="rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-200 hover:bg-red-950 disabled:opacity-40"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
            {liveState?.voting_open && queue?.done && (
              <div className="rounded-xl border border-green-900/40 bg-green-950/30 px-4 py-6 text-center text-green-100">
                You&apos;ve voted on all items in your queue. Keep watching the board update as others vote.
              </div>
            )}
          </div>
        </div>

        {liveState?.items && liveState.items.length > 0 && (
          <AllItemsPool
            items={liveState.items}
            queueFinished={Boolean(queue?.done)}
            highlightedItemId={queue?.done ? undefined : effectiveVoteId ?? undefined}
            votedItemIds={queue?.voted_item_ids ?? []}
            onPickItem={handlePickGalleryItem}
            disabled={(liveState != null && !liveState.voting_open) || Boolean(queue?.done)}
          />
        )}

        <div className="mt-10">
          <RecentLiveEventsForTemplateSection
            templateId={detail.template_id}
            excludeLiveEventId={detail.id}
            variant="live"
          />
        </div>

        <div className="mt-12 border-t border-[#222] pt-8 text-center text-sm text-muted">
          <Link href={`/app/templates/${detail.template_id}`} className="text-[#FF9F1C] hover:underline">
            View template
          </Link>
          {" · "}
          <span>Hosted by {detail.host_email ?? "—"}</span>
        </div>
      </div>
    </div>
  );
}

function VoteTotalsByTier({
  tierRows,
  tierVoteCounts,
  totalVotes,
}: {
  tierRows: LiveEventDetail["tier_rows"];
  tierVoteCounts: Record<string, number> | undefined;
  totalVotes: number;
}) {
  const sorted = [...tierRows].sort((a, b) => a.order - b.order);
  const counts = tierVoteCounts ?? {};
  return (
    <div className="rounded-2xl border border-[#333] bg-[#101010] p-4 mb-4">
      <h3 className="text-xs uppercase tracking-[0.15em] text-muted mb-3">Total votes (session)</h3>
      <div className="space-y-2">
        {sorted.map((row) => {
          const n = counts[row.label] ?? 0;
          const pct = totalVotes > 0 ? Math.round((n / totalVotes) * 1000) / 10 : 0;
          return (
            <div key={row.label}>
              <div className="flex justify-between text-xs gap-2 mb-1">
                <span className="font-semibold" style={{ color: row.color }}>
                  {row.label}
                </span>
                <span className="text-muted tabular-nums">
                  ({n}) {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#222] overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: row.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AllItemsPool({
  items,
  queueFinished,
  highlightedItemId,
  votedItemIds,
  onPickItem,
  disabled,
}: {
  items: LiveStateItem[];
  queueFinished: boolean;
  /** Item currently shown in the vote panel. */
  highlightedItemId: number | undefined;
  votedItemIds: number[];
  onPickItem: (itemId: number) => void;
  disabled: boolean;
}) {
  const voted = useMemo(() => new Set(votedItemIds), [votedItemIds]);
  return (
    <section className="mt-10 border-t border-[#222] pt-8">
      <h2 className="text-lg font-medium mb-4">All items</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => {
          const isHighlighted =
            !queueFinished && highlightedItemId != null && it.item_id === highlightedItemId;
          const hasVoted = !queueFinished && voted.has(it.item_id);
          const ringClass = isHighlighted
            ? "ring-2 ring-[#FF9F1C] ring-offset-2 ring-offset-black"
            : "border border-[#333] hover:border-[#555]";
          return (
            <button
              key={it.item_id}
              type="button"
              title={it.name}
              disabled={disabled}
              onClick={() => onPickItem(it.item_id)}
              className={`relative w-[68px] h-[68px] sm:w-[76px] sm:h-[76px] rounded-lg overflow-hidden bg-black shrink-0 transition-shadow text-left cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${ringClass} ${hasVoted ? "opacity-45" : ""}`}
            >
              {it.image ? (
                <img src={mediaSrc(it.image)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-center text-muted p-1 leading-tight">
                  {it.name}
                </div>
              )}
              {it.display_tier != null && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[9px] text-center text-white py-0.5 truncate px-0.5 pointer-events-none">
                  {it.display_tier}
                  {it.vote_count > 0 ? ` · ${it.vote_count}` : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function BoardRows({
  tierRows,
  board,
  itemById,
}: {
  tierRows: LiveEventDetail["tier_rows"];
  board: Record<string, number[]>;
  itemById: Map<number, LiveState["items"][0]>;
}) {
  const sorted = [...tierRows].sort((a, b) => a.order - b.order);
  const unrankedIds = board["unranked"] ?? [];
  return (
    <div className="space-y-3">
      {sorted.map((row) => (
        <TierBand key={row.label} label={row.label} color={row.color} ids={board[row.label] ?? []} itemById={itemById} />
      ))}
      {unrankedIds.length > 0 && (
        <TierBand label="Unranked (no votes yet)" color="#444444" ids={unrankedIds} itemById={itemById} />
      )}
    </div>
  );
}

function TierBand({
  label,
  color,
  ids,
  itemById,
}: {
  label: string;
  color: string;
  ids: number[];
  itemById: Map<number, LiveState["items"][0]>;
}) {
  return (
    <div className="rounded-xl border border-[#2a2a2a] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-black" style={{ backgroundColor: color }}>
        {label}
      </div>
      <div className="flex flex-wrap gap-2 p-3 bg-[#0d0d0d]">
        {ids.map((id) => {
          const it = itemById.get(id);
          return (
            <div key={id} className="w-14 h-14 rounded-lg overflow-hidden border border-[#333] bg-black relative">
              {it?.image ? (
                <img src={mediaSrc(it.image)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] text-center p-1">{it?.name ?? id}</div>
              )}
              {it?.average_score != null && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-[9px] text-center text-white">
                  {it.average_score.toFixed(1)}
                </span>
              )}
            </div>
          );
        })}
        {!ids.length && <span className="text-xs text-muted py-2">Empty</span>}
      </div>
    </div>
  );
}

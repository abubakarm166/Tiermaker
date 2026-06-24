"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchLiveBrowse } from "@/lib/api";
import { mediaSrc } from "@/lib/media";
import type { LiveBrowseResponse, LiveEventCard } from "@/types/api";

/** End time from API (snake_case or camelCase). */
function pickEndsAt(ev: LiveEventCard): string | undefined | null {
  const x = ev as LiveEventCard & { endsAt?: string };
  return x.ends_at ?? x.endsAt ?? null;
}

/** Parse API datetime (ISO 8601). Returns null if invalid. */
function parseUtcMs(iso: string | undefined | null): number | null {
  if (iso == null || String(iso).trim() === "") return null;
  let s = String(iso).trim();
  if (/^\d{4}-\d{2}-\d{2} \d/.test(s)) {
    s = s.replace(" ", "T");
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
      s += "Z";
    }
  }
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

function formatRemain(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${d}d ${h}h ${m}m ${sec}s`;
}

function LiveCard({
  ev,
  variant,
  now,
}: {
  ev: LiveEventCard;
  variant: "active" | "completed";
  now: number;
}) {
  const endMs = parseUtcMs(pickEndsAt(ev));
  const remainMs = endMs != null ? Math.max(0, endMs - now) : null;
  const ended =
    variant === "completed" ||
    ev.status === "ENDED" ||
    (endMs != null && endMs <= now);

  return (
    <Link
      href={ev.invite_url_path}
      className="group flex-shrink-0 w-[min(100%,280px)] rounded-xl border border-[#2a2a2a] bg-[#111] overflow-hidden hover:border-[#444] transition-colors snap-start"
    >
      <div className="relative aspect-square bg-[#0a0a0a]">
        {ev.thumbnail_url ? (
          <img
            src={mediaSrc(ev.thumbnail_url)}
            alt=""
            className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-semibold text-muted">
            {ev.title.charAt(0)}
          </div>
        )}
        <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-0.5 text-xs text-white">
          {ev.item_count} items
        </span>
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2">{ev.title}</h3>
        <p className="text-xs text-muted">
          Participants:{" "}
          <span className="text-[#ccc]">{Number(ev.participant_count ?? 0)}</span>
        </p>
        <p className="text-xs text-muted">
          Votes: <span className="text-[#ccc]">{Number(ev.vote_count ?? 0)}</span>
        </p>
        {!ended && remainMs !== null && (
          <p className="text-xs text-[#ffb84d] font-mono">
            Ends: {formatRemain(remainMs)}
          </p>
        )}
        {!ended && remainMs === null && (
          <p className="text-xs text-muted font-mono">Ends: —</p>
        )}
        {ended && (
          <p className="text-xs text-muted-strong uppercase tracking-wide">Ended</p>
        )}
      </div>
    </Link>
  );
}

function EventRow({
  title,
  events,
  variant,
  emptyHint,
  now,
}: {
  title: string;
  events: LiveEventCard[];
  variant: "active" | "completed";
  emptyHint: string;
  now: number;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-4 mb-4 px-1">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <span className="text-muted text-xs hidden sm:inline">Swipe / scroll →</span>
      </div>
      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#333] px-4 py-8 text-center text-sm text-muted">
          {emptyHint}
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {events.map((ev) => (
              <LiveCard key={`${title}-${ev.id}`} ev={ev} variant={variant} now={now} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export function LiveHubContent() {
  const [data, setData] = useState<LiveBrowseResponse | null>(null);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchLiveBrowse()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load live events.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-40 border-b border-[#222] bg-black/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/" className="text-xs text-muted hover:text-[#FF9F1C] mb-1 inline-block">
              ← Home
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-[#FF9F1C]">TierMaker Live</p>
            <h1 className="text-xl sm:text-2xl font-semibold">Browse live voting</h1>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              href="/live/create"
              className="inline-flex items-center justify-center rounded-xl bg-[#FF9F1C] px-5 py-3 text-sm font-semibold text-black hover:bg-[#e58e18] transition-colors shadow-lg shadow-orange-900/20"
            >
              Create live event
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-xl border border-[#444] px-4 py-3 text-sm text-muted-strong hover:bg-white/5"
            >
              Templates
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-sm text-muted max-w-2xl mb-10">
          Join a public session or host your own. Participants vote item-by-item; the board updates as votes come in.
        </p>

        {error && (
          <div className="mb-6 rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {!data && !error && (
          <div className="text-center text-muted py-16">Loading live events…</div>
        )}

        {data && (
          <>
            <EventRow
              title="Ending soon"
              events={data.ending_soon}
              variant="active"
              emptyHint="No upcoming sessions ending soon. Create one!"
              now={now}
            />
            <EventRow
              title="Most voted"
              events={data.most_voted}
              variant="active"
              emptyHint="No active events with votes yet."
              now={now}
            />
            <EventRow
              title="Popular completed events"
              events={data.popular_completed}
              variant="completed"
              emptyHint="No completed public events yet."
              now={now}
            />
          </>
        )}
      </div>
    </div>
  );
}

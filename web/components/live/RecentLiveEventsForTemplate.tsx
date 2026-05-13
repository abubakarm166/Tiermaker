"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchLiveEventsForTemplate } from "@/lib/api";
import { mediaSrc } from "@/lib/media";
import { useAuth } from "@/contexts/AuthContext";
import type { LiveEventCard } from "@/types/api";

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

function formatRemainShort(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  return `${m}m ${sec}s`;
}

function RecentLiveEventRow({ ev }: { ev: LiveEventCard }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const endMs = parseIsoMs(ev.ends_at);
  const ended = ev.status === "ENDED" || (endMs != null && endMs <= now);
  const remainMs = endMs != null && !ended ? Math.max(0, endMs - now) : null;
  const endsLabel = ended ? "Ended" : remainMs != null ? formatRemainShort(remainMs) : "—";

  return (
    <Link
      href={ev.invite_url_path}
      className="flex gap-4 rounded-2xl border border-[#262626] bg-[#151515] p-3 hover:border-[#3a3a3a] transition-colors"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#333] bg-black">
        {ev.thumbnail_url ? (
          <img src={mediaSrc(ev.thumbnail_url)} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-semibold text-muted-strong">
            {ev.title.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-1">
        <p className="font-semibold text-white truncate">{ev.title}</p>
        <p className="text-xs italic text-muted-strong">
          Participants: {ev.participant_count} · Votes: {ev.vote_count}
        </p>
        <p className="text-xs italic text-muted-strong">
          Ends:{" "}
          <span className={ended ? "text-muted-strong" : "text-white tabular-nums"}>{endsLabel}</span>
        </p>
      </div>
    </Link>
  );
}

export function RecentLiveEventsForTemplateSection({
  templateId,
  excludeLiveEventId,
  variant = "app",
}: {
  templateId: number | string;
  /** Omit this session from the list (e.g. current live room). */
  excludeLiveEventId?: number;
  /** `app` = TierMaker app chrome (template detail). `live` = live hub dark page. */
  variant?: "app" | "live";
}) {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<LiveEventCard[] | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      if (!authLoading && !user) setEvents([]);
      return;
    }
    let cancelled = false;
    const n = typeof templateId === "string" ? Number(templateId) : templateId;
    if (!Number.isFinite(n)) {
      setEvents([]);
      return;
    }
    fetchLiveEventsForTemplate(n)
      .then((res) => {
        if (!cancelled) setEvents(res.results);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [templateId, user, authLoading]);

  const visibleEvents = useMemo(() => {
    if (events == null) return null;
    if (excludeLiveEventId == null) return events;
    return events.filter((ev) => ev.id !== excludeLiveEventId);
  }, [events, excludeLiveEventId]);

  const shell =
    variant === "live"
      ? "rounded-2xl border border-[#333] bg-[#111] px-4 py-5 md:px-6 md:py-6"
      : "relative overflow-hidden rounded-3xl border border-app bg-[#101010]/95 px-6 py-6 md:px-8 md:py-7 shadow-[0_18px_60px_rgba(0,0,0,0.85)]";

  return (
    <div className={shell}>
      {variant === "app" && (
        <div className="absolute pointer-events-none inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF9F1C] to-transparent opacity-70" />
      )}
      <p
        className={
          variant === "live"
            ? "text-sm text-muted-strong mb-4"
            : "text-sm text-muted-strong mb-4"
        }
      >
        Recent live events that used this template:
      </p>
      {authLoading ? (
        <p className="text-xs text-muted">Loading…</p>
      ) : !user ? (
        <p className="text-xs text-muted">
          <Link href="/login" className="text-[#FF9F1C] hover:underline">
            Sign in
          </Link>{" "}
          to see live sessions for this template.
        </p>
      ) : visibleEvents === null ? (
        <p className="text-xs text-muted">Loading…</p>
      ) : visibleEvents.length === 0 ? (
        <p className="text-xs text-muted">
          {excludeLiveEventId != null && events && events.length > 0
            ? "No other public live sessions for this template right now."
            : "No public live sessions for this template yet."}
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
          {visibleEvents.map((ev) => (
            <RecentLiveEventRow key={ev.id} ev={ev} />
          ))}
        </div>
      )}
    </div>
  );
}

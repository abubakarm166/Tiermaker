"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchFeed } from "@/lib/api";
import type { TierList } from "@/types/api";

const TAB_KEYS = ["today", "yesterday", "thisweek"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const PERIOD_PARAM: Record<TabKey, string> = {
  today: "today",
  yesterday: "yesterday",
  thisweek: "this_week",
};

const POLL_MS = 45_000;

function authorFromEmail(email: string | null | undefined): string {
  if (!email) return "Community member";
  const local = email.split("@")[0];
  return local || email;
}

function formatTimeAgo(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const sec = Math.floor(diff / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "1 day ago";
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  if (w === 1) return "1 week ago";
  return `${w} weeks ago`;
}

function tierChipsFromList(list: TierList): { label: string; rank: number }[] {
  const assignments = list.tier_assignments ?? {};
  const order = list.row_order?.length ? list.row_order : [];
  const seen = new Set<string>();
  const labels: string[] = [];
  for (const label of order) {
    if (label && !seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  for (const label of Object.keys(assignments)) {
    if (!seen.has(label)) {
      seen.add(label);
      labels.push(label);
    }
  }
  const maxChips = 6;
  return labels.slice(0, maxChips).map((label) => {
    const raw = (list.label_overrides && list.label_overrides[label]) || label;
    const display = raw.length > 2 ? raw.slice(0, 2) : raw;
    const arr = assignments[label];
    const rank = Array.isArray(arr) ? arr.length : 0;
    return { label: display.toUpperCase(), rank };
  });
}

function totalPlacedItems(list: TierList): number {
  const a = list.tier_assignments ?? {};
  const ids = new Set<number>();
  for (const arr of Object.values(a)) {
    if (Array.isArray(arr)) arr.forEach((id) => ids.add(Number(id)));
  }
  return ids.size;
}

function RecentCard({ list, rank }: { list: TierList; rank: number }) {
  const avatars = tierChipsFromList(list);
  const items = totalPlacedItems(list);
  const author = authorFromEmail(list.user_email);
  const href = `/app/lists/${list.id}`;

  return (
    <Link href={href} className="recent_work_card_body recentwork_card_link">
      <div className="recent_work_card_top">
        <div className="recent_work_card_header">
          <h3 className="recent_work_card_title">{list.title}</h3>
          <p className="recent_work_card_author">
            <span>by</span> {author}
          </p>
        </div>
        <div className="recent_work_card_badge">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>#{rank}</span>
        </div>
      </div>
      <div className="recent_work_card_avatars">
        {avatars.length === 0 ? (
          <div className="recentwork_avatar_wrap">
            <span className="recentwork_avatar_rank">0</span>
            <div className="recentwork_avatar">—</div>
          </div>
        ) : (
          avatars.map((avatar, idx) => (
            <div key={`${list.id}-${idx}-${avatar.label}`} className="recentwork_avatar_wrap">
              <span className="recentwork_avatar_rank">{avatar.rank}</span>
              <div className="recentwork_avatar">{avatar.label}</div>
            </div>
          ))
        )}
      </div>
      <div className="recent_work_card_footer">
        <div className="recent_work_card_meta">
          <div className="recentwork_meta_item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {items} Items
          </div>
          <div className="recentwork_meta_item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {formatTimeAgo(list.created_at)}
          </div>
        </div>
        <span className="recentwork_view_btn">
          View List
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function WorkTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [lists, setLists] = useState<TierList[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    const period = PERIOD_PARAM[activeTab];
    return fetchFeed({ page: "1", page_size: "8", period })
      .then((res) => {
        setLists(res.results ?? []);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setLists((prev) => (prev === null ? [] : prev));
      });
  }, [activeTab]);

  useEffect(() => {
    setLists(null);
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const cards = lists ?? [];
  const showEmpty = lists !== null && cards.length === 0;

  return (
    <>
      {error && lists !== null && cards.length > 0 && (
        <p className="text-center text-xs text-amber-200/90 mb-3">Could not refresh — showing last lists.</p>
      )}
      <div className="worktabs_nav_wrap">
        <ul className="nav nav-pills" role="tablist">
          {TAB_KEYS.map((tab) => (
            <li className="nav-item" key={tab} role="presentation">
              <button
                className={`nav-link${activeTab === tab ? " active" : ""}`}
                onClick={() => setActiveTab(tab)}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
              >
                {tab === "today" ? "Today" : tab === "yesterday" ? "Yesterday" : "This Week"}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="recentwork_grid">
        {lists === null ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="recent_work_card_body animate-pulse opacity-60">
                <div className="recent_work_card_top">
                  <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                </div>
              </div>
            ))}
          </>
        ) : showEmpty ? (
          <div className="recent_work_card_body recentwork_grid_empty text-center py-10 text-muted">
            No public tier lists in this period yet. Be the first to publish one from a template.
          </div>
        ) : (
          cards.map((list, idx) => <RecentCard key={list.id} list={list} rank={idx + 1} />)
        )}
      </div>
    </>
  );
}

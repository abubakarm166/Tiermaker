"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchFeed, reactToList } from "@/lib/api";
import { mediaSrc } from "@/lib/media";
import type { TierList, PaginatedResponse, ReactionType } from "@/types/api";

const REACTIONS: { type: ReactionType; label: string; emoji: string }[] = [
  { type: "like", label: "Like", emoji: "👍" },
  { type: "love", label: "Love", emoji: "❤️" },
  { type: "laugh", label: "Laugh", emoji: "😂" },
  { type: "wow", label: "Wow", emoji: "😮" },
  { type: "sad", label: "Sad", emoji: "😢" },
];

export default function FeedPage() {
  const [data, setData] = useState<PaginatedResponse<TierList> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [reactingId, setReactingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFeed({ page: String(page) })
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
  }, [page]);

  const lists = data?.results ?? [];

  const handleReact = async (listId: number, reactionType: ReactionType | null) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;
    setReactingId(listId);
    try {
      const updated = await reactToList(String(listId), reactionType);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map((l) => (l.id === listId ? updated : l)),
        };
      });
    } finally {
      setReactingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white mb-2">
        New Tier Lists
      </h1>
      <p className="text-muted text-sm mb-6 max-w-2xl">
        Check out the most recent tier lists submitted by users. Discover templates you might want to try or react to others&apos; lists.
      </p>
      {loading ? (
        <div className="text-muted py-12 text-center">Loading…</div>
      ) : lists.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          No public tier lists yet. Create one from a template and set visibility to Public.
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => {
              const thumb = list.template_detail?.thumbnail;
              return (
                <li key={list.id}>
                  <div className="rounded-xl overflow-hidden border border-app bg-surface-elevated">
                    <Link
                      href={`/app/lists/${list.id}`}
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
                          {list.title.charAt(0) || "?"}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="font-display font-medium text-white text-sm truncate block">
                          {list.title}
                        </span>
                        <span className="text-muted text-xs">{list.user_email}</span>
                      </div>
                    </Link>
                    <div className="p-2 border-t border-app bg-surface">
                      <div className="flex items-center gap-1 flex-wrap">
                        {REACTIONS.map(({ type, emoji, label }) => {
                          const count = list.reaction_counts?.[type] ?? 0;
                          const isActive = list.my_reaction === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              title={label}
                              disabled={reactingId === list.id}
                              onClick={(e) => {
                                e.preventDefault();
                                handleReact(list.id, isActive ? null : type);
                              }}
                              className={`flex items-center gap-0.5 px-2 py-1 rounded text-xs transition-colors ${
                                isActive
                                  ? "bg-[#FF9F1C]/20 text-[#ffb84d]"
                                  : "text-muted hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <span>{emoji}</span>
                              {count > 0 && <span>{count}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {data && (data.next || data.previous) && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.previous}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-muted">
                Page {page}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.next}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

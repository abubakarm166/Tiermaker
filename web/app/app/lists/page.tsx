"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMyLists } from "@/lib/api";
import { mediaSrc } from "@/lib/media";
import type { TierList } from "@/types/api";

export default function MyListsPage() {
  const [lists, setLists] = useState<TierList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMyLists()
      .then((res) => {
        if (!cancelled) setLists(res);
      })
      .catch(() => {
        if (!cancelled) setLists([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-white">My Lists</h1>
        <Link href="/app/lists/new" className="btn-primary">
          New list
        </Link>
      </div>
      {loading ? (
        <div className="text-muted py-12 text-center">Loading…</div>
      ) : lists.length === 0 ? (
        <div className="card p-12 text-center text-muted">
          No lists yet. <Link href="/app/lists/new" className="link-primary hover:underline">Create one</Link>
        </div>
      ) : (
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
                      <span className="text-white text-xs">
                        {list.template_detail?.title ?? `Template #${list.template}`}
                      </span>
                    </div>
                  </Link>
                  <div className="p-2 border-t border-app bg-surface flex items-center justify-between">
                    <span className="text-muted-strong text-xs">{list.visibility}</span>
                    <Link
                      href={`/app/lists/${list.id}/edit`}
                      className="text-xs text-muted hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

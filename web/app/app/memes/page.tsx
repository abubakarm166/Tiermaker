"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchMemes } from "@/lib/api";
import type { Meme, PaginatedResponse } from "@/types/api";

export default function MemesGalleryPage() {
  const [data, setData] = useState<PaginatedResponse<Meme> | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;
    fetchMemes()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (alive) setError(e?.message ?? "Failed to load memes");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Memes</h1>
            <p className="text-sm text-muted-strong">
              Browse community memes. Open any meme to edit and remix.
            </p>
          </div>
          <Link href="/app/meme-editor" className="btn-primary">
            Create new
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-[#402] bg-[#200] px-4 py-3 text-sm text-white mb-4">
            {error}
          </div>
        )}

        {!data ? (
          <div className="text-muted">Loading…</div>
        ) : data.results.length === 0 ? (
          <div className="text-muted">No memes yet. Create the first one.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.results.map((m) => (
              <Link
                key={m.id}
                href={`/app/memes/${m.id}`}
                className="group rounded-2xl overflow-hidden border border-[#202020] bg-[#101010] hover:border-[#333] transition-colors"
              >
                <div className="aspect-[16/10] bg-black">
                  {m.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.preview}
                      alt={m.title || `Meme ${m.id}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted">
                      No preview
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-white font-medium truncate">
                    {m.title || `Meme #${m.id}`}
                  </div>
                  <div className="text-xs text-muted-strong mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate">{m.author_email ?? "Anonymous"}</span>
                    <span className="opacity-70">Remix</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MemeEditor from "@/components/MemeEditor";
import { ApiError, fetchMeme, remixMeme } from "@/lib/api";
import type { Meme } from "@/types/api";

export default function MemeEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [meme, setMeme] = useState<Meme | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetchMeme(String(id))
      .then((m) => {
        if (alive) setMeme(m);
      })
      .catch((e) => {
        if (alive) setError(e?.message ?? "Failed to load meme");
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-2xl border border-[#402] bg-[#200] p-4 text-white">
          {error}
        </div>
      </div>
    );
  }

  if (!meme) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-muted">Loading…</div>
      </div>
    );
  }

  return (
    <MemeEditor
      initialSnapshot={(meme.snapshot as any) ?? null}
      saveLabel="Save remix"
      onSave={async ({ title, snapshot, previewDataUrl }) => {
        try {
          const created = await remixMeme(String(meme.id), {
            title,
            snapshot,
            preview_data_url: previewDataUrl,
          });
          router.push(`/app/memes/${created.id}`);
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) {
            router.push("/login");
            return;
          }
          throw e;
        }
      }}
    />
  );
}


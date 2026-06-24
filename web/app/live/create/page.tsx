"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiError, createLiveEvent, fetchTemplate, fetchTemplates } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import type { PaginatedResponse, Template } from "@/types/api";

function CreateLiveForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState<number | "">("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTemplates({ ordering: "-created_at" }).then((res: PaginatedResponse<Template>) => {
      setTemplates(res.results ?? []);
    });
  }, []);

  /** From template detail: `/live/create?template=<slug-or-id>` — select template + ensure it appears in dropdown. */
  useEffect(() => {
    const raw = searchParams.get("template");
    if (!raw) return;
    fetchTemplate(raw)
      .then((t) => {
        setTemplateId(t.id);
        setTemplates((prev) => (prev.some((x) => x.id === t.id) ? prev : [t, ...prev]));
      })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    const now = new Date();
    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const toLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    setStartsAt(toLocal(now));
    setEndsAt(toLocal(end));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || templateId === "") {
      setError("Choose a template and title.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const starts = new Date(startsAt).toISOString();
      const ends = new Date(endsAt).toISOString();
      const ev = await createLiveEvent({
        title: title.trim(),
        template_id: Number(templateId),
        starts_at: starts,
        ends_at: ends,
        visibility,
      });
      router.push(`/live/${ev.invite_token}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create event");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link href="/live" className="text-sm text-muted hover:text-[#FF9F1C] mb-6 inline-block">
          ← Live hub
        </Link>
        <h1 className="text-2xl font-semibold mb-6">Create live event</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-2 text-sm text-red-200">{error}</div>}
          <div>
            <label className="block text-sm text-muted-strong mb-1">Title</label>
            <input className="input w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ultimate Ice Cream" required />
          </div>
          <div>
            <label className="block text-sm text-muted-strong mb-1">Template</label>
            <select
              className={`input w-full ${templateId === "" ? "text-white/35" : ""}`}
              value={templateId === "" ? "" : String(templateId)}
              onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : "")}
              required
            >
              <option value="">Select template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-muted-strong mb-1">Starts</label>
              <input type="datetime-local" className="input w-full" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-muted-strong mb-1">Ends</label>
              <input type="datetime-local" className="input w-full" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-strong mb-1">Visibility</label>
            <select className="input w-full" value={visibility} onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")}>
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private (invite link only)</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full py-3 rounded-xl" disabled={loading}>
            {loading ? "Creating…" : "Start setup"}
          </button>
        </form>
        <p className="mt-6 text-xs text-muted">
          After creation you&apos;ll get a shareable URL. You must stay logged in to use host controls (end / pause).
        </p>
      </div>
    </div>
  );
}

export default function CreateLivePage() {
  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="min-h-screen bg-black text-white flex items-center justify-center text-muted">
            Loading…
          </div>
        }
      >
        <CreateLiveForm />
      </Suspense>
    </RequireAuth>
  );
}

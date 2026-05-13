"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

/** Only allow same-origin relative paths (prevents open redirects). */
export function safeReturnPath(next: string | null, fallback = "/app"): string {
  if (!next || !next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.includes("://")) return fallback;
  return next;
}

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const q = new URLSearchParams({ next: pathname || "/app" });
      router.replace(`/login?${q.toString()}`);
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted font-body">Loading…</div>
      </div>
    );
  }
  if (!user) return null;
  return children;
}


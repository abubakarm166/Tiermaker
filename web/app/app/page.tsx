"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppHomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/templates");
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted">Redirecting…</div>
    </div>
  );
}

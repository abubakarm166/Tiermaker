"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  label?: string;
  className?: string;
};

/** Full-page redirect to Django OAuth start (proxied via /api on the same site). */
export default function TwitterLoginButton({
  label = "Continue with X",
  className = "btn-secondary w-full py-2.5 flex items-center justify-center gap-2",
}: Props) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const href =
    next && next.startsWith("/") && !next.startsWith("//")
      ? `/api/auth/twitter/start/?next=${encodeURIComponent(next)}`
      : "/api/auth/twitter/start/";

  return (
    <Link href={href} className={className}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      {label}
    </Link>
  );
}

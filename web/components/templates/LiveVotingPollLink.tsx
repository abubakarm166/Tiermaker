import Link from "next/link";

/** Opens create-live flow with `?template=` preset (requires login). */
export function LiveVotingPollLink({ templateSlug }: { templateSlug: string }) {
  return (
    <Link
      href={`/live/create?template=${encodeURIComponent(templateSlug)}`}
      className="inline-flex items-center gap-2.5 rounded-xl border border-[#3a3a3a] bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#111] hover:border-[#505050]"
    >
      <span
        className="relative h-3 w-3 shrink-0 rounded-full bg-[#dc2626] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_10px_rgba(239,68,68,0.55)]"
        aria-hidden
      />
      Live Voting Poll
    </Link>
  );
}

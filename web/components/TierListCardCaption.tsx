/**
 * Title + subtitle over tier-list thumbnails (feed, related lists, my lists).
 * Dark panel + gradient so text stays readable on light or busy images.
 */
export function TierListCardCaption({
  title,
  subtitle,
  subtitleTone = "muted",
}: {
  title: string;
  subtitle?: string | null;
  /** `muted` = softer line (e.g. email); `strong` = slightly brighter (e.g. template name) */
  subtitleTone?: "muted" | "strong";
}) {
  const subClass =
    subtitleTone === "muted" ? "text-white/70" : "text-white/90";

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 p-2 pt-10 sm:pt-14 bg-gradient-to-t from-black via-black/80 to-transparent">
      <div className="rounded-lg bg-black/88 backdrop-blur-md border border-white/12 px-2.5 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
        <span className="font-display font-medium text-white text-sm truncate block">{title}</span>
        {subtitle ? (
          <span className={`text-xs truncate block mt-0.5 ${subClass}`}>{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
}

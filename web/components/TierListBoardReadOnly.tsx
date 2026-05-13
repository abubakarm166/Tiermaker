"use client";

import { mediaSrc } from "@/lib/media";
import type { TierList } from "@/types/api";

const getContrastTextColor = (hex: string) => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#111111" : "#ffffff";
};

function buildDisplayRows(list: TierList) {
  const template = list.template_detail;
  if (!template) return { rows: [] as { key: string; label: string; color: string }[], items: [] };
  const rawRows = template.tier_rows ?? [];
  const rowOrder = list.row_order ?? rawRows.map((r: { label: string }) => r.label);
  const labelOverrides = list.label_overrides ?? {};
  const customRows = list.custom_rows ?? [];
  const byLabel = Object.fromEntries(
    rawRows.map((r: { label: string; color: string }) => [r.label, r])
  );
  const customByLabel = Object.fromEntries(
    customRows.map((c: { label: string; color: string }) => [c.label, c])
  );
  const out: { key: string; label: string; color: string }[] = [];
  for (const key of rowOrder) {
    const templateRow = byLabel[key];
    if (templateRow)
      out.push({
        key,
        label: labelOverrides[key] ?? templateRow.label,
        color: templateRow.color,
      });
    else {
      const custom = customByLabel[key];
      if (custom)
        out.push({
          key: custom.label,
          label: labelOverrides[custom.label] ?? custom.label,
          color: custom.color,
        });
    }
  }
  return { rows: out, items: template.items ?? [] };
}

/** Read-only tier grid (same layout as list detail). */
export default function TierListBoardReadOnly({ list }: { list: TierList }) {
  const { rows, items } = buildDisplayRows(list);
  const assignments = list.tier_assignments ?? {};

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-[#262626] bg-[#151515] px-4 py-8 text-center text-muted text-sm">
        No tier rows to display.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="divide-y divide-[#202020]">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-4 p-4">
            <span
              className="inline-flex h-11 min-w-[132px] shrink-0 items-center justify-center rounded-lg px-3 text-sm font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: row.color,
                color: getContrastTextColor(row.color),
              }}
            >
              {row.label}
            </span>
            <div className="h-10 w-px bg-white/10 shrink-0" />
            <div className="flex flex-wrap gap-2 min-h-[60px]">
              {(assignments[row.key] ?? []).map((itemId) => {
                const item = items.find((i) => i.id === itemId);
                return item ? (
                  <div
                    key={item.id}
                    className="w-14 h-14 rounded-lg overflow-hidden bg-surface-elevated shrink-0"
                  >
                    {item.image ? (
                      <img
                        src={mediaSrc(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="flex items-center justify-center h-full text-muted-strong text-xs px-1 text-center">
                        {item.name}
                      </span>
                    )}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

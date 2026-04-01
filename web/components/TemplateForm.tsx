"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTemplate, fetchCategories, createTemplate, updateTemplate } from "@/lib/api";
import type { TierRow, Category } from "@/types/api";
import { ApiError } from "@/lib/api";
import ImageUpload from "./ImageUpload";

const DEFAULT_ROWS: Omit<TierRow, "id">[] = [
  { label: "S", color: "#e11d48", order: 0 },
  { label: "A", color: "#ea580c", order: 1 },
  { label: "B", color: "#ca8a04", order: 2 },
  { label: "C", color: "#65a30d", order: 3 },
  { label: "D", color: "#0891b2", order: 4 },
];

const COLOR_SWATCHES = [
  "#e11d48", "#ea580c", "#ca8a04", "#65a30d", "#16a34a", "#0891b2", "#2563eb",
  "#7c3aed", "#db2777", "#4b5563", "#1f2937", "#6b7280", "#d1d5db", "#ffffff",
];

interface TemplateFormProps {
  id?: string;
  presetCategoryId?: string;
}

export default function TemplateForm({ id, presetCategoryId = "" }: TemplateFormProps) {
  const router = useRouter();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>(presetCategoryId);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [tags, setTags] = useState("");
  const [rows, setRows] = useState<Omit<TierRow, "id">[]>(DEFAULT_ROWS);
  const [items, setItems] = useState<{ name: string; image: string | null; order: number }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settingsRowIndex, setSettingsRowIndex] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((res) => {
        const list = "results" in res ? res.results : res;
        if (!cancelled) setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!presetCategoryId || !categories.length) return;
    const found = categories.some((c) => String(c.id) === presetCategoryId);
    if (found) setCategoryId(presetCategoryId);
  }, [presetCategoryId, categories]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchTemplate(id)
      .then((t) => {
        if (cancelled) return;
        setTitle(t.title);
        setDescription(t.description || "");
        setThumbnail(t.thumbnail || null);
        setCategoryId(t.category != null ? String(t.category) : "");
        setVisibility(t.visibility);
        setTags(Array.isArray(t.tags) ? t.tags.join(", ") : "");
        setRows((t.tier_rows ?? []).map((r) => ({ label: r.label, color: r.color, order: r.order })));
        setItems((t.items ?? []).map((i) => ({ name: i.name, image: i.image, order: i.order })));
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load template");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const addItem = () => setItems((prev) => [...prev, { name: "", image: null, order: prev.length }]);
  const updateItem = (index: number, field: "name" | "image", value: string | null) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const moveRowUp = (index: number) => {
    if (index <= 0) return;
    setRows((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };
  const moveRowDown = (index: number) => {
    if (index >= rows.length - 1) return;
    setRows((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const updateRow = (index: number, updates: Partial<Omit<TierRow, "id">>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...updates } : r)));
  };
  const deleteRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
    setSettingsRowIndex(null);
  };
  const addRowAbove = (index: number) => {
    setRows((prev) => [...prev.slice(0, index), { label: "New", color: "#808080", order: index }, ...prev.slice(index)]);
    setSettingsRowIndex(null);
  };
  const addRowBelow = (index: number) => {
    setRows((prev) => [...prev.slice(0, index + 1), { label: "New", color: "#808080", order: index + 1 }, ...prev.slice(index + 1)]);
    setSettingsRowIndex(null);
  };

  const toImagePath = (url: string | null): string | null => {
    if (!url) return null;
    const m = url.match(/\/media\/(.+)$/);
    return m ? m[1] : url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      title,
      description,
      thumbnail: toImagePath(thumbnail),
      category: categoryId ? Number(categoryId) : null,
      visibility,
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      tier_rows: rows.map((r, i) => ({ ...r, order: i })),
      items: items.map((it, i) => ({
        name: it.name || `Item ${i + 1}`,
        image: toImagePath(it.image),
        order: i,
      })),
    };
    try {
      if (isEdit && id) {
        const updated = await updateTemplate(id, payload);
        router.push(`/app/templates/${updated.id}`);
      } else {
        const created = await createTemplate(payload);
        router.push(`/app/templates/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted py-8">Loading…</div>;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white mb-6">
        {isEdit ? "Edit template" : "New template"}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && (
          <div className="rounded-lg error-box-alt text-sm px-4 py-2">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-white mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input min-h-[80px]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Thumbnail</label>
          <ImageUpload value={thumbnail} onChange={setThumbnail} />
          <p className="text-muted-strong text-xs mt-1">Cover image for the template card.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input max-w-xs">
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Visibility</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as "PUBLIC" | "PRIVATE")} className="input max-w-xs">
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Tags (comma-separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className="input" placeholder="games, anime" />
        </div>
        <div>
          <h3 className="text-white font-medium mb-2">Tier rows</h3>
          <p className="text-muted-strong text-sm mb-2">Reorder with ↑ / ↓. Use the gear to edit label and color.</p>
          <ul className="space-y-2">
            {rows.map((r, i) => (
              <li
                key={i}
                className="flex items-center gap-2 p-2 rounded-lg border border-app bg-surface-elevated"
                style={{ borderLeftWidth: 4, borderLeftColor: r.color }}
              >
                <span className="font-medium w-8 shrink-0" style={{ color: r.color }}>{r.label}</span>
                <div className="flex items-center gap-1 ml-auto shrink-0">
                  <button type="button" onClick={() => setSettingsRowIndex(i)} className="p-1.5 rounded text-muted hover:text-white hover:bg-white/10" title="Row settings" aria-label="Row settings">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                  <button type="button" onClick={() => moveRowUp(i)} disabled={i === 0} className="p-1.5 rounded text-muted hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none" title="Move up" aria-label="Move tier up">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button type="button" onClick={() => moveRowDown(i)} disabled={i === rows.length - 1} className="p-1.5 rounded text-muted hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none" title="Move down" aria-label="Move tier down">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {settingsRowIndex !== null && rows[settingsRowIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSettingsRowIndex(null)}>
            <div className="bg-surface-elevated border border-app rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-medium">Tier row settings</h3>
                <button type="button" onClick={() => setSettingsRowIndex(null)} className="p-1 rounded text-muted hover:text-white hover:bg-white/10" aria-label="Close">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-muted text-sm mb-2">Label color:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => updateRow(settingsRowIndex, { color: hex })}
                    className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: hex,
                      borderColor: rows[settingsRowIndex].color === hex ? "#fff" : "transparent",
                    }}
                    title={hex}
                    aria-label={`Color ${hex}`}
                  />
                ))}
              </div>
              <p className="text-muted text-sm mb-2">Label text:</p>
              <input
                type="text"
                value={rows[settingsRowIndex].label}
                onChange={(e) => updateRow(settingsRowIndex, { label: e.target.value })}
                className="input w-full mb-4"
                placeholder="e.g. S, A, B"
                maxLength={20}
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => deleteRow(settingsRowIndex)} className="btn-secondary text-primary hover:bg-[#FF9F1C]/20">Delete Row</button>
                <button type="button" onClick={() => addRowAbove(settingsRowIndex)} className="btn-secondary">Add a Row Above</button>
                <button type="button" onClick={() => addRowBelow(settingsRowIndex)} className="btn-secondary">Add a Row Below</button>
              </div>
            </div>
          </div>
        )}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium">Items</h3>
            <button type="button" onClick={addItem} className="btn-secondary text-sm">Add item</button>
          </div>
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="flex flex-wrap gap-2 items-start p-3 rounded-lg bg-surface-elevated">
                <input
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  className="input flex-1 min-w-[120px]"
                  placeholder="Item name"
                />
                <div className="flex-1 min-w-[200px]">
                  <ImageUpload value={item.image} onChange={(url) => updateItem(index, "image", url)} />
                </div>
                <button type="button" onClick={() => removeItem(index)} className="btn-ghost text-primary">Remove</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, createCategory } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";

function toImagePath(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/\/media\/(.+)$/);
  return m ? m[1] : url;
}

export default function CategoryForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required.");
      return;
    }
    setSaving(true);
    try {
      const created = await createCategory({
        name: trimmed,
        image: toImagePath(image),
      });
      router.push(`/app/categories/${created.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-white mb-6">Create new category</h1>
      <form onSubmit={handleSubmit} className="card p-6 max-w-md space-y-4">
        {error && (
          <div className="rounded-xl error-box-alt text-sm px-4 py-2">{error}</div>
        )}
        <div>
          <label htmlFor="category-name" className="block text-sm font-medium text-white mb-1">
            Name
          </label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
            placeholder="e.g. Anime, Games"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Image (optional)</label>
          <ImageUpload value={image} onChange={setImage} />
          <p className="text-xs text-muted mt-1">Shown on category cards in browse and landing sections.</p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Creating…" : "Create category"}
          </button>
          <Link href="/app/categories" className="btn-secondary inline-flex items-center justify-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

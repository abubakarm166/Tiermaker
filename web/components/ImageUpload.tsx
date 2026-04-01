"use client";

import { useRef, useState } from "react";
import { uploadImage, ApiError } from "@/lib/api";
import { mediaSrc } from "@/lib/media";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
}

export default function ImageUpload({ value, onChange, className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!ALLOWED.includes(file.type)) {
      setError("Use JPG, PNG or WebP");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Max 5MB");
      return;
    }
    setUploading(true);
    try {
      const res = await uploadImage(file);
      // Prefer same-origin path so Next.js can proxy /media to Django; backend may return "/media/..." or full URL
      const raw = res.file ?? "";
      const url = raw.startsWith("http") ? raw : raw.startsWith("/") ? raw : `/${raw}`;
      onChange(url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary text-sm"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="btn-ghost text-muted text-sm">
            Clear
          </button>
        )}
      </div>
      {value && (
        <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-surface-elevated border border-app">
          <img src={mediaSrc(value)} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      {error && <p className="text-primary text-sm mt-1">{error}</p>}
    </div>
  );
}

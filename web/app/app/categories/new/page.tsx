"use client";

import { useRouter } from "next/navigation";

export default function NewCategoryPage() {
  const router = useRouter();
  return (
    <div className="card p-8">
      <h1 className="font-display text-2xl font-semibold text-white mb-4">New category</h1>
      <p className="text-muted mb-4">Category creation form will be ported here from the Vite app.</p>
      <button type="button" onClick={() => router.back()} className="btn-secondary">
        Back
      </button>
    </div>
  );
}

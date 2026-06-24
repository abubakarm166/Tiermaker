"use client";

import Link from "next/link";
import CategoryForm from "@/components/CategoryForm";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";

function NewCategoryContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-muted py-12 text-center">Loading…</div>;
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="card p-8 max-w-lg">
        <h1 className="font-display text-2xl font-semibold text-white mb-3">New category</h1>
        <p className="text-muted text-sm mb-6">
          Only administrators can create categories. Contact an admin or sign in with an admin account.
        </p>
        <Link href="/categories" className="btn-secondary inline-flex">
          Back to categories
        </Link>
      </div>
    );
  }

  return <CategoryForm />;
}

export default function NewCategoryPage() {
  return (
    <RequireAuth>
      <NewCategoryContent />
    </RequireAuth>
  );
}

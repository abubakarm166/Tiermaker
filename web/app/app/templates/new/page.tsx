"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TemplateForm from "@/components/TemplateForm";
import RequireAuth from "@/components/RequireAuth";

function NewTemplateFormInner() {
  const searchParams = useSearchParams();
  const presetCategoryId = searchParams.get("category") ?? "";

  return <TemplateForm presetCategoryId={presetCategoryId} />;
}

export default function NewTemplatePage() {
  return (
    <RequireAuth>
      <Suspense fallback={<p className="text-muted p-4">Loading…</p>}>
        <NewTemplateFormInner />
      </Suspense>
    </RequireAuth>
  );
}

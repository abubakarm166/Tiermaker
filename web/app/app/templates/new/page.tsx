"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TemplateForm from "@/components/TemplateForm";

function NewTemplateFormInner() {
  const searchParams = useSearchParams();
  const presetCategoryId = searchParams.get("category") ?? "";

  return <TemplateForm presetCategoryId={presetCategoryId} />;
}

export default function NewTemplatePage() {
  return (
    <Suspense fallback={<p className="text-muted p-4">Loading…</p>}>
      <NewTemplateFormInner />
    </Suspense>
  );
}

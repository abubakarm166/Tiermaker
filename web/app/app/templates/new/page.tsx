"use client";

import { useSearchParams } from "next/navigation";
import TemplateForm from "@/components/TemplateForm";

export default function NewTemplatePage() {
  const searchParams = useSearchParams();
  const presetCategoryId = searchParams.get("category") ?? "";

  return <TemplateForm presetCategoryId={presetCategoryId} />;
}

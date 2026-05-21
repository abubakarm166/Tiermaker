"use client";

import { useParams } from "next/navigation";
import TemplateForm from "@/components/TemplateForm";
import RequireAuth from "@/components/RequireAuth";

export default function EditTemplatePage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <RequireAuth>
      <TemplateForm id={id} />
    </RequireAuth>
  );
}

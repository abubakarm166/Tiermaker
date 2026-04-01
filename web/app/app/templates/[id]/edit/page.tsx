"use client";

import { useParams } from "next/navigation";
import TemplateForm from "@/components/TemplateForm";

export default function EditTemplatePage() {
  const params = useParams();
  const id = params.id as string;

  return <TemplateForm id={id} />;
}

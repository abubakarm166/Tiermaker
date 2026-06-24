"use client";

import MemeEditor from "@/components/MemeEditor";
import { ApiError, createMeme } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function MemeEditorPage() {
  const router = useRouter();
  return (
    <MemeEditor
      saveLabel="Save"
      onSave={async ({ title, snapshot, previewDataUrl }) => {
        try {
          const created = await createMeme({
            title,
            snapshot,
            preview_data_url: previewDataUrl,
          });
          router.push(`/memes/${created.slug}`);
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) {
            router.push("/login");
            return;
          }
          throw e;
        }
      }}
    />
  );
}

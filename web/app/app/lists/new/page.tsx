"use client";

import { Suspense } from "react";
import ListForm from "@/components/ListForm";
import RequireAuth from "@/components/RequireAuth";

function ListFormFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-zinc-400">
      Loading…
    </div>
  );
}

export default function NewListPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<ListFormFallback />}>
        <ListForm />
      </Suspense>
    </RequireAuth>
  );
}

"use client";

import ListForm from "@/components/ListForm";
import RequireAuth from "@/components/RequireAuth";

export default function EditListPage() {
  return (
    <RequireAuth>
      <ListForm />
    </RequireAuth>
  );
}

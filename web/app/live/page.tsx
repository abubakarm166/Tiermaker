"use client";

import RequireAuth from "@/components/RequireAuth";
import { LiveHubContent } from "./LiveHubContent";

export default function LiveHubPage() {
  return (
    <RequireAuth>
      <LiveHubContent />
    </RequireAuth>
  );
}

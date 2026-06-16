import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Tier List Voting for Streamers | TheTierMaker",
  description:
    "Host a live tier list & let your audience vote in real time. Built for Twitch, YouTube & Discord creators. Free to join. Free account to host.",
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}

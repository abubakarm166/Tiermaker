import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Tier List Maker Online | Create & Rank | TheTierMaker",
  description:
    "Create unlimited free tier lists online. Rank anime characters, video games, sports teams, fast food chains, Pokémon, music albums & more. No paywalls.",
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

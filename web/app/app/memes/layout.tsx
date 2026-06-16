import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Meme Maker Online, Create & Remix | TheTierMaker",
  description:
    "Make memes free in seconds. Upload any image, add your caption, remix community memes, & share anywhere. No watermarks. No account needed to browse.",
};

export default function MemesLayout({ children }: { children: React.ReactNode }) {
  return children;
}

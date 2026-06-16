import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Free Tier List Maker Online, Create, Rank & Share | TheTierMaker",
  description:
    "Make a free tier list online in seconds, no login needed to start. Rank anime, games, Pokémon, sports, fast food & more. Custom tier list maker. Free forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

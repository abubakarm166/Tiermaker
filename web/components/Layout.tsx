"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const navLinkClass = (active: boolean) =>
  active
    ? "px-3 py-2 rounded-xl text-white text-sm font-medium transition-colors bg-[#FF9F1C] hover:bg-[#e58e18]"
    : "px-3 py-2 rounded-xl text-[#9e9e9e] hover:text-white hover:bg-white/5 text-sm font-medium transition-colors";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const isTemplates = pathname === "/app" || pathname.startsWith("/app/templates");
  const isCategories = pathname.startsWith("/app/categories");
  const isFeed = pathname.startsWith("/app/lists/feed");
  const isNewList =
    pathname === "/app/lists/new" || /^\/app\/lists\/[^/]+\/edit/.test(pathname);
  const isMyLists =
    pathname === "/app/lists" ||
    (pathname.startsWith("/app/lists/") && !isFeed && !isNewList);
  const isMemeEditor = pathname.startsWith("/app/meme-editor");

  const handleLogout = () => {
    logout();
    router.push("/login");
    setOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="sticky top-0 z-50 px-3 py-3">
        <div className="mx-auto max-w-6xl rounded-2xl bg-[#10101099] border border-[#202020] backdrop-blur-md px-4 py-2 flex items-center justify-between gap-2">
          <Link href="/" className="text-xl font-semibold text-white tracking-tight">
            TierListMaker
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-wrap justify-end">
            <Link href="/app" className={navLinkClass(isTemplates)}>
              Templates
            </Link>
            <Link href="/app/categories" className={navLinkClass(isCategories)}>
              Categories
            </Link>
            <Link href="/app/lists/feed" className={navLinkClass(isFeed)}>
              New Tier Lists
            </Link>
            <Link href="/app/lists" className={navLinkClass(isMyLists)}>
              My Lists
            </Link>
            <Link href="/app/lists/new" className={navLinkClass(isNewList)}>
              New List
            </Link>
            <Link href="/app/meme-editor" className={navLinkClass(isMemeEditor)}>
              Meme Editor
            </Link>
            <span
              className="ml-2 text-[#6a7282] text-xs truncate max-w-[160px]"
              title={user?.email ?? ""}
            >
              {user?.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-[#9e9e9e] hover:text-[#FF9F1C] hover:bg-white/5 text-sm font-medium transition-colors border border-[#202020] hover:border-[#333]"
            >
              Log out
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="flex md:hidden items-center justify-center rounded-xl border border-[#303030] px-2 py-1 text-xs text-[#9e9e9e]"
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="mx-auto mt-2 w-full max-w-6xl rounded-2xl border border-[#202020] bg-black/95 px-3 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              <Link href="/app" className={navLinkClass(isTemplates)} onClick={() => setOpen(false)}>
                Templates
              </Link>
              <Link
                href="/app/categories"
                className={navLinkClass(isCategories)}
                onClick={() => setOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/app/lists/feed"
                className={navLinkClass(isFeed)}
                onClick={() => setOpen(false)}
              >
                New Tier Lists
              </Link>
              <Link
                href="/app/lists"
                className={navLinkClass(isMyLists)}
                onClick={() => setOpen(false)}
              >
                My Lists
              </Link>
              <Link
                href="/app/lists/new"
                className={navLinkClass(isNewList)}
                onClick={() => setOpen(false)}
              >
                New List
              </Link>
              <Link
                href="/app/meme-editor"
                className={navLinkClass(isMemeEditor)}
                onClick={() => setOpen(false)}
              >
                Meme Editor
              </Link>
              <div className="mt-1 flex items-center justify-between text-xs text-[#6a7282]">
                <span className="truncate max-w-[60%]" title={user?.email ?? ""}>
                  {user?.email}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl text-[#9e9e9e] hover:text-[#FF9F1C] hover:bg-white/5 text-xs font-medium transition-colors border border-[#202020] hover:border-[#333]"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 text-white">{children}</main>
    </div>
  );
}

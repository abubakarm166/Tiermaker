"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserDisplayName, getUserDisplayTitle } from "@/lib/userDisplay";
import { useEffect, useRef, useState } from "react";

const navLinkClass = (active: boolean) =>
  active
    ? "px-3 py-2 rounded-xl text-white text-sm font-medium transition-colors bg-[#FF9F1C] hover:bg-[#e58e18]"
    : "px-3 py-2 rounded-xl text-[#c4c4c4] hover:text-white hover:bg-white/5 text-sm font-medium transition-colors";

/** Solid panel — avoids see-through over page content when open */
const dropdownPanelClass =
  "absolute left-0 mt-2 min-w-[13.5rem] rounded-xl border border-[#383838] bg-[#161616] shadow-[0_12px_40px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.06] overflow-hidden py-1 z-50";

const dropdownItemClass = (active: boolean) =>
  active
    ? "block px-3 py-2.5 text-sm font-medium text-white bg-[#FF9F1C]/15 border-l-2 border-[#FF9F1C]"
    : "block px-3 py-2.5 text-sm text-[#c4c4c4] hover:text-white hover:bg-white/[0.06]";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [listsMenuOpen, setListsMenuOpen] = useState(false);
  const [memesMenuOpen, setMemesMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const listsMenuRef = useRef<HTMLDivElement | null>(null);
  const memesMenuRef = useRef<HTMLDivElement | null>(null);

  const isTemplates = pathname === "/templates" || pathname.startsWith("/templates");
  const isCategories = pathname.startsWith("/categories");
  const isFeed = pathname.startsWith("/lists/feed");
  const isNewList =
    pathname === "/lists/new" || /^\/lists\/[^/]+\/edit/.test(pathname);
  const isMyLists =
    pathname === "/lists" ||
    (pathname.startsWith("/lists/") && !isFeed && !isNewList);
  const isMemeEditor = pathname.startsWith("/meme-editor");
  const isMemes = pathname === "/memes" || pathname.startsWith("/memes/");
  const isLive = pathname.startsWith("/live");

  const listsSectionActive = isCategories || isFeed || isMyLists || isNewList;
  const memesSectionActive = isMemes || isMemeEditor;

  const handleLogout = () => {
    logout();
    router.push("/login");
    setOpen(false);
    setUserMenuOpen(false);
    setListsMenuOpen(false);
    setMemesMenuOpen(false);
  };

  useEffect(() => {
    if (!userMenuOpen && !listsMenuOpen && !memesMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target instanceof Node ? e.target : null;
      if (!t) return;
      if (userMenuRef.current?.contains(t)) return;
      if (listsMenuRef.current?.contains(t)) return;
      if (memesMenuRef.current?.contains(t)) return;
      setUserMenuOpen(false);
      setListsMenuOpen(false);
      setMemesMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setListsMenuOpen(false);
        setMemesMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenuOpen, listsMenuOpen, memesMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="sticky top-0 z-50 px-3 py-3">
        <div className="mx-auto max-w-6xl rounded-2xl bg-[#101010]/95 border border-[#202020] backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-4">
          <Link href="/" className="text-xl font-semibold text-white tracking-tight shrink-0">
            Thetiermaker
          </Link>

          {/* Desktop nav — primary links + grouped dropdowns */}
          <nav className="hidden md:flex items-center gap-1 flex-nowrap justify-end min-w-0">
            <Link href="/templates" className={navLinkClass(isTemplates)}>
              Templates
            </Link>

            <div className="relative shrink-0" ref={listsMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setListsMenuOpen((v) => !v);
                  setMemesMenuOpen(false);
                  setUserMenuOpen(false);
                }}
                className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  listsSectionActive
                    ? "bg-[#FF9F1C] text-white hover:bg-[#e58e18]"
                    : "text-[#c4c4c4] hover:bg-white/5 hover:text-white"
                }`}
                aria-expanded={listsMenuOpen}
                aria-haspopup="menu"
              >
                Tier lists
                <ChevronDown className={`h-4 w-4 opacity-80 transition-transform ${listsMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {listsMenuOpen && (
                <div role="menu" className={dropdownPanelClass}>
                  <Link
                    href="/categories"
                    className={dropdownItemClass(isCategories)}
                    role="menuitem"
                    onClick={() => setListsMenuOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/lists/feed"
                    className={dropdownItemClass(isFeed)}
                    role="menuitem"
                    onClick={() => setListsMenuOpen(false)}
                  >
                    New tier lists
                  </Link>
                  <Link
                    href="/lists"
                    className={dropdownItemClass(isMyLists)}
                    role="menuitem"
                    onClick={() => setListsMenuOpen(false)}
                  >
                    My lists
                  </Link>
                  <Link
                    href="/lists/new"
                    className={dropdownItemClass(isNewList)}
                    role="menuitem"
                    onClick={() => setListsMenuOpen(false)}
                  >
                    Create list
                  </Link>
                </div>
              )}
            </div>

            <div className="relative shrink-0" ref={memesMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setMemesMenuOpen((v) => !v);
                  setListsMenuOpen(false);
                  setUserMenuOpen(false);
                }}
                className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  memesSectionActive
                    ? "bg-[#FF9F1C] text-white hover:bg-[#e58e18]"
                    : "text-[#c4c4c4] hover:bg-white/5 hover:text-white"
                }`}
                aria-expanded={memesMenuOpen}
                aria-haspopup="menu"
              >
                Memes
                <ChevronDown className={`h-4 w-4 opacity-80 transition-transform ${memesMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {memesMenuOpen && (
                <div role="menu" className={dropdownPanelClass}>
                  <Link
                    href="/memes"
                    className={dropdownItemClass(isMemes)}
                    role="menuitem"
                    onClick={() => setMemesMenuOpen(false)}
                  >
                    Browse memes
                  </Link>
                  <Link
                    href="/meme-editor"
                    className={dropdownItemClass(isMemeEditor)}
                    role="menuitem"
                    onClick={() => setMemesMenuOpen(false)}
                  >
                    Meme editor
                  </Link>
                </div>
              )}
            </div>

            <Link href="/live" className={`${navLinkClass(isLive)} shrink-0`}>
              Live
            </Link>

            {user && (
              <div className="relative ml-1 shrink-0 pl-2 border-l border-[#2a2a2a]" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen((v) => !v);
                    setListsMenuOpen(false);
                    setMemesMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl text-[#c4c4c4] hover:text-white hover:bg-white/5 text-sm font-medium transition-colors border border-[#2a2a2a] hover:border-[#404040] max-w-[200px] truncate"
                  title={getUserDisplayTitle(user)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  {getUserDisplayName(user)}
                </button>
                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 rounded-xl border border-[#383838] bg-[#161616] shadow-[0_12px_40px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.06] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2.5 text-sm text-[#c4c4c4] hover:text-[#FF9F1C] hover:bg-white/[0.06]"
                      role="menuitem"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile */}
          <button
            type="button"
            className="flex md:hidden items-center justify-center rounded-xl border border-[#303030] px-3 py-2 text-sm text-[#c4c4c4]"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            Menu
          </button>
        </div>

        {open && (
          <div className="mx-auto mt-2 w-full max-w-6xl rounded-2xl border border-[#383838] bg-[#161616] px-4 py-4 md:hidden shadow-[0_12px_40px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.06]">
            <div className="flex flex-col gap-1">
              <Link href="/templates" className={navLinkClass(isTemplates)} onClick={() => setOpen(false)}>
                Templates
              </Link>

              <p className="text-[10px] uppercase tracking-[0.2em] text-[#666] px-3 pt-3 pb-1">Tier lists</p>
              <Link
                href="/categories"
                className={navLinkClass(isCategories)}
                onClick={() => setOpen(false)}
              >
                Categories
              </Link>
              <Link href="/lists/feed" className={navLinkClass(isFeed)} onClick={() => setOpen(false)}>
                New tier lists
              </Link>
              <Link href="/lists" className={navLinkClass(isMyLists)} onClick={() => setOpen(false)}>
                My lists
              </Link>
              <Link href="/lists/new" className={navLinkClass(isNewList)} onClick={() => setOpen(false)}>
                Create list
              </Link>

              <p className="text-[10px] uppercase tracking-[0.2em] text-[#666] px-3 pt-3 pb-1">Memes</p>
              <Link href="/memes" className={navLinkClass(isMemes)} onClick={() => setOpen(false)}>
                Browse memes
              </Link>
              <Link
                href="/meme-editor"
                className={navLinkClass(isMemeEditor)}
                onClick={() => setOpen(false)}
              >
                Meme editor
              </Link>

              <Link href="/live" className={`${navLinkClass(isLive)} mt-2`} onClick={() => setOpen(false)}>
                Live
              </Link>

              <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-between gap-3">
                <span className="truncate text-xs text-[#888]" title={user ? getUserDisplayTitle(user) : ""}>
                  {user ? getUserDisplayName(user) : ""}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs font-medium text-[#c4c4c4] hover:text-[#FF9F1C] hover:bg-white/[0.06] border border-[#2a2a2a]"
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

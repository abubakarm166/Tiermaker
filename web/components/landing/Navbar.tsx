"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authStorage } from "@/lib/api";
import { getUserDisplayName, getUserDisplayTitle } from "@/lib/userDisplay";

const MAIN_NAV = [
  { label: "Templates", href: "/app/templates" },
  { label: "Categories", href: "/app/categories" },
  { label: "Trending", href: "/app/templates?ordering=most_popular" },
  { label: "Live", href: "/live" },
] as const;

const GUIDE_NAV = [
  { label: "How to Make a Tier List", href: "/how-to-make-a-tier-list" },
  { label: "Unblocked Tier List Maker", href: "/unblocked-tier-list-maker" },
  { label: "Text Tier List Maker", href: "/text-tier-list-maker" },
  { label: "Contact", href: "/contact" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [mobileGuidesOpen, setMobileGuidesOpen] = useState(false);
  const guidesRef = useRef<HTMLLIElement | null>(null);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const restoringSession = loading && !user && authStorage.getAccessToken();

  const guidesActive = GUIDE_NAV.some((item) => pathname === item.href);

  useEffect(() => {
    if (!guidesOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target instanceof Node ? e.target : null;
      if (t && guidesRef.current?.contains(t)) return;
      setGuidesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setGuidesOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [guidesOpen]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    setGuidesOpen(false);
    router.push("/");
  };

  const closeMobile = () => {
    setOpen(false);
    setMobileGuidesOpen(false);
  };

  return (
    <header className="header_section">
      <div className="container">
        <div className="navbar_inner_main">
          <nav className="navbar navbar-dark">
            <div className="d-flex align-items-center w-100 header_nav_inner">
              <Link href="/" className="navbar-brand me-2">
                TheTierMaker
              </Link>

              {/* Desktop nav */}
              <ul className="navbar-nav flex-row gap-3 header_nav_center flex-grow-1 justify-content-center d-none d-lg-flex">
                {MAIN_NAV.map((item) => (
                  <li className="nav-item" key={item.href}>
                    <Link href={item.href} className="nav-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="nav-item landing_nav_dropdown" ref={guidesRef}>
                  <button
                    type="button"
                    className={`nav-link landing_nav_dropdown_btn${guidesActive ? " landing_nav_dropdown_btn_active" : ""}`}
                    aria-expanded={guidesOpen}
                    aria-haspopup="true"
                    onClick={() => setGuidesOpen((v) => !v)}
                  >
                    Guides
                    <span className="landing_nav_chevron" aria-hidden>
                      ▾
                    </span>
                  </button>
                  {guidesOpen && (
                    <ul className="landing_nav_dropdown_menu">
                      {GUIDE_NAV.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`landing_nav_dropdown_link${pathname === item.href ? " active" : ""}`}
                            onClick={() => setGuidesOpen(false)}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              </ul>

              {/* Desktop auth */}
              <div className="navbar_btns ms-3 d-none d-lg-flex align-items-center gap-2">
                {user ? (
                  <>
                    <span
                      className="text-white-50 small text-truncate d-inline-block"
                      style={{ maxWidth: "10rem" }}
                      title={getUserDisplayTitle(user)}
                    >
                      {getUserDisplayName(user)}
                    </span>
                    <Link href="/app">
                      <button className="navbar_btn2" type="button">
                        Dashboard
                      </button>
                    </Link>
                    <button className="navbar_btn1" type="button" onClick={handleLogout}>
                      Log out
                    </button>
                  </>
                ) : restoringSession ? (
                  <span className="text-white-50 small">…</span>
                ) : (
                  <>
                    <Link href="/login">
                      <button className="navbar_btn1" type="button">
                        Login
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="navbar_btn2" type="button">
                        + Create
                      </button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                type="button"
                className="landing_hamburger d-inline-flex d-lg-none ms-auto"
                aria-label="Toggle navigation"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
              >
                <span />
                <span />
              </button>
            </div>

            {/* Mobile menu panel */}
            {open && (
              <div className="landing_mobile_menu d-lg-none">
                <ul className="navbar-nav flex-column gap-1 mb-3">
                  {MAIN_NAV.map((item) => (
                    <li className="nav-item" key={item.href}>
                      <Link href={item.href} className="nav-link" onClick={closeMobile}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li className="nav-item">
                    <button
                      type="button"
                      className="nav-link landing_mobile_guides_toggle w-100 text-start"
                      aria-expanded={mobileGuidesOpen}
                      onClick={() => setMobileGuidesOpen((v) => !v)}
                    >
                      Guides
                      <span className="landing_nav_chevron ms-1" aria-hidden>
                        {mobileGuidesOpen ? "▴" : "▾"}
                      </span>
                    </button>
                    {mobileGuidesOpen && (
                      <ul className="landing_mobile_subnav">
                        {GUIDE_NAV.map((item) => (
                          <li key={item.href}>
                            <Link href={item.href} className="nav-link ps-3" onClick={closeMobile}>
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </ul>
                <div className="navbar_btns flex-column align-items-stretch gap-2">
                  {user ? (
                    <>
                      <span className="text-white-50 small px-2">{getUserDisplayName(user)}</span>
                      <Link href="/app" onClick={closeMobile}>
                        <button className="navbar_btn2 w-100" type="button">
                          Dashboard
                        </button>
                      </Link>
                      <button className="navbar_btn1 w-100" type="button" onClick={handleLogout}>
                        Log out
                      </button>
                    </>
                  ) : restoringSession ? (
                    <span className="text-white-50 small px-2">…</span>
                  ) : (
                    <>
                      <Link href="/login" onClick={closeMobile}>
                        <button className="navbar_btn1 w-100" type="button">
                          Login
                        </button>
                      </Link>
                      <Link href="/register" onClick={closeMobile}>
                        <button className="navbar_btn2 w-100" type="button">
                          + Create
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

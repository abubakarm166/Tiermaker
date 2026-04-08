"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authStorage } from "@/lib/api";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const restoringSession = loading && !user && authStorage.getAccessToken();

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  return (
    <header className="header_section">
      <div className="container">
        <div className="navbar_inner_main">
          <nav className="navbar navbar-dark">
            <div className="d-flex align-items-center w-100 header_nav_inner">
              <Link href="/" className="navbar-brand me-2">
                Thetiermaker
              </Link>

              {/* Desktop nav */}
              <ul className="navbar-nav flex-row gap-4 header_nav_center flex-grow-1 justify-content-center d-none d-lg-flex">
                <li className="nav-item">
                  <Link href="/app" className="nav-link">
                    Tier List
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/app/categories" className="nav-link">
                    Categories
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/app/lists/feed" className="nav-link">
                    Forum
                  </Link>
                </li>
              </ul>

              {/* Desktop auth */}
              <div className="navbar_btns ms-3 d-none d-lg-flex align-items-center gap-2">
                {user ? (
                  <>
                    <span
                      className="text-white-50 small text-truncate d-inline-block"
                      style={{ maxWidth: "10rem" }}
                      title={user.email}
                    >
                      {user.email}
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
                  <li className="nav-item">
                    <Link href="/app" className="nav-link" onClick={() => setOpen(false)}>
                      Tier List
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/app/categories" className="nav-link" onClick={() => setOpen(false)}>
                      Categories
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link href="/app/lists/feed" className="nav-link" onClick={() => setOpen(false)}>
                      Forum
                    </Link>
                  </li>
                </ul>
                <div className="navbar_btns flex-column align-items-stretch gap-2">
                  {user ? (
                    <>
                      <span className="text-white-50 small px-2">{user.email}</span>
                      <Link href="/app" onClick={() => setOpen(false)}>
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
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <button className="navbar_btn1 w-100" type="button">
                          Login
                        </button>
                      </Link>
                      <Link href="/register" onClick={() => setOpen(false)}>
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

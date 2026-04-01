"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header_section">
      <div className="container">
        <div className="navbar_inner_main">
          <nav className="navbar navbar-dark">
            <div className="d-flex align-items-center w-100 header_nav_inner">
              <Link href="/" className="navbar-brand me-2">
                TierListMaker
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

              {/* Desktop auth buttons */}
              <div className="navbar_btns ms-3 d-none d-lg-flex">
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
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className='header_section'>
      <div className="container">
        <div className="navbar_inner_main">
          <nav className={`navbar navbar-expand-lg navbar-dark`}>
            <Link href="/" className={`navbar-brand`}>
              TierListMaker
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              onClick={toggleMenu}
              aria-controls="navbarNav"
              aria-expanded={isOpen ? 'true' : 'false'}
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
              <ul className={`navbar-nav mx-auto gap-3`}>
                <li className="nav-item">
                  <Link href="/tierlist" className="nav-link">
                    Tier List
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/categories" className="nav-link">
                    Categories
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href="/forum" className="nav-link">
                    Forum
                  </Link>
                </li>
              </ul>
              <div className="navbar_btns">
                <Link href="/login">
                  <button className="navbar_btn1" type='button'>Login</button>
                </Link>
                <Link href="/create">
                  <button className="navbar_btn2" type='button'>+ Create</button>                   
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
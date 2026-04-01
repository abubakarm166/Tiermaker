import Link from "next/link";

export default function Footer() {
  const footerLinks = {
    PRODUCT: [
      { label: "Create Tier List", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Browse Tier Lists", href: "#" },
      { label: "Trending", href: "#" },
      { label: "Pricing", href: "#" },
    ],
    RESOURCES: [
      { label: "Blog", href: "#" },
      { label: "Help Center", href: "#" },
      { label: "Community", href: "#" },
      { label: "Tutorials", href: "#" },
      { label: "API", href: "#" },
    ],
    COMPANY: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press Kit", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Partners", href: "#" },
    ],
    LEGAL: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "DMCA", href: "#" },
      { label: "Acceptable Use", href: "#" },
    ],
  };

  return (
    <>
      <footer className="footer_section">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-5 col-sm-12">
              <div className="footer_text1_div">
                <h2>TierListMaker</h2>
                <p> The best free tier list maker for creators. Create, share, and go viral with beautiful tier lists.
                </p>
                <div className="footer_socials">
                  {/* X (Twitter) */}
                  <a href="#" className="footer_social_btn" aria-label="X / Twitter">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L2.042 2.25h6.956l4.265 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                    </svg>
                  </a>
                  {/* Discord */}
                  <a href="#" className="footer_social_btn" aria-label="Discord">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </a>
                  {/* YouTube */}
                  <a href="#" className="footer_social_btn" aria-label="YouTube">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-lg-8 col-md-12 col-sm-12">
              <div className="row">
                {/* Link columns */}
                {Object.entries(footerLinks).map(([heading, links]) => (
                  <div className="col-lg-3 col-md-4 col-sm-6 col-6" key={heading}>
                    <div className="footer_social_links">
                      <h6>{heading}</h6>
                      <ul>
                        {links.map((link) => (
                          <li key={link.label}>
                            <a href={link.href}>{link.label}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="footer_bottom">
            <p>© 2026 TierBuddy. All rights reserved.</p>
            <div className="footer_bottom_links">
              <Link href="/status">Status</Link>
              <Link href="/sitemap">Sitemap</Link>
              <Link href="/accessibility">Accessibility</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

type LegalArticleProps = {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
};

export default function LegalArticle({ title, lastUpdated, children }: LegalArticleProps) {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <article className="legal-article">
            <header className="legal-header">
              <h1>{title}</h1>
              {lastUpdated && <p className="legal-updated">Last Updated: {lastUpdated}</p>}
            </header>
            <div className="legal-body">{children}</div>
            <footer className="legal-footer-nav">
              <Link href="/">← Back to home</Link>
              <span className="legal-footer-links">
                <Link href="/privacy">Privacy</Link>
                <Link href="/cookies">Cookies</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/acceptable-use">Acceptable Use</Link>
                <Link href="/dmca">DMCA</Link>
                <Link href="/contact">Contact</Link>
              </span>
            </footer>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

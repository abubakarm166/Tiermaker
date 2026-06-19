import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import GuideImage from "@/components/legal/GuideImage";

type LegalArticleProps = {
  title: string;
  lastUpdated?: string;
  featuredImage?: { src: string; alt: string };
  children: React.ReactNode;
};

export default function LegalArticle({ title, lastUpdated, featuredImage, children }: LegalArticleProps) {
  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="container">
          <article className="legal-article">
            <header className="legal-header">
              <h1>{title}</h1>
              {lastUpdated && <p className="legal-updated">Last Updated: {lastUpdated}</p>}
              {featuredImage && <GuideImage src={featuredImage.src} alt={featuredImage.alt} featured />}
            </header>
            <div className="legal-body">{children}</div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}

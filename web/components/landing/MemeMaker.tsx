import Link from "next/link";

const FEATURES = [
  {
    title: "Create from scratch",
    description: "Upload any image, add your caption, and publish your meme in seconds.",
  },
  {
    title: "Remix community memes",
    description: "Browse memes made by other creators and put your own spin on them.",
  },
  {
    title: "Share anywhere",
    description: "One click to share your meme on Twitter, Discord, Reddit, or TikTok.",
  },
];

export default function MemeMaker() {
  return (
    <section className="feature_highlight_section meme_maker_section">
      <div className="container">
        <div className="my_title_div">
          <span>Meme Maker</span>
          <h2>Make &amp; Remix Memes, Right Here</h2>
          <p>
            TheTierMaker isn&apos;t just for tier lists. Create hilarious memes, remix ones the community has made, and
            share them anywhere. It&apos;s free, fast, and endlessly fun.
          </p>
        </div>
        <div className="row g-4 feature_highlight_grid">
          {FEATURES.map((feature) => (
            <div className="col-lg-4 col-md-4 col-sm-12" key={feature.title}>
              <div className="feature_highlight_card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="feature_highlight_cta">
          <Link href="/meme-editor">
            <button type="button">Try the Meme Maker Free →</button>
          </Link>
          <p>No account needed to browse. Create a free account to publish and save your memes.</p>
        </div>
      </div>
    </section>
  );
}

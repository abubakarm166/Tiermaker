import Link from "next/link";

const TRENDING = [
  "Smash Ultimate",
  "Genshin Impact",
  "World Cup Jerseys",
  "Best Legendary Pokémon",
  "Marvel Boss Fights",
];

export default function Hero() {
  return (
    <section className="hero_section">
      <div className="container">
        <div className="hero_text_div">
          <span>RANK ANYTHING. SHARE EVERYWHERE.</span>
          <h1>The Free Tier List Maker Online — Simple, Fast &amp; Custom</h1>
          <p>
            Drag, drop, and rank anything you love — anime, gaming, sports, Pokémon, fast food, Marvel, music, and more.
            No downloads. No credit card. Just start ranking.
          </p>
          <Link href="/app/templates">
            <button type="button">Start Ranking Free →</button>
          </Link>
          <p className="hero_login_link">
            Already have an account?{" "}
            <Link href="/login">Log in →</Link>
          </p>
          <p className="hero_trust_line">
            ✅ Free forever &nbsp;|&nbsp; ✅ No credit card &nbsp;|&nbsp; ✅ Works on all devices &nbsp;|&nbsp; ✅ Save
            &amp; share with a free account
          </p>
          <div className="hero_trending_strip">
            <span className="hero_trending_label">🔥 Trending right now:</span>
            <span className="hero_trending_items">{TRENDING.join(" · ")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

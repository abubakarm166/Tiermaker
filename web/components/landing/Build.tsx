import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TRUST_BADGES = [
  "🆓 Always Free",
  "⚡ Start in Seconds",
  "🎨 Built for Creators",
  "🔴 Go Live with Your Audience",
  "😂 Meme Maker Included",
];

export default function Build() {
  return (
    <section className="build_section">
      <div className="container">
        <div className="build_card_body_div">
          <div className="build_text_div">
            <h1>Rank It. Meme It. Go Live. All in One Place.</h1>
            <p className="build_subheading">
              Whether you&apos;re settling the ultimate anime debate, roasting fast food chains, hosting a live vote with
              your Discord, or dropping a meme, TheTierMaker is your free creative playground.
            </p>
            <p>Start for free. No downloads. No credit card. Just open and create.</p>
            <Link href="/register">
              <button type="button">
                Get Started Free <ArrowRight size={18} />
              </button>
            </Link>
          </div>
          <div className="build_bottom_txt">
            {TRUST_BADGES.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

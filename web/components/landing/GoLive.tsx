import Link from "next/link";

const FEATURES = [
  {
    title: "Real-time voting",
    description:
      "Your audience votes on each item live. Watch the tiers fill up as votes roll in — no refreshing needed.",
  },
  {
    title: "Built for creators",
    description:
      "Whether you're on Twitch, YouTube Live, or the Discord stage, just share your live link and start.",
  },
  {
    title: "Instant results",
    description: "See community consensus form in real time. Every vote counts; every opinion matters.",
  },
];

export default function GoLive() {
  return (
    <section className="feature_highlight_section go_live_section">
      <div className="container">
        <div className="my_title_div">
          <span>Live</span>
          <h2>Host a Live Tier List — Let Your Audience Vote in Real Time</h2>
          <p>
            Go live and let your community rank along with you. Perfect for streamers, content creators, and anyone who
            wants to turn ranking into a shared experience.
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
          <Link href="/live/create">
            <button type="button">Start a Live Tier List →</button>
          </Link>
          <p>A free account is required to host a live session. Viewing is open to everyone.</p>
        </div>
      </div>
    </section>
  );
}

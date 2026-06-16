import Link from "next/link";

const CATEGORIES = [
  {
    emoji: "🎮",
    name: "Gaming",
    examples: "Smash Ultimate, League of Legends, Tekken 8, Genshin Impact, Honkai Star Rail, Brawl Stars",
  },
  {
    emoji: "🍜",
    name: "Fast Food",
    examples: "Most Overrated Fast Food Items, Best Fast Food Chains Ranked",
  },
  {
    emoji: "🏆",
    name: "Sport",
    examples: "World Cup Jerseys, Best Champions League Finals",
  },
  {
    emoji: "🐉",
    name: "Pokémon",
    examples: "Best Legendary Pokémon, Most Adorable Baby Pokémon",
  },
  {
    emoji: "🎬",
    name: "Anime",
    examples: "Best Anime Series of All Time, Top Anime Characters 2026",
  },
  {
    emoji: "🎵",
    name: "Music",
    examples: "Best Singers of 2026, Worst Grammy Snubs Ever",
  },
  {
    emoji: "🦸",
    name: "Marvel",
    examples: "Marvel Ultimate Alliance Roster, Marvel Boss Fights Tier List",
  },
  {
    emoji: "🚗",
    name: "Cars",
    examples: "Premium Luxury Car Brands, Best Cars for Difficult Terrains",
  },
];

export default function FeaturedCategories() {
  return (
    <section className="featured_categories_section">
      <div className="container">
        <div className="my_title_div">
          <span>Explore</span>
          <h2>Find Your Category and Start Ranking</h2>
          <p>From gaming battles to fast food debates, every topic has its own category here.</p>
        </div>
        <div className="row g-4 landing_category_grid">
          {CATEGORIES.map((cat) => (
            <div className="col-lg-6 col-md-6 col-sm-12" key={cat.name}>
              <div className="landing_category_card">
                <h5>
                  {cat.emoji} {cat.name}
                </h5>
                <p>{cat.examples}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="btn_load_more">
          <Link href="/app/templates">
            <button type="button">Browse All Templates →</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

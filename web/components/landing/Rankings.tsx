const RANKINGS = [
  { template: "Best Champions League Finals", category: "Sport", votes: 116 },
  { template: "Marvel Boss Fights Tier List", category: "Marvel", votes: 88 },
  { template: "Smash Ultimate", category: "Gaming", votes: 234 },
  { template: "Best Legendary Pokémon", category: "Pokémon", votes: 147 },
  { template: "Top Anime Characters 2026", category: "Anime", votes: 203 },
  { template: "Best Singers of 2026", category: "Music", votes: 91 },
];

export default function Rankings() {
  return (
    <section className="rankings_section">
      <div className="container">
        <div className="ranking_card_body_div">
          <div className="my_title_div">
            <span>Community</span>
            <h2>What Creators Are Ranking Right Now</h2>
            <p>Real tier lists from real people, updated live.</p>
          </div>
          <div className="landing_rankings_table_wrap">
            <table className="landing_rankings_table">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Category</th>
                  <th>Votes</th>
                </tr>
              </thead>
              <tbody>
                {RANKINGS.map((row) => (
                  <tr key={row.template}>
                    <td>{row.template}</td>
                    <td>{row.category}</td>
                    <td>{row.votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

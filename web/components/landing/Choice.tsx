"use client";

import Link from "next/link";

const COMPARISON_ROWS = [
  { feature: "100% Free, No Paywalls Ever", us: true, others: false },
  { feature: "Start Without an Account", us: true, others: false },
  { feature: "Create a Tier List in Under 60 Seconds", us: true, others: false },
  { feature: "Built-In Meme Maker", us: true, others: false },
  { feature: "Host Live Community Votes", us: true, others: false },
  { feature: "Real-Time Community Rankings", us: true, others: false },
  { feature: "Clean, Distraction-Free Design", us: true, others: false },
  { feature: "Fully Responsive on Mobile & Desktop", us: true, others: false },
  { feature: "Unlimited Tier Lists", us: true, others: false },
  { feature: "Save & Edit Your Lists Anytime", us: "free account", others: false },
  { feature: "Personal Profile with Your Rankings", us: true, others: false },
  { feature: "Custom Images & Labels", us: true, others: false },
];

function CellIcon({ value }: { value: boolean | string }) {
  if (value === true) {
    return <span className="comparison_check">✅</span>;
  }
  if (value === "free account") {
    return <span className="comparison_note">✅ (free account)</span>;
  }
  return <span className="comparison_cross">❌</span>;
}

export default function Choice() {
  return (
    <section className="choice_section">
      <div className="container">
        <div className="my_title_div">
          <span>The Smarter Choice</span>
          <h2>Everything You Need to Rank Anything</h2>
          <p>Fast, free, and built for creators who actually want to make something worth sharing.</p>
        </div>
        <div className="comparison_table_wrap">
          <table className="comparison_table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>TheTierMaker</th>
                <th>Others</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>
                    <CellIcon value={row.us} />
                  </td>
                  <td>
                    <CellIcon value={row.others} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="comparison_note_below">
          Saving, voting, and hosting live sessions require a free account, takes 30 seconds, no card needed.
        </p>
        <div className="choice_cta_wrap">
          <Link href="/register" className="choice_cta_btn">
            Create Your Free Account →
          </Link>
        </div>
      </div>
    </section>
  );
}

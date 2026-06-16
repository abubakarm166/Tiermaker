"use client";

import WorkTabs from "./WorkTabs";
import Link from "next/link";

export default function RecentWork() {
  return (
    <section className="recentwork_section">
      <div className="container">
        <div className="my_title_div">
          <span>Fresh</span>
          <h2>Latest Tier Lists Just Dropped</h2>
          <p>See what fans, gamers, and creators are debating right now.</p>
        </div>
        <WorkTabs />
        <div className="btn_load_more">
          <Link href="/app/lists/feed">
            <button type="button">Browse All Lists →</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

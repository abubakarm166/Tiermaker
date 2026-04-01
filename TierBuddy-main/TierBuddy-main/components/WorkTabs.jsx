"use client";

// ✅ Import Bootstrap CSS in _app.js or layout.js — NOT here:
// import "bootstrap/dist/css/bootstrap.min.css";

import { useState } from "react";

const tabData = {
  today: [
    {
      id: 1,
      rank: 1,
      title: "Best Horror Movies of All Time",
      author: "Huntsman Leon",
      items: 45,
      timeAgo: "5 hrs ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
    {
      id: 2,
      rank: 2,
      title: "F126 Cars Ranking",
      author: "Huntsman Leon",
      items: 45,
      timeAgo: "5 hrs ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
    {
      id: 3,
      rank: 3,
      title: "Best Pizza Toppings",
      author: "Huntsman Leon",
      items: 45,
      timeAgo: "5 hrs ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
    {
      id: 4,
      rank: 4,
      title: "Video Game Characters",
      author: "Huntsman Leon",
      items: 45,
      timeAgo: "5 hrs ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
  ],
  yesterday: [
    {
      id: 1,
      rank: 1,
      title: "Top Anime Series",
      author: "Huntsman Leon",
      items: 32,
      timeAgo: "1 day ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
    {
      id: 2,
      rank: 2,
      title: "Best Coffee Brands",
      author: "Huntsman Leon",
      items: 18,
      timeAgo: "1 day ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
    {
      id: 3,
      rank: 3,
      title: "Greatest NBA Players",
      author: "Huntsman Leon",
      items: 25,
      timeAgo: "1 day ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
    {
      id: 4,
      rank: 4,
      title: "Best Rock Albums Ever",
      author: "Huntsman Leon",
      items: 40,
      timeAgo: "1 day ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
  ],
  thisweek: [
    {
      id: 1,
      rank: 1,
      title: "Best Superhero Movies",
      author: "Huntsman Leon",
      items: 60,
      timeAgo: "3 days ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
    {
      id: 2,
      rank: 2,
      title: "Top Travel Destinations",
      author: "Huntsman Leon",
      items: 55,
      timeAgo: "4 days ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
    {
      id: 3,
      rank: 3,
      title: "Best Programming Languages",
      author: "Huntsman Leon",
      items: 22,
      timeAgo: "5 days ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
    {
      id: 4,
      rank: 4,
      title: "Greatest TV Shows",
      author: "Huntsman Leon",
      items: 38,
      timeAgo: "6 days ago",
      avatars: [
        { label: "S", rank: 1 },
        { label: "A", rank: 2 },
        { label: "B", rank: 2 },
        { label: "C", rank: 2 },
      ],
    },
  ],
};

function RecentCard({ card }) {
  return (
    <div className="recent_work_card_body">
      <div className="recent_work_card_top">
        <div className="recent_work_card_header">
          <h3 className="recent_work_card_title">{card.title}</h3>
          <p className="recent_work_card_author"><span>by</span> {card.author}</p>
        </div>
        <div className="recent_work_card_badge">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span>#{card.rank}</span>
        </div>
      </div>

      <div className="recent_work_card_avatars">
        {card.avatars.map((avatar, idx) => (
          <div key={idx} className="recentwork_avatar_wrap">
            <span className="recentwork_avatar_rank">{avatar.rank}</span>
            <div className="recentwork_avatar">{avatar.label}</div>
          </div>
        ))}
      </div>

      <div className="recent_work_card_footer">
        <div className="recent_work_card_meta">
          <div className="recentwork_meta_item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            {card.items} Items
          </div>
          <div className="recentwork_meta_item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {card.timeAgo}
          </div>
        </div>
        <button className="recentwork_view_btn">
          View List
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function WorkTabs() {
  const [activeTab, setActiveTab] = useState("today");

  const cards = tabData[activeTab] || [];

  return (
    <>
      <style>{`
        /* ── Override Bootstrap nav-pills to match design ── */
        
      `}</style>

      {/* ✅ Bootstrap nav nav-pills — controlled by React state */}
      <div className="worktabs_nav_wrap">
        <ul className="nav nav-pills" role="tablist">
          {[
            { key: "today", label: "Today" },
            { key: "yesterday", label: "Yesterday" },
            { key: "thisweek", label: "This Week" },
          ].map((tab) => (
            <li className="nav-item" key={tab.key} role="presentation">
              <button
                className={`nav-link${activeTab === tab.key ? " active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Cards Grid */}
      <div className="recentwork_grid">
        {cards.map((card) => (
          <RecentCard key={card.id} card={card} />
        ))}
      </div>
    </>
  );
}
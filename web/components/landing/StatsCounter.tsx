"use client";

import { useEffect, useState } from "react";

const stats = [
  { value: 500, suffix: "+", label: "TIER LISTS CREATED" },
  { value: 200, suffix: "+", label: "HAPPY CREATORS" },
  { value: 4.8, suffix: " ★", label: "USER RATING" },
  { value: 1.2, suffix: "s", label: "LOAD TIME" },
];

export default function StatsCounter() {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();
    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setCounts(stats.map((stat) => Number((stat.value * progress).toFixed(1))));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <section className="stats_section">
      <div className="container">
        <div className="stats_wrapper">
          {stats.map((stat, i) => (
            <div className="stat_card" key={i}>
              <h2 className="stat_value">
                {counts[i]}
                {stat.suffix}
              </h2>
              <p className="stat_label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

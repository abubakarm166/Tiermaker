"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchCategories } from "@/lib/api";
import { mediaSrc } from "@/lib/media";
import type { Category } from "@/types/api";

const FALLBACK_IMAGES = [
  "/assets/images/f1.jpg",
  "/assets/images/f2.jpg",
  "/assets/images/f3.jpg",
  "/assets/images/f4.jpg",
  "/assets/images/f5.jpg",
  "/assets/images/f6.jpg",
];

function badgeForCategory(count: number, index: number): string | null {
  if (count >= 8) return "Popular";
  if (count >= 3) return "Trending";
  if (count >= 1) return "New";
  return index < 3 ? "New" : null;
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCategories()
      .then((res) => {
        if (!cancelled) setCategories(res.results ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = useMemo(() => {
    const list = [{ id: "all", label: "All Categories" }];
    for (const c of categories) {
      list.push({ id: String(c.id), label: c.name });
    }
    return list;
  }, [categories]);

  const filteredItems = useMemo(() => {
    if (activeTab === "all") return categories;
    const id = Number(activeTab);
    return categories.filter((c) => c.id === id);
  }, [categories, activeTab]);

  return (
    <section className="featured_categories_section">
      <div className="container">
        <div className="my_title_div">
          <span>Live</span>
          <h2>Featured Categories</h2>
          <p>Explore popular topics and start creating tier lists across trending interests</p>
        </div>
        <div className="featured_categories_tabs">
          <ul className="nav nav-pills mb-4 ">
            {tabs.map((cat) => (
              <li className="nav-item" key={cat.id}>
                <button
                  className={`nav-link ${activeTab === cat.id ? "active" : ""}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {loading ? (
          <div className="text-center text-muted py-5">Loading categories…</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center text-muted py-5">
            No categories yet.{" "}
            <Link href="/app/categories" className="link-primary">
              Browse the app
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {filteredItems.map((item, index) => {
              const count = item.template_count ?? 0;
              const img =
                item.image && item.image.trim()
                  ? mediaSrc(item.image)
                  : FALLBACK_IMAGES[item.id % FALLBACK_IMAGES.length];
              const badge = badgeForCategory(count, index);
              const subtext =
                count === 0
                  ? "No templates yet — be the first to add one in this category."
                  : `Browse ${count} tier list template${count === 1 ? "" : "s"} and create your own ranking.`;

              return (
                <div className="col-lg-4 col-md-6 col-sm-12" key={item.id}>
                  <Link href={`/app/categories/${item.id}`} className="text-decoration-none">
                    <div className="category_card_body">
                      {badge && <span className="badge_category">{badge}</span>}
                      <img src={img} className="category_card_img" alt={item.name} />
                      <div className="category_card_text">
                        <h5>{item.name}</h5>
                        <p>{subtext}</p>
                        <span>
                          {count} template{count === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        <div className="btn_load_more">
          <Link href="/app/categories">
            <button type="button">Load More</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

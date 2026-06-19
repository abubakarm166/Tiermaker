"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCategories } from "@/lib/api";
import { formatCategoryExamples, getCategoryEmoji } from "@/lib/categoryDisplay";
import type { Category } from "@/types/api";

function CategoryCardSkeleton() {
  return (
    <div className="col-lg-6 col-md-6 col-sm-12">
      <div className="landing_category_card landing_category_card_skeleton" aria-hidden>
        <div className="landing_category_skeleton_title" />
        <div className="landing_category_skeleton_text" />
        <div className="landing_category_skeleton_text landing_category_skeleton_text_short" />
      </div>
    </div>
  );
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
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

  return (
    <section className="featured_categories_section">
      <div className="container">
        <div className="my_title_div">
          <span>Explore</span>
          <h2>Find Your Category and Start Ranking</h2>
          <p>From gaming battles to fast food debates, every topic has its own category here.</p>
        </div>

        <div className="row g-4 landing_category_grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => <CategoryCardSkeleton key={index} />)
          ) : categories.length === 0 ? (
            <div className="col-12">
              <p className="landing_category_empty">No categories available yet.</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div className="col-lg-6 col-md-6 col-sm-12" key={cat.id}>
                <Link href={`/app/categories/${cat.id}`} className="landing_category_link">
                  <div className="landing_category_card">
                    <h5>
                      {getCategoryEmoji(cat.name)} {cat.name}
                    </h5>
                    <p>{formatCategoryExamples(cat)}</p>
                  </div>
                </Link>
              </div>
            ))
          )}
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

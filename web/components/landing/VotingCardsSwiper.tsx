"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { fetchLiveLandingPreview } from "@/lib/api";
import type { LiveLandingEvent } from "@/types/api";

const POLL_MS = 8000;
const CLOCK_MS = 5000;

function parseUtcMs(iso: string | undefined | null): number | null {
  if (iso == null || String(iso).trim() === "") return null;
  let s = String(iso).trim();
  if (/^\d{4}-\d{2}-\d{2} \d/.test(s)) {
    s = s.replace(" ", "T");
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s += "Z";
  }
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : null;
}

function formatTimeLeft(endsAt: string, nowMs: number): string {
  const endMs = parseUtcMs(endsAt);
  if (endMs == null) return "—";
  if (endMs <= nowMs) return "Ended";
  const ms = endMs - nowMs;
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

const AVATAR_HUES = [32, 200, 280, 140, 12];

export default function VotingCardsSwiper() {
  const [cards, setCards] = useState<LiveLandingEvent[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const load = useCallback(() => {
    return fetchLiveLandingPreview()
      .then((res) => {
        setCards(res.results ?? []);
        setLoadError(false);
      })
      .catch(() => {
        setLoadError(true);
        setCards((prev) => (prev === null ? [] : prev));
      });
  }, []);

  useEffect(() => {
    void load();
    const poll = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(poll);
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), CLOCK_MS);
    return () => window.clearInterval(id);
  }, []);

  const swiperKey = cards?.map((c) => c.id).join("-") ?? "loading";

  return (
    <section className="voting_swiper_section">
      <div className="voting_swiper_wrapper">
        {loadError && cards !== null && cards.length > 0 && (
          <p className="text-center text-xs text-amber-200/90 mb-3">Could not refresh — showing last data.</p>
        )}
        <Swiper
          key={swiperKey}
          modules={[Pagination, A11y]}
          className="voting_swiper_container"
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1}
          breakpoints={{
            480: { slidesPerView: 1.2, spaceBetween: 14 },
            600: { slidesPerView: 1.5, spaceBetween: 16 },
            768: { slidesPerView: 2, spaceBetween: 18 },
            1024: { slidesPerView: 2.2, spaceBetween: 20 },
            1280: { slidesPerView: 2.5, spaceBetween: 22 },
          }}
        >
          {cards === null ? (
            <SwiperSlide>
              <div className="voting_card_body">
                <div className="voting_card_header">
                  <h3 className="voting_card_title">Loading live sessions…</h3>
                  <p className="voting_card_author">Fetching community rankings</p>
                </div>
              </div>
            </SwiperSlide>
          ) : cards.length === 0 ? (
            <SwiperSlide>
              <div className="voting_card_body">
                <div className="voting_card_header">
                  <h3 className="voting_card_title">No live votes right now</h3>
                  <p className="voting_card_author">
                    <span>Host a session from the app — rankings will show here automatically.</span>
                  </p>
                </div>
                <div className="voting_card_footer">
                  <div className="voting_card_meta" />
                  <Link href="/live/create" className="voting_card_vote_btn">
                    Create a live event
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ) : (
            cards.map((card) => (
              <SwiperSlide key={card.id}>
                <Link href={card.invite_url_path} className="voting_card_link block h-full">
                  <div className="voting_card_body">
                    <div className="voting_card_header">
                      <h3 className="voting_card_title">{card.title}</h3>
                      <p className="voting_card_author">
                        by <span>{card.host_display}</span>
                      </p>
                    </div>
                    <div className="voting_card_images">
                      {card.recent_voter_initials.map((initial, idx) => (
                        <div
                          key={`${card.id}-v-${idx}`}
                          className="voting_card_avatar_initial"
                          style={{
                            background: `linear-gradient(135deg, hsl(${AVATAR_HUES[idx % AVATAR_HUES.length]}, 45%, 38%), hsl(${
                              AVATAR_HUES[(idx + 2) % AVATAR_HUES.length]
                            }, 35%, 22%))`,
                          }}
                          title="Participant"
                        >
                          {initial}
                        </div>
                      ))}
                      {card.extra_voters > 0 && (
                        <div className="voting_card_extra_count">+{card.extra_voters}</div>
                      )}
                    </div>
                    <div className="voting_card_footer">
                      <div className="voting_card_meta">
                        <div className="voting_card_meta_item">
                          <svg
                            className="voting_card_meta_icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          {card.vote_count} votes
                        </div>
                        <div className="voting_card_meta_item">
                          <svg
                            className="voting_card_meta_icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {formatTimeLeft(card.ends_at, nowMs)}
                        </div>
                      </div>
                      <span className="voting_card_vote_btn">
                        Cast Your Vote
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </div>
    </section>
  );
}

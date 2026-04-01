"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const votingCards = [
    {
        id: 1,
        title: "Best Valentine's Day Gift Ideas 2026",
        author: "jaequery",
        votes: 5,
        timeLeft: "2d 22h left",
        images: [
            "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop",
        ],
        extraCount: 10,
    },
    {
        id: 2,
        title: "Ice Cream Flavors Tier List",
        author: "jaequery",
        votes: 5,
        timeLeft: "2d 22h left",
        images: [
            "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=80&h=80&fit=crop",
        ],
        extraCount: 2,
    },
    {
        id: 3,
        title: "Best Sci-Fi Movies of All Time",
        author: "jaequery",
        votes: 8,
        timeLeft: "1d 10h left",
        images: [
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1579567761406-4684ee0c75b6?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=80&h=80&fit=crop",
        ],
        extraCount: 5,
    },
    {
        id: 4,
        title: "Top Programming Languages 2026",
        author: "jaequery",
        votes: 12,
        timeLeft: "3d 5h left",
        images: [
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=80&h=80&fit=crop",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=80&h=80&fit=crop",
        ],
        extraCount: 7,
    },
];

export default function VotingCardsSwiper() {
    return (
        <section className="voting_swiper_section">
            <div className="voting_swiper_wrapper">
                <Swiper
                    modules={[Pagination, A11y]}
                    className="voting_swiper_container"
                    pagination={{ clickable: true }}
                    spaceBetween={16}
                    slidesPerView={1}
                    breakpoints={{
                        480: {
                            slidesPerView: 1.2,
                            spaceBetween: 14,
                        },
                        600: {
                            slidesPerView: 1.5,
                            spaceBetween: 16,
                        },
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 18,
                        },
                        1024: {
                            slidesPerView: 2.2,
                            spaceBetween: 20,
                        },
                        1280: {
                            slidesPerView: 2.5,
                            spaceBetween: 22,
                        },
                    }}
                >
                    {votingCards.map((card) => (
                        <SwiperSlide key={card.id}>
                            <div className="voting_card_body">
                                {/* Header */}
                                <div className="voting_card_header">
                                    <h3 className="voting_card_title">{card.title}</h3>
                                    <p className="voting_card_author">
                                        by <span>{card.author}</span>
                                    </p>
                                </div>

                                {/* Image Stack */}
                                <div className="voting_card_images">
                                    {card.images.map((src, idx) => (
                                        <img key={idx} src={src} alt={`Option ${idx + 1}`} className="voting_card_image_item"/>
                                    ))}
                                    <div className="voting_card_extra_count">
                                        +{card.extraCount}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="voting_card_footer">
                                    <div className="voting_card_meta">
                                        {/* Votes */}
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
                                            {card.votes} votes
                                        </div>

                                        {/* Time */}
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
                                            {card.timeLeft}
                                        </div>
                                    </div>

                                    {/* Vote Button */}
                                    <button className="voting_card_vote_btn">
                                        Cast Your Vote
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
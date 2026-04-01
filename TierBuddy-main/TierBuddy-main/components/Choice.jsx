"use client";

const tierbuddyFeatures = [
    "Completely Free, No Restrictions",
    "Built-In Smart Ranking Tools",
    "Start Instantly — No Login Needed",
    "Clean & Intuitive Interface",
    "Modern, Distraction-Free Design",
    "Optimized for Speed & Performance",
    "Fully Responsive on All Devices",
    "Real-Time Community Interaction",
    "Powerful Insights & Engagement Tools",
];

const othersFeatures = [
    "Paywalls on Advanced Features",
    "Limited Creation Tools",
    "Account Required for Full Access",
    "Cluttered & Dated Layout",
    "Slower Performance",
    "Desktop-Heavy Experience",
    "Basic Sharing Options",
    "No Real-Time Interaction",
    "Minimal Reporting or Insights",
];

export default function Choice() {
    return (
        <>
            <section className="choice_section">
                <div className="container">
                    <div className="my_title_div">
                        <span>THE SMARTER CHOICE</span>
                        <h2>Why TierBuddy Outperforms <br /> Other Ranking Platforms</h2>
                        <p>Discover why thousands of creators are switching to a faster, simpler tier list experience.</p>
                    </div>

                    <div className="choice_content_main">
                        <div className="row">
                            <div className="col-lg-6 col-md-12 col-sm-12">
                                <div className="choice_col">
                                    <div className="choice_col_header choice_col_header_tierbuddy">
                                        <div className="choice_col_brand">
                                            🏅 TierBuddy
                                        </div>
                                        <span className="choice_winner_badge">✦ WINNER</span>
                                    </div>

                                    {tierbuddyFeatures.map((feature, idx) => (
                                        <div className="choice_feature_row choice_feature_row_tierbuddy" key={idx}>
                                            <div className="choice_icon_check">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                            <p className="choice_feature_text_good">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-lg-6 col-md-12 col-sm-12">
                                <div className="choice_col">
                                    <div className="choice_col_header choice_col_header_others">
                                        <p className="choice_col_others_label">Other Tier List Makers</p>
                                    </div>

                                    {othersFeatures.map((feature, idx) => (
                                        <div className="choice_feature_row choice_feature_row_others" key={idx}>
                                            <div className="choice_icon_cross">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </div>
                                            <p className="choice_feature_text_bad">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* CTA */}
                    <div className="choice_cta_wrap">
                        <button className="choice_cta_btn">Try TierBuddy Free Today</button>
                        <p className="choice_cta_sub">Join 100,000+ creators who made the switch</p>
                    </div>

                </div>
            </section>
        </>
    );
}
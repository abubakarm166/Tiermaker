"use client";

import Image from "next/image";

const steps = [
    {
        id: 1,
        image: "/assets/images/w1.svg",
        title: "Start with the Editor",
        description:
            "Launch the tier list maker instantly and begin creating — no account or setup needed.",
    },
    {
        id: 2,
        image: "/assets/images/w2.svg",
        title: "Add Your Items",
        description:
            "Drag and drop images into tiers. Upload your own content or use existing templates.",
    },
    {
        id: 3,
        image: "/assets/images/w3.svg",
        title: "Share & Get Votes",
        description:
            "Publish your tier list with one click, share it anywhere, and watch the community interact.",
    },
];

export default function HowWorks() {
    return (
        <section className="howitwork_section">
            <div className="container">
                <div className="howitwork_card_body">
                    {/* Title */}
                    <div className="my_title_div">
                        <span>how it works</span>
                        <h2>How to make a Tier List</h2>
                        <p> Creating tier lists is simple. No signup required — just start
                            building, ranking, and sharing in minutes.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="howitwork_row_main">
                        <div className="row">
                            {/* Steps */}
                            <div className="col-lg-5 col-md-6 col-sm-12">
                                <div className="hiw_steps_col">
                                    {steps.map((step) => (
                                        <div className="hiw_step" key={step.id}>
                                            <div className="hiw_step_left">
                                                <div className="hiw_step_icon">
                                                    <img src={step.image} alt={step.title}/>
                                                </div>
                                                <div className="hiw_step_line" />
                                            </div>
                                            <div className="hiw_step_content">
                                                <h3 className="hiw_step_title">
                                                    {step.title}
                                                </h3>
                                                <p className="hiw_step_desc">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mockup Image */}
                            <div className="col-lg-7 col-md-6 col-sm-12">
                                <div className="hiw_mockup_col">
                                    <img src="/assets/images/MacBook.jpg" alt="How it works" 
                                    className="hiw_mockup_img" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
const steps = [
  {
    id: 1,
    image: "/assets/images/w1.svg",
    title: "Pick a Template or Start Blank",
    description:
      "Browse hundreds of ready-made templates across gaming, anime, sports, fast food, Pokémon, music, cars, and Marvel. Or build a completely custom tier list from scratch with your own images and labels.",
  },
  {
    id: 2,
    image: "/assets/images/w2.svg",
    title: "Drag, Drop & Customize",
    description:
      "Arrange items into your tiers. Upload your own images, edit labels, customize row colors, and add as many tiers as you need. Your list, your rules.",
  },
  {
    id: 3,
    image: "/assets/images/w3.svg",
    title: "Save, Share & Go Viral",
    description:
      "Create a free account to save your list permanently. Then share your link on Twitter, Discord, Reddit, or TikTok and let the world weigh in.",
  },
];

export default function HowWorks() {
  return (
    <section className="howitwork_section">
      <div className="container">
        <div className="howitwork_card_body">
          <div className="my_title_div">
            <span>How It Works</span>
            <h2>Make a Tier List in 3 Simple Steps</h2>
            <p>No downloads. No setup. Just open, drag, and rank.</p>
          </div>
          <div className="howitwork_row_main">
            <div className="row">
              <div className="col-lg-5 col-md-6 col-sm-12">
                <div className="hiw_steps_col">
                  {steps.map((step) => (
                    <div className="hiw_step" key={step.id}>
                      <div className="hiw_step_left">
                        <div className="hiw_step_icon">
                          <img src={step.image} alt={step.title} />
                        </div>
                        <div className="hiw_step_line" />
                      </div>
                      <div className="hiw_step_content">
                        <h3 className="hiw_step_title">{step.title}</h3>
                        <p className="hiw_step_desc">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-7 col-md-6 col-sm-12">
                <div className="hiw_mockup_col">
                  <img src="/assets/images/MacBook.jpg" alt="How it works" className="hiw_mockup_img" />
                </div>
              </div>
            </div>
          </div>
          <p className="howitwork_account_note">
            💾 Create a free account to save your work and vote on community lists. No credit card required, ever.
          </p>
        </div>
      </div>
    </section>
  );
}

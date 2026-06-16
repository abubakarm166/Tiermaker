"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Do I need an account to use TheTierMaker?",
    answer:
      "No — you can start building a tier list right away without an account. You only need a free account to save your list, vote on community rankings, or host a live session.",
  },
  {
    question: "Is it really free?",
    answer: "Yes — 100% free forever. No credit card, no hidden tiers, no paywalls.",
  },
  {
    question: "What is the Meme Maker?",
    answer:
      "It's a built-in tool that lets you create and remix memes — upload an image, add your caption, and share it anywhere. Browse community memes or make your own from scratch.",
  },
  {
    question: "How does the Live feature work?",
    answer:
      "You host a live tier list session and share your link. Your audience votes in real time, and you watch the tier list build based on community votes. Great for streamers and content creators.",
  },
  {
    question: "How do I sign up?",
    answer:
      'Click any "Create Free Account" button. Enter your email and password, or sign up with X (Twitter). Done in under 30 seconds.',
  },
  {
    question: "What happens to my tier lists?",
    answer:
      "All lists saved to your account are stored permanently. You can edit, share, or delete them any time from your profile.",
  },
  {
    question: "Can I use my own images?",
    answer:
      "Yes. You can upload your own images to any tier list or create a fully custom template from scratch.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faq_section">
      <div className="container">
        <div className="my_title_div">
          <h2>Frequently Asked Questions</h2>
        </div>
        <div className="faq_list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div className={`faq_item${isOpen ? " faq_item_open" : ""}`} key={item.question}>
                <button
                  type="button"
                  className="faq_question"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  {item.question}
                  <span className="faq_toggle">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p className="faq_answer">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

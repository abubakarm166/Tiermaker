"use client";

import { useState, type ReactNode } from "react";

export type LegalFaqItem = {
  question: string;
  answer: ReactNode;
};

type LegalFAQProps = {
  items: LegalFaqItem[];
};

export default function LegalFAQ({ items }: LegalFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="legal-faq">
      <div className="faq_list">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div className={`faq_item${isOpen ? " faq_item_open" : ""}`} key={item.question}>
              <button
                type="button"
                className="faq_question"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="faq_question_text">{item.question}</span>
                <span className="faq_toggle" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && <div className="faq_answer">{item.answer}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

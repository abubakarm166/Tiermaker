"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const mailSubject = encodeURIComponent(subject);
    window.location.href = `mailto:support@thetiermaker.com?subject=${mailSubject}&body=${body}`;
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label htmlFor="contact-name">Your name (required)</label>
      <input
        id="contact-name"
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="contact-email">Your email address (required)</label>
      <input
        id="contact-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label htmlFor="contact-subject">Subject (required)</label>
      <input
        id="contact-subject"
        type="text"
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <label htmlFor="contact-message">Message (required)</label>
      <textarea
        id="contact-message"
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button type="submit">Send Message</button>
    </form>
  );
}

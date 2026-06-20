import type { Metadata } from "next";
import Link from "next/link";
import LegalArticle from "@/components/legal/LegalArticle";

export const metadata: Metadata = {
  title: "About Us | TheTierMaker",
  description:
    "Learn about TheTierMaker, the free tier list maker built by creators for creators. Our mission, story, and why we built the fastest tier list platform online.",
};

export default function AboutPage() {
  return (
    <LegalArticle title="About Us">
      <h2>Our Mission</h2>
      <p>
        <strong>Make tier list creation fast, free, and fun for everyone.</strong>
      </p>
      <p>
        That is our mission. Nothing more. Nothing less. We believe ranking things should be simple, no tutorial, no
        paywalls, no slow pages. Just drag, drop, and share. That is why we built TheTierMaker.
      </p>

      <h2>The Problem We Saw</h2>
      <p>
        Before TheTierMaker, creating a tier list meant compromises: paying for basic features, slow cluttered
        interfaces, difficulty sharing lists, and no real-time community rankings. Existing tier list makers felt stuck
        in the past.
      </p>

      <h2>The Solution We Built</h2>
      <ul>
        <li>
          <strong>Speed first.</strong> Pages load in under 1.5 seconds.
        </li>
        <li>
          <strong>Simple by design.</strong> Create your first tier list within 60 seconds of signing up.
        </li>
        <li>
          <strong>Community driven.</strong> Real-time rankings show what the community truly thinks.
        </li>
        <li>
          <strong>Completely free.</strong> Core features are never locked behind a paywall.
        </li>
      </ul>

      <h2>Who We Are</h2>
      <p>
        We are a small team of developers, designers, and tier list enthusiasts, gamers, anime fans, and people who
        love ranking things and debating the results. TheTierMaker started as a side project when we could not find a
        tier list maker that did not annoy us.
      </p>
      <p>
        Today, over 500 creators have published tier lists on TheTierMaker, from video game characters to fast food
        chains to World Cup jerseys. And we are just getting started.
      </p>

      <h2>What Makes Us Different</h2>
      <p>
        <strong>Free accounts for saving and sharing.</strong> Browse and start building without an account. Create a free
        account to save lists permanently, vote on community rankings, and host live sessions.
      </p>
      <p>
        <strong>We listen to users.</strong> Live voting, meme maker, community feed, features built from your requests.
      </p>

      <h2>Our Values</h2>
      <ul>
        <li>
          <strong>Transparency</strong>: plain-English policies (
          <Link href="/privacy">Privacy</Link>, <Link href="/terms">Terms</Link>)
        </li>
        <li>
          <strong>Fairness</strong>: no premium tiers, free means free
        </li>
        <li>
          <strong>Quality</strong>: we test before we ship and fix bugs quickly
        </li>
        <li>
          <strong>Community</strong>: your tier lists inspire other creators
        </li>
      </ul>

      <h2>Our Templates</h2>
      <p>
        Templates across gaming, anime, sports, fast food, Pokémon, music, Marvel, and cars, Smash Ultimate, League of
        Legends, Genshin Impact, World Cup jerseys, and more.{" "}
        <Link href="/app/templates">Browse all templates →</Link>
      </p>

      <h2>Our Future</h2>
      <p>
        More templates, better collaboration, advanced analytics, API access, and native mobile apps, all while keeping
        tier list creation fast, free, and fun.
      </p>

      <h2>Join Us</h2>
      <p>
        Whether you are settling an anime debate, ranking every game you have played, or having fun with friends,
        TheTierMaker is here for you.{" "}
        <Link href="/register">Sign up free →</Link>
      </p>
      <p>Thank you for being part of our community.</p>
      <p>
        <em>The TheTierMaker Team</em>
      </p>
    </LegalArticle>
  );
}

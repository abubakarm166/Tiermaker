import type { Metadata } from "next";
import Link from "next/link";
import LegalArticle from "@/components/legal/LegalArticle";

export const metadata: Metadata = {
  title: "How to Make a Tier List: Step-by-Step Guide | TheTierMaker",
  description:
    "Learn how to make a tier list in minutes. Pick a topic, set your tiers, rank your items, and share. Free tier list maker, no account needed to start.",
};

export default function HowToMakeTierListPage() {
  return (
    <LegalArticle title="How to Make a Tier List: The Complete Step-by-Step Guide">
      <p>
        You&apos;ve seen them everywhere — on Reddit, TikTok, YouTube, and Discord. Someone drops a tier list ranking
        every Pokémon, fast food chain, or Marvel movie, and suddenly the whole comment section is on fire. This guide
        walks you through how to make a tier list from scratch, what the tiers mean, and how to share it so people
        actually engage.
      </p>
      <p>
        <Link href="/app/templates" className="legal-cta-link">
          Start Your Tier List Free →
        </Link>
      </p>

      <h2>What Is a Tier List, and Where Did It Come From?</h2>
      <p>
        A tier list is a ranking system. You sort items into rows from best to worst, each labeled S, A, B, C, D, or F.
        The format started in fighting game communities — &quot;S&quot; comes from the Japanese word &quot;saikou&quot;
        (最高), meaning &quot;the best.&quot; Now it&apos;s one of the most shared content formats on the internet.
      </p>

      <h2>Understanding the Tier System — S, A, B, C, D, F</h2>
      <ul>
        <li>
          <strong>S Tier:</strong> The best of the best — keep this tier small (2–4 items max)
        </li>
        <li>
          <strong>A Tier:</strong> Excellent, just short of S
        </li>
        <li>
          <strong>B Tier:</strong> Good, solid, reliable
        </li>
        <li>
          <strong>C Tier:</strong> Average — fine but not exciting
        </li>
        <li>
          <strong>D Tier:</strong> Below average
        </li>
        <li>
          <strong>F Tier:</strong> The worst — use sparingly
        </li>
      </ul>

      <h2>How to Choose a Topic</h2>
      <p>Ask yourself:</p>
      <ol>
        <li>Do I know enough about this to rank it fairly?</li>
        <li>Is there genuine debate here?</li>
        <li>Is the scope manageable (10–30 items is ideal)?</li>
      </ol>
      <p>
        Popular topics: gaming characters, anime series, fast food chains, sports teams, music albums, Pokémon,
        movies, and more.
      </p>

      <h2>Setting Your Criteria</h2>
      <p>
        Before you rank anything, define what &quot;good&quot; means for your list. Write your criteria in the tier list
        description so readers know what they&apos;re looking at.
      </p>

      <h2>Build Your Tier List on TheTierMaker</h2>
      <h3>Step 1: Open the Tier List Maker</h3>
      <p>
        Go to <Link href="/app/templates">TheTierMaker templates</Link>. Browse ready-made templates or start blank with
        your own images.
      </p>
      <h3>Step 2: Set Up Your Tiers</h3>
      <p>Rename tiers, add or remove rows, and customize colors to match your topic.</p>
      <h3>Step 3: Rank Your Items</h3>
      <p>
        Drag items into tiers. Start with obvious S-tier and F-tier picks, then fill in the middle. Compare items
        against each other rather than judging in a vacuum.
      </p>
      <h3>Step 4: Customize and Share</h3>
      <p>
        Add a title and description. Create a free account to save permanently and get a shareable link for Twitter,
        Discord, Reddit, or TikTok.
      </p>

      <h2>Common Tier List Mistakes</h2>
      <ul>
        <li>Putting too many things in S tier</li>
        <li>Not explaining your criteria</li>
        <li>Ranking things you do not actually know</li>
        <li>Making the topic too broad</li>
        <li>Never updating competitive game lists after patches</li>
      </ul>

      <h2>How to Make Your Tier List Go Viral</h2>
      <ul>
        <li>Post a strong opinion in the caption, not a soft question</li>
        <li>Share where the community lives (Reddit, Discord, game subreddits)</li>
        <li>Time it to current moments (patches, seasons, tournaments)</li>
        <li>Include one or two slightly controversial placements</li>
        <li>Keep the visual clean and easy to read at a glance</li>
      </ul>

      <h2>Frequently Asked Questions</h2>
      <p>
        <strong>What does S tier mean?</strong> The highest ranking — reserved for truly exceptional items.
      </p>
      <p>
        <strong>Do I need an account?</strong> You can browse and explore without one. A free account is required to
        save lists permanently and share via link.
      </p>
      <p>
        <strong>Can I use my own images?</strong> Yes — upload custom images or build a template from scratch.
      </p>

      <h2>Ready? Start Your Tier List Right Now</h2>
      <p>
        <Link href="/register">Build Your Free Tier List →</Link>
      </p>
    </LegalArticle>
  );
}

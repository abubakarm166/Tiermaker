import type { Metadata } from "next";
import LegalArticle from "@/components/legal/LegalArticle";

export const metadata: Metadata = {
  title: "Acceptable Use Policy | TheTierMaker",
  description:
    "Read our rules for acceptable content and behavior on TheTierMaker. Learn what is prohibited and how we enforce our policies.",
};

export default function AcceptableUsePage() {
  return (
    <LegalArticle title="Acceptable Use Policy" lastUpdated="June 6, 2026">
      <p>
        This Acceptable Use Policy (&quot;AUP&quot;) explains what behavior is allowed on TheTierMaker and what is not.
        It supplements our <a href="/terms">Terms of Service</a>.
      </p>
      <p>
        By creating an account and using our service, you agree to follow this AUP. Violations may result in content
        removal, account suspension, or permanent termination.
      </p>
      <p>
        We want TheTierMaker to be a fun, safe, and welcoming place for everyone. Please help us achieve that by
        following these rules.
      </p>

      <h2>Prohibited Content</h2>
      <p>You may not upload, publish, or share any content that falls into the following categories.</p>

      <h3>Illegal Content</h3>
      <p>You may not post content that violates any local, state, national, or international law. This includes:</p>
      <ul>
        <li>
          <strong>Child sexual abuse material (CSAM).</strong> Absolutely prohibited. We report all CSAM to NCMEC and
          law enforcement.
        </li>
        <li>
          <strong>Copyright and trademark infringement.</strong> See our <a href="/dmca">DMCA Policy</a>.
        </li>
        <li>Terrorism and violent extremism</li>
        <li>Human trafficking and exploitation</li>
        <li>Drug production and distribution</li>
        <li>Hacking and cybercrime</li>
        <li>Counterfeit goods</li>
      </ul>

      <h3>Harmful Content</h3>
      <ul>
        <li>Violence and threats</li>
        <li>Self-harm and suicide encouragement</li>
        <li>Harassment and bullying</li>
        <li>Doxxing (sharing private information without consent)</li>
        <li>Impersonation of celebrities, other users, or TheTierMaker staff</li>
      </ul>

      <h3>Hateful Content</h3>
      <p>
        You may not post content that attacks, degrades, or incites hatred against people based on race, ethnicity,
        national origin, religion, disability, medical condition, age, gender, gender identity, sexual orientation, or
        veteran status.
      </p>
      <p>
        Criticism of ideas, policies, or institutions is allowed. Dehumanization is not.
      </p>

      <h3>Sexually Explicit Content</h3>
      <p>
        You may not post pornography, sexually explicit images, or sexually explicit text. Discussion of romance or
        mature themes in a non-explicit way is allowed.
      </p>

      <h3>Spam and Low-Quality Content</h3>
      <ul>
        <li>Posting the same tier list multiple times</li>
        <li>Including irrelevant links solely for SEO</li>
        <li>Creating tier lists with no meaningful content</li>
        <li>Using bots or scripts to create accounts, vote, or post</li>
        <li>Selling or trading votes</li>
      </ul>

      <h3>Misinformation and Deception</h3>
      <p>
        You may not post content that intentionally deceives people about important matters, including false medical
        advice, election fraud conspiracy theories presented as fact, or deepfakes presented as real videos.
      </p>

      <h3>Commercial Activities</h3>
      <p>
        Our service is for personal, non-commercial use unless you have our written permission. Linking to your YouTube,
        Twitch, or TikTok is allowed. Unsolicited advertising is not.
      </p>

      <h2>Prohibited Behaviors (Actions)</h2>
      <h3>Manipulating Votes</h3>
      <p>
        You may not use multiple accounts, bots, paid votes, or vote-trading schemes to artificially influence voting.
      </p>
      <h3>Abusing Our Infrastructure</h3>
      <p>
        You may not launch DDoS attacks, run unauthorized scrapers, attempt to hack our code, or upload malware.
      </p>
      <h3>Evading Bans or Suspensions</h3>
      <p>
        If we suspend your account, you may not create a new account to evade the suspension.
      </p>
      <h3>Harassing Other Users</h3>
      <p>
        You may not use our platform to send threatening messages, follow users to leave negative comments, or encourage
        others to harass a user.
      </p>

      <h2>Enforcement Process</h2>
      <h3>Moderation Methods</h3>
      <ul>
        <li>Automated filters for images, text, and voting patterns</li>
        <li>User reports via the Report button</li>
        <li>Proactive moderation by our team</li>
      </ul>
      <h3>Penalties</h3>
      <div className="contact-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Examples</th>
              <th>First Violation</th>
              <th>Second Violation</th>
              <th>Third+</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Low</td>
              <td>Mildly inappropriate language, off-topic</td>
              <td>Warning + content removal</td>
              <td>7-day suspension</td>
              <td>30-day suspension</td>
            </tr>
            <tr>
              <td>Medium</td>
              <td>Harassment, spam, vote manipulation</td>
              <td>7-day suspension + content removal</td>
              <td>30-day suspension</td>
              <td>Permanent ban</td>
            </tr>
            <tr>
              <td>High</td>
              <td>Hate speech, threats, doxxing</td>
              <td>30-day suspension + content removal</td>
              <td>Permanent ban</td>
              <td>N/A</td>
            </tr>
            <tr>
              <td>Severe</td>
              <td>CSAM, terrorism, hacking</td>
              <td>Permanent ban + law enforcement report</td>
              <td>N/A</td>
              <td>N/A</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>We decide at our discretion. The table above is a guideline, not a contract.</p>

      <h3>Appeals</h3>
      <p>
        If you believe we made a mistake, email{" "}
        <a href="mailto:appeals@thetiermaker.com">appeals@thetiermaker.com</a> with your username, what action was
        taken, why you believe it was a mistake, and any supporting evidence. We respond within 5–7 business days.
      </p>

      <h2>Reporting Violations</h2>
      <p>
        Click the &quot;Report&quot; button on any tier list, select a reason, and submit. We review reports within
        24–48 hours.
      </p>
      <p>
        For emergencies (violence threats, CSAM), email{" "}
        <a href="mailto:abuse@thetiermaker.com">abuse@thetiermaker.com</a> with &quot;URGENT&quot; in the subject line.
      </p>

      <h2>Changes to This AUP</h2>
      <p>
        We may update this Acceptable Use Policy occasionally. We update the &quot;Last Updated&quot; date and may post
        a notice on our website for material changes. Your continued use after changes means you accept the updated AUP.
      </p>
    </LegalArticle>
  );
}

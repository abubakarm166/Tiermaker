import type { Metadata } from "next";
import LegalArticle from "@/components/legal/LegalArticle";

export const metadata: Metadata = {
  title: "Cookie Policy | TheTierMaker",
  description:
    "Learn how TheTierMaker uses cookies to improve your experience. Find out how to manage or disable cookies in your browser settings.",
};

export default function CookiesPage() {
  return (
    <LegalArticle title="Cookie Policy" lastUpdated="June 6, 2026">
      <h2>What Are Cookies?</h2>
      <p>
        Cookies are small text files that websites place on your computer, phone, or tablet when you visit. They help
        websites remember information about your visit, such as your login status, preferences, and what you clicked
        on.
      </p>
      <p>
        Cookies are not viruses. They cannot access your hard drive or steal personal information directly. There are
        session cookies (deleted when you close your browser) and persistent cookies (remain until they expire).
      </p>

      <h2>Why We Use Cookies</h2>
      <ul>
        <li>
          <strong>Authentication</strong>: keep you logged in without re-entering your password on every page
        </li>
        <li>
          <strong>Saving your work</strong>: restore tier list drafts if your browser crashes
        </li>
        <li>
          <strong>Preferences</strong>: remember view settings and editor choices
        </li>
        <li>
          <strong>Security</strong>: detect fraud and vote manipulation
        </li>
        <li>
          <strong>Analytics</strong>: understand how people use TheTierMaker (Google Analytics)
        </li>
        <li>
          <strong>Advertising</strong>: show relevant ads via Google AdSense
        </li>
      </ul>
      <p>
        For more about personal data, see our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>Types of Cookies We Use</h2>
      <h3>Strictly Necessary Cookies</h3>
      <div className="contact-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Cookie Name</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>session_id</td>
              <td>Keeps you logged in during your visit</td>
              <td>Session</td>
            </tr>
            <tr>
              <td>auth_token</td>
              <td>Remembers you when you return</td>
              <td>30 days</td>
            </tr>
            <tr>
              <td>csrf_token</td>
              <td>Prevents cross-site request forgery</td>
              <td>Session</td>
            </tr>
            <tr>
              <td>tierlist_draft</td>
              <td>Saves your in-progress tier list</td>
              <td>24 hours</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <strong>Can I disable these?</strong> No. Blocking strictly necessary cookies prevents login and tier list
        creation.
      </p>

      <h3>Analytics Cookies (Google Analytics)</h3>
      <p>
        Cookies such as <code>_ga</code>, <code>_gid</code>, and <code>_gat</code> track page views and usage patterns.
        Opt out via the{" "}
        <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
          Google Analytics Opt-out Browser Add-on
        </a>
        .
      </p>

      <h3>Advertising Cookies (Google AdSense)</h3>
      <p>
        Cookies such as <code>__gads</code> and <code>__gac</code> show relevant ads. Opt out at{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          adssettings.google.com
        </a>
        .
      </p>

      <h2>Third-Party Cookies</h2>
      <p>
        Google places analytics and advertising cookies. Social platforms may place cookies when you share tier lists.
        Embedded content (YouTube, etc.) may also set cookies we do not control.
      </p>

      <h2>How to Manage Cookies</h2>
      <h3>Browser Settings</h3>
      <p>
        Chrome, Firefox, Safari, and Edge all let you block or delete cookies in privacy settings. Blocking all cookies
        prevents account creation, login, and tier list saving.
      </p>
      <h3>Opting Out of Personalized Ads</h3>
      <ul>
        <li>
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
            adssettings.google.com
          </a>
        </li>
        <li>
          <a href="https://optout.networkadvertising.org" target="_blank" rel="noopener noreferrer">
            optout.networkadvertising.org
          </a>
        </li>
        <li>
          <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">
            optout.aboutads.info
          </a>
        </li>
      </ul>

      <h2>Changes to This Cookie Policy</h2>
      <p>
        We may update this policy occasionally. We update the date at the top and post a notice on our website for
        material changes.
      </p>

      <h2>Contact Us</h2>
      <p>
        Email: <a href="mailto:privacy@thetiermaker.com">privacy@thetiermaker.com</a> (subject: Cookie Policy Question)
        <br />
        Governed by our <a href="/terms">Terms of Service</a>.
      </p>
    </LegalArticle>
  );
}

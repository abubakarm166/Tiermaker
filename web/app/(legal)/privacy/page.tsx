import type { Metadata } from "next";
import LegalArticle from "@/components/legal/LegalArticle";

export const metadata: Metadata = {
  title: "Privacy Policy | TheTierMaker",
  description:
    "Read how TheTierMaker collects, uses, and protects your personal data. Your privacy matters. Learn about cookies, ads, and your legal rights.",
};

export default function PrivacyPage() {
  return (
    <LegalArticle title="Privacy Policy" lastUpdated="June 6, 2026">
      <p>
        This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you visit
        our website, create an account, or use our tier list maker tool.
      </p>
      <p>
        We are committed to being transparent about our data practices. By using TheTierMaker, you agree to the terms
        described in this policy. If you do not agree, please do not create an account or use our services.
      </p>
      <p>
        We comply with applicable privacy laws, including the General Data Protection Regulation (GDPR) for users in
        Europe and the California Consumer Privacy Act (CCPA) for California residents.
      </p>

      <h2>Information We Collect</h2>
      <h3>Information You Give Us</h3>
      <p>When you create an account, we ask for your email address and a password (stored securely using hashing).</p>
      <p>
        When you create tier lists, we collect images you upload, text labels, rankings, tier assignments, and any
        descriptions you write. When you vote on other users&apos; tier lists, we record your vote and associate it with
        your account.
      </p>
      <h3>Information Collected Automatically</h3>
      <p>
        When you visit our website, we automatically collect your IP address, browser type, device type, operating
        system, pages visited, time spent, date and time of visit, and referring website. We use cookies and similar
        technologies to collect this data.
      </p>
      <h3>Information from Third Parties</h3>
      <p>
        If you sign up using X (Twitter) or other social login providers, we receive your email address and profile
        information as permitted by that provider. We do not store your social media passwords.
      </p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>To provide our service — create, save, and edit tier lists</li>
        <li>To personalize your experience based on past activity</li>
        <li>To communicate with you — welcome emails, password resets, service updates</li>
        <li>To improve our website through analytics</li>
        <li>To prevent abuse, spam, and vote manipulation</li>
        <li>To serve advertisements via Google AdSense</li>
        <li>To comply with legal obligations</li>
      </ul>

      <h2>How We Share Your Information</h2>
      <p>
        <strong>We do not sell your personal information to third parties.</strong>
      </p>
      <p>
        Public tier lists become visible to everyone when published. Service providers (hosting, email, analytics)
        receive only the data necessary to perform their tasks. We may disclose information when required by law or in
        connection with a business transfer, with notice to users.
      </p>

      <h2>Your Choices and Rights</h2>
      <h3>Access and Correction</h3>
      <p>You can view and update your account information by logging in and visiting your profile settings.</p>
      <h3>Deletion (Right to be Forgotten)</h3>
      <p>
        You can request account deletion by emailing{" "}
        <a href="mailto:privacy@thetiermaker.com">privacy@thetiermaker.com</a>. Your tier lists are removed; votes are
        anonymized. Backup copies may be retained for up to 30 days.
      </p>
      <h3>Data Portability</h3>
      <p>
        You can request a copy of your data in a machine-readable format. We will provide this within 30 days.
      </p>
      <h3>Opt-Out of Marketing Emails</h3>
      <p>Every promotional email includes an unsubscribe link. Essential service emails cannot be opted out of.</p>

      <h2>Cookies and Tracking Technologies</h2>
      <p>
        We use essential, preference, analytics, and advertising cookies. For full details, see our{" "}
        <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>Advertising and Google AdSense</h2>
      <p>
        We display advertisements through Google AdSense to keep our service free. You can opt out of personalized
        advertising at{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          adssettings.google.com
        </a>
        . Our website is not directed to children under 13.
      </p>

      <h2>Data Security</h2>
      <p>
        Passwords are hashed using bcrypt. All data transmission uses HTTPS/TLS. Only authorized employees have
        database access. We notify affected users within 72 hours of discovering a significant data breach.
      </p>

      <h2>Children&apos;s Privacy</h2>
      <p>
        Our service is intended for users age 13 and older. Contact{" "}
        <a href="mailto:privacy@thetiermaker.com">privacy@thetiermaker.com</a> if you believe a child under 13 has
        created an account.
      </p>

      <h2>International Data Transfers</h2>
      <p>
        Our servers are located in the United States. EEA users&apos; data may be transferred to the US under Standard
        Contractual Clauses.
      </p>

      <h2>Retention of Data</h2>
      <p>
        We keep personal information while your account is active. Server logs are kept for 90 days, then deleted.
      </p>

      <h2>Third-Party Links</h2>
      <p>
        Our website may link to third-party sites (Twitter, Reddit, etc.). We are not responsible for their privacy
        practices.
      </p>

      <h2>Changes to This Privacy Policy</h2>
      <p>
        We may update this policy occasionally. We will update the date at the top and notify registered users of
        material changes.
      </p>

      <h2>Contact Us</h2>
      <p>
        Email: <a href="mailto:privacy@thetiermaker.com">privacy@thetiermaker.com</a>
        <br />
        For GDPR requests (Europe): privacy@thetiermaker.com
        <br />
        For CCPA requests (California): privacy@thetiermaker.com with &quot;CCPA Request&quot; in the subject line
      </p>
      <p>
        Your use of TheTierMaker is also governed by our <a href="/terms">Terms of Service</a> and{" "}
        <a href="/acceptable-use">Acceptable Use Policy</a>.
      </p>
    </LegalArticle>
  );
}

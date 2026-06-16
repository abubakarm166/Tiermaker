import type { Metadata } from "next";
import LegalArticle from "@/components/legal/LegalArticle";

export const metadata: Metadata = {
  title: "Terms of Service | TheTierMaker",
  description:
    "By using TheTierMaker, you agree to our Terms of Service. Learn about account rules, prohibited content, and what happens if you violate our terms.",
};

export default function TermsPage() {
  return (
    <LegalArticle title="Terms of Service" lastUpdated="June 6, 2026">
      <h2>Agreement to Terms</h2>
      <p>
        Welcome to TheTierMaker. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our
        website, tier list maker tool, and related services.
      </p>
      <p>
        By creating an account, using our website, or publishing a tier list, you agree to be bound by these Terms. If
        you do not agree, do not create an account or use our services.
      </p>
      <p>
        We may update these Terms occasionally. The &quot;Last Updated&quot; date at the top of this page indicates when
        we made changes. Your continued use after changes means you accept the new Terms.
      </p>

      <h2>Eligibility</h2>
      <p>You may only use TheTierMaker if:</p>
      <ul>
        <li>You are at least 13 years old</li>
        <li>You are not located in a country subject to US trade sanctions</li>
        <li>You have not been previously banned from our service</li>
        <li>You can form a legally binding contract</li>
      </ul>
      <p>
        If you are between 13 and 18, you confirm that you have permission from a parent or legal guardian to use our
        service.
      </p>
      <p>We reserve the right to refuse service to anyone for any reason, at our sole discretion.</p>

      <h2>Creating an Account</h2>
      <p>
        To save tier lists, vote on community rankings, or host live sessions, you must create a free account. You may
        browse and start building without an account, but saving and certain features require login.
      </p>
      <p>What you need to provide:</p>
      <ul>
        <li>A valid email address</li>
        <li>A password</li>
      </ul>
      <p>You agree to:</p>
      <ul>
        <li>Provide accurate and complete information</li>
        <li>Update your information if it changes</li>
        <li>Keep your password confidential</li>
        <li>Do not share your account with anyone else</li>
        <li>Notify us immediately if you suspect unauthorized access</li>
      </ul>
      <p>
        You are responsible for everything that happens under your account, even if someone else used it without your
        permission.
      </p>

      <h2>Using Our Service</h2>
      <h3>What You Can Do</h3>
      <p>You may use TheTierMaker to:</p>
      <ul>
        <li>Create tier lists about any lawful topic</li>
        <li>Vote on other users&apos; tier lists</li>
        <li>Share your tier lists on social media</li>
        <li>Browse templates and categories</li>
        <li>Host or join live tier list voting sessions</li>
        <li>Create and remix memes</li>
      </ul>
      <h3>What You Cannot Do</h3>
      <p>You may NOT use our service to post illegal content, harmful content, manipulate voting, abuse our
        infrastructure, or break our rules. See our <a href="/acceptable-use">Acceptable Use Policy</a> for full details.
      </p>
      <p>Violating these rules may result in immediate account suspension or termination, without prior notice.</p>

      <h2>User-Generated Content</h2>
      <p>
        You own the content you create. This includes the tier lists you make, the images you upload, and the text
        labels you add.
      </p>
      <p>
        <strong>What we do not own.</strong> We do not claim ownership of your content. You keep all rights to your
        original work.
      </p>
      <p>
        <strong>What we need from you.</strong> By publishing a tier list, you grant us a non-exclusive, worldwide,
        royalty-free license to display your tier list on our website, store it in our database, and allow other users
        to view, vote on, and share your tier list. This license ends when you delete your tier list. However, if
        others have already shared your list, those copies may persist.
      </p>
      <p>
        <strong>Your responsibility.</strong> You promise that you own the content you upload or have permission to use
        it, your content does not violate any laws, and your content does not infringe anyone else&apos;s rights. If
        you upload an image you do not own, you are responsible for any copyright claims.
      </p>

      <h2>Prohibited Content (Detailed)</h2>
      <p>We take content moderation seriously. The following categories are strictly forbidden:</p>
      <ul>
        <li>
          <strong>Sexual content.</strong> No nudity, pornography, sexual roleplay, or sexually explicit descriptions.
        </li>
        <li>
          <strong>Violence and gore.</strong> No graphic images of dead bodies, severe injuries, or violent acts.
        </li>
        <li>
          <strong>Hate speech.</strong> No content that attacks or degrades people based on protected characteristics.
        </li>
        <li>
          <strong>Harassment.</strong> No targeting specific individuals to mock, threaten, or humiliate them.
        </li>
        <li>
          <strong>Impersonation.</strong> Do not pretend to be someone else.
        </li>
        <li>
          <strong>Spam.</strong> Do not post the same tier list multiple times or include irrelevant links for SEO.
        </li>
        <li>
          <strong>Illegal activities.</strong> Do not promote drug production, hacking tutorials, counterfeit goods, or
          other illegal activity.
        </li>
        <li>
          <strong>Self-harm and suicide.</strong> We remove content that glorifies or encourages self-harm.
        </li>
      </ul>
      <p>We use a combination of automated filters and human moderators to enforce these rules.</p>

      <h2>Account Suspension and Termination</h2>
      <p>
        <strong>First violation (minor).</strong> We may send you a warning and temporarily restrict your ability to
        post or vote.
      </p>
      <p>
        <strong>Second violation.</strong> We may suspend your account for 30 days.
      </p>
      <p>
        <strong>Severe violation.</strong> We may terminate your account immediately, without warning.
      </p>
      <p>
        <strong>At our discretion.</strong> We reserve the right to suspend or terminate any account at any time, for
        any reason.
      </p>
      <p>When your account is terminated, your tier lists are removed, your votes are anonymized, and you lose access
        to content you created.</p>

      <h2>Intellectual Property</h2>
      <p>
        <strong>Our property.</strong> TheTierMaker&apos;s code, design, logo, and branding are owned by us. You may not
        copy, modify, or reverse-engineer our software.
      </p>
      <p>
        <strong>Templates.</strong> The templates we provide are for your use. You may modify them and publish your
        rankings. You may not repackage our templates as your own on another platform.
      </p>
      <p>
        <strong>DMCA and copyright.</strong> If you believe someone has uploaded your copyrighted work without
        permission, see our <a href="/dmca">DMCA Policy</a>. We respond to valid takedown notices.
      </p>

      <h2>Disclaimer of Warranties</h2>
      <p>
        Our service is provided &quot;as is&quot; and &quot;as available.&quot; We make no promises or guarantees about
        uptime, data accuracy, security, or fitness for a particular purpose.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, TheTierMaker and its owners, employees, and affiliates are not liable
        for indirect, incidental, special, or consequential damages, loss of data, revenue, or profits, or damages from
        account suspension or termination.
      </p>
      <p>
        Our total liability to you for any claim related to our service is limited to $100 (USD) or the amount you paid
        us (which is zero, because our service is free).
      </p>

      <h2>Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless TheTierMaker and its employees, owners, and affiliates from
        any claims, damages, losses, or expenses (including legal fees) arising from your violation of these Terms, your
        user-generated content, or your use of our service.
      </p>

      <h2>Governing Law and Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of the State of [Your State], United States, without regard to conflict of
        law principles.
      </p>
      <p>
        If you have a dispute with us, you agree to first contact us at{" "}
        <a href="mailto:legal@thetiermaker.com">legal@thetiermaker.com</a> to try to resolve it informally.
      </p>
      <p>
        If we cannot resolve the dispute within 60 days, either party may submit the dispute to binding arbitration. You
        agree to resolve disputes on an individual basis and may not bring a class action.
      </p>

      <h2>Modifications to Service</h2>
      <p>
        We may change, suspend, or discontinue any part of our service at any time, without notice. We are not liable
        to you if we change or discontinue any feature.
      </p>

      <h2>Entire Agreement</h2>
      <p>
        These Terms, together with our Acceptable Use Policy and DMCA Policy, constitute the entire agreement between
        you and TheTierMaker.
      </p>

      <h2>Contact Information</h2>
      <p>
        Questions about these Terms? Contact us at{" "}
        <a href="mailto:legal@thetiermaker.com">legal@thetiermaker.com</a>
        <br />
        For DMCA takedown notices: <a href="mailto:dmca@thetiermaker.com">dmca@thetiermaker.com</a>
        <br />
        For abuse reports: <a href="mailto:abuse@thetiermaker.com">abuse@thetiermaker.com</a>
      </p>
    </LegalArticle>
  );
}

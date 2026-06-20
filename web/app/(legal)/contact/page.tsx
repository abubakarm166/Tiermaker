import type { Metadata } from "next";
import LegalArticle from "@/components/legal/LegalArticle";
import ContactForm from "@/components/legal/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | TheTierMaker",
  description:
    "Get in touch with TheTierMaker. Contact us for support, business inquiries, abuse reports, or just to say hello. We respond within 24-48 hours.",
};

export default function ContactPage() {
  return (
    <LegalArticle title="Contact Us">
      <h2>We Want to Hear From You</h2>
      <p>
        Questions? Problems? Ideas? Just want to say hello? We read every message. We respond as quickly as we can. Your
        feedback makes TheTierMaker better.
      </p>
      <p>Choose the appropriate contact method below.</p>

      <h2>Quick Contact Options</h2>
      <div className="contact-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reason</th>
              <th>Best Method</th>
              <th>Response Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Technical support</td>
              <td>Support form below</td>
              <td>24 hours</td>
            </tr>
            <tr>
              <td>Bug report</td>
              <td>Support form below</td>
              <td>24 hours</td>
            </tr>
            <tr>
              <td>Feature request</td>
              <td>Support form below</td>
              <td>48 hours</td>
            </tr>
            <tr>
              <td>Business inquiry</td>
              <td>
                <a href="mailto:business@thetiermaker.com">business@thetiermaker.com</a>
              </td>
              <td>2–3 business days</td>
            </tr>
            <tr>
              <td>Abuse report</td>
              <td>
                <a href="mailto:abuse@thetiermaker.com">abuse@thetiermaker.com</a>
              </td>
              <td>24 hours</td>
            </tr>
            <tr>
              <td>DMCA takedown</td>
              <td>
                <a href="mailto:dmca@thetiermaker.com">dmca@thetiermaker.com</a>
              </td>
              <td>1–3 business days</td>
            </tr>
            <tr>
              <td>Privacy question</td>
              <td>
                <a href="mailto:privacy@thetiermaker.com">privacy@thetiermaker.com</a>
              </td>
              <td>3–5 business days</td>
            </tr>
            <tr>
              <td>Just saying hi</td>
              <td>Contact form below</td>
              <td>Whenever we can</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Contact Form</h2>
      <p>Use this form for general questions, support requests, bug reports, and feature ideas. We will reply within 24–48
        hours.</p>
      <ContactForm />

      <h2>Email by Department</h2>
      <p>For faster service, email the appropriate department directly.</p>
      <div className="contact-email-grid">
        <p>
          General inquiries: <a href="mailto:hello@thetiermaker.com">hello@thetiermaker.com</a>
        </p>
        <p>
          Technical support: <a href="mailto:support@thetiermaker.com">support@thetiermaker.com</a>
        </p>
        <p>
          Business and partnerships: <a href="mailto:business@thetiermaker.com">business@thetiermaker.com</a>
        </p>
        <p>
          Abuse reports: <a href="mailto:abuse@thetiermaker.com">abuse@thetiermaker.com</a>
        </p>
        <p>
          DMCA copyright notices: <a href="mailto:dmca@thetiermaker.com">dmca@thetiermaker.com</a>
        </p>
        <p>
          Privacy questions: <a href="mailto:privacy@thetiermaker.com">privacy@thetiermaker.com</a>
        </p>
        <p>
          Legal matters: <a href="mailto:legal@thetiermaker.com">legal@thetiermaker.com</a>
        </p>
        <p>
          Appeals (account suspension): <a href="mailto:appeals@thetiermaker.com">appeals@thetiermaker.com</a>
        </p>
      </div>

      <h2>Frequently Asked Questions (Before You Contact Us)</h2>
      <p>Check these common questions first. You might find an instant answer.</p>

      <h3>Account Questions</h3>
      <p>
        <strong>I forgot my password.</strong> Click &quot;Forgot Password&quot; on the login page. We will send a reset
        link to your email.
      </p>
      <p>
        <strong>How do I delete my account?</strong> Contact{" "}
        <a href="mailto:support@thetiermaker.com">support@thetiermaker.com</a> to request account deletion.
      </p>
      <p>
        <strong>I did not receive my verification email.</strong> Check your spam folder. If it is not there, try
        registering again or contact support.
      </p>

      <h3>Technical Questions</h3>
      <p>
        <strong>The website is slow.</strong> Clear your browser cache. Try a different browser. If the problem continues,
        contact us with your browser name, device type, and location.
      </p>
      <p>
        <strong>My images are not uploading.</strong> Check that your image is under 5MB. Supported formats: JPG, PNG,
        WebP. If your image meets these requirements and still fails, contact us.
      </p>
      <p>
        <strong>Can I use TheTierMaker on my phone?</strong> Yes. Our website works on all modern smartphones.
      </p>

      <h3>Content Questions</h3>
      <p>
        <strong>Why was my tier list removed?</strong> It likely violated our{" "}
        <a href="/acceptable-use">Acceptable Use Policy</a>. Check your email for a notification. You can appeal by
        emailing <a href="mailto:appeals@thetiermaker.com">appeals@thetiermaker.com</a>.
      </p>
      <p>
        <strong>How do I report someone else&apos;s tier list?</strong> Click the &quot;Report&quot; button on the tier
        list page.
      </p>
      <p>
        <strong>Can I edit my tier list after publishing?</strong> Yes. Log in, go to your lists, find your tier list,
        and click &quot;Edit.&quot;
      </p>

      <h3>Billing Questions</h3>
      <p>
        <strong>Is TheTierMaker really free?</strong> Yes. 100% free forever. No premium tiers. No paywalls.
      </p>

      <h3>Privacy Questions</h3>
      <p>
        <strong>Why do I need an account?</strong> Accounts let you save your work, vote on community rankings, and host
        live sessions.
      </p>
      <p>
        <strong>Do you sell my data?</strong> Never. We do not sell your personal information to anyone.
      </p>
      <p>
        <strong>How do I request my data?</strong> Email{" "}
        <a href="mailto:privacy@thetiermaker.com">privacy@thetiermaker.com</a> with &quot;Data Request&quot; in the
        subject line. We will provide your data within 30 days.
      </p>

      <h2>Social Media</h2>
      <p>Follow us for updates, new templates, and community highlights. Links to be added once accounts are created.</p>

      <h2>Office Hours</h2>
      <p>We are a small team. We do not have a physical office open to the public.</p>
      <p>
        <strong>Support hours:</strong> Monday through Friday, 9 AM to 6 PM Eastern Time
      </p>
      <ul>
        <li>Support emails: within 24 hours on weekdays</li>
        <li>Weekend emails: Monday morning</li>
        <li>Abuse reports: within 24 hours (including weekends)</li>
        <li>DMCA notices: within 1–3 business days</li>
      </ul>

      <h2>Response Promise</h2>
      <ul>
        <li>You will get a human response, no automated replies or chatbots.</li>
        <li>You will get a useful response, we explain what we are doing if we cannot solve immediately.</li>
        <li>You will get a timely response, we hit our response time targets 95% of the time.</li>
      </ul>

      <h2>Before You Contact Us</h2>
      <p>
        Please check our FAQ section above first. Many common questions are answered there. If your question is not in
        the FAQ, please contact us. We are happy to help.
      </p>

      <h2>We Appreciate You</h2>
      <p>
        Thank you for using TheTierMaker. Every tier list you create makes our community better. Every vote you cast
        helps someone else discover great content. Every piece of feedback helps us improve. You are the reason we built
        this platform.
      </p>
    </LegalArticle>
  );
}

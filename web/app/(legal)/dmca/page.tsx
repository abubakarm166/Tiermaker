import type { Metadata } from "next";
import LegalArticle from "@/components/legal/LegalArticle";

export const metadata: Metadata = {
  title: "DMCA Policy | TheTierMaker",
  description:
    "Copyright owners can report infringing content using our DMCA process. Learn how to submit a takedown notice or file a counter-notice.",
};

export default function DmcaPage() {
  return (
    <LegalArticle title="DMCA Policy" lastUpdated="June 6, 2026">
      <p>
        TheTierMaker respects the intellectual property rights of others. We comply with the Digital Millennium
        Copyright Act (DMCA), a United States copyright law that provides a process for copyright owners to request
        removal of infringing content.
      </p>
      <p>This DMCA Policy explains:</p>
      <ul>
        <li>How copyright owners can report infringing content on our website</li>
        <li>How users can submit a counter-notice if they believe their content was removed by mistake</li>
        <li>Our repeat infringer policy</li>
      </ul>
      <p>
        This DMCA Policy supplements our <a href="/terms">Terms of Service</a>. We respond to valid DMCA notices
        promptly. We also terminate the accounts of repeat infringers. Copyright infringement also violates our{" "}
        <a href="/acceptable-use">Acceptable Use Policy</a>.
      </p>
      <p>
        If you believe someone has uploaded your copyrighted work to TheTierMaker without your permission, please
        follow the instructions below.
      </p>

      <h2>What the DMCA Protects</h2>
      <p>The DMCA protects original works of authorship fixed in a tangible medium. Examples include:</p>
      <ul>
        <li>Photographs and images</li>
        <li>Artwork and illustrations</li>
        <li>Music and sound recordings</li>
        <li>Videos and movies</li>
        <li>Written text and articles</li>
        <li>Software code</li>
      </ul>
      <p>The DMCA does NOT protect the following:</p>
      <ul>
        <li>Ideas or concepts (only their specific expression)</li>
        <li>Facts or data</li>
        <li>Works in the public domain</li>
        <li>Short phrases or slogans</li>
      </ul>
      <p>
        <strong>Important for tier lists.</strong> If you upload a screenshot from a video game or a photo of a
        celebrity, you probably do not own the copyright to that image. The game developer or photographer owns it.
        Only the copyright owner (or their authorized agent) can send a DMCA notice.
      </p>
      <p>
        <strong>Fair use.</strong> The DMCA acknowledges fair use (using copyrighted material for commentary,
        criticism, education, or parody). If your use of an image qualifies as fair use, the copyright owner may not
        have a valid claim. However, we cannot determine fair use on your behalf. If we receive a valid DMCA notice,
        we will remove the content and let you file a counter-notice if you believe it was a mistake.
      </p>

      <h2>Submitting a DMCA Takedown Notice</h2>
      <p>
        If you are a copyright owner (or authorized to act on behalf of one) and believe content on TheTierMaker
        infringes your copyright, please send our DMCA agent a notice containing the following information.
      </p>
      <h3>Required Information (by law)</h3>
      <ol>
        <li>
          <strong>Your contact information.</strong> Include your full name, address, telephone number, and email
          address.
        </li>
        <li>
          <strong>Description of the copyrighted work.</strong> Identify the work you claim has been infringed. Provide
          enough detail so we can locate it. Examples:
          <ul>
            <li>
              &quot;A photograph of a mountain lake I took, first published on my website example.com/photo123&quot;
            </li>
            <li>
              &quot;The song &apos;Summer Nights&apos; which I registered with the US Copyright Office as registration
              number SR-123-456&quot;
            </li>
            <li>&quot;The character design for &apos;Captain Hero&apos; from my comic book series&quot;</li>
          </ul>
        </li>
        <li>
          <strong>Location of the infringing content.</strong> Provide the specific URL(s) on TheTierMaker where the
          infringing content appears. For example:
          <ul>
            <li>thetiermaker.com/templates/12345</li>
            <li>thetiermaker.com/user/johndoe/tierlist/67890</li>
          </ul>
          We cannot find content based on descriptions like &quot;search for my photo&quot; or &quot;it&apos;s in the
          gaming category.&quot; You must provide direct URLs.
        </li>
        <li>
          <strong>A statement of good faith belief.</strong> You must state: &quot;I have a good faith belief that the
          use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the
          law.&quot;
        </li>
        <li>
          <strong>A statement of accuracy and authorization.</strong> You must state: &quot;Under penalty of perjury,
          the information in this notice is accurate, and I am the copyright owner or authorized to act on behalf of the
          copyright owner.&quot;
        </li>
        <li>
          <strong>Your electronic or physical signature.</strong> Type your full name at the bottom. This serves as
          your signature.
        </li>
      </ol>
      <h3>Sample DMCA Takedown Notice</h3>
      <pre className="legal-sample">{`To: TheTierMaker DMCA Agent
Email: dmca@thetiermaker.com

Date: June 6, 2026

1. My contact information:
   Name: John Smith
   Address: 123 Main Street, Los Angeles, CA 90210
   Phone: (555) 123-4567
   Email: john.smith@example.com

2. Copyrighted work(s) being infringed:
   A photograph of a golden retriever playing in snow, first published on my website
   at example.com/dog-snow.jpg on March 15, 2025.

3. Infringing content location(s) on TheTierMaker:
   - thetiermaker.com/templates/golden-retriever
   - thetiermaker.com/user/snowlover/tierlist/abc123

4. Good faith belief statement:
   I have a good faith belief that the use of the copyrighted material described above
   is not authorized by the copyright owner, its agent, or the law.

5. Accuracy and authorization statement:
   Under penalty of perjury, the information in this notice is accurate, and I am the
   copyright owner or authorized to act on behalf of the copyright owner.

6. Signature:
   John Smith (electronic signature)`}</pre>

      <h3>Where to Send Your Notice</h3>
      <p>
        Email (preferred): <a href="mailto:dmca@thetiermaker.com">dmca@thetiermaker.com</a>
        <br />
        Mail: (address to be added)
      </p>
      <p>We respond fastest to email. Please include &quot;DMCA Takedown Notice&quot; in the subject line.</p>

      <h3>What Happens After You Send a Notice</h3>
      <p>
        <strong>Step 1: We review your notice.</strong> We check that it contains all required information. If something
        is missing, we will email you and ask for the missing information.
      </p>
      <p>
        <strong>Step 2: We remove the content.</strong> If your notice is complete and valid, we remove the allegedly
        infringing content from our website.
      </p>
      <p>
        <strong>Step 3: We notify the user.</strong> We contact the user who posted the content. We tell them that we
        removed their content because of a DMCA notice. We also provide them with a copy of your notice (with your
        contact information).
      </p>
      <p>
        <strong>Step 4: The user may file a counter-notice.</strong> If the user believes we removed their content by
        mistake, they can file a counter-notice (see below).
      </p>
      <p>
        <strong>How long does it take?</strong> We usually remove content within 1–3 business days after receiving a
        complete and valid notice.
      </p>

      <h2>Submitting a DMCA Counter-Notice</h2>
      <p>
        If we removed your content because of a DMCA takedown notice, you may file a counter-notice if you believe:
      </p>
      <ul>
        <li>You own the copyright (or have permission from the owner)</li>
        <li>Your use qualifies as fair use</li>
        <li>The notice was sent by mistake (for example, the copyright owner identified the wrong image)</li>
      </ul>
      <h3>Required Information for a Counter-Notice</h3>
      <ol>
        <li>
          <strong>Your contact information.</strong> Include your full name, address, telephone number, and email
          address.
        </li>
        <li>
          <strong>Identification of the removed content.</strong> Provide the URL(s) of the content we removed. This
          should match the URLs in the original takedown notice.
        </li>
        <li>
          <strong>A statement under penalty of perjury.</strong> You must state: &quot;Under penalty of perjury, I have
          a good faith belief that the material was removed as a result of mistake or misidentification.&quot;
        </li>
        <li>
          <strong>Consent to jurisdiction.</strong> If you live in the United States, you must state: &quot;I consent to
          the jurisdiction of the Federal District Court for the judicial district in which my address is
          located.&quot; If you live outside the United States, you must state: &quot;I consent to the jurisdiction of
          any judicial district in which TheTierMaker may be found, and I will accept service of process from the person
          who filed the original DMCA notice.&quot;
        </li>
        <li>
          <strong>Your electronic or physical signature.</strong>
        </li>
      </ol>
      <h3>Sample DMCA Counter-Notice</h3>
      <pre className="legal-sample">{`To: TheTierMaker DMCA Agent
Email: dmca@thetiermaker.com

Date: June 6, 2026

1. My contact information:
   Name: Jane Doe
   Address: 456 Oak Avenue, Chicago, IL 60601
   Phone: (555) 987-6543
   Email: jane.doe@example.com

2. Content removed from TheTierMaker:
   - thetiermaker.com/templates/golden-retriever

3. Statement of good faith belief:
   Under penalty of perjury, I have a good faith belief that the material was removed
   as a result of mistake or misidentification. The photograph in question is my own
   work. I took the photo of my own dog on my own property. I own the copyright.

4. Consent to jurisdiction:
   I consent to the jurisdiction of the Federal District Court for the judicial district
   in which my address is located (Northern District of Illinois).

5. Signature:
   Jane Doe (electronic signature)`}</pre>

      <h3>What Happens After You Send a Counter-Notice</h3>
      <p>
        <strong>Step 1: We review your counter-notice.</strong> We check that it contains all the required information.
      </p>
      <p>
        <strong>Step 2: We forward it to the original complainant.</strong> We send your counter-notice to the person
        who filed the original DMCA takedown notice.
      </p>
      <p>
        <strong>Step 3: We wait 10–14 business days.</strong> The original complainant has 10–14 business days to
        notify us that they have filed a court action to keep the content restricted.
      </p>
      <p>
        <strong>Step 4: We restore the content.</strong> If the original complainant does not file a court action within
        14 business days, we restore your content to our website.
      </p>

      <h2>Repeat Infringer Policy</h2>
      <p>
        We take copyright infringement seriously. We will terminate the accounts of users who are repeat infringers.
      </p>
      <p>
        <strong>What counts as a repeat infringer?</strong> A user who has received three (3) valid DMCA takedown
        notices within any 12-month period.
      </p>
      <p>
        <strong>Exceptions.</strong> We do not count:
      </p>
      <ul>
        <li>Notices that were withdrawn by the complainant</li>
        <li>Notices that we determined were invalid</li>
        <li>Counter-notices that resulted in content being restored</li>
      </ul>
      <p>
        <strong>Termination process.</strong> When a user reaches three valid strikes:
      </p>
      <ul>
        <li>We send a final warning email</li>
        <li>We suspend the account for 30 days</li>
        <li>If a fourth notice is received during that period, we permanently terminate the account</li>
      </ul>
      <p>
        <strong>Right to terminate earlier.</strong> We reserve the right to terminate any account immediately, without
        waiting for three strikes, for severe or intentional infringement.
      </p>

      <h2>Misrepresentations (IMPORTANT)</h2>
      <p>
        Under the DMCA, anyone who knowingly misrepresents that content is infringing (sending a false takedown notice)
        or that content was removed by mistake (sending a false counter-notice) may be liable for damages.
      </p>
      <p>
        Damages can include: your legal fees, our legal fees, court costs, and actual damages (potentially thousands of
        dollars).
      </p>
      <p>
        <strong>Example.</strong> If you send a DMCA notice claiming ownership of a photo you do not own, you could be
        sued by the user whose content you removed. Courts have awarded damages in these cases.
      </p>
      <p>
        <strong>Do not send false notices.</strong> Only send a DMCA notice if you are certain you own the copyright or
        are authorized to act on behalf of the owner. If you are unsure, consult an attorney.
      </p>

      <h2>Contact Information</h2>
      <p>
        For DMCA takedown notices: <a href="mailto:dmca@thetiermaker.com">dmca@thetiermaker.com</a>
        <br />
        For DMCA counter-notices: <a href="mailto:dmca@thetiermaker.com">dmca@thetiermaker.com</a> (same email;
        indicate &quot;Counter-Notice&quot; in subject line)
        <br />
        For general copyright questions: <a href="mailto:legal@thetiermaker.com">legal@thetiermaker.com</a>
        <br />
        Our DMCA Agent (legal name and title): [To be added]
      </p>

      <h2>Additional Copyright Resources</h2>
      <ul>
        <li>
          US Copyright Office:{" "}
          <a href="https://copyright.gov" target="_blank" rel="noopener noreferrer">
            copyright.gov
          </a>{" "}
          (for registering your work)
        </li>
        <li>
          DMCA text (17 USC §512):{" "}
          <a href="https://copyright.gov/title17/92chap5.html#512" target="_blank" rel="noopener noreferrer">
            copyright.gov/title17/92chap5.html#512
          </a>
        </li>
        <li>
          Copyright law basics:{" "}
          <a href="https://copyright.gov/help/faq/" target="_blank" rel="noopener noreferrer">
            copyright.gov/help/faq/
          </a>
        </li>
      </ul>
    </LegalArticle>
  );
}

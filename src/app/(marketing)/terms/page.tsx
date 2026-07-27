import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms governing use of the OfferLoop entertainment simulation.",
};

export default function TermsPage() {
  return (
    <PageContainer className="text-muted-foreground flex max-w-3xl flex-col gap-6 py-16 text-base leading-relaxed">
      <SectionHeading eyebrow="Legal" title="Terms of Use" />

      <h2 className="text-foreground text-xl font-semibold">
        1. The nature of the service
      </h2>
      <p>
        OfferLoop is an entertainment simulation. It is not a job board, recruiting
        platform, staffing agency, or employment service. Nothing on OfferLoop constitutes
        a real job offer, employment agreement, or recruiting decision.
      </p>

      <h2 className="text-foreground text-xl font-semibold">2. No real outcomes</h2>
      <p>
        Fictional applications submitted in Accept Mode are never sent to any real
        employer. Decisions made in Reject Mode are never sent to any real person.
        Generated offer cards have no legal or financial value and must not be used as, or
        represented as, real employment documents.
      </p>

      <h2 className="text-foreground text-xl font-semibold">3. Acceptable use</h2>
      <p>
        You agree not to use OfferLoop to harass, impersonate, defraud, or misrepresent
        fictional content as real, and not to attempt to disrupt or reverse engineer the
        service in a way that violates applicable law.
      </p>

      <h2 className="text-foreground text-xl font-semibold">4. Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account
        credentials. You may delete your account at any time from Settings.
      </p>

      <h2 className="text-foreground text-xl font-semibold">5. Disclaimer</h2>
      <p>
        OfferLoop is provided &ldquo;as is&rdquo; without warranties of any kind.
        OfferLoop is not a substitute for professional career advice, legal advice, or
        mental-health treatment.
      </p>

      <h2 className="text-foreground text-xl font-semibold">6. Changes</h2>
      <p>
        These terms may be updated from time to time; continued use constitutes acceptance
        of the current terms.
      </p>
    </PageContainer>
  );
}

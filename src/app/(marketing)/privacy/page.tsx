import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How OfferLoop handles guest data, account data, and analytics.",
};

export default function PrivacyPage() {
  return (
    <PageContainer className="text-muted-foreground flex max-w-3xl flex-col gap-6 py-16 text-base leading-relaxed">
      <SectionHeading eyebrow="Legal" title="Privacy Policy" />
      <p>
        Last updated: this document ships with the OfferLoop source code and should be
        dated on release.
      </p>

      <h2 className="text-foreground text-xl font-semibold">Guest usage</h2>
      <p>
        If you use OfferLoop without an account, your saved jobs, fictional offers, and
        preferences are stored only in your browser&apos;s local storage. We do not
        receive or store this data on our servers, and it stays on your device until you
        clear your browser data or delete it in Settings.
      </p>

      <h2 className="text-foreground text-xl font-semibold">Account usage</h2>
      <p>
        If you create an account, your display name, preferences, saved jobs,
        applications, and fictional offers are stored in our database (Supabase) and
        protected by Row Level Security so that only you can read or modify your own
        records.
      </p>

      <h2 className="text-foreground text-xl font-semibold">What we never collect</h2>
      <p>
        OfferLoop never asks for a real résumé, government identification, Social Security
        number, immigration status, date of birth, full home address, or banking
        information.
      </p>

      <h2 className="text-foreground text-xl font-semibold">Analytics</h2>
      <p>
        Privacy-friendly analytics are disabled by default. If enabled by the site
        operator, only a fixed list of anonymous, non-identifying event names is recorded
        — never names, emails, candidate identities, or free-form text.
      </p>

      <h2 className="text-foreground text-xl font-semibold">Your choices</h2>
      <p>
        You can export or delete your account data, delete your offer or simulation
        history, or delete your account entirely from the Settings page.
      </p>

      <h2 className="text-foreground text-xl font-semibold">Contact</h2>
      <p>Questions about this policy can be sent through the Contact page.</p>
    </PageContainer>
  );
}

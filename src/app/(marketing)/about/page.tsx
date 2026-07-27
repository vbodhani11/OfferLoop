import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SimulationDisclosure } from "@/components/branding/SimulationDisclosure";

export const metadata: Metadata = {
  title: "About",
  description: "What OfferLoop is, why it exists, and the boundaries of the simulation.",
};

export default function AboutPage() {
  return (
    <PageContainer className="flex max-w-3xl flex-col gap-8 py-16">
      <SectionHeading
        eyebrow="About OfferLoop"
        title="A fictional career simulator for real job-search stress"
      />
      <div className="text-muted-foreground flex flex-col gap-4 text-base leading-relaxed">
        <p>
          Job searching is exhausting in ways that are hard to explain to anyone who
          isn&apos;t currently doing it: the silence after an application, the wait for a
          response, the gap between effort and outcome. OfferLoop doesn&apos;t fix that —
          nothing except time and a good outcome really does — but it gives you somewhere
          to put those feelings for a few minutes.
        </p>
        <p>
          In <strong className="text-foreground">Accept Mode</strong>, every fictional
          application you submit ends in a fictional offer. It&apos;s a small, engineered
          &ldquo;yes&rdquo; for when the real search hasn&apos;t given you one yet.
        </p>
        <p>
          In <strong className="text-foreground">Reject Mode</strong>, you step into the
          other chair. Reviewing fictional candidate profiles and making fast decisions is
          a way to see — and gently poke fun at — the other side of the hiring loop.
        </p>
        <p>
          OfferLoop was built as an original product with its own visual identity, brand,
          and content. It is not associated with LinkedIn or any other job platform, and
          it does not replace real job searching, real recruiting, or professional
          mental-health support.
        </p>
      </div>
      <SimulationDisclosure>
        OfferLoop is entertainment software. No real jobs, employers, candidates,
        recruiters, or offers are involved, and nothing generated here has legal or
        financial value.
      </SimulationDisclosure>
    </PageContainer>
  );
}

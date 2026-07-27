import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";

export const metadata: Metadata = {
  title: "Simulation Notice",
  description: "The full disclosure of what is and is not real inside OfferLoop.",
};

const points = [
  "OfferLoop is an entertainment simulation.",
  "Every job listed in Accept Mode is fictional.",
  "Every company listed is fictional.",
  "Every candidate listed in Reject Mode is fictional.",
  "Fictional applications are never submitted to any real employer.",
  "Simulated offers have no legal or financial value.",
  "Recruiting decisions made in Reject Mode do not affect any real person.",
  "Salaries, bonuses, and benefits shown are fictional and for entertainment only.",
  "OfferLoop is not affiliated with LinkedIn or any other real job platform.",
  "OfferLoop is not an employment agency, staffing firm, or recruiter.",
  "OfferLoop is not a mental-health treatment or clinical service.",
  "Generated offer cards should never be used as, or presented as, real employment documents.",
];

export default function SimulationNoticePage() {
  return (
    <PageContainer className="flex max-w-3xl flex-col gap-8 py-16">
      <SectionHeading
        eyebrow="Read this first"
        title="Simulation Notice"
        description="The complete, plain-English disclosure of what OfferLoop is and is not."
      />
      <ul className="flex flex-col gap-3">
        {points.map((point) => (
          <li
            key={point}
            className="border-border bg-surface-muted/50 text-foreground flex gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm"
          >
            <span aria-hidden="true" className="text-brand">
              •
            </span>
            {point}
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}

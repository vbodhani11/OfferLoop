import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ModeBadge } from "@/components/branding/ModeBadge";
import { SimulationDisclosure } from "@/components/branding/SimulationDisclosure";
import { CandidateDeck } from "@/features/reject/components/CandidateDeck";
import { candidates } from "@/data/candidates";

export const metadata = {
  title: "Reject Mode",
};

export default function RejectModePage() {
  const activeCandidates = candidates.filter((candidate) => candidate.isActive);

  return (
    <PageContainer className="flex flex-col gap-6 py-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-[560px] flex-col gap-3">
        <ModeBadge mode="reject" />
        <SectionHeading
          title="Step into Recruiter Mode"
          description="Review fictional candidate profiles and make simulated hiring decisions. Drag, click, or use your keyboard."
        />
        <SimulationDisclosure compact>
          Every profile in this mode is fictional. No real person receives these
          decisions.
        </SimulationDisclosure>
      </div>

      <CandidateDeck candidates={activeCandidates} />
    </PageContainer>
  );
}

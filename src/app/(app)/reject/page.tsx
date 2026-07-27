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
    <PageContainer className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-4">
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

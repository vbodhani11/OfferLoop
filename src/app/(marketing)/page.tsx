import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SimulationDisclosure } from "@/components/branding/SimulationDisclosure";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroLoopAnimation } from "@/features/marketing/components/HeroLoopAnimation";
import { ModeSelectionCards } from "@/features/marketing/components/ModeSelectionCards";
import { JobCard } from "@/features/accept/components/JobCard";
import { CandidateCard } from "@/features/reject/components/CandidateCard";
import { allJobsWithOrganizations } from "@/lib/repositories/local/jobs";
import { candidates } from "@/data/candidates";

export default function HomePage() {
  const previewJobs = allJobsWithOrganizations.slice(0, 2);
  const previewCandidates = candidates.slice(0, 2);

  return (
    <>
      {/* 1. Hero */}
      <section className="border-border from-brand-muted/40 border-b bg-gradient-to-b to-transparent">
        <PageContainer className="grid grid-cols-1 items-center gap-10 py-16 md:py-24 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <SimulationDisclosure compact>
              Entertainment simulation. No real jobs or candidates are involved.
            </SimulationDisclosure>
            <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
              Turn job-search stress into a fictional win.
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
              Browse imaginary jobs, receive instant simulated offers, or step into
              Recruiter Mode and make fictional hiring decisions. No real careers are
              affected.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accept">
                <Link href="/accept">
                  Enter Accept Mode <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="reject">
                <Link href="/reject">
                  Enter Reject Mode <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <HeroLoopAnimation />
            <p className="sr-only">
              An animated illustration shows a fictional job card entering a review loop
              and returning as a glowing simulated offer, while a fictional candidate card
              moves through a mirrored decision loop on the other side.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* 2. Choose Your Mode */}
      <section className="py-16 md:py-24">
        <PageContainer className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Two modes, one loop"
            title="Choose your mode"
            description="Play the fictional applicant chasing an offer, or the fictional recruiter making the call."
            align="center"
          />
          <ModeSelectionCards />
        </PageContainer>
      </section>

      {/* 3 & 4. How each mode works */}
      <section className="border-border bg-surface-muted/40 border-y py-16 md:py-24">
        <PageContainer className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <SectionHeading eyebrow="Accept Mode" title="How Accept Mode works" />
            <ol className="text-muted-foreground flex flex-col gap-3 text-sm">
              <li>
                <strong className="text-foreground">1. Browse.</strong> Search and filter
                36+ fictional jobs across 16 categories.
              </li>
              <li>
                <strong className="text-foreground">2. Apply.</strong> Watch an animated
                fictional application review.
              </li>
              <li>
                <strong className="text-foreground">3. Celebrate.</strong> Every fictional
                application results in a simulated offer.
              </li>
            </ol>
          </div>
          <div className="flex flex-col gap-4">
            <SectionHeading eyebrow="Reject Mode" title="How Reject Mode works" />
            <ol className="text-muted-foreground flex flex-col gap-3 text-sm">
              <li>
                <strong className="text-foreground">1. Review.</strong> Swipe through 40+
                fictional candidate profiles.
              </li>
              <li>
                <strong className="text-foreground">2. Decide.</strong> Reject, shortlist,
                or send a simulated offer.
              </li>
              <li>
                <strong className="text-foreground">3. Repeat.</strong> Undo any decision,
                or reset the deck entirely.
              </li>
            </ol>
          </div>
        </PageContainer>
      </section>

      {/* 5. Interactive Offer Preview */}
      <section className="py-16 md:py-24">
        <PageContainer className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Accept Mode preview"
            title="Fictional jobs, ready to apply to"
            description="A small sample of the simulation — every listing below is invented for OfferLoop."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {previewJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <Button asChild variant="secondary" className="w-fit">
            <Link href="/accept">Browse all fictional jobs</Link>
          </Button>
        </PageContainer>
      </section>

      {/* 6. Fictional Candidate Preview */}
      <section className="border-border bg-surface-muted/40 border-y py-16 md:py-24">
        <PageContainer className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Reject Mode preview"
            title="Fictional candidates, ready for review"
            description="Every profile is invented — diverse fictional names, backgrounds, and skills for the simulation only."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {previewCandidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} compact />
            ))}
          </div>
          <Button asChild variant="secondary" className="w-fit">
            <Link href="/reject">Open the fictional deck</Link>
          </Button>
        </PageContainer>
      </section>

      {/* 7. Why OfferLoop Exists */}
      <section className="py-16 md:py-24">
        <PageContainer className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <SectionHeading
            eyebrow="Why OfferLoop"
            title="Job searching is stressful. This part shouldn't be."
            description="OfferLoop exists to give the emotional beats of a job search — the win, the perspective — without any of the real-world stakes."
            className="lg:col-span-1"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            <Card>
              <CardContent className="flex flex-col gap-2 p-5">
                <Wand2 className="text-brand h-5 w-5" />
                <p className="text-muted-foreground text-sm">
                  An always-yes application loop for when real rejection is wearing you
                  down.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col gap-2 p-5">
                <Sparkles className="text-brand h-5 w-5" />
                <p className="text-muted-foreground text-sm">
                  A playful look at recruiting decisions from the other side of the table.
                </p>
              </CardContent>
            </Card>
          </div>
        </PageContainer>
      </section>

      {/* 8 & 9. Transparency, Safety, Privacy */}
      <section className="border-border bg-surface-muted/40 border-y py-16 md:py-24">
        <PageContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="flex flex-col gap-3 p-6">
              <ShieldCheck className="text-brand h-6 w-6" />
              <h3 className="text-foreground text-lg font-semibold">
                Transparency &amp; safety
              </h3>
              <p className="text-muted-foreground text-sm">
                Every job, candidate, and offer inside OfferLoop is fictional. Nothing you
                do here reaches a real employer, recruiter, or candidate. See the full{" "}
                <Link
                  href="/simulation"
                  className="text-brand font-medium underline-offset-2 hover:underline"
                >
                  Simulation Notice
                </Link>
                .
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col gap-3 p-6">
              <Lock className="text-brand h-6 w-6" />
              <h3 className="text-foreground text-lg font-semibold">Your privacy</h3>
              <p className="text-muted-foreground text-sm">
                Play as a guest with data kept on your device, or create an account for
                private, per-user storage protected by Row Level Security. Read the{" "}
                <Link
                  href="/privacy"
                  className="text-brand font-medium underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </PageContainer>
      </section>

      {/* 10. Final CTA */}
      <section className="py-16 md:py-24">
        <PageContainer className="border-border bg-brand-muted/40 flex flex-col items-center gap-6 rounded-[var(--radius-xl)] border px-6 py-16 text-center">
          <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Get the offer. Make the decision. Repeat the loop.
          </h2>
          <p className="text-muted-foreground max-w-xl">
            No account required to start. Guest progress stays on your device until you
            decide to save it.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="accept">
              <Link href="/accept">Enter Accept Mode</Link>
            </Button>
            <Button asChild size="lg" variant="reject">
              <Link href="/reject">Enter Reject Mode</Link>
            </Button>
          </div>
        </PageContainer>
      </section>
    </>
  );
}

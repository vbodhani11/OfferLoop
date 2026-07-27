import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCandidateBySlug } from "@/data/candidates";
import { CandidateProfileClient } from "@/features/reject/components/CandidateProfileClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const candidate = getCandidateBySlug(slug);
  if (!candidate) return { title: "Fictional candidate not found" };
  return {
    title: `${candidate.displayName} — Fictional candidate`,
    description: `${candidate.headline} — created for the OfferLoop simulation. Not a real person.`,
  };
}

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const candidate = getCandidateBySlug(slug);
  if (!candidate) notFound();

  return <CandidateProfileClient candidate={candidate} />;
}

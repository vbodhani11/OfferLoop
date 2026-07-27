import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJobBySlug, getSimilarJobs } from "@/data/jobs";
import { getOrganizationById } from "@/data/organizations";
import { JobDetailsClient } from "@/features/accept/components/JobDetailsClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) return { title: "Fictional job not found" };
  const organization = getOrganizationById(job.organizationId);
  return {
    title: `${job.title} at ${organization?.name ?? "a fictional company"}`,
    description: `${job.title} — a fictional role inside the OfferLoop career simulation. Not a real job posting.`,
  };
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) notFound();

  const organization = getOrganizationById(job.organizationId);
  if (!organization) notFound();

  const jobWithOrganization = { ...job, organization };
  const similarJobs = getSimilarJobs(job, 3)
    .map((similar) => {
      const org = getOrganizationById(similar.organizationId);
      return org ? { ...similar, organization: org } : null;
    })
    .filter((value): value is NonNullable<typeof value> => value !== null);

  return <JobDetailsClient job={jobWithOrganization} similarJobs={similarJobs} />;
}

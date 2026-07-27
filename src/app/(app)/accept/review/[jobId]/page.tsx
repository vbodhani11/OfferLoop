import { notFound } from "next/navigation";
import { getJobById } from "@/data/jobs";
import { getOrganizationById } from "@/data/organizations";
import { ApplicationReviewFlow } from "@/features/accept/components/ApplicationReviewFlow";

export const metadata = {
  title: "Fictional application review",
};

export default async function ApplicationReviewPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const job = getJobById(jobId);
  if (!job) notFound();

  const organization = getOrganizationById(job.organizationId);
  if (!organization) notFound();

  return <ApplicationReviewFlow job={{ ...job, organization }} />;
}

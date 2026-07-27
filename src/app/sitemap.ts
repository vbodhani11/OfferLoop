import type { MetadataRoute } from "next";
import { jobs } from "@/data/jobs";
import { candidates } from "@/data/candidates";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/accept",
    "/reject",
    "/about",
    "/privacy",
    "/terms",
    "/simulation",
    "/contact",
  ].map((path) => ({ url: `${appUrl}${path}`, lastModified: new Date() }));

  const jobRoutes = jobs.map((job) => ({
    url: `${appUrl}/accept/jobs/${job.slug}`,
    lastModified: new Date(),
  }));

  const candidateRoutes = candidates.map((candidate) => ({
    url: `${appUrl}/reject/candidates/${candidate.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...jobRoutes, ...candidateRoutes];
}

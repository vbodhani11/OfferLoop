import type { JobWithOrganization } from "@/types/domain";
import type { JobFilters } from "@/lib/repositories/types";

export function matchesSearch(job: JobWithOrganization, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return (
    job.title.toLowerCase().includes(needle) ||
    job.organization.name.toLowerCase().includes(needle) ||
    job.skills.some((skill) => skill.toLowerCase().includes(needle))
  );
}

export function filterJobs(
  jobs: JobWithOrganization[],
  filters: JobFilters = {},
): JobWithOrganization[] {
  let result = jobs.filter((job) => job.isActive);

  if (filters.search) {
    result = result.filter((job) => matchesSearch(job, filters.search!));
  }
  if (filters.category) {
    result = result.filter((job) => job.category === filters.category);
  }
  if (filters.experienceLevel) {
    result = result.filter((job) => job.experienceLevel === filters.experienceLevel);
  }
  if (filters.workArrangement) {
    result = result.filter((job) => job.workArrangement === filters.workArrangement);
  }
  if (filters.employmentType) {
    result = result.filter((job) => job.employmentType === filters.employmentType);
  }
  if (filters.salaryMin) {
    result = result.filter((job) => job.salaryMax >= filters.salaryMin!);
  }

  return sortJobs(result, filters.sort);
}

export function sortJobs(
  jobs: JobWithOrganization[],
  sort?: string,
): JobWithOrganization[] {
  const copy = [...jobs];
  switch (sort) {
    case "newest":
      return copy.sort((a, b) => a.simulatedPostedDaysAgo - b.simulatedPostedDaysAgo);
    case "salary_high":
      return copy.sort((a, b) => b.salaryMax - a.salaryMax);
    case "company_az":
      return copy.sort((a, b) => a.organization.name.localeCompare(b.organization.name));
    case "best_match":
    default:
      return copy.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }
}

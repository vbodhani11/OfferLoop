import { describe, expect, it } from "vitest";
import { filterJobs, matchesSearch, sortJobs } from "../filterJobs";
import type { JobWithOrganization } from "@/types/domain";

function makeJob(overrides: Partial<JobWithOrganization>): JobWithOrganization {
  return {
    id: "job-1",
    organizationId: "org-1",
    slug: "job-1",
    title: "Software Engineer",
    description: "A fictional role.",
    responsibilities: [],
    qualifications: [],
    benefits: [],
    location: "Remote",
    workArrangement: "remote",
    employmentType: "full_time",
    experienceLevel: "mid",
    salaryMin: 100000,
    salaryMax: 140000,
    signingBonus: null,
    currency: "USD",
    category: "software_engineering",
    skills: ["TypeScript", "React"],
    fictionalManagerName: "Jordan Ellis",
    simulatedPostedDaysAgo: 3,
    matchPercentage: 80,
    isActive: true,
    createdAt: new Date().toISOString(),
    organization: {
      id: "org-1",
      slug: "nova-systems",
      name: "Nova Systems",
      initials: "NS",
      industry: "Software",
      shortDescription: "A fictional software company.",
      logoStyle: { gradientFrom: "#6366f1", gradientTo: "#8b5cf6", pattern: "dots" },
      isFictional: true,
      isActive: true,
    },
    ...overrides,
  } as JobWithOrganization;
}

describe("matchesSearch", () => {
  const job = makeJob({
    title: "Senior SAP Application Engineer",
    skills: ["SAP", "ABAP"],
  });

  it("matches on job title", () => {
    expect(matchesSearch(job, "sap application")).toBe(true);
  });

  it("matches on company name", () => {
    expect(matchesSearch(job, "nova")).toBe(true);
  });

  it("matches on a skill", () => {
    expect(matchesSearch(job, "abap")).toBe(true);
  });

  it("returns false for non-matching text", () => {
    expect(matchesSearch(job, "civil engineering")).toBe(false);
  });

  it("treats an empty search as matching everything", () => {
    expect(matchesSearch(job, "   ")).toBe(true);
  });
});

describe("filterJobs", () => {
  const jobs = [
    makeJob({
      id: "1",
      title: "Software Engineer",
      category: "software_engineering",
      experienceLevel: "mid",
      salaryMax: 140000,
    }),
    makeJob({
      id: "2",
      title: "Civil Engineer",
      category: "civil_engineering",
      experienceLevel: "senior",
      salaryMax: 160000,
    }),
    makeJob({ id: "3", title: "Inactive Role", isActive: false }),
  ];

  it("excludes inactive jobs", () => {
    const result = filterJobs(jobs);
    expect(result.some((job) => job.id === "3")).toBe(false);
  });

  it("filters by category", () => {
    const result = filterJobs(jobs, { category: "civil_engineering" });
    expect(result.map((j) => j.id)).toEqual(["2"]);
  });

  it("filters by experience level", () => {
    const result = filterJobs(jobs, { experienceLevel: "senior" });
    expect(result.map((j) => j.id)).toEqual(["2"]);
  });

  it("filters by minimum salary", () => {
    const result = filterJobs(jobs, { salaryMin: 150000 });
    expect(result.map((j) => j.id)).toEqual(["2"]);
  });

  it("filters by search text combined with other filters", () => {
    const result = filterJobs(jobs, { search: "civil", category: "civil_engineering" });
    expect(result.map((j) => j.id)).toEqual(["2"]);
  });
});

describe("sortJobs", () => {
  const jobs = [
    makeJob({
      id: "a",
      organization: { ...makeJob({}).organization, name: "Zeta" },
      salaryMax: 100000,
      simulatedPostedDaysAgo: 10,
      matchPercentage: 60,
    }),
    makeJob({
      id: "b",
      organization: { ...makeJob({}).organization, name: "Alpha" },
      salaryMax: 200000,
      simulatedPostedDaysAgo: 1,
      matchPercentage: 95,
    }),
  ];

  it("sorts by best fictional match by default", () => {
    expect(sortJobs(jobs).map((j) => j.id)).toEqual(["b", "a"]);
  });

  it("sorts by newest simulation", () => {
    expect(sortJobs(jobs, "newest").map((j) => j.id)).toEqual(["b", "a"]);
  });

  it("sorts by highest fictional salary", () => {
    expect(sortJobs(jobs, "salary_high").map((j) => j.id)).toEqual(["b", "a"]);
  });

  it("sorts company A-Z", () => {
    expect(sortJobs(jobs, "company_az").map((j) => j.id)).toEqual(["b", "a"]);
  });
});

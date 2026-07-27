import type {
  EmploymentType,
  ExperienceLevel,
  JobCategory,
  WorkArrangement,
} from "@/types/domain";

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  software_engineering: "Software Engineering",
  sap_enterprise_systems: "SAP & Enterprise Systems",
  data_engineering: "Data Engineering",
  artificial_intelligence: "Artificial Intelligence",
  product_management: "Product Management",
  civil_engineering: "Civil Engineering",
  structural_engineering: "Structural Engineering",
  construction_technology: "Construction Technology",
  ux_product_design: "UX & Product Design",
  cybersecurity: "Cybersecurity",
  cloud_engineering: "Cloud Engineering",
  business_analysis: "Business Analysis",
  quality_assurance: "Quality Assurance",
  devops: "DevOps",
  analytics: "Analytics",
  project_management: "Project Management",
};

export const JOB_CATEGORIES = Object.keys(JOB_CATEGORY_LABELS) as JobCategory[];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  entry: "Entry Level",
  associate: "Associate",
  mid: "Mid-Level",
  senior: "Senior",
  lead: "Lead",
  manager: "Manager",
};

export const EXPERIENCE_LEVELS = Object.keys(
  EXPERIENCE_LEVEL_LABELS,
) as ExperienceLevel[];

export const WORK_ARRANGEMENT_LABELS: Record<WorkArrangement, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export const WORK_ARRANGEMENTS = Object.keys(
  WORK_ARRANGEMENT_LABELS,
) as WorkArrangement[];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  contract: "Contract",
  internship: "Internship",
};

export const EMPLOYMENT_TYPES = Object.keys(EMPLOYMENT_TYPE_LABELS) as EmploymentType[];

export const SORT_OPTIONS = [
  { value: "best_match", label: "Best fictional match" },
  { value: "newest", label: "Newest simulation" },
  { value: "salary_high", label: "Highest fictional salary" },
  { value: "company_az", label: "Company A–Z" },
] as const;

export type JobSortOption = (typeof SORT_OPTIONS)[number]["value"];

export const OFFER_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "salary_high", label: "Highest fictional salary" },
  { value: "salary_low", label: "Lowest fictional salary" },
  { value: "company_az", label: "Company A–Z" },
  { value: "role_az", label: "Role A–Z" },
] as const;

export type OfferSortOption = (typeof OFFER_SORT_OPTIONS)[number]["value"];

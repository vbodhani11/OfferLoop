import type {
  ApplicationRow,
  FictionalCandidateRow,
  JobRow,
  OfferRow,
  OrganizationRow,
  ProfileRow,
  SavedJobRow,
} from "@/types/database";
import type {
  Application,
  CelebrationIntensity,
  EmploymentType,
  ExperienceLevel,
  FictionalCandidate,
  Job,
  JobCategory,
  Offer,
  Organization,
  Profile,
  SavedJob,
  ThemePreference,
  WorkArrangement,
  WorkHistoryEntry,
  ProjectEntry,
} from "@/types/domain";

export function mapOrganization(row: OrganizationRow): Organization {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    initials: row.initials,
    industry: row.industry,
    shortDescription: row.short_description ?? "",
    logoStyle: (row.logo_style as unknown as Organization["logoStyle"]) ?? {
      gradientFrom: "#6366f1",
      gradientTo: "#22d3ee",
      pattern: "diagonal",
    },
    isFictional: true,
    isActive: row.is_active,
  };
}

export function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    slug: row.slug,
    organizationId: row.organization_id,
    title: row.title,
    description: row.description,
    responsibilities: row.responsibilities ?? [],
    qualifications: row.qualifications ?? [],
    benefits: row.benefits ?? [],
    location: row.location ?? "",
    workArrangement: (row.work_arrangement as WorkArrangement) ?? "remote",
    employmentType: (row.employment_type as EmploymentType) ?? "full_time",
    experienceLevel: (row.experience_level as ExperienceLevel) ?? "mid",
    salaryMin: row.salary_min ?? 0,
    salaryMax: row.salary_max ?? 0,
    signingBonus: row.signing_bonus ?? undefined,
    currency: row.currency,
    category: (row.category as JobCategory) ?? "software_engineering",
    skills: row.skills ?? [],
    fictionalManagerName: row.fictional_manager_name ?? "",
    simulatedPostedDaysAgo: row.simulated_posted_days_ago ?? 0,
    matchPercentage: 80,
    isActive: row.is_active,
  };
}

export function mapCandidate(row: FictionalCandidateRow): FictionalCandidate {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    initials: row.initials,
    headline: row.headline,
    summary: row.summary ?? "",
    location: row.location ?? "",
    yearsExperience: row.years_experience ?? 0,
    skills: row.skills ?? [],
    education: row.education ?? "",
    recentRole: row.recent_role ?? "",
    category: "software_engineering",
    workHistory: (row.work_history as WorkHistoryEntry[]) ?? [],
    projects: (row.projects as ProjectEntry[]) ?? [],
    achievements: row.achievements ?? [],
    preferredWorkArrangement:
      (row.preferred_work_arrangement as WorkArrangement) ?? "remote",
    expectedSalaryMin: row.expected_salary_min ?? 0,
    expectedSalaryMax: row.expected_salary_max ?? 0,
    availability: row.availability ?? "",
    avatarStyle: (row.avatar_style as unknown as FictionalCandidate["avatarStyle"]) ?? {
      gradientFrom: "#6366f1",
      gradientTo: "#22d3ee",
      pattern: "diagonal",
    },
    isFictional: true,
    isActive: row.is_active,
  };
}

export function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    status: row.status as Application["status"],
    acceptedAt: row.accepted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    applicationId: row.application_id,
    recipientDisplayName: row.recipient_display_name,
    fictionalStartDate: row.fictional_start_date ?? "",
    fictionalManagerName: row.fictional_manager_name ?? "",
    salaryMin: row.salary_min ?? 0,
    salaryMax: row.salary_max ?? 0,
    signingBonus: row.signing_bonus ?? undefined,
    currency: row.currency,
    workArrangement: (row.work_arrangement as WorkArrangement) ?? "remote",
    offerMessage: row.offer_message ?? "",
    simulationVersion: row.simulation_version ?? "1.0.0",
    createdAt: row.created_at,
  };
}

export function mapSavedJob(row: SavedJobRow): SavedJob {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    createdAt: row.created_at,
  };
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    preferredField: row.preferred_field,
    preferredRole: row.preferred_role,
    experienceLevel: row.experience_level as ExperienceLevel | null,
    preferredWorkArrangement: row.preferred_work_arrangement as WorkArrangement | null,
    celebrationIntensity: row.celebration_intensity as CelebrationIntensity,
    confettiEnabled: row.confetti_enabled,
    soundEnabled: row.sound_enabled,
    reducedMotion: row.reduced_motion,
    themePreference: row.theme_preference as ThemePreference,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

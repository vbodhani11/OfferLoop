export type WorkArrangement = "remote" | "hybrid" | "onsite";

export type EmploymentType = "full_time" | "contract" | "internship";

export type ExperienceLevel =
  "entry" | "associate" | "mid" | "senior" | "lead" | "manager";

export type JobCategory =
  | "software_engineering"
  | "sap_enterprise_systems"
  | "data_engineering"
  | "artificial_intelligence"
  | "product_management"
  | "civil_engineering"
  | "structural_engineering"
  | "construction_technology"
  | "ux_product_design"
  | "cybersecurity"
  | "cloud_engineering"
  | "business_analysis"
  | "quality_assurance"
  | "devops"
  | "analytics"
  | "project_management";

export interface LogoStyle {
  gradientFrom: string;
  gradientTo: string;
  pattern: "diagonal" | "grid" | "waves" | "dots" | "rings";
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  initials: string;
  industry: string;
  shortDescription: string;
  logoStyle: LogoStyle;
  isFictional: true;
  isActive: boolean;
}

export interface Job {
  id: string;
  slug: string;
  organizationId: string;
  title: string;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  location: string;
  workArrangement: WorkArrangement;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  signingBonus?: number;
  currency: string;
  category: JobCategory;
  skills: string[];
  fictionalManagerName: string;
  simulatedPostedDaysAgo: number;
  matchPercentage: number;
  isActive: boolean;
}

export interface JobWithOrganization extends Job {
  organization: Organization;
}

export interface AvatarStyle {
  gradientFrom: string;
  gradientTo: string;
  pattern: "diagonal" | "grid" | "waves" | "dots" | "rings";
}

export interface WorkHistoryEntry {
  role: string;
  company: string;
  duration: string;
  summary: string;
}

export interface ProjectEntry {
  name: string;
  description: string;
  skills: string[];
}

export interface FictionalCandidate {
  id: string;
  slug: string;
  displayName: string;
  initials: string;
  headline: string;
  summary: string;
  location: string;
  yearsExperience: number;
  skills: string[];
  education: string;
  recentRole: string;
  category: JobCategory;
  workHistory: WorkHistoryEntry[];
  projects: ProjectEntry[];
  achievements: string[];
  preferredWorkArrangement: WorkArrangement;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  availability: string;
  avatarStyle: AvatarStyle;
  isFictional: true;
  isActive: boolean;
}

export type ApplicationStatus = "accepted" | "saved";

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  status: ApplicationStatus;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  userId: string;
  jobId: string;
  applicationId: string | null;
  recipientDisplayName: string;
  fictionalStartDate: string;
  fictionalManagerName: string;
  salaryMin: number;
  salaryMax: number;
  signingBonus?: number;
  currency: string;
  workArrangement: WorkArrangement;
  offerMessage: string;
  simulationVersion: string;
  createdAt: string;
}

export interface OfferWithJob extends Offer {
  job: JobWithOrganization;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  createdAt: string;
}

export type SimulationActionType =
  | "job_viewed"
  | "job_skipped"
  | "job_saved"
  | "job_applied"
  | "offer_created"
  | "offer_celebrated"
  | "candidate_viewed"
  | "candidate_rejected"
  | "candidate_shortlisted"
  | "candidate_offered"
  | "action_undone"
  | "deck_reset"
  | "guest_data_migrated";

export interface SimulationAction {
  id: string;
  userId: string | null;
  anonymousSessionId: string | null;
  actionType: SimulationActionType;
  jobId: string | null;
  candidateId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type CelebrationIntensity = "minimal" | "standard" | "maximum";
export type ThemePreference = "system" | "light" | "dark";

export interface Profile {
  id: string;
  displayName: string;
  preferredField: string | null;
  preferredRole: string | null;
  experienceLevel: ExperienceLevel | null;
  preferredWorkArrangement: WorkArrangement | null;
  celebrationIntensity: CelebrationIntensity;
  confettiEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  themePreference: ThemePreference;
  createdAt: string;
  updatedAt: string;
}

export type DeckDecision = "reject" | "shortlist" | "offer";

export interface DeckActionRecord {
  candidateId: string;
  decision: DeckDecision;
  timestamp: number;
}

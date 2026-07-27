import type {
  Application,
  FictionalCandidate,
  Job,
  JobWithOrganization,
  Offer,
  OfferWithJob,
  Profile,
  SavedJob,
  SimulationActionType,
} from "@/types/domain";

export interface JobFilters {
  search?: string;
  category?: string;
  experienceLevel?: string;
  workArrangement?: string;
  employmentType?: string;
  salaryMin?: number;
  sort?: string;
}

export interface JobsRepository {
  listJobs(filters?: JobFilters): Promise<JobWithOrganization[]>;
  getJobBySlug(slug: string): Promise<JobWithOrganization | null>;
  getSimilarJobs(job: Job, limit?: number): Promise<JobWithOrganization[]>;
}

export interface CandidatesRepository {
  listCandidates(): Promise<FictionalCandidate[]>;
  getCandidateBySlug(slug: string): Promise<FictionalCandidate | null>;
}

export interface ApplicationsRepository {
  hasApplied(userId: string, jobId: string): Promise<boolean>;
  createApplication(userId: string, jobId: string): Promise<Application>;
  listApplications(userId: string): Promise<Application[]>;
}

export interface CreateOfferInput {
  jobId: string;
  applicationId: string | null;
  recipientDisplayName: string;
  fictionalStartDate: string;
  fictionalManagerName: string;
  salaryMin: number;
  salaryMax: number;
  signingBonus?: number;
  currency: string;
  workArrangement: Offer["workArrangement"];
  offerMessage: string;
  simulationVersion: string;
}

export interface OffersRepository {
  listOffers(userId: string): Promise<OfferWithJob[]>;
  getOfferById(userId: string, offerId: string): Promise<OfferWithJob | null>;
  getOfferByJobId(userId: string, jobId: string): Promise<OfferWithJob | null>;
  createOffer(userId: string, input: CreateOfferInput): Promise<Offer>;
  deleteOffer(userId: string, offerId: string): Promise<void>;
}

export interface SavedJobsRepository {
  listSavedJobs(userId: string): Promise<JobWithOrganization[]>;
  isSaved(userId: string, jobId: string): Promise<boolean>;
  saveJob(userId: string, jobId: string): Promise<SavedJob>;
  unsaveJob(userId: string, jobId: string): Promise<void>;
  clearAll(userId: string): Promise<void>;
}

export interface ProfileRepository {
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile>;
}

export interface ActionsRepository {
  recordAction(input: {
    userId: string | null;
    anonymousSessionId: string | null;
    actionType: SimulationActionType;
    jobId?: string | null;
    candidateId?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
}

export interface RepositorySet {
  jobs: JobsRepository;
  candidates: CandidatesRepository;
  applications: ApplicationsRepository;
  offers: OffersRepository;
  savedJobs: SavedJobsRepository;
  profile: ProfileRepository;
  actions: ActionsRepository;
}

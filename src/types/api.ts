export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiListMeta {
  page: string;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiPaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  meta: ApiListMeta;
}

export interface Role {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: Role;
}

export interface AuthUser extends AppUser {
  role: Role;
}

export type PermissionMap = Record<string, string[]>;

export interface LoginResult {
  token: string;
  user: AuthUser;
  permissions: PermissionMap;
}

export interface ModulePermission {
  id: number;
  key: string;
  name: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ModuleWithPermissions {
  id: number;
  key: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: ModulePermission[];
}

export interface RolePermissionItem {
  id: number;
  key: string;
  name: string;
  assigned: boolean;
}

export interface RolePermissionsByModule {
  id: number;
  key: string;
  name: string;
  permissions: RolePermissionItem[];
}

export interface LeadIntakeDraft {
  id: number;
  source: string;
  aiProvider: string | null;
  aiModel: string | null;
  fullName: string;
  phone: string;
  email: string;
  preferredContactMethod: string | null;
  caseTypeText: string | null;
  injurySummary: string | null;
  incidentDate: string | null;
  location: string | null;
  incidentDescription: string | null;
  medicalTreatment: string | null;
  liabilityInfo: string | null;
  insuranceInfo: string | null;
  representedByAttorney: boolean | null;
  extraCapturedData: Record<string, unknown>;
  rawConversation: unknown[] | null;
  rawExtractedData: Record<string, unknown> | null;
  aiSummary: string | null;
  aiScore: number | null;
  reviewStatus: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface LeadIntakeDraftImportResult {
  importedCount: number;
  failedCount: number;
  errors: string[];
}

export interface Lead {
  id: number;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  aiProvider: string | null;
  aiModel: string | null;
  status: string;
  businessType: string | null;
  companyName: string | null;
  companyWebsite: string | null;
  jobTitle: string | null;
  serviceType: string | null;
  serviceTypeOther: string | null;
  serviceTypeText: string | null;
  projectType: string | null;
  projectTypeOther: string | null;
  projectTypeText: string | null;
  projectBudget: string | null;
  projectTimeline: string | null;
  projectDescription: string | null;
  currentChallenges: string | null;
  expectedFeatures: string | null;
  techStack: string | null;
  isDecisionMaker: boolean | null;
  sourceLabel?: string | null;
  campaign?: string | null;
  medium?: string | null;
  channel?: string | null;
  pageUrl?: string | null;
  referrerUrl?: string | null;
  gclid?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  location: string | null;
  preferredContactMethod: string | null;
  leadScore: number | null;
  leadStatus: string | null;
  assignedSalesExecutiveId: number | null;
  notes: string | null;
  customFields?: Record<string, unknown> | null;
  rawConversation: Record<string, unknown>[] | null;
  aiSummary: string | null;
  aiNextAction?: string | null;
  aiMissingFields?: string[] | null;
  score?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  messages?: unknown[];
  assignedSalesExecutive?: AppUser | null;
}

export interface LeadAssignment {
  id: number;
  leadId: number;
  assignedToUserId: number;
  assignedByUserId: number;
  status: string;
  assignedAt: string;
  notes: string | null;
  followUpAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lead?: Lead;
  assignedToUser?: AppUser;
  assignedByUser?: AppUser;
}

export interface LeadIntakeDraftFilters {
  page?: number;
  limit?: number;
  search?: string;
  fullName?: string;
  injurySummary?: string;
  location?: string;
  reviewStatus?: string;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  search?: string;
  serviceType?: string;
  projectType?: string;
  caseType?: string;
  leadStatus?: string;
  status?: string;
}

export interface LeadAssignmentFilters {
  page?: number;
  limit?: number;
  leadId?: number;
}

export interface CreateLeadIntakeDraftInput {
  source: string;
  aiProvider?: string | null;
  aiModel?: string | null;
  fullName: string;
  phone: string;
  email: string;
  preferredContactMethod?: string | null;
  caseTypeText?: string | null;
  injurySummary?: string | null;
  incidentDate?: string | null;
  location?: string | null;
  incidentDescription?: string | null;
  medicalTreatment?: string | null;
  liabilityInfo?: string | null;
  insuranceInfo?: string | null;
  representedByAttorney?: boolean | null;
  extraCapturedData?: Record<string, unknown>;
  rawConversation?: unknown[] | null;
  rawExtractedData?: Record<string, unknown> | null;
  aiSummary?: string | null;
  aiScore?: number | null;
  reviewStatus?: string;
}

export type UpdateLeadIntakeDraftInput = Partial<CreateLeadIntakeDraftInput>;

export interface ConvertLeadIntakeDraftInput {
  fullName: string;
  phone: string;
  email: string;
  source: string;
  aiProvider?: string | null;
  aiModel?: string | null;
  status: string;
  caseType: string;
  injuryType: string;
  incidentDate?: string | null;
  location?: string | null;
  preferredContactMethod?: string | null;
  incidentDescription?: string | null;
  medicalTreatment?: string | null;
  liabilityInfo?: string | null;
  insuranceInfo?: string | null;
  representedByAttorney?: boolean | null;
  notes?: string | null;
  leadScore?: number | null;
  leadStatus?: string | null;
}

export interface CreateLeadInput {
  fullName: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  businessType?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  jobTitle?: string | null;
  serviceType?: string | null;
  serviceTypeOther?: string | null;
  serviceTypeText?: string | null;
  projectType?: string | null;
  projectTypeOther?: string | null;
  projectTypeText?: string | null;
  projectBudget?: string | null;
  projectTimeline?: string | null;
  projectDescription?: string | null;
  currentChallenges?: string | null;
  expectedFeatures?: string | null;
  techStack?: string | null;
  isDecisionMaker?: boolean | null;
  aiProvider?: string | null;
  aiModel?: string | null;
  location?: string | null;
  preferredContactMethod?: string | null;
  notes?: string | null;
  leadScore?: number | null;
  leadStatus?: string | null;
  customFields?: Record<string, unknown> | null;
  rawConversation?: Record<string, unknown>[] | null;
  aiSummary?: string | null;
}

export interface CreatePublicLeadInput {
  name: string;
  phone: string;
  email: string;
  projectDetails: string;
  source?: string | null;
  sourceLabel?: string | null;
  campaign?: string | null;
  medium?: string | null;
  channel?: string | null;
  pageUrl?: string | null;
  referrerUrl?: string | null;
  gclid?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
}

export type UpdateLeadInput = CreateLeadInput;
export type PatchLeadInput = Partial<CreateLeadInput>;

export interface AssignLeadInput {
  assignedToUserId: number;
  notes?: string | null;
  followUpAt?: string | null;
}

export interface PatchLeadAssignmentInput {
  status?: string;
  notes?: string | null;
  followUpAt?: string | null;
  closedAt?: string | null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleId: number;
}

export interface CreateRoleInput {
  name: string;
}

export interface UpdateRolePermissionsInput {
  items: Array<{
    moduleId: number;
    permissionIds: number[];
  }>;
}

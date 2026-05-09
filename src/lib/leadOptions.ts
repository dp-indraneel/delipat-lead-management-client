export const LEAD_SERVICE_TYPES = [
  "SALESFORCE_CONSULTING",
  "CRM_IMPLEMENTATION",
  "CUSTOM_CRM_DEVELOPMENT",
  "LEAD_MANAGEMENT_SYSTEM",
  "TICKET_SUPPORT_SYSTEM",
  "BUSINESS_PROCESS_AUTOMATION",
  "CUSTOMER_360_SOLUTIONS",
  "DASHBOARD_REPORTING",
  "SYSTEM_INTEGRATION",
  "CUSTOM_SOFTWARE",
  "APP_EXCHANGE_SERVICES",
  "MAINTENANCE_SUPPORT",
  "OTHER",
] as const;

export const LEAD_PROJECT_TYPES = [
  "NEW_PROJECT",
  "MVP",
  "PRODUCT_MODERNIZATION",
  "TEAM_EXTENSION",
  "BUG_FIXES",
  "MAINTENANCE",
  "INTEGRATION",
  "AUTOMATION",
  "DISCOVERY_WORKSHOP",
  "OTHER",
] as const;

export const LEAD_HOTNESS_STATUSES = ["HOT", "WARM", "COLD"] as const;

export const LEAD_RECORD_STATUSES = [
  "AI_ANALYSIS_PENDING",
  "AI_ANALYZING",
  "AI_REVIEW_REQUIRED",
  "NEW",
  "IN_REVIEW",
  "CONTACT_ATTEMPTED",
  "FOLLOW_UP",
  "CONSULTATION_SCHEDULED",
  "QUALIFIED",
  "SIGNED",
  "REJECTED",
  "CLOSED",
] as const;

export const LEAD_SOURCES = [
  "WEBSITE_FORM",
  "GOOGLE_ADS",
  "WHATSAPP",
  "REFERRAL",
  "LINKEDIN",
  "META_ADS",
  "PHONE_CALL",
  "UPWORK",
  "COLD_EMAIL",
  "SEO_ORGANIC",
  "AI_CHATBOT",
  "LIVE_CHAT",
  "MANUAL_ENTRY",
  "BULK_IMPORT",
] as const;

export const AI_PROVIDERS = ["OPENAI", "CLAUDE"] as const;
export const PREFERRED_CONTACT_METHODS = ["PHONE", "EMAIL", "WHATSAPP", "MEETING"] as const;

export const LEAD_DEFAULT_SOURCE = "MANUAL_ENTRY" as const;
export const LEAD_CHATBOT_SOURCE = "AI_CHATBOT" as const;
export const LEAD_DEFAULT_STATUS = "NEW" as const;

export type LeadServiceType = (typeof LEAD_SERVICE_TYPES)[number];
export type LeadProjectType = (typeof LEAD_PROJECT_TYPES)[number];
export type LeadHotnessStatus = (typeof LEAD_HOTNESS_STATUSES)[number];
export type LeadRecordStatus = (typeof LEAD_RECORD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type AiProvider = (typeof AI_PROVIDERS)[number];

type ScoreInput = {
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  location?: string | null;
  serviceTypeText?: string | null;
  serviceType?: string | null;
  projectTypeText?: string | null;
  projectType?: string | null;
  projectBudget?: string | null;
  projectTimeline?: string | null;
  projectDescription?: string | null;
  currentChallenges?: string | null;
  techStack?: string | null;
  isDecisionMaker?: boolean | null;
  customFields?: Record<string, unknown> | null;
};

export function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function calculateLeadStatusFromScore(score?: number | null): LeadHotnessStatus | null {
  if (score === null || score === undefined) return null;
  if (score >= 80) return "HOT";
  if (score >= 50) return "WARM";
  return "COLD";
}

export function calculateLeadScore(input: ScoreInput) {
  let score = 0;

  if (normalizeOptionalString(input.fullName)) score += 10;
  if (normalizeOptionalString(input.phone)) score += 15;
  if (normalizeOptionalString(input.email)) score += 10;
  if (normalizeOptionalString(input.companyName)) score += 15;
  if (normalizeOptionalString(input.companyWebsite)) score += 10;
  if (normalizeOptionalString(input.location)) score += 5;
  if (normalizeOptionalString(input.serviceType) || normalizeOptionalString(input.serviceTypeText)) score += 10;
  if (normalizeOptionalString(input.projectType) || normalizeOptionalString(input.projectTypeText)) score += 10;
  if (normalizeOptionalString(input.projectBudget)) score += 10;
  if (normalizeOptionalString(input.projectTimeline)) score += 5;
  if (normalizeOptionalString(input.projectDescription)) score += 10;
  if (normalizeOptionalString(input.currentChallenges)) score += 5;
  if (normalizeOptionalString(input.techStack)) score += 5;
  if (input.isDecisionMaker === true) score += 10;
  if (input.customFields && Object.keys(input.customFields).length) score += 5;

  return Math.max(0, Math.min(100, score));
}

export function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createOptions(values: readonly string[]) {
  return values.map((value) => ({
    value,
    label: formatEnumLabel(value),
  }));
}

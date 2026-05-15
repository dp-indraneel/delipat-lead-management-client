import type { CreateLeadInput } from "../types/api";
import {
  calculateLeadScore,
  calculateLeadStatusFromScore,
  formatEnumLabel,
} from "./leadOptions";

export function createLeadForm(): CreateLeadInput {
  return {
    fullName: "",
    phone: "",
    whatsappNumber: "",
    email: "",
    source: "",
    status: "",
    businessType: "",
    companyName: "",
    companyWebsite: "",
    jobTitle: "",
    serviceType: "",
    serviceTypeOther: "",
    serviceTypeText: "",
    projectType: "",
    projectTypeOther: "",
    projectTypeText: "",
    projectBudget: "",
    projectTimeline: "",
    location: "",
    preferredContactMethod: "",
    projectDescription: "",
    currentChallenges: "",
    expectedFeatures: "",
    techStack: "",
    isDecisionMaker: true,
    notes: "",
    sourceLabel: "",
    campaign: "",
    medium: "",
    channel: "",
    pageUrl: "",
    referrerUrl: "",
    gclid: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmTerm: "",
    utmContent: "",
    leadScore: null,
    leadStatus: null,
    score: null,
    customFields: null,
    payload: null,
    aiProvider: null,
    aiModel: "",
    rawConversation: [],
    aiSummary: "",
    aiNextAction: "",
    aiMissingFields: [],
  };
}

export function formatJson(value: unknown, fallback: unknown) {
  return JSON.stringify(value ?? fallback, null, 2);
}

function prettifyKey(key: string) {
  return key
    .replace(/\[(\d+)\]/g, " $1")
    .replace(/\./g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((part) => formatEnumLabel(part))
    .join(" ");
}

function flattenJsonEntries(value: unknown, path = ""): Array<[string, string]> {
  if (value === null || value === undefined) {
    return path ? [[path, "-"]] : [];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return path ? [[path, "[]"]] : [];
    }

    return value.flatMap((item, index) => flattenJsonEntries(item, `${path}[${index}]`));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);

    if (entries.length === 0) {
      return path ? [[path, "{}"]] : [];
    }

    return entries.flatMap(([key, nestedValue]) =>
      flattenJsonEntries(nestedValue, path ? `${path}.${key}` : key),
    );
  }

  return [[path || "value", String(value)]];
}

export function formatJsonKeyValue(value: unknown, fallback: unknown) {
  const source = value ?? fallback;
  const rows = flattenJsonEntries(source);

  if (!rows.length) {
    return "-";
  }

  return rows.map(([key, entryValue]) => `${prettifyKey(key)}: ${entryValue}`).join("\n");
}

export function buildLeadPayload(form: CreateLeadInput): CreateLeadInput {
  const serviceTypeText =
    form.serviceType === "OTHER" ? form.serviceTypeOther || null : form.serviceTypeText || null;
  const projectTypeText =
    form.projectType === "OTHER" ? form.projectTypeOther || null : form.projectTypeText || null;
  const leadScore = calculateLeadScore({
    ...form,
    serviceTypeText,
    projectTypeText,
  });

  return {
    ...form,
    serviceTypeOther: form.serviceType === "OTHER" ? form.serviceTypeOther || null : null,
    serviceTypeText,
    projectTypeOther: form.projectType === "OTHER" ? form.projectTypeOther || null : null,
    projectTypeText,
    leadScore,
    leadStatus: calculateLeadStatusFromScore(leadScore),
    score: form.score ?? leadScore,
    aiProvider: form.aiProvider || null,
    aiModel: form.aiModel || null,
    rawConversation: form.rawConversation ?? [],
    aiMissingFields: form.aiMissingFields ?? [],
  };
}

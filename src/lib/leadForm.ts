import type { CreateLeadInput } from "../types/api";
import {
  calculateLeadScore,
  calculateLeadStatusFromScore,
} from "./leadOptions";

export function createLeadForm(): CreateLeadInput {
  return {
    fullName: "",
    phone: "",
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
    leadScore: null,
    leadStatus: null,
    aiProvider: null,
    aiModel: "",
    extraCapturedData: {},
    rawConversation: [],
    rawExtractedData: {},
    aiSummary: "",
    aiScore: null,
    aiAnalysisStatus: null,
  };
}

export function formatJson(value: unknown, fallback: unknown) {
  return JSON.stringify(value ?? fallback, null, 2);
}

export function buildLeadPayload(form: CreateLeadInput): CreateLeadInput {
  const serviceTypeText = form.serviceType === "OTHER" ? form.serviceTypeOther || null : null;
  const projectTypeText = form.projectType === "OTHER" ? form.projectTypeOther || null : null;
  const leadScore = calculateLeadScore({
    ...form,
    serviceTypeText,
    projectTypeText,
    customFields: form.extraCapturedData ?? null,
  });

  return {
    ...form,
    serviceTypeOther: form.serviceType === "OTHER" ? form.serviceTypeOther || null : null,
    serviceTypeText,
    projectTypeOther: form.projectType === "OTHER" ? form.projectTypeOther || null : null,
    projectTypeText,
    leadScore,
    leadStatus: calculateLeadStatusFromScore(leadScore),
    aiProvider: form.source === "AI_CHATBOT" ? form.aiProvider || null : null,
    aiModel: form.source === "AI_CHATBOT" ? form.aiModel || null : null,
    aiScore: null,
    aiAnalysisStatus: null,
    extraCapturedData: form.extraCapturedData ?? {},
    rawExtractedData: form.rawExtractedData ?? {},
    rawConversation: form.rawConversation ?? [],
  };
}

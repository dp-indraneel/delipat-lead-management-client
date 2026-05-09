import SearchableSelect from "../ui/SearchableSelect";
import {
  AI_PROVIDERS,
  calculateLeadScore,
  calculateLeadStatusFromScore,
  createOptions,
  LEAD_CHATBOT_SOURCE,
  LEAD_PROJECT_TYPES,
  LEAD_RECORD_STATUSES,
  LEAD_SERVICE_TYPES,
  LEAD_SOURCES,
  PREFERRED_CONTACT_METHODS,
} from "../../lib/leadOptions";
import type { CreateLeadInput } from "../../types/api";

interface Props {
  form: CreateLeadInput;
  onChange: (value: CreateLeadInput) => void;
}

const sourceOptions = createOptions(LEAD_SOURCES);
const serviceTypeOptions = createOptions(LEAD_SERVICE_TYPES);
const projectTypeOptions = createOptions(LEAD_PROJECT_TYPES);
const recordStatusOptions = createOptions(LEAD_RECORD_STATUSES);
const aiProviderOptions = createOptions(AI_PROVIDERS);
const preferredContactOptions = createOptions(PREFERRED_CONTACT_METHODS);

export default function LeadFormFields({ form, onChange }: Props) {
  const setField = <K extends keyof CreateLeadInput>(key: K, value: CreateLeadInput[K]) => {
    onChange({
      ...form,
      [key]: value,
    });
  };

  const calculatedScore = calculateLeadScore({
    ...form,
    serviceTypeText: form.serviceType === "OTHER" ? form.serviceTypeOther : null,
    projectTypeText: form.projectType === "OTHER" ? form.projectTypeOther : null,
    customFields: form.extraCapturedData ?? null,
  });
  const calculatedHotness = calculateLeadStatusFromScore(calculatedScore);
  const isChatbotLead = form.source === LEAD_CHATBOT_SOURCE;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Lead Score" value={`${calculatedScore}/100`} />
        <MetricCard label="Lead Hotness" value={calculatedHotness || "-"} />
        <MetricCard label="Source" value={form.source || "-"} />
        <MetricCard label="Status" value={form.status || "-"} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={form.fullName || ""}
          onChange={(event) => setField("fullName", event.target.value)}
          placeholder="Full name"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <input
          value={form.jobTitle || ""}
          onChange={(event) => setField("jobTitle", event.target.value)}
          placeholder="Job title"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <input
          value={form.email || ""}
          onChange={(event) => setField("email", event.target.value)}
          placeholder="Email"
          type="email"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <input
          value={form.phone || ""}
          onChange={(event) => setField("phone", event.target.value)}
          placeholder="Phone"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <input
          value={form.companyName || ""}
          onChange={(event) => setField("companyName", event.target.value)}
          placeholder="Company name"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <input
          value={form.companyWebsite || ""}
          onChange={(event) => setField("companyWebsite", event.target.value)}
          placeholder="Company website"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <input
          value={form.businessType || ""}
          onChange={(event) => setField("businessType", event.target.value)}
          placeholder="Business type"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <input
          value={form.location || ""}
          onChange={(event) => setField("location", event.target.value)}
          placeholder="Location"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <SearchableSelect
          options={sourceOptions}
          value={form.source || ""}
          placeholder="Select a lead source"
          isClearable={false}
          onChange={(value) => setField("source", value)}
        />
        <SearchableSelect
          options={recordStatusOptions}
          value={form.status || ""}
          placeholder="Select a record status"
          isClearable={false}
          onChange={(value) => setField("status", value)}
        />
        <SearchableSelect
          options={serviceTypeOptions}
          value={form.serviceType || ""}
          placeholder="Select a service type"
          isClearable={false}
          onChange={(value) => setField("serviceType", value)}
        />
        <SearchableSelect
          options={projectTypeOptions}
          value={form.projectType || ""}
          placeholder="Select a project type"
          isClearable={false}
          onChange={(value) => setField("projectType", value)}
        />
        {form.serviceType === "OTHER" ? (
          <input
            value={form.serviceTypeOther || ""}
            onChange={(event) => setField("serviceTypeOther", event.target.value)}
            placeholder="Enter service type"
            className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
        ) : null}
        {form.projectType === "OTHER" ? (
          <input
            value={form.projectTypeOther || ""}
            onChange={(event) => setField("projectTypeOther", event.target.value)}
            placeholder="Enter project type"
            className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
        ) : null}
        <input
          value={form.projectBudget || ""}
          onChange={(event) => setField("projectBudget", event.target.value)}
          placeholder="Project budget"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <input
          value={form.projectTimeline || ""}
          onChange={(event) => setField("projectTimeline", event.target.value)}
          placeholder="Project timeline"
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
        <SearchableSelect
          options={preferredContactOptions}
          value={form.preferredContactMethod || ""}
          placeholder="Select a contact method"
          onChange={(value) => setField("preferredContactMethod", value)}
        />
        {isChatbotLead ? (
          <SearchableSelect
            options={aiProviderOptions}
            value={form.aiProvider || ""}
            placeholder="Select an AI provider"
            onChange={(value) => setField("aiProvider", value)}
          />
        ) : null}
        {isChatbotLead ? (
          <input
            value={form.aiModel || ""}
            onChange={(event) => setField("aiModel", event.target.value)}
            placeholder="AI model"
            className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
        ) : null}
      </div>

      <textarea
        value={form.projectDescription || ""}
        onChange={(event) => setField("projectDescription", event.target.value)}
        rows={4}
        placeholder="Project description"
        className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
      <textarea
        value={form.currentChallenges || ""}
        onChange={(event) => setField("currentChallenges", event.target.value)}
        rows={4}
        placeholder="Current challenges"
        className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
      <textarea
        value={form.expectedFeatures || ""}
        onChange={(event) => setField("expectedFeatures", event.target.value)}
        rows={4}
        placeholder="Expected features"
        className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
      <textarea
        value={form.techStack || ""}
        onChange={(event) => setField("techStack", event.target.value)}
        rows={4}
        placeholder="Preferred tech stack"
        className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
      <textarea
        value={form.notes || ""}
        onChange={(event) => setField("notes", event.target.value)}
        rows={4}
        placeholder="Internal notes"
        className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
      {isChatbotLead || form.aiSummary ? (
        <textarea
          value={form.aiSummary || ""}
          onChange={(event) => setField("aiSummary", event.target.value)}
          rows={4}
          placeholder="AI summary"
          className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
        />
      ) : null}

      <label className="flex items-start gap-3 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144]">
        <input
          type="checkbox"
          checked={Boolean(form.isDecisionMaker)}
          onChange={(event) => setField("isDecisionMaker", event.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="block font-medium text-[#013144]">Decision-maker contact</span>
          <span className="block text-[#013144]/60">
            Turn this on when the person can approve budget or make the final purchase decision.
          </span>
        </span>
      </label>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-[#013144]/45">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#013144]">{value}</p>
    </div>
  );
}

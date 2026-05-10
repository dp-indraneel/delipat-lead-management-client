import SearchableSelect from "../ui/SearchableSelect";
import {
  AI_PROVIDERS,
  calculateLeadScore,
  calculateLeadStatusFromScore,
  createOptions,
  formatEnumLabel,
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
  showAiSummaryField?: boolean;
}

const sourceOptions = createOptions(LEAD_SOURCES);
const serviceTypeOptions = createOptions(LEAD_SERVICE_TYPES);
const projectTypeOptions = createOptions(LEAD_PROJECT_TYPES);
const recordStatusOptions = createOptions(LEAD_RECORD_STATUSES);
const aiProviderOptions = createOptions(AI_PROVIDERS);
const preferredContactOptions = createOptions(PREFERRED_CONTACT_METHODS);

export default function LeadFormFields({ form, onChange, showAiSummaryField = false }: Props) {
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
  });
  const calculatedHotness = calculateLeadStatusFromScore(calculatedScore);
  const isChatbotLead = form.source === LEAD_CHATBOT_SOURCE;
  const shouldShowAiSummaryField = isChatbotLead || showAiSummaryField;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Lead Score" value={`${calculatedScore}/100`} />
        <MetricCard label="Lead Hotness" value={calculatedHotness || "-"} />
        <MetricCard label="Source" value={form.source ? formatEnumLabel(form.source) : "-"} />
        <MetricCard label="Status" value={form.status ? formatEnumLabel(form.status) : "-"} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="full-name"
          label="Full name"
          value={form.fullName || ""}
          onChange={(event) => setField("fullName", event.target.value)}
          placeholder="Full name"
        />
        <TextField
          id="job-title"
          label="Job title"
          value={form.jobTitle || ""}
          onChange={(event) => setField("jobTitle", event.target.value)}
          placeholder="Job title"
        />
        <TextField
          id="email"
          label="Email"
          value={form.email || ""}
          onChange={(event) => setField("email", event.target.value)}
          placeholder="Email"
          type="email"
        />
        <TextField
          id="phone"
          label="Phone"
          value={form.phone || ""}
          onChange={(event) => setField("phone", event.target.value)}
          placeholder="Phone"
        />
        <TextField
          id="company-name"
          label="Company name"
          value={form.companyName || ""}
          onChange={(event) => setField("companyName", event.target.value)}
          placeholder="Company name"
        />
        <TextField
          id="company-website"
          label="Company website"
          value={form.companyWebsite || ""}
          onChange={(event) => setField("companyWebsite", event.target.value)}
          placeholder="Company website"
        />
        <TextField
          id="business-type"
          label="Business type"
          value={form.businessType || ""}
          onChange={(event) => setField("businessType", event.target.value)}
          placeholder="Business type"
        />
        <TextField
          id="location"
          label="Location"
          value={form.location || ""}
          onChange={(event) => setField("location", event.target.value)}
          placeholder="Location"
        />
        <SelectField label="Lead source">
          <SearchableSelect
            options={sourceOptions}
            value={form.source || ""}
            placeholder="Select a lead source"
            isClearable={false}
            onChange={(value) => setField("source", value)}
          />
        </SelectField>
        <SelectField label="Record status">
          <SearchableSelect
            options={recordStatusOptions}
            value={form.status || ""}
            placeholder="Select a record status"
            isClearable={false}
            onChange={(value) => setField("status", value)}
          />
        </SelectField>
        <SelectField label="Service type">
          <SearchableSelect
            options={serviceTypeOptions}
            value={form.serviceType || ""}
            placeholder="Select a service type"
            isClearable={false}
            onChange={(value) => setField("serviceType", value)}
          />
        </SelectField>
        <SelectField label="Project type">
          <SearchableSelect
            options={projectTypeOptions}
            value={form.projectType || ""}
            placeholder="Select a project type"
            isClearable={false}
            onChange={(value) => setField("projectType", value)}
          />
        </SelectField>
        {form.serviceType === "OTHER" ? (
          <TextField
            id="service-type-other"
            label="Other service type"
            value={form.serviceTypeOther || ""}
            onChange={(event) => setField("serviceTypeOther", event.target.value)}
            placeholder="Enter service type"
          />
        ) : null}
        {form.projectType === "OTHER" ? (
          <TextField
            id="project-type-other"
            label="Other project type"
            value={form.projectTypeOther || ""}
            onChange={(event) => setField("projectTypeOther", event.target.value)}
            placeholder="Enter project type"
          />
        ) : null}
        <TextField
          id="project-budget"
          label="Project budget"
          value={form.projectBudget || ""}
          onChange={(event) => setField("projectBudget", event.target.value)}
          placeholder="Project budget"
        />
        <TextField
          id="project-timeline"
          label="Project timeline"
          value={form.projectTimeline || ""}
          onChange={(event) => setField("projectTimeline", event.target.value)}
          placeholder="Project timeline"
        />
        <SelectField label="Preferred contact method">
          <SearchableSelect
            options={preferredContactOptions}
            value={form.preferredContactMethod || ""}
            placeholder="Select a contact method"
            onChange={(value) => setField("preferredContactMethod", value)}
          />
        </SelectField>
        {isChatbotLead ? (
          <SelectField label="AI provider">
            <SearchableSelect
              options={aiProviderOptions}
              value={form.aiProvider || ""}
              placeholder="Select an AI provider"
              onChange={(value) => setField("aiProvider", value)}
            />
          </SelectField>
        ) : null}
        {isChatbotLead ? (
          <TextField
            id="ai-model"
            label="AI model"
            value={form.aiModel || ""}
            onChange={(event) => setField("aiModel", event.target.value)}
            placeholder="AI model"
          />
        ) : null}
      </div>

      <TextAreaField
        id="project-description"
        label="Project description"
        value={form.projectDescription || ""}
        onChange={(event) => setField("projectDescription", event.target.value)}
        placeholder="Project description"
      />
      <TextAreaField
        id="current-challenges"
        label="Current challenges"
        value={form.currentChallenges || ""}
        onChange={(event) => setField("currentChallenges", event.target.value)}
        placeholder="Current challenges"
      />
      <TextAreaField
        id="expected-features"
        label="Expected features"
        value={form.expectedFeatures || ""}
        onChange={(event) => setField("expectedFeatures", event.target.value)}
        placeholder="Expected features"
      />
      <TextAreaField
        id="tech-stack"
        label="Preferred tech stack"
        value={form.techStack || ""}
        onChange={(event) => setField("techStack", event.target.value)}
        placeholder="Preferred tech stack"
      />
      <TextAreaField
        id="notes"
        label="Internal notes"
        value={form.notes || ""}
        onChange={(event) => setField("notes", event.target.value)}
        placeholder="Internal notes"
      />
      {shouldShowAiSummaryField ? (
        <TextAreaField
          id="ai-summary"
          label="AI summary"
          value={form.aiSummary || ""}
          onChange={(event) => setField("aiSummary", event.target.value)}
          placeholder="AI summary"
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

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  type?: string;
}

function TextField({ id, label, value, onChange, placeholder, type = "text" }: TextFieldProps) {
  return (
    <label htmlFor={id} className="space-y-2">
      <span className="block text-xs font-medium uppercase tracking-wide text-[#013144]/60">{label}</span>
      <input
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        className="h-11 w-full rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
      />
    </label>
  );
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
}

function TextAreaField({ id, label, value, onChange, placeholder }: TextAreaFieldProps) {
  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="block text-xs font-medium uppercase tracking-wide text-[#013144]/60">{label}</span>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
    </label>
  );
}

function SelectField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium uppercase tracking-wide text-[#013144]/60">{label}</span>
      {children}
    </div>
  );
}

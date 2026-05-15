import LeadInputField from "./LeadInputField";
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
  fieldErrors?: Record<string, string[]>;
  onFieldChange?: (field: keyof CreateLeadInput) => void;
}

const sourceOptions = createOptions(LEAD_SOURCES);
const serviceTypeOptions = createOptions(LEAD_SERVICE_TYPES);
const projectTypeOptions = createOptions(LEAD_PROJECT_TYPES);
const recordStatusOptions = createOptions(LEAD_RECORD_STATUSES);
const aiProviderOptions = createOptions(AI_PROVIDERS);
const preferredContactOptions = createOptions(PREFERRED_CONTACT_METHODS);

export default function LeadFormFields({
  form,
  onChange,
  showAiSummaryField = false,
  fieldErrors = {},
  onFieldChange,
}: Props) {
  const setField = <K extends keyof CreateLeadInput>(key: K, value: CreateLeadInput[K]) => {
    onFieldChange?.(key);
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
  const shouldShowAiFields = isChatbotLead || showAiSummaryField || Boolean(form.aiProvider || form.aiModel);

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
          errors={fieldErrors.fullName}
        />
        <TextField
          id="job-title"
          label="Job title"
          value={form.jobTitle || ""}
          onChange={(event) => setField("jobTitle", event.target.value)}
          placeholder="Job title"
          errors={fieldErrors.jobTitle}
        />
        <TextField
          id="email"
          label="Email"
          value={form.email || ""}
          onChange={(event) => setField("email", event.target.value)}
          placeholder="Email"
          type="email"
          errors={fieldErrors.email}
        />
        <TextField
          id="phone"
          label="Phone"
          value={form.phone || ""}
          onChange={(event) => setField("phone", event.target.value)}
          placeholder="Phone"
          errors={fieldErrors.phone}
        />
        <TextField
          id="whatsapp-number"
          label="WhatsApp number"
          value={form.whatsappNumber || ""}
          onChange={(event) => setField("whatsappNumber", event.target.value)}
          placeholder="WhatsApp number"
          errors={fieldErrors.whatsappNumber}
        />
        <TextField
          id="company-name"
          label="Company name"
          value={form.companyName || ""}
          onChange={(event) => setField("companyName", event.target.value)}
          placeholder="Company name"
          errors={fieldErrors.companyName}
        />
        <TextField
          id="company-website"
          label="Company website"
          value={form.companyWebsite || ""}
          onChange={(event) => setField("companyWebsite", event.target.value)}
          placeholder="Company website"
          errors={fieldErrors.companyWebsite}
        />
        <TextField
          id="business-type"
          label="Business type"
          value={form.businessType || ""}
          onChange={(event) => setField("businessType", event.target.value)}
          placeholder="Business type"
          errors={fieldErrors.businessType}
        />
        <TextField
          id="location"
          label="Location"
          value={form.location || ""}
          onChange={(event) => setField("location", event.target.value)}
          placeholder="Location"
          errors={fieldErrors.location}
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
            errors={fieldErrors.serviceTypeOther}
          />
        ) : null}
        <TextField
          id="service-type-text"
          label="Service type text"
          value={form.serviceTypeText || ""}
          onChange={(event) => setField("serviceTypeText", event.target.value)}
          placeholder="Service type text"
          errors={fieldErrors.serviceTypeText}
        />
        {form.projectType === "OTHER" ? (
          <TextField
            id="project-type-other"
            label="Other project type"
            value={form.projectTypeOther || ""}
            onChange={(event) => setField("projectTypeOther", event.target.value)}
            placeholder="Enter project type"
            errors={fieldErrors.projectTypeOther}
          />
        ) : null}
        <TextField
          id="project-type-text"
          label="Project type text"
          value={form.projectTypeText || ""}
          onChange={(event) => setField("projectTypeText", event.target.value)}
          placeholder="Project type text"
          errors={fieldErrors.projectTypeText}
        />
        <TextField
          id="project-budget"
          label="Project budget"
          value={form.projectBudget || ""}
          onChange={(event) => setField("projectBudget", event.target.value)}
          placeholder="Project budget"
          errors={fieldErrors.projectBudget}
        />
        <TextField
          id="project-timeline"
          label="Project timeline"
          value={form.projectTimeline || ""}
          onChange={(event) => setField("projectTimeline", event.target.value)}
          placeholder="Project timeline"
          errors={fieldErrors.projectTimeline}
        />
        <SelectField label="Preferred contact method">
          <SearchableSelect
            options={preferredContactOptions}
            value={form.preferredContactMethod || ""}
            placeholder="Select a contact method"
            onChange={(value) => setField("preferredContactMethod", value)}
          />
        </SelectField>
        {shouldShowAiFields ? (
          <SelectField label="AI provider">
            <SearchableSelect
              options={aiProviderOptions}
              value={form.aiProvider || ""}
              placeholder="Select an AI provider"
              onChange={(value) => setField("aiProvider", value)}
            />
          </SelectField>
        ) : null}
        {shouldShowAiFields ? (
          <TextField
            id="ai-model"
            label="AI model"
            value={form.aiModel || ""}
            onChange={(event) => setField("aiModel", event.target.value)}
            placeholder="AI model"
            errors={fieldErrors.aiModel}
          />
        ) : null}
      </div>

      <TextAreaField
        id="project-description"
        label="Project description"
        value={form.projectDescription || ""}
        onChange={(event) => setField("projectDescription", event.target.value)}
        placeholder="Project description"
        errors={fieldErrors.projectDescription}
      />
      <TextAreaField
        id="current-challenges"
        label="Current challenges"
        value={form.currentChallenges || ""}
        onChange={(event) => setField("currentChallenges", event.target.value)}
        placeholder="Current challenges"
        errors={fieldErrors.currentChallenges}
      />
      <TextAreaField
        id="expected-features"
        label="Expected features"
        value={form.expectedFeatures || ""}
        onChange={(event) => setField("expectedFeatures", event.target.value)}
        placeholder="Expected features"
        errors={fieldErrors.expectedFeatures}
      />
      <TextAreaField
        id="tech-stack"
        label="Preferred tech stack"
        value={form.techStack || ""}
        onChange={(event) => setField("techStack", event.target.value)}
        placeholder="Preferred tech stack"
        errors={fieldErrors.techStack}
      />
      <TextAreaField
        id="notes"
        label="Internal notes"
        value={form.notes || ""}
        onChange={(event) => setField("notes", event.target.value)}
        placeholder="Internal notes"
        errors={fieldErrors.notes}
      />
      {shouldShowAiSummaryField ? (
        <TextAreaField
          id="ai-summary"
          label="AI summary"
          value={form.aiSummary || ""}
          onChange={(event) => setField("aiSummary", event.target.value)}
          placeholder="AI summary"
          errors={fieldErrors.aiSummary}
        />
      ) : null}
      {shouldShowAiSummaryField ? (
        <TextAreaField
          id="ai-next-action"
          label="AI next action"
          value={form.aiNextAction || ""}
          onChange={(event) => setField("aiNextAction", event.target.value)}
          placeholder="AI next action"
          errors={fieldErrors.aiNextAction}
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
  errors?: string[];
}

function TextField({ id, label, value, onChange, placeholder, type = "text", errors }: TextFieldProps) {
  return (
    <LeadInputField
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      errors={errors}
    />
  );
}

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
  errors?: string[];
}

function TextAreaField({ id, label, value, onChange, placeholder, errors = [] }: TextAreaFieldProps) {
  const hasError = errors.length > 0;

  return (
    <label htmlFor={id} className="block space-y-2">
      <span className="block text-xs font-medium uppercase tracking-wide text-[#013144]/60">{label}</span>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={4}
        placeholder={placeholder}
        aria-invalid={hasError || undefined}
        className={`w-full rounded-2xl border bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none ${
          hasError ? "border-red-300" : "border-[#013144]/12"
        }`}
      />
      {hasError ? (
        <div className="space-y-1">
          {errors.map((error) => (
            <p key={error} className="text-xs font-medium text-red-600">
              {error}
            </p>
          ))}
        </div>
      ) : null}
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

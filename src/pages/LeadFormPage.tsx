import { useEffect, useState } from "react";
import ChatTranscript from "../components/leads/ChatTranscript";
import LeadInputField from "../components/leads/LeadInputField";
import LeadFormFields from "../components/leads/LeadFormFields";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import { useToast } from "../context/ToastContext";
import { leadApi } from "../lib/api";
import { clearFieldError, getApiFieldErrors, getApiFormMessage } from "../lib/apiErrors";
import { formatDateTime } from "../lib/dateTime";
import { buildLeadPayload, createLeadForm } from "../lib/leadForm";
import { formatEnumLabel } from "../lib/leadOptions";
import { navigateTo } from "../lib/navigation";
import type { CreateLeadInput, Lead } from "../types/api";

interface Props {
  mode: "create" | "edit";
  leadId?: number;
}

interface CustomFieldRow {
  id: string;
  key: string;
  value: string;
}

function mapLeadToForm(lead: Lead): CreateLeadInput {
  const tracking = getPrimaryTracking(lead);

  return {
    fullName: lead.fullName || "",
    phone: lead.phone || "",
    whatsappNumber: lead.whatsappNumber || "",
    email: lead.email || "",
    source: lead.source,
    status: lead.status,
    businessType: lead.businessType,
    companyName: lead.companyName,
    companyWebsite: lead.companyWebsite,
    jobTitle: lead.jobTitle,
    serviceType: lead.serviceType,
    serviceTypeOther: lead.serviceTypeOther,
    serviceTypeText: lead.serviceTypeText,
    projectType: lead.projectType,
    projectTypeOther: lead.projectTypeOther,
    projectTypeText: lead.projectTypeText,
    projectBudget: lead.projectBudget,
    projectTimeline: lead.projectTimeline,
    location: lead.location,
    preferredContactMethod: lead.preferredContactMethod,
    projectDescription: lead.projectDescription,
    currentChallenges: lead.currentChallenges,
    expectedFeatures: lead.expectedFeatures,
    techStack: lead.techStack,
    isDecisionMaker: lead.isDecisionMaker,
    notes: lead.notes,
    sourceLabel: tracking?.sourceLabel ?? lead.sourceLabel,
    campaign: tracking?.campaign ?? lead.campaign,
    medium: tracking?.medium ?? lead.medium,
    channel: tracking?.channel ?? lead.channel,
    pageUrl: tracking?.pageUrl ?? lead.pageUrl,
    referrerUrl: tracking?.referrerUrl ?? lead.referrerUrl,
    gclid: tracking?.gclid ?? lead.gclid,
    utmSource: tracking?.utmSource ?? lead.utmSource,
    utmMedium: tracking?.utmMedium ?? lead.utmMedium,
    utmCampaign: tracking?.utmCampaign ?? lead.utmCampaign,
    utmTerm: tracking?.utmTerm ?? lead.utmTerm,
    utmContent: tracking?.utmContent ?? lead.utmContent,
    leadScore: lead.leadScore,
    leadStatus: lead.leadStatus,
    score: lead.score,
    customFields: lead.customFields || null,
    payload: lead.payload || null,
    aiProvider: lead.aiProvider,
    aiModel: lead.aiModel,
    rawConversation: lead.rawConversation || [],
    aiSummary: lead.aiSummary,
    aiNextAction: lead.aiNextAction,
    aiMissingFields: lead.aiMissingFields || [],
  };
}

export default function LeadFormPage({ mode, leadId }: Props) {
  const isEdit = mode === "edit";
  const { showToast } = useToast();
  const [form, setForm] = useState<CreateLeadInput>(createLeadForm());
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [customFieldRows, setCustomFieldRows] = useState<CustomFieldRow[]>([
    createCustomFieldRow("", ""),
  ]);

  useEffect(() => {
    if (!isEdit || !leadId) {
      setLoading(false);
      return;
    }

    const currentLeadId = leadId;

    async function loadLead() {
      setLoading(true);
      setError("");
      try {
        const response = await leadApi.get(currentLeadId);
        setLead(response.data);
        setForm(mapLeadToForm(response.data));
        setFieldErrors({});
        setCustomFieldRows(customFieldsToRows(response.data.customFields));
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load lead");
      } finally {
        setLoading(false);
      }
    }

    void loadLead();
  }, [isEdit, leadId]);

  const updateForm = (nextForm: CreateLeadInput, nextCustomFields = customFieldsFromRows(customFieldRows)) => {
    setForm(removeResolvedMissingFields(nextForm, nextCustomFields));
  };

  const setField = <K extends keyof CreateLeadInput>(key: K, value: CreateLeadInput[K]) => {
    setFieldErrors((current) => clearFieldError(current, key));
    updateForm({
      ...form,
      [key]: value,
    });
  };

  const updateCustomFieldRows = (rows: CustomFieldRow[]) => {
    setCustomFieldRows(rows);
    updateForm(form, customFieldsFromRows(rows));
  };

  const saveLead = async () => {
    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      const customFields = customFieldsFromRows(customFieldRows);
      const nextForm = removeResolvedMissingFields(form, customFields);
      const payload = buildLeadPayload({
        ...nextForm,
        customFields,
        payload: isEdit ? lead?.payload || null : form.payload || null,
        rawConversation: isEdit ? lead?.rawConversation || [] : form.rawConversation || [],
      });

      if (isEdit && leadId) {
        await leadApi.update(leadId, payload);
        showToast({
          type: "success",
          title: "Lead updated",
          message: `${nextForm.fullName || `Lead #${leadId}`} was updated successfully.`,
        });
        navigateTo(`/leads/${leadId}`);
      } else {
        await leadApi.create(payload);
        showToast({
          type: "success",
          title: "Lead created",
          message: `${nextForm.fullName || "New lead"} was created successfully.`,
        });
        navigateTo("/leads");
      }
    } catch (nextError) {
      setFieldErrors(getApiFieldErrors(nextError));
      setError(getApiFormMessage(nextError, isEdit ? "Failed to update lead" : "Failed to create lead"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageTitle
        title={isEdit ? `Edit Lead #${leadId}` : "Create Lead"}
        subtitle={
          isEdit
            ? "Update the lead record using the backend lead API."
            : "Add a new lead directly into the pipeline using the backend lead API."
        }
        action={
          <Button variant="secondary" onClick={() => navigateTo(isEdit && leadId ? `/leads/${leadId}` : "/leads")}>
            {isEdit ? "Back to Lead" : "Back to Leads"}
          </Button>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card
        title="Lead Details"
        description={isEdit ? "Edit the lead details and save your changes." : "Fill in the CRM lead fields."}
      >
        {loading ? (
          <p className="text-sm text-[#013144]/60">Loading lead...</p>
        ) : (
          <div className="space-y-5">
            <LeadFormFields
              form={form}
              onChange={updateForm}
              showAiSummaryField={isEdit}
              fieldErrors={fieldErrors}
              onFieldChange={(field) => setFieldErrors((current) => clearFieldError(current, field))}
            />

            <FormSection title="Tracking">
              <EditableField
                label="Source Label"
                value={form.sourceLabel || ""}
                errors={fieldErrors.sourceLabel}
                onChange={(value) => setField("sourceLabel", value)}
              />
              <EditableField
                label="Campaign"
                value={form.campaign || ""}
                errors={fieldErrors.campaign}
                onChange={(value) => setField("campaign", value)}
              />
              <EditableField
                label="Medium"
                value={form.medium || ""}
                errors={fieldErrors.medium}
                onChange={(value) => setField("medium", value)}
              />
              <EditableField
                label="Channel"
                value={form.channel || ""}
                errors={fieldErrors.channel}
                onChange={(value) => setField("channel", value)}
              />
              <EditableField
                label="Page URL"
                value={form.pageUrl || ""}
                errors={fieldErrors.pageUrl}
                onChange={(value) => setField("pageUrl", value)}
              />
              <EditableField
                label="Referrer URL"
                value={form.referrerUrl || ""}
                errors={fieldErrors.referrerUrl}
                onChange={(value) => setField("referrerUrl", value)}
              />
              <EditableField
                label="GCLID"
                value={form.gclid || ""}
                errors={fieldErrors.gclid}
                onChange={(value) => setField("gclid", value)}
              />
              <EditableField
                label="UTM Source"
                value={form.utmSource || ""}
                errors={fieldErrors.utmSource}
                onChange={(value) => setField("utmSource", value)}
              />
              <EditableField
                label="UTM Medium"
                value={form.utmMedium || ""}
                errors={fieldErrors.utmMedium}
                onChange={(value) => setField("utmMedium", value)}
              />
              <EditableField
                label="UTM Campaign"
                value={form.utmCampaign || ""}
                errors={fieldErrors.utmCampaign}
                onChange={(value) => setField("utmCampaign", value)}
              />
              <EditableField
                label="UTM Term"
                value={form.utmTerm || ""}
                errors={fieldErrors.utmTerm}
                onChange={(value) => setField("utmTerm", value)}
              />
              <EditableField
                label="UTM Content"
                value={form.utmContent || ""}
                errors={fieldErrors.utmContent}
                onChange={(value) => setField("utmContent", value)}
              />
            </FormSection>

            {isEdit && lead ? (
              <FormSection title="System Info">
                <ReadOnlyField label="AI Status" value={lead.aiStatus ? formatEnumLabel(lead.aiStatus) : "-"} />
                <ReadOnlyField
                  label="Score"
                  value={
                    lead.score !== null && lead.score !== undefined
                      ? String(lead.score)
                      : lead.leadScore !== null && lead.leadScore !== undefined
                        ? String(lead.leadScore)
                        : "-"
                  }
                />
                <ReadOnlyField
                  label="Submitted By"
                  value={lead.submittedByUser?.name || String(lead.submittedByUserId || "-")}
                />
                <ReadOnlyField
                  label="Assigned Sales Executive"
                  value={lead.assignedSalesExecutive?.name || String(lead.assignedSalesExecutiveId || "-")}
                />
                <ReadOnlyField label="Created At" value={formatDateTime(lead.createdAt)} />
                <ReadOnlyField label="Updated At" value={formatDateTime(lead.updatedAt)} />
              </FormSection>
            ) : null}

            {isEdit ? (
              <JsonReadOnlyTextArea
                label="AI Missing Fields"
                value={
                  form.aiMissingFields?.length
                    ? form.aiMissingFields.map((field) => formatFieldLabel(field)).join("\n")
                    : "-"
                }
              />
            ) : null}

            <CustomFieldsEditor rows={customFieldRows} onChange={updateCustomFieldRows} />

            {isEdit && lead ? (
              <>
                <TranscriptSection label="Raw Conversation" entries={lead.rawConversation || []} />
                <TranscriptSection label="Messages" entries={lead.messages || []} />
              </>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                onClick={() => navigateTo(isEdit && leadId ? `/leads/${leadId}` : "/leads")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button disabled={saving} onClick={saveLead}>
                {saving ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save Changes" : "Create Lead"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#013144]/45">{title}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

function EditableField({
  label,
  value,
  onChange,
  errors,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  errors?: string[];
}) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <LeadInputField
      id={id}
      label={label}
      value={value}
      errors={errors}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return <LeadInputField label={label} value={value || ""} readOnly />;
}

function CustomFieldsEditor({
  rows,
  onChange,
}: {
  rows: CustomFieldRow[];
  onChange: (rows: CustomFieldRow[]) => void;
}) {
  const updateRow = (id: string, key: keyof CustomFieldRow, value: string) => {
    onChange(rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  };

  const removeRow = (id: string) => {
    const nextRows = rows.filter((row) => row.id !== id);
    onChange(nextRows.length ? nextRows : [createCustomFieldRow("", "")]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-[#013144]/45">Custom Fields</p>
        <Button variant="secondary" onClick={() => onChange([...rows, createCustomFieldRow("", "")])}>
          Add Field
        </Button>
      </div>
      <div className="space-y-3 rounded-lg border border-[#013144]/12 bg-white p-3 shadow-sm shadow-[#013144]/5">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-lg border border-[#013144]/10 bg-[#f8fbfc] p-3"
          >
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <LeadInputField
                  id={`custom-field-key-${row.id}`}
                  label="Field key"
                  value={row.key}
                  onChange={(event) => updateRow(row.id, "key", event.target.value)}
                  placeholder=""
                  wrapperClassName="min-w-0"
                  className="bg-white"
                />
              </div>
              <div className="min-w-0 flex-[1.4]">
                <LeadInputField
                  id={`custom-field-value-${row.id}`}
                  label="Field value"
                  value={row.value}
                  onChange={(event) => updateRow(row.id, "value", event.target.value)}
                  placeholder=""
                  wrapperClassName="min-w-0"
                  className="bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="h-10 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-700 transition hover:bg-red-100 lg:w-28"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JsonReadOnlyTextArea({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-[#013144]/45">{label}</p>
      <textarea
        value={value}
        readOnly
        rows={Math.max(value.split("\n").length, 4)}
        className="w-full rounded-lg border border-[#013144]/12 bg-[#013144]/[0.03] px-3 py-2.5 font-mono text-sm text-[#013144] outline-none"
      />
    </div>
  );
}

function TranscriptSection({ label, entries }: { label: string; entries: unknown[] }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-[#013144]/45">{label}</p>
      <ChatTranscript entries={entries} constrainHeight={false} />
    </div>
  );
}

function createCustomFieldRow(key: string, value: unknown): CustomFieldRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    key,
    value: value === null || value === undefined ? "" : String(value),
  };
}

function customFieldsToRows(customFields: Record<string, unknown> | null | undefined): CustomFieldRow[] {
  const rows = Object.entries(customFields || {}).map(([key, value]) => createCustomFieldRow(key, value));
  return rows.length ? rows : [createCustomFieldRow("", "")];
}

function customFieldsFromRows(rows: CustomFieldRow[]) {
  const fields = rows.reduce<Record<string, string>>((accumulator, row) => {
    const normalizedKey = normalizeCustomFieldKey(row.key);

    if (normalizedKey) {
      accumulator[normalizedKey] = row.value;
    }

    return accumulator;
  }, {});

  return Object.keys(fields).length ? fields : null;
}

function normalizeCustomFieldKey(value: string) {
  const parts = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);

  if (!parts.length) {
    return "";
  }

  return parts
    .map((part, index) => {
      const normalized = part.toLowerCase();
      return index === 0 ? normalized : normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join("");
}

function removeResolvedMissingFields(
  form: CreateLeadInput,
  customFields: Record<string, unknown> | null
): CreateLeadInput {
  if (!form.aiMissingFields?.length) {
    return form;
  }

  return {
    ...form,
    aiMissingFields: form.aiMissingFields.filter((field) => !isMissingFieldResolved(field, form, customFields)),
  };
}

function isMissingFieldResolved(
  field: string,
  form: CreateLeadInput,
  customFields: Record<string, unknown> | null
) {
  const normalizedField = normalizeCustomFieldKey(field);
  const formRecord = form as unknown as Record<string, unknown>;

  if (isPresentValue(formRecord[field]) || isPresentValue(formRecord[normalizedField])) {
    return true;
  }

  if (!customFields) {
    return false;
  }

  return isPresentValue(customFields[field]) || isPresentValue(customFields[normalizedField]);
}

function isPresentValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "object") {
    return Object.keys(value).length > 0;
  }

  return true;
}

function formatFieldLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPrimaryTracking(lead: Lead | null) {
  return lead?.tracking?.[0] || null;
}

import { useEffect, useState } from "react";
import LeadFormFields from "../components/leads/LeadFormFields";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import { leadApi } from "../lib/api";
import { buildLeadPayload, createLeadForm, formatJsonKeyValue } from "../lib/leadForm";
import { navigateTo } from "../lib/navigation";
import type { CreateLeadInput, Lead } from "../types/api";

interface Props {
  leadId: number;
}

function mapLeadToForm(lead: Lead): CreateLeadInput {
  return {
    fullName: lead.fullName || "",
    phone: lead.phone || "",
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
    leadScore: lead.leadScore,
    leadStatus: lead.leadStatus,
    aiProvider: lead.aiProvider,
    aiModel: lead.aiModel,
    rawConversation: lead.rawConversation || [],
    aiSummary: lead.aiSummary,
  };
}

export default function EditLeadPage({ leadId }: Props) {
  const [form, setForm] = useState<CreateLeadInput>(createLeadForm());
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLead() {
      setLoading(true);
      setError("");
      try {
        const response = await leadApi.get(leadId);
        setLead(response.data);
        setForm(mapLeadToForm(response.data));
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load lead");
      } finally {
        setLoading(false);
      }
    }

    void loadLead();
  }, [leadId]);

  return (
    <div className="space-y-5">
      <PageTitle
        title={`Edit Lead #${leadId}`}
        subtitle="Update the lead record using the backend lead API."
        action={
          <Button variant="secondary" onClick={() => navigateTo(`/leads/${leadId}`)}>
            Back to Lead
          </Button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card title="Lead Details" description="Edit the lead details and save your changes.">
        {loading ? (
          <p className="text-sm text-[#013144]/60">Loading lead...</p>
        ) : (
          <div className="space-y-5">
            <LeadFormFields form={form} onChange={setForm} showAiSummaryField />

            {lead ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <ReadOnlyField label="Source Label" value={lead.sourceLabel} />
                  <ReadOnlyField label="Campaign" value={lead.campaign} />
                  <ReadOnlyField label="Medium" value={lead.medium} />
                  <ReadOnlyField label="Channel" value={lead.channel} />
                  <ReadOnlyField label="Page URL" value={lead.pageUrl} />
                  <ReadOnlyField label="Referrer URL" value={lead.referrerUrl} />
                  <ReadOnlyField label="GCLID" value={lead.gclid} />
                  <ReadOnlyField label="UTM Source" value={lead.utmSource} />
                  <ReadOnlyField label="UTM Medium" value={lead.utmMedium} />
                  <ReadOnlyField label="UTM Campaign" value={lead.utmCampaign} />
                  <ReadOnlyField label="UTM Term" value={lead.utmTerm} />
                  <ReadOnlyField label="UTM Content" value={lead.utmContent} />
                  <ReadOnlyField label="AI Next Action" value={lead.aiNextAction} />
                  <ReadOnlyField
                    label="AI Missing Fields"
                    value={lead.aiMissingFields?.length ? lead.aiMissingFields.join(", ") : "-"}
                  />
                  <ReadOnlyField
                    label="Score"
                    value={lead.score !== null && lead.score !== undefined ? String(lead.score) : "-"}
                  />
                  <ReadOnlyField label="Created At" value={lead.createdAt} />
                </div>

                <JsonTextArea label="Custom Fields" value={formatJsonKeyValue(lead.customFields, {})} />
                <JsonTextArea
                  label="Raw Conversation"
                  value={formatJsonKeyValue(lead.rawConversation, [])}
                />
                <JsonTextArea label="Messages" value={formatJsonKeyValue(lead.messages, [])} />
              </>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => navigateTo(`/leads/${leadId}`)} disabled={saving}>
                Cancel
              </Button>
              <Button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  setError("");
                  try {
                    await leadApi.update(leadId, buildLeadPayload(form));
                    navigateTo(`/leads/${leadId}`);
                  } catch (nextError) {
                    setError(nextError instanceof Error ? nextError.message : "Failed to update lead");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-[#013144]/45">{label}</p>
      <input
        value={value || "-"}
        readOnly
        className="h-11 w-full rounded-xl border border-[#013144]/12 bg-[#013144]/[0.03] px-3 text-sm text-[#013144] outline-none"
      />
    </div>
  );
}

function JsonTextArea({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wide text-[#013144]/45">{label}</p>
      <textarea
        value={value}
        readOnly
        rows={Math.min(Math.max(value.split("\n").length, 4), 12)}
        className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.03] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
      />
    </div>
  );
}

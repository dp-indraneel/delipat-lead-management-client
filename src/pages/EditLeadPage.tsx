import { useEffect, useState } from "react";
import LeadFormFields from "../components/leads/LeadFormFields";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import { leadApi } from "../lib/api";
import { buildLeadPayload, createLeadForm } from "../lib/leadForm";
import { navigateTo } from "../lib/navigation";
import type { CreateLeadInput, Lead } from "../types/api";

interface Props {
  leadId: number;
}

function mapLeadToForm(lead: Lead): CreateLeadInput {
  return {
    fullName: lead.fullName,
    phone: lead.phone,
    email: lead.email,
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
    extraCapturedData: lead.extraCapturedData || {},
    rawConversation: lead.rawConversation || [],
    rawExtractedData: lead.rawExtractedData || {},
    aiSummary: lead.aiSummary,
    aiScore: lead.aiScore,
    aiAnalysisStatus: lead.aiAnalysisStatus,
  };
}

export default function EditLeadPage({ leadId }: Props) {
  const [form, setForm] = useState<CreateLeadInput>(createLeadForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLead() {
      setLoading(true);
      setError("");
      try {
        const response = await leadApi.get(leadId);
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
            <LeadFormFields form={form} onChange={setForm} />

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

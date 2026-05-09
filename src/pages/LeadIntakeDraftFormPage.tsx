import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import { draftApi } from "../lib/api";
import { navigateTo } from "../lib/navigation";
import type { CreateLeadIntakeDraftInput, LeadIntakeDraft } from "../types/api";

interface Props {
  mode: "create" | "edit";
  draftId?: number;
}

function createDraftForm(): CreateLeadIntakeDraftInput {
  return {
    source: "AI_CHATBOT",
    aiProvider: "CLAUDE",
    aiModel: "claude-3-5-sonnet-latest",
    fullName: "",
    phone: "",
    email: "",
    preferredContactMethod: "PHONE",
    caseTypeText: "",
    injurySummary: "",
    incidentDate: "",
    location: "",
    incidentDescription: "",
    medicalTreatment: "",
    liabilityInfo: "",
    insuranceInfo: "",
    representedByAttorney: false,
    extraCapturedData: {
      vehicleDamage: "rear bumper crushed",
      policeReport: true,
      passengers: 1,
    },
    rawConversation: [
      {
        sender: "USER",
        message: "I got rear-ended in Dallas and my neck hurts.",
      },
    ],
    rawExtractedData: {
      fullName: "Jane Doe",
      phone: "+15551234567",
      caseTypeText: "rear-end car accident",
    },
    aiSummary: "Potential motor vehicle injury lead with treatment and liability facts.",
    aiScore: 86,
    reviewStatus: "PENDING_REVIEW",
  };
}

function hydrateDraftForm(draft: LeadIntakeDraft): CreateLeadIntakeDraftInput {
  return {
    source: draft.source,
    aiProvider: draft.aiProvider,
    aiModel: draft.aiModel,
    fullName: draft.fullName,
    phone: draft.phone,
    email: draft.email,
    preferredContactMethod: draft.preferredContactMethod,
    caseTypeText: draft.caseTypeText,
    injurySummary: draft.injurySummary,
    incidentDate: draft.incidentDate,
    location: draft.location,
    incidentDescription: draft.incidentDescription,
    medicalTreatment: draft.medicalTreatment,
    liabilityInfo: draft.liabilityInfo,
    insuranceInfo: draft.insuranceInfo,
    representedByAttorney: draft.representedByAttorney,
    extraCapturedData: draft.extraCapturedData || {},
    rawConversation: draft.rawConversation || [],
    rawExtractedData: draft.rawExtractedData || {},
    aiSummary: draft.aiSummary,
    aiScore: draft.aiScore,
    reviewStatus: draft.reviewStatus,
  };
}

export default function LeadIntakeDraftFormPage({ mode, draftId }: Props) {
  const [form, setForm] = useState<CreateLeadIntakeDraftInput>(createDraftForm());
  const [extraCapturedDataText, setExtraCapturedDataText] = useState(
    JSON.stringify(createDraftForm().extraCapturedData, null, 2)
  );
  const [rawExtractedDataText, setRawExtractedDataText] = useState(
    JSON.stringify(createDraftForm().rawExtractedData, null, 2)
  );
  const [rawConversationText, setRawConversationText] = useState(
    JSON.stringify(createDraftForm().rawConversation, null, 2)
  );
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !draftId) {
      return;
    }
    const currentDraftId = draftId;

    async function loadDraft() {
      setLoading(true);
      setError("");
      try {
        const response = await draftApi.get(currentDraftId);
        const nextForm = hydrateDraftForm(response.data);
        setForm(nextForm);
        setExtraCapturedDataText(JSON.stringify(nextForm.extraCapturedData || {}, null, 2));
        setRawExtractedDataText(JSON.stringify(nextForm.rawExtractedData || {}, null, 2));
        setRawConversationText(JSON.stringify(nextForm.rawConversation || [], null, 2));
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load draft");
      } finally {
        setLoading(false);
      }
    }

    void loadDraft();
  }, [draftId, mode]);

  const setField = <K extends keyof CreateLeadIntakeDraftInput>(
    key: K,
    value: CreateLeadIntakeDraftInput[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handleSubmit() {
    setSaving(true);
    setError("");
    try {
      const payload: CreateLeadIntakeDraftInput = {
        ...form,
        aiScore: form.aiScore ? Number(form.aiScore) : null,
        extraCapturedData: JSON.parse(extraCapturedDataText) as Record<string, unknown>,
        rawExtractedData: JSON.parse(rawExtractedDataText) as Record<string, unknown>,
        rawConversation: JSON.parse(rawConversationText) as unknown[],
      };

      if (mode === "edit" && draftId) {
        await draftApi.patch(draftId, payload);
      } else {
        await draftApi.create(payload);
      }

      navigateTo("/lead-intake-drafts");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save draft");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageTitle
        title={mode === "edit" ? "Update Lead Intake Draft" : "Create Lead Intake Draft"}
        subtitle="Full-page draft form with scrollable sections and the complete payload."
        action={
          <Button variant="secondary" onClick={() => navigateTo("/lead-intake-drafts")}>
            Back to Drafts
          </Button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card title="Draft Form" description="This form supports the full draft create and update payload.">
        {loading ? (
          <p className="text-sm text-[#013144]/60">Loading draft...</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={form.source || ""}
                onChange={(event) => setField("source", event.target.value)}
                placeholder="Source"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
              />
              <input
                value={form.aiProvider || ""}
                onChange={(event) => setField("aiProvider", event.target.value)}
                placeholder="AI provider"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
              />
              <input
                value={form.aiModel || ""}
                onChange={(event) => setField("aiModel", event.target.value)}
                placeholder="AI model"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                ["fullName", "Full name"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["preferredContactMethod", "Preferred contact method"],
                ["caseTypeText", "Case type text"],
                ["injurySummary", "Injury summary"],
                ["incidentDate", "Incident date"],
                ["location", "Location"],
                ["reviewStatus", "Review status"],
                ["aiScore", "AI score"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  value={String(form[key as keyof CreateLeadIntakeDraftInput] || "")}
                  onChange={(event) =>
                    setField(
                      key as keyof CreateLeadIntakeDraftInput,
                      (key === "aiScore" ? Number(event.target.value) || 0 : event.target.value) as never
                    )
                  }
                  placeholder={label}
                  className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                ["incidentDescription", "Incident description"],
                ["medicalTreatment", "Medical treatment"],
                ["liabilityInfo", "Liability info"],
                ["insuranceInfo", "Insurance info"],
                ["aiSummary", "AI summary"],
              ].map(([key, label]) => (
                <textarea
                  key={key}
                  value={String(form[key as keyof CreateLeadIntakeDraftInput] || "")}
                  onChange={(event) =>
                    setField(key as keyof CreateLeadIntakeDraftInput, event.target.value as never)
                  }
                  rows={3}
                  placeholder={label}
                  className="rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
                />
              ))}
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3">
              <input
                id="draft-represented-by-attorney"
                type="checkbox"
                checked={Boolean(form.representedByAttorney)}
                onChange={(event) => setField("representedByAttorney", event.target.checked)}
              />
              <label htmlFor="draft-represented-by-attorney" className="text-sm text-[#013144]">
                Represented by attorney
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#013144]/45">
                  Extra Captured Data JSON
                </p>
                <textarea
                  value={extraCapturedDataText}
                  onChange={(event) => setExtraCapturedDataText(event.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#013144]/45">
                  Raw Extracted Data JSON
                </p>
                <textarea
                  value={rawExtractedDataText}
                  onChange={(event) => setRawExtractedDataText(event.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#013144]/45">
                  Raw Conversation JSON
                </p>
                <textarea
                  value={rawConversationText}
                  onChange={(event) => setRawConversationText(event.target.value)}
                  rows={8}
                  className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => navigateTo("/lead-intake-drafts")}>
                Cancel
              </Button>
              <Button onClick={() => void handleSubmit()} disabled={saving}>
                {saving
                  ? mode === "edit"
                    ? "Updating..."
                    : "Creating..."
                  : mode === "edit"
                    ? "Update Draft"
                    : "Create Draft"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

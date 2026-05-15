import { useState } from "react";
import LeadFormFields from "../components/leads/LeadFormFields";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import { leadApi } from "../lib/api";
import { clearFieldError, getApiFieldErrors, getApiFormMessage } from "../lib/apiErrors";
import { buildLeadPayload, createLeadForm } from "../lib/leadForm";
import { navigateTo } from "../lib/navigation";
import type { CreateLeadInput } from "../types/api";

export default function CreateLeadPage() {
  const [form, setForm] = useState<CreateLeadInput>(createLeadForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  return (
    <div className="space-y-5">
      <PageTitle
        title="Create Lead"
        subtitle="Add a new lead directly into the pipeline using the backend lead API."
        action={
          <Button variant="secondary" onClick={() => navigateTo("/leads")}>
            Back to Leads
          </Button>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card title="Lead Details" description="Fill in the CRM lead fields and submit to `/api/v1/leads`.">
        <div className="space-y-5">
          <LeadFormFields
            form={form}
            onChange={setForm}
            fieldErrors={fieldErrors}
            onFieldChange={(field) => setFieldErrors((current) => clearFieldError(current, field))}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => navigateTo("/leads")} disabled={saving}>
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setError("");
                setFieldErrors({});
                try {
                  await leadApi.create(buildLeadPayload(form));
                  navigateTo("/leads");
                } catch (nextError) {
                  setFieldErrors(getApiFieldErrors(nextError));
                  setError(getApiFormMessage(nextError, "Failed to create lead"));
                } finally {
                  setSaving(false);
                }
              }}
            >
              {saving ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

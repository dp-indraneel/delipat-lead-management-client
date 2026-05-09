import { FileJson, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import { draftApi } from "../lib/api";
import { navigateTo } from "../lib/navigation";
import type { CreateLeadIntakeDraftInput, LeadIntakeDraftImportResult } from "../types/api";

const samplePayload = [
  {
    source: "AI_CHATBOT",
    aiProvider: "CLAUDE",
    fullName: "Imported Draft One",
    phone: "+15550001001",
    email: "draft1@example.com",
    caseTypeText: "rear-end collision",
    injurySummary: "neck pain",
    incidentDate: "2026-04-12",
    location: "Austin, Texas",
    reviewStatus: "PENDING_REVIEW",
  },
  {
    source: "WEB_FORM",
    fullName: "Imported Draft Two",
    phone: "+15550001002",
    email: "draft2@example.com",
    caseTypeText: "slip and fall",
    injurySummary: "hip injury",
    incidentDate: "2026-04-03",
    location: "Orlando, Florida",
    reviewStatus: "PENDING_REVIEW",
  },
];

export default function LeadIntakeDraftImportPage() {
  const [jsonText, setJsonText] = useState(JSON.stringify(samplePayload, null, 2));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LeadIntakeDraftImportResult | null>(null);

  const parsedRows = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonText) as unknown[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [jsonText]);

  return (
    <div className="space-y-5">
      <PageTitle
        title="Import Lead Intake Drafts"
        subtitle="Use the draft import API with JSON payloads."
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-4">
          <Card title="Upload File">
            <div className="rounded-2xl border border-dashed border-[#013144]/12 bg-[#013144]/[0.03] p-6 text-center">
              <p className="text-sm text-[#013144]/70">Upload a `.json` file with draft rows</p>
              <p className="mt-1 text-xs text-[#013144]/40">or paste the payload below</p>

              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#013144]/12 bg-white px-4 py-3 text-sm text-[#013144] hover:bg-[#013144]/[0.04]">
                <FileJson size={16} />
                Choose JSON File
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    setJsonText(await file.text());
                  }}
                />
              </label>
            </div>
          </Card>

          <Card title="Import Summary">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Total rows</span>
                <span className="text-[#013144]">{parsedRows.length}</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Imported count</span>
                <span className="text-[#013144]">{result?.importedCount ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Failed count</span>
                <span className="text-[#013144]">{result?.failedCount ?? "-"}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5 xl:col-span-8">
          <Card title="Import Payload" description="Paste the array accepted by `/api/v1/lead-intake-drafts/import`.">
            <textarea
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              rows={18}
              className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setJsonText(JSON.stringify(samplePayload, null, 2))}>
                Load Sample
              </Button>
              <Button
                onClick={async () => {
                  setSubmitting(true);
                  setError("");
                  try {
                    const payload = JSON.parse(jsonText) as CreateLeadIntakeDraftInput[];
                    const response = await draftApi.importJson(payload);
                    setResult(response.data);
                  } catch (nextError) {
                    setError(nextError instanceof Error ? nextError.message : "Import failed");
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
              >
                <Upload size={16} className="mr-2" />
                {submitting ? "Importing..." : "Import Drafts"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

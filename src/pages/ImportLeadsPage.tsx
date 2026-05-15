import { Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import { useToast } from "../context/ToastContext";
import { leadApi } from "../lib/api";
import type { LeadImportInput, LeadImportResult } from "../types/api";

interface ImportField {
  key: keyof LeadImportInput | string;
  label: string;
}

const importFields: ImportField[] = [
  { key: "fullName", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "whatsappNumber", label: "WhatsApp number" },
  { key: "status", label: "Workflow status" },
  { key: "companyName", label: "Company name" },
  { key: "companyWebsite", label: "Company website" },
  { key: "jobTitle", label: "Job title" },
  { key: "businessType", label: "Business type" },
  { key: "projectBudget", label: "Project budget" },
  { key: "projectTimeline", label: "Project timeline" },
  { key: "location", label: "Location" },
  { key: "projectDescription", label: "Project description" },
  { key: "currentChallenges", label: "Current challenges" },
  { key: "expectedFeatures", label: "Expected features" },
  { key: "techStack", label: "Tech stack" },
  { key: "isDecisionMaker", label: "Decision maker" },
  { key: "notes", label: "Notes" },
];

const sampleCsv = [
  "Lead Name,Email Address,Mobile,Stage,Company,Budget,Timeline,City,Requirement,Decision Maker",
  '"Import Lead One",import1@example.com,+15550000001,UNASSIGNED,"Northstar HealthTech","$20,000-$30,000","12 weeks","Miami, Florida","Need CRM implementation and lead follow-up tracking.",true',
].join("\n");

export default function ImportLeadsPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [csvText, setCsvText] = useState(sampleCsv);
  const [mapping, setMapping] = useState<Record<string, string>>(() =>
    createAutoMapping(parseCsvRows(sampleCsv)[0] || [])
  );
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<LeadImportResult | null>(null);

  const parsedCsv = useMemo(() => parseCsvSafely(csvText), [csvText]);
  const headers = parsedCsv.rows[0] || [];
  const dataRows = parsedCsv.rows.slice(1).filter((row) => row.some((value) => value.trim()));
  const payloadPreview = useMemo(
    () => (parsedCsv.error ? [] : buildImportPayload(headers, dataRows, mapping)),
    [dataRows, headers, mapping, parsedCsv.error]
  );

  const updateCsvText = (nextText: string) => {
    setCsvText(nextText);
    setError("");
    setResult(null);

    const nextHeaders = parseCsvSafely(nextText).rows[0] || [];
    setMapping(createAutoMapping(nextHeaders));
  };

  async function handleImport() {
    setImporting(true);
    setError("");
    setResult(null);

    try {
      if (parsedCsv.error) {
        throw new Error(parsedCsv.error);
      }

      if (!payloadPreview.length) {
        throw new Error("CSV must include at least one mapped lead row.");
      }

      const response = await leadApi.importJson(payloadPreview);
      setResult(response.data);
      showToast({
        type: "success",
        title: "Import completed",
        message: `${response.data.importedCount} imported, ${response.data.failedCount} failed.`,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to import leads");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageTitle
        title="Import Leads"
        subtitle="Upload or paste CSV, map spreadsheet columns to lead fields, then import."
      />

      {error || parsedCsv.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || parsedCsv.error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-4">
          <Card title="Upload CSV">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void file.text().then(updateCsvText);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center rounded-lg border border-dashed border-[#013144]/18 bg-[#013144]/[0.03] px-4 py-6 text-center"
            >
              <Upload size={22} className="text-[#013144]/50" />
              <span className="mt-2 text-sm font-medium text-[#013144]">Choose CSV file</span>
              <span className="mt-1 text-xs text-[#013144]/45">Export Excel as CSV before uploading</span>
            </button>
          </Card>

          <Card title="Import Summary">
            <div className="space-y-2 text-sm">
              <SummaryRow label="CSV columns" value={String(headers.length)} />
              <SummaryRow label="CSV rows" value={String(dataRows.length)} />
              <SummaryRow label="Mapped leads" value={String(payloadPreview.length)} />
              <SummaryRow label="Imported" value={String(result?.importedCount ?? 0)} />
              <SummaryRow label="Failed" value={String(result?.failedCount ?? 0)} />
            </div>
          </Card>

          {result?.errors?.length ? (
            <Card title="Import Errors">
              <div className="max-h-64 space-y-2 overflow-auto text-sm text-red-700">
                {result.errors.map((item, index) => (
                  <p key={`${item}-${index}`}>{item}</p>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5 xl:col-span-8">
          <Card title="CSV Data" description="First row should contain spreadsheet column names.">
            <textarea
              value={csvText}
              onChange={(event) => updateCsvText(event.target.value)}
              rows={8}
              className="w-full rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] px-3 py-2.5 font-mono text-sm text-[#013144] outline-none"
            />
          </Card>

          <Card title="Column Mapping" description="Choose which spreadsheet column should fill each API field.">
            <div className="grid grid-cols-1 gap-3">
              {importFields.map((field) => (
                <div
                  key={field.key}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] p-3 sm:grid-cols-[1fr_1.3fr]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#013144]">{field.label}</p>
                    <p className="mt-0.5 font-mono text-xs text-[#013144]/45">{field.key}</p>
                  </div>
                  <select
                    value={mapping[field.key] || ""}
                    onChange={(event) =>
                      setMapping((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    className="h-10 rounded-lg border border-[#013144]/12 bg-white px-3 text-sm text-[#013144] outline-none"
                  >
                    <option value="">Do not import</option>
                    {headers.map((header, index) => (
                      <option key={`${header}-${index}`} value={header}>
                        {header || `Column ${index + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                disabled={importing}
                onClick={() => updateCsvText(sampleCsv)}
              >
                Reset Sample
              </Button>
              <Button disabled={importing || Boolean(parsedCsv.error)} onClick={() => void handleImport()}>
                {importing ? "Importing..." : "Import Leads"}
              </Button>
            </div>
          </Card>

          <Card title="Generated API Body">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-[#013144]/[0.04] p-3 font-mono text-xs text-[#013144]">
              {JSON.stringify(payloadPreview.slice(0, 5), null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[#013144]/70">
      <span>{label}</span>
      <span className="font-medium text-[#013144]">{value}</span>
    </div>
  );
}

function createAutoMapping(headers: string[]) {
  return importFields.reduce<Record<string, string>>((mapping, field) => {
    const normalizedField = normalizeHeader(field.key);
    const match = headers.find((header) => {
      const normalizedHeader = normalizeHeader(header);
      return normalizedHeader === normalizedField || normalizedHeader.includes(normalizedField);
    });

    if (match) {
      mapping[field.key] = match;
    }

    return mapping;
  }, {});
}

function buildImportPayload(
  headers: string[],
  dataRows: string[][],
  mapping: Record<string, string>
): LeadImportInput[] {
  const headerIndex = headers.reduce<Record<string, number>>((indexByHeader, header, index) => {
    indexByHeader[header] = index;
    return indexByHeader;
  }, {});

  return dataRows
    .map((row) =>
      importFields.reduce<LeadImportInput>((lead, field) => {
        const selectedHeader = mapping[field.key];

        if (!selectedHeader) {
          return lead;
        }

        const value = normalizeCsvValue(row[headerIndex[selectedHeader]] || "");

        if (value === undefined) {
          return lead;
        }

        return {
          ...lead,
          [field.key]: value,
        };
      }, {})
    )
    .filter((lead) => Object.keys(lead).length > 0);
}

function parseCsvSafely(csvText: string): { rows: string[][]; error: string } {
  try {
    return { rows: parseCsvRows(csvText.trim()), error: "" };
  } catch (nextError) {
    return {
      rows: [],
      error: nextError instanceof Error ? nextError.message : "Invalid CSV",
    };
  }
}

function parseCsvRows(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const nextChar = csv[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  rows.push(row);

  if (inQuotes) {
    throw new Error("CSV has an unclosed quoted value.");
  }

  return rows.filter((item) => item.some((cell) => cell.trim()));
}

function normalizeCsvValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) return undefined;
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;

  return trimmed;
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageTitle from "../components/ui/PageTitle";
import SearchableSelect from "../components/ui/SearchableSelect";
import { leadApi } from "../lib/api";
import {
  createOptions,
  formatEnumLabel,
  LEAD_AI_STATUSES,
  LEAD_HOTNESS_STATUSES,
  LEAD_RECORD_STATUSES,
  LEAD_SOURCES,
} from "../lib/leadOptions";
import type { Lead, LeadFilters } from "../types/api";

const aiStatusOptions = createOptions(LEAD_AI_STATUSES);
const statusOptions = createOptions(LEAD_RECORD_STATUSES);
const sourceOptions = createOptions(LEAD_SOURCES);
const leadHotnessOptions = createOptions(LEAD_HOTNESS_STATUSES);

export default function ExportLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [aiStatus, setAiStatus] = useState("");
  const [source, setSource] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [search, setSearch] = useState("");

  const filters: LeadFilters = useMemo(
    () => ({
      page: 1,
      limit: 100,
      search,
      status,
      aiStatus,
      source,
      leadStatus,
    }),
    [aiStatus, leadStatus, search, source, status]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await leadApi.list(filters);
        setLeads(response.data);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load leads");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [filters]);

  const sourceSummary = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.source).filter(Boolean))).map(formatEnumLabel).join(", ") || "No sources",
    [leads]
  );
  const activeFilterCount = [search, status, aiStatus, source, leadStatus].filter(Boolean).length;

  return (
    <div className="space-y-5">
      <PageTitle
        title="Export Leads"
        subtitle="Preview filtered leads and export CSV from the backend."
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-7">
          <Card title="Export Builder" description="These filters apply to the preview and exported file.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or company"
                className="h-10 rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
              />
              <SearchableSelect
                options={statusOptions}
                value={status}
                placeholder="Workflow status"
                onChange={setStatus}
              />
              <SearchableSelect
                options={aiStatusOptions}
                value={aiStatus}
                placeholder="AI status"
                onChange={setAiStatus}
              />
              <SearchableSelect
                options={sourceOptions}
                value={source}
                placeholder="Source"
                onChange={setSource}
              />
              <SearchableSelect
                options={leadHotnessOptions}
                value={leadStatus}
                placeholder="Heat"
                onChange={setLeadStatus}
              />
            </div>

            <div className="mt-5 flex justify-end">
              <Button variant="secondary" onClick={() => void leadApi.exportCsv(filters)}>
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-5 xl:col-span-5">
          <Card title="Current Export Summary">
            <div className="space-y-3 text-sm">
              <SummaryRow label="Preview leads" value={String(leads.length)} />
              <SummaryRow label="Filters active" value={String(activeFilterCount)} />
              <div className="flex items-start justify-between gap-3 text-[#013144]/70">
                <span>Sources</span>
                <span className="max-w-[60%] text-right font-medium text-[#013144]">{sourceSummary}</span>
              </div>
            </div>
          </Card>

          <Card title="Matching Leads" description="Quick preview before export.">
            {loading ? (
              <p className="text-sm text-[#013144]/60">Loading leads...</p>
            ) : leads.length === 0 ? (
              <EmptyState
                title="No leads match"
                description="Adjust filters or export with fewer constraints."
              />
            ) : (
              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] p-3"
                  >
                    <p className="font-medium text-[#013144]">{lead.fullName || `Lead #${lead.id}`}</p>
                    <p className="mt-1 text-sm text-[#013144]/50">
                      {lead.companyName || "-"} - {formatEnumLabel(lead.source)} - {formatEnumLabel(lead.status)}
                    </p>
                    <p className="mt-1 text-xs text-[#013144]/45">
                      {lead.aiStatus ? formatEnumLabel(lead.aiStatus) : "-"} -{" "}
                      {lead.leadStatus ? formatEnumLabel(lead.leadStatus) : "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}
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

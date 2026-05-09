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
  LEAD_HOTNESS_STATUSES,
  LEAD_PROJECT_TYPES,
  LEAD_RECORD_STATUSES,
  LEAD_SERVICE_TYPES,
} from "../lib/leadOptions";
import type { Lead } from "../types/api";

const statusOptions = createOptions(LEAD_RECORD_STATUSES);
const serviceTypeOptions = createOptions(LEAD_SERVICE_TYPES);
const projectTypeOptions = createOptions(LEAD_PROJECT_TYPES);
const leadHotnessOptions = createOptions(LEAD_HOTNESS_STATUSES);

export default function ExportLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [projectType, setProjectType] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await leadApi.list({
          page: 1,
          limit: 100,
          search,
          status,
          serviceType,
          projectType,
          leadStatus,
        });
        setLeads(response.data);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load leads");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [search, status, serviceType, projectType, leadStatus]);

  const sourceSummary = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.source))).join(", ") || "No sources",
    [leads]
  );

  return (
    <div className="space-y-5">
      <PageTitle
        title="Export Leads"
        subtitle="Keep the export screen visible and use the real lead export APIs."
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-7">
          <Card title="Export Builder" description="Filter the preview and export from the backend.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or company"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
              />
              <SearchableSelect
                options={statusOptions}
                value={status}
                placeholder="Status"
                onChange={setStatus}
              />
              <SearchableSelect
                options={serviceTypeOptions}
                value={serviceType}
                placeholder="Service type"
                onChange={setServiceType}
              />
              <SearchableSelect
                options={projectTypeOptions}
                value={projectType}
                placeholder="Project type"
                onChange={setProjectType}
              />
              <SearchableSelect
                options={leadHotnessOptions}
                value={leadStatus}
                placeholder="Lead heat"
                onChange={setLeadStatus}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => void leadApi.exportCsv()}>
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
              <Button onClick={() => void leadApi.exportJson()}>
                <Download size={16} className="mr-2" />
                Export JSON
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-5 xl:col-span-5">
          <Card title="Current Export Summary">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Total preview leads</span>
                <span className="text-[#013144]">{leads.length}</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Sources</span>
                <span className="max-w-[60%] text-right text-[#013144]">{sourceSummary}</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Filters active</span>
                <span className="text-[#013144]">
                  {[search, status, serviceType, projectType, leadStatus].filter(Boolean).length}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Matching Leads" description="Quick preview before export.">
            {loading ? (
              <p className="text-sm text-[#013144]/60">Loading leads...</p>
            ) : leads.length === 0 ? (
              <EmptyState
                title="No leads match"
                description="Adjust the preview filters or export all leads from the backend."
              />
            ) : (
              <div className="space-y-3">
                {leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] p-3"
                  >
                    <p className="font-medium text-[#013144]">{lead.fullName}</p>
                    <p className="mt-1 text-sm text-[#013144]/50">
                      {lead.companyName || "-"} • {lead.serviceType || "-"} • {lead.status}
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

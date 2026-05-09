import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageTitle from "../components/ui/PageTitle";
import SearchableSelect from "../components/ui/SearchableSelect";
import { draftApi } from "../lib/api";
import { navigateTo } from "../lib/navigation";
import type { LeadIntakeDraft } from "../types/api";

const reviewStatusOptions = [
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "CONVERTED", label: "Converted" },
  { value: "REJECTED", label: "Rejected" },
];

export default function LeadIntakeDraftExportPage() {
  const [drafts, setDrafts] = useState<LeadIntakeDraft[]>([]);
  const [search, setSearch] = useState("");
  const [fullName, setFullName] = useState("");
  const [injurySummary, setInjurySummary] = useState("");
  const [location, setLocation] = useState("");
  const [reviewStatus, setReviewStatus] = useState("PENDING_REVIEW");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await draftApi.list({
          page: 1,
          limit: 100,
          search,
          fullName,
          injurySummary,
          location,
          reviewStatus,
        });
        setDrafts(response.data);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load export preview");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [search, fullName, injurySummary, location, reviewStatus]);

  const summary = useMemo(
    () => Array.from(new Set(drafts.map((draft) => draft.location).filter(Boolean))).join(", ") || "No locations",
    [drafts]
  );

  return (
    <div className="space-y-5">
      <PageTitle
        title="Export Lead Intake Drafts"
        subtitle="Filter preview data and export CSV or JSON from the draft module."
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
        <div className="space-y-5 xl:col-span-7">
          <Card title="Export Builder" description="These filters follow the exact draft list/export API contract you shared.">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
              />
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Full name"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
              />
              <input
                value={injurySummary}
                onChange={(event) => setInjurySummary(event.target.value)}
                placeholder="Injury summary"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
              />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Location"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
              />
              <SearchableSelect
                options={reviewStatusOptions}
                value={reviewStatus}
                placeholder="Review status"
                onChange={setReviewStatus}
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                onClick={() => void draftApi.exportCsv({ search, fullName, injurySummary, location, reviewStatus })}
              >
                <Download size={16} className="mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => void draftApi.exportJson({ search, fullName, injurySummary, location, reviewStatus })}
              >
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
                <span>Total preview drafts</span>
                <span className="text-[#013144]">{drafts.length}</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Locations</span>
                <span className="max-w-[60%] text-right text-[#013144]">{summary}</span>
              </div>
            </div>
          </Card>

          <Card title="Matching Drafts" description="Quick preview before export.">
            {loading ? (
              <p className="text-sm text-[#013144]/60">Loading drafts...</p>
            ) : drafts.length === 0 ? (
              <EmptyState title="No drafts match" description="Adjust the filters or widen the export set." />
            ) : (
              <div className="space-y-3">
                {drafts.slice(0, 5).map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] p-3"
                  >
                    <p className="font-medium text-[#013144]">{draft.fullName}</p>
                    <p className="mt-1 text-sm text-[#013144]/50">
                      {draft.location || "-"} • {draft.reviewStatus}
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

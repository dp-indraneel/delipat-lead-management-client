import { ArrowRightLeft, Eye, FilePenLine, MoreVertical, RefreshCw, Trash2, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import SearchableSelect from "../components/ui/SearchableSelect";
import { draftApi } from "../lib/api";
import { navigateTo } from "../lib/navigation";
import type {
  ConvertLeadIntakeDraftInput,
  LeadIntakeDraft,
  UpdateLeadIntakeDraftInput,
} from "../types/api";

const reviewStatusOptions = [
  { value: "PENDING_REVIEW", label: "Pending Review" },
  { value: "CONVERTED", label: "Converted" },
  { value: "REJECTED", label: "Rejected" },
];

function createConvertForm(draft: LeadIntakeDraft | null): ConvertLeadIntakeDraftInput {
  return {
    fullName: draft?.fullName || "",
    phone: draft?.phone || "",
    email: draft?.email || "",
    source: draft?.source || "AI_CHATBOT",
    aiProvider: draft?.aiProvider,
    aiModel: draft?.aiModel,
    status: "NEW",
    caseType: "CAR_ACCIDENT",
    injuryType: "BACK_NECK_INJURY",
    incidentDate: draft?.incidentDate,
    location: draft?.location,
    preferredContactMethod: draft?.preferredContactMethod,
    incidentDescription: draft?.incidentDescription,
    medicalTreatment: draft?.medicalTreatment,
    liabilityInfo: draft?.liabilityInfo,
    insuranceInfo: draft?.insuranceInfo,
    representedByAttorney: draft?.representedByAttorney,
    notes: draft?.aiSummary || "",
    leadScore: draft?.aiScore || 75,
    leadStatus: "HOT",
  };
}

export default function LeadIntakeDraftsPage() {
  const [drafts, setDrafts] = useState<LeadIntakeDraft[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [fullName, setFullName] = useState("");
  const [injurySummary, setInjurySummary] = useState("");
  const [location, setLocation] = useState("");
  const [reviewStatus, setReviewStatus] = useState("PENDING_REVIEW");
  const [selectedDraft, setSelectedDraft] = useState<LeadIntakeDraft | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<UpdateLeadIntakeDraftInput>({});
  const [editExtraCapturedDataText, setEditExtraCapturedDataText] = useState("{}");
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const [convertForm, setConvertForm] = useState<ConvertLeadIntakeDraftInput>(
    createConvertForm(null)
  );
  const [successMessage, setSuccessMessage] = useState("");

  const selectedExtraData = useMemo(
    () => JSON.stringify(selectedDraft?.extraCapturedData || {}, null, 2),
    [selectedDraft]
  );
  const selectedExtractedData = useMemo(
    () => JSON.stringify(selectedDraft?.rawExtractedData || {}, null, 2),
    [selectedDraft]
  );

  async function loadDrafts() {
    setLoading(true);
    setError("");
    try {
      const response = await draftApi.list({
        page,
        limit: 20,
        search,
        fullName,
        injurySummary,
        location,
        reviewStatus,
      });

      setDrafts(response.data);
      setTotalPages(response.meta.totalPages);
      setSelectedDraft((current) => {
        if (!response.data.length) {
          return null;
        }
        if (!current) {
          return response.data[0];
        }
        return response.data.find((item) => item.id === current.id) || response.data[0];
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load drafts");
    } finally {
      setLoading(false);
    }
  }

  async function loadDraftById(id: number) {
    setError("");
    try {
      const response = await draftApi.get(id);
      setSelectedDraft(response.data);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load draft details");
    }
  }

  useEffect(() => {
    void loadDrafts();
  }, [page, search, fullName, injurySummary, location, reviewStatus]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target as Node)
      ) {
        setActionsOpen(false);
      }
    }

    if (actionsOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [actionsOpen]);

  const actionMenuItems = [
    { label: "Draft Import", onClick: () => navigateTo("/lead-intake-drafts/import") },
    { label: "Draft Export", onClick: () => navigateTo("/lead-intake-drafts/export") },
    {
      label: "Export JSON",
      onClick: () =>
        void draftApi.exportJson({
          reviewStatus,
          search,
          fullName,
          injurySummary,
          location,
        }),
    },
  ];

  return (
    <div className="space-y-5">
      <PageTitle
        title="Lead Intake Drafts"
        subtitle="Integrated with the APIs you shared: list, create, patch, import, export, convert, reject, and delete."
        action={
          <div className="flex items-center gap-2">
            <div className="relative" ref={actionsMenuRef}>
              <Button
                aria-expanded={actionsOpen}
                aria-haspopup="menu"
                aria-label="Open draft actions"
                className="w-11 px-0"
                variant="secondary"
                onClick={() => setActionsOpen((current) => !current)}
              >
                <MoreVertical size={18} aria-hidden="true" />
              </Button>
              {actionsOpen ? (
                <div
                  className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-xl border border-[#013144]/12 bg-white py-2 shadow-xl shadow-[#013144]/10"
                  role="menu"
                >
                  {actionMenuItems.map((item) => (
                    <button
                      key={item.label}
                      className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[#013144] hover:bg-[#013144]/[0.04]"
                      role="menuitem"
                      onClick={() => {
                        setActionsOpen(false);
                        item.onClick();
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <Button onClick={() => navigateTo("/lead-intake-drafts/create")}>Create Draft</Button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <Card title="Filters">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
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
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card title="Draft Results" className="xl:col-span-8">
          {loading ? (
            <p className="text-sm text-[#013144]/60">Loading drafts...</p>
          ) : drafts.length === 0 ? (
            <EmptyState
              title="No drafts found"
              description="Adjust the filters or create/import a new lead intake draft."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#013144]/[0.04] text-[#013144]/55">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">AI Score</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((draft) => (
                    <tr
                      key={draft.id}
                      className={`border-t border-[#013144]/12 ${
                        selectedDraft?.id === draft.id ? "bg-[#fcb61f]/8" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button
                          className="text-left"
                          onClick={() => setSelectedDraft(draft)}
                        >
                          <p className="font-medium text-[#013144]">{draft.fullName}</p>
                          <p className="text-xs text-[#013144]/50">{draft.email}</p>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[#013144]/75">{draft.source}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-[#013144]/[0.04] px-3 py-1 text-xs font-medium text-[#013144]">
                          {draft.reviewStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#013144]/75">{draft.aiScore ?? "-"}</td>
                      <td className="px-4 py-3 text-[#013144]/75">
                        {new Date(draft.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08]"
                            onClick={async () => {
                              await loadDraftById(draft.id);
                            }}
                            title="View draft"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08]"
                            onClick={() => navigateTo(`/lead-intake-drafts/edit/${draft.id}`)}
                            title="Edit draft"
                          >
                            <FilePenLine size={16} />
                          </button>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#fcb61f]/60 bg-[#fcb61f] text-[#013144] hover:opacity-90"
                            onClick={() => {
                              setSelectedDraft(draft);
                              setConvertForm(createConvertForm(draft));
                              setConvertOpen(true);
                            }}
                            title="Convert draft"
                          >
                            <ArrowRightLeft size={16} />
                          </button>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08]"
                            onClick={async () => {
                              const summary = window.prompt(
                                "Reject summary",
                                draft.aiSummary || "Rejected by reviewer"
                              );
                              if (!summary) {
                                return;
                              }
                              await draftApi.reject(draft.id, summary);
                              setSuccessMessage(`Draft #${draft.id} rejected successfully.`);
                              await loadDrafts();
                            }}
                            title="Reject draft"
                          >
                            <XCircle size={16} />
                          </button>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            onClick={async () => {
                              if (!window.confirm(`Delete draft #${draft.id}?`)) {
                                return;
                              }
                              await draftApi.remove(draft.id);
                              setSuccessMessage(`Draft #${draft.id} deleted successfully.`);
                              await loadDrafts();
                            }}
                            title="Delete draft"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <Button variant="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))}>
              Previous
            </Button>
            <p className="text-sm text-[#013144]/60">
              Page {page} of {totalPages}
            </p>
            <Button
              variant="secondary"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        </Card>

        <Card title="Draft Details" className="xl:col-span-4">
          {!selectedDraft ? (
            <EmptyState title="No draft selected" description="Choose a draft to inspect its details." />
          ) : (
            <div className="space-y-3 text-sm text-[#013144]/75">
              <div className="flex gap-2">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08]"
                  onClick={() => void loadDraftById(selectedDraft.id)}
                  title="Refresh detail"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08]"
                  onClick={() => navigateTo(`/lead-intake-drafts/edit/${selectedDraft.id}`)}
                  title="Patch draft"
                >
                  <FilePenLine size={16} />
                </button>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Full Name</p>
                <p className="mt-1 font-medium text-[#013144]">{selectedDraft.fullName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Source / AI</p>
                <p className="mt-1">
                  {selectedDraft.source} • {selectedDraft.aiProvider || "-"} • {selectedDraft.aiModel || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Contact</p>
                <p className="mt-1">{selectedDraft.phone} • {selectedDraft.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Case Type Text</p>
                <p className="mt-1">{selectedDraft.caseTypeText || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Injury Summary</p>
                <p className="mt-1">{selectedDraft.injurySummary || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">AI Summary</p>
                <p className="mt-1">{selectedDraft.aiSummary || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Medical Treatment</p>
                <p className="mt-1">{selectedDraft.medicalTreatment || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Incident Details</p>
                <p className="mt-1">{selectedDraft.incidentDescription || "-"}</p>
                <p className="mt-1">{selectedDraft.liabilityInfo || "-"}</p>
                <p className="mt-1">{selectedDraft.insuranceInfo || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Contact Method / Attorney / Score</p>
                <p className="mt-1">
                  {selectedDraft.preferredContactMethod || "-"} • {String(selectedDraft.representedByAttorney)} • {selectedDraft.aiScore ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Extra Captured Data</p>
                <pre className="mt-1 overflow-x-auto rounded-xl bg-[#013144]/[0.04] p-3 text-xs">
                  {selectedExtraData}
                </pre>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Raw Extracted Data</p>
                <pre className="mt-1 overflow-x-auto rounded-xl bg-[#013144]/[0.04] p-3 text-xs">
                  {selectedExtractedData}
                </pre>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={convertOpen}
        title="Convert Draft to Lead"
        description="Uses the draft convert API and stores the generated lead in the leads module."
        onClose={() => setConvertOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setConvertOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedDraft) {
                  return;
                }
                await draftApi.convert(selectedDraft.id, convertForm);
                setConvertOpen(false);
                setSuccessMessage(`Draft #${selectedDraft.id} converted successfully.`);
                await loadDrafts();
              }}
            >
              Convert
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            ["fullName", "Full name"],
            ["phone", "Phone"],
            ["email", "Email"],
            ["status", "Lead status"],
            ["caseType", "Case type"],
            ["injuryType", "Injury type"],
            ["leadStatus", "Lead heat"],
            ["location", "Location"],
          ].map(([key, label]) => (
            <input
              key={key}
              value={String(convertForm[key as keyof ConvertLeadIntakeDraftInput] || "")}
              onChange={(event) =>
                setConvertForm((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              placeholder={label}
              className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
            />
          ))}
        </div>
      </Modal>

      <Modal
        open={editOpen}
        title="Patch Lead Intake Draft"
        description="Uses the patch draft API you shared."
        onClose={() => setEditOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedDraft) {
                  return;
                }
                const payload: UpdateLeadIntakeDraftInput = {
                  medicalTreatment: editForm.medicalTreatment || "",
                  extraCapturedData: JSON.parse(editExtraCapturedDataText) as Record<string, unknown>,
                };
                const response = await draftApi.patch(selectedDraft.id, payload);
                setSelectedDraft(response.data);
                setEditOpen(false);
                setSuccessMessage(`Draft #${selectedDraft.id} updated successfully.`);
                await loadDrafts();
              }}
            >
              Save Patch
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <textarea
            value={String(editForm.medicalTreatment || "")}
            onChange={(event) =>
              setEditForm((current) => ({
                ...current,
                medicalTreatment: event.target.value,
              }))
            }
            rows={4}
            placeholder="Medical treatment"
            className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
          />
          <textarea
            value={editExtraCapturedDataText}
            onChange={(event) => setEditExtraCapturedDataText(event.target.value)}
            rows={8}
            placeholder="Extra captured data JSON"
            className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
          />
        </div>
      </Modal>
    </div>
  );
}

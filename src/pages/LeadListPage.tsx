import { MoreHorizontal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import SearchableSelect from "../components/ui/SearchableSelect";
import { adminApi, leadApi } from "../lib/api";
import type { AppUser, CreateLeadInput, Lead } from "../types/api";

const leadStatusOptions = [
  { value: "HOT", label: "Hot" },
  { value: "WARM", label: "Warm" },
  { value: "COLD", label: "Cold" },
];

const caseTypeOptions = [
  { value: "CAR_ACCIDENT", label: "Car Accident" },
  { value: "SLIP_AND_FALL", label: "Slip and Fall" },
  { value: "WORK_INJURY", label: "Work Injury" },
];

const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "AI_ANALYSIS_PENDING", label: "AI Analysis Pending" },
  { value: "AI_ANALYZED", label: "AI Analyzed" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "CONTACT_ATTEMPTED", label: "Contact Attempted" },
];

function createLeadForm(): CreateLeadInput {
  return {
    fullName: "",
    phone: "",
    email: "",
    source: "MANUAL_ENTRY",
    status: "NEW",
    aiProvider: "",
    aiModel: "",
    caseType: "SLIP_AND_FALL",
    caseTypeOther: "",
    caseTypeText: "",
    injuryType: "BROKEN_BONE",
    injuryTypeOther: "",
    injurySummary: "",
    incidentDate: "",
    location: "",
    preferredContactMethod: "PHONE",
    incidentDescription: "",
    medicalTreatment: "",
    liabilityInfo: "",
    insuranceInfo: "",
    representedByAttorney: false,
    notes: "",
    leadScore: 75,
    leadStatus: "WARM",
    extraCapturedData: {
      businessType: "personal_injury",
      dynamicFields: {
        accidentType: "",
        treatmentStatus: "",
      },
    },
    rawConversation: [],
    rawExtractedData: {},
    aiSummary: "",
    aiScore: 0,
    aiAnalysisStatus: "PENDING",
  };
}

function formatJson(value: unknown, fallback: unknown) {
  return JSON.stringify(value ?? fallback, null, 2);
}

export default function LeadListPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [caseType, setCaseType] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const [leadForm, setLeadForm] = useState<CreateLeadInput>(createLeadForm());
  const [extraCapturedDataText, setExtraCapturedDataText] = useState(
    formatJson(createLeadForm().extraCapturedData, {})
  );
  const [rawExtractedDataText, setRawExtractedDataText] = useState(
    formatJson(createLeadForm().rawExtractedData, {})
  );
  const [rawConversationText, setRawConversationText] = useState(
    formatJson(createLeadForm().rawConversation, [])
  );
  const [assignUserId, setAssignUserId] = useState("");
  const [assignNotes, setAssignNotes] = useState("Assign to sales desk for immediate callback.");
  const [assignFollowUpAt, setAssignFollowUpAt] = useState("2026-05-05T15:00:00.000Z");
  const [importJson, setImportJson] = useState(
    JSON.stringify(
      [
        {
          fullName: "Import Lead One",
          phone: "+15550000001",
          email: "import1@example.com",
          status: "NEW",
          caseType: "CAR_ACCIDENT",
          injuryType: "SOFT_TISSUE",
          incidentDate: "2026-04-10",
          location: "Miami, Florida",
          representedByAttorney: false,
          source: "AI_CHATBOT",
          aiProvider: "OPENAI",
          aiModel: "gpt-4.1-mini",
          aiAnalysisStatus: "PENDING",
          extraCapturedData: {
            businessType: "software_company",
            dynamicFields: {
              companySize: "25-50",
              productInterest: "CRM implementation",
              budgetRange: "10000-25000",
            },
          },
          rawConversation: [],
          rawExtractedData: {
            intent: "software_service_lead",
          },
        },
      ],
      null,
      2
    )
  );

  async function loadLeads() {
    setLoading(true);
    setError("");
    try {
      const [leadResponse, usersResponse] = await Promise.all([
        leadApi.list({ page, limit: 20, search, status, caseType, leadStatus }),
        adminApi.listUsers(),
      ]);
      setLeads(leadResponse.data);
      setTotalPages(leadResponse.meta.totalPages);
      setUsers(usersResponse.data);
      setSelectedLead((current) => {
        if (!leadResponse.data.length) {
          return null;
        }
        if (!current) {
          return leadResponse.data[0];
        }
        return leadResponse.data.find((item) => item.id === current.id) || leadResponse.data[0];
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeads();
  }, [page, search, status, caseType, leadStatus]);

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

  const selectedSalesUser = useMemo(
    () => users.find((user) => user.id === selectedLead?.assignedSalesExecutiveId),
    [selectedLead, users]
  );

  const actionMenuItems = [
    { label: "Import JSON", onClick: () => setImportOpen(true) },
    { label: "Export CSV", onClick: () => void leadApi.exportCsv() },
    { label: "Export JSON", onClick: () => void leadApi.exportJson() },
  ];

  function resetLeadForm() {
    const nextForm = createLeadForm();
    setLeadForm(nextForm);
    setExtraCapturedDataText(formatJson(nextForm.extraCapturedData, {}));
    setRawExtractedDataText(formatJson(nextForm.rawExtractedData, {}));
    setRawConversationText(formatJson(nextForm.rawConversation, []));
  }

  function hydrateLeadForm(lead: Lead) {
    const nextForm: CreateLeadInput = {
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      status: lead.status,
      aiProvider: lead.aiProvider,
      aiModel: lead.aiModel,
      caseType: lead.caseType,
      caseTypeOther: lead.caseTypeOther,
      caseTypeText: lead.caseTypeText,
      injuryType: lead.injuryType,
      injuryTypeOther: lead.injuryTypeOther,
      injurySummary: lead.injurySummary,
      incidentDate: lead.incidentDate,
      location: lead.location,
      preferredContactMethod: lead.preferredContactMethod,
      incidentDescription: lead.incidentDescription,
      medicalTreatment: lead.medicalTreatment,
      liabilityInfo: lead.liabilityInfo,
      insuranceInfo: lead.insuranceInfo,
      representedByAttorney: lead.representedByAttorney,
      notes: lead.notes,
      leadScore: lead.leadScore,
      leadStatus: lead.leadStatus,
      extraCapturedData: lead.extraCapturedData || {},
      rawConversation: lead.rawConversation || [],
      rawExtractedData: lead.rawExtractedData || {},
      aiSummary: lead.aiSummary,
      aiScore: lead.aiScore,
      aiAnalysisStatus: lead.aiAnalysisStatus,
    };

    setLeadForm(nextForm);
    setExtraCapturedDataText(formatJson(nextForm.extraCapturedData, {}));
    setRawExtractedDataText(formatJson(nextForm.rawExtractedData, {}));
    setRawConversationText(formatJson(nextForm.rawConversation, []));
  }

  function buildLeadPayload(): CreateLeadInput {
    return {
      ...leadForm,
      leadScore: leadForm.leadScore ? Number(leadForm.leadScore) : null,
      aiScore: leadForm.aiScore ? Number(leadForm.aiScore) : null,
      extraCapturedData: JSON.parse(extraCapturedDataText) as Record<string, unknown>,
      rawExtractedData: JSON.parse(rawExtractedDataText) as Record<string, unknown>,
      rawConversation: JSON.parse(rawConversationText) as unknown[],
    };
  }

  return (
    <div className="space-y-5">
      <PageTitle
        title="Leads"
        subtitle="Connected to the real lead APIs: list, create, update, patch, import, export, assign, and delete."
        action={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                resetLeadForm();
                setCreateOpen(true);
              }}
            >
              Create Lead
            </Button>
            <div className="relative" ref={actionsMenuRef}>
              <Button
                aria-expanded={actionsOpen}
                aria-haspopup="menu"
                aria-label="Open lead actions"
                className="w-11 px-0"
                variant="secondary"
                onClick={() => setActionsOpen((current) => !current)}
              >
                <MoreHorizontal size={32} aria-hidden="true" />
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
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card title="Search & Filters">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
          <SearchableSelect options={statusOptions} value={status} placeholder="Status" onChange={setStatus} />
          <SearchableSelect
            options={caseTypeOptions}
            value={caseType}
            placeholder="Case type"
            onChange={setCaseType}
          />
          <SearchableSelect
            options={leadStatusOptions}
            value={leadStatus}
            placeholder="Lead heat"
            onChange={setLeadStatus}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card title="Lead Results" className="xl:col-span-8">
          {loading ? (
            <p className="text-sm text-[#013144]/60">Loading leads...</p>
          ) : leads.length === 0 ? (
            <EmptyState title="No leads found" description="Adjust filters or create/import a lead." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#013144]/[0.04] text-[#013144]/55">
                  <tr>
                    <th className="px-4 py-3">Lead</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Case Type</th>
                    <th className="px-4 py-3">Lead Heat</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`border-t border-[#013144]/12 ${
                        selectedLead?.id === lead.id ? "bg-[#fcb61f]/8" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button className="text-left" onClick={() => setSelectedLead(lead)}>
                          <p className="font-medium text-[#013144]">{lead.fullName}</p>
                          <p className="text-xs text-[#013144]/50">{lead.email}</p>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[#013144]/75">{lead.status}</td>
                      <td className="px-4 py-3 text-[#013144]/75">{lead.caseType || "-"}</td>
                      <td className="px-4 py-3 text-[#013144]/75">{lead.leadStatus || "-"}</td>
                      <td className="px-4 py-3 text-[#013144]/75">{lead.source}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" className="h-9 px-3" onClick={() => setSelectedLead(lead)}>
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-9 px-3"
                            onClick={() => {
                              setSelectedLead(lead);
                              hydrateLeadForm(lead);
                              setEditOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-9 px-3"
                            onClick={() => {
                              setSelectedLead(lead);
                              setAssignUserId("");
                              setAssignOpen(true);
                            }}
                          >
                            Assign
                          </Button>
                          <Button
                            variant="danger"
                            className="h-9 px-3"
                            onClick={async () => {
                              if (!window.confirm(`Delete lead #${lead.id}?`)) {
                                return;
                              }
                              await leadApi.remove(lead.id);
                              await loadLeads();
                            }}
                          >
                            Delete
                          </Button>
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

        <Card title="Lead Detail" className="xl:col-span-4">
          {!selectedLead ? (
            <EmptyState title="No lead selected" description="Choose a lead to inspect its details." />
          ) : (
            <div className="space-y-3 text-sm text-[#013144]/75">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Phone</p>
                <p className="mt-1">{selectedLead.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Location</p>
                <p className="mt-1">{selectedLead.location || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Medical Treatment</p>
                <p className="mt-1">{selectedLead.medicalTreatment || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Notes</p>
                <p className="mt-1">{selectedLead.notes || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">AI Summary</p>
                <p className="mt-1">{selectedLead.aiSummary || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Dynamic Fields</p>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap rounded-xl bg-[#013144]/[0.04] p-3 text-xs">
                  {formatJson(selectedLead.extraCapturedData, {})}
                </pre>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Assigned Sales Executive</p>
                <p className="mt-1">
                  {selectedSalesUser ? selectedSalesUser.name : selectedLead.assignedSalesExecutiveId || "-"}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={createOpen}
        title="Create Lead"
        description="Uses `/api/v1/leads`."
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await leadApi.create(buildLeadPayload());
                setCreateOpen(false);
                resetLeadForm();
                await loadLeads();
              }}
            >
              Create Lead
            </Button>
          </div>
        }
      >
        <LeadForm
          form={leadForm}
          onChange={setLeadForm}
          extraCapturedDataText={extraCapturedDataText}
          rawExtractedDataText={rawExtractedDataText}
          rawConversationText={rawConversationText}
          onExtraCapturedDataTextChange={setExtraCapturedDataText}
          onRawExtractedDataTextChange={setRawExtractedDataText}
          onRawConversationTextChange={setRawConversationText}
        />
      </Modal>

      <Modal
        open={editOpen}
        title="Update Lead"
        description="Uses the full update lead API."
        onClose={() => setEditOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedLead) {
                  return;
                }
                await leadApi.update(selectedLead.id, buildLeadPayload());
                setEditOpen(false);
                await loadLeads();
              }}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <LeadForm
          form={leadForm}
          onChange={setLeadForm}
          extraCapturedDataText={extraCapturedDataText}
          rawExtractedDataText={rawExtractedDataText}
          rawConversationText={rawConversationText}
          onExtraCapturedDataTextChange={setExtraCapturedDataText}
          onRawExtractedDataTextChange={setRawExtractedDataText}
          onRawConversationTextChange={setRawConversationText}
        />
      </Modal>

      <Modal
        open={assignOpen}
        title="Assign Lead"
        description="Uses `/api/v1/leads/:id/assign`."
        onClose={() => setAssignOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedLead || !assignUserId) {
                  return;
                }
                await leadApi.assign(selectedLead.id, {
                  assignedToUserId: Number(assignUserId),
                  notes: assignNotes,
                  followUpAt: assignFollowUpAt,
                });
                setAssignOpen(false);
                await loadLeads();
              }}
            >
              Assign Lead
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <SearchableSelect
            options={users.map((user) => ({
              value: String(user.id),
              label: `${user.name} (${user.email})`,
            }))}
            value={assignUserId}
            placeholder="Assign to user"
            onChange={setAssignUserId}
          />
          <textarea
            value={assignNotes}
            onChange={(event) => setAssignNotes(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
          />
          <input
            value={assignFollowUpAt}
            onChange={(event) => setAssignFollowUpAt(event.target.value)}
            className="h-11 w-full rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
        </div>
      </Modal>

      <Modal
        open={importOpen}
        title="Import Leads"
        description="Paste the JSON array expected by `/api/v1/leads/import`."
        onClose={() => setImportOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await leadApi.importJson(JSON.parse(importJson) as CreateLeadInput[]);
                setImportOpen(false);
                await loadLeads();
              }}
            >
              Import
            </Button>
          </div>
        }
      >
        <textarea
          value={importJson}
          onChange={(event) => setImportJson(event.target.value)}
          rows={16}
          className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
        />
      </Modal>
    </div>
  );
}

function LeadForm({
  form,
  onChange,
  extraCapturedDataText,
  rawExtractedDataText,
  rawConversationText,
  onExtraCapturedDataTextChange,
  onRawExtractedDataTextChange,
  onRawConversationTextChange,
}: {
  form: CreateLeadInput;
  onChange: (value: CreateLeadInput) => void;
  extraCapturedDataText: string;
  rawExtractedDataText: string;
  rawConversationText: string;
  onExtraCapturedDataTextChange: (value: string) => void;
  onRawExtractedDataTextChange: (value: string) => void;
  onRawConversationTextChange: (value: string) => void;
}) {
  const setField = <K extends keyof CreateLeadInput>(key: K, value: CreateLeadInput[K]) => {
    onChange({
      ...form,
      [key]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[
        ["fullName", "Full name"],
        ["phone", "Phone"],
        ["email", "Email"],
        ["source", "Source"],
        ["status", "Status"],
        ["aiProvider", "AI provider"],
        ["aiModel", "AI model"],
        ["caseType", "Case type"],
        ["caseTypeText", "Case type text"],
        ["injuryType", "Injury type"],
        ["injurySummary", "Injury summary"],
        ["incidentDate", "Incident date"],
        ["location", "Location"],
        ["preferredContactMethod", "Preferred contact method"],
        ["leadStatus", "Lead heat"],
        ["aiAnalysisStatus", "AI analysis status"],
        ["aiScore", "AI score"],
      ].map(([key, label]) => (
        <input
          key={key}
          value={String(form[key as keyof CreateLeadInput] || "")}
          onChange={(event) =>
            setField(
              key as keyof CreateLeadInput,
              (key === "aiScore" ? Number(event.target.value) || 0 : event.target.value) as never
            )
          }
          placeholder={label}
          className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
        />
      ))}
      <textarea
        value={form.medicalTreatment || ""}
        onChange={(event) => setField("medicalTreatment", event.target.value)}
        rows={4}
        placeholder="Medical treatment"
        className="sm:col-span-2 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
      <textarea
        value={form.incidentDescription || ""}
        onChange={(event) => setField("incidentDescription", event.target.value)}
        rows={4}
        placeholder="Incident or lead description"
        className="sm:col-span-2 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
      <textarea
        value={form.aiSummary || ""}
        onChange={(event) => setField("aiSummary", event.target.value)}
        rows={4}
        placeholder="AI summary"
        className="sm:col-span-2 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
      <textarea
        value={form.notes || ""}
        onChange={(event) => setField("notes", event.target.value)}
        rows={4}
        placeholder="Notes"
        className="sm:col-span-2 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
      />
      <textarea
        value={extraCapturedDataText}
        onChange={(event) => onExtraCapturedDataTextChange(event.target.value)}
        rows={8}
        placeholder="Dynamic fields JSON"
        className="sm:col-span-2 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
      />
      <textarea
        value={rawExtractedDataText}
        onChange={(event) => onRawExtractedDataTextChange(event.target.value)}
        rows={8}
        placeholder="Raw AI extracted data JSON"
        className="sm:col-span-2 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
      />
      <textarea
        value={rawConversationText}
        onChange={(event) => onRawConversationTextChange(event.target.value)}
        rows={8}
        placeholder="Raw conversation JSON array"
        className="sm:col-span-2 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 font-mono text-sm text-[#013144] outline-none"
      />
    </div>
  );
}

import { Eye, MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import SearchableSelect from "../components/ui/SearchableSelect";
import { env } from "../config/env";
import { adminApi, leadApi } from "../lib/api";
import {
  createOptions,
  formatEnumLabel,
  LEAD_HOTNESS_STATUSES,
  LEAD_PROJECT_TYPES,
  LEAD_RECORD_STATUSES,
  LEAD_SERVICE_TYPES,
} from "../lib/leadOptions";
import { navigateTo } from "../lib/navigation";
import type { AppUser, CreateLeadInput, Lead } from "../types/api";

const leadStatusOptions = createOptions(LEAD_HOTNESS_STATUSES);
const serviceTypeOptions = createOptions(LEAD_SERVICE_TYPES);
const projectTypeOptions = createOptions(LEAD_PROJECT_TYPES);
const statusOptions = createOptions(LEAD_RECORD_STATUSES);

export default function LeadListPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [projectType, setProjectType] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const [assignUserId, setAssignUserId] = useState(String(env.defaultAssignedToUserId));
  const [assignNotes, setAssignNotes] = useState("Assign to sales desk for immediate callback.");
  const [assignFollowUpAt, setAssignFollowUpAt] = useState("2026-05-05T15:00:00.000Z");
  const [importJson, setImportJson] = useState(
    JSON.stringify(
      [
        {
          fullName: "Import Lead One",
          phone: "+15550000001",
          email: "import1@example.com",
          source: "MANUAL_ENTRY",
          status: "NEW",
          businessType: "",
          companyName: "Northstar HealthTech",
          serviceType: "CUSTOM_SOFTWARE",
          projectType: "MVP",
          projectBudget: "$20,000-$30,000",
          projectTimeline: "12 weeks",
          location: "Miami, Florida",
          preferredContactMethod: "PHONE",
          projectDescription: "Need a CRM and reporting workspace for a growing sales team.",
          currentChallenges: "Tracking leads in spreadsheets and missing follow-ups.",
          expectedFeatures: "Pipeline dashboard, reminders, export, role-based access.",
          techStack: "Open to React and Node.js",
          isDecisionMaker: true,
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
        leadApi.list({
          page,
          limit: 20,
          search,
          status,
          serviceType,
          projectType,
          leadStatus,
        }),
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
  }, [page, search, status, serviceType, projectType, leadStatus]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setActionsOpen(false);
      }
    }

    if (actionsOpen) {
      document.addEventListener("pointerdown", handlePointerDown);
    }

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [actionsOpen]);

  const actionMenuItems = [
    { label: "Import JSON", onClick: () => setImportOpen(true) },
    { label: "Export CSV", onClick: () => void leadApi.exportCsv() },
    { label: "Export JSON", onClick: () => void leadApi.exportJson() },
  ];

  return (
    <div className="space-y-5">
      <PageTitle
        title="Leads"
        subtitle="Connected to the current direct lead APIs: list, create, update, import, export, assign, and delete."
        action={
          <div className="flex items-center gap-2">
            <Button onClick={() => navigateTo("/leads/create")}>
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
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or company"
            className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
          <SearchableSelect options={statusOptions} value={status} placeholder="Status" onChange={setStatus} />
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
            options={leadStatusOptions}
            value={leadStatus}
            placeholder="Lead heat"
            onChange={setLeadStatus}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card title="Lead Results" className="xl:col-span-12">
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
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Lead Heat</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="sticky right-0 z-10 w-[116px] bg-[#eef4f6] px-4 py-3 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`cursor-pointer border-t border-[#013144]/12 transition hover:bg-[#013144]/[0.03] ${
                        selectedLead?.id === lead.id ? "bg-[#fcb61f]/8" : ""
                      }`}
                      onClick={() => navigateTo(`/leads/${lead.id}`)}
                    >
                      <td className="px-4 py-3">
                        <button
                          className="text-left"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigateTo(`/leads/${lead.id}`);
                          }}
                        >
                          <p className="font-medium text-[#013144]">{lead.fullName}</p>
                          <p className="text-xs text-[#013144]/50">{lead.email}</p>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-[#013144]/75">{formatEnumLabel(lead.status)}</td>
                      <td className="px-4 py-3 text-[#013144]/75">{lead.companyName || "-"}</td>
                      <td className="px-4 py-3 text-[#013144]/75">
                        {lead.serviceType ? formatEnumLabel(lead.serviceType) : "-"}
                      </td>
                      <td className="px-4 py-3 text-[#013144]/75">
                        {lead.leadStatus ? formatEnumLabel(lead.leadStatus) : "-"}
                      </td>
                      <td className="px-4 py-3 text-[#013144]/75">
                        {lead.sourceLabel || formatEnumLabel(lead.source)}
                      </td>
                      <td
                        className={`sticky right-0 w-[116px] px-4 py-3 ${
                          selectedLead?.id === lead.id ? "bg-[#fdf3cf]" : "bg-white"
                        }`}
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="secondary"
                            className="h-9! w-9! px-0! cursor-pointer"
                            aria-label={`View lead ${lead.fullName}`}
                            title="View"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigateTo(`/leads/${lead.id}`);
                            }}
                          >
                            <Eye size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-9! w-9! px-0! cursor-pointer"
                            aria-label={`Edit lead ${lead.fullName}`}
                            title="Edit"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigateTo(`/leads/${lead.id}/edit`);
                            }}
                          >
                            <Pencil size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-9! w-9! px-0! cursor-pointer"
                            aria-label={`Assign lead ${lead.fullName}`}
                            title="Assign"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedLead(lead);
                              setAssignUserId(String(env.defaultAssignedToUserId));
                              setAssignOpen(true);
                            }}
                          >
                            <UserPlus size={16} aria-hidden="true" />
                          </Button>
                          <Button
                            variant="danger"
                            className="h-9! w-9! px-0! cursor-pointer"
                            aria-label={`Delete lead ${lead.fullName}`}
                            title="Delete"
                            onClick={async (event) => {
                              event.stopPropagation();
                              if (!window.confirm(`Delete lead #${lead.id}?`)) {
                                return;
                              }
                              await leadApi.remove(lead.id);
                              await loadLeads();
                            }}
                          >
                            <Trash2 size={16} aria-hidden="true" />
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
      </div>

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

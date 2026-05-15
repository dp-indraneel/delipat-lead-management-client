import { ChevronLeft, ChevronRight, Eye, MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import SearchableSelect from "../components/ui/SearchableSelect";
import { env } from "../config/env";
import { useToast } from "../context/ToastContext";
import { adminApi, leadApi } from "../lib/api";
import {
  createOptions,
  formatEnumLabel,
  LEAD_AI_STATUSES,
  LEAD_HOTNESS_STATUSES,
  LEAD_RECORD_STATUSES,
} from "../lib/leadOptions";
import { navigateTo, onNavigation } from "../lib/navigation";
import type { AppUser, Lead, LeadFilters } from "../types/api";

const aiStatusOptions = createOptions(LEAD_AI_STATUSES);
const leadStatusOptions = createOptions(LEAD_HOTNESS_STATUSES);
const statusOptions = createOptions(LEAD_RECORD_STATUSES);
const DEFAULT_LIMIT = 20;
const limitOptions = [10, 20, 50, 100].map((value) => ({
  value: String(value),
  label: `${value} per page`,
}));

function readLeadFiltersFromUrl(): Required<Pick<LeadFilters, "page" | "limit">> &
  Omit<LeadFilters, "page" | "limit"> {
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const page = Number(params.get("page") || "1");
  const limit = Number(params.get("limit") || String(DEFAULT_LIMIT));

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT,
    search: params.get("search") || "",
    status: params.get("status") || "",
    aiStatus: params.get("aiStatus") || "",
    leadStatus: params.get("leadStatus") || "",
  };
}

function writeLeadFiltersToUrl(filters: LeadFilters) {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  const nextUrl = query ? `/leads?${query}` : "/leads";

  window.history.replaceState({}, "", nextUrl);
}

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export default function LeadListPage() {
  const { showToast } = useToast();
  const initialFilters = useRef(readLeadFiltersFromUrl());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [page, setPage] = useState(initialFilters.current.page);
  const [limit, setLimit] = useState(initialFilters.current.limit);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(initialFilters.current.search || "");
  const [status, setStatus] = useState(initialFilters.current.status || "");
  const [aiStatus, setAiStatus] = useState(initialFilters.current.aiStatus || "");
  const [leadStatus, setLeadStatus] = useState(initialFilters.current.leadStatus || "");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionsOpen, setActionsOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement | null>(null);
  const [assignUserId, setAssignUserId] = useState(String(env.defaultAssignedToUserId));
  const [assignNotes, setAssignNotes] = useState("Assign to sales desk for immediate callback.");
  const [assignFollowUpAt, setAssignFollowUpAt] = useState("2026-05-05T15:00:00.000Z");
  const activeFilters: LeadFilters = {
    page,
    limit,
    search,
    status,
    aiStatus,
    leadStatus,
  };

  const setFilter = (setter: (value: string) => void, value: string) => {
    setPage(1);
    setter(value);
  };

  async function loadLeads() {
    setLoading(true);
    setError("");
    try {
      const [leadResponse, usersResponse] = await Promise.all([
        leadApi.list({
          ...activeFilters,
        }),
        adminApi.listUsers(),
      ]);
      setLeads(leadResponse.data);
      setTotalPages(Math.max(1, leadResponse.meta.totalPages || 1));
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
    writeLeadFiltersToUrl(activeFilters);
    void loadLeads();
  }, [
    page,
    limit,
    search,
    status,
    aiStatus,
    leadStatus,
  ]);

  useEffect(() => {
    return onNavigation(() => {
      const filters = readLeadFiltersFromUrl();

      setPage(filters.page);
      setLimit(filters.limit);
      setSearch(filters.search || "");
      setStatus(filters.status || "");
      setAiStatus(filters.aiStatus || "");
      setLeadStatus(filters.leadStatus || "");
    });
  }, []);

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
    { label: "Import CSV", onClick: () => navigateTo("/imports") },
    { label: "Export CSV", onClick: () => void leadApi.exportCsv() },
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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card title="Search & Filters">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setFilter(setSearch, event.target.value)}
            placeholder="Search by name, email, or company"
            className="h-10 rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
          <SearchableSelect
            options={statusOptions}
            value={status}
            placeholder="Workflow status"
            onChange={(value) => setFilter(setStatus, value)}
          />
          <SearchableSelect
            options={aiStatusOptions}
            value={aiStatus}
            placeholder="AI status"
            onChange={(value) => setFilter(setAiStatus, value)}
          />
          <SearchableSelect
            options={leadStatusOptions}
            value={leadStatus}
            placeholder="Heat"
            onChange={(value) => setFilter(setLeadStatus, value)}
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
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Heat</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Workflow Status</th>
                    <th className="px-4 py-3">AI Status</th>
                    <th className="sticky right-0 z-10 min-w-[200px] w-[200px] bg-[#eef4f6] px-4 py-3 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`cursor-pointer border-t border-[#013144]/12 transition hover:bg-[#013144]/[0.03]`}
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
                      <td className="whitespace-nowrap px-4 py-3 text-[#013144]/75">
                        {lead.leadScore !== null && lead.leadScore !== undefined
                          ? lead.leadScore
                          : lead.score ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#013144]/75">
                        {lead.leadStatus ? formatEnumLabel(lead.leadStatus) : "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#013144]/75">
                        {lead.sourceLabel || formatEnumLabel(lead.source)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#013144]/75">{formatEnumLabel(lead.status)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-[#013144]/75">
                        {lead.aiStatus ? formatEnumLabel(lead.aiStatus) : "-"}
                      </td>
                      <td
                        className={`sticky right-0 min-w-[200px] w-[200px] px-4 py-3 bg-white`}
                      >
                        <div className="grid grid-cols-4 gap-2">
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
                            onClick={(event) => {
                              event.stopPropagation();
                              setLeadToDelete(lead);
                              setDeleteOpen(true);
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

          <div className="mt-4 flex flex-col gap-3 border-t border-[#013144]/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                className="h-10! w-10! px-0!"
                disabled={page <= 1}
                aria-label="Previous page"
                title="Previous page"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </Button>

              {getPaginationItems(page, totalPages).map((item, index) =>
                item === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex h-10 min-w-10 items-center justify-center rounded-lg px-2 text-sm font-medium text-[#013144]/45"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={item === page ? "primary" : "secondary"}
                    className="h-10! min-w-10! px-3!"
                    aria-current={item === page ? "page" : undefined}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </Button>
                )
              )}

              <Button
                variant="secondary"
                className="h-10! w-10! px-0!"
                disabled={page >= totalPages}
                aria-label="Next page"
                title="Next page"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <p className="text-sm text-[#013144]/60">
                Page {page} of {totalPages}
              </p>
              <div className="min-w-40">
                <SearchableSelect
                  options={limitOptions}
                  value={String(limit)}
                  placeholder="Rows per page"
                  isClearable={false}
                  onChange={(value) => {
                    setPage(1);
                    setLimit(Number(value));
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={deleteOpen}
        title="Delete Lead"
        description="This will remove the lead from the active pipeline."
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false);
            setLeadToDelete(null);
          }
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false);
                setLeadToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleting || !leadToDelete}
              onClick={async () => {
                if (!leadToDelete) {
                  return;
                }

                setDeleting(true);
                try {
                  await leadApi.remove(leadToDelete.id);
                  showToast({
                    type: "success",
                    title: "Lead deleted",
                    message: `${leadToDelete.fullName || `Lead #${leadToDelete.id}`} was deleted successfully.`,
                  });
                  setDeleteOpen(false);
                  setLeadToDelete(null);
                  await loadLeads();
                } catch (nextError) {
                  setError(nextError instanceof Error ? nextError.message : "Failed to delete lead");
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete Lead"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">Are you sure you want to delete this lead?</p>
            <p className="mt-1">This action removes the lead from the active pipeline.</p>
          </div>

          <div className="rounded-lg border border-[#013144]/12 bg-[#f8fbfc] p-4">
            <div className="flex flex-col gap-1 border-b border-[#013144]/10 pb-3">
              <p className="text-xs uppercase tracking-wide text-[#013144]/45">Lead</p>
              <p className="text-lg font-semibold text-[#013144]">
                {leadToDelete?.fullName || `Lead #${leadToDelete?.id || ""}`}
              </p>
              <p className="text-sm text-[#013144]/60">{leadToDelete?.email || "-"}</p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DeleteDetail label="Phone" value={leadToDelete?.phone || "-"} />
              <DeleteDetail label="WhatsApp" value={leadToDelete?.whatsappNumber || "-"} />
              <DeleteDetail label="Company" value={leadToDelete?.companyName || "-"} />
              <DeleteDetail
                label="Workflow Status"
                value={leadToDelete?.status ? formatEnumLabel(leadToDelete.status) : "-"}
              />
              <DeleteDetail
                label="AI Status"
                value={leadToDelete?.aiStatus ? formatEnumLabel(leadToDelete.aiStatus) : "-"}
              />
              <DeleteDetail
                label="Score"
                value={
                  leadToDelete?.leadScore !== null && leadToDelete?.leadScore !== undefined
                    ? String(leadToDelete.leadScore)
                    : leadToDelete?.score !== null && leadToDelete?.score !== undefined
                      ? String(leadToDelete.score)
                      : "-"
                }
              />
              <DeleteDetail
                label="Heat"
                value={leadToDelete?.leadStatus ? formatEnumLabel(leadToDelete.leadStatus) : "-"}
              />
              <DeleteDetail
                label="Source"
                value={leadToDelete?.sourceLabel || (leadToDelete?.source ? formatEnumLabel(leadToDelete.source) : "-")}
              />
            </div>
          </div>
        </div>
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
            className="w-full rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] px-3 py-2.5 text-sm text-[#013144] outline-none"
          />
          <input
            value={assignFollowUpAt}
            onChange={(event) => setAssignFollowUpAt(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
        </div>
      </Modal>

    </div>
  );
}

function DeleteDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-white px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#013144]/45">{label}</p>
      <p className="mt-1 truncate text-sm text-[#013144]">{value}</p>
    </div>
  );
}

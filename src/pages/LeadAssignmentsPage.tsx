import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import Modal from "../components/ui/Modal";
import PageTitle from "../components/ui/PageTitle";
import SearchableSelect from "../components/ui/SearchableSelect";
import { leadApi, leadAssignmentApi } from "../lib/api";
import type { Lead, LeadAssignment } from "../types/api";

export default function LeadAssignmentsPage() {
  const [assignments, setAssignments] = useState<LeadAssignment[]>([]);
  const [leadOptions, setLeadOptions] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<LeadAssignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("CONTACTED");
  const [editNotes, setEditNotes] = useState("");

  async function loadAssignments() {
    setLoading(true);
    setError("");
    try {
      const [assignmentResponse, leadsResponse] = await Promise.all([
        leadAssignmentApi.list({
          page: 1,
          limit: 20,
          leadId: leadId ? Number(leadId) : undefined,
        }),
        leadApi.list({ page: 1, limit: 100 }),
      ]);

      setAssignments(assignmentResponse.data);
      setLeadOptions(leadsResponse.data);
      setSelectedAssignment(assignmentResponse.data[0] || null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssignments();
  }, [leadId]);

  return (
    <div className="space-y-5">
      <PageTitle
        title="Lead Assignments"
        subtitle="Integrated with list, get, patch, and delete assignment APIs."
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card title="Filter by Lead">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto]">
          <SearchableSelect
            options={leadOptions.map((lead) => ({
              value: String(lead.id),
              label: `${lead.fullName} (#${lead.id})`,
            }))}
            value={leadId}
            placeholder="Select lead"
            onChange={setLeadId}
          />
          <Button variant="secondary" onClick={() => setLeadId("")}>
            Reset
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card title="Assignments" className="xl:col-span-7">
          {loading ? (
            <p className="text-sm text-[#013144]/60">Loading assignments...</p>
          ) : assignments.length === 0 ? (
            <EmptyState title="No assignments found" description="Create or assign a lead first." />
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`rounded-2xl border px-4 py-4 ${
                    selectedAssignment?.id === assignment.id
                      ? "border-[#fcb61f]/50 bg-[#fcb61f]/8"
                      : "border-[#013144]/12 bg-[#013144]/[0.03]"
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <button
                        className="text-left"
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <p className="font-medium text-[#013144]">
                          Assignment #{assignment.id} for Lead #{assignment.leadId}
                        </p>
                        <p className="mt-1 text-sm text-[#013144]/55">
                          Assigned to user #{assignment.assignedToUserId} by user #
                          {assignment.assignedByUserId}
                        </p>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        className="h-9 px-3"
                        onClick={async () => {
                          const response = await leadAssignmentApi.get(assignment.id);
                          setSelectedAssignment(response.data);
                        }}
                      >
                        Get Detail
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-9 px-3"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setEditStatus(assignment.status);
                          setEditNotes(assignment.notes || "");
                          setEditOpen(true);
                        }}
                      >
                        Patch
                      </Button>
                      <Button
                        variant="danger"
                        className="h-9 px-3"
                        onClick={async () => {
                          if (!window.confirm(`Delete assignment #${assignment.id}?`)) {
                            return;
                          }
                          await leadAssignmentApi.remove(assignment.id);
                          await loadAssignments();
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Assignment Detail" className="xl:col-span-5">
          {!selectedAssignment ? (
            <EmptyState title="No assignment selected" description="Choose an assignment to inspect." />
          ) : (
            <div className="space-y-3 text-sm text-[#013144]/75">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Status</p>
                <p className="mt-1 font-medium text-[#013144]">{selectedAssignment.status}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Notes</p>
                <p className="mt-1">{selectedAssignment.notes || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Follow Up At</p>
                <p className="mt-1">{selectedAssignment.followUpAt || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Lead</p>
                <p className="mt-1">
                  {selectedAssignment.lead
                    ? `${selectedAssignment.lead.fullName} (${selectedAssignment.lead.email})`
                    : `Lead #${selectedAssignment.leadId}`}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Assigned To</p>
                <p className="mt-1">
                  {selectedAssignment.assignedToUser
                    ? `${selectedAssignment.assignedToUser.name} (${selectedAssignment.assignedToUser.email})`
                    : `User #${selectedAssignment.assignedToUserId}`}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={editOpen}
        title="Patch Lead Assignment"
        description="Uses the patch assignment API you shared."
        onClose={() => setEditOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedAssignment) {
                  return;
                }
                await leadAssignmentApi.patch(selectedAssignment.id, {
                  status: editStatus,
                  notes: editNotes,
                });
                setEditOpen(false);
                await loadAssignments();
              }}
            >
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <input
            value={editStatus}
            onChange={(event) => setEditStatus(event.target.value)}
            placeholder="Status"
            className="h-11 w-full rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none"
          />
          <textarea
            value={editNotes}
            onChange={(event) => setEditNotes(event.target.value)}
            rows={5}
            placeholder="Notes"
            className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3 text-sm text-[#013144] outline-none"
          />
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useMemo, useState, type ReactNode } from "react";
import ChatTranscript from "../components/leads/ChatTranscript";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageTitle from "../components/ui/PageTitle";
import { adminApi, leadApi } from "../lib/api";
import { formatDateTime } from "../lib/dateTime";
import { formatJsonKeyValue } from "../lib/leadForm";
import { formatEnumLabel } from "../lib/leadOptions";
import { navigateTo } from "../lib/navigation";
import type { AppUser, Lead } from "../types/api";

interface Props {
  leadId: number;
}

export default function LeadDetailPage({ leadId }: Props) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLead() {
      setLoading(true);
      setError("");
      try {
        const [leadResponse, usersResponse] = await Promise.all([
          leadApi.get(leadId),
          adminApi.listUsers(),
        ]);
        setLead(leadResponse.data);
        setUsers(usersResponse.data);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load lead");
      } finally {
        setLoading(false);
      }
    }

    void loadLead();
  }, [leadId]);

  const selectedSalesUser = useMemo(
    () => lead?.assignedSalesExecutive ?? users.find((user) => user.id === lead?.assignedSalesExecutiveId) ?? null,
    [lead, users]
  );
  const tracking = getPrimaryTracking(lead);
  const sourceLabel = tracking?.sourceLabel || lead?.sourceLabel || "";
  const displayedScore = lead?.score ?? lead?.leadScore ?? null;

  return (
    <div className="space-y-5">
      <PageTitle
        title={`Lead #${leadId}`}
        subtitle="Review the lead details and jump into editing when needed."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => navigateTo("/leads")}>
              Back to Leads
            </Button>
            <Button onClick={() => navigateTo(`/leads/${leadId}/edit`)}>Edit Lead</Button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <Card>
          <p className="text-sm text-[#013144]/60">Loading lead...</p>
        </Card>
      ) : !lead ? (
        <EmptyState title="Lead not found" description="The requested lead could not be loaded." />
      ) : (
        <div className="space-y-3">
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Lead</p>
                <h2 className="mt-1 truncate text-xl font-semibold text-[#013144]">
                  {lead.fullName || `Lead #${lead.id}`}
                </h2>
                <p className="mt-1 text-sm text-[#013144]/60">{lead.email || "-"}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:min-w-[620px]">
                <Metric label="Workflow" value={formatLeadValue(lead.status)} />
                <Metric label="AI Status" value={formatLeadValue(lead.aiStatus)} />
                <Metric label="Heat" value={formatLeadValue(lead.leadStatus)} />
                <Metric
                  label="Lead Score"
                  value={lead.leadScore !== null && lead.leadScore !== undefined ? String(lead.leadScore) : "-"}
                />
                <Metric label="Source" value={sourceLabel || formatEnumLabel(lead.source)} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <div className="space-y-3">
              <Card title="Project Summary">
                <div className="grid grid-cols-1 gap-2">
                  <TextBlock label="Project Description" value={lead.projectDescription} />
                  <TextBlock label="Current Challenges" value={lead.currentChallenges} />
                  <TextBlock label="Expected Features" value={lead.expectedFeatures} />
                  <TextBlock label="Internal Notes" value={lead.notes} />
                </div>
              </Card>

              <Card title="Project">
                <DetailGrid>
                  <DetailItem label="Budget" value={lead.projectBudget || "-"} />
                  <DetailItem label="Timeline" value={lead.projectTimeline || "-"} />
                  <DetailItem label="Tech Stack" value={lead.techStack || "-"} />
                </DetailGrid>
              </Card>

              <Card title="Contact & Other Fields">
                <DetailGrid>
                  <DetailItem label="Phone" value={lead.phone || "-"} />
                  <DetailItem label="WhatsApp" value={lead.whatsappNumber || "-"} />
                  <DetailItem label="Preferred Contact" value={formatLeadValue(lead.preferredContactMethod)} />
                  <DetailItem label="Location" value={lead.location || "-"} />
                  <DetailItem label="Company" value={lead.companyName || "-"} />
                  <DetailItem label="Company Website" value={lead.companyWebsite || "-"} />
                  <DetailItem label="Job Title" value={lead.jobTitle || "-"} />
                  <DetailItem label="Business Type" value={formatLeadValue(lead.businessType)} />
                  <DetailItem
                    label="Decision Maker"
                    value={lead.isDecisionMaker === null ? "-" : lead.isDecisionMaker ? "Yes" : "No"}
                  />
                </DetailGrid>
              </Card>
            </div>

            <div className="space-y-3">
              <Card title="AI Intake">
                <DetailGrid>
                  <DetailItem
                    label="Score"
                    value={displayedScore !== null && displayedScore !== undefined ? String(displayedScore) : "-"}
                  />
                  <DetailItem label="AI Status" value={formatLeadValue(lead.aiStatus)} />
                  <DetailItem label="AI Provider" value={formatLeadValue(lead.aiProvider)} />
                  <DetailItem label="AI Model" value={lead.aiModel || "-"} />
                  <DetailItem
                    label="Assigned Sales"
                    value={
                      selectedSalesUser
                        ? `${selectedSalesUser.name}${selectedSalesUser.email ? ` (${selectedSalesUser.email})` : ""}`
                        : String(lead.assignedSalesExecutiveId || "-")
                    }
                  />
                </DetailGrid>
                <div className="mt-2 grid gap-2">
                  <TextBlock label="AI Summary" value={lead.aiSummary} />
                  <TextBlock label="AI Next Action" value={lead.aiNextAction} />
                  <TextBlock
                    label="AI Missing Fields"
                    value={
                      lead.aiMissingFields?.length
                        ? lead.aiMissingFields.map((field) => formatFieldLabel(field)).join(", ")
                        : null
                    }
                  />
                </div>
              </Card>

              <Card title="Acquisition & Dates">
                <DetailGrid>
                  <DetailItem label="Source Label" value={sourceLabel || "-"} />
                  <DetailItem label="Campaign" value={tracking?.campaign || lead.campaign || "-"} />
                  <DetailItem label="Medium" value={tracking?.medium || lead.medium || "-"} />
                  <DetailItem label="Channel" value={tracking?.channel || lead.channel || "-"} />
                  <DetailItem label="GCLID" value={tracking?.gclid || lead.gclid || "-"} />
                  <DetailItem label="UTM Source" value={tracking?.utmSource || lead.utmSource || "-"} />
                  <DetailItem label="UTM Medium" value={tracking?.utmMedium || lead.utmMedium || "-"} />
                  <DetailItem label="UTM Campaign" value={tracking?.utmCampaign || lead.utmCampaign || "-"} />
                  <DetailItem label="UTM Term" value={tracking?.utmTerm || lead.utmTerm || "-"} />
                  <DetailItem label="UTM Content" value={tracking?.utmContent || lead.utmContent || "-"} />
                  <DetailItem label="Page URL" value={tracking?.pageUrl || lead.pageUrl || "-"} />
                  <DetailItem label="Referrer URL" value={tracking?.referrerUrl || lead.referrerUrl || "-"} />
                  <DetailItem
                    label="Submitted By"
                    value={lead.submittedByUser?.name || String(lead.submittedByUserId || "-")}
                  />
                  <DetailItem label="Created At" value={formatDateTime(lead.createdAt)} />
                  <DetailItem label="Updated At" value={formatDateTime(lead.updatedAt)} />
                  <DetailItem label="Deleted At" value={formatDateTime(lead.deletedAt)} />
                </DetailGrid>
              </Card>
            </div>

            <div className="space-y-3">
              <Card title="Custom Fields">
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[#013144]/[0.04] p-2.5 text-xs text-[#013144]">
                  {formatJsonKeyValue(lead.customFields, {})}
                </pre>
              </Card>

              <Card title="Raw Conversation">
                <ChatTranscript entries={lead.rawConversation || []} />
              </Card>

              <Card title="Messages">
                <ChatTranscript entries={lead.messages || []} />
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-wide text-[#013144]/45">{label}</p>
      <p className="mt-0.5 break-words text-sm text-[#013144]">{value}</p>
    </div>
  );
}

function DetailGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#013144]/10 bg-[#013144]/[0.03] px-2.5 py-2">
      <p className="text-[11px] uppercase tracking-wide text-[#013144]/45">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-[#013144]">{value}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-lg bg-[#013144]/[0.03] p-2.5">
      <p className="text-xs uppercase tracking-wide text-[#013144]/45">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#013144]/75">{value || "-"}</p>
    </div>
  );
}

function formatLeadValue(value: string | null | undefined) {
  return value ? formatEnumLabel(value) : "-";
}

function formatFieldLabel(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .split("_")
    .filter(Boolean)
    .map((part) => formatEnumLabel(part))
    .join(" ");
}

function getPrimaryTracking(lead: Lead | null) {
  return lead?.tracking?.[0] || null;
}

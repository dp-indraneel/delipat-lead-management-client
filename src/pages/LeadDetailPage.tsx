import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageTitle from "../components/ui/PageTitle";
import { adminApi, leadApi } from "../lib/api";
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
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <Card title="Lead Overview" className="xl:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailItem label="Full Name" value={lead.fullName || "-"} />
              <DetailItem label="Email" value={lead.email || "-"} />
              <DetailItem label="Phone" value={lead.phone || "-"} />
              <DetailItem label="Company" value={lead.companyName || "-"} />
              <DetailItem label="Company Website" value={lead.companyWebsite || "-"} />
              <DetailItem label="Job Title" value={lead.jobTitle || "-"} />
              <DetailItem label="Business Type" value={formatLeadValue(lead.businessType)} />
              <DetailItem label="Source" value={lead.sourceLabel || formatEnumLabel(lead.source)} />
              <DetailItem label="Source Label" value={lead.sourceLabel || "-"} />
              <DetailItem label="Status" value={formatLeadValue(lead.status)} />
              <DetailItem label="Service Type" value={formatLeadValue(lead.serviceType)} />
              <DetailItem label="Service Type Other" value={lead.serviceTypeOther || "-"} />
              <DetailItem label="Service Type Text" value={lead.serviceTypeText || "-"} />
              <DetailItem label="Project Type" value={formatLeadValue(lead.projectType)} />
              <DetailItem label="Project Type Other" value={lead.projectTypeOther || "-"} />
              <DetailItem label="Project Type Text" value={lead.projectTypeText || "-"} />
              <DetailItem label="Project Budget" value={lead.projectBudget || "-"} />
              <DetailItem label="Project Timeline" value={lead.projectTimeline || "-"} />
              <DetailItem label="Preferred Contact" value={formatLeadValue(lead.preferredContactMethod)} />
              <DetailItem label="Location" value={lead.location || "-"} />
              <DetailItem
                label="Decision Maker"
                value={lead.isDecisionMaker === null ? "-" : lead.isDecisionMaker ? "Yes" : "No"}
              />
              <DetailItem label="Lead Heat" value={formatLeadValue(lead.leadStatus)} />
            </div>
          </Card>

          <Card title="Qualification" className="xl:col-span-5">
            <div className="space-y-4 text-sm text-[#013144]/75">
              <DetailItem
                label="Lead Score"
                value={lead.leadScore !== null && lead.leadScore !== undefined ? String(lead.leadScore) : "-"}
              />
              <DetailItem
                label="Score"
                value={lead.score !== null && lead.score !== undefined ? String(lead.score) : "-"}
              />
              <DetailItem
                label="Assigned Sales Executive"
                value={selectedSalesUser ? selectedSalesUser.name : String(lead.assignedSalesExecutiveId || "-")}
              />
              <DetailItem label="AI Provider" value={formatLeadValue(lead.aiProvider)} />
              <DetailItem label="AI Model" value={lead.aiModel || "-"} />
              <DetailItem label="AI Next Action" value={lead.aiNextAction || "-"} />
              <DetailItem
                label="AI Missing Fields"
                value={
                  lead.aiMissingFields?.length
                    ? lead.aiMissingFields.map((field) => formatFieldLabel(field)).join(", ")
                    : "-"
                }
              />
              <DetailItem label="AI Summary" value={lead.aiSummary || "-"} />
            </div>
          </Card>

          <Card title="Acquisition Tracking" className="xl:col-span-12">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <DetailItem label="Campaign" value={lead.campaign || "-"} />
              <DetailItem label="Medium" value={lead.medium || "-"} />
              <DetailItem label="Channel" value={lead.channel || "-"} />
              <DetailItem label="GCLID" value={lead.gclid || "-"} />
              <DetailItem label="UTM Source" value={lead.utmSource || "-"} />
              <DetailItem label="UTM Medium" value={lead.utmMedium || "-"} />
              <DetailItem label="UTM Campaign" value={lead.utmCampaign || "-"} />
              <DetailItem label="UTM Term" value={lead.utmTerm || "-"} />
              <DetailItem label="UTM Content" value={lead.utmContent || "-"} />
              <DetailItem label="Page URL" value={lead.pageUrl || "-"} />
              <DetailItem label="Referrer URL" value={lead.referrerUrl || "-"} />
              <DetailItem label="Created At" value={lead.createdAt || "-"} />
              <DetailItem label="Updated At" value={lead.updatedAt || "-"} />
              <DetailItem label="Deleted At" value={lead.deletedAt || "-"} />
            </div>
          </Card>

          <Card title="Project Description" className="xl:col-span-6">
            <p className="text-sm text-[#013144]/75">{lead.projectDescription || "-"}</p>
          </Card>

          <Card title="Current Challenges" className="xl:col-span-6">
            <p className="text-sm text-[#013144]/75">{lead.currentChallenges || "-"}</p>
          </Card>

          <Card title="Expected Features" className="xl:col-span-6">
            <p className="text-sm text-[#013144]/75">{lead.expectedFeatures || "-"}</p>
          </Card>

          <Card title="Tech Stack" className="xl:col-span-6">
            <p className="text-sm text-[#013144]/75">{lead.techStack || "-"}</p>
          </Card>

          <Card title="Notes" className="xl:col-span-6">
            <p className="text-sm text-[#013144]/75">{lead.notes || "-"}</p>
          </Card>

          <Card title="Custom Fields" className="xl:col-span-12">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[#013144]/[0.04] p-3 text-xs text-[#013144]">
              {formatJsonKeyValue(lead.customFields, {})}
            </pre>
          </Card>

          <Card title="Raw Conversation" className="xl:col-span-12">
            <ChatTranscript entries={lead.rawConversation || []} />
          </Card>

          <Card title="Messages" className="xl:col-span-12">
            <ChatTranscript entries={lead.messages || []} />
          </Card>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[#013144]/45">{label}</p>
      <p className="mt-1 text-sm text-[#013144]">{value}</p>
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

type ChatSide = "user" | "ai";

interface ChatEntry {
  id: string;
  side: ChatSide;
  label: string;
  text: string;
  timestamp?: string;
}

function ChatTranscript({ entries }: { entries: unknown[] }) {
  const messages = normalizeChatEntries(entries);

  if (!messages.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#013144]/15 bg-[#013144]/[0.03] px-4 py-5 text-sm text-[#013144]/55">
        No conversation messages found.
      </div>
    );
  }

  return (
    <div className="max-h-96 space-y-3 overflow-auto rounded-2xl bg-[#f7fafb] p-3 sm:p-4">
      {messages.map((message) => {
        const isUser = message.side === "user";

        return (
          <div
            key={message.id}
            className={`flex ${isUser ? "justify-start" : "justify-end"}`}
          >
            <div className={`max-w-[88%] sm:max-w-[72%] ${isUser ? "text-left" : "text-right"}`}>
              <div
                className={`mb-1 text-[11px] font-semibold uppercase tracking-wide ${
                  isUser ? "text-[#013144]/45" : "text-[#013144]/50"
                }`}
              >
                {message.label}
              </div>
              <div
                className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? "rounded-bl-md border border-[#013144]/10 bg-white text-[#013144]"
                    : "rounded-br-md bg-[#013144] text-white"
                }`}
              >
                {message.text}
              </div>
              {message.timestamp ? (
                <div className="mt-1 text-[11px] text-[#013144]/40">{message.timestamp}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function normalizeChatEntries(entries: unknown[]): ChatEntry[] {
  return entries
    .map((entry, index) => normalizeChatEntry(entry, index))
    .filter((entry): entry is ChatEntry => Boolean(entry));
}

function normalizeChatEntry(entry: unknown, index: number): ChatEntry | null {
  if (entry === null || entry === undefined) {
    return null;
  }

  if (typeof entry !== "object") {
    return {
      id: `message-${index}`,
      side: "user",
      label: "User",
      text: String(entry),
    };
  }

  const record = entry as Record<string, unknown>;
  const rawRole = firstString(record.sender, record.role, record.author, record.from, record.type);
  const side = getChatSide(rawRole);
  const text =
    firstString(record.message, record.text, record.content, record.reply, record.answer, record.value) ||
    formatJsonKeyValue(record, {});

  if (!text || text === "-") {
    return null;
  }

  return {
    id: firstString(record.id) || `message-${index}`,
    side,
    label: side === "user" ? "User" : "AI",
    text,
    timestamp: firstString(record.createdAt, record.timestamp, record.time),
  };
}

function firstString(...values: unknown[]) {
  const value = values.find((entry) => typeof entry === "string" && entry.trim());
  return typeof value === "string" ? value.trim() : "";
}

function getChatSide(role: string): ChatSide {
  const normalizedRole = role.toLowerCase();

  if (
    normalizedRole.includes("user") ||
    normalizedRole.includes("human") ||
    normalizedRole.includes("client") ||
    normalizedRole.includes("visitor")
  ) {
    return "user";
  }

  return "ai";
}

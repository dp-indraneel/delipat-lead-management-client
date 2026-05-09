import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import PageTitle from "../components/ui/PageTitle";
import { adminApi, leadApi } from "../lib/api";
import { formatJson } from "../lib/leadForm";
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
    () => users.find((user) => user.id === lead?.assignedSalesExecutiveId),
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
              <DetailItem label="Full Name" value={lead.fullName} />
              <DetailItem label="Email" value={lead.email} />
              <DetailItem label="Phone" value={lead.phone} />
              <DetailItem label="Company" value={lead.companyName || "-"} />
              <DetailItem label="Job Title" value={lead.jobTitle || "-"} />
              <DetailItem label="Business Type" value={lead.businessType || "-"} />
              <DetailItem label="Source" value={lead.source} />
              <DetailItem label="Status" value={lead.status} />
              <DetailItem label="Service Type" value={lead.serviceType || lead.serviceTypeText || "-"} />
              <DetailItem label="Project Type" value={lead.projectType || lead.projectTypeText || "-"} />
              <DetailItem label="Project Budget" value={lead.projectBudget || "-"} />
              <DetailItem label="Project Timeline" value={lead.projectTimeline || "-"} />
              <DetailItem label="Preferred Contact" value={lead.preferredContactMethod || "-"} />
              <DetailItem label="Location" value={lead.location || "-"} />
              <DetailItem label="Decision Maker" value={lead.isDecisionMaker ? "Yes" : "No"} />
              <DetailItem label="Lead Heat" value={lead.leadStatus || "-"} />
            </div>
          </Card>

          <Card title="Qualification" className="xl:col-span-5">
            <div className="space-y-4 text-sm text-[#013144]/75">
              <DetailItem label="Lead Score" value={lead.leadScore !== null ? String(lead.leadScore) : "-"} />
              <DetailItem label="Assigned Sales Executive" value={selectedSalesUser ? selectedSalesUser.name : String(lead.assignedSalesExecutiveId || "-")} />
              <DetailItem label="AI Provider" value={lead.aiProvider || "-"} />
              <DetailItem label="AI Model" value={lead.aiModel || "-"} />
              <DetailItem label="AI Summary" value={lead.aiSummary || "-"} />
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

          <Card title="Notes" className="xl:col-span-6">
            <p className="text-sm text-[#013144]/75">{lead.notes || "-"}</p>
          </Card>

          <Card title="Extra Captured Data" className="xl:col-span-12">
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl bg-[#013144]/[0.04] p-3 text-xs text-[#013144]">
              {formatJson(lead.extraCapturedData, {})}
            </pre>
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

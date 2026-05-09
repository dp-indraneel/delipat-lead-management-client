import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";
import { adminApi, leadApi, leadAssignmentApi } from "../lib/api";

interface Metric {
  label: string;
  value: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Leads", value: "..." },
    { label: "Assignments", value: "..." },
    { label: "Users", value: "..." },
    { label: "Roles", value: "..." },
  ]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [leads, hotLeads, assignments, users, roles] = await Promise.all([
          leadApi.list({ page: 1, limit: 20 }),
          leadApi.list({ page: 1, limit: 20, leadStatus: "HOT" }),
          leadAssignmentApi.list({ page: 1, limit: 20 }),
          adminApi.listUsers(),
          adminApi.listRoles(),
        ]);

        setMetrics([
          { label: "Leads", value: String(leads.meta.total) },
          { label: "Hot Leads", value: String(hotLeads.meta.total) },
          { label: "Assignments", value: String(assignments.meta.total) },
          { label: "Users", value: String(users.data.length) },
          { label: "Roles", value: String(roles.data.length) },
        ]);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load dashboard");
      }
    }

    void load();
  }, []);

  return (
    <div className="space-y-5">
      <PageTitle
        title="Dashboard"
        subtitle="Live overview based on the APIs currently available in your backend."
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-[#013144]/50">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[#013144]">{item.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Integrated Modules">
          <div className="space-y-3 text-sm text-[#013144]/70">
            <div className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3">
              Auth login and logout
            </div>
            <div className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3">
              Direct leads with CRM fields, import, export, assign, and delete
            </div>
            <div className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-4 py-3">
              Lead assignments, users, roles, modules and role permissions
            </div>
          </div>
        </Card>

        <Card title="Pending Modules">
          <div className="space-y-3 text-sm text-[#013144]/70">
            <div className="rounded-xl border border-dashed border-[#013144]/12 px-4 py-3">
              Bulk email API not shared yet
            </div>
            <div className="rounded-xl border border-dashed border-[#013144]/12 px-4 py-3">
              Templates API not shared yet
            </div>
            <div className="rounded-xl border border-dashed border-[#013144]/12 px-4 py-3">
              Settings API not shared yet
            </div>
            <div className="rounded-xl border border-dashed border-[#013144]/12 px-4 py-3">
              Activity logs API not shared yet
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

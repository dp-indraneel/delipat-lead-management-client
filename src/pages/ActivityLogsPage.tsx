import PageTitle from "../components/ui/PageTitle";
import Card from "../components/ui/Card";

const rows = [
  { action: "Lead created", user: "Admin", target: "Priya Das", date: "2026-04-08 10:15 AM" },
  { action: "Bulk email sent", user: "Ritika", target: "24 leads", date: "2026-04-08 11:40 AM" },
  { action: "Template updated", user: "Admin", target: "Welcome Template", date: "2026-04-08 12:10 PM" },
  { action: "Lead assigned", user: "Soham", target: "Rahul Verma", date: "2026-04-08 01:05 PM" },
];

export default function ActivityLogsPage() {
  return (
    <div className="space-y-5">
      <PageTitle
        title="Activity Logs"
        subtitle="Track important actions across leads, templates, imports, and email"
      />

      <Card title="Logs">
        <div className="slim-scrollbar overflow-x-auto">
          <table className="min-w-[760px] w-full text-left">
            <thead className="border-b border-[#013144]/12 text-xs uppercase tracking-wide text-[#013144]/45">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Action</th>
                <th className="whitespace-nowrap px-4 py-3">User</th>
                <th className="whitespace-nowrap px-4 py-3">Target</th>
                <th className="whitespace-nowrap px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b border-[#013144]/12">
                  <td className="whitespace-nowrap px-4 py-4 text-[#013144]">{row.action}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#013144]/75">{row.user}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#013144]/75">{row.target}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-[#013144]/50">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
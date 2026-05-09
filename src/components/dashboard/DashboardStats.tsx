import Card from "../ui/Card";

const stats = [
  { label: "Total Leads", value: "1,248" },
  { label: "New Leads", value: "184" },
  { label: "Contacted", value: "342" },
  { label: "Qualified", value: "216" },
  { label: "Lost Leads", value: "74" },
  { label: "Emails Sent", value: "3,892" },
];

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {stats.map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-[#013144]/50">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#013144]">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
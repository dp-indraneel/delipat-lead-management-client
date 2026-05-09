import PageTitle from "../components/ui/PageTitle";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function ImportLeadsPage() {
  return (
    <div className="space-y-5">
      <PageTitle
        title="Import Leads"
        subtitle="Upload CSV or Excel files and map columns to lead fields"
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-4">
          <Card title="Upload File">
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#013144]/[0.03] p-6 text-center">
              <p className="text-sm text-[#013144]/70">Drag & drop CSV/XLSX file here</p>
              <p className="mt-1 text-xs text-[#013144]/40">or click to browse</p>

              <div className="mt-4">
                <Button variant="secondary">Choose File</Button>
              </div>
            </div>
          </Card>

          <Card title="Import Summary">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Total rows</span>
                <span className="text-[#013144]">120</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Valid rows</span>
                <span className="text-[#013144]">103</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Duplicates</span>
                <span className="text-[#013144]">9</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Failed rows</span>
                <span className="text-[#013144]">8</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-5 xl:col-span-8">
          <Card title="Column Mapping" description="Match file columns to lead fields">
            <div className="grid grid-cols-1 gap-3">
              {[
                "fullName",
                "email",
                "phone",
                "companyName",
                "jobTitle",
                "source",
                "status",
                "city",
              ].map((field) => (
                <div
                  key={field}
                  className="grid grid-cols-1 gap-3 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] p-3 sm:grid-cols-2"
                >
                  <div className="text-sm text-[#013144]">{field}</div>
                  <select className="h-10 rounded-lg border border-[#013144]/12 bg-white px-3 text-sm text-[#013144] outline-none">
                    <option className="bg-white">Select column</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary">Validate</Button>
              <Button>Import Leads</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
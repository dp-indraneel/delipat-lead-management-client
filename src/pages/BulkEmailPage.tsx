import PageTitle from "../components/ui/PageTitle";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function BulkEmailPage() {
  return (
    <div className="space-y-5">
      <PageTitle
        title="Bulk Email"
        subtitle="Filter leads, choose a template, preview, and send emails"
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-4">
          <Card title="Lead Filters" description="Choose recipients before sending">
            <div className="grid grid-cols-1 gap-3">
              <select className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none">
                <option className="bg-white">All Status</option>
              </select>
              <select className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none">
                <option className="bg-white">All Source</option>
              </select>
              <input
                placeholder="Assigned user"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none placeholder:text-[#013144]/35"
              />
              <Button variant="secondary" className="w-full">
                Apply Filters
              </Button>
            </div>
          </Card>

          <Card title="Recipient Summary">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Selected leads</span>
                <span className="text-[#013144]">24</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Has email</span>
                <span className="text-[#013144]">21</span>
              </div>
              <div className="flex items-center justify-between text-[#013144]/70">
                <span>Invalid emails</span>
                <span className="text-[#013144]">3</span>
              </div>
            </div>
          </Card>

          <Card title="Placeholders">
            <div className="flex flex-wrap gap-2">
              {["{{name}}", "{{companyName}}", "{{email}}", "{{phone}}", "{{jobTitle}}", "{{assignedTo}}"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex whitespace-nowrap rounded-full border border-[#fcb61f]/30 bg-[#fcb61f]/10 px-3 py-1 text-xs text-[#fcb61f]"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-5 xl:col-span-8">
          <Card title="Compose Email" description="Use a template or write custom content">
            <div className="grid grid-cols-1 gap-4">
              <select className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none">
                <option className="bg-white">Select template</option>
                <option className="bg-white">Welcome Template</option>
                <option className="bg-white">Follow-up Template</option>
              </select>

              <input
                placeholder="Email subject"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none placeholder:text-[#013144]/35"
              />

              <textarea
                rows={12}
                placeholder="Write your email body here..."
                className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 py-3 text-sm text-[#013144] outline-none placeholder:text-[#013144]/35"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary">Send Test Email</Button>
                <Button variant="secondary">Preview Email</Button>
                <Button>Send Bulk Email</Button>
              </div>
            </div>
          </Card>

          <Card title="Preview" description="Preview of the personalized email">
            <div className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] p-4 text-sm text-[#013144]/80">
              <p className="font-medium text-[#013144]">{"Subject: Welcome {{name}}"}</p>
              <div className="mt-4 space-y-3">
                <p>Hello Aarav Sharma,</p>
                <p>
                  We would love to discuss how we can support Nova Tech with lead handling and
                  calling operations.
                </p>
                <p>Regards, Team</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

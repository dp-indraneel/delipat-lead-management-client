import { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageTitle from "../components/ui/PageTitle";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  updatedAt: string;
  createdBy: string;
}

const initialTemplates: Template[] = [
  {
    id: "TMP-001",
    name: "Welcome Template",
    subject: "Welcome {{name}}",
    body: "Hello {{name}},\n\nWelcome to our workflow.\n\nRegards,\nTeam",
    updatedAt: "2026-04-08",
    createdBy: "Admin",
  },
  {
    id: "TMP-002",
    name: "Follow-up Template",
    subject: "Following up with {{companyName}}",
    body: "Hi {{name}},\n\nChecking in on the next step for {{companyName}}.\n\nRegards,\nTeam",
    updatedAt: "2026-04-07",
    createdBy: "Admin",
  },
];

function createBlankTemplate(): Template {
  return {
    id: `TMP-${Date.now().toString().slice(-4)}`,
    name: "",
    subject: "",
    body: "",
    updatedAt: new Date().toISOString().slice(0, 10),
    createdBy: "Admin",
  };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(initialTemplates);
  const [draft, setDraft] = useState<Template>(initialTemplates[0]);
  const [selectedId, setSelectedId] = useState(initialTemplates[0].id);

  const isCreating = useMemo(() => !templates.some((template) => template.id === selectedId), [selectedId, templates]);

  const saveTemplate = () => {
    if (!draft.name.trim() || !draft.subject.trim()) {
      return;
    }

    const nextTemplate = {
      ...draft,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setTemplates((current) => {
      const exists = current.some((template) => template.id === draft.id);
      return exists
        ? current.map((template) => (template.id === draft.id ? nextTemplate : template))
        : [nextTemplate, ...current];
    });
    setSelectedId(nextTemplate.id);
    setDraft(nextTemplate);
  };

  const selectTemplate = (template: Template) => {
    setSelectedId(template.id);
    setDraft(template);
  };

  const deleteTemplate = (id: string) => {
    const nextTemplates = templates.filter((template) => template.id !== id);
    setTemplates(nextTemplates);

    if (selectedId === id) {
      const fallback = nextTemplates[0] ?? createBlankTemplate();
      setSelectedId(fallback.id);
      setDraft(fallback);
    }
  };

  return (
    <div className="space-y-5">
      <PageTitle
        title="Email Templates"
        subtitle="Create, edit, and reuse templates for outreach flows."
        action={
          <Button
            onClick={() => {
              const blank = createBlankTemplate();
              setSelectedId(blank.id);
              setDraft(blank);
            }}
          >
            Create Template
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <Card title="Template List">
            <div className="space-y-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className={`w-full rounded-xl border p-4 text-left ${
                    selectedId === template.id
                      ? "border-[#fcb61f]/30 bg-[#fcb61f]/10"
                      : "border-[#013144]/12 bg-[#013144]/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#013144]">{template.name}</p>
                      <p className="mt-1 text-sm text-[#013144]/50">{template.subject}</p>
                      <p className="mt-2 text-xs text-[#013144]/40">
                        Updated {template.updatedAt} • {template.createdBy}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="h-9 px-3 text-xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          selectTemplate(template);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-9 px-3 text-xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          deleteTemplate(template.id);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="xl:col-span-7">
          <Card
            title={isCreating ? "Create Template" : "Template Editor"}
            description="Use placeholders to personalize messages before saving."
          >
            <div className="grid grid-cols-1 gap-4">
              <input
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Template name"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none placeholder:text-[#013144]/35"
              />
              <input
                value={draft.subject}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, subject: event.target.value }))
                }
                placeholder="Subject"
                className="h-11 rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 text-sm text-[#013144] outline-none placeholder:text-[#013144]/35"
              />

              <div className="flex flex-wrap gap-2">
                {["{{name}}", "{{companyName}}", "{{email}}", "{{phone}}", "{{jobTitle}}"].map(
                  (item) => (
                    <button
                      key={item}
                      onClick={() =>
                        setDraft((current) => ({
                          ...current,
                          body: current.body ? `${current.body} ${item}` : item,
                        }))
                      }
                      className="inline-flex whitespace-nowrap rounded-full border border-[#fcb61f]/30 bg-[#fcb61f]/10 px-3 py-1 text-xs text-[#fcb61f]"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>

              <textarea
                rows={12}
                value={draft.body}
                onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))}
                placeholder="Template body"
                className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 py-3 text-sm text-[#013144] outline-none placeholder:text-[#013144]/35"
              />

              <div className="rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] p-4">
                <p className="text-xs uppercase tracking-wide text-[#013144]/45">Preview</p>
                <p className="mt-3 font-medium text-[#013144]">{draft.subject || "Subject preview"}</p>
                <pre className="mt-3 whitespace-pre-wrap text-sm text-[#013144]/70">{draft.body || "Body preview"}</pre>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    const fallback = templates[0] ?? createBlankTemplate();
                    setSelectedId(fallback.id);
                    setDraft(fallback);
                  }}
                >
                  Reset
                </Button>
                <Button onClick={saveTemplate}>Save Template</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

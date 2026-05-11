import { useMemo, useState } from "react";
import Button from "../components/ui/Button";
import { leadApi } from "../lib/api";
import type { CreatePublicLeadInput } from "../types/api";

type PublicLeadForm = {
  name: string;
  phone: string;
  email: string;
  projectDetails: string;
};

const DEFAULT_SOURCE = "GOOGLE_ADS";
const MAX_TRACKING_URL_LENGTH = 255;

export default function PublicLeadCapturePage() {
  const [form, setForm] = useState<PublicLeadForm>({
    name: "",
    phone: "",
    email: "",
    projectDetails: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const trackingPayload = useMemo(() => getTrackingPayload(), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload: CreatePublicLeadInput = {
        ...form,
        ...trackingPayload,
      };
      const response = await leadApi.createPublic(payload);
      setSubmittedLeadId(response.data.id);
      setForm({
        name: "",
        phone: "",
        email: "",
        projectDetails: "",
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to submit your request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(252,182,31,0.18),_transparent_36%),linear-gradient(180deg,_#fffaf0_0%,_#ffffff_42%,_#f4f8fa_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <section className="rounded-[28px] border border-[#013144]/10 bg-white p-6 shadow-[0_24px_70px_rgba(1,49,68,0.1)] sm:p-8 lg:p-10">
          <p className="inline-flex rounded-full border border-[#fcb61f]/40 bg-[#fcb61f]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#8f5f00]">
            Get In Touch
          </p>
          <h1 className="mt-5 text-3xl font-semibold leading-tight text-[#013144] sm:text-4xl">
            Tell us about your CRM or lead management requirement.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#013144]/65 sm:text-base">
            Share your details below and our team will reach out to discuss the right next step.
          </p>

          {submittedLeadId ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Your request was submitted successfully. Lead ID: {submittedLeadId}.
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" htmlFor="public-name">
                <input
                  id="public-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your full name"
                  className="h-12 w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.035] px-4 text-sm text-[#013144] outline-none"
                  required
                />
              </Field>

              <Field label="Phone" htmlFor="public-phone">
                <input
                  id="public-phone"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="+1 555 000 1111"
                  className="h-12 w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.035] px-4 text-sm text-[#013144] outline-none"
                  required
                />
              </Field>
            </div>

            <Field label="Email" htmlFor="public-email">
              <input
                id="public-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@company.com"
                className="h-12 w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.035] px-4 text-sm text-[#013144] outline-none"
                required
              />
            </Field>

            <Field label="Project details" htmlFor="public-project-details">
              <textarea
                id="public-project-details"
                value={form.projectDetails}
                onChange={(event) =>
                  setForm((current) => ({ ...current, projectDetails: event.target.value }))
                }
                placeholder="Tell us what you need, your team size, and the workflow you want to improve."
                rows={6}
                className="w-full rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.035] px-4 py-3 text-sm text-[#013144] outline-none"
                required
              />
            </Field>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>

            <p className="text-center text-xs leading-5 text-[#013144]/50 max-w-sm mx-auto">
              By submitting this form, you agree to our Privacy Policy and consent to be contacted about our services.
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#013144]/55">
        {label}
      </span>
      {children}
    </label>
  );
}

function getTrackingPayload(): Required<
  Pick<
    CreatePublicLeadInput,
    | "source"
    | "sourceLabel"
    | "campaign"
    | "medium"
    | "channel"
    | "pageUrl"
    | "referrerUrl"
    | "gclid"
    | "utmSource"
    | "utmMedium"
    | "utmCampaign"
    | "utmTerm"
    | "utmContent"
  >
> {
  if (typeof window === "undefined") {
    return {
      source: DEFAULT_SOURCE,
      sourceLabel: "",
      campaign: "",
      medium: "",
      channel: "",
      pageUrl: "",
      referrerUrl: "",
      gclid: "",
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmTerm: "",
      utmContent: "",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const currentUrl = toStoredUrl(window.location.href, true);
  const referrer = document.referrer || "";

  return {
    source: readParam(params, ["source"]) || DEFAULT_SOURCE,
    sourceLabel:
      readParam(params, ["sourceLabel", "source_label"]) ||
      (readParam(params, ["source"]) === DEFAULT_SOURCE ? "Google Ads" : ""),
    campaign: readParam(params, ["campaign"]) || "",
    medium: readParam(params, ["medium"]) || "",
    channel: readParam(params, ["channel"]) || "",
    pageUrl: toStoredUrl(readParam(params, ["pageUrl", "page_url"]) || currentUrl, true),
    referrerUrl: toStoredUrl(readParam(params, ["referrerUrl", "referrer_url"]) || referrer),
    gclid: readParam(params, ["gclid"]) || "",
    utmSource: readParam(params, ["utmSource", "utm_source"]) || "",
    utmMedium: readParam(params, ["utmMedium", "utm_medium"]) || "",
    utmCampaign: readParam(params, ["utmCampaign", "utm_campaign"]) || "",
    utmTerm: readParam(params, ["utmTerm", "utm_term"]) || "",
    utmContent: readParam(params, ["utmContent", "utm_content"]) || "",
  };
}

function readParam(params: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = params.get(key);
    if (value) {
      return value;
    }
  }

  return "";
}

function toStoredUrl(value: string, stripQuery = false) {
  if (!value) return "";

  try {
    const url = new URL(value);
    if (stripQuery) {
      url.search = "";
      url.hash = "";
    }

    return url.toString().slice(0, MAX_TRACKING_URL_LENGTH);
  } catch {
    return value.trim().slice(0, MAX_TRACKING_URL_LENGTH);
  }
}

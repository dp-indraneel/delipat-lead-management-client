import { useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { leadApi } from "../lib/api";
import type { CreatePublicLeadInput } from "../types/api";

type PublicLeadForm = {
  name: string;
  whatsappNumber: string;
  email: string;
  projectDetails: string;
};

const DEFAULT_SOURCE = "GOOGLE_ADS";
const MAX_TRACKING_URL_LENGTH = 255;

export default function PublicLeadCapturePage() {
  const [form, setForm] = useState<PublicLeadForm>({
    name: "",
    whatsappNumber: "",
    email: "",
    projectDetails: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const trackingPayload = useMemo(() => getTrackingPayload(), []);
  const requiredFields = [
    form.name.trim(),
    isEmailValid(form.email) ? form.email.trim() : "",
    form.projectDetails.trim(),
  ];
  const completedRequiredFields = requiredFields.filter(Boolean).length;
  const completionPercent = Math.round((completedRequiredFields / requiredFields.length) * 100);
  const canSubmit = completedRequiredFields === requiredFields.length;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload: CreatePublicLeadInput = {
        name: form.name.trim(),
        email: form.email.trim(),
        projectDetails: form.projectDetails.trim(),
        phone: form.whatsappNumber.trim(),
        whatsappNumber: form.whatsappNumber.trim() || undefined,
        ...trackingPayload,
      };
      const response = await leadApi.createPublic(payload);
      setSubmittedLeadId(response.data.id);
      setForm({
        name: "",
        whatsappNumber: "",
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
    <div className="min-h-screen bg-[linear-gradient(180deg,_#fff8e5_0%,_#ffffff_44%,_#f5f8f9_100%)] px-6 py-7 lg:px-8">
      <div className="mx-auto max-w-xl">
        <section className="">
          <div className="mb-7 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Delipat"
              className="h-12 w-auto object-contain sm:h-14"
            />
          </div>
          <p className="inline-flex rounded-md bg-[#fcb61f]/14 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f5f00]">
            Get In Touch
          </p>
          <h1 className="mt-4 text-2xl font-semibold leading-tight text-[#013144] sm:text-3xl">
            Tell us about your requirement.
          </h1>

          {submittedLeadId ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              Your request was submitted successfully.
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-[#013144]/55">
                <span>{completedRequiredFields} of {requiredFields.length} required fields ready</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#013144]/8">
                <div
                  className="h-full rounded-full bg-[#fcb61f] transition-all duration-500 ease-out"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="public-name">
                <input
                  id="public-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your full name"
                  className={inputClassName}
                  required
                />
              </Field>

              <Field label="WhatsApp no. optional" htmlFor="public-whatsapp">
                <input
                  id="public-whatsapp"
                  value={form.whatsappNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, whatsappNumber: event.target.value }))
                  }
                  placeholder="+1 555 000 2222"
                  className={inputClassName}
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
                className={inputClassName}
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
                rows={5}
                className={`${inputClassName} min-h-32 resize-y py-3`}
                required
              />
            </Field>

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className={`group relative flex h-11 w-full items-center justify-between overflow-hidden rounded-lg px-4 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed ${
                canSubmit
                  ? "cursor-pointer bg-[#013144] text-white before:absolute before:inset-y-0 before:-left-1/3 before:w-1/3 before:skew-x-[-18deg] before:bg-white/25 before:transition-transform before:duration-700 before:ease-out before:content-[''] hover:bg-[#02455f] hover:before:translate-x-[430%]"
                  : "bg-[#013144]/8 text-[#013144]/38"
              }`}
            >
              <span>{submitting ? "Submitting..." : canSubmit ? "Submit Request" : "Complete required fields"}</span>
              <span
                className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
                  canSubmit ? "bg-[#fcb61f] text-[#013144] group-hover:translate-x-0.5" : "bg-white/70 text-[#013144]/35"
                }`}
              >
                {submittedLeadId && !submitting ? <Check size={16} /> : <ArrowRight size={16} />}
              </span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

const inputClassName =
  "h-11 w-full rounded-lg border border-[#013144]/10 bg-[#013144]/[0.025] px-3 text-sm text-[#013144] outline-none transition placeholder:text-[#013144]/35 focus:border-[#fcb61f]/70 focus:bg-white";

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
      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#013144]/55">
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

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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

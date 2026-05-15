import type { ChangeEventHandler, InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  readOnly?: boolean;
  hideLabel?: boolean;
  errors?: string[];
  wrapperClassName?: string;
}

export default function LeadInputField({
  id,
  label,
  value,
  onChange,
  readOnly = false,
  hideLabel = false,
  errors = [],
  wrapperClassName = "",
  className = "",
  ...props
}: Props) {
  const inputId = id || label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const hasError = errors.length > 0;

  return (
    <label htmlFor={inputId} className={`block min-w-0 space-y-2 ${wrapperClassName}`}>
      <span
        className={`block text-xs font-medium uppercase tracking-wide text-[#013144]/60 ${
          hideLabel ? "sr-only" : ""
        }`}
      >
        {label}
      </span>
      <input
        id={inputId}
        value={readOnly ? value || "-" : value}
        onChange={onChange}
        readOnly={readOnly}
        aria-invalid={hasError || undefined}
        className={`h-10 w-full rounded-lg border px-3 text-sm text-[#013144] outline-none ${
          hasError ? "border-red-300" : "border-[#013144]/12"
        } ${
          readOnly ? "bg-[#013144]/[0.03]" : "bg-[#013144]/[0.04]"
        } ${className}`}
        {...props}
      />
      {hasError ? (
        <div className="space-y-1">
          {errors.map((error) => (
            <p key={error} className="text-xs font-medium text-red-600">
              {error}
            </p>
          ))}
        </div>
      ) : null}
    </label>
  );
}

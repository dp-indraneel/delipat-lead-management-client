import type { ReactNode } from "react";

interface Props {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export default function Card({ title, description, children, className = "" }: Props) {
  return (
    <div className={`rounded-2xl border border-[#013144]/12 bg-white ${className}`}>
      {(title || description) && (
        <div className="border-b border-[#013144]/12 px-4 py-4 sm:px-5">
          {title ? <h3 className="text-sm font-semibold text-[#013144]">{title}</h3> : null}
          {description ? <p className="mt-1 text-xs text-[#013144]/45">{description}</p> : null}
        </div>
      )}

      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}
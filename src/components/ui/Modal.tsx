import type { ReactNode } from "react";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#013144]/35 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#013144]/12 bg-white shadow-2xl">
        <div className="shrink-0 border-b border-[#013144]/12 px-4 py-3 sm:px-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#013144]">{title}</h3>
              {description ? (
                <p className="mt-1 text-sm text-[#013144]/50">{description}</p>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="rounded-lg border border-[#013144]/12 px-3 py-2 text-sm text-[#013144]/70 hover:bg-[#013144]/[0.04]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-[#013144]/12 px-4 py-3 sm:px-5">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

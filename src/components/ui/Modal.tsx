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
      <div className="w-full max-w-3xl rounded-3xl border border-[#013144]/12 bg-white shadow-2xl">
        <div className="border-b border-[#013144]/12 px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#013144]">{title}</h3>
              {description ? (
                <p className="mt-1 text-sm text-[#013144]/50">{description}</p>
              ) : null}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl border border-[#013144]/12 px-3 py-2 text-sm text-[#013144]/70 hover:bg-[#013144]/[0.04]"
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">{children}</div>

        {footer ? (
          <div className="border-t border-[#013144]/12 px-5 py-4 sm:px-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

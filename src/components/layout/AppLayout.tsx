import type { ReactNode } from "react";

interface Props {
  sidebar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  sidebarCollapsed: boolean;
}

export default function AppLayout({
  sidebar,
  header,
  children,
  sidebarCollapsed,
}: Props) {
  const sidebarWidth = sidebarCollapsed ? "84px" : "260px";

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-white text-[#013144] lg:h-screen lg:overflow-hidden"
      style={{ ["--sidebar-width" as string]: sidebarWidth }}
    >
      {sidebar}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-[var(--sidebar-width)] lg:h-screen lg:min-h-0">
        <div
          className="z-30 lg:fixed lg:right-0 lg:top-0"
          style={{ left: "var(--sidebar-width)" }}
        >
          {header}
        </div>

        <main className="flex-1 p-3 sm:p-4 lg:mt-[81px] lg:min-h-0 lg:overflow-y-auto lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}

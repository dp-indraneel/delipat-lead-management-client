import type { ReactNode } from "react";

interface Props {
  sidebar: ReactNode;
  header: ReactNode;
  filters: ReactNode;
  table: ReactNode;
  details: ReactNode;
  sidebarCollapsed: boolean;
}

export default function LeadLayout({
  sidebar,
  header,
  filters,
  table,
  details,
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

        <main className="grid grid-cols-1 gap-4 p-3 sm:p-4 lg:mt-[81px] lg:min-h-0 lg:grid-cols-12 lg:gap-5 lg:overflow-y-auto lg:p-5">
          <section className="min-w-0 space-y-4 lg:col-span-8 xl:col-span-9">
            {filters}
            {table}
          </section>

          <aside className="min-w-0 lg:col-span-4 xl:col-span-3">
            {details}
          </aside>
        </main>
      </div>
    </div>
  );
}

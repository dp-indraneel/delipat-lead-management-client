import { Bell, Search, Plus, Menu } from "lucide-react";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenMobileSidebar: () => void;
}

export default function LeadTopbar({
  search,
  onSearchChange,
  onOpenMobileSidebar,
}: Props) {
  return (
    <header className="border-b border-[#013144]/12 bg-white/95 px-3 py-3 backdrop-blur lg:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08] lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div>
              <h2 className="text-lg font-semibold text-[#013144] mt-[10px] lg:mt-0 sm:text-xl">
              Lead Management
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[260px] lg:w-[280px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#013144]/40"
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search lead, company, owner..."
              className="h-11 w-full rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] pl-10 pr-4 text-sm text-[#013144] outline-none placeholder:text-[#013144]/35 focus:border-[#fcb61f]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#fcb61f] px-4 text-sm font-medium text-[#013144] hover:opacity-90 sm:flex-none">
              <Plus size={16} />
              Add Lead
            </button>

            <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08]">
              <Bell size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

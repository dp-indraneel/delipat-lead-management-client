import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { menu } from "../../config/menu";
import { getCurrentPath, navigateTo } from "../../lib/navigation";

interface Props {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

export default function LeadSidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: Props) {
  const currentPath = getCurrentPath();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#013144]/25 backdrop-blur-[2px] lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen border-r border-[#013144]/12 bg-white transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-[260px]
          lg:translate-x-0
          ${collapsed ? "lg:w-[84px]" : "lg:w-[260px]"}
        `}
      >
        <div className="relative flex h-16 items-center border-b border-[#013144]/12 px-4">
          <div className="flex flex-1 items-center">
            {!collapsed ? (
              <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <img src="/logoIcon.png" alt="Logo" className="h-8 w-auto object-contain" />
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="absolute -right-[18px] hidden h-9 w-9 items-center justify-center rounded-full border border-[#013144]/20 bg-white text-[#013144] shadow-md hover:bg-[#013144]/[0.08] lg:flex"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            onClick={onCloseMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#013144]/20 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="space-y-2 p-3">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <a
                key={item.label}
                href={item.path}
                onClick={(event) => {
                  event.preventDefault();
                  onCloseMobile();
                  navigateTo(item.path);
                }}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center rounded-xl px-3 py-3 text-left transition ${
                  collapsed ? "justify-center lg:w-full" : "w-full gap-3"
                } ${
                  isActive
                    ? "border border-[#fcb61f]/30 bg-[#fcb61f]/15 text-[#fcb61f]"
                    : "text-[#013144]/75 hover:bg-[#013144]/[0.04] hover:text-[#013144]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

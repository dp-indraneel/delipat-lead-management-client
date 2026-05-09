import { Bell, CheckCheck, FileSpreadsheet, LogOut, Mail, Menu, Shield, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

interface Props {
  title: string;
  subtitle?: string;
  userName?: string;
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
  actions?: ReactNode;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "lead" | "email" | "export";
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New lead added",
    message: "A new chatbot conversation created a lead directly in the pipeline.",
    time: "2 min ago",
    type: "lead",
    read: false,
  },
  {
    id: "notif-2",
    title: "Lead import completed",
    message: "Direct lead import finished successfully.",
    time: "18 min ago",
    type: "export",
    read: false,
  },
  {
    id: "notif-3",
    title: "Bulk email queued",
    message: "The email campaign is ready for backend integration.",
    time: "1 hr ago",
    type: "email",
    read: true,
  },
];

const notificationIcons = {
  lead: UserPlus,
  email: Mail,
  export: FileSpreadsheet,
};

export default function AppHeader({
  title,
  subtitle,
  userName,
  onOpenMobileSidebar,
  onLogout,
  actions,
}: Props) {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

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
            <h2 className="text-lg font-semibold text-[#013144] sm:text-xl">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-[#013144]/50">{subtitle}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}

          <div className="relative">
            <button
              onClick={() => setNotificationOpen((prev) => !prev)}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-[#013144]/12 bg-[#013144]/[0.04] text-[#013144] hover:bg-[#013144]/[0.08]"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#fcb61f]" />
              ) : null}
            </button>

            {notificationOpen ? (
              <div className="absolute right-0 top-14 z-50 w-[320px] rounded-2xl border border-[#013144]/12 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#013144]/12 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#013144]">Notifications</p>
                    <p className="text-xs text-[#013144]/45">
                      {unreadCount} unread update{unreadCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((current) =>
                        current.map((notification) => ({ ...notification, read: true }))
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs text-[#fcb61f] hover:opacity-80"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[360px] overflow-y-auto p-2">
                  {notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type];

                    return (
                      <button
                        key={notification.id}
                        onClick={() =>
                          setNotifications((current) =>
                            current.map((item) =>
                              item.id === notification.id ? { ...item, read: true } : item
                            )
                          )
                        }
                        className={`mb-2 w-full rounded-xl border p-3 text-left transition last:mb-0 ${
                          notification.read
                            ? "border-[#013144]/8 bg-[#013144]/[0.03] text-[#013144]/55"
                            : "border-[#fcb61f]/20 bg-[#fcb61f]/8 text-[#013144]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              notification.read
                                ? "bg-[#013144]/[0.04] text-[#013144]/45"
                                : "bg-[#fcb61f]/15 text-[#fcb61f]"
                            }`}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium">{notification.title}</p>
                              {!notification.read ? (
                                <span className="mt-1 h-2 w-2 rounded-full bg-[#fcb61f]" />
                              ) : null}
                            </div>
                            <p className="mt-1 text-xs text-[#013144]/50">{notification.message}</p>
                            <p className="mt-2 text-[11px] text-[#013144]/35">{notification.time}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[#013144]/12 bg-[#013144]/[0.04] px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fcb61f] text-[#013144]">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#013144]">{userName || "Authenticated User"}</p>
              <p className="text-xs text-[#013144]/50">Secure session</p>
            </div>
            <button
              onClick={onLogout}
              className="ml-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#013144]/12 bg-white text-[#013144] hover:bg-[#013144]/[0.04]"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

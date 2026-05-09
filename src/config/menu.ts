import type { LucideIcon } from "lucide-react";
import {
  Download,
  FileText,
  History,
  LayoutDashboard,
  ListChecks,
  Shield,
  Send,
  Settings,
  Upload,
  Users,
} from "lucide-react";

export interface MenuItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

export const menu: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Leads", icon: Users, path: "/leads" },
  { label: "Bulk Email", icon: Send, path: "/bulk-email" },
  { label: "Templates", icon: FileText, path: "/templates" },
  { label: "Import Leads", icon: Upload, path: "/imports" },
  { label: "Export Leads", icon: Download, path: "/exports" },
  { label: "Activity Logs", icon: History, path: "/activity-logs" },
  { label: "Assignments", icon: ListChecks, path: "/assignments" },
  { label: "Users & Roles", icon: Shield, path: "/users-roles" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

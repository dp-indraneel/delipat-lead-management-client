import { useEffect, useMemo, useState, type ReactNode } from "react";
import AppHeader from "./components/app-shell/AppHeader";
import AppSidebar from "./components/app-shell/AppSidebar";
import AppLayout from "./components/layout/AppLayout";
import { useAuth } from "./context/AuthContext";
import { getCurrentPath, navigateTo, onNavigation } from "./lib/navigation";
import DashboardPage from "./pages/DashboardPage";
import BulkEmailPage from "./pages/BulkEmailPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import CreateLeadPage from "./pages/CreateLeadPage";
import EditLeadPage from "./pages/EditLeadPage";
import ExportLeadsPage from "./pages/ExportLeadsPage";
import ImportLeadsPage from "./pages/ImportLeadsPage";
import LeadAssignmentsPage from "./pages/LeadAssignmentsPage";
import LeadDetailPage from "./pages/LeadDetailPage";
import LeadListPage from "./pages/LeadListPage";
import LoginPage from "./pages/LoginPage";
import PendingApiPage from "./pages/PendingApiPage";
import SettingsPage from "./pages/SettingsPage";
import TemplatesPage from "./pages/TemplatesPage";
import UsersRolesPage from "./pages/UsersRolesPage";

function Shell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { logout, user } = useAuth();

  return (
    <AppLayout
      sidebarCollapsed={sidebarCollapsed}
      sidebar={
        <AppSidebar
          collapsed={sidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      }
      header={
        <AppHeader
          title={title}
          subtitle={subtitle}
          userName={user?.name}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onLogout={() => {
            logout();
            navigateTo("/login", { replace: true });
          }}
        />
      }
    >
      {children}
    </AppLayout>
  );
}

export default function App() {
  const { isAuthenticated, isBootstrapping, login } = useAuth();
  const [path, setPath] = useState(() => getCurrentPath());

  useEffect(() => {
    return onNavigation(() => {
      setPath(getCurrentPath());
    });
  }, []);

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (!isAuthenticated && path !== "/login") {
      navigateTo("/login", { replace: true });
      return;
    }

    if (isAuthenticated && (path === "/" || path === "/login")) {
      navigateTo("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isBootstrapping, path]);

  const page = useMemo(() => {
    const leadDetailMatch = path.match(/^\/leads\/(\d+)$/);
    const leadEditMatch = path.match(/^\/leads\/(\d+)\/edit$/);

    if (!isAuthenticated) {
      return (
        <LoginPage
          onLogin={async (email, password) => {
            await login(email, password);
            navigateTo("/dashboard", { replace: true });
          }}
        />
      );
    }

    switch (path) {
      case "/dashboard":
        return (
          <Shell title="Dashboard" subtitle="Live backend-connected overview">
            <DashboardPage />
          </Shell>
        );
      case "/leads":
        return (
          <Shell title="Leads" subtitle="Manage converted and manual leads">
            <LeadListPage />
          </Shell>
        );
      case "/leads/create":
        return (
          <Shell title="Create Lead" subtitle="Add a new lead directly into the pipeline">
            <CreateLeadPage />
          </Shell>
        );
      case "/assignments":
        return (
          <Shell title="Assignments" subtitle="Track lead assignment workflow">
            <LeadAssignmentsPage />
          </Shell>
        );
      case "/bulk-email":
        return (
          <Shell title="Bulk Email" subtitle="Existing UI kept in place until backend API is shared">
            <BulkEmailPage />
          </Shell>
        );
      case "/templates":
        return (
          <Shell title="Templates" subtitle="Existing UI kept in place until backend API is shared">
            <TemplatesPage />
          </Shell>
        );
      case "/imports":
        return (
          <Shell title="Import Leads" subtitle="Existing UI kept in place while import UX evolves">
            <ImportLeadsPage />
          </Shell>
        );
      case "/exports":
        return (
          <Shell title="Export Leads" subtitle="UI restored and connected to lead export endpoints">
            <ExportLeadsPage />
          </Shell>
        );
      case "/activity-logs":
        return (
          <Shell title="Activity Logs" subtitle="Existing UI kept in place until backend API is shared">
            <ActivityLogsPage />
          </Shell>
        );
      case "/users-roles":
        return (
          <Shell title="Users & Roles" subtitle="User management and permissions">
            <UsersRolesPage />
          </Shell>
        );
      case "/settings":
        return (
          <Shell title="Settings" subtitle="Waiting for backend API">
            <SettingsPage />
          </Shell>
        );
      default:
        if (leadEditMatch) {
          return (
            <Shell title="Edit Lead" subtitle="Update an existing lead record">
              <EditLeadPage leadId={Number(leadEditMatch[1])} />
            </Shell>
          );
        }

        if (leadDetailMatch) {
          return (
            <Shell title="Lead Detail" subtitle="Review the selected lead">
              <LeadDetailPage leadId={Number(leadDetailMatch[1])} />
            </Shell>
          );
        }

        return (
          <Shell title="Not Found" subtitle="This route does not exist">
            <PendingApiPage
              title="Page not found"
              description="The route you opened does not exist in the current app."
            />
          </Shell>
        );
    }
  }, [isAuthenticated, login, path]);

  return page;
}

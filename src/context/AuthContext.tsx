import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../lib/api";
import { clearAuthToken, getAuthToken, setAuthToken } from "../lib/cookies";
import type { AuthUser, PermissionMap } from "../types/api";

interface AuthContextValue {
  token: string;
  user: AuthUser | null;
  permissions: PermissionMap;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = "lead-management:auth-user";

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { user: AuthUser; permissions: PermissionMap };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const nextToken = getAuthToken();
    const stored = readStoredUser();
    setToken(nextToken);
    if (stored && nextToken) {
      setUser(stored.user);
      setPermissions(stored.permissions);
    }
    setIsBootstrapping(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      permissions,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      async login(email: string, password: string) {
        const response = await authApi.login(email, password);
        setAuthToken(response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        setPermissions(response.data.permissions);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              user: response.data.user,
              permissions: response.data.permissions,
            })
          );
        }
      },
      logout() {
        clearAuthToken();
        setToken("");
        setUser(null);
        setPermissions({});
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      },
    }),
    [isBootstrapping, permissions, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

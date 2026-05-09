const NAVIGATION_EVENT = "app:navigate";

export function normalizePath(path: string) {
  if (!path) {
    return "/";
  }

  if (path !== "/" && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

export function getCurrentPath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return normalizePath(window.location.pathname);
}

export function navigateTo(path: string, options?: { replace?: boolean }) {
  if (typeof window === "undefined") {
    return;
  }

  const nextPath = normalizePath(path);
  const currentPath = getCurrentPath();

  if (options?.replace) {
    window.history.replaceState({}, "", nextPath);
  } else if (nextPath !== currentPath) {
    window.history.pushState({}, "", nextPath);
  }

  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

export function onNavigation(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(NAVIGATION_EVENT, callback);

  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(NAVIGATION_EVENT, callback);
  };
}

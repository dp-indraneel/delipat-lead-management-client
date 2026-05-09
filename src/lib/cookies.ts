const TOKEN_COOKIE = "lead_management_token";

function isSecureContext() {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

export function setAuthToken(token: string) {
  if (typeof document === "undefined") {
    return;
  }

  const parts = [
    `${TOKEN_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "SameSite=Strict",
    `Max-Age=${60 * 60 * 24}`,
  ];

  if (isSecureContext()) {
    parts.push("Secure");
  }

  document.cookie = parts.join("; ");
}

export function getAuthToken() {
  if (typeof document === "undefined") {
    return "";
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${TOKEN_COOKIE}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : "";
}

export function clearAuthToken() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Strict`;
}

import { useEffect, useState } from "react";

export type RcStatus =
  | "idle"
  | "logged-in"
  | "logged-out"
  | "calling"
  | "ringing"
  | "connected"
  | "ended";

export function useRingCentralState() {
  const [status, setStatus] = useState<RcStatus>("idle");

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      switch (data.type) {
        case "rc-login-status-notify":
          setStatus(data.loggedIn ? "logged-in" : "logged-out");
          break;
        case "rc-call-init-notify":
          setStatus("calling");
          break;
        case "rc-call-ring-notify":
          setStatus("ringing");
          break;
        case "rc-call-start-notify":
          setStatus("connected");
          break;
        case "rc-call-end-notify":
          setStatus("ended");
          break;
        default:
          break;
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return { status };
}
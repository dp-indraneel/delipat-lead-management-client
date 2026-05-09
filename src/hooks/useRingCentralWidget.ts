import { useEffect } from "react";

export function useRingCentralWidget(clientId: string) {
  useEffect(() => {
    if (!clientId) return;

    const scriptId = "rc-embeddable-adapter-script";
    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://apps.ringcentral.com/integration/ringcentral-embeddable/latest/adapter.js?clientId=${encodeURIComponent(
      clientId
    )}`;
    script.async = true;
    document.body.appendChild(script);
  }, [clientId]);
}
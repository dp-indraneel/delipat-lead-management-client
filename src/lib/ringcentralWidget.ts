function getWidgetFrame(): HTMLIFrameElement | null {
  return document.querySelector("#rc-widget-adapter-frame");
}

function postToWidget(payload: Record<string, unknown>) {
  const frame = getWidgetFrame();
  if (!frame?.contentWindow) return false;
  frame.contentWindow.postMessage(payload, "*");
  return true;
}

export const ringCentralWidget = {
  login() {
    postToWidget({ type: "rc-adapter-login" });
  },

  logout() {
    postToWidget({ type: "rc-adapter-logout" });
  },

  openDialerPage() {
    postToWidget({
      type: "rc-adapter-navigate-to",
      path: "/dialer",
    });
  },

  clickToCall(phoneNumber: string) {
    postToWidget({
      type: "rc-adapter-new-call",
      phoneNumber,
      toCall: true,
    });
  },
};
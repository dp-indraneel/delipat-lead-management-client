(function () {
  const SCRIPT_NAME = "delipat-chatbot-widget";
  const DEFAULT_WELCOME_MESSAGE =
    "Welcome to Delipat, your lead management support team. How can we help you today?";
  const LEGACY_WELCOME_MESSAGES = ["Hi! How can we help you today?"];

  if (window.DelipatChatbot) {
    return;
  }

  const DEFAULTS = {
    title: "Chat Support",
    subtitle: "We typically reply in a few moments.",
    welcomeMessage: DEFAULT_WELCOME_MESSAGE,
    placeholder: "Type your message...",
    buttonLabel: "Chat",
    primaryColor: "#013144",
    accentColor: "#fcb61f",
    textColor: "#0f172a",
    position: "right",
    webhookUrl: "",
    webhookMethod: "POST",
    webhookHeaders: {},
    storageKey: "delipat-chatbot-history",
    maxMessages: 50,
    zIndex: 2147483000,
    siteName: window.location.hostname,
  };

  let state = {
    open: false,
    mounted: false,
    config: { ...DEFAULTS },
    elements: null,
    messages: [],
    leadId: null,
    waitingForReply: false,
  };

  function compactConfig(config) {
    return Object.fromEntries(
      Object.entries(config).filter(([, value]) => value !== undefined && value !== null),
    );
  }

  function getCurrentScript() {
    return (
      document.currentScript ||
      document.querySelector(`script[data-${SCRIPT_NAME}]`) ||
      document.querySelector('script[src*="chatbot-widget.js"]')
    );
  }

  function readDatasetConfig(script) {
    if (!script) {
      return {};
    }

    return {
      title: script.dataset.title,
      subtitle: script.dataset.subtitle,
      welcomeMessage: script.dataset.welcomeMessage,
      placeholder: script.dataset.placeholder,
      buttonLabel: script.dataset.buttonLabel,
      primaryColor: script.dataset.primaryColor,
      accentColor: script.dataset.accentColor,
      position: script.dataset.position,
      webhookUrl: script.dataset.webhookUrl,
    };
  }

  function loadMessages(storageKey) {
    try {
      const raw = window.sessionStorage.getItem(storageKey);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveMessages() {
    try {
      window.sessionStorage.setItem(
        state.config.storageKey,
        JSON.stringify(state.messages.slice(-state.config.maxMessages)),
      );
    } catch {
      return;
    }
  }

  function loadLeadId(storageKey) {
    try {
      const raw = window.sessionStorage.getItem(`${storageKey}:lead-id`);
      const parsed = Number(raw);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
    } catch {
      return null;
    }
  }

  function saveLeadId(leadId) {
    try {
      if (leadId) {
        window.sessionStorage.setItem(`${state.config.storageKey}:lead-id`, String(leadId));
      }
    } catch {
      return;
    }
  }

  function createMessage(role, text) {
    return {
      id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      text,
      createdAt: new Date().toISOString(),
    };
  }

  function ensureWelcomeMessage() {
    if (state.messages.length === 0) {
      state.messages = [createMessage("bot", state.config.welcomeMessage)];
      saveMessages();
      return;
    }

    const firstMessage = state.messages[0];

    if (
      firstMessage &&
      firstMessage.role === "bot" &&
      LEGACY_WELCOME_MESSAGES.includes(firstMessage.text)
    ) {
      state.messages = [
        {
          ...firstMessage,
          text: state.config.welcomeMessage,
        },
        ...state.messages.slice(1),
      ];
      saveMessages();
    }
  }

  function getReplyFromPayload(payload) {
    if (!payload) {
      return "";
    }

    if (typeof payload === "string") {
      return payload;
    }

    const candidates = [
      payload.reply,
      payload.data && payload.data.reply,
      payload.data && payload.data.message,
      payload.data && payload.data.text,
      payload.message,
      payload.text,
      payload.answer,
      payload.response,
    ];

    return candidates.find((value) => typeof value === "string" && value.trim()) || "";
  }

  function getLeadIdFromPayload(payload) {
    const value = payload && (payload.leadId || (payload.data && payload.data.leadId));
    const leadId = Number(value);
    return Number.isInteger(leadId) && leadId > 0 ? leadId : null;
  }

  function injectStyles() {
    if (document.getElementById(`${SCRIPT_NAME}-styles`)) {
      return;
    }

    const style = document.createElement("style");
    style.id = `${SCRIPT_NAME}-styles`;
    style.textContent = `
      .${SCRIPT_NAME}-root {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: var(--chatbot-z-index);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--chatbot-text-color);
      }

      .${SCRIPT_NAME}-root *,
      .${SCRIPT_NAME}-root *::before,
      .${SCRIPT_NAME}-root *::after {
        box-sizing: border-box;
      }

      .${SCRIPT_NAME}-root[data-position="left"] {
        left: 24px;
        right: auto;
      }

      .${SCRIPT_NAME}-launcher {
        align-items: center;
        background: var(--chatbot-primary-color);
        border: 0;
        border-radius: 999px;
        box-shadow: 0 16px 38px rgba(1, 49, 68, 0.28);
        color: #ffffff;
        cursor: pointer;
        display: inline-flex;
        gap: 10px;
        padding: 12px 16px 12px 12px;
        transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
      }

      .${SCRIPT_NAME}-launcher:hover {
        box-shadow: 0 20px 48px rgba(1, 49, 68, 0.34);
        transform: translateY(-1px);
      }

      .${SCRIPT_NAME}-launcher-icon {
        align-items: center;
        background: rgba(255, 255, 255, 0.14);
        border-radius: 999px;
        display: inline-flex;
        font-size: 16px;
        font-weight: 800;
        height: 34px;
        justify-content: center;
        width: 34px;
      }

      .${SCRIPT_NAME}-launcher-icon svg {
        display: block;
      }

      .${SCRIPT_NAME}-panel {
        background: #ffffff;
        border: 1px solid rgba(1, 49, 68, 0.12);
        border-radius: 20px;
        bottom: 0;
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
        display: none;
        flex-direction: column;
        height: min(70vh, 620px);
        min-height: 420px;
        margin-bottom: 76px;
        overscroll-behavior: contain;
        overflow: hidden;
        position: absolute;
        right: 0;
        width: min(360px, calc(100vw - 24px));
      }

      .${SCRIPT_NAME}-root[data-position="left"] .${SCRIPT_NAME}-panel {
        left: 0;
        right: auto;
      }

      .${SCRIPT_NAME}-root[data-open="true"] .${SCRIPT_NAME}-panel {
        display: flex;
      }

      .${SCRIPT_NAME}-header {
        background:
          radial-gradient(circle at top right, rgba(252, 182, 31, 0.28), transparent 32%),
          var(--chatbot-primary-color);
        color: #ffffff;
        padding: 18px 18px 16px;
      }

      .${SCRIPT_NAME}-header-top {
        align-items: flex-start;
        display: flex;
        gap: 16px;
        justify-content: space-between;
      }

      .${SCRIPT_NAME}-eyebrow {
        color: rgba(255, 255, 255, 0.74);
        display: block;
        font-size: 12px;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
        text-transform: uppercase;
      }

      .${SCRIPT_NAME}-title {
        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
        margin: 0;
      }

      .${SCRIPT_NAME}-subtitle {
        color: rgba(255, 255, 255, 0.82);
        font-size: 13px;
        line-height: 1.5;
        margin: 8px 0 0;
      }

      .${SCRIPT_NAME}-close {
        align-items: center;
        border: 0;
        color: #ffffff;
        cursor: pointer;
        display: inline-flex;
        font-size: 28px;
        height: 40px;
        justify-content: center;
        line-height: 1;
        padding: 0;
        width: 40px;
      }

      .${SCRIPT_NAME}-messages {
        background:
          linear-gradient(180deg, #f7fafb, #ffffff 38%),
          #ffffff;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 12px;
        min-height: 0;
        overscroll-behavior: contain;
        overflow-y: auto;
        padding: 18px;
        scrollbar-color: rgba(1, 49, 68, 0.24) transparent;
        scrollbar-width: thin;
        touch-action: pan-y;
      }

      .${SCRIPT_NAME}-messages::-webkit-scrollbar {
        width: 8px;
      }

      .${SCRIPT_NAME}-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .${SCRIPT_NAME}-messages::-webkit-scrollbar-thumb {
        background: rgba(1, 49, 68, 0.2);
        border: 2px solid transparent;
        border-radius: 999px;
        background-clip: content-box;
      }

      .${SCRIPT_NAME}-message {
        display: flex;
      }

      .${SCRIPT_NAME}-message[data-role="user"] {
        justify-content: flex-end;
      }

      .${SCRIPT_NAME}-bubble {
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.5;
        max-width: 82%;
        padding: 12px 14px;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .${SCRIPT_NAME}-message[data-role="bot"] .${SCRIPT_NAME}-bubble {
        background: #edf3f6;
        border-bottom-left-radius: 6px;
        color: #013144;
      }

      .${SCRIPT_NAME}-message[data-role="user"] .${SCRIPT_NAME}-bubble {
        background: var(--chatbot-primary-color);
        border-bottom-right-radius: 6px;
        color: #ffffff;
      }

      .${SCRIPT_NAME}-typing-bubble {
        align-items: center;
        background: #ffffff !important;
        border: 1px solid rgba(1, 49, 68, 0.08);
        box-shadow: 0 8px 22px rgba(1, 49, 68, 0.08);
        display: inline-flex;
        min-height: 22px;
        padding: 10px 13px;
      }

      .${SCRIPT_NAME}-composer {
        background: #ffffff;
        border-top: 1px solid rgba(1, 49, 68, 0.08);
        padding: 12px;
      }

      .${SCRIPT_NAME}-composer-form {
        align-items: flex-end;
        display: flex;
        gap: 10px;
      }

      .${SCRIPT_NAME}-textarea {
        background: #f8fbfc;
        border: 1px solid rgba(1, 49, 68, 0.12);
        border-radius: 16px;
        color: var(--chatbot-text-color);
        flex: 1;
        font: inherit;
        max-height: 132px;
        min-height: 48px;
        outline: none;
        padding: 13px 14px;
        resize: vertical;
      }

      .${SCRIPT_NAME}-textarea:focus {
        border-color: var(--chatbot-accent-color);
        box-shadow: 0 0 0 3px rgba(252, 182, 31, 0.22);
      }

      .${SCRIPT_NAME}-send {
        background: var(--chatbot-accent-color);
        border: 0;
        border-radius: 14px;
        color: #013144;
        cursor: pointer;
        font-weight: 700;
        min-height: 48px;
        padding: 0 16px;
        transition: opacity 160ms ease, transform 160ms ease;
        white-space: nowrap;
      }

      .${SCRIPT_NAME}-send:disabled,
      .${SCRIPT_NAME}-textarea:disabled {
        cursor: not-allowed;
        opacity: 0.64;
      }

      .${SCRIPT_NAME}-typing-dots {
        align-items: center;
        display: inline-flex;
        gap: 6px;
        height: 18px;
        padding: 0 1px;
      }

      .${SCRIPT_NAME}-typing-dots span {
        animation: ${SCRIPT_NAME}-typing-pulse 1.15s infinite cubic-bezier(0.4, 0, 0.2, 1);
        background: linear-gradient(180deg, var(--chatbot-accent-color), #d99a0c);
        box-shadow: 0 2px 5px rgba(1, 49, 68, 0.12);
        border-radius: 999px;
        display: block;
        height: 7px;
        opacity: 0.48;
        transform-origin: center bottom;
        width: 7px;
      }

      .${SCRIPT_NAME}-typing-dots span:nth-child(2) {
        animation-delay: 140ms;
      }

      .${SCRIPT_NAME}-typing-dots span:nth-child(3) {
        animation-delay: 280ms;
      }

      @keyframes ${SCRIPT_NAME}-typing-pulse {
        0%, 70%, 100% {
          opacity: 0.42;
          transform: translateY(0) scale(0.86);
        }

        35% {
          opacity: 1;
          transform: translateY(-4px) scale(1);
        }
      }

      .${SCRIPT_NAME}-note {
        color: rgba(15, 23, 42, 0.54);
        font-size: 12px;
        line-height: 1.5;
        margin-top: 10px;
      }

      @media (max-width: 640px) {
        .${SCRIPT_NAME}-root,
        .${SCRIPT_NAME}-root[data-position="left"] {
          bottom: 0;
          left: 0;
          right: 0;
          top: 0;
          pointer-events: none;
        }

        .${SCRIPT_NAME}-launcher {
          bottom: max(16px, env(safe-area-inset-bottom));
          box-shadow: 0 14px 34px rgba(1, 49, 68, 0.3);
          pointer-events: auto;
          position: fixed;
          right: 16px;
          padding: 11px 15px 11px 11px;
        }

        .${SCRIPT_NAME}-root[data-position="left"] .${SCRIPT_NAME}-launcher {
          left: 16px;
          right: auto;
        }

        .${SCRIPT_NAME}-root[data-open="true"] .${SCRIPT_NAME}-launcher {
          opacity: 0;
          pointer-events: none;
          transform: translateY(8px);
        }

        .${SCRIPT_NAME}-panel,
        .${SCRIPT_NAME}-root[data-position="left"] .${SCRIPT_NAME}-panel {
          border-radius: 18px 18px 0 0;
          bottom: 0;
          box-shadow: 0 -18px 54px rgba(15, 23, 42, 0.22);
          height: min(720px, 92vh);
          height: min(720px, 92dvh);
          max-height: calc(100vh - 10px);
          max-height: calc(100dvh - 10px);
          min-height: 0;
          left: 0;
          margin-bottom: 0;
          pointer-events: auto;
          right: 0;
          width: 100vw;
        }

        .${SCRIPT_NAME}-header {
          padding: 14px 14px 13px;
        }

        .${SCRIPT_NAME}-header-top {
          align-items: center;
          gap: 12px;
        }

        .${SCRIPT_NAME}-eyebrow {
          font-size: 10px;
          letter-spacing: 0.06em;
          margin-bottom: 5px;
          max-width: calc(100vw - 92px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .${SCRIPT_NAME}-title {
          font-size: 17px;
          line-height: 1.25;
        }

        .${SCRIPT_NAME}-subtitle {
          font-size: 12px;
          line-height: 1.35;
          margin-top: 4px;
        }

        .${SCRIPT_NAME}-close {
          border-radius: 11px;
          flex: 0 0 auto;
          height: 38px;
          width: 38px;
        }

        .${SCRIPT_NAME}-messages {
          gap: 10px;
          padding: 14px 12px;
        }

        .${SCRIPT_NAME}-bubble {
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.45;
          max-width: 88%;
          padding: 10px 12px;
        }

        .${SCRIPT_NAME}-composer {
          padding: 10px 10px max(10px, env(safe-area-inset-bottom));
        }

        .${SCRIPT_NAME}-composer-form {
          gap: 8px;
        }

        .${SCRIPT_NAME}-textarea {
          border-radius: 14px;
          font-size: 16px;
          max-height: 104px;
          min-height: 44px;
          padding: 11px 12px;
          resize: none;
        }

        .${SCRIPT_NAME}-send {
          border-radius: 13px;
          min-height: 44px;
          min-width: 66px;
          padding: 0 13px;
        }

        .${SCRIPT_NAME}-note {
          display: none;
        }
      }

      @media (max-width: 380px) {
        .${SCRIPT_NAME}-panel,
        .${SCRIPT_NAME}-root[data-position="left"] .${SCRIPT_NAME}-panel {
          height: 94dvh;
        }

        .${SCRIPT_NAME}-subtitle {
          display: none;
        }

        .${SCRIPT_NAME}-bubble {
          max-width: 92%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function renderMessages() {
    if (!state.elements) {
      return;
    }

    state.elements.messages.innerHTML = "";

    state.messages.forEach((message) => {
      const wrapper = document.createElement("div");
      wrapper.className = `${SCRIPT_NAME}-message`;
      wrapper.dataset.role = message.role;

      const bubble = document.createElement("div");
      bubble.className = `${SCRIPT_NAME}-bubble`;
      bubble.textContent = message.text;

      wrapper.appendChild(bubble);
      state.elements.messages.appendChild(wrapper);
    });

    if (state.waitingForReply) {
      const wrapper = document.createElement("div");
      wrapper.className = `${SCRIPT_NAME}-message`;
      wrapper.dataset.role = "bot";

      const bubble = document.createElement("div");
      bubble.className = `${SCRIPT_NAME}-bubble ${SCRIPT_NAME}-typing-bubble`;
      bubble.innerHTML = `
        <span class="${SCRIPT_NAME}-typing-dots" aria-label="Typing">
          <span></span>
          <span></span>
          <span></span>
        </span>
      `;

      wrapper.appendChild(bubble);
      state.elements.messages.appendChild(wrapper);
    }

    state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
  }

  function lockScrollToMessages(panel, messages) {
    let lastTouchY = 0;
    let panelLastTouchY = 0;

    function scrollMessagesBy(deltaY) {
      messages.scrollTop += deltaY;
    }

    messages.addEventListener(
      "wheel",
      function (event) {
        const isVerticalScroll = Math.abs(event.deltaY) >= Math.abs(event.deltaX);

        if (!state.open || !isVerticalScroll) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        scrollMessagesBy(event.deltaY);
      },
      { passive: false },
    );

    panel.addEventListener(
      "wheel",
      function (event) {
        const isVerticalScroll = Math.abs(event.deltaY) >= Math.abs(event.deltaX);

        if (!state.open || !isVerticalScroll) {
          return;
        }

        event.preventDefault();
        scrollMessagesBy(event.deltaY);
      },
      { passive: false },
    );

    messages.addEventListener(
      "touchstart",
      function (event) {
        if (event.touches.length === 1) {
          lastTouchY = event.touches[0].clientY;
        }
      },
      { passive: true },
    );

    messages.addEventListener(
      "touchmove",
      function (event) {
        if (!state.open || event.touches.length !== 1) {
          return;
        }

        const nextTouchY = event.touches[0].clientY;
        const deltaY = lastTouchY - nextTouchY;
        lastTouchY = nextTouchY;

        event.preventDefault();
        event.stopPropagation();
        scrollMessagesBy(deltaY);
      },
      { passive: false },
    );

    panel.addEventListener(
      "touchstart",
      function (event) {
        if (event.touches.length === 1) {
          panelLastTouchY = event.touches[0].clientY;
        }
      },
      { passive: true },
    );

    panel.addEventListener(
      "touchmove",
      function (event) {
        if (!state.open || event.touches.length !== 1) {
          return;
        }

        const nextTouchY = event.touches[0].clientY;
        const deltaY = panelLastTouchY - nextTouchY;
        panelLastTouchY = nextTouchY;

        event.preventDefault();
        scrollMessagesBy(deltaY);
      },
      { passive: false },
    );
  }

  function setWaitingForReply(waiting) {
    state.waitingForReply = waiting;

    if (state.elements) {
      state.elements.textarea.disabled = waiting;
      state.elements.send.disabled = waiting;
      state.elements.send.textContent = "Send";
    }

    renderMessages();
  }

  function setOpen(open) {
    state.open = open;

    if (!state.elements) {
      return;
    }

    state.elements.root.dataset.open = String(open);
    state.elements.launcher.setAttribute("aria-expanded", String(open));

    if (open) {
      window.setTimeout(() => {
        if (!window.matchMedia("(max-width: 640px)").matches) {
          state.elements.textarea.focus();
        }

        state.elements.messages.scrollTop = state.elements.messages.scrollHeight;
      }, 20);
    }
  }

  function pushMessage(role, text) {
    state.messages = [...state.messages, createMessage(role, text)].slice(-state.config.maxMessages);
    saveMessages();
    renderMessages();
  }

  async function sendMessage(text) {
    pushMessage("user", text);
    setWaitingForReply(true);

    if (typeof state.config.onMessageSent === "function") {
      try {
        state.config.onMessageSent(text, [...state.messages]);
      } catch {
        // Ignore callback failures so chat delivery still continues.
      }
    }

    if (!state.config.webhookUrl) {
      setWaitingForReply(false);
      pushMessage(
        "bot",
        "Thanks! Your message has been captured. Connect a webhook URL to return a live bot reply.",
      );
      return;
    }

    try {
      const response = await window.fetch(state.config.webhookUrl, {
        method: state.config.webhookMethod,
        headers: {
          "Content-Type": "application/json",
          ...state.config.webhookHeaders,
        },
        body: JSON.stringify({
          leadId: state.leadId || undefined,
          message: text,
          messages: state.messages,
          pageUrl: window.location.href,
          siteName: state.config.siteName,
        }),
      });

      const payload = await response.json().catch(() => null);
      const reply = getReplyFromPayload(payload);
      const leadId = getLeadIdFromPayload(payload);

      if (!response.ok) {
        throw new Error(reply || `Request failed with status ${response.status}`);
      }

      if (leadId) {
        state.leadId = leadId;
        saveLeadId(leadId);
      }

      setWaitingForReply(false);
      pushMessage("bot", reply || "Thanks! We received your message.");
    } catch (error) {
      setWaitingForReply(false);
      pushMessage(
        "bot",
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your message.",
      );
    }
  }

  function buildWidget() {
    injectStyles();

    const root = document.createElement("div");
    root.className = `${SCRIPT_NAME}-root`;
    root.dataset.open = "false";
    root.dataset.position = state.config.position === "left" ? "left" : "right";
    root.style.setProperty("--chatbot-primary-color", state.config.primaryColor);
    root.style.setProperty("--chatbot-accent-color", state.config.accentColor);
    root.style.setProperty("--chatbot-text-color", state.config.textColor);
    root.style.setProperty("--chatbot-z-index", String(state.config.zIndex));

    root.innerHTML = `
      <div class="${SCRIPT_NAME}-panel" role="dialog" aria-modal="false" aria-label="${state.config.title}">
        <div class="${SCRIPT_NAME}-header">
          <div class="${SCRIPT_NAME}-header-top">
            <div>
              <h2 class="${SCRIPT_NAME}-title">${state.config.title}</h2>
              <p class="${SCRIPT_NAME}-subtitle">${state.config.subtitle}</p>
            </div>
            <button class="${SCRIPT_NAME}-close" type="button" aria-label="Close chat">&times;</button>
          </div>
        </div>
        <div class="${SCRIPT_NAME}-messages"></div>
        <div class="${SCRIPT_NAME}-composer">
          <form class="${SCRIPT_NAME}-composer-form">
            <textarea class="${SCRIPT_NAME}-textarea" rows="1" placeholder="${state.config.placeholder}"></textarea>
            <button class="${SCRIPT_NAME}-send" type="submit">Send</button>
          </form>
        </div>
      </div>
      <button class="${SCRIPT_NAME}-launcher" type="button" aria-label="${state.config.buttonLabel}" aria-expanded="false">
        <span class="${SCRIPT_NAME}-launcher-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.4 8.4 0 0 1-8.7 8.2 9.1 9.1 0 0 1-3.7-.8L3 20l1.3-4.4A8 8 0 0 1 3 11.5a8.4 8.4 0 0 1 8.7-8.2A8.4 8.4 0 0 1 21 11.5Z"></path>
            <path d="M8 10.5h8"></path>
            <path d="M8 14h5"></path>
          </svg>
        </span>
        <span>${state.config.buttonLabel}</span>
      </button>
    `;

    document.body.appendChild(root);

    const launcher = root.querySelector(`.${SCRIPT_NAME}-launcher`);
    const close = root.querySelector(`.${SCRIPT_NAME}-close`);
    const form = root.querySelector(`.${SCRIPT_NAME}-composer-form`);
    const textarea = root.querySelector(`.${SCRIPT_NAME}-textarea`);
    const send = root.querySelector(`.${SCRIPT_NAME}-send`);
    const panel = root.querySelector(`.${SCRIPT_NAME}-panel`);
    const messages = root.querySelector(`.${SCRIPT_NAME}-messages`);

    state.elements = { root, launcher, close, form, textarea, send, panel, messages };
    lockScrollToMessages(panel, messages);

    launcher.addEventListener("click", function () {
      setOpen(!state.open);
    });

    close.addEventListener("click", function () {
      setOpen(false);
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      const value = textarea.value.trim();
      if (!value || state.waitingForReply) {
        return;
      }

      textarea.value = "";
      textarea.style.height = "auto";
      await sendMessage(value);
    });

    textarea.addEventListener("input", function () {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
    });

    textarea.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.open) {
        setOpen(false);
      }
    });

    renderMessages();
  }

  function init(options) {
    const script = getCurrentScript();
    const globalConfig = window.DelipatChatbotConfig || {};

    state.config = {
      ...DEFAULTS,
      ...compactConfig(readDatasetConfig(script)),
      ...compactConfig(globalConfig),
      ...compactConfig(options || {}),
    };

    state.messages = loadMessages(state.config.storageKey);
    state.leadId = loadLeadId(state.config.storageKey);
    ensureWelcomeMessage();

    if (!state.mounted) {
      buildWidget();
      state.mounted = true;
    } else {
      state.elements.root.remove();
      buildWidget();
    }

    return window.DelipatChatbot;
  }

  function destroy() {
    if (state.elements && state.elements.root) {
      state.elements.root.remove();
    }

    state.elements = null;
    state.mounted = false;
  }

  window.DelipatChatbot = {
    init,
    open: function () {
      setOpen(true);
    },
    close: function () {
      setOpen(false);
    },
    destroy,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
    });
  } else {
    init();
  }
})();

import { formatJsonKeyValue } from "../../lib/leadForm";

type ChatSide = "user" | "ai";

interface ChatEntry {
  id: string;
  side: ChatSide;
  label: string;
  text: string;
  timestamp?: string;
}

export default function ChatTranscript({
  entries,
  constrainHeight = true,
}: {
  entries: unknown[];
  constrainHeight?: boolean;
}) {
  const messages = normalizeChatEntries(entries);

  if (!messages.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#013144]/15 bg-[#013144]/[0.03] px-4 py-5 text-sm text-[#013144]/55">
        No conversation messages found.
      </div>
    );
  }

  return (
    <div
      className={`space-y-3 rounded-2xl bg-[#f7fafb] p-3 sm:p-4 ${
        constrainHeight ? "max-h-96 overflow-auto" : "overflow-visible"
      }`}
    >
      {messages.map((message) => {
        const isUser = message.side === "user";

        return (
          <div key={message.id} className={`flex ${isUser ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[88%] sm:max-w-[72%] ${isUser ? "text-left" : "text-right"}`}>
              <div
                className={`mb-1 text-[11px] font-semibold uppercase tracking-wide ${
                  isUser ? "text-[#013144]/45" : "text-[#013144]/50"
                }`}
              >
                {message.label}
              </div>
              <div
                className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? "rounded-bl-md border border-[#013144]/10 bg-white text-[#013144]"
                    : "rounded-br-md bg-[#013144] text-white"
                }`}
              >
                {message.text}
              </div>
              {message.timestamp ? (
                <div className="mt-1 text-[11px] text-[#013144]/40">{message.timestamp}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function normalizeChatEntries(entries: unknown[]): ChatEntry[] {
  return entries
    .map((entry, index) => normalizeChatEntry(entry, index))
    .filter((entry): entry is ChatEntry => Boolean(entry));
}

function normalizeChatEntry(entry: unknown, index: number): ChatEntry | null {
  if (entry === null || entry === undefined) {
    return null;
  }

  if (typeof entry !== "object") {
    return {
      id: `message-${index}`,
      side: "user",
      label: "User",
      text: String(entry),
    };
  }

  const record = entry as Record<string, unknown>;
  const rawRole = firstString(record.sender, record.role, record.author, record.from, record.type);
  const side = getChatSide(rawRole);
  const text =
    firstString(record.message, record.text, record.content, record.reply, record.answer, record.value) ||
    formatJsonKeyValue(record, {});

  if (!text || text === "-") {
    return null;
  }

  return {
    id: firstString(record.id) || `message-${index}`,
    side,
    label: side === "user" ? "User" : "AI",
    text,
    timestamp: firstString(record.createdAt, record.timestamp, record.time, record.at),
  };
}

function firstString(...values: unknown[]) {
  const value = values.find((entry) => typeof entry === "string" && entry.trim());
  return typeof value === "string" ? value.trim() : "";
}

function getChatSide(role: string): ChatSide {
  const normalizedRole = role.toLowerCase();

  if (
    normalizedRole.includes("user") ||
    normalizedRole.includes("human") ||
    normalizedRole.includes("client") ||
    normalizedRole.includes("visitor")
  ) {
    return "user";
  }

  return "ai";
}

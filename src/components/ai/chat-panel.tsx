"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { PulseDot } from "@/components/ui/pulse-dot";

type Msg = { role: "user" | "model"; content: string };

/** Get or create a persistent session ID for this browser. */
function getSessionId(): string {
  const KEY = "sentry_session_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

const TOOL_LABELS: Record<string, string> = {
  capture_lead: "Saving your contact info...",
  notify_dan: "Notifying Dan...",
  lookup_project: "Looking up project details...",
  list_services: "Checking services...",
  check_availability: "Checking availability...",
  check_calendar: "Checking Dan's calendar...",
  book_meeting: "Scheduling a meeting...",
};

const SEED: Msg[] = [
  {
    role: "model",
    content:
      "Hey — Hey — I'm Dan's AI twin, grounded on his real projects and résumé. Ask me about Phantm, Mocha Property, my stack, rates, or timelines. What are you building?",
  },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [streaming, setStreaming] = useState(false);
  const [toolActive, setToolActive] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming, toolActive]);

  const send = useCallback(
    async (text: string) => {
      setError(null);
      setToolActive(null);
      const nextUser: Msg = { role: "user", content: text };
      const nextHistory = [...messages, nextUser];
      setMessages([...nextHistory, { role: "model", content: "" }]);
      setStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextHistory, sessionId: sessionIdRef.current }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Chat failed with status ${res.status}`);
        }
        if (!res.body) throw new Error("No response body.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let acc = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Process complete lines (newline-delimited JSON events)
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line);
              switch (event.type) {
                case "text":
                  acc += event.content;
                  setMessages((prev) => {
                    const copy = [...prev];
                    copy[copy.length - 1] = { role: "model", content: acc };
                    return copy;
                  });
                  break;
                case "tool_start":
                  setToolActive(event.tool);
                  break;
                case "tool_end":
                  setToolActive(null);
                  break;
                case "error":
                  throw new Error(event.message);
                case "done":
                  break;
              }
            } catch (parseErr) {
              // If not valid JSON, treat as raw text (backwards compat)
              acc += line;
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "model", content: acc };
                return copy;
              });
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setStreaming(false);
        setToolActive(null);
      }
    },
    [messages]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center gap-3">
        <PulseDot color="accent" />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone/60">
          Dan&rsquo;s AI agent · Gemini · grounded on the real résumé
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            role={m.role}
            content={m.content || (streaming && i === messages.length - 1 ? "…" : "")}
          />
        ))}
        {toolActive && (
          <div className="flex items-center gap-2 rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
            <span className="font-mono text-xs uppercase tracking-wider text-accent/80">
              {TOOL_LABELS[toolActive] ?? `Running ${toolActive}...`}
            </span>
          </div>
        )}
        {error && (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}
      </div>

      <div className="mt-6">
        <ChatInput onSubmit={send} disabled={streaming} />
        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-bone/40">
          Press ⏎ to send · Shift+⏎ for a new line
        </p>
      </div>
    </div>
  );
}

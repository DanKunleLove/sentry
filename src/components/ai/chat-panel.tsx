"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { PulseDot } from "@/components/ui/pulse-dot";

type Msg = { role: "user" | "model"; content: string };

const SEED: Msg[] = [
  {
    role: "model",
    content:
      "Hey — I'm Dan's AI twin, grounded on his real projects and résumé. Ask me about Phantm, Mocha Property, my stack, rates, or timelines. What are you building?",
  },
];

/** Extract a ```lead\n{...}\n``` block from a twin reply, if present. */
function extractLead(text: string): {
  lead: Record<string, unknown> | null;
  cleaned: string;
} {
  const match = text.match(/```lead\n([\s\S]*?)\n```/);
  if (!match) return { lead: null, cleaned: text };
  try {
    const lead = JSON.parse(match[1]);
    const cleaned = text.replace(match[0], "").trim();
    return { lead, cleaned };
  } catch {
    return { lead: null, cleaned: text };
  }
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>(SEED);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  const send = useCallback(
    async (text: string) => {
      setError(null);
      const nextUser: Msg = { role: "user", content: text };
      const nextHistory = [...messages, nextUser];
      setMessages([...nextHistory, { role: "model", content: "" }]);
      setStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextHistory }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            data.error ?? `Chat failed with status ${res.status}`
          );
        }
        if (!res.body) throw new Error("No response body.");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "model", content: acc };
            return copy;
          });
        }

        // After stream completes, check for lead JSON block and submit
        const { lead, cleaned } = extractLead(acc);
        if (cleaned !== acc) {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "model", content: cleaned };
            return copy;
          });
        }
        if (lead && typeof lead.email === "string") {
          try {
            await fetch("/api/lead", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...lead, source: "chat" }),
            });
          } catch (leadErr) {
            console.error("lead submit failed", leadErr);
          }
        } else {
          // Fallback: scan user messages for email if AI didn't emit lead block
          const emailRe = /[\w.+-]+@[\w.-]+\.\w{2,}/;
          const userText = nextHistory
            .filter((m) => m.role === "user")
            .map((m) => m.content)
            .join(" ");
          const emailMatch = userText.match(emailRe);
          if (emailMatch) {
            try {
              await fetch("/api/lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: emailMatch[0],
                  source: "chat-fallback",
                  intent: userText.slice(0, 500),
                }),
              });
            } catch (leadErr) {
              console.error("fallback lead submit failed", leadErr);
            }
          }
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setStreaming(false);
      }
    },
    [messages]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center gap-3">
        <PulseDot color="accent" />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone/60">
          Dan&rsquo;s AI twin · Gemini · grounded on the real résumé
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} content={m.content || (streaming && i === messages.length - 1 ? "…" : "")} />
        ))}
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

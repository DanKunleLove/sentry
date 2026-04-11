"use client";
import { cn } from "@/lib/cn";

type Props = {
  role: "user" | "model";
  content: string;
};

export function MessageBubble({ role, content }: Props) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-5 py-3 text-[15px] leading-relaxed",
          isUser
            ? "bg-accent text-ink"
            : "glass text-bone"
        )}
      >
        {content}
      </div>
    </div>
  );
}

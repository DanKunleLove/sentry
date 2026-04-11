"use client";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

type Props = {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function ChatInput({
  onSubmit,
  disabled,
  placeholder = "Ask me about Phantm, Mocha Property, my rates…",
}: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn(
        "glass-strong flex items-end gap-3 p-3",
        disabled && "opacity-70"
      )}
    >
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-base text-bone placeholder:text-bone/40 focus:outline-none"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-accent px-5 font-mono text-xs uppercase tracking-wider text-ink disabled:opacity-40"
      >
        Send ↵
      </button>
    </form>
  );
}

/**
 * Sentry AI Chat Widget
 * =====================
 * A standalone, embeddable AI chat widget powered by Google Gemini.
 * Uses Shadow DOM for complete style isolation — safe to drop into any page.
 *
 * Usage:
 *   <script
 *     src="sentry-chat.min.js"
 *     data-api-key="YOUR_GEMINI_API_KEY"
 *     data-name="AI Assistant"
 *     data-accent="#FF5B1F"
 *     data-position="right"
 *     data-greeting="Hi! I'm Dan's AI twin. Ask me anything about his work."
 *   ></script>
 *
 * Configuration (via data-* attributes on the script tag):
 *   data-api-key   — (required) Your Google Gemini API key
 *   data-name      — Bot display name (default: "AI Assistant")
 *   data-accent    — Accent color hex (default: "#FF5B1F")
 *   data-position  — "left" or "right" (default: "right")
 *   data-greeting  — Initial greeting message shown on first open
 *
 * License: MIT — Free for personal and commercial use.
 * A gift from the Sentry portfolio by Adelusi Dan Kunle.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WidgetConfig {
  apiKey: string;
  name: string;
  accent: string;
  position: "left" | "right";
  greeting: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ---------------------------------------------------------------------------
// Configuration — read data-* attributes from the embedding script tag
// ---------------------------------------------------------------------------

function readConfig(): WidgetConfig {
  // Locate our own <script> tag (the one that loaded this file)
  const scripts = document.querySelectorAll("script[data-api-key]");
  const script = scripts[scripts.length - 1] as HTMLScriptElement | null;

  const apiKey = script?.dataset.apiKey ?? "";
  if (!apiKey) {
    console.error("[SentryChat] Missing required data-api-key attribute.");
  }

  return {
    apiKey,
    name: script?.dataset.name ?? "AI Assistant",
    accent: script?.dataset.accent ?? "#FF5B1F",
    position: (script?.dataset.position as "left" | "right") ?? "right",
    greeting:
      script?.dataset.greeting ??
      "Hi there! I'm an AI assistant. How can I help you today?",
  };
}

// ---------------------------------------------------------------------------
// Styles — all CSS lives inside the Shadow DOM for full isolation
// ---------------------------------------------------------------------------

function buildStyles(config: WidgetConfig): string {
  const { accent, position } = config;
  const posLeft = position === "left";

  return /* css */ `
    /* ── Reset ─────────────────────────────────────────────────────────── */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :host {
      /* Scoped custom properties */
      --sc-ink: #0a0a0c;
      --sc-ink-2: #111114;
      --sc-ink-3: #1a1a1f;
      --sc-bone: #F5F1E8;
      --sc-bone-dim: #a8a49c;
      --sc-accent: ${accent};
      --sc-radius-panel: 20px;
      --sc-radius-bubble: 9999px;
      --sc-radius-msg: 16px;
      --sc-shadow: 0 8px 32px rgba(0,0,0,.45);
      --sc-font: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
                  Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;

      font-family: var(--sc-font);
      font-size: 15px;
      line-height: 1.5;
      color: var(--sc-bone);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ── Floating trigger bubble ────────────────────────────────────── */
    .trigger {
      position: fixed;
      bottom: 20px;
      ${posLeft ? "left: 20px" : "right: 20px"};
      z-index: 2147483646; /* just below max */
      width: 56px;
      height: 56px;
      border-radius: var(--sc-radius-bubble);
      background: var(--sc-accent);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,.35);
      transition: transform .25s cubic-bezier(.22,1,.36,1),
                  box-shadow .25s cubic-bezier(.22,1,.36,1);
      outline: none;
    }
    .trigger:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 32px rgba(0,0,0,.5);
    }
    .trigger:focus-visible {
      outline: 2px solid var(--sc-accent);
      outline-offset: 3px;
    }
    .trigger svg {
      width: 26px;
      height: 26px;
      fill: #fff;
      transition: transform .3s cubic-bezier(.22,1,.36,1);
    }
    .trigger[aria-expanded="true"] svg {
      transform: rotate(90deg) scale(.85);
    }

    /* ── Chat panel ────────────────────────────────────────────────── */
    .panel {
      position: fixed;
      bottom: 88px;
      ${posLeft ? "left: 20px" : "right: 20px"};
      z-index: 2147483646;
      width: 380px;
      max-width: calc(100vw - 32px);
      height: 540px;
      max-height: calc(100vh - 120px);
      border-radius: var(--sc-radius-panel);
      background: rgba(10, 10, 12, .82);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(245, 241, 232, .08);
      box-shadow: var(--sc-shadow),
                  inset 0 1px 0 rgba(245, 241, 232, .06);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      /* Animate open / close */
      opacity: 0;
      transform: translateY(12px) scale(.96);
      pointer-events: none;
      transition: opacity .25s cubic-bezier(.22,1,.36,1),
                  transform .25s cubic-bezier(.22,1,.36,1);
    }
    .panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Solid fallback for browsers without backdrop-filter */
    @supports not (backdrop-filter: blur(24px)) {
      .panel { background: var(--sc-ink); }
    }

    /* ── Header ────────────────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 18px;
      border-bottom: 1px solid rgba(245, 241, 232, .06);
      flex-shrink: 0;
    }
    .header-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--sc-accent);
      flex-shrink: 0;
      /* Breathing pulse animation */
      animation: pulse 2.4s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .45; }
    }
    .header-name {
      font-weight: 600;
      font-size: 14px;
      letter-spacing: .01em;
      flex: 1;
    }
    .header-close {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--sc-bone-dim);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .15s, color .15s;
    }
    .header-close:hover {
      background: rgba(245, 241, 232, .08);
      color: var(--sc-bone);
    }
    .header-close:focus-visible {
      outline: 2px solid var(--sc-accent);
      outline-offset: 2px;
    }
    .header-close svg {
      width: 16px;
      height: 16px;
    }

    /* ── Messages area ─────────────────────────────────────────────── */
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scroll-behavior: smooth;
      /* Custom scrollbar */
      scrollbar-width: thin;
      scrollbar-color: rgba(245,241,232,.12) transparent;
    }
    .messages::-webkit-scrollbar {
      width: 5px;
    }
    .messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .messages::-webkit-scrollbar-thumb {
      background: rgba(245,241,232,.12);
      border-radius: 3px;
    }

    /* ── Message bubbles ───────────────────────────────────────────── */
    .msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: var(--sc-radius-msg);
      font-size: 14px;
      line-height: 1.55;
      word-break: break-word;
      animation: msgIn .3s cubic-bezier(.22,1,.36,1) both;
    }
    @keyframes msgIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .msg.user {
      align-self: flex-end;
      background: var(--sc-accent);
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .msg.assistant {
      align-self: flex-start;
      background: var(--sc-ink-3);
      color: var(--sc-bone);
      border-bottom-left-radius: 4px;
    }

    /* Markdown-lite: basic inline formatting in assistant messages */
    .msg.assistant code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 13px;
      background: rgba(245,241,232,.07);
      padding: 1px 5px;
      border-radius: 4px;
    }
    .msg.assistant a {
      color: var(--sc-accent);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    /* Streaming cursor blink */
    .msg.assistant.streaming::after {
      content: "▍";
      animation: blink .6s steps(2) infinite;
      margin-left: 1px;
      color: var(--sc-accent);
    }
    @keyframes blink {
      50% { opacity: 0; }
    }

    /* Typing indicator (three dots) */
    .typing {
      display: flex;
      gap: 5px;
      align-self: flex-start;
      padding: 12px 18px;
      background: var(--sc-ink-3);
      border-radius: var(--sc-radius-msg);
      border-bottom-left-radius: 4px;
      animation: msgIn .3s cubic-bezier(.22,1,.36,1) both;
    }
    .typing span {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--sc-bone-dim);
      animation: typingDot 1.2s ease-in-out infinite;
    }
    .typing span:nth-child(2) { animation-delay: .15s; }
    .typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes typingDot {
      0%, 60%, 100% { opacity: .3; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-4px); }
    }

    /* ── Input area ────────────────────────────────────────────────── */
    .input-area {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid rgba(245, 241, 232, .06);
      flex-shrink: 0;
    }
    .input-area textarea {
      flex: 1;
      resize: none;
      border: none;
      outline: none;
      background: var(--sc-ink-3);
      color: var(--sc-bone);
      font-family: var(--sc-font);
      font-size: 14px;
      line-height: 1.45;
      padding: 10px 14px;
      border-radius: 12px;
      min-height: 40px;
      max-height: 120px;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .input-area textarea::-webkit-scrollbar { display: none; }
    .input-area textarea::placeholder {
      color: var(--sc-bone-dim);
    }
    .input-area textarea:focus-visible {
      box-shadow: 0 0 0 2px var(--sc-accent);
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      border: none;
      background: var(--sc-accent);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity .15s, transform .15s;
    }
    .send-btn:disabled {
      opacity: .4;
      cursor: not-allowed;
    }
    .send-btn:not(:disabled):hover {
      transform: scale(1.06);
    }
    .send-btn:focus-visible {
      outline: 2px solid var(--sc-accent);
      outline-offset: 2px;
    }
    .send-btn svg {
      width: 18px;
      height: 18px;
    }

    /* ── Powered-by footer ─────────────────────────────────────────── */
    .footer {
      text-align: center;
      padding: 6px 14px 10px;
      font-size: 11px;
      color: var(--sc-bone-dim);
      opacity: .6;
      flex-shrink: 0;
    }
    .footer a {
      color: var(--sc-bone-dim);
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }

    /* ── Mobile adjustments ────────────────────────────────────────── */
    @media (max-width: 480px) {
      .panel {
        width: calc(100vw - 16px);
        height: calc(100vh - 100px);
        bottom: 78px;
        ${posLeft ? "left: 8px" : "right: 8px"};
        border-radius: 16px;
      }
      .trigger {
        bottom: 14px;
        ${posLeft ? "left: 14px" : "right: 14px"};
        width: 50px;
        height: 50px;
      }
    }

    /* ── Reduced motion ────────────────────────────────────────────── */
    @media (prefers-reduced-motion: reduce) {
      .panel,
      .trigger,
      .trigger svg,
      .msg,
      .typing span {
        animation: none !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
}

// ---------------------------------------------------------------------------
// SVG Icons (inline, no external assets)
// ---------------------------------------------------------------------------

/** Chat bubble icon for the trigger button */
const ICON_CHAT = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" fill="currentColor"/><path d="M7 9h10v2H7zm0-3h10v2H7z" fill="currentColor"/></svg>`;

/** X / close icon */
const ICON_CLOSE = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7A1 1 0 005.7 7.11L10.59 12 5.7 16.89a1 1 0 101.41 1.41L12 13.41l4.89 4.89a1 1 0 001.41-1.41L13.41 12l4.89-4.89a1 1 0 000-1.4z" fill="currentColor"/></svg>`;

/** Send arrow icon */
const ICON_SEND = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.5-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z" fill="currentColor"/></svg>`;

// ---------------------------------------------------------------------------
// Gemini streaming API helper
// ---------------------------------------------------------------------------

/**
 * Sends a message to the Gemini API with streaming enabled.
 * Yields text chunks as they arrive from the server.
 */
async function* streamGemini(
  apiKey: string,
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  // Build the Gemini-compatible contents array
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${encodeURIComponent(apiKey)}&alt=sse`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errBody}`);
  }

  // The Gemini streaming endpoint with alt=sse returns Server-Sent Events.
  // Each event has `data: { ... }` lines with JSON payloads.
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No readable stream from Gemini response.");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete SSE lines from the buffer
    const lines = buffer.split("\n");
    // Keep the last potentially-incomplete line in the buffer
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;

      const jsonStr = trimmed.slice(5).trim();
      if (jsonStr === "[DONE]") return;

      try {
        const parsed = JSON.parse(jsonStr);
        const text =
          parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) yield text;
      } catch {
        // Malformed JSON chunk — skip silently
      }
    }
  }

  // Flush remaining buffer
  if (buffer.trim().startsWith("data:")) {
    const jsonStr = buffer.trim().slice(5).trim();
    if (jsonStr && jsonStr !== "[DONE]") {
      try {
        const parsed = JSON.parse(jsonStr);
        const text =
          parsed?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) yield text;
      } catch {
        // Ignore
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Utility: basic Markdown-to-HTML for assistant messages
// ---------------------------------------------------------------------------

/** Lightweight inline-markdown renderer (bold, italic, code, links). */
function renderMarkdown(text: string): string {
  return text
    // Escape HTML entities to prevent XSS
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Code spans (backticks)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    // Italic (*text* or _text_)
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Links [text](url)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    // Line breaks
    .replace(/\n/g, "<br>");
}

// ---------------------------------------------------------------------------
// Widget class — encapsulates all DOM and state
// ---------------------------------------------------------------------------

class SentryChatWidget {
  private config: WidgetConfig;
  private host: HTMLElement;
  private shadow: ShadowRoot;
  private messages: ChatMessage[] = [];
  private isOpen = false;
  private isStreaming = false;
  private abortController: AbortController | null = null;

  // DOM references within the shadow tree
  private panel!: HTMLElement;
  private trigger!: HTMLButtonElement;
  private messagesEl!: HTMLElement;
  private textarea!: HTMLTextAreaElement;
  private sendBtn!: HTMLButtonElement;

  constructor(config: WidgetConfig) {
    this.config = config;

    // Create the host element and attach Shadow DOM
    this.host = document.createElement("div");
    this.host.id = "sentry-chat-widget";
    this.shadow = this.host.attachShadow({ mode: "open" });

    this.buildDOM();
    this.bindEvents();
    document.body.appendChild(this.host);
  }

  // ── DOM Construction ──────────────────────────────────────────────

  private buildDOM(): void {
    const { name } = this.config;

    // Inject styles
    const styleEl = document.createElement("style");
    styleEl.textContent = buildStyles(this.config);
    this.shadow.appendChild(styleEl);

    // Trigger button (floating bubble)
    this.trigger = document.createElement("button");
    this.trigger.className = "trigger";
    this.trigger.setAttribute("aria-label", `Open ${name} chat`);
    this.trigger.setAttribute("aria-expanded", "false");
    this.trigger.innerHTML = ICON_CHAT;
    this.shadow.appendChild(this.trigger);

    // Chat panel
    this.panel = document.createElement("div");
    this.panel.className = "panel";
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-label", `${name} chat`);

    // Header
    const header = document.createElement("div");
    header.className = "header";
    header.innerHTML = `
      <span class="header-dot" aria-hidden="true"></span>
      <span class="header-name">${this.escapeHtml(name)}</span>
    `;
    const closeBtn = document.createElement("button");
    closeBtn.className = "header-close";
    closeBtn.setAttribute("aria-label", "Close chat");
    closeBtn.innerHTML = ICON_CLOSE;
    closeBtn.addEventListener("click", () => this.toggle(false));
    header.appendChild(closeBtn);
    this.panel.appendChild(header);

    // Messages container
    this.messagesEl = document.createElement("div");
    this.messagesEl.className = "messages";
    this.messagesEl.setAttribute("role", "log");
    this.messagesEl.setAttribute("aria-live", "polite");
    this.panel.appendChild(this.messagesEl);

    // Input area
    const inputArea = document.createElement("div");
    inputArea.className = "input-area";

    this.textarea = document.createElement("textarea");
    this.textarea.placeholder = "Type a message…";
    this.textarea.rows = 1;
    this.textarea.setAttribute("aria-label", "Chat message input");

    this.sendBtn = document.createElement("button");
    this.sendBtn.className = "send-btn";
    this.sendBtn.setAttribute("aria-label", "Send message");
    this.sendBtn.innerHTML = ICON_SEND;
    this.sendBtn.disabled = true;

    inputArea.appendChild(this.textarea);
    inputArea.appendChild(this.sendBtn);
    this.panel.appendChild(inputArea);

    // Powered-by footer
    const footer = document.createElement("div");
    footer.className = "footer";
    footer.innerHTML = `Powered by <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">Gemini</a>`;
    this.panel.appendChild(footer);

    this.shadow.appendChild(this.panel);
  }

  // ── Event Binding ─────────────────────────────────────────────────

  private bindEvents(): void {
    // Toggle chat panel on trigger click
    this.trigger.addEventListener("click", () => this.toggle());

    // Send on button click
    this.sendBtn.addEventListener("click", () => this.handleSend());

    // Textarea: auto-resize, Enter to send (Shift+Enter for newline)
    this.textarea.addEventListener("input", () => {
      this.autoResize();
      this.sendBtn.disabled = this.textarea.value.trim().length === 0;
    });

    this.textarea.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });

    // Escape to close panel (listen on the host element's shadow root)
    this.shadow.addEventListener("keydown", (e: Event) => {
      if ((e as KeyboardEvent).key === "Escape" && this.isOpen) {
        this.toggle(false);
        this.trigger.focus();
      }
    });

    // Also listen at document level for Escape when panel is open
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.isOpen) {
        this.toggle(false);
        this.trigger.focus();
      }
    });
  }

  // ── Panel Toggle ──────────────────────────────────────────────────

  private toggle(forceState?: boolean): void {
    this.isOpen = forceState ?? !this.isOpen;
    this.panel.classList.toggle("open", this.isOpen);
    this.trigger.setAttribute("aria-expanded", String(this.isOpen));

    if (this.isOpen) {
      // Show greeting on first open if no messages yet
      if (this.messages.length === 0 && this.config.greeting) {
        this.appendMessage("assistant", this.config.greeting);
      }
      // Focus the textarea after the transition
      requestAnimationFrame(() => this.textarea.focus());
    }
  }

  // ── Send Message ──────────────────────────────────────────────────

  private async handleSend(): Promise<void> {
    const text = this.textarea.value.trim();
    if (!text || this.isStreaming) return;

    // Validate API key
    if (!this.config.apiKey) {
      this.appendMessage(
        "assistant",
        "⚠ No API key configured. Add `data-api-key` to the widget script tag."
      );
      return;
    }

    // Add user message to UI and history
    this.appendMessage("user", text);
    this.textarea.value = "";
    this.autoResize();
    this.sendBtn.disabled = true;

    // Show typing indicator
    const typingEl = this.showTypingIndicator();

    this.isStreaming = true;
    this.abortController = new AbortController();

    // Create a placeholder bubble for the streamed response
    const assistantBubble = this.createBubble("assistant", "");
    assistantBubble.classList.add("streaming");

    try {
      // Remove typing indicator once first chunk arrives
      let typingRemoved = false;
      let fullText = "";

      for await (const chunk of streamGemini(
        this.config.apiKey,
        this.messages
      )) {
        // Remove typing dots on first chunk
        if (!typingRemoved) {
          typingEl.remove();
          typingRemoved = true;
          this.messagesEl.appendChild(assistantBubble);
        }

        fullText += chunk;
        assistantBubble.innerHTML = renderMarkdown(fullText);
        this.scrollToBottom();
      }

      // Remove the typing indicator if stream was empty
      if (!typingRemoved) {
        typingEl.remove();
        this.messagesEl.appendChild(assistantBubble);
      }

      // Finalize: remove streaming cursor, save to history
      assistantBubble.classList.remove("streaming");
      this.messages.push({ role: "assistant", content: fullText });
    } catch (err) {
      typingEl.remove();
      assistantBubble.classList.remove("streaming");

      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      assistantBubble.innerHTML = renderMarkdown(
        `⚠ Sorry, something went wrong: ${errorMsg}`
      );
      if (!assistantBubble.parentNode) {
        this.messagesEl.appendChild(assistantBubble);
      }
    } finally {
      this.isStreaming = false;
      this.abortController = null;
      this.scrollToBottom();
    }
  }

  // ── DOM Helpers ───────────────────────────────────────────────────

  /** Adds a message to the conversation and renders it. */
  private appendMessage(role: "user" | "assistant", content: string): void {
    this.messages.push({ role, content });
    const bubble = this.createBubble(role, content);
    this.messagesEl.appendChild(bubble);
    this.scrollToBottom();
  }

  /** Creates a styled message bubble element. */
  private createBubble(role: "user" | "assistant", content: string): HTMLElement {
    const el = document.createElement("div");
    el.className = `msg ${role}`;
    el.innerHTML = role === "user" ? this.escapeHtml(content) : renderMarkdown(content);
    return el;
  }

  /** Shows the animated three-dot typing indicator. */
  private showTypingIndicator(): HTMLElement {
    const el = document.createElement("div");
    el.className = "typing";
    el.setAttribute("aria-label", "Thinking…");
    el.innerHTML = "<span></span><span></span><span></span>";
    this.messagesEl.appendChild(el);
    this.scrollToBottom();
    return el;
  }

  /** Scrolls the messages area to the bottom. */
  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    });
  }

  /** Auto-resizes the textarea to fit its content (up to max-height). */
  private autoResize(): void {
    this.textarea.style.height = "auto";
    this.textarea.style.height = `${Math.min(this.textarea.scrollHeight, 120)}px`;
  }

  /** Escapes HTML to prevent injection in user-supplied text. */
  private escapeHtml(str: string): string {
    const div = document.createElement("span");
    div.textContent = str;
    return div.innerHTML;
  }
}

// ---------------------------------------------------------------------------
// Auto-initialize on DOM ready
// ---------------------------------------------------------------------------

function init(): void {
  const config = readConfig();
  new SentryChatWidget(config);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

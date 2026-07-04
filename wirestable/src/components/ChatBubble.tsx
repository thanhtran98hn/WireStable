"use client";

import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  if (message.role === "system") {
    return (
      <div className="chat-bubble chat-bubble-system">{message.content}</div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end max-w-[75%] self-end my-2 animate-fade-in">
        <span className="text-[9px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1 mr-2 font-mono">
          You
        </span>
        <div 
          className="rounded-[20px] rounded-tr-[4px] text-[14px] sm:text-[14.5px] leading-relaxed text-white shadow-lg font-medium"
          style={{
            padding: "12px 20px",
            background: "rgba(255, 255, 255, 0.06)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  // AI message or Typing indicator
  return (
    <div className="flex gap-4 items-start max-w-[85%] self-start my-3 group animate-fade-in">
      {/* Bot Avatar Icon */}
      <div 
        className="flex-shrink-0 flex items-center justify-center w-8.5 h-8.5 rounded-xl text-white shadow-md mt-0.5 transition-transform hover:scale-105 duration-200"
        style={{
          background: "linear-gradient(135deg, #ff6b4a 0%, #dc4f2c 100%)",
          boxShadow: "0 4px 12px rgba(255, 107, 74, 0.25)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
          <path d="M12 8c-4.4 0-8 2.2-8 5v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5c0-2.8-3.6-5-8-5z" />
          <circle cx="9" cy="15" r="1.5" fill="currentColor" />
          <circle cx="15" cy="15" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1 block font-mono">
          WireStable Autopilot
        </span>
        <div 
          className="text-[14px] sm:text-[15px] leading-relaxed text-[var(--color-text-primary)]"
          style={{
            wordBreak: "break-word",
          }}
        >
          {message.type === "typing" ? (
            <div className="typing-indicator py-2">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: formatAIMessage(message.content) }} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Simple markdown-like formatting for AI messages */
function formatAIMessage(text: string | undefined | null): string {
  if (!text || typeof text !== "string") return "";
  
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/`(.*?)`/g, "<code>$1</code>");
  
  // Replace markdown links with premium inline badges + external link icon
  formatted = formatted.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g,
    `<a href="$2" target="_blank" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(255,107,74,0.08)] text-[var(--color-primary)] hover:bg-[rgba(255,107,74,0.16)] transition-all font-mono text-[13px] border border-[rgba(255,107,74,0.15)] hover:no-underline hover:scale-[1.02] shadow-sm ml-1" rel="noopener noreferrer">$1 <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`
  );
  
  // Replace raw URLs not inside <a> tags
  formatted = formatted.replace(
    /(?<!href=")(?<!">)(https?:\/\/[^\s\)]+)/g,
    `<a href="$1" target="_blank" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(255,107,74,0.08)] text-[var(--color-primary)] hover:bg-[rgba(255,107,74,0.16)] transition-all font-mono text-[13px] border border-[rgba(255,107,74,0.15)] hover:no-underline hover:scale-[1.02] shadow-sm ml-1" rel="noopener noreferrer">$1 <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ml-0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>`
  );
  
  return formatted.replace(/\n/g, "<br />");
}


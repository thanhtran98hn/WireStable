"use client";

import type { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  if (message.type === "typing") {
    return (
      <div className="chat-bubble chat-bubble-ai">
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    );
  }

  if (message.role === "system") {
    return (
      <div className="chat-bubble chat-bubble-system">{message.content}</div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="chat-bubble chat-bubble-user">{message.content}</div>
    );
  }

  // AI message
  return (
    <div className="chat-bubble chat-bubble-ai">
      <div dangerouslySetInnerHTML={{ __html: formatAIMessage(message.content) }} />
    </div>
  );
}

/** Simple markdown-like formatting for AI messages */
function formatAIMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    .replace(/\n/g, "<br />");
}

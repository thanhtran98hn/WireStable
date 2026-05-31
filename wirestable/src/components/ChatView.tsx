"use client";

import { useState, useCallback, useEffect, type KeyboardEvent } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useChat } from "@/hooks/useChat";
import { useVoice } from "@/hooks/useVoice";
import { ChatBubble } from "@/components/ChatBubble";
import { ConfirmationCard } from "@/components/ConfirmationCard";
import { TxTracker } from "@/components/TxTracker";
import { ErrorExplainer } from "@/components/ErrorExplainer";
import { EmptyState } from "@/components/EmptyState";

export function ChatView() {
  const [input, setInput] = useState("");
  const { isConnected, address } = useAccount();
  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    confirmTransfer,
    cancelTransfer,
    messagesEndRef,
  } = useChat();

  const {
    isListening,
    transcript,
    error: voiceError,
    isSupported: voiceSupported,
    toggleListening,
    clearTranscript,
  } = useVoice();

  // When voice transcript updates, populate input
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // When voice stops, auto-send if we have a transcript
  useEffect(() => {
    if (!isListening && transcript) {
      handleSend(transcript);
      clearTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const handleSend = useCallback(
    async (text?: string) => {
      const msg = text || input.trim();
      if (!msg) return;
      setInput("");
      await sendMessage(msg);
    },
    [input, sendMessage]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSend(suggestion);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">
            <div className="app-logo-icon">W$</div>
            <div className="app-logo-text">
              Wire<span>Stable</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            {isConnected && (
              <div className="network-badge">
                <span className="network-dot" />
                Arc Testnet
              </div>
            )}
            <ConnectButton
              accountStatus="avatar"
              chainStatus="icon"
              showBalance={true}
            />
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="app-main">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={handleSuggestionClick} />
        ) : (
          <div className="chat-messages">
            {messages.map((msg) => {
              // Render different components based on message type
              switch (msg.type) {
                case "confirmation":
                  return (
                    <ConfirmationCard
                      key={msg.id}
                      message={msg}
                      onConfirm={confirmTransfer}
                      onCancel={cancelTransfer}
                      isSending={isSending}
                    />
                  );

                case "tx-status":
                  return <TxTracker key={msg.id} message={msg} />;

                case "error-explanation":
                  return <ErrorExplainer key={msg.id} message={msg} />;

                default:
                  return <ChatBubble key={msg.id} message={msg} />;
              }
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="chat-bubble chat-bubble-ai">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Voice error toast */}
        {voiceError && (
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              background: "var(--color-warning-bg)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.8125rem",
              color: "var(--color-warning)",
              marginBottom: "var(--space-2)",
              border: "1px solid rgba(224, 160, 48, 0.2)",
            }}
          >
            🎤 {voiceError}
          </div>
        )}

        {/* Chat Input */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            {/* Voice Button */}
            {voiceSupported && (
              <button
                className={`voice-btn ${isListening ? "recording" : ""}`}
                onClick={toggleListening}
                title={isListening ? "Stop recording" : "Start voice input"}
                id="voice-input-btn"
                type="button"
              >
                {isListening ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                )}
              </button>
            )}

            {/* Text Input */}
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? "🎤 Listening... speak your command"
                  : isConnected
                  ? 'Type "Send 100 USDC to 0x..." or ask anything...'
                  : "Connect your wallet to start sending USDC..."
              }
              rows={1}
              disabled={isLoading || isListening}
              id="chat-input"
              style={{
                overflowY: input.split("\n").length > 3 ? "auto" : "hidden",
              }}
            />

            {/* Send Button */}
            <button
              className="btn btn-primary btn-icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              title="Send message"
              id="send-message-btn"
              type="button"
            >
              {isLoading ? (
                <span className="spinner" style={{ borderTopColor: "white" }} />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12 14-7-4 7 4 7Z" />
                  <path d="M5 12h14" />
                </svg>
              )}
            </button>
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-2) 0",
              fontSize: "0.6875rem",
              color: "var(--color-text-tertiary)",
            }}
          >
            Powered by{" "}
            <a
              href="https://www.circle.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-accent)", textDecoration: "none" }}
            >
              Circle
            </a>{" "}
            &{" "}
            <a
              href="https://docs.arc.network"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--color-accent)", textDecoration: "none" }}
            >
              Arc Network
            </a>{" "}
            · USDC on Arc Testnet
            {isConnected && address && (
              <span style={{ marginLeft: "var(--space-2)" }}>
                · {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

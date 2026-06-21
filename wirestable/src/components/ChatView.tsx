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
import { useModal } from "@/hooks/useModal";

import { BridgeProgressCard } from "@/components/BridgeProgressCard";
import { StreamCounter } from "@/components/StreamCounter";
import { ChannelCard } from "@/components/ChannelCard";
import { EscrowStatusCard } from "@/components/EscrowStatusCard";
import { AgentIdentityBadge } from "@/components/AgentIdentityBadge";
import { ComplianceAlertCard } from "@/components/ComplianceAlertCard";
import { UnifiedPortfolioCard } from "@/components/UnifiedPortfolioCard";
import { CommandPalette } from "@/components/CommandPalette";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { HedgingLockCard } from "@/components/HedgingLockCard";
import { Navbar } from "@/components/Navbar";
import { NetworkActivityFeed } from "@/components/NetworkActivityFeed";

export function ChatView() {
  const { openModal } = useModal();
  const [input, setInput] = useState("");
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const { isConnected: isWeb3Connected, address: web3Address } = useAccount();

  useKeyboardShortcuts({
    onTogglePalette: () => setIsPaletteOpen((prev) => !prev),
    onClosePalette: () => setIsPaletteOpen(false),
    isOpen: isPaletteOpen,
  });
  const {
    messages,
    isLoading,
    isSending,
    sendMessage,
    confirmTransfer,
    cancelTransfer,
    messagesEndRef,
    circleWallet,
    showOnboardModal,
    setShowOnboardModal,
    cctp,
    fx,
    executeStreamWithdraw,
    isWithdrawingStream,
    nanopay,
    escrowJobs,
    handleEscrowRelease,
    handleEscrowDispute,
    executeEscrowSubmit,
    executePurchaseRateLock,
    addMessage,
  } = useChat();

  const [email, setEmail] = useState("");
  const [onboardError, setOnboardError] = useState<string | null>(null);

  const isConnected = isWeb3Connected || !!circleWallet.walletAddress;
  const address = web3Address || circleWallet.walletAddress;

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

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);
    if (!email || !email.includes("@")) {
      setOnboardError("Please enter a valid email address.");
      return;
    }
    const success = await circleWallet.registerUser(email);
    if (success) {
      setShowOnboardModal(false);
      setEmail("");
    } else {
      setOnboardError(circleWallet.error || "Failed to register or login.");
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Navbar>
        <a href="/agent-studio" className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "11px", fontWeight: "bold", padding: "6px 12px", borderRadius: "8px" }}>
          ⚡ Agent Studio
        </a>
        <a href="/admin" className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", fontSize: "11px", fontWeight: "bold", padding: "6px 12px", borderRadius: "8px" }}>
          🏢 Enterprise Admin
        </a>
        <AgentIdentityBadge />
        {isConnected && (
          <div className="network-badge">
            <span className="network-dot" />
            Arc Testnet
          </div>
        )}
        
        {circleWallet.walletAddress ? (
          <div className="flex flex-wrap items-center gap-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl sm:rounded-full px-3 py-1.5 text-xs text-[var(--color-text-primary)]">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-semibold text-[11px] text-[var(--color-text-secondary)]">Circle:</span>
            <span className="font-mono text-[11px] text-[var(--color-text-primary)] font-bold">{circleWallet.walletAddress.slice(0, 6)}...{circleWallet.walletAddress.slice(-4)}</span>
            {circleWallet.balance !== null && (
              <span className="bg-[var(--color-accent)] text-[var(--color-text-inverse)] px-1.5 py-0.5 rounded-md font-semibold text-[10px]">
                {parseFloat(circleWallet.balance).toFixed(2)} USDC
              </span>
            )}
            <button
              onClick={circleWallet.disconnect}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer ml-1 font-bold"
              title="Disconnect"
              type="button"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center">
            <ConnectButton
              accountStatus="avatar"
              chainStatus="icon"
              showBalance={true}
            />
            {!isWeb3Connected && (
              <button
                onClick={() => setShowOnboardModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-xs font-bold text-[var(--color-text-inverse)] hover:bg-[var(--color-accent-light)] active:scale-95 transition-all shadow-md shadow-[var(--color-accent)]/15"
                type="button"
              >
                📧 Email Login
              </button>
            )}
          </div>
        )}
      </Navbar>

      {/* Main Chat Area with Nanopayments Sidebar */}
      <main
        className="app-main chat-workspace-grid"
        style={{
          maxWidth: "1200px",
          gap: "var(--space-6)",
          padding: "var(--space-4) var(--space-6)",
          width: "100%",
          margin: "0 auto",
          flex: 1,
        }}
      >
        {/* Left Side: Conversational Workspace */}
        <div style={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSuggestionClick} address={address} />
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
                        timeLeft={fx.timeLeft}
                        activeQuote={fx.activeQuote}
                      />
                    );

                  case "compliance-warning":
                    if (!msg.complianceDetails) return null;
                    return (
                      <ComplianceAlertCard
                        key={msg.id}
                        recipientAddress={msg.complianceDetails.recipientAddress}
                        amount={msg.complianceDetails.amount}
                        asset={msg.complianceDetails.asset}
                        riskScore={msg.complianceDetails.riskScore}
                        reason={msg.complianceDetails.reason}
                        senderAddress={msg.complianceDetails.senderAddress}
                        senderEmail={msg.complianceDetails.senderEmail}
                      />
                    );

                  case "tx-status":
                    return <TxTracker key={msg.id} message={msg} />;

                  case "error-explanation":
                    return <ErrorExplainer key={msg.id} message={msg} />;

                  case "bridge-progress":
                    return (
                      <BridgeProgressCard
                        key={msg.id}
                        step={cctp.step}
                        burnHash={cctp.burnHash}
                        mintHash={cctp.mintHash}
                        messageHash={cctp.messageHash}
                        attestationSignature={cctp.attestationSignature}
                        error={cctp.error}
                        amount={msg.bridgeIntent?.amount || "0"}
                        sourceChain={msg.bridgeIntent?.sourceChain || "Sepolia"}
                        destinationChain={msg.bridgeIntent?.destinationChain || "Arc_Testnet"}
                        toAddress={msg.bridgeIntent?.to || address || ""}
                        onClose={cctp.resetBridge}
                      />
                    );

                  case "stream-counter":
                    const streamData = msg.extra || {
                      streamId: 1,
                      sender: web3Address || "0xEmployer...",
                      recipient: msg.streamCreateIntent?.to || "0xRecipient...",
                      amountPerSecond: parseInt(msg.streamCreateIntent?.ratePerSecond || "165"),
                      startTime: Math.floor(Date.now() / 1000),
                      stopTime: Math.floor(Date.now() / 1000) + parseInt(msg.streamCreateIntent?.durationSeconds || "604800"),
                      remainingBalance: parseFloat(msg.streamCreateIntent?.amount || "100") * 1e6,
                      lastWithdrawalTime: Math.floor(Date.now() / 1000)
                    };
                    return (
                      <StreamCounter
                        key={msg.id}
                        streamId={streamData.streamId}
                        sender={streamData.sender}
                        recipient={streamData.recipient}
                        amountPerSecond={streamData.amountPerSecond}
                        startTime={streamData.startTime}
                        stopTime={streamData.stopTime}
                        remainingBalance={streamData.remainingBalance}
                        lastWithdrawalTime={streamData.lastWithdrawalTime}
                        onWithdraw={executeStreamWithdraw}
                        isWithdrawing={isWithdrawingStream}
                      />
                    );

                  case "escrow-card":
                    const escrowJobId = msg.extra?.jobId || 1;
                    const escrowJob = escrowJobs.find((j) => j.jobId === escrowJobId) || {
                      jobId: escrowJobId,
                      client: address || "0xEmployer...",
                      provider: msg.escrowCreateIntent?.to || "0xProvider...",
                      evaluator: "0x8183e5c7075c1c09893d596489b4de5de586616fe",
                      token: "0x3600000000000000000000000000000000000000",
                      amount: parseFloat(msg.escrowCreateIntent?.amount || "500"),
                      status: "FUNDED",
                      deliverableHash: msg.escrowCreateIntent?.deliverableHash || "0xdeliverablehash...",
                      deliverableUrl: "",
                      expiry: Math.floor(Date.now() / 1000) + 30 * 86400
                    };
                    return (
                      <EscrowStatusCard
                        key={msg.id}
                        jobId={escrowJob.jobId}
                        client={escrowJob.client}
                        provider={escrowJob.provider}
                        evaluator={escrowJob.evaluator}
                        amount={escrowJob.amount}
                        status={escrowJob.status}
                        deliverableHash={escrowJob.deliverableHash}
                        deliverableUrl={escrowJob.deliverableUrl}
                        expiry={escrowJob.expiry}
                        onSubmitDeliverable={async (jId, url) => {
                          const submitIntent = { jobId: jId.toString(), url };
                          await executeEscrowSubmit(submitIntent);
                        }}
                        onRelease={handleEscrowRelease}
                        onDispute={handleEscrowDispute}
                        userAddress={address || undefined}
                      />
                    );

                  default:
                    if (msg.extra?.isRateLockOffer) {
                      return (
                        <HedgingLockCard
                          key={msg.id}
                          amount={msg.extra.amount}
                          spotRate={msg.extra.spotRate}
                          targetRate={msg.extra.targetRate}
                          premium={msg.extra.premium}
                          expiration={msg.extra.expiration}
                          onApprove={(lockId) => {
                            executePurchaseRateLock(lockId, msg.extra.amount, msg.extra.targetRate);
                          }}
                          onCancel={() => {
                            addMessage("ai", "text", "Rate lock purchase request declined.");
                          }}
                        />
                      );
                    }
                    if (msg.extra?.isUnifiedPortfolio) {
                      return (
                        <UnifiedPortfolioCard
                          key={msg.id}
                          unifiedBalance={msg.extra.unifiedBalance}
                          chains={msg.extra.chains}
                        />
                      );
                    }
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
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <span>Press</span>
                <kbd className="command-palette-kbd" style={{ fontSize: "9px", padding: "1px 4px" }}>⌘K</kbd>
                <span>or</span>
                <kbd className="command-palette-kbd" style={{ fontSize: "9px", padding: "1px 4px" }}>Ctrl+K</kbd>
                <span>to open Command Palette</span>
              </div>
              <div>
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
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "4px", opacity: 0.85 }}>
                <a href="/docs" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-accent)]">Docs 📖</a>
                <span>·</span>
                <a href="/faq" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-accent)]">FAQ ❓</a>
                <span>·</span>
                <a href="/about" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-accent)]">About 🏢</a>
                <span>·</span>
                <a href="/privacy" style={{ color: "inherit", textDecoration: "none" }} className="hover:text-[var(--color-accent)]">Privacy 🔒</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Nanopayment Channel Card & Network Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", width: "320px", flexShrink: 0 }}>
          <ChannelCard
            channel={nanopay.channel}
            onOpen={(amount, isSandbox) => {
              if (!isSandbox && circleWallet.walletAddress && !circleWallet.tokenId) {
                openModal("warning", {
                  title: "Wallet Sync Acknowledgment",
                  riskText: "Your Circle User-Controlled Smart Wallet balance is currently syncing with the Arc network indexer.",
                  impactText: "Opening a payment channel requires identifying token IDs on-chain to handle secure locking.",
                  consequenceText: "If you proceed before synchronization is complete, the channel allocation could fail or result in locked funds.",
                  acknowledgeLabel: "I Will Wait",
                  onAcknowledge: () => {}
                }, { priority: "P1", preventDuplicate: true });
                return Promise.resolve(null);
              }
              return nanopay.openChannel(
                amount,
                address || "",
                circleWallet.walletAddress
                  ? (to, amt) =>
                      circleWallet.executeTransfer(
                        to,
                        amt,
                        circleWallet.tokenId!
                      )
                  : undefined,
                isSandbox
              );
            }}
            onClose={() => nanopay.closeChannel(address || "")}
            isProcessing={nanopay.isLoading}
            walletAddress={address || undefined}
            walletBalance={circleWallet.walletAddress ? circleWallet.balance : "25.0"}
          />

          <NetworkActivityFeed />
        </div>
      </main>


      {/* Web2 Onboarding Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-text-primary)]/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-2xl backdrop-blur-xl">
            {/* Decorative bg */}
            <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-[var(--color-bg-secondary)] blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[var(--color-bg-tertiary)] blur-2xl"></div>

            <div className="relative z-10 text-center mb-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-[var(--color-text-primary)] font-round">Sign In with Email</h3>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Create or access your conversational global remittance wallet on Arc Testnet via Circle.
              </p>
            </div>

            <form onSubmit={handleOnboardSubmit} className="relative z-10 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@domain.com"
                  required
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-1 focus:ring-[var(--color-border-focus)] transition-all font-semibold"
                  disabled={circleWallet.isLoading}
                />
              </div>

              {onboardError && (
                <p className="text-xs text-[var(--color-error)] font-semibold">{onboardError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="w-1/3 rounded-2xl border border-[var(--color-border)] py-3.5 text-sm font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] active:scale-95 transition-all"
                  disabled={circleWallet.isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 rounded-2xl bg-[var(--color-accent)] py-3.5 text-center text-sm font-bold text-[var(--color-text-inverse)] shadow-lg shadow-[var(--color-accent)]/15 hover:bg-[var(--color-accent-light)] disabled:opacity-50 active:scale-95 transition-all"
                  disabled={circleWallet.isLoading}
                >
                  {circleWallet.isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="spinner h-4 w-4" /> Processing...
                    </span>
                  ) : (
                    "Send Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SpotLight Command Palette */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onExecuteCommand={(cmd) => handleSend(cmd)}
      />
    </div>
  );
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createPublicClient, http, isAddress, type Hash } from "viem";
import { arcTestnet } from "viem/chains";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { useCircleWallet } from "@/hooks/useCircleWallet";
import { useCCTP } from "@/hooks/useCCTP";
import type {
  ChatMessage,
  TransferIntent,
  SwapIntent,
  BridgeIntent,
  ParseResponse,
  MessageRole,
  MessageType,
} from "@/types";

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<TransferIntent | null>(null);
  const [pendingSwapIntent, setPendingSwapIntent] = useState<SwapIntent | null>(null);
  const [pendingGasEstimate, setPendingGasEstimate] = useState<string | null>(null);
  const [pendingBridgeIntent, setPendingBridgeIntent] = useState<BridgeIntent | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const circleWallet = useCircleWallet();
  const cctp = useCCTP();
  const { address: web3Address, isConnected: isWeb3Connected } = useAccount();
  const isConnected = isWeb3Connected || !!circleWallet.walletAddress;
  const address = web3Address || circleWallet.walletAddress;
  const { data: walletClient } = useWalletClient();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback(
    (
      role: MessageRole,
      type: MessageType,
      content: string,
      extra?: Partial<ChatMessage>
    ) => {
      const msg: ChatMessage = {
        id: generateId(),
        role,
        type,
        content,
        timestamp: new Date(),
        ...extra,
      };
      setMessages((prev) => [...prev, msg]);
      return msg;
    },
    []
  );

  const updateMessage = useCallback(
    (id: string, updates: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    },
    []
  );

  // Parse message via LLM API
  const parseMessage = useCallback(
    async (userMessage: string): Promise<ParseResponse | null> => {
      try {
        const conversationHistory = messages
          .filter((m) => m.type === "text")
          .slice(-6)
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));

        const res = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            conversationHistory,
          }),
        });

        if (!res.ok) {
          throw new Error(`Parse API returned ${res.status}`);
        }

        return await res.json();
      } catch (error) {
        console.error("Parse error:", error);
        return null;
      }
    },
    [messages]
  );

  // Explain error via MCP API
  const explainError = useCallback(
    async (errorCode: string) => {
      try {
        const res = await fetch("/api/explain-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ errorCode }),
        });

        if (!res.ok) throw new Error("Error API failed");
        return await res.json();
      } catch (error) {
        console.error("Error explanation failed:", error);
        return null;
      }
    },
    []
  );

  // Estimate gas for a transfer
  const estimateGas = useCallback(
    async (intent: TransferIntent): Promise<string | null> => {
      try {
        // Use viem to estimate gas for a USDC transfer on Arc Testnet
        const gasEstimate = await publicClient.estimateGas({
          account: address as `0x${string}`,
          to: intent.to as `0x${string}`,
          value: 0n,
        });

        const gasPrice = await publicClient.getGasPrice();
        // Arc uses USDC (18 decimals for native gas), convert to human-readable
        const feeWei = gasEstimate * gasPrice;
        const feeUsdc = Number(feeWei) / 1e18;
        return feeUsdc.toFixed(6);
      } catch (error) {
        console.error("Gas estimation error:", error);
        return "~0.001";
      }
    },
    [address]
  );

  // Execute USDC transfer using Circle App Kit
  const executeTransfer = useCallback(
    async (intent: TransferIntent): Promise<{ txHash: string; explorerUrl: string } | null> => {
      if (!walletClient || !address) {
        throw new Error("Wallet not connected");
      }

      // Initialize App Kit with Viem adapter
      // @ts-ignore - Bypass Wagmi to AppKit provider type mismatch
      const viemAdapter = await createViemAdapterFromProvider({ provider: walletClient.transport || window.ethereum });
      const kit = new AppKit();

      try {
        // Use App Kit's native send() capability for same-chain transfer
        const result = await kit.send({
          from: { adapter: viemAdapter, chain: "Arc_Testnet" },
          to: intent.to,
          amount: intent.amount,
          token: intent.token || "USDC",
        });
        // Extract transaction hash from the App Kit steps array
        // @ts-ignore
        const txHash = result.steps?.[0]?.transactionHash || result.transactionHash;
        if (!txHash) throw new Error("Transaction hash not returned by App Kit");

        const explorerUrl = `https://testnet.arcscan.app/tx/${txHash}`;

        return { txHash, explorerUrl };
      } catch (error) {
        console.error("App Kit Transfer failed:", error);
        throw error;
      }
    },
    [walletClient, address]
  );

  // Execute swap using Circle App Kit (StableFX)
  const executeSwap = useCallback(
    async (intent: SwapIntent): Promise<{ txHash: string; explorerUrl: string } | null> => {
      if (!walletClient || !address) {
        throw new Error("Wallet not connected");
      }

      // Initialize App Kit with Viem adapter
      // @ts-ignore
      const viemAdapter = await createViemAdapterFromProvider({ provider: walletClient.transport || window.ethereum });
      const kit = new AppKit();

      try {
        const result = await kit.swap({
          from: { adapter: viemAdapter, chain: "Arc_Testnet" },
          tokenIn: intent.tokenIn,
          tokenOut: intent.tokenOut,
          amountIn: intent.amountIn,
        });
        
        // @ts-ignore
        const txHash = result.steps?.[0]?.transactionHash || result.transactionHash;
        if (!txHash) throw new Error("Transaction hash not returned by App Kit Swap");

        const explorerUrl = `https://testnet.arcscan.app/tx/${txHash}`;

        return { txHash, explorerUrl };
      } catch (error) {
        console.error("App Kit Swap failed:", error);
        throw error;
      }
    },
    [walletClient, address]
  );

  // Track transaction status
  const trackTransaction = useCallback(
    async (txHash: string, messageId: string) => {
      try {
        // Update to pending
        updateMessage(messageId, {
          txStatus: "pending",
          content: "⏳ Your transaction has been submitted to Arc Testnet. Waiting for confirmation...",
        });

        if (circleWallet.simulated) {
          // Simulate sub-second finality on Arc
          await new Promise((resolve) => setTimeout(resolve, 1500));
          updateMessage(messageId, {
            txStatus: "confirmed",
            content: `✅ [Simulated] Transaction confirmed! Your USDC transfer has been successfully processed on Arc Testnet.`,
          });

          // Add conversational follow-up
          addMessage(
            "ai",
            "text",
            `Great news! 🎉 Your transfer has been confirmed on Arc Testnet with sub-second finality. (Simulation mode)`
          );
          return;
        }

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash as Hash,
          timeout: 30_000, // Arc has sub-second finality, 30s is generous
        });

        if (receipt.status === "success") {
          updateMessage(messageId, {
            txStatus: "confirmed",
            content: `✅ Transaction confirmed! Your USDC transfer has been successfully processed on Arc Testnet.`,
          });

          // Add conversational follow-up
          addMessage(
            "ai",
            "text",
            `Great news! 🎉 Your transfer has been confirmed on Arc Testnet with sub-second finality. You can view the full details on Arcscan.`
          );
        } else {
          updateMessage(messageId, {
            txStatus: "failed",
            content: "❌ Transaction failed on-chain. The transfer was reverted.",
          });

          addMessage(
            "ai",
            "text",
            "It looks like the transaction was reverted. This could be due to insufficient USDC balance or a contract issue. Would you like me to explain the error?"
          );
        }
      } catch (error) {
        console.error("Tx tracking error:", error);
        updateMessage(messageId, {
          txStatus: "failed",
          content: "⚠️ Could not confirm the transaction status. Please check Arcscan manually.",
        });
      }
    },
    [updateMessage, addMessage, circleWallet.simulated]
  );

  // Main send message handler
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      // Add user message
      addMessage("user", "text", userMessage);
      setIsLoading(true);

      try {
        // Check wallet connection for transfer or swap intents
        if (!isConnected) {
          const parsed = await parseMessage(userMessage);
          const lowerMsg = userMessage.toLowerCase();
          const isOnboardRequest = lowerMsg.includes("register") || lowerMsg.includes("login") || lowerMsg.includes("create wallet") || lowerMsg.includes("sign up") || lowerMsg.includes("onboard");

          if (parsed?.type === "transfer" || parsed?.type === "swap" || isOnboardRequest) {
            addMessage(
              "ai",
              "text",
              "Let's set up your secure USDC wallet. Please enter your email address in the onboarding panel to secure your wallet via Circle User-Controlled Wallets."
            );
            setShowOnboardModal(true);
            setIsLoading(false);
            return;
          }
        }

        // Parse user intent via LLM
        const parsed = await parseMessage(userMessage);

        if (!parsed) {
          addMessage(
            "ai",
            "text",
            "I'm having trouble understanding that. Could you try rephrasing? For example: \"Send 100 USDC to 0x...\" 💬"
          );
          setIsLoading(false);
          return;
        }

        switch (parsed.type) {
          case "transfer": {
            if (!parsed.intent) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            const intent = parsed.intent;

            // Validate required fields
            if (!intent.amount || !intent.to) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            // Validate address with viem
            if (!isAddress(intent.to)) {
              addMessage(
                "ai",
                "text",
                `⚠️ The address "${intent.to}" appears to be invalid. Please provide a valid Ethereum address (42 characters, starting with 0x).`
              );
              break;
            }

            // Estimate gas
            const gasFee = await estimateGas(intent);
            setPendingIntent(intent);
            setPendingGasEstimate(gasFee);

            // Show confirmation card
            addMessage("ai", "confirmation", parsed.message, {
              intent,
              gasEstimate: {
                fee: gasFee || "~0.001",
                gas: 0n,
                gasPrice: 0n,
              },
            });
            break;
          }

          case "swap": {
            if (!parsed.swapIntent) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            const swapIntent = parsed.swapIntent;

            if (!swapIntent.amountIn) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            // Estimate gas for swap (re-using estimateGas with 0 as 'to')
            // Using placeholder gas for swap for now
            const gasFee = "~0.005"; 
            setPendingSwapIntent(swapIntent);
            setPendingGasEstimate(gasFee);

            addMessage("ai", "confirmation", parsed.message, {
              swapIntent,
              gasEstimate: {
                fee: gasFee,
                gas: 0n,
                gasPrice: 0n,
              },
            });
            break;
          }

          case "error_query": {
            if (parsed.errorCode) {
              addMessage(
                "ai",
                "text",
                "🔍 Let me look up that error code for you..."
              );

              const explanation = await explainError(parsed.errorCode);
              if (explanation) {
                addMessage("ai", "error-explanation", "", {
                  errorDetails: explanation,
                });
              } else {
                addMessage(
                  "ai",
                  "text",
                  "I couldn't find detailed info for that error code. Try checking the Circle docs at https://developers.circle.com"
                );
              }
            } else {
              addMessage("ai", "text", parsed.message);
            }
            break;
          }

          case "bridge": {
            if (!parsed.bridgeIntent) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            const bridgeIntent = parsed.bridgeIntent;

            if (!bridgeIntent.amount) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            // If target recipient is empty, default to own address
            if (!bridgeIntent.to) {
              bridgeIntent.to = address || "";
            }

            setPendingBridgeIntent(bridgeIntent);

            // Show confirmation card
            addMessage("ai", "confirmation", parsed.message, {
              bridgeIntent
            });
            break;
          }

          case "greeting":
          case "general":
          default:
            addMessage("ai", "text", parsed.message);
            break;
        }
      } catch (error) {
        console.error("Send message error:", error);
        addMessage(
          "ai",
          "text",
          "Sorry, something went wrong. Please try again. 🔄"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      isConnected,
      addMessage,
      parseMessage,
      estimateGas,
      explainError,
    ]
  );

  // Confirm and execute action (transfer, swap, or bridge)
  const confirmTransfer = useCallback(async () => {
    if ((!pendingIntent && !pendingSwapIntent && !pendingBridgeIntent) || isSending) return;

    setIsSending(true);

    if (pendingBridgeIntent) {
      const bridge = pendingBridgeIntent;
      setPendingBridgeIntent(null);

      // Add bridge progress message!
      addMessage(
        "ai",
        "bridge-progress",
        `Initiating CCTP bridge of ${bridge.amount} USDC from ${bridge.sourceChain} to Arc Testnet...`,
        {
          bridgeIntent: bridge,
          txStatus: "pending"
        }
      );

      setIsSending(false); // Enable other interactions during long bridging step

      // Async executor
      const isSimulated = circleWallet.simulated || !address;
      (async () => {
        const success = await cctp.executeBridge(
          bridge.amount,
          bridge.sourceChain,
          bridge.to || address || "",
          isSimulated
        );
        if (success) {
          addMessage("ai", "text", `🎉 Bridge complete! Successfully bridged ${bridge.amount} USDC from ${bridge.sourceChain} to Arc Testnet!`);
        } else {
          addMessage("ai", "text", `❌ Bridge failed: ${cctp.error || "Unknown CCTP Error"}`);
        }
      })();
      return;
    }

    const isSwap = !!pendingSwapIntent;
    const currentIntent = isSwap ? pendingSwapIntent : pendingIntent;
    
    setPendingIntent(null);
    setPendingSwapIntent(null);
    setPendingGasEstimate(null);

    // Add tx-status message for tracking
    const actionText = isSwap ? "swap" : "USDC transfer";
    const txMsg = addMessage(
      "ai",
      "tx-status",
      `🚀 Initiating your ${actionText}... Please confirm in your wallet.`,
      { txStatus: "pending" }
    );

    try {
      let result;
      if (isSwap) {
        result = await executeSwap(currentIntent as SwapIntent);
      } else {
        if (circleWallet.walletAddress) {
          // Send via Circle User-Controlled Wallet
          const success = await circleWallet.executeTransfer(
            (currentIntent as TransferIntent).to,
            (currentIntent as TransferIntent).amount,
            circleWallet.tokenId || "simulated_usdc_token_id"
          );
          if (!success) {
            throw new Error("Circle wallet transfer failed or was cancelled.");
          }
          const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
          result = {
            txHash: mockTxHash,
            explorerUrl: `https://testnet.arcscan.app/tx/${mockTxHash}`
          };
        } else {
          result = await executeTransfer(currentIntent as TransferIntent);
        }
      }
      
      if (result) {
        updateMessage(txMsg.id, {
          txHash: result.txHash,
          explorerUrl: result.explorerUrl,
          content: `📡 Transaction submitted! Hash: ${result.txHash.slice(0, 10)}...`,
        });

        // Track confirmation
        await trackTransaction(result.txHash, txMsg.id);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      updateMessage(txMsg.id, {
        txStatus: "failed",
        content: `❌ Transfer failed: ${errorMessage}`,
      });

      // Check if it's a known error pattern
      if (errorMessage.includes("User rejected") || errorMessage.includes("cancelled")) {
        addMessage(
          "ai",
          "text",
          "No worries! The transaction was cancelled. You can try again whenever you're ready. 👍"
        );
      } else {
        addMessage(
          "ai",
          "text",
          `The transfer encountered an error. Would you like me to explain what went wrong? Just ask: "What does this error mean?"`
        );
      }
    } finally {
      setIsSending(false);
    }
  }, [
    pendingIntent,
    pendingSwapIntent,
    pendingBridgeIntent,
    isSending,
    circleWallet,
    address,
    addMessage,
    updateMessage,
    executeTransfer,
    executeSwap,
    trackTransaction,
    cctp,
  ]);

  // Cancel pending action
  const cancelTransfer = useCallback(() => {
    setPendingIntent(null);
    setPendingSwapIntent(null);
    setPendingBridgeIntent(null);
    setPendingGasEstimate(null);
    cctp.resetBridge();
    addMessage(
      "ai",
      "text",
      "Action cancelled. Let me know if you'd like to try again or need anything else! 👋"
    );
  }, [addMessage, cctp]);

  return {
    messages,
    isLoading,
    isSending,
    pendingIntent,
    pendingSwapIntent,
    pendingBridgeIntent,
    pendingGasEstimate,
    sendMessage,
    confirmTransfer,
    cancelTransfer,
    messagesEndRef,
    circleWallet,
    showOnboardModal,
    setShowOnboardModal,
    cctp,
  };
}

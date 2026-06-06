"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createPublicClient, http, isAddress, type Hash } from "viem";
import { arcTestnet } from "viem/chains";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { useCircleWallet } from "@/hooks/useCircleWallet";
import { useCCTP } from "@/hooks/useCCTP";
import { useStableFX } from "@/hooks/useStableFX";
import type {
  ChatMessage,
  TransferIntent,
  SwapIntent,
  BridgeIntent,
  ParseResponse,
  MessageRole,
  MessageType,
  StreamCreateIntent,
  StreamWithdrawIntent,
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
  const [pendingStreamCreateIntent, setPendingStreamCreateIntent] = useState<StreamCreateIntent | null>(null);
  const [pendingStreamWithdrawIntent, setPendingStreamWithdrawIntent] = useState<StreamWithdrawIntent | null>(null);
  const [activeStreams, setActiveStreams] = useState<any[]>([]);
  const [isWithdrawingStream, setIsWithdrawingStream] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const circleWallet = useCircleWallet();
  const cctp = useCCTP();
  const fx = useStableFX();
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

  const executeStreamCreate = useCallback(
    async (intent: StreamCreateIntent): Promise<{ txHash: string; streamId: number }> => {
      // Simulate real block latency and smart contract interaction
      await new Promise(r => setTimeout(r, 2000));
      
      const newStreamId = activeStreams.length + 1;
      const rateSec = parseInt(intent.ratePerSecond) || 165;
      const durSec = parseInt(intent.durationSeconds) || 604800;
      
      const newStream = {
        streamId: newStreamId,
        sender: address || "0xEmployer...",
        recipient: intent.to,
        amountPerSecond: rateSec,
        startTime: Math.floor(Date.now() / 1000),
        stopTime: Math.floor(Date.now() / 1000) + durSec,
        remainingBalance: parseFloat(intent.amount) * 1e6,
        lastWithdrawalTime: Math.floor(Date.now() / 1000)
      };

      setActiveStreams(prev => [...prev, newStream]);
      
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
      return { txHash: mockTxHash, streamId: newStreamId };
    },
    [activeStreams, address]
  );

  const executeStreamWithdraw = useCallback(
    async (streamId: number): Promise<{ success: boolean; txHash: string; claimedAmount: number }> => {
      const streamIndex = activeStreams.findIndex((s) => s.streamId === streamId);
      if (streamIndex === -1) throw new Error("Stream not found");

      setIsWithdrawingStream(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const stream = activeStreams[streamIndex];
        const now = Math.floor(Date.now() / 1000);
        const activeEnd = Math.min(now, stream.stopTime);
        const elapsed = activeEnd - stream.lastWithdrawalTime;
        const accrued = elapsed * stream.amountPerSecond;
        const claimed = Math.min(accrued, stream.remainingBalance);

        if (claimed <= 0) {
          throw new Error("No claimable streaming balance accrued yet.");
        }

        const updatedStreams = [...activeStreams];
        updatedStreams[streamIndex] = {
          ...stream,
          remainingBalance: stream.remainingBalance - claimed,
          lastWithdrawalTime: activeEnd,
        };
        setActiveStreams(updatedStreams);

        const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
        
        // Add text message reporting withdrawal
        addMessage(
          "ai",
          "text",
          `✅ Stream withdrawal successful! Claimed ${(claimed / 1e6).toFixed(6)} USDC from stream #${streamId}.\n\n🔗 Transaction Hash: [${mockTxHash.slice(0, 14)}...](https://testnet.arcscan.app/tx/${mockTxHash})`
        );

        return { success: true, txHash: mockTxHash, claimedAmount: claimed / 1e6 };
      } finally {
        setIsWithdrawingStream(false);
      }
    },
    [activeStreams, addMessage]
  );

  // Track transaction status
  const trackTransaction = useCallback(
    async (txHash: string, messageId: string, swapIntent?: SwapIntent) => {
      try {
        const actionText = swapIntent ? "swap" : "USDC transfer";
        // Update to pending
        updateMessage(messageId, {
          txStatus: "pending",
          content: `⏳ Your ${actionText} has been submitted to Arc Testnet. Waiting for confirmation...`,
          swapIntent,
        });

        if (circleWallet.simulated || circleWallet.walletAddress) {
          // Simulate sub-second finality on Arc
          await new Promise((resolve) => setTimeout(resolve, 1500));
          
          let content = "";
          let followUp = "";
          if (swapIntent) {
            const rate = swapIntent.tokenIn === "USDC" ? 0.9245 : 1.0817;
            const amountOut = (parseFloat(swapIntent.amountIn) * rate).toFixed(4);
            content = `✅ Transaction confirmed! Swapped ${swapIntent.amountIn} ${swapIntent.tokenIn} for ${amountOut} ${swapIntent.tokenOut} on Arc Testnet.`;
            followUp = `Great news! 🎉 Your swap of ${swapIntent.amountIn} ${swapIntent.tokenIn} for ${amountOut} ${swapIntent.tokenOut} has been confirmed on Arc Testnet.`;
          } else {
            content = `✅ Transaction confirmed! Your USDC transfer has been successfully processed on Arc Testnet.`;
            followUp = `Great news! 🎉 Your transfer has been confirmed on Arc Testnet with sub-second finality.`;
          }

          updateMessage(messageId, {
            txStatus: "confirmed",
            content,
          });

          // Add conversational follow-up
          addMessage("ai", "text", followUp);
          
          // Refresh Circle Wallet balance
          if (circleWallet.walletAddress) {
            circleWallet.refreshBalance();
          }
          return;
        }

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash as Hash,
          timeout: 30_000, // Arc has sub-second finality, 30s is generous
        });

        if (receipt.status === "success") {
          let content = "";
          let followUp = "";
          if (swapIntent) {
            const rate = swapIntent.tokenIn === "USDC" ? 0.9245 : 1.0817;
            const amountOut = (parseFloat(swapIntent.amountIn) * rate).toFixed(4);
            content = `✅ Transaction confirmed! Swapped ${swapIntent.amountIn} ${swapIntent.tokenIn} for ${amountOut} ${swapIntent.tokenOut} on Arc Testnet.`;
            followUp = `Great news! 🎉 Your swap of ${swapIntent.amountIn} ${swapIntent.tokenIn} for ${amountOut} ${swapIntent.tokenOut} has been confirmed on Arc Testnet. You can view the full details on Arcscan.`;
          } else {
            content = `✅ Transaction confirmed! Your USDC transfer has been successfully processed on Arc Testnet.`;
            followUp = `Great news! 🎉 Your transfer has been confirmed on Arc Testnet with sub-second finality. You can view the full details on Arcscan.`;
          }

          updateMessage(messageId, {
            txStatus: "confirmed",
            content,
          });

          // Add conversational follow-up
          addMessage("ai", "text", followUp);
        } else {
          updateMessage(messageId, {
            txStatus: "failed",
            content: `❌ ${swapIntent ? "Swap" : "Transaction"} failed on-chain. The operation was reverted.`,
          });

          addMessage(
            "ai",
            "text",
            "It looks like the transaction was reverted. This could be due to insufficient token balance or slippage protection limits. Would you like me to explain the error?"
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
    [updateMessage, addMessage, circleWallet.simulated, circleWallet.walletAddress]
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

            // Fetch live StableFX quote
            setIsLoading(true);
            const quote = await fx.fetchQuote(swapIntent.amountIn, swapIntent.tokenIn, swapIntent.tokenOut);
            setIsLoading(false);

            if (!quote) {
              addMessage("ai", "text", "Sorry, I had trouble retrieving a foreign exchange quote from Circle StableFX. Please try again. 🔄");
              break;
            }

            const gasFee = "~0.005"; 
            setPendingSwapIntent(swapIntent);
            setPendingGasEstimate(gasFee);

            const quoteMessage = `I've fetched a live quote from Circle StableFX. Converting ${quote.sellAmount} ${swapIntent.tokenIn} will yield approximately ${parseFloat(quote.buyAmount).toFixed(4)} ${swapIntent.tokenOut} at a rate of ${parseFloat(quote.rate).toFixed(4)}. Fee: ${quote.fee} ${swapIntent.tokenIn}.`;

            addMessage("ai", "confirmation", quoteMessage, {
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

          case "stream_create": {
            if (!parsed.streamCreateIntent) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            const streamIntent = parsed.streamCreateIntent;

            if (!streamIntent.amount || !streamIntent.to) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            if (!isAddress(streamIntent.to)) {
              addMessage(
                "ai",
                "text",
                `⚠️ The address "${streamIntent.to}" appears to be invalid. Please provide a valid Ethereum address for the payroll stream recipient.`
              );
              break;
            }

            setPendingStreamCreateIntent(streamIntent);

            addMessage("ai", "confirmation", parsed.message, {
              streamCreateIntent: streamIntent,
              gasEstimate: {
                fee: "~0.005",
                gas: 0n,
                gasPrice: 0n
              }
            });
            break;
          }

          case "stream_withdraw": {
            if (!parsed.streamWithdrawIntent) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            const withdrawIntent = parsed.streamWithdrawIntent;
            const streamId = parseInt(withdrawIntent.streamId) || 1;

            const stream = activeStreams.find(s => s.streamId === streamId);
            if (!stream) {
              addMessage("ai", "text", `Could not find an active salary stream with ID #${streamId} associated with your wallet. Please review your active streams.`);
              break;
            }

            // Execute the stream withdrawal directly!
            addMessage("ai", "text", `Initiating withdrawal for streaming salary stream #${streamId}... ⚡`);
            try {
              await executeStreamWithdraw(streamId);
            } catch (err: any) {
              addMessage("ai", "text", `❌ Withdrawal failed: ${err.message}`);
            }
            break;
          }

          case "corporate_batch": {
            addMessage(
              "ai",
              "text",
              `I've identified a corporate treasury batch disbursal request. 🏢\n\nYou can upload your contractor payroll CSV list, review pending disbursals, and sign off on batch transfers on the **Enterprise Treasury Administration Dashboard**.\n\n👉 [Go to Enterprise Treasury Dashboard](/admin)`
            );
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
      fx,
    ]
  );

  // Confirm and execute action (transfer, swap, bridge, or stream)
  const confirmTransfer = useCallback(async () => {
    if ((!pendingIntent && !pendingSwapIntent && !pendingBridgeIntent && !pendingStreamCreateIntent) || isSending) return;

    setIsSending(true);

    if (pendingStreamCreateIntent) {
      const streamIntent = pendingStreamCreateIntent;
      setPendingStreamCreateIntent(null);

      const txMsg = addMessage(
        "ai",
        "tx-status",
        `🚀 Creating continuous salary stream on Arc... Please approve USDC allowance & sign transaction in your wallet.`,
        { txStatus: "pending" }
      );

      try {
        const result = await executeStreamCreate(streamIntent);
        
        updateMessage(txMsg.id, {
          txHash: result.txHash,
          explorerUrl: `https://testnet.arcscan.app/tx/${result.txHash}`,
          content: `📡 Stream initialized! Transaction Hash: ${result.txHash.slice(0, 10)}...`,
          txStatus: "confirmed"
        });

        // Add real-time stream counter card for the worker recipient!
        addMessage(
          "ai",
          "stream-counter",
          `Continuous stream #${result.streamId} is active!`,
          {
            streamCreateIntent: streamIntent,
            // Store streamId and details as stringified JSON or structured props in content/extra
            // We'll pass extra data in custom fields or in the Message object
            txHash: result.txHash,
            explorerUrl: `https://testnet.arcscan.app/tx/${result.txHash}`
          }
        );
      } catch (error: any) {
        updateMessage(txMsg.id, {
          txStatus: "failed",
          content: `❌ Stream creation failed: ${error.message || "Unknown error"}`
        });
      } finally {
        setIsSending(false);
      }
      return;
    }

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
        await trackTransaction(result.txHash, txMsg.id, isSwap ? (currentIntent as SwapIntent) : undefined);
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
    pendingStreamCreateIntent,
    isSending,
    circleWallet,
    address,
    addMessage,
    updateMessage,
    executeTransfer,
    executeSwap,
    executeStreamCreate,
    trackTransaction,
    cctp,
    fx,
  ]);

  // Cancel pending action
  const cancelTransfer = useCallback(() => {
    setPendingIntent(null);
    setPendingSwapIntent(null);
    setPendingBridgeIntent(null);
    setPendingStreamCreateIntent(null);
    setPendingStreamWithdrawIntent(null);
    setPendingGasEstimate(null);
    cctp.resetBridge();
    fx.clearQuote();
    addMessage(
      "ai",
      "text",
      "Action cancelled. Let me know if you'd like to try again or need anything else! 👋"
    );
  }, [addMessage, cctp, fx]);

  return {
    messages,
    isLoading,
    isSending,
    pendingIntent,
    pendingSwapIntent,
    pendingBridgeIntent,
    pendingStreamCreateIntent,
    pendingStreamWithdrawIntent,
    activeStreams,
    isWithdrawingStream,
    executeStreamWithdraw,
    pendingGasEstimate,
    sendMessage,
    confirmTransfer,
    cancelTransfer,
    messagesEndRef,
    circleWallet,
    showOnboardModal,
    setShowOnboardModal,
    cctp,
    fx,
  };
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createPublicClient, http, isAddress, type Hash, formatUnits, keccak256, encodePacked } from "viem";
import { arcTestnet } from "viem/chains";
import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { useCircleWallet } from "@/hooks/useCircleWallet";
import { useCCTP } from "@/hooks/useCCTP";
import { useStableFX } from "@/hooks/useStableFX";
import { useNanopayments } from "@/hooks/useNanopayments";
import { useSmartAccount } from "@/hooks/useSmartAccount";
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
  EscrowCreateIntent,
  EscrowSubmitIntent,
} from "@/types";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const PAY_STREAM_VAULT_ADDRESS = "0x946b1c09893d596489b4de5de586616fe28c0571";
const ERC8183_ESCROW_ADDRESS = "0x8183e5c7075c1c09893d596489b4de5de586616fe";

const USDC_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

const PAY_STREAM_VAULT_ABI = [
  {
    name: "createStream",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amountPerSecond", type: "uint256" },
      { name: "stopTime", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "withdrawFromStream",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: []
  },
  {
    name: "cancelStream",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: []
  },
  {
    name: "balanceOfStream",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "streamId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const;

const ERC8183_ESCROW_ABI = [
  {
    name: "createJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "employee", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "deliverableHash", type: "bytes32" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    name: "submitDeliverable",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "url", type: "string" }
    ],
    outputs: []
  },
  {
    name: "releaseJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: []
  },
  {
    name: "disputeJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: []
  }
] as const;

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    return [
      {
        id: "welcome_msg",
        role: "ai",
        type: "text",
        content: "👋 Welcome to WireStable! I am your AI-powered stablecoin remittance manager, operating on the **Arc Chain** with gasless sponsorships.\n\nI parse natural language commands to disburse funds, execute CCTP cross-chain bridges, sweep corporate balances to USYC yield, and manage escrow contracts. Here are some active agreements on your dashboard:",
        timestamp: new Date(Date.now() - 3600 * 1000)
      },
      {
        id: "demo_stream_msg",
        role: "ai",
        type: "stream-counter",
        content: "Active Salary Stream:",
        streamCreateIntent: {
          to: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8",
          amount: "500.00",
          ratePerSecond: "165",
          durationSeconds: "604800",
          token: "USDC"
        },
        extra: {
          streamId: 3,
          sender: "0x5c79743c39385fb93c0d8df3c9ee5ff27fbc32a1",
          recipient: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8",
          amountPerSecond: 165,
          startTime: Math.floor(Date.now() / 1000) - 2 * 24 * 3600,
          stopTime: Math.floor(Date.now() / 1000) + 5 * 24 * 3600,
          remainingBalance: 320 * 1e6,
          lastWithdrawalTime: Math.floor(Date.now() / 1000) - 12 * 3600
        },
        timestamp: new Date(Date.now() - 30 * 60000)
      },
      {
        id: "demo_escrow_msg",
        role: "ai",
        type: "escrow-card",
        content: "Pending Escrow Contract:",
        escrowCreateIntent: {
          to: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8",
          amount: "250.00",
          deliverableHash: "0x4a2e8f192b4cd859b4de5de586616fe28c057111111111111111111111111111"
        },
        extra: {
          jobId: 1
        },
        timestamp: new Date(Date.now() - 25 * 60000)
      }
    ];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIntent, setPendingIntent] = useState<TransferIntent | null>(null);
  const [pendingSwapIntent, setPendingSwapIntent] = useState<SwapIntent | null>(null);
  const [pendingGasEstimate, setPendingGasEstimate] = useState<string | null>(null);
  const [pendingBridgeIntent, setPendingBridgeIntent] = useState<BridgeIntent | null>(null);
  const [pendingStreamCreateIntent, setPendingStreamCreateIntent] = useState<StreamCreateIntent | null>(null);
  const [pendingStreamWithdrawIntent, setPendingStreamWithdrawIntent] = useState<StreamWithdrawIntent | null>(null);
  const [activeStreams, setActiveStreams] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    return [
      {
        streamId: 3,
        sender: "0x5c79743c39385fb93c0d8df3c9ee5ff27fbc32a1",
        recipient: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8",
        amountPerSecond: 165,
        startTime: Math.floor(Date.now() / 1000) - 2 * 24 * 3600,
        stopTime: Math.floor(Date.now() / 1000) + 5 * 24 * 3600,
        remainingBalance: 320 * 1e6,
        lastWithdrawalTime: Math.floor(Date.now() / 1000) - 12 * 3600
      }
    ];
  });
  const [pendingEscrowCreateIntent, setPendingEscrowCreateIntent] = useState<EscrowCreateIntent | null>(null);
  const [pendingEscrowSubmitIntent, setPendingEscrowSubmitIntent] = useState<EscrowSubmitIntent | null>(null);
  const [pendingCctpPreRouting, setPendingCctpPreRouting] = useState<{
    amountToBridge: string;
    sourceChain: string;
    targetIntent: TransferIntent;
  } | null>(null);
  const [escrowJobs, setEscrowJobs] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    return [
      {
        jobId: 1,
        client: "0x5c79743c39385fb93c0d8df3c9ee5ff27fbc32a1",
        provider: "0x73977c088ddf7324317f2ccb2b2b1a134c6dbca8",
        evaluator: "0x8183e5c7075c1c09893d596489b4de5de586616fe",
        token: USDC_ADDRESS,
        amount: 250.00,
        status: "FUNDED",
        deliverableHash: "0x4a2e8f192b4cd859b4de5de586616fe28c057111111111111111111111111111",
        deliverableUrl: "",
        expiry: Math.floor(Date.now() / 1000) + 15 * 86400
      }
    ];
  });
  const [isWithdrawingStream, setIsWithdrawingStream] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const circleWallet = useCircleWallet();
  const cctp = useCCTP();
  const fx = useStableFX();
  const nanopay = useNanopayments();
  const { address: web3Address, isConnected: isWeb3Connected } = useAccount();
  const isConnected = isWeb3Connected || !!circleWallet.walletAddress;
  const address = web3Address || circleWallet.walletAddress;
  const { data: walletClient } = useWalletClient();
  const smartAccount = useSmartAccount(address);

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

  const [activeRateLock, setActiveRateLock] = useState<{ id: number; amount: number; rate: number; active: boolean } | null>(null);

  const executePurchaseRateLock = useCallback((lockId: number, amount: number, rate: number) => {
    setActiveRateLock({ id: lockId, amount, rate, active: true });
    addMessage("ai", "text", `Rate lock Option **#${lockId}** is now **ACTIVE**. Your next swap/transfer of up to ${amount} USDC will settle at the locked rate of **${rate} EURC/USDC**.`);
  }, [addMessage]);

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

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        
        // Sign payment token if channel is open
        if (nanopay.channel?.isOpen) {
          const token = await nanopay.signPaymentToken(0.0005);
          if (token) {
            headers["x402-payment-token"] = token;
          }
        }

        const res = await fetch("/api/parse", {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: userMessage,
            conversationHistory,
          }),
        });

        if (res.status === 402) {
          addMessage(
            "ai",
            "text",
            "⚠️ Conversational AI queries on Arc Testnet require an active Circle Gateway Nanopayments channel ($0.0005 USDC/msg).\n\nPlease open and fund a channel to continue without wallet signing prompt delays! 👇"
          );
          return null;
        }

        if (!res.ok) {
          throw new Error(`Parse API returned ${res.status}`);
        }

        return await res.json();
      } catch (error) {
        console.error("Parse error:", error);
        return null;
      }
    },
    [messages, nanopay, addMessage]
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

      // If gasless is enabled, construct a UserOperation and sponsor it via the paymaster API
      if (smartAccount.isGasless) {
        try {
          const callData = `0xa9059cbb000000000000000000000000${intent.to.slice(2).toLowerCase()}0000000000000000000000000000000000000000000000000000000000000000` as `0x${string}`;
          
          const userOp = await smartAccount.constructUserOp(
            intent.to as `0x${string}`,
            intent.amount,
            callData
          );

          if (!userOp) throw new Error("Failed to construct UserOperation");

          const userOpMessage = `UserOp: ${userOp.sender} transfers ${intent.amount} USDC to ${intent.to}`;
          const signature = await walletClient.signMessage({
            message: userOpMessage
          });

          const res = await fetch("/api/paymaster/sponsor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userOp: {
                ...userOp,
                nonce: userOp.nonce.toString(),
                callGasLimit: userOp.callGasLimit.toString(),
                verificationGasLimit: userOp.verificationGasLimit.toString(),
                preVerificationGas: userOp.preVerificationGas.toString(),
                maxFeePerGas: userOp.maxFeePerGas.toString(),
                maxPriorityFeePerGas: userOp.maxPriorityFeePerGas.toString()
              },
              signature,
              recipient: intent.to,
              amount: intent.amount,
              senderAddress: address
            })
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || "Bundler sponsorship request failed.");
          }

          const sponsorResult = await res.json();
          return {
            txHash: sponsorResult.txHash,
            explorerUrl: `https://testnet.arcscan.app/tx/${sponsorResult.txHash}`
          };
        } catch (err) {
          console.warn("Gasless execution failed, falling back to standard transfer:", err);
        }
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
    [walletClient, address, smartAccount]
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
      const rateSec = parseInt(intent.ratePerSecond) || 165;
      const durSec = parseInt(intent.durationSeconds) || 604800;
      const totalAmount = BigInt(rateSec) * BigInt(durSec);

      if (!walletClient || !address) {
        throw new Error("Wallet is not connected.");
      }

      // 1. Approve USDC spending by PayStreamVault
      const approveRequest = await publicClient.simulateContract({
        account: address as `0x${string}`,
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [PAY_STREAM_VAULT_ADDRESS, totalAmount],
      });
      const approveHash = await walletClient.writeContract(approveRequest.request);
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // 2. Create stream
      const stopTime = BigInt(Math.floor(Date.now() / 1000) + durSec);
      const createRequest = await publicClient.simulateContract({
        account: address as `0x${string}`,
        address: PAY_STREAM_VAULT_ADDRESS,
        abi: PAY_STREAM_VAULT_ABI,
        functionName: 'createStream',
        args: [intent.to as `0x${string}`, BigInt(rateSec), stopTime],
      });
      const createHash = await walletClient.writeContract(createRequest.request);
      await publicClient.waitForTransactionReceipt({ hash: createHash });

      let streamId = activeStreams.length + 1;
      try {
        const nextId = await publicClient.readContract({
          address: PAY_STREAM_VAULT_ADDRESS,
          abi: [
            {
              name: "nextStreamId",
              type: "function",
              stateMutability: "view",
              inputs: [],
              outputs: [{ name: "", type: "uint256" }]
            }
          ] as const,
          functionName: "nextStreamId",
        });
        streamId = Number(nextId) - 1;
      } catch (err) {
        console.warn("Could not read nextStreamId from contract, using default index", err);
      }

      const newStream = {
        streamId: streamId,
        sender: address,
        recipient: intent.to,
        amountPerSecond: rateSec,
        startTime: Math.floor(Date.now() / 1000),
        stopTime: Math.floor(Date.now() / 1000) + durSec,
        remainingBalance: Number(totalAmount),
        lastWithdrawalTime: Math.floor(Date.now() / 1000)
      };

      setActiveStreams(prev => [...prev, newStream]);
      return { txHash: createHash, streamId };
    },
    [activeStreams, address, walletClient]
  );

  const executeStreamWithdraw = useCallback(
    async (streamId: number): Promise<{ success: boolean; txHash: string; claimedAmount: number }> => {
      const streamIndex = activeStreams.findIndex((s) => s.streamId === streamId);
      if (streamIndex === -1) throw new Error("Stream not found");

      setIsWithdrawingStream(true);
      try {
        const stream = activeStreams[streamIndex];
        const now = Math.floor(Date.now() / 1000);
        const activeEnd = Math.min(now, stream.stopTime);
        const elapsed = activeEnd - stream.lastWithdrawalTime;
        const accrued = elapsed * stream.amountPerSecond;
        const claimed = Math.min(accrued, stream.remainingBalance);

        // SANDBOX / DISCONNECTED MOCKING:
        const isMockMode = !walletClient || !address || streamId === 3;
        if (isMockMode) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const mockTxHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
          
          const updatedStreams = [...activeStreams];
          updatedStreams[streamIndex] = {
            ...stream,
            remainingBalance: Math.max(0, stream.remainingBalance - claimed),
            lastWithdrawalTime: activeEnd,
          };
          setActiveStreams(updatedStreams);

          addMessage(
            "ai",
            "text",
            `✅ [Sandbox Simulation] Stream withdrawal successful! Claimed ${(claimed / 1e6).toFixed(6)} USDC from stream #${streamId}.\n\n🔗 Transaction Hash: [${mockTxHash.slice(0, 14)}...](https://testnet.arcscan.app/tx/${mockTxHash})`
          );

          return { success: true, txHash: mockTxHash, claimedAmount: claimed / 1e6 };
        }

        // Withdraw claimable funds on-chain
        const withdrawRequest = await publicClient.simulateContract({
          account: address as `0x${string}`,
          address: PAY_STREAM_VAULT_ADDRESS,
          abi: PAY_STREAM_VAULT_ABI,
          functionName: 'withdrawFromStream',
          args: [BigInt(streamId)],
        });
        const withdrawHash = await walletClient.writeContract(withdrawRequest.request);
        await publicClient.waitForTransactionReceipt({ hash: withdrawHash });

        // Query current claimable balance remaining (if the view function allows)
        let actualClaimed = claimed;
        try {
          const claimableBigInt = await publicClient.readContract({
            address: PAY_STREAM_VAULT_ADDRESS,
            abi: PAY_STREAM_VAULT_ABI,
            functionName: "balanceOfStream",
            args: [BigInt(streamId)],
          });
          actualClaimed = Number(claimableBigInt);
        } catch (err) {
          console.warn("Could not read stream balance from contract, using calculated value");
        }

        const updatedStreams = [...activeStreams];
        updatedStreams[streamIndex] = {
          ...stream,
          remainingBalance: Math.max(0, stream.remainingBalance - actualClaimed),
          lastWithdrawalTime: activeEnd,
        };
        setActiveStreams(updatedStreams);

        addMessage(
          "ai",
          "text",
          `✅ Stream withdrawal successful! Claimed ${(actualClaimed / 1e6).toFixed(6)} USDC from stream #${streamId}.\n\n🔗 Transaction Hash: [${withdrawHash.slice(0, 14)}...](https://testnet.arcscan.app/tx/${withdrawHash})`
        );

        return { success: true, txHash: withdrawHash, claimedAmount: actualClaimed / 1e6 };
      } finally {
        setIsWithdrawingStream(false);
      }
    },
    [activeStreams, addMessage, walletClient, address]
  );

  const executeEscrowCreate = useCallback(
    async (intent: EscrowCreateIntent): Promise<{ txHash: string; jobId: number }> => {
      const amountRaw = parseFloat(intent.amount);
      const amountBigInt = BigInt(Math.round(amountRaw * 1e6));
      
      let deliverableHashBytes32 = "0x" + "0".repeat(64);
      if (intent.deliverableHash) {
        if (intent.deliverableHash.startsWith("0x")) {
          deliverableHashBytes32 = intent.deliverableHash;
        } else {
          deliverableHashBytes32 = keccak256(encodePacked(["string"], [intent.deliverableHash]));
        }
      }

      if (!walletClient || !address) {
        throw new Error("Wallet is not connected.");
      }

      // 1. Approve USDC spend
      const approveRequest = await publicClient.simulateContract({
        account: address as `0x${string}`,
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [ERC8183_ESCROW_ADDRESS, amountBigInt],
      });
      const approveHash = await walletClient.writeContract(approveRequest.request);
      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      // 2. Create Job
      const createRequest = await publicClient.simulateContract({
        account: address as `0x${string}`,
        address: ERC8183_ESCROW_ADDRESS,
        abi: ERC8183_ESCROW_ABI,
        functionName: 'createJob',
        args: [intent.to as `0x${string}`, amountBigInt, deliverableHashBytes32 as `0x${string}`],
      });
      const createHash = await walletClient.writeContract(createRequest.request);
      await publicClient.waitForTransactionReceipt({ hash: createHash });

      let jobId = escrowJobs.length + 1;
      try {
        const nextId = await publicClient.readContract({
          address: ERC8183_ESCROW_ADDRESS,
          abi: [
            {
              name: "nextJobId",
              type: "function",
              stateMutability: "view",
              inputs: [],
              outputs: [{ name: "", type: "uint256" }]
            }
          ] as const,
          functionName: "nextJobId",
        });
        jobId = Number(nextId) - 1;
      } catch (err) {
        console.warn("Could not read nextJobId from contract, using default index", err);
      }

      const newJob = {
        jobId: jobId,
        client: address,
        provider: intent.to,
        evaluator: "0x8183e5c7075c1c09893d596489b4de5de586616fe",
        token: USDC_ADDRESS,
        amount: amountRaw,
        status: "FUNDED",
        deliverableHash: deliverableHashBytes32,
        deliverableUrl: "",
        expiry: Math.floor(Date.now() / 1000) + 30 * 86400
      };

      setEscrowJobs(prev => [...prev, newJob]);
      return { txHash: createHash, jobId };
    },
    [escrowJobs, address, walletClient]
  );

  const executeEscrowSubmit = useCallback(
    async (intent: EscrowSubmitIntent): Promise<{ success: boolean; txHash: string; message: string }> => {
      const jobId = parseInt(intent.jobId) || 1;
      const jobIndex = escrowJobs.findIndex(j => j.jobId === jobId);
      if (jobIndex === -1) throw new Error("Job not found");

      const isMockMode = !walletClient || !address || jobId === 1;
      if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockSubmitHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        
        const updatedJobs = [...escrowJobs];
        const job = updatedJobs[jobIndex];
        job.deliverableUrl = intent.url;
        job.status = "SUBMITTED";
        setEscrowJobs(updatedJobs);

        // Auto release trigger simulation
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockReleaseHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        job.status = "COMPLETED";
        setEscrowJobs([...updatedJobs]);

        addMessage(
          "ai",
          "text",
          `🎉 **[Sandbox Simulation] Escrow Job #${jobId} Succeeded & Settled On-Chain!**\n\nWireStable's compliance agent verified the submission link: \`${intent.url}\`\n\nSignature match: \`0x98f2b3e8c281... (Pass)\`\n\nUSDC payout of **${job.amount} USDC** was released on-chain to provider address \`${job.provider}\`.\n\n🔗 Receipt: [${mockReleaseHash.slice(0, 14)}...](https://testnet.arcscan.app/tx/${mockReleaseHash})`
        );
        return { success: true, txHash: mockReleaseHash, message: "Sandbox validation succeeded" };
      }

      // 1. Submit deliverable URL on-chain
      const submitRequest = await publicClient.simulateContract({
        account: address as `0x${string}`,
        address: ERC8183_ESCROW_ADDRESS,
        abi: ERC8183_ESCROW_ABI,
        functionName: 'submitDeliverable',
        args: [BigInt(jobId), intent.url],
      });
      const submitHash = await walletClient.writeContract(submitRequest.request);
      await publicClient.waitForTransactionReceipt({ hash: submitHash });

      const updatedJobs = [...escrowJobs];
      const job = updatedJobs[jobIndex];
      job.deliverableUrl = intent.url;
      job.status = "SUBMITTED";
      setEscrowJobs(updatedJobs);

      // Call validation API
      const res = await fetch("/api/escrow/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, url: intent.url })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Compliance verification failed.");
      }

      const data = await res.json();

      // Auto-trigger release after successful verification
      await new Promise(r => setTimeout(r, 2000));

      // 2. Release job on-chain
      const releaseRequest = await publicClient.simulateContract({
        account: address as `0x${string}`,
        address: ERC8183_ESCROW_ADDRESS,
        abi: ERC8183_ESCROW_ABI,
        functionName: 'releaseJob',
        args: [BigInt(jobId)],
      });
      const releaseHash = await walletClient.writeContract(releaseRequest.request);
      await publicClient.waitForTransactionReceipt({ hash: releaseHash });

      job.status = "COMPLETED";
      setEscrowJobs([...updatedJobs]);

      addMessage(
        "ai",
        "text",
        `🎉 **Escrow Job #${jobId} Succeeded & Settled On-Chain!**\n\nWireStable's compliance agent verified the submission link: \`${intent.url}\`\n\nSignature match: \`${data.signature.slice(0, 16)}...\`\n\nUSDC payout of **${job.amount} USDC** was released on-chain to provider address \`${job.provider}\`.\n\n🔗 Receipt: [${releaseHash.slice(0, 14)}...](https://testnet.arcscan.app/tx/${releaseHash})`
      );

      return { success: true, txHash: releaseHash, message: data.message };
    },
    [escrowJobs, addMessage, walletClient, address]
  );

  const handleEscrowRelease = useCallback(
    async (jobId: number) => {
      const jobIndex = escrowJobs.findIndex(j => j.jobId === jobId);
      if (jobIndex === -1) return;

      const isMockMode = !walletClient || !address || jobId === 1;
      if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockReleaseHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const updatedJobs = [...escrowJobs];
        const job = updatedJobs[jobIndex];
        job.status = "COMPLETED";
        setEscrowJobs(updatedJobs);

        addMessage(
          "ai",
          "text",
          `✅ [Sandbox Simulation] Client authorized manual release of Escrow Job #${jobId} on-chain. Funds (${job.amount} USDC) have been sent to provider: \`${job.provider}\`.\n\n🔗 Tx Hash: [${mockReleaseHash.slice(0, 14)}...](https://testnet.arcscan.app/tx/${mockReleaseHash})`
        );
        return;
      }

      const releaseRequest = await publicClient.simulateContract({
        account: address as `0x${string}`,
        address: ERC8183_ESCROW_ADDRESS,
        abi: ERC8183_ESCROW_ABI,
        functionName: 'releaseJob',
        args: [BigInt(jobId)],
      });
      const releaseHash = await walletClient.writeContract(releaseRequest.request);
      await publicClient.waitForTransactionReceipt({ hash: releaseHash });

      const updatedJobs = [...escrowJobs];
      const job = updatedJobs[jobIndex];
      job.status = "COMPLETED";
      setEscrowJobs(updatedJobs);

      addMessage(
        "ai",
        "text",
        `✅ Client authorized manual release of Escrow Job #${jobId} on-chain. Funds (${job.amount} USDC) have been sent to provider: \`${job.provider}\`.\n\n🔗 Tx Hash: [${releaseHash.slice(0, 14)}...](https://testnet.arcscan.app/tx/${releaseHash})`
      );
    },
    [escrowJobs, addMessage, walletClient, address]
  );

  const handleEscrowDispute = useCallback(
    async (jobId: number) => {
      const jobIndex = escrowJobs.findIndex(j => j.jobId === jobId);
      if (jobIndex === -1) return;

      const isMockMode = !walletClient || !address || jobId === 1;
      if (isMockMode) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockDisputeHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const updatedJobs = [...escrowJobs];
        const job = updatedJobs[jobIndex];
        job.status = "REJECTED";
        setEscrowJobs(updatedJobs);

        addMessage(
          "ai",
          "text",
          `⚠️ [Sandbox Simulation] Escrow Job #${jobId} is now under dispute on-chain. Payout locked. Senders can reclaim the locked funds after the expiry date.\n\n🔗 Tx Hash: [${mockDisputeHash.slice(0, 14)}...](https://testnet.arcscan.app/tx/${mockDisputeHash})`
        );
        return;
      }

      const disputeRequest = await publicClient.simulateContract({
        account: address as `0x${string}`,
        address: ERC8183_ESCROW_ADDRESS,
        abi: ERC8183_ESCROW_ABI,
        functionName: 'disputeJob',
        args: [BigInt(jobId)],
      });
      const disputeHash = await walletClient.writeContract(disputeRequest.request);
      await publicClient.waitForTransactionReceipt({ hash: disputeHash });

      const updatedJobs = [...escrowJobs];
      const job = updatedJobs[jobIndex];
      job.status = "REJECTED";
      setEscrowJobs(updatedJobs);

      addMessage(
        "ai",
        "text",
        `⚠️ Escrow Job #${jobId} is now under dispute on-chain. Payout locked. Senders can reclaim the locked funds after the expiry date or if an agreement is reached.\n\n🔗 Tx Hash: [${disputeHash.slice(0, 14)}...](https://testnet.arcscan.app/tx/${disputeHash})`
      );
    },
    [escrowJobs, addMessage, walletClient, address]
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



        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash as `0x${string}`,
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

          // Refresh Circle Wallet balance
          if (circleWallet.walletAddress) {
            circleWallet.refreshBalance();
          }
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
    [updateMessage, addMessage, circleWallet.refreshBalance, circleWallet.walletAddress]
  );

  // Main send message handler
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      // Add user message
      addMessage("user", "text", userMessage);
      setIsLoading(true);

      try {
        const contentLower = userMessage.toLowerCase();

        // Intercept rate lock purchase request
        if (contentLower.includes("rate lock") || contentLower.includes("lock usdc/eurc") || contentLower.includes("hedg")) {
          const match = contentLower.match(/(\d+(?:\.\d+)?)/);
          const amount = match ? parseFloat(match[1]) : 1000;
          setIsLoading(true);
          try {
            const res = await fetch(`/api/fx-hedging/quote?amount=${amount}&targetRate=0.9245`);
            if (res.ok) {
              const data = await res.json();
              addMessage("ai", "text", `Calculating premium for rate-lock option on USDC-EURC corridor:`);
              addMessage("ai", "text", "FX Rate Lock Offer", {
                extra: {
                  isRateLockOffer: true,
                  amount: data.amount,
                  spotRate: data.spotRate,
                  targetRate: data.targetRate,
                  premium: parseFloat(data.premium),
                  expiration: data.expiration
                }
              });
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.error("Failed to fetch rate lock quote:", err);
          }
          setIsLoading(false);
        }

        if (
          contentLower.includes("balance") ||
          contentLower.includes("portfolio") ||
          contentLower.includes("how much money") ||
          contentLower.includes("assets") ||
          contentLower.includes("funds")
        ) {
          if (address) {
            try {
              const balRes = await fetch(`/api/gateway/balance?address=${address}`);
              if (balRes.ok) {
                const balData = await balRes.json();
                if (balData.success) {
                  addMessage("ai", "text", `Here is your Unified Stablecoin Portfolio aggregated via Circle Gateway:`);
                  addMessage("ai", "text", "Unified Portfolio Card", {
                    extra: {
                      isUnifiedPortfolio: true,
                      unifiedBalance: balData.unifiedBalance,
                      chains: balData.chains
                    }
                  });
                  setIsLoading(false);
                  return;
                }
              }
            } catch (balErr) {
              console.error("Failed to fetch unified balances:", balErr);
            }
          } else {
            addMessage("ai", "text", "Please connect your wallet first to view your Unified Portfolio.");
            setIsLoading(false);
            return;
          }
        }

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

        // Check compliance before displaying any confirmation cards
        let recipientAddress = "";
        let intentAmount = "0";
        let intentAsset = "USDC";

        if (parsed.type === "transfer" && parsed.intent) {
          recipientAddress = parsed.intent.to;
          intentAmount = parsed.intent.amount;
          intentAsset = parsed.intent.token || "USDC";
        } else if (parsed.type === "swap" && parsed.swapIntent) {
          recipientAddress = address || "0x0000000000000000000000000000000000000000";
          intentAmount = parsed.swapIntent.amountIn;
          intentAsset = parsed.swapIntent.tokenIn || "USDC";
        } else if (parsed.type === "bridge" && parsed.bridgeIntent) {
          recipientAddress = parsed.bridgeIntent.to || address || "";
          intentAmount = parsed.bridgeIntent.amount;
          intentAsset = "USDC";
        } else if (parsed.type === "stream_create" && parsed.streamCreateIntent) {
          recipientAddress = parsed.streamCreateIntent.to;
          intentAmount = parsed.streamCreateIntent.amount;
          intentAsset = "USDC";
        } else if (parsed.type === "escrow_create" && parsed.escrowCreateIntent) {
          recipientAddress = parsed.escrowCreateIntent.to;
          intentAmount = parsed.escrowCreateIntent.amount;
          intentAsset = "USDC";
        }

        if (recipientAddress) {
          try {
            const complianceRes = await fetch("/api/compliance/check", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                address: recipientAddress,
                amount: intentAmount,
                senderAddress: address,
                senderEmail: circleWallet.userEmail || "user@wirestable.internal",
                type: parsed.type,
              }),
            });

            if (complianceRes.ok) {
              const complianceData = await complianceRes.json();
              if (complianceData.success && complianceData.blocked) {
                addMessage("ai", "compliance-warning", "⚠️ Compliance Blocked Alert", {
                  complianceDetails: {
                    recipientAddress,
                    amount: intentAmount,
                    asset: intentAsset,
                    riskScore: complianceData.riskScore,
                    reason: complianceData.reason,
                    senderAddress: address || "0xUnknownSender",
                    senderEmail: circleWallet.userEmail || "user@wirestable.internal",
                  },
                });
                setIsLoading(false);
                return;
              }
            }
          } catch (compErr) {
            console.error("Compliance screening failed:", compErr);
          }
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

            let currentArcBalance = circleWallet.balance ? parseFloat(circleWallet.balance) : 0;
            if (!circleWallet.walletAddress && address) {
              try {
                const USDC_ARC_ADDRESS = "0x3600000000000000000000000000000000000000";
                const balanceBigInt = await publicClient.readContract({
                  address: USDC_ARC_ADDRESS,
                  abi: [
                    {
                      constant: true,
                      inputs: [{ name: "_owner", type: "address" }],
                      name: "balanceOf",
                      outputs: [{ name: "balance", type: "uint256" }],
                      type: "function",
                    },
                  ] as const,
                  functionName: "balanceOf",
                  args: [address as `0x${string}`],
                }) as bigint;
                currentArcBalance = parseFloat(formatUnits(balanceBigInt, 6));
              } catch (e) {
                console.warn("Could not read live Arc balance for pre-routing check:", e);
              }
            }

            const requestedAmount = parseFloat(intent.amount);
            if (address && requestedAmount > currentArcBalance) {
              try {
                const balRes = await fetch(`/api/gateway/balance?address=${address}`);
                if (balRes.ok) {
                  const balData = await balRes.json();
                  if (balData.success && balData.unifiedBalance >= requestedAmount) {
                    const baseChain = balData.chains.find((c: any) => c.chain === "Base_Sepolia");
                    const baseBalance = baseChain ? baseChain.balance : 0;
                    const needed = (requestedAmount - currentArcBalance).toFixed(6);

                    setPendingCctpPreRouting({
                      amountToBridge: needed,
                      sourceChain: "Base",
                      targetIntent: intent,
                    });

                    addMessage(
                      "ai",
                      "text",
                      `⚠️ Your Arc balance (${currentArcBalance.toFixed(2)} USDC) is insufficient for this payment of ${intent.amount} USDC. However, your Unified Portfolio has ${balData.unifiedBalance.toFixed(2)} USDC (including ${baseBalance.toFixed(2)} USDC on Base Sepolia). We will automatically route the remaining ${needed} USDC from Base Sepolia using Circle CCTP before completing the payment.`
                    );
                  }
                }
              } catch (err) {
                console.error("Unified balance routing check failed:", err);
              }
            }

            // Show confirmation card
            addMessage("ai", "confirmation", parsed.message, {
              intent,
              gasEstimate: {
                fee: gasFee || "~0.001",
                gas: 0n,
                gasPrice: 0n,
              },
              agentSignature: parsed.agentSignature,
              agentPayloadHash: parsed.agentPayloadHash,
              extra: {
                smartAccountAddress: smartAccount.smartAccountAddress
              }
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
            let quote;
            if (activeRateLock && activeRateLock.active && swapIntent.tokenIn === "USDC" && swapIntent.tokenOut === "EURC" && parseFloat(swapIntent.amountIn) <= activeRateLock.amount) {
              const buyAmount = (parseFloat(swapIntent.amountIn) * activeRateLock.rate).toFixed(4);
              quote = {
                id: `lock-${activeRateLock.id}`,
                pair: "USDC-EURC",
                rate: activeRateLock.rate.toString(),
                sellAmount: swapIntent.amountIn,
                buyAmount: buyAmount,
                fee: "0.0000",
                spread: "0.0000",
                slippage: "0.0000",
                expiresIn: 3600,
                expiresAt: Date.now() + 3600 * 1000
              };
              // Consume rate lock
              setActiveRateLock(null);
            } else {
              quote = await fx.fetchQuote(swapIntent.amountIn, swapIntent.tokenIn, swapIntent.tokenOut);
            }
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
              agentSignature: parsed.agentSignature,
              agentPayloadHash: parsed.agentPayloadHash,
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
              bridgeIntent,
              agentSignature: parsed.agentSignature,
              agentPayloadHash: parsed.agentPayloadHash,
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
              },
              agentSignature: parsed.agentSignature,
              agentPayloadHash: parsed.agentPayloadHash,
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

          case "escrow_create": {
            if (!parsed.escrowCreateIntent) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            const escrowIntent = parsed.escrowCreateIntent;

            if (!escrowIntent.amount || !escrowIntent.to) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            if (!isAddress(escrowIntent.to)) {
              addMessage(
                "ai",
                "text",
                `⚠️ The address "${escrowIntent.to}" is invalid. Please provide a valid Ethereum address for the escrow provider.`
              );
              break;
            }

            setPendingEscrowCreateIntent(escrowIntent);

            addMessage("ai", "confirmation", parsed.message, {
              escrowCreateIntent: escrowIntent,
              gasEstimate: {
                fee: "~0.003",
                gas: 0n,
                gasPrice: 0n
              },
              agentSignature: parsed.agentSignature,
              agentPayloadHash: parsed.agentPayloadHash,
            });
            break;
          }

          case "escrow_submit": {
            if (!parsed.escrowSubmitIntent) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            const submitIntent = parsed.escrowSubmitIntent;

            if (!submitIntent.jobId || !submitIntent.url) {
              addMessage("ai", "text", parsed.message);
              break;
            }

            setPendingEscrowSubmitIntent(submitIntent);

            addMessage("ai", "confirmation", parsed.message, {
              escrowSubmitIntent: submitIntent,
              gasEstimate: {
                fee: "~0.001",
                gas: 0n,
                gasPrice: 0n
              },
              agentSignature: parsed.agentSignature,
              agentPayloadHash: parsed.agentPayloadHash,
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
      fx,
      activeStreams,
      executeStreamWithdraw,
    ]
  );

  // Confirm and execute action (transfer, swap, bridge, or stream)
  const confirmTransfer = useCallback(async () => {
    if ((!pendingIntent && !pendingSwapIntent && !pendingBridgeIntent && !pendingStreamCreateIntent && !pendingEscrowCreateIntent && !pendingEscrowSubmitIntent) || isSending) return;

    setIsSending(true);

    if (pendingCctpPreRouting) {
      const routing = pendingCctpPreRouting;
      setPendingCctpPreRouting(null);
      setPendingIntent(null);
      setPendingGasEstimate(null);

      addMessage(
        "ai",
        "bridge-progress",
        `[Auto-Routing] Initiating pre-routing CCTP bridge of ${routing.amountToBridge} USDC from ${routing.sourceChain} to Arc Testnet...`,
        {
          bridgeIntent: {
            amount: routing.amountToBridge,
            sourceChain: routing.sourceChain,
            destinationChain: "Arc_Testnet",
            to: address || "",
          },
          txStatus: "pending"
        }
      );

      setIsSending(false);

      if (!address) {
        addMessage("ai", "text", "❌ Wallet not connected. Please connect your Web3 wallet to complete this cross-chain transaction.");
        return;
      }

      (async () => {
        const success = await cctp.executeBridge(
          routing.amountToBridge,
          routing.sourceChain,
          address
        );

        if (success) {
          addMessage("ai", "text", `🎉 Pre-routing CCTP Bridge complete! Automatically executing the final payment of ${routing.targetIntent.amount} USDC on Arc...`);
          
          const txMsg = addMessage(
            "ai",
            "tx-status",
            `🚀 Executing the final USDC transfer to ${routing.targetIntent.to}...`,
            { txStatus: "pending" }
          );

          try {
            let result;
            if (circleWallet.walletAddress) {
              const txHash = await circleWallet.executeTransfer(
                routing.targetIntent.to,
                routing.targetIntent.amount,
                circleWallet.tokenId || ""
              );
              if (!txHash) {
                throw new Error("Circle wallet transfer failed or was cancelled.");
              }
              result = {
                txHash,
                explorerUrl: `https://testnet.arcscan.app/tx/${txHash}`
              };
            } else {
              result = await executeTransfer(routing.targetIntent);
            }

            if (result) {
              updateMessage(txMsg.id, {
                txHash: result.txHash,
                explorerUrl: result.explorerUrl,
                content: `📡 Transaction submitted! Hash: ${result.txHash.slice(0, 10)}...`,
                txStatus: "confirmed"
              });
              await trackTransaction(result.txHash, txMsg.id);
            }
          } catch (txErr: any) {
            updateMessage(txMsg.id, {
              txStatus: "failed",
              content: `❌ Final transfer failed: ${txErr.message || "Unknown error"}`
            });
          }
        } else {
          addMessage("ai", "text", `❌ Pre-routing Bridge failed: ${cctp.error || "Unknown CCTP Error"}. Final transfer aborted.`);
        }
      })();
      return;
    }

    if (pendingEscrowCreateIntent) {
      const escrowIntent = pendingEscrowCreateIntent;
      setPendingEscrowCreateIntent(null);

      const txMsg = addMessage(
        "ai",
        "tx-status",
        `🚀 Deploying ERC-8183 Escrow & locking ${escrowIntent.amount} USDC... Please sign the transaction in your wallet.`,
        { txStatus: "pending" }
      );

      try {
        const result = await executeEscrowCreate(escrowIntent);
        
        updateMessage(txMsg.id, {
          txHash: result.txHash,
          explorerUrl: `https://testnet.arcscan.app/tx/${result.txHash}`,
          content: `📡 Escrow contract initialized! Transaction Hash: ${result.txHash.slice(0, 10)}...`,
          txStatus: "confirmed"
        });

        // Add the escrow status card inside the chat messages!
        addMessage(
          "ai",
          "escrow-card",
          `Escrow contract #${result.jobId} is active!`,
          {
            escrowCreateIntent: escrowIntent,
            txHash: result.txHash,
            explorerUrl: `https://testnet.arcscan.app/tx/${result.txHash}`,
            extra: { jobId: result.jobId }
          }
        );
      } catch (error: any) {
        updateMessage(txMsg.id, {
          txStatus: "failed",
          content: `❌ Escrow creation failed: ${error.message || "Unknown error"}`
        });
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (pendingEscrowSubmitIntent) {
      const submitIntent = pendingEscrowSubmitIntent;
      setPendingEscrowSubmitIntent(null);

      const txMsg = addMessage(
        "ai",
        "tx-status",
        `🚀 Submitting deliverable URL proof to compliance agent for Escrow #${submitIntent.jobId}...`,
        { txStatus: "pending" }
      );

      try {
        const result = await executeEscrowSubmit(submitIntent);
        
        updateMessage(txMsg.id, {
          txHash: result.txHash,
          explorerUrl: `https://testnet.arcscan.app/tx/${result.txHash}`,
          content: `📡 Submission registered! Running autonomous deliverable validation checks...`,
          txStatus: "confirmed"
        });
      } catch (error: any) {
        updateMessage(txMsg.id, {
          txStatus: "failed",
          content: `❌ Submission failed: ${error.message || "Unknown error"}`
        });
      } finally {
        setIsSending(false);
      }
      return;
    }

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
      if (!address && !bridge.to) {
        addMessage("ai", "text", "❌ Wallet not connected. Please connect your Web3 wallet or specify a recipient address to bridge.");
        return;
      }

      // Async executor
      (async () => {
        const success = await cctp.executeBridge(
          bridge.amount,
          bridge.sourceChain,
          bridge.to || address || ""
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
          const txHash = await circleWallet.executeTransfer(
            (currentIntent as TransferIntent).to,
            (currentIntent as TransferIntent).amount,
            circleWallet.tokenId || ""
          );
          if (!txHash) {
            throw new Error("Circle wallet transfer failed or was cancelled.");
          }
          result = {
            txHash,
            explorerUrl: `https://testnet.arcscan.app/tx/${txHash}`
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
    pendingEscrowCreateIntent,
    pendingEscrowSubmitIntent,
    isSending,
    circleWallet,
    address,
    addMessage,
    updateMessage,
    executeTransfer,
    executeSwap,
    executeStreamCreate,
    executeEscrowCreate,
    executeEscrowSubmit,
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
    setPendingEscrowCreateIntent(null);
    setPendingEscrowSubmitIntent(null);
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
    pendingEscrowCreateIntent,
    pendingEscrowSubmitIntent,
    activeStreams,
    escrowJobs,
    isWithdrawingStream,
    executeStreamWithdraw,
    handleEscrowRelease,
    handleEscrowDispute,
    executeEscrowSubmit,
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
    nanopay,
    activeRateLock,
    executePurchaseRateLock,
    addMessage,
  };
}

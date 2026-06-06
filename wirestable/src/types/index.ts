/** Parsed intent from LLM */
export interface TransferIntent {
  amount: string;
  to: string;
  chain: "Arc_Testnet";
  token: "USDC" | "EURC";
  recipientName?: string;
}

export interface SwapIntent {
  amountIn: string;
  tokenIn: "USDC" | "EURC";
  tokenOut: "USDC" | "EURC";
  chain: "Arc_Testnet";
}

export interface BridgeIntent {
  amount: string;
  sourceChain: string; // e.g., "Sepolia", "Base", "Arbitrum"
  destinationChain: "Arc_Testnet";
  to: string;
}

/** Gas estimation result */
export interface GasEstimate {
  fee: string;
  gas: bigint;
  gasPrice: bigint;
}

/** Chat message types */
export type MessageRole = "user" | "ai" | "system";
export type MessageType =
  | "text"
  | "confirmation"
  | "tx-status"
  | "error-explanation"
  | "typing"
  | "bridge-progress";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  timestamp: Date;
  /** Attached intent for confirmation card */
  intent?: TransferIntent;
  /** Attached swap intent for swap confirmation card */
  swapIntent?: SwapIntent;
  /** Attached bridge intent for bridging */
  bridgeIntent?: BridgeIntent;
  /** Gas estimate for confirmation */
  gasEstimate?: GasEstimate;
  /** Transaction hash after send */
  txHash?: string;
  /** Transaction status */
  txStatus?: "pending" | "confirmed" | "failed";
  /** Explorer URL */
  explorerUrl?: string;
  /** Error details for MCP explainer */
  errorDetails?: {
    code: string;
    title: string;
    explanation: string;
    suggestion: string;
  };
}

/** LLM parse response from API */
export interface ParseResponse {
  type: "transfer" | "swap" | "error_query" | "general" | "greeting" | "bridge";
  intent?: TransferIntent;
  swapIntent?: SwapIntent;
  bridgeIntent?: BridgeIntent;
  errorCode?: string;
  message: string;
}

/** MCP error explanation */
export interface ErrorExplanation {
  code: string;
  title: string;
  explanation: string;
  suggestion: string;
}

/** Voice recognition state */
export interface VoiceState {
  isListening: boolean;
  transcript: string;
  error: string | null;
}

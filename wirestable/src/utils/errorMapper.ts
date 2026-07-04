export interface MappedError {
  code: string;
  title: string;
  message: string;
  actionText?: string;
  actionType?: "retry" | "support" | "dismiss";
}

export function mapRawError(error: unknown): MappedError {
  if (!error) {
    return {
      code: "UNKNOWN_ERROR",
      title: "Unknown Error",
      message: "An unexpected error occurred. Please try again.",
      actionType: "dismiss",
    };
  }

  // Convert error to string or extract message
  let message = "";
  let name = "";
  let stack = "";

  if (error instanceof Error) {
    message = error.message;
    name = error.name;
    stack = error.stack || "";
  } else if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object") {
    try {
      message = (error as any).message || JSON.stringify(error);
      name = (error as any).name || (error as any).code || "";
    } catch {
      message = String(error);
    }
  }

  const errStr = `${name} ${message} ${stack}`.toLowerCase();

  // 1. API & Network errors
  if (errStr.includes("429") || errStr.includes("too many requests") || errStr.includes("ratelimit")) {
    return {
      code: "RATE_LIMIT",
      title: "Rate Limit Exceeded",
      message: "You are making requests too quickly. Please wait a moment and try again.",
      actionText: "Try Again",
      actionType: "retry",
    };
  }

  if (
    errStr.includes("network error") ||
    errStr.includes("fetch failed") ||
    errStr.includes("failed to fetch") ||
    errStr.includes("http status 0") ||
    errStr.includes("timeout") ||
    errStr.includes("econnrefused")
  ) {
    return {
      code: "NETWORK_ERROR",
      title: "Network Connectivity Issue",
      message: "We're having trouble connecting to our servers. Check your internet connection.",
      actionText: "Retry Connection",
      actionType: "retry",
    };
  }

  if (errStr.includes("401") || errStr.includes("unauthorized") || errStr.includes("invalid token")) {
    return {
      code: "UNAUTHORIZED",
      title: "Authentication Required",
      message: "Your session has expired or you are unauthorized. Please sign in again.",
      actionText: "Sign In",
      actionType: "retry",
    };
  }

  if (errStr.includes("403") || errStr.includes("forbidden") || errStr.includes("permission denied")) {
    return {
      code: "FORBIDDEN",
      title: "Permission Denied",
      message: "You do not have the required permissions to perform this action.",
      actionType: "dismiss",
    };
  }

  // 2. Web3 & Wallet errors
  if (
    errStr.includes("user rejected") ||
    errStr.includes("user cancelled") ||
    errStr.includes("user denied") ||
    errStr.includes("rejected by user") ||
    errStr.includes("cancel transaction") ||
    errStr.includes("action_rejected")
  ) {
    return {
      code: "WALLET_REJECTED",
      title: "Transaction Cancelled",
      message: "You declined the request in your wallet. No tokens were moved.",
      actionType: "dismiss",
    };
  }

  if (errStr.includes("insufficient funds") || errStr.includes("insufficient balance") || errStr.includes("gas limit")) {
    return {
      code: "INSUFFICIENT_FUNDS",
      title: "Insufficient Balance",
      message: "You do not have enough funds or gas tokens (like USDC or native gas) to execute this transaction.",
      actionText: "Add Funds",
      actionType: "support",
    };
  }

  if (errStr.includes("nonce too low") || errStr.includes("replacement transaction underpriced")) {
    return {
      code: "NONCE_ERROR",
      title: "Transaction Out of Sync",
      message: "Your wallet transaction nonce is out of sync. Please wait for other pending transactions or reset your wallet account.",
      actionText: "Retry",
      actionType: "retry",
    };
  }

  if (errStr.includes("switch chain") || errStr.includes("chain not supported") || errStr.includes("wrong chain")) {
    return {
      code: "CHAIN_MISMATCH",
      title: "Incorrect Network",
      message: "Your wallet is connected to the wrong blockchain. Please switch to Arc Testnet.",
      actionText: "Switch Network",
      actionType: "retry",
    };
  }

  // 3. Circle UCW & Pin authentication specific errors
  if (errStr.includes("pin incorrect") || errStr.includes("invalid pin") || errStr.includes("incorrect pin")) {
    return {
      code: "INCORRECT_PIN",
      title: "Incorrect Security PIN",
      message: "The 6-digit security PIN you entered is incorrect. Please try again.",
      actionText: "Try Again",
      actionType: "retry",
    };
  }

  if (errStr.includes("pin locked") || errStr.includes("too many pin attempts")) {
    return {
      code: "PIN_LOCKED",
      title: "Security PIN Locked",
      message: "Your security PIN has been temporarily locked due to too many incorrect attempts. Please contact support.",
      actionText: "Contact Support",
      actionType: "support",
    };
  }

  // 4. Input validation & specific app logic
  if (errStr.includes("validation failed") || errStr.includes("invalid input") || errStr.includes("missing parameter")) {
    return {
      code: "VALIDATION_FAILED",
      title: "Invalid Request Details",
      message: "Some fields are missing or contain incorrect data. Please check your entries and try again.",
      actionType: "dismiss",
    };
  }

  if (errStr.includes("nanopay") || errStr.includes("channel balance") || errStr.includes("insufficient channel")) {
    return {
      code: "NANOPAYMENT_ERROR",
      title: "Nanopay Channel Issue",
      message: "The micro-payment channel has insufficient balance or has been closed. Please open or fund the channel first.",
      actionText: "Fund Channel",
      actionType: "retry",
    };
  }

  // Fallback for uncaught errors
  return {
    code: "GENERAL_FAILURE",
    title: "Operation Failed",
    message: message || "An unexpected error occurred during execution. Please contact support if this persists.",
    actionText: "Close",
    actionType: "dismiss",
  };
}

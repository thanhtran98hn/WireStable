import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "",
    baseURL: "https://api.deepseek.com",
  });
}

/**
 * MCP-Powered Error Explainer
 * Uses Circle MCP Server documentation context to explain transaction errors.
 * Falls back to OpenAI with Circle-specific knowledge when MCP is unavailable.
 */

// Known Circle/blockchain error codes database
const KNOWN_ERRORS: Record<string, { title: string; explanation: string; suggestion: string }> = {
  "155104": {
    title: "Invalid User Token",
    explanation: "The user authentication token provided to Circle's API is expired or invalid. This typically occurs when a session has timed out or the token was not properly refreshed.",
    suggestion: "Re-authenticate the user by generating a new user token through Circle's authentication flow. Check that your token refresh logic is working correctly.",
  },
  "155101": {
    title: "Invalid Entity Secret",
    explanation: "The entity secret used for developer-controlled wallet operations is incorrect or has been rotated without updating the application configuration.",
    suggestion: "Verify your entity secret in the Circle Developer Console. Ensure the secret matches what's configured in your environment variables.",
  },
  "155201": {
    title: "Insufficient Funds",
    explanation: "The wallet does not have enough USDC balance to complete the transaction, including gas fees. On Arc Testnet, gas is paid in USDC.",
    suggestion: "Fund your wallet with testnet USDC from https://faucet.circle.com. Remember that Arc uses USDC for gas, so you need extra USDC beyond the transfer amount.",
  },
  "155301": {
    title: "Invalid Recipient Address",
    explanation: "The destination address is not a valid Ethereum address or has an incorrect checksum. This can happen when an address is truncated or contains typos.",
    suggestion: "Verify the recipient address is a valid 42-character hex string starting with '0x'. Use viem's isAddress() or getAddress() to validate and normalize the address.",
  },
  "155401": {
    title: "Transaction Reverted",
    explanation: "The smart contract execution reverted. This can occur due to insufficient allowance, contract paused state, or failed validation checks within the contract.",
    suggestion: "Check the transaction on Arcscan (https://testnet.arcscan.app) for detailed revert reasons. Ensure you have proper USDC approval if interacting with contracts.",
  },
  "155501": {
    title: "Gas Estimation Failed",
    explanation: "The node could not estimate gas for this transaction. This usually means the transaction would fail if submitted, often due to insufficient balance or invalid parameters.",
    suggestion: "Verify you have enough USDC for both the transfer amount and gas. Check that all transaction parameters (to, value, data) are correctly formatted.",
  },
  "155601": {
    title: "Nonce Too Low",
    explanation: "The transaction nonce is lower than expected, meaning a transaction with this nonce has already been mined. This happens when transactions are sent too quickly.",
    suggestion: "Wait for pending transactions to confirm before sending new ones. If stuck, you may need to reset your wallet's nonce tracking.",
  },
  "155701": {
    title: "Chain ID Mismatch",
    explanation: "The transaction was signed for a different chain than the one it's being submitted to. Arc Testnet's chain ID is 5042002.",
    suggestion: "Ensure your wallet and application are both connected to Arc Testnet (chain ID: 5042002). Check your wagmi/viem configuration.",
  },
};

const SYSTEM_PROMPT = `You are a Circle developer support assistant integrated with Circle's MCP Server.
You help developers understand blockchain transaction errors, especially on the Arc Testnet.

When explaining errors:
1. Identify the error type (Circle API error, on-chain revert, RPC error, gas error)
2. Explain in plain language what went wrong
3. Provide a concrete fix or next step
4. Reference relevant Circle documentation when applicable

Key Arc Testnet facts:
- Chain ID: 5042002
- USDC is the native gas token (no ETH needed)
- ERC-20 USDC address: 0x3600000000000000000000000000000000000000
- Explorer: https://testnet.arcscan.app
- Faucet: https://faucet.circle.com
- RPC: https://rpc.testnet.arc.network

Circle MCP Server: https://api.circle.com/v1/codegen/mcp
Circle Developer Docs: https://developers.circle.com

Respond in JSON format:
{
  "code": "the error code",
  "title": "short error title",
  "explanation": "detailed explanation",
  "suggestion": "actionable fix"
}`;

export async function POST(request: NextRequest) {
  try {
    const { errorCode, errorMessage } = await request.json();

    if (!errorCode && !errorMessage) {
      return NextResponse.json(
        { error: "Error code or message is required" },
        { status: 400 }
      );
    }

    // Check known errors first
    if (errorCode && KNOWN_ERRORS[errorCode]) {
      return NextResponse.json({
        code: errorCode,
        ...KNOWN_ERRORS[errorCode],
      });
    }

    // Fall back to LLM for unknown errors
    if (!process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        code: errorCode || "unknown",
        title: "Error Lookup Unavailable",
        explanation: "The AI error explainer requires a DeepSeek API key to be configured.",
        suggestion: "Set DEEPSEEK_API_KEY in your .env file, or check the Circle documentation at https://developers.circle.com for error codes.",
      });
    }

    const userMessage = errorCode
      ? `Explain Circle/blockchain error code ${errorCode}. ${errorMessage ? `The error message is: "${errorMessage}"` : ""}`
      : `Explain this blockchain/Circle error: "${errorMessage}"`;

    const completion = await getOpenAI().chat.completions.create({
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        code: errorCode || "unknown",
        title: "Error Analysis",
        explanation: responseText,
        suggestion: "Check the Circle documentation at https://developers.circle.com for more details.",
      };
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("MCP Error Explainer error:", error);
    return NextResponse.json(
      {
        code: "system",
        title: "Service Error",
        explanation: "The error explanation service is temporarily unavailable.",
        suggestion: "Try again or check https://developers.circle.com for documentation.",
      },
      { status: 200 }
    );
  }
}

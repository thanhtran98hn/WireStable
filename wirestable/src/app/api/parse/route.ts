import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { keccak256 } from "viem";
import { rateLimit } from "@/utils/rateLimiter";
import { logger } from "@/utils/logger";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
}

const SYSTEM_PROMPT = `You are WireStable, an AI remittance assistant that helps users send USDC on the Arc Testnet blockchain.

Your job is to parse user messages and extract their intent. You MUST respond with valid JSON only.

## Intent Types:
1. **transfer** — User wants to send USDC or EURC to someone on Arc
2. **swap** — User wants to exchange/swap their USDC for EURC (or vice versa) on Arc
3. **error_query** — User is asking about a transaction error code
4. **greeting** — User is saying hello or asking what you can do
5. **general** — Any other question about USDC, Arc, or crypto
6. **bridge** — User wants to bridge/move/transfer USDC from an external network (like Base, Arbitrum, Sepolia) to Arc Testnet.
7. **corporate_batch** — User wants to pay, disburse, or execute a corporate/contractor payroll batch from the treasury.
8. **stream_create** — User wants to start, create, or initiate a continuous salary stream of tokens (USDC) to a recipient address on Arc.
9. **stream_withdraw** — User wants to withdraw, claim, or pull accrued earnings/funds from their salary stream on Arc.
10. **escrow_create** — User wants to create, lock, or start an escrow job or milestone payment for a provider/freelancer/agent on Arc.
11. **escrow_submit** — User wants to submit a deliverable link or proof of work for an escrow job.

## For "transfer" intents, extract:
- amount: The USDC amount as a string (e.g., "100", "1000.50")
- to: The recipient wallet address (must start with 0x and be 42 characters)
- recipientName: If the user mentions a name for the recipient
- chain: Always "Arc_Testnet"
- token: "USDC" or "EURC"

## For "swap" intents, extract:
- amountIn: The amount to swap (e.g., "100")
- tokenIn: The token to sell (either "USDC" or "EURC")
- tokenOut: The token to buy (either "USDC" or "EURC")
- chain: Always "Arc_Testnet"

## For "bridge" intents, extract:
- amount: The USDC amount to bridge as a string (e.g., "50")
- sourceChain: The origin blockchain name mentioned (e.g., "Sepolia", "Base", "Arbitrum")
- destinationChain: Always "Arc_Testnet"
- to: The recipient address on Arc Testnet (e.g., a 0x... address). If they say "bridge 50 USDC from Base to Arc", set this to the recipient address mentioned or leave empty/set to user's address if not specified.

## For "stream_create" intents, extract:
- amount: The weekly, monthly, or total USDC amount to stream (e.g. "100")
- ratePerSecond: The flow rate of micro-USDC (6 decimals) per second. Example: if 100 USDC per week, ratePerSecond is "165" (which is ~100 USDC / 604800 seconds * 10^6).
- to: The recipient wallet address (starts with 0x, 42 characters)
- durationSeconds: The length of stream in seconds (e.g. "604800" for a week, "2592000" for a month)

## For "stream_withdraw" intents, extract:
- streamId: The stream ID integer (e.g. "1" or "2"), or "1" if not specified.
- amount: The amount user wants to withdraw if they specified it (e.g. "50"), or empty if they want to withdraw all.

## For "escrow_create" intents, extract:
- amount: The USDC amount to lock in escrow as a string (e.g., "500")
- to: The freelancer/employee/provider wallet address (starts with 0x, 42 characters)
- deliverableHash: A mock bytes32 description hash (if they mention tasks, e.g. "build a logo", generate a mock hash like "0x48656c6c6f000000000000000000000000000000000000000000000000000000").

## For "escrow_submit" intents, extract:
- jobId: The job ID integer (e.g., "1")
- url: The deliverable proof URL link (e.g., "https://github.com/my-freelance-repo")

## For "error_query" intents, extract:
- errorCode: The error code number (e.g., "155104")

## Important Rules:
- If the user provides an incomplete address (not 42 chars or missing 0x), set to to "" and ask them to provide the full address.
- If the user doesn't specify an amount, set amount to "" and ask.
- USDC amounts should be reasonable (0.01 to 1,000,000).
- Always respond in the same language the user uses.
- The destination chain is ALWAYS "Arc_Testnet".

## Response Format:
{
  "type": "transfer" | "swap" | "error_query" | "general" | "greeting" | "bridge" | "corporate_batch" | "stream_create" | "stream_withdraw" | "escrow_create" | "escrow_submit",
  "intent": { "amount": "...", "to": "0x...", "chain": "Arc_Testnet", "token": "USDC", "recipientName": "..." },
  "swapIntent": { "amountIn": "...", "tokenIn": "USDC", "tokenOut": "EURC", "chain": "Arc_Testnet" },
  "bridgeIntent": { "amount": "...", "sourceChain": "...", "destinationChain": "Arc_Testnet", "to": "0x..." },
  "streamCreateIntent": { "amount": "...", "ratePerSecond": "...", "to": "0x...", "durationSeconds": "..." },
  "streamWithdrawIntent": { "streamId": "...", "amount": "..." },
  "escrowCreateIntent": { "amount": "...", "to": "0x...", "deliverableHash": "..." },
  "escrowSubmitIntent": { "jobId": "...", "url": "..." },
  "errorCode": "...",
  "message": "A friendly, conversational response to the user"
}

Only include corresponding intent block based on the type.`;

export async function POST(request: NextRequest) {
  const limiter = rateLimit(request, 30);
  if (!limiter.success) {
    logger.warn({
      category: "API",
      event: "RATE_LIMIT_EXCEEDED",
      message: "Rate limit reached on POST parse API",
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const paymentToken = request.headers.get("x402-payment-token") || request.headers.get("X-PAYMENT");

    if (!paymentToken) {
      logger.warn({
        category: "AUTH",
        event: "MISSING_PAYMENT_TOKEN",
        message: "Attempted to access parse API without x402-payment-token header",
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
      });
      return NextResponse.json(
        { 
          error: "402 Payment Required", 
          message: "Please open and fund a Circle Gateway nanopayments channel to use the conversational AI assistant ($0.0005 USDC/msg)." 
        },
        { status: 402 }
      );
    }

    // Decode and validate token structural signature
    try {
      const decodedPayload = JSON.parse(atob(paymentToken));
      if (!decodedPayload.channelId || !decodedPayload.signature || !decodedPayload.cumulativeAmount) {
        throw new Error("Invalid payload format");
      }
      logger.info({
        category: "AUTH",
        event: "NANOPAYMENT_VERIFIED",
        message: `Verified nanopayment channel: ${decodedPayload.channelId}`,
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
        metadata: {
          channelId: decodedPayload.channelId,
          cumulativeSpent: decodedPayload.cumulativeAmount,
        },
      });
    } catch (err) {
      logger.warn({
        category: "AUTH",
        event: "INVALID_PAYMENT_TOKEN",
        message: "Attempted to access parse API with malformed payment token",
        ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
      });
      return NextResponse.json(
        { error: "Invalid payment token signature structure" },
        { status: 402 }
      );
    }

    const { message, conversationHistory } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Include recent conversation history for context
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-6);
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = {
        type: "general",
        message: "I couldn't understand that. Could you try rephrasing?",
      };
    }

    // Validate transfer intent
    if (parsed.type === "transfer" && parsed.intent) {
      const { to, amount } = parsed.intent;
      
      // Validate address format
      if (to && (!/^0x[a-fA-F0-9]{40}$/.test(to))) {
        parsed.intent.to = "";
        parsed.message = `The wallet address doesn't look right. Please provide a valid Ethereum address (starts with 0x, 42 characters total). ${parsed.message || ""}`;
      }

      // Validate amount
      if (amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          parsed.intent.amount = "";
          parsed.message = `The amount doesn't seem valid. Please specify a positive USDC amount. ${parsed.message || ""}`;
        }
      }

      // Ensure chain is always Arc_Testnet
      parsed.intent.chain = "Arc_Testnet";
      if (!parsed.intent.token) parsed.intent.token = "USDC";
    }

    // Validate swap intent
    if (parsed.type === "swap" && parsed.swapIntent) {
      const { amountIn, tokenIn, tokenOut } = parsed.swapIntent;
      
      if (amountIn) {
        const numAmount = parseFloat(amountIn);
        if (isNaN(numAmount) || numAmount <= 0) {
          parsed.swapIntent.amountIn = "";
          parsed.message = `The amount doesn't seem valid. Please specify a positive amount. ${parsed.message || ""}`;
        }
      }

      parsed.swapIntent.chain = "Arc_Testnet";
      if (!tokenIn) parsed.swapIntent.tokenIn = "USDC";
      if (!tokenOut) parsed.swapIntent.tokenOut = "EURC";
    }

    // Validate bridge intent
    if (parsed.type === "bridge" && parsed.bridgeIntent) {
      const { to, amount, sourceChain } = parsed.bridgeIntent;
      
      if (to && (!/^0x[a-fA-F0-9]{40}$/.test(to))) {
        parsed.bridgeIntent.to = "";
        parsed.message = `The wallet address doesn't look right. Please provide a valid Ethereum address. ${parsed.message || ""}`;
      }

      if (amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          parsed.bridgeIntent.amount = "";
          parsed.message = `The amount doesn't seem valid. Please specify a positive USDC amount. ${parsed.message || ""}`;
        }
      }

      // Map/Standardize source chain
      let cleanSource = "Sepolia";
      if (sourceChain) {
        const sc = sourceChain.toLowerCase();
        if (sc.includes("base")) cleanSource = "Base";
        else if (sc.includes("arbitrum") || sc.includes("arb")) cleanSource = "Arbitrum";
        else if (sc.includes("sepolia") || sc.includes("ethereum") || sc.includes("eth")) cleanSource = "Sepolia";
      }
      parsed.bridgeIntent.sourceChain = cleanSource;
      parsed.bridgeIntent.destinationChain = "Arc_Testnet";
    }

    // Validate escrow_create intent
    if (parsed.type === "escrow_create" && parsed.escrowCreateIntent) {
      const { to, amount } = parsed.escrowCreateIntent;
      
      if (to && (!/^0x[a-fA-F0-9]{40}$/.test(to))) {
        parsed.escrowCreateIntent.to = "";
        parsed.message = `The employee wallet address doesn't look right. Please provide a valid Ethereum address. ${parsed.message || ""}`;
      }

      if (amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          parsed.escrowCreateIntent.amount = "";
          parsed.message = `The escrow amount is invalid. Please specify a positive USDC amount. ${parsed.message || ""}`;
        }
      }

      if (!parsed.escrowCreateIntent.deliverableHash) {
        parsed.escrowCreateIntent.deliverableHash = "0x8e83e5c7075c1c09893d596489b4de5de586616fe78ba574fe328905b9b81b212";
      }
    }

    // Validate escrow_submit intent
    if (parsed.type === "escrow_submit" && parsed.escrowSubmitIntent) {
      const { jobId, url } = parsed.escrowSubmitIntent;
      
      if (!jobId) {
        parsed.escrowSubmitIntent.jobId = "1";
      }

      if (url && !url.startsWith("http")) {
        parsed.escrowSubmitIntent.url = "";
        parsed.message = `The project delivery URL is invalid. Please provide a valid HTTP or HTTPS link. ${parsed.message || ""}`;
      }
    }

    // Cryptographically sign the parsed transaction payload hash with the agent key
    const transactionalTypes = ["transfer", "swap", "bridge", "stream_create", "stream_withdraw", "escrow_create", "escrow_submit"];
    if (transactionalTypes.includes(parsed.type)) {
      try {
        let keyToUse = process.env.AGENT_PRIVATE_KEY;
        if (!keyToUse) {
          logger.warn({
            category: "SECURITY",
            event: "MISSING_AGENT_KEY",
            message: "AGENT_PRIVATE_KEY is missing from environment. Generating transient random key fallback.",
            ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          });
          keyToUse = generatePrivateKey();
        }
        
        const account = privateKeyToAccount(keyToUse as `0x${string}`);
        
        const payloadData = {
          type: parsed.type,
          intent: parsed.transferIntent || parsed.swapIntent || parsed.bridgeIntent || parsed.streamCreateIntent || parsed.streamWithdrawIntent || parsed.escrowCreateIntent || parsed.escrowSubmitIntent
        };

        const hash = keccak256(new TextEncoder().encode(JSON.stringify(payloadData)));
        const signature = await account.signMessage({ message: { raw: hash } });

        parsed.agentSignature = signature;
        parsed.agentPayloadHash = hash;

        logger.info({
          category: "SECURITY",
          event: "PAYLOAD_SIGNED",
          message: `Successfully generated ERC-8004 signature for ${parsed.type} intent`,
          ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          metadata: {
            type: parsed.type,
            hash,
          },
        });
      } catch (signErr) {
        logger.error({
          category: "SECURITY",
          event: "PAYLOAD_SIGNING_FAILED",
          message: "Agent cryptographic signature generation failed",
          ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
          metadata: {
            error: signErr instanceof Error ? signErr.message : String(signErr),
          },
        });
      }
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Parse API error:", error);
    
    if (error instanceof Error && error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid OpenAI API key" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        type: "general",
        message: "Sorry, I'm having trouble processing your request. Please try again.",
      },
      { status: 200 }
    );
  }
}

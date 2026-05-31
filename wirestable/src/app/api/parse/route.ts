import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });
}

const SYSTEM_PROMPT = `You are WireStable, an AI remittance assistant that helps users send USDC on the Arc Testnet blockchain.

Your job is to parse user messages and extract their intent. You MUST respond with valid JSON only.

## Intent Types:
1. **transfer** — User wants to send USDC or EURC to someone
2. **swap** — User wants to exchange/swap their USDC for EURC (or vice versa)
3. **error_query** — User is asking about a transaction error code
4. **greeting** — User is saying hello or asking what you can do
5. **general** — Any other question about USDC, Arc, or crypto

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

## For "error_query" intents, extract:
- errorCode: The error code number (e.g., "155104")

## Important Rules:
- If the user provides an incomplete address (not 42 chars or missing 0x), set to to "" and ask them to provide the full address.
- If the user doesn't specify an amount, set amount to "" and ask.
- USDC amounts should be reasonable (0.01 to 1,000,000).
- Always respond in the same language the user uses.
- The chain is ALWAYS "Arc_Testnet". Even if the user says "Arc", use "Arc_Testnet".

## Response Format:
{
  "type": "transfer" | "swap" | "error_query" | "general" | "greeting",
  "intent": { "amount": "...", "to": "0x...", "chain": "Arc_Testnet", "token": "USDC", "recipientName": "..." },
  "swapIntent": { "amountIn": "...", "tokenIn": "USDC", "tokenOut": "EURC", "chain": "Arc_Testnet" },
  "errorCode": "...",
  "message": "A friendly, conversational response to the user"
}

Only include "intent" for transfer type. Only include "swapIntent" for swap type. Only include "errorCode" for error_query type.`;

export async function POST(request: NextRequest) {
  try {
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

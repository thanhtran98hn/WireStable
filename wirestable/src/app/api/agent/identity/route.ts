import { NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";

// Simulated Agent Private Key for Sandbox environments if not set in process.env
const DEFAULT_AGENT_PRIVATE_KEY = "0x8183e5c7075c1c09893d596489b4de5de586616fe78654c60b9f1d071987c532";

// Global simulated in-memory state for Agent Reputation
let agentReputationRating = 100;

export async function GET() {
  try {
    const privateKey = (process.env.AGENT_PRIVATE_KEY || DEFAULT_AGENT_PRIVATE_KEY) as `0x${string}`;
    const account = privateKeyToAccount(privateKey);

    return NextResponse.json({
      success: true,
      agentName: "WireStable Agent v1",
      ipfsHashMetadata: "ipfs://QmVerifiableAgentMetadataSchemaERC8004",
      registryAddress: "0x8004e3b79ce858c0df1b44ec069f1092eb27ef86",
      agentAddress: account.address,
      reputationRating: agentReputationRating,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === "upvote") {
      agentReputationRating += 1;
    } else if (action === "downvote") {
      agentReputationRating -= 1;
    } else {
      return NextResponse.json({ success: false, error: "Invalid rating action" }, { status: 400 });
    }

    const privateKey = (process.env.AGENT_PRIVATE_KEY || DEFAULT_AGENT_PRIVATE_KEY) as `0x${string}`;
    const account = privateKeyToAccount(privateKey);

    return NextResponse.json({
      success: true,
      reputationRating: agentReputationRating,
      agentAddress: account.address,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

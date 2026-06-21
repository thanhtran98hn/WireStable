import { NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";
import fs from "fs";
import path from "path";

// Simulated Agent Private Key for Sandbox environments if not set in process.env
const DEFAULT_AGENT_PRIVATE_KEY = "0x8183e5c7075c1c09893d596489b4de5de586616fe78654c60b9f1d071987c532";
const reputationFilePath = path.resolve(process.cwd(), "agent_reputation.json");

function getReputation(): number {
  if (fs.existsSync(reputationFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(reputationFilePath, "utf-8"));
      return typeof data.reputation === "number" ? data.reputation : 100;
    } catch (e) {
      console.error("Failed to read agent_reputation.json:", e);
    }
  }
  return 100;
}

function saveReputation(reputation: number) {
  try {
    fs.writeFileSync(reputationFilePath, JSON.stringify({ reputation }), "utf-8");
  } catch (e) {
    console.error("Failed to write agent_reputation.json:", e);
  }
}

export async function GET() {
  try {
    const privateKey = (process.env.AGENT_PRIVATE_KEY || DEFAULT_AGENT_PRIVATE_KEY) as `0x${string}`;
    const account = privateKeyToAccount(privateKey);
    const reputation = getReputation();

    return NextResponse.json({
      success: true,
      agentName: "WireStable Agent v1",
      ipfsHashMetadata: "ipfs://QmVerifiableAgentMetadataSchemaERC8004",
      registryAddress: "0x8004e3b79ce858c0df1b44ec069f1092eb27ef86",
      agentAddress: account.address,
      reputationRating: reputation,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    let reputation = getReputation();

    if (action === "upvote") {
      reputation += 1;
    } else if (action === "downvote") {
      reputation -= 1;
    } else {
      return NextResponse.json({ success: false, error: "Invalid rating action" }, { status: 400 });
    }

    saveReputation(reputation);

    const privateKey = (process.env.AGENT_PRIVATE_KEY || DEFAULT_AGENT_PRIVATE_KEY) as `0x${string}`;
    const account = privateKeyToAccount(privateKey);

    return NextResponse.json({
      success: true,
      reputationRating: reputation,
      agentAddress: account.address,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

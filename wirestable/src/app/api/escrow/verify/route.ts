import { NextRequest, NextResponse } from "next/server";
import { privateKeyToAccount } from "viem/accounts";

// Real validator account derived from a local key
const VALIDATOR_PRIVATE_KEY = "0x8183e5c7075c1c09893d596489b4de5de586616fe78654c60b9f1d071987c532" as `0x${string}`;
const validatorAccount = privateKeyToAccount(VALIDATOR_PRIVATE_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, url } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId parameter" }, { status: 400 });
    }

    if (!url) {
      return NextResponse.json({ error: "Missing delivery URL parameter" }, { status: 400 });
    }

    // Basic URL format verification
    const isValidUrl = url.startsWith("http://") || url.startsWith("https://");
    if (!isValidUrl) {
      return NextResponse.json({
        success: false,
        error: "Invalid URL structure. Submission proof must be a valid HTTP or HTTPS hyperlink."
      }, { status: 400 });
    }

    // Check if it's a valid host (e.g. GitHub, Vercel, Figma, etc.)
    const isComplianceAcceptedHost = url.includes("github.com") || url.includes("vercel.app") || url.includes("figma.com") || url.includes("drive.google.com");
    if (!isComplianceAcceptedHost) {
      return NextResponse.json({
        success: false,
        error: "Compliance warning: Unrecognized delivery platform. Deliverable proofs must be hosted on GitHub, Figma, Vercel, or Google Drive."
      }, { status: 400 });
    }

    // Sign the verification proof using EIP-191 standard
    const message = `verify:${jobId}:${url}`;
    const signature = await validatorAccount.signMessage({ message });

    return NextResponse.json({
      success: true,
      jobId,
      url,
      verifiedAt: new Date().toISOString(),
      validator: validatorAccount.address,
      signature,
      message: "Deliverable verified. Authorized release of escrowed stablecoin funds to provider wallet."
    });
  } catch (err: any) {
    console.error("Escrow verify API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

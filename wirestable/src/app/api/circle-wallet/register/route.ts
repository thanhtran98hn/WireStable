import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const circleApiKey = process.env.CIRCLE_API_KEY;
    const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID;

    // Deterministic userId from email
    const userId = crypto.createHash("sha256").update(email).digest("hex").slice(0, 32);

    console.log(`[Circle UCW Register] Processing user registration for: ${email} (UserID: ${userId})`);

    // Fallback simulation mode if credentials are missing
    if (!circleApiKey || !appId) {
      console.warn("[Circle UCW Register] CIRCLE_API_KEY or NEXT_PUBLIC_CIRCLE_APP_ID is missing. Running in Simulation mode.");
      
      // Return simulated challenge params for testing
      return NextResponse.json({
        simulated: true,
        userId,
        userToken: "simulated_user_token_" + userId,
        encryptionKey: "simulated_encryption_key_hash_data_etc",
        challengeId: crypto.randomUUID(),
        address: "0x1234567890123456789012345678901234567890", // Mock address
        message: "Successfully generated simulated registration challenge (Simulation Mode)."
      });
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${circleApiKey}`,
    };

    // Step 1: Create user on Circle
    try {
      const createUserRes = await fetch("https://api.circle.com/v1/w3s/users", {
        method: "POST",
        headers,
        body: JSON.stringify({ userId }),
      });
      const createUserJson = await createUserRes.json();
      console.log("[Circle UCW Register] User creation status:", createUserRes.status, createUserJson);
    } catch (err) {
      console.log("[Circle UCW Register] User might already exist, proceeding to token generation:", err);
    }

    // Step 2: Generate User Session Token
    const tokenRes = await fetch("https://api.circle.com/v1/w3s/users/token", {
      method: "POST",
      headers,
      body: JSON.stringify({ userId }),
    });

    if (!tokenRes.ok) {
      const tokenError = await tokenRes.json();
      return NextResponse.json(
        { error: `Failed to generate user token: ${JSON.stringify(tokenError)}` },
        { status: tokenRes.status }
      );
    }

    const { data: { userToken, encryptionKey } } = await tokenRes.json();

    // Step 3: Initialize user's wallet
    const initRes = await fetch("https://api.circle.com/v1/w3s/user/initialize", {
      method: "POST",
      headers: {
        ...headers,
        "X-User-Token": userToken,
      },
      body: JSON.stringify({
        idempotencyKey: crypto.randomUUID(),
        blockchains: ["ARC-TESTNET"],
        accountType: "SCA",
      }),
    });

    const initJson = await initRes.json();

    if (!initRes.ok) {
      // If user is already initialized, just return tokens
      if (initJson.code === 155106) {
        console.log("[Circle UCW Register] User was already initialized.");
        return NextResponse.json({
          simulated: false,
          userId,
          userToken,
          encryptionKey,
          isNewUser: false,
        });
      }
      return NextResponse.json(
        { error: `Failed to initialize user: ${JSON.stringify(initJson)}` },
        { status: initRes.status }
      );
    }

    const challengeId = initJson.data?.challengeId;

    return NextResponse.json({
      simulated: false,
      userId,
      userToken,
      encryptionKey,
      challengeId,
      isNewUser: true,
    });
  } catch (error: any) {
    console.error("[Circle UCW Register] Endpoint Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

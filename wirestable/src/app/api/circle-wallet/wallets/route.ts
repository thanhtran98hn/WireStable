import { NextResponse } from "next/server";
import { fetchWithRetry } from "@/utils/apiHelper";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userToken = searchParams.get("userToken");
    const userId = searchParams.get("userId");

    if (!userToken) {
      return NextResponse.json(
        { error: "Missing required parameter: userToken." },
        { status: 400 }
      );
    }

    const circleApiKey = process.env.CIRCLE_API_KEY;
    const circleApiUrl = process.env.CIRCLE_API_URL || "https://api.circle.com";

    if (!circleApiKey) {
      return NextResponse.json({
        error: "Circle API key is not configured."
      }, { status: 500 });
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${circleApiKey}`,
      "X-User-Token": userToken
    };

    const res = await fetchWithRetry(`${circleApiUrl}/v1/w3s/wallets`, {
      method: "GET",
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch wallets: ${JSON.stringify(data)}` },
        { status: res.status }
      );
    }

    return NextResponse.json({
      simulated: false,
      wallets: data.data?.wallets || []
    });
  } catch (error: any) {
    console.error("[Circle UCW Wallets] Endpoint Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

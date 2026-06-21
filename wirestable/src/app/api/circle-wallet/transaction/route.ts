import { NextRequest, NextResponse } from "next/server";
import { fetchWithRetry } from "@/utils/apiHelper";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const txId = searchParams.get("id");

    if (!txId) {
      return NextResponse.json({ error: "Missing transaction id parameter" }, { status: 400 });
    }

    const circleApiKey = process.env.CIRCLE_API_KEY;
    const circleApiUrl = process.env.CIRCLE_API_URL || "https://api.circle.com";

    if (!circleApiKey) {
      return NextResponse.json({
        error: "Circle API key is not configured."
      }, { status: 500 });
    }

    const res = await fetchWithRetry(`${circleApiUrl}/v1/w3s/transactions/${txId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${circleApiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch transaction status" }, { status: res.status });
    }

    return NextResponse.json(data.data);
  } catch (error: any) {
    console.error("[Circle UCW Transaction Status Error]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

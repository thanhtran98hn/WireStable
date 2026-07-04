import { NextResponse } from "next/server";

export async function GET() {
  const kitKey = process.env.CIRCLE_KIT_KEY || "";
  return NextResponse.json({ kitKey });
}

import { NextResponse } from "next/server";
import { delay, leaderboard } from "@/lib/server/mock";

export async function GET() {
  await delay(240);
  return NextResponse.json({ leaderboard: leaderboard() });
}

import { NextResponse } from "next/server";
import { delay, seedMatches } from "@/lib/server/mock";

export async function GET() {
  await delay(220);
  return NextResponse.json({ matches: seedMatches() });
}

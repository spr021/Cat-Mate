import { NextResponse } from "next/server";
import { CAT_FACTS } from "@/lib/mock/facts";
import { delay } from "@/lib/server/mock";

export async function GET() {
  await delay(120);
  return NextResponse.json({ facts: CAT_FACTS });
}

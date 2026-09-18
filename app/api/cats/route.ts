import { NextResponse } from "next/server";
import { CATS } from "@/lib/mock/cats";
import { delay } from "@/lib/server/mock";

export async function GET() {
  await delay(260);
  return NextResponse.json({ cats: CATS });
}

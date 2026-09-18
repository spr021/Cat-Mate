import { NextResponse } from "next/server";
import { fromMeow, toMeow } from "@/lib/meow";
import { delay } from "@/lib/server/mock";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { text, direction } = (body ?? {}) as {
    text?: string;
    direction?: "toMeow" | "fromMeow";
  };

  if (typeof text !== "string" || !direction) {
    return NextResponse.json(
      { error: "text and direction are required." },
      { status: 400 }
    );
  }

  await delay(160);
  const safe = text.slice(0, 500);
  const result = direction === "fromMeow" ? fromMeow(safe) : toMeow(safe);
  return NextResponse.json({ result });
}

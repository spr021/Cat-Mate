import { NextResponse } from "next/server";
import { getCatById } from "@/lib/mock/cats";
import { delay, replyFor } from "@/lib/server/mock";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { catId, text, messageCount } = (body ?? {}) as {
    catId?: string;
    text?: string;
    messageCount?: number;
  };

  if (!catId || typeof text !== "string" || text.trim().length === 0) {
    return NextResponse.json(
      { error: "catId and a non-empty text are required." },
      { status: 400 }
    );
  }

  const cat = getCatById(catId);
  if (!cat) {
    return NextResponse.json({ error: "Cat not found." }, { status: 404 });
  }

  // Cat "thinks" for a beat before replying.
  await delay(700 + (text.length % 5) * 120);
  const reply = replyFor(cat, text.slice(0, 1000), messageCount ?? 0);
  return NextResponse.json(reply);
}

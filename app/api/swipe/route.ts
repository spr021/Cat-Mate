import { NextResponse } from "next/server";
import { getCatById } from "@/lib/mock/cats";
import { delay, makeMatch, rollMatch } from "@/lib/server/mock";
import type { SwipeAction } from "@/lib/types";

const ACTIONS: SwipeAction[] = ["like", "pass", "catnip"];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { catId, action } = (body ?? {}) as {
    catId?: string;
    action?: SwipeAction;
  };

  if (!catId || !action || !ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: "catId and a valid action are required." },
      { status: 400 }
    );
  }

  const cat = getCatById(catId);
  if (!cat) {
    return NextResponse.json({ error: "Cat not found." }, { status: 404 });
  }

  await delay(300);
  const matched = rollMatch(cat, action);
  return NextResponse.json({
    matched,
    match: matched ? makeMatch(cat, action) : null,
  });
}

import { NextResponse } from "next/server";
import { getCatById } from "@/lib/mock/cats";
import { GIFTS } from "@/lib/mock/replies";
import { delay, giftReactionFor } from "@/lib/server/mock";
import type { GiftId } from "@/lib/types";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { catId, giftId } = (body ?? {}) as {
    catId?: string;
    giftId?: GiftId;
  };

  if (!catId || !giftId || !GIFTS.some((g) => g.id === giftId)) {
    return NextResponse.json(
      { error: "catId and a valid giftId are required." },
      { status: 400 }
    );
  }

  const cat = getCatById(catId);
  if (!cat) {
    return NextResponse.json({ error: "Cat not found." }, { status: 404 });
  }

  await delay(450);
  const gift = GIFTS.find((g) => g.id === giftId)!;
  return NextResponse.json({
    reaction: giftReactionFor(cat, giftId),
    affection: gift.affection,
  });
}

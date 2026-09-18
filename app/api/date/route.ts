import { NextResponse } from "next/server";
import { getCatById } from "@/lib/mock/cats";
import { dateFor, delay } from "@/lib/server/mock";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { catId, activityId } = (body ?? {}) as {
    catId?: string;
    activityId?: string;
  };

  if (!catId || !activityId) {
    return NextResponse.json(
      { error: "catId and activityId are required." },
      { status: 400 }
    );
  }

  const cat = getCatById(catId);
  if (!cat) {
    return NextResponse.json({ error: "Cat not found." }, { status: 404 });
  }

  await delay(500);
  return NextResponse.json({ date: dateFor(cat, activityId) });
}

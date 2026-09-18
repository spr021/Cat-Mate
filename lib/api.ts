import type { Cat, CatDate, GiftId, Match, SwipeAction } from "./types";

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function fetchCats(): Promise<Cat[]> {
  const data = await request<{ cats: Cat[] }>("/api/cats");
  return data.cats;
}

export async function postSwipe(
  catId: string,
  action: SwipeAction
): Promise<{ matched: boolean; match: Match | null }> {
  return request<{ matched: boolean; match: Match | null }>("/api/swipe", {
    method: "POST",
    body: JSON.stringify({ catId, action }),
  });
}

export async function fetchReply(
  catId: string,
  text: string,
  messageCount: number
): Promise<{ text: string; meow: string }> {
  return request<{ text: string; meow: string }>("/api/chat/reply", {
    method: "POST",
    body: JSON.stringify({ catId, text, messageCount }),
  });
}

export async function translate(
  text: string,
  direction: "toMeow" | "fromMeow"
): Promise<string> {
  const data = await request<{ result: string }>("/api/meow/translate", {
    method: "POST",
    body: JSON.stringify({ text, direction }),
  });
  return data.result;
}

export async function fetchSeedMatches(): Promise<Match[]> {
  const data = await request<{ matches: Match[] }>("/api/matches");
  return data.matches;
}

export async function fetchFacts(): Promise<{ id: string; text: string }[]> {
  const data = await request<{ facts: { id: string; text: string }[] }>(
    "/api/facts"
  );
  return data.facts;
}

export async function fetchLeaderboard(): Promise<
  { catId: string; likes: number; rank: number }[]
> {
  const data = await request<{
    leaderboard: { catId: string; likes: number; rank: number }[];
  }>("/api/leaderboard");
  return data.leaderboard;
}

export async function postDate(
  catId: string,
  activityId: string
): Promise<CatDate> {
  const data = await request<{ date: CatDate }>("/api/date", {
    method: "POST",
    body: JSON.stringify({ catId, activityId }),
  });
  return data.date;
}

export async function postGift(
  catId: string,
  giftId: GiftId
): Promise<{ reaction: { text: string; meow: string }; affection: number }> {
  return request<{
    reaction: { text: string; meow: string };
    affection: number;
  }>("/api/gift", {
    method: "POST",
    body: JSON.stringify({ catId, giftId }),
  });
}

import { CATS, getCatById } from "../mock/cats";
import { generateGiftReaction, generateReply, planDate } from "../mock/replies";
import { compatibility } from "../compat";
import { toMeow } from "../meow";
import type {
  Cat,
  CatDate,
  GiftId,
  Match,
  Message,
  SwipeAction,
} from "../types";

export function delay(ms = 380) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rollMatch(cat: Cat, action: SwipeAction): boolean {
  if (action === "pass") return false;
  if (action === "catnip") return true;
  const score = compatibility(null, cat);
  // Higher compatibility cats are more likely to match back.
  const threshold = 30 + Math.round((score - 40) * 0.9);
  return hash(`${cat.id}:${action}`) % 100 < threshold;
}

export function makeMatch(cat: Cat, action: SwipeAction): Match {
  return {
    id: `match-${cat.id}`,
    catId: cat.id,
    matchedAt: Date.now(),
    superLike: action === "catnip",
    compatibility: compatibility(null, cat),
    affection: action === "catnip" ? 6 : 0,
    messages: [],
    unread: 0,
    date: null,
  };
}

export function replyFor(
  cat: Cat,
  text: string,
  messageCount: number
): { text: string; meow: string } {
  return generateReply(cat, text, messageCount);
}

export function giftReactionFor(cat: Cat, giftId: GiftId) {
  return generateGiftReaction(cat, giftId);
}

export function dateFor(cat: Cat, activityId: string): CatDate {
  return planDate(cat, activityId);
}

interface SeedLine {
  sender: "me" | "cat";
  text: string;
}

function buildMessages(
  matchId: string,
  cat: Cat,
  script: SeedLine[],
  startedAgoMs: number
): Message[] {
  const start = Date.now() - startedAgoMs;
  return script.map((line, i) => ({
    id: `${matchId}-seed-${i}`,
    matchId,
    sender: line.sender,
    text: line.text,
    meow: toMeow(line.text),
    kind: "text" as const,
    createdAt: start + i * 1000 * 60 * 3,
    read: true,
  }));
}

const SEED_SCRIPTS: { catId: string; lines: SeedLine[] }[] = [
  {
    catId: "cat-luna",
    lines: [
      { sender: "cat", text: "You have excellent taste in cats, I must say." },
      { sender: "me", text: "Hi Luna! Your bio made me laugh." },
      { sender: "cat", text: "I do my best. Are you a lap person or a busy person?" },
      { sender: "me", text: "Definitely a lap person. And a snack person." },
      { sender: "cat", text: "Perfect. We are compatible. Bring snacks." },
      { sender: "me", text: "Deal. What's your favorite snack?" },
      { sender: "cat", text: "Salmon pâté. Warm milk if it's raining." },
      { sender: "me", text: "Noted. I'll prepare for all weather." },
    ],
  },
  {
    catId: "cat-milo",
    lines: [
      { sender: "cat", text: "Hello! I heard there might be tuna involved." },
      { sender: "me", text: "Maybe there is. What are you offering in return?" },
      { sender: "cat", text: "I purr like a small motorcycle. It's quite soothing." },
      { sender: "me", text: "That's a strong offer. I'm in." },
    ],
  },
  {
    catId: "cat-cleo",
    lines: [
      { sender: "cat", text: "I'll allow you one opening line. Make it count." },
      { sender: "me", text: "I hear you're the most dramatic cat in Meowntown." },
    ],
  },
];

export function seedMatches(): Match[] {
  const now = Date.now();
  return SEED_SCRIPTS.map((script, idx) => {
    const cat = getCatById(script.catId)!;
    const matchId = `match-${cat.id}`;
    const messages = buildMessages(
      matchId,
      cat,
      script.lines,
      (idx + 1) * 1000 * 60 * 60 * 6
    );
    return {
      id: matchId,
      catId: cat.id,
      matchedAt: now - (idx + 1) * 1000 * 60 * 60 * 20,
      superLike: false,
      compatibility: compatibility(null, cat),
      affection: Math.min(100, messages.length * 3),
      messages,
      unread: script.catId === "cat-cleo" ? 1 : 0,
      date: null,
    } satisfies Match;
  });
}

export function leaderboard(): { catId: string; likes: number; rank: number }[] {
  return CATS.map((cat) => ({
    catId: cat.id,
    likes: 400 + (hash(`${cat.id}:likes`) % 2600),
  }))
    .sort((a, b) => b.likes - a.likes)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

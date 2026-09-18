import type { Cat, RelationshipStage, UserCat } from "./types";
import { STAGE_META } from "./types";

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function overlap(a: string[], b: string[]): number {
  const set = new Set(b);
  return a.filter((x) => set.has(x)).length;
}

/**
 * Purr-fect Match score, 40–99.
 * With no profile yet, returns a stable pseudo-score so the deck still feels alive.
 */
export function compatibility(user: UserCat | null, cat: Cat): number {
  if (!user) {
    return 68 + (hash(cat.id) % 32);
  }
  let score = 55;

  const traits = overlap(user.personality, cat.personality);
  score += Math.min(traits * 8, 24);

  score += Math.min(overlap(user.favoriteToys, cat.favoriteToys) * 4, 12);
  score += Math.min(overlap(user.favoriteFoods, cat.favoriteFoods) * 4, 12);

  const ageDiff = Math.abs(user.ageMonths - cat.ageMonths);
  score += Math.round(10 * Math.max(0, 1 - ageDiff / 36));

  if (user.archetype === cat.archetype) score += 8;

  score += Math.round(6 * Math.max(0, 1 - Math.min(cat.distanceKm, 20) / 20));

  return Math.max(40, Math.min(99, score));
}

/** Compatibility shown in the UI: profile-aware when a profile exists. */
export function matchCompatibility(
  user: UserCat | null,
  cat: Cat,
  stored?: number
): number {
  if (user) return compatibility(user, cat);
  return stored ?? compatibility(null, cat);
}

export function stageFor(messageCount: number): RelationshipStage {
  const stages = Object.entries(STAGE_META) as [
    RelationshipStage,
    (typeof STAGE_META)[RelationshipStage],
  ][];
  let current: RelationshipStage = "stranger";
  for (const [id, meta] of stages) {
    if (messageCount >= meta.min) current = id;
  }
  return current;
}

export function stageProgress(messageCount: number): {
  stage: RelationshipStage;
  next: RelationshipStage | null;
  progress: number;
} {
  const order: RelationshipStage[] = [
    "stranger",
    "acquaintance",
    "friend",
    "bestie",
    "soulmate",
  ];
  const stage = stageFor(messageCount);
  const idx = order.indexOf(stage);
  const next = idx < order.length - 1 ? order[idx + 1] : null;
  if (!next) return { stage, next: null, progress: 1 };
  const start = STAGE_META[stage].min;
  const end = STAGE_META[next].min;
  const progress = Math.max(0, Math.min(1, (messageCount - start) / (end - start)));
  return { stage, next, progress };
}

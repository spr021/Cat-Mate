import type { Archetype, ArchetypeId, Personality } from "./types";

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  "cuddle-cloud": {
    id: "cuddle-cloud",
    name: "The Cuddle Cloud",
    emoji: "☁️",
    blurb: "Soft, warm, and permanently attached to your lap. Purrs like a tiny motor.",
    gradient: ["#ffb3d1", "#ff7ab8"],
  },
  "grumpy-gourmet": {
    id: "grumpy-gourmet",
    name: "The Grumpy Gourmet",
    emoji: "🍣",
    blurb: "Judges your snack choices, then eats them anyway. Love is earned, one bite at a time.",
    gradient: ["#ffd08a", "#ff9f5a"],
  },
  "zoomie-gremlin": {
    id: "zoomie-gremlin",
    name: "The Zoomie Gremlin",
    emoji: "⚡",
    blurb: "3 AM is prime time. Will absolutely knock things off the table for fun.",
    gradient: ["#a6e3ff", "#6bb8ff"],
  },
  "shy-snuggler": {
    id: "shy-snuggler",
    name: "The Shy Snuggler",
    emoji: "🫣",
    blurb: "Hides under the bed, then secretly watches you. Slow blinks are a love letter.",
    gradient: ["#d6c7ff", "#a98bff"],
  },
  "sassy-diva": {
    id: "sassy-diva",
    name: "The Sassy Diva",
    emoji: "💅",
    blurb: "Demands the best seat, the best food, and the best of everything. Deservedly.",
    gradient: ["#ff9ec7", "#ff5c9d"],
  },
  "chill-philosopher": {
    id: "chill-philosopher",
    name: "The Chill Philosopher",
    emoji: "🌿",
    blurb: "Sunbeam connoisseur. Contemplates the void, then naps through it.",
    gradient: ["#b8e6c9", "#79c99e"],
  },
  "curious-explorer": {
    id: "curious-explorer",
    name: "The Curious Explorer",
    emoji: "🧭",
    blurb: "Has inspected every box in the house. If it fits, it sits.",
    gradient: ["#ffe08a", "#ffc44d"],
  },
  "drama-royalty": {
    id: "drama-royalty",
    name: "The Drama Royalty",
    emoji: "👑",
    blurb: "Every meal is a crisis. Every nap is an opera. All of it, magnificent.",
    gradient: ["#ffb0b0", "#ff6b6b"],
  },
};

/** Rough mapping from personality traits to an archetype. */
export function archetypeFromPersonality(traits: Personality[]): ArchetypeId {
  const score: Record<ArchetypeId, number> = {
    "cuddle-cloud": 0,
    "grumpy-gourmet": 0,
    "zoomie-gremlin": 0,
    "shy-snuggler": 0,
    "sassy-diva": 0,
    "chill-philosopher": 0,
    "curious-explorer": 0,
    "drama-royalty": 0,
  };
  const bump: Record<Personality, ArchetypeId[]> = {
    cuddly: ["cuddle-cloud"],
    grumpy: ["grumpy-gourmet", "drama-royalty"],
    playful: ["zoomie-gremlin", "curious-explorer"],
    shy: ["shy-snuggler"],
    sassy: ["sassy-diva"],
    chill: ["chill-philosopher"],
    curious: ["curious-explorer"],
    dramatic: ["drama-royalty"],
    chatty: ["sassy-diva", "cuddle-cloud"],
    foodie: ["grumpy-gourmet"],
    adventurous: ["curious-explorer", "zoomie-gremlin"],
    sleepy: ["chill-philosopher"],
  };
  for (const trait of traits) {
    for (const id of bump[trait] ?? []) score[id] += 1;
  }
  let best: ArchetypeId = "cuddle-cloud";
  let bestScore = -1;
  (Object.keys(score) as ArchetypeId[]).forEach((id) => {
    if (score[id] > bestScore) {
      bestScore = score[id];
      best = id;
    }
  });
  return best;
}

export function archetypeOf(id: ArchetypeId): Archetype {
  return ARCHETYPES[id] ?? ARCHETYPES["cuddle-cloud"];
}

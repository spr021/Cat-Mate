import type { AvatarConfig, Cat } from "./types";

export const FUR_OPTIONS = [
  { id: "cream", label: "Cream", main: "#f6e7d8", dark: "#d9bfa6" },
  { id: "ginger", label: "Ginger", main: "#f0a95c", dark: "#c47b34" },
  { id: "grey", label: "Grey", main: "#b9c2cb", dark: "#7c8794" },
  { id: "charcoal", label: "Charcoal", main: "#5b5560", dark: "#37323a" },
  { id: "snow", label: "Snow", main: "#fbf7f2", dark: "#ddd3c8" },
  { id: "cocoa", label: "Cocoa", main: "#a9825f", dark: "#7a5a3d" },
  { id: "blush", label: "Blush", main: "#ffc9dd", dark: "#e58fb4" },
  { id: "mint", label: "Mint", main: "#b8e6d2", dark: "#7fc4a8" },
];

export const EYE_OPTIONS = [
  { id: "green", label: "Emerald", color: "#4fae72" },
  { id: "blue", label: "Sky", color: "#5aa9e6" },
  { id: "amber", label: "Amber", color: "#e6a23c" },
  { id: "pink", label: "Rose", color: "#f06292" },
  { id: "violet", label: "Violet", color: "#9a7ae0" },
  { id: "gold", label: "Gold", color: "#e8c34a" },
];

export const PATTERN_OPTIONS: {
  id: AvatarConfig["pattern"];
  label: string;
}[] = [
  { id: "solid", label: "Solid" },
  { id: "tabby", label: "Tabby" },
  { id: "tuxedo", label: "Tuxedo" },
  { id: "calico", label: "Calico" },
  { id: "spot", label: "Spotty" },
];

export const ACCESSORY_OPTIONS: {
  id: AvatarConfig["accessory"];
  label: string;
  emoji: string;
}[] = [
  { id: "none", label: "None", emoji: "🚫" },
  { id: "bowtie", label: "Bowtie", emoji: "🎀" },
  { id: "bandana", label: "Bandana", emoji: "🧣" },
  { id: "crown", label: "Crown", emoji: "👑" },
  { id: "flower", label: "Flower", emoji: "🌸" },
  { id: "glasses", label: "Glasses", emoji: "🕶️" },
];

export function furById(id: string) {
  return FUR_OPTIONS.find((f) => f.id === id) ?? FUR_OPTIONS[0];
}

export function eyeById(id: string) {
  return EYE_OPTIONS.find((e) => e.id === id) ?? EYE_OPTIONS[0];
}

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function avatarFromCat(cat: Cat): AvatarConfig {
  const h = hash(cat.id);
  const patterns: AvatarConfig["pattern"][] = [
    "solid",
    "tabby",
    "tuxedo",
    "calico",
    "spot",
  ];
  const accessories: AvatarConfig["accessory"][] = [
    "none",
    "bowtie",
    "bandana",
    "crown",
    "flower",
    "glasses",
  ];
  return {
    fur: cat.furColors[0],
    pattern: patterns[h % patterns.length],
    eyes: EYE_OPTIONS[h % EYE_OPTIONS.length].id,
    accessory: accessories[(h >> 4) % accessories.length],
  };
}

export function defaultAvatar(): AvatarConfig {
  return { fur: "#ffc9dd", pattern: "tabby", eyes: "green", accessory: "bowtie" };
}

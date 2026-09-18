export type Gender = "male" | "female";

export type Personality =
  | "cuddly"
  | "grumpy"
  | "playful"
  | "shy"
  | "sassy"
  | "chill"
  | "curious"
  | "dramatic"
  | "chatty"
  | "foodie"
  | "adventurous"
  | "sleepy";

export const PERSONALITIES: Personality[] = [
  "cuddly",
  "grumpy",
  "playful",
  "shy",
  "sassy",
  "chill",
  "curious",
  "dramatic",
  "chatty",
  "foodie",
  "adventurous",
  "sleepy",
];

export const PERSONALITY_META: Record<
  Personality,
  { label: string; emoji: string }
> = {
  cuddly: { label: "Cuddly", emoji: "🥰" },
  grumpy: { label: "Grumpy", emoji: "😾" },
  playful: { label: "Playful", emoji: "🎾" },
  shy: { label: "Shy", emoji: "🫣" },
  sassy: { label: "Sassy", emoji: "💅" },
  chill: { label: "Chill", emoji: "😎" },
  curious: { label: "Curious", emoji: "🔍" },
  dramatic: { label: "Dramatic", emoji: "🎭" },
  chatty: { label: "Chatty", emoji: "🗣️" },
  foodie: { label: "Foodie", emoji: "🍣" },
  adventurous: { label: "Adventurous", emoji: "🧗" },
  sleepy: { label: "Sleepy", emoji: "😴" },
};

export type ArchetypeId =
  | "cuddle-cloud"
  | "grumpy-gourmet"
  | "zoomie-gremlin"
  | "shy-snuggler"
  | "sassy-diva"
  | "chill-philosopher"
  | "curious-explorer"
  | "drama-royalty";

export interface Archetype {
  id: ArchetypeId;
  name: string;
  emoji: string;
  blurb: string;
  gradient: [string, string];
}

export type CatVoice =
  | "chirpy"
  | "dramatic"
  | "shy"
  | "grumpy"
  | "sleepy"
  | "chaotic"
  | "smooth";

export interface Cat {
  id: string;
  name: string;
  breed: string;
  ageMonths: number;
  gender: Gender;
  bio: string;
  personality: Personality[];
  favoriteToys: string[];
  favoriteFoods: string[];
  image: string;
  furColors: [string, string];
  distanceKm: number;
  neighborhood: string;
  lookingFor: string;
  voice: CatVoice;
  archetype: ArchetypeId;
}

export interface AvatarConfig {
  fur: string;
  pattern: "solid" | "tabby" | "tuxedo" | "calico" | "spot";
  eyes: string;
  accessory: "none" | "bowtie" | "bandana" | "crown" | "flower" | "glasses";
}

export interface UserCat {
  name: string;
  breed: string;
  ageMonths: number;
  gender: Gender;
  bio: string;
  personality: Personality[];
  favoriteToys: string[];
  favoriteFoods: string[];
  archetype: ArchetypeId;
  avatar: AvatarConfig;
  neighborhood: string;
}

export type SwipeAction = "like" | "pass" | "catnip";

export interface SwipeRecord {
  catId: string;
  action: SwipeAction;
  at: number;
}

export type RelationshipStage =
  | "stranger"
  | "acquaintance"
  | "friend"
  | "bestie"
  | "soulmate";

export const STAGE_META: Record<
  RelationshipStage,
  { label: string; emoji: string; min: number }
> = {
  stranger: { label: "Stranger", emoji: "🐾", min: 0 },
  acquaintance: { label: "Acquaintance", emoji: "👋", min: 4 },
  friend: { label: "Friend", emoji: "🤝", min: 12 },
  bestie: { label: "Bestie", emoji: "💞", min: 24 },
  soulmate: { label: "Soulmate", emoji: "💍", min: 40 },
};

export type MessageKind = "text" | "sticker" | "gift" | "system" | "date";

export type GiftId = "tuna" | "catnip" | "yarn" | "fish" | "mouse" | "milk";

export interface Message {
  id: string;
  matchId: string;
  sender: "me" | "cat";
  text: string;
  meow: string;
  kind: MessageKind;
  sticker?: string;
  gift?: GiftId;
  createdAt: number;
  read: boolean;
}

export interface CatDate {
  activity: string;
  emoji: string;
  at: number;
  story: string;
  reaction: string;
}

export interface Match {
  id: string;
  catId: string;
  matchedAt: number;
  superLike: boolean;
  compatibility: number;
  affection: number;
  messages: Message[];
  unread: number;
  date: CatDate | null;
}

export interface AchievementDef {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export interface CatFact {
  id: string;
  text: string;
}

export type ThemeId = "bubblegum" | "strawberry" | "peach" | "midnight";

export const THEME_META: Record<
  ThemeId,
  { label: string; emoji: string; swatch: string; dark: boolean }
> = {
  bubblegum: { label: "Bubblegum", emoji: "🍬", swatch: "#ff5c9d", dark: false },
  strawberry: { label: "Strawberry Milk", emoji: "🍓", swatch: "#e63976", dark: false },
  peach: { label: "Peach Fuzz", emoji: "🍑", swatch: "#ff8a5c", dark: false },
  midnight: { label: "Midnight Nap", emoji: "🌙", swatch: "#ff7ab8", dark: true },
};

export interface LeaderboardEntry {
  catId: string;
  likes: number;
  rank: number;
}

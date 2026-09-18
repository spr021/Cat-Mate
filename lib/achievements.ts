import type { AchievementDef } from "./types";

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-purr", name: "First Purr", emoji: "💗", description: "Send your very first meow." },
  { id: "profile-ready", name: "Best Dressed", emoji: "🎀", description: "Create your cat profile." },
  { id: "catnip-royalty", name: "Catnip Royalty", emoji: "🌿", description: "Use your first Catnip super like." },
  { id: "matchmaker", name: "Matchmaker", emoji: "💞", description: "Match with 3 cats." },
  { id: "chatty-cat", name: "Chatty Cat", emoji: "🗣️", description: "Send 25 messages." },
  { id: "gift-giver", name: "Gift Giver", emoji: "🎁", description: "Send 3 gifts." },
  { id: "date-night", name: "Date Night", emoji: "🌙", description: "Plan your first Cat Café date." },
  { id: "night-owl", name: "Night Owl", emoji: "🦉", description: "Chat after midnight." },
  { id: "soulmate", name: "Soulmate", emoji: "💍", description: "Reach Soulmate stage with a cat." },
  { id: "theme-hopper", name: "Theme Hopper", emoji: "🎨", description: "Try all four themes." },
  { id: "explorer", name: "Explorer", emoji: "🧭", description: "Swipe through 10 cats." },
  { id: "completionist", name: "Completionist", emoji: "🏆", description: "Unlock 10 achievements." },
];

export interface AchievementContext {
  profileCreated: boolean;
  swipes: number;
  likes: number;
  matches: number;
  messages: number;
  catnips: number;
  gifts: number;
  dates: number;
  themesTried: number;
  nightOwl: boolean;
  soulmates: number;
}

export function evaluateAchievements(ctx: AchievementContext): string[] {
  const unlocked: string[] = [];
  if (ctx.messages >= 1) unlocked.push("first-purr");
  if (ctx.profileCreated) unlocked.push("profile-ready");
  if (ctx.catnips >= 1) unlocked.push("catnip-royalty");
  if (ctx.matches >= 3) unlocked.push("matchmaker");
  if (ctx.messages >= 25) unlocked.push("chatty-cat");
  if (ctx.gifts >= 3) unlocked.push("gift-giver");
  if (ctx.dates >= 1) unlocked.push("date-night");
  if (ctx.nightOwl) unlocked.push("night-owl");
  if (ctx.soulmates >= 1) unlocked.push("soulmate");
  if (ctx.themesTried >= 4) unlocked.push("theme-hopper");
  if (ctx.swipes >= 10) unlocked.push("explorer");
  if (unlocked.length >= 10) unlocked.push("completionist");
  return unlocked;
}

export function achievementById(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Meow translator — a deterministic, offline mock translator.
 *
 * `toMeow` turns human text into cat speak using a small dictionary plus a
 * hash-based syllable generator (so the same word always becomes the same meow).
 * `fromMeow` reverses it using the dictionary, a session-learned map, and a
 * deterministic fallback so even unknown meows read like plausible English.
 *
 * Every chat message stores both its human text and its meow, so the UI toggle
 * is always exact — this module powers live previews and cat replies.
 */

const BASE_DICT: Record<string, string> = {
  hello: "meow meow",
  hi: "mew",
  hey: "mrrp",
  goodbye: "mrrrow",
  bye: "mew bye",
  yes: "mew",
  yeah: "mew",
  no: "hiss",
  nope: "hiss",
  maybe: "mrr?",
  please: "prrr-ease",
  thanks: "mew mew",
  thank: "mew",
  sorry: "mrrrp",
  love: "prrrr",
  like: "purr",
  hate: "hiss",
  you: "mrrp",
  me: "mew",
  i: "mew",
  we: "mew mew",
  my: "mrr",
  your: "mrrp",
  food: "nom nom",
  eat: "nom",
  hungry: "nomnomnom",
  treat: "nom nom",
  tuna: "nom nom fishy",
  fish: "fishy",
  milk: "mrrlk",
  water: "lap lap",
  snack: "nom",
  toy: "bat bat",
  play: "zoom",
  fun: "zoomies",
  sleep: "zzz",
  nap: "zzz",
  tired: "zzzzz",
  cute: "mewww",
  pretty: "mewww",
  beautiful: "mrrraow",
  happy: "purrrr",
  sad: "mrrr",
  angry: "hissss",
  scared: "mew!",
  cuddle: "snuggle purr",
  cuddly: "snuggle purr",
  hug: "snuggle",
  kiss: "mwah mrrp",
  friend: "purr pal",
  mate: "mrrrow",
  date: "mrrrow",
  cat: "meow",
  kitten: "mew",
  human: "hooman",
  what: "mrr?",
  why: "mrrr?",
  how: "meow?",
  when: "mrr?",
  where: "mrrrp?",
  who: "mew?",
  good: "purrfect",
  great: "mrrraow",
  bad: "hiss",
  very: "mrrr",
  really: "mrrreally",
  ok: "mew",
  okay: "mew",
  sure: "mew mew",
  today: "meowday",
  tomorrow: "mrrrow",
  night: "night night",
  morning: "mewning",
  home: "purr pad",
  come: "come meow",
  go: "zoom",
  see: "peek",
  look: "peek",
  want: "mrrp",
  need: "mrrp",
  give: "mew",
  make: "mew",
  know: "mrr",
  think: "mrrr",
  feel: "purr",
  dream: "zzz dream",
  beautiful_mate: "mrrraow",
};

const MEOW_WORDS = [
  "meow",
  "mrrp",
  "mew",
  "nyaa",
  "prrr",
  "mraow",
  "purr",
  "mewl",
  "chirp",
  "mrow",
  "mrrrp",
  "nyan",
  "meep",
  "brrp",
  "mewmew",
  "prrt",
  "mrrr",
  "nyow",
];

const FILLER_WORDS = [
  "something",
  "you",
  "here",
  "maybe",
  "a little",
  "right now",
  "very",
  "truly",
  "kind of",
  "always",
  "probably",
  "tonight",
];

/** Session-learned word → meow map so reverse translation round-trips. */
const learned = new Map<string, string>();
const reverseLearned = new Map<string, string>();

function hashWord(word: string): number {
  let h = 2166136261;
  for (let i = 0; i < word.length; i++) {
    h ^= word.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function syllablesFor(word: string): number {
  const len = word.replace(/[^a-z]/gi, "").length;
  if (len <= 2) return 1;
  if (len <= 5) return 2;
  if (len <= 8) return 2;
  return 3;
}

function generateMeow(word: string): string {
  const key = word.toLowerCase();
  if (learned.has(key)) return learned.get(key)!;
  const h = hashWord(key);
  const count = syllablesFor(key);
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    parts.push(MEOW_WORDS[(h >>> (i * 5)) % MEOW_WORDS.length]);
  }
  const meow = parts.join(" ");
  learned.set(key, meow);
  if (!reverseLearned.has(meow)) reverseLearned.set(meow, key);
  return meow;
}

function matchCase(source: string, target: string): string {
  if (source.length > 1 && source === source.toUpperCase()) {
    return target.toUpperCase();
  }
  if (/^[A-Z]/.test(source)) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target;
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

export function toMeow(text: string): string {
  if (!text) return "";
  return text.replace(/[\p{L}']+/gu, (word) => {
    const key = stripAccents(word.toLowerCase()).replace(/'/g, "");
    const mapped = BASE_DICT[key] ?? generateMeow(key);
    return matchCase(word, mapped);
  });
}

function reverseToken(meowWord: string): string {
  const key = meowWord.toLowerCase();
  if (reverseLearned.has(key)) return reverseLearned.get(key)!;
  const h = hashWord(key);
  return FILLER_WORDS[h % FILLER_WORDS.length];
}

export function fromMeow(text: string): string {
  if (!text) return "";
  // Build reverse base dictionary (first mapping wins).
  const reverseBase = new Map<string, string>();
  for (const [en, meow] of Object.entries(BASE_DICT)) {
    const k = meow.toLowerCase();
    if (!reverseBase.has(k)) reverseBase.set(k, en);
  }

  // Longest-phrase first so "meow meow" resolves before "meow".
  const phrases = [...reverseBase.keys()].sort(
    (a, b) => b.length - a.length
  );
  let out = text;
  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`\\b${escaped}\\b`, "gi"), reverseBase.get(phrase)!);
  }
  return out.replace(/[\p{L}']+/gu, (word) => {
    // Words already replaced by the dictionary stay as-is if they're english.
    if (/^[a-z]+$/i.test(word) && !MEOW_WORDS.includes(word.toLowerCase())) {
      return word;
    }
    return reverseToken(word);
  });
}

/** Loose check for whether text already looks like meow. */
export function looksLikeMeow(text: string): boolean {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  if (words.length === 0) return false;
  const meowish = words.filter(
    (w) => MEOW_WORDS.includes(w) || /^(m|n|p|b)r+[aeiou]+/.test(w)
  ).length;
  return meowish / words.length >= 0.5;
}

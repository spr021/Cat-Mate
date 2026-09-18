import type { Cat, CatDate, CatVoice, GiftId } from "../types";
import { toMeow } from "../meow";

export const GIFTS: {
  id: GiftId;
  label: string;
  emoji: string;
  affection: number;
}[] = [
  { id: "tuna", label: "Fresh Tuna", emoji: "🐟", affection: 6 },
  { id: "catnip", label: "Catnip Pouch", emoji: "🌿", affection: 8 },
  { id: "yarn", label: "Yarn Ball", emoji: "🧶", affection: 5 },
  { id: "fish", label: "Sardine Snack", emoji: "🐠", affection: 5 },
  { id: "mouse", label: "Toy Mouse", emoji: "🐭", affection: 7 },
  { id: "milk", label: "Warm Milk", emoji: "🥛", affection: 4 },
];

export const STICKERS = [
  { id: "heart", emoji: "💖", label: "Love" },
  { id: "paw", emoji: "🐾", label: "Paws" },
  { id: "fish", emoji: "🐟", label: "Fish" },
  { id: "yarn", emoji: "🧶", label: "Yarn" },
  { id: "fishbone", emoji: "🦴", label: "Bone" },
  { id: "sparkle", emoji: "✨", label: "Sparkle" },
  { id: "angry", emoji: "😾", label: "Grumpy" },
  { id: "sleep", emoji: "😴", label: "Sleepy" },
];

type Intent =
  | "greeting"
  | "food"
  | "play"
  | "love"
  | "question"
  | "sad"
  | "goodbye"
  | "compliment"
  | "date"
  | "default";

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/\b(hi|hello|hey|howdy|mew|meow|good morning|good evening)\b/.test(t)) return "greeting";
  if (/\b(food|eat|hungry|tuna|fish|snack|treat|dinner|lunch|nom)\b/.test(t)) return "food";
  if (/\b(play|toy|game|chase|laser|ball|zoom)\b/.test(t)) return "play";
  if (/\b(love|like you|adore|crush|heart|kiss|cute|pretty|beautiful|handsome)\b/.test(t)) return "love";
  if (/\b(date|meet|coffee|cafe|café|walk|movie)\b/.test(t)) return "date";
  if (/\b(bye|goodnight|see you|gotta go)\b/.test(t)) return "goodbye";
  if (/\b(sad|tired|lonely|bad day|upset|cry)\b/.test(t)) return "sad";
  if (/\?$/.test(text.trim())) return "question";
  if (/\b(you're|you are|so|very)\b/.test(t) && t.length < 60) return "compliment";
  return "default";
}

const VOICE_FLAIR: Record<CatVoice, string[]> = {
  chirpy: ["!", "!", "!!", " 😸", " 🐾"],
  dramatic: ["…", ".", "…!", " 🎭", " 😾"],
  shy: ["…", ".", "…", " 🫣", " 🙈"],
  grumpy: ["", ".", "…", " 😒", " 😾"],
  sleepy: ["…zzz", "…", " 🥱", " 😴"],
  chaotic: ["!!!", "!!", " 😹", " 🌀", " 🤪"],
  smooth: [".", "~", "…", " 😽", " 🌙"],
};

const REPLIES: Record<Intent, Record<string, string[]>> = {
  greeting: {
    cuddly: ["Hi hi! I was hoping you'd meow at me 🥰", "Hello you! Come sit closer."],
    playful: ["Heyyy! Wanna play? I have a bottle cap!", "Oh hi! Catch me if you can!"],
    sassy: ["Oh. It's you. I suppose I'll allow it 💅", "Finally, someone with taste."],
    grumpy: ["You again. Fine. I'm listening.", "Make it quick, I was napping."],
    chill: ["Hey. Nice day for a sunbeam.", "Hello. Pull up a patch of floor."],
    shy: ["oh… hi. sorry, i'm a little nervous…", "hello… you seem nice."],
    dramatic: ["At last, a new audience. Hello!", "You have my attention. Briefly."],
    foodie: ["Hi! Do you have snacks? This is important.", "Hello! I smell tuna. Is that you?"],
    adventurous: ["Hey! I just explored a new box!", "Hi! Wanna go on a mission?"],
    sleepy: ["mm… hello… five more minutes…", "hi… zzz… hi."],
    curious: ["Hello! What's that you're holding?", "Hi! May I inspect your pockets?"],
    chatty: ["Hiiiii! Oh I have SO much to tell you!", "Hello hello hello! Okay so, big news—"],
  },
  food: {
    cuddly: ["Food?! I love food almost as much as I love you.", "Yes please. And then a nap on you."],
    playful: ["FOOD! I'll do a backflip for it! Watch!", "Snacks?! Let's make it a game!"],
    sassy: ["Only if it's the good pâté. I have standards.", "You may feed me. Graciously."],
    grumpy: ["Finally, someone who understands me.", "I accept. But I'm not purring. Yet."],
    chill: ["Sure. I'll have a nibble.", "Food is nice. So is this floor."],
    shy: ["oh… okay. thank you… that's really kind.", "i'd like that… maybe just a little."],
    dramatic: ["FOOD?! The most important event of the day!", "I have been STARVING for eleven minutes."],
    foodie: ["Now you're speaking my language. What are we having?", "Yes. And seconds. And thirds."],
    adventurous: ["I once caught a fish. It was a shoe. Worth it.", "Snack acquired! Mission success!"],
    sleepy: ["food… then sleep… perfect plan…", "I'll eat it in my dreams… no wait, I'm up."],
    curious: ["What is it? Can I sniff it? Can I touch it?", "Ooh, new flavor? I'm in."],
    chatty: ["YES. Okay so my favorite is salmon, but I also like—", "Food! Great topic! Let me tell you everything."],
  },
  play: {
    cuddly: ["Play? Okay but then we cuddle after, deal?", "I'll play for exactly three minutes, then lap."],
    playful: ["YES! The red dot! I WILL catch it this time!", "Zoomies activated! 🌀"],
    sassy: ["I don't chase. I observe. …Okay fine, one lap.", "You may dangle the ribbon. Briefly."],
    grumpy: ["I'm too old for this. …Throw it anyway.", "Fine. One fetch. Then nap."],
    chill: ["I could be persuaded.", "Sure, but let's keep it low-effort."],
    shy: ["okay… but you go first.", "i'll watch you play… that's fun too."],
    dramatic: ["The hunt begins! A tale for the ages!", "I shall stalk the feather with grace!"],
    foodie: ["I'll play if there's a treat at the end.", "Is the toy edible? No? Hmm."],
    adventurous: ["Let's climb the bookshelf! I know a route!", "Race you to the top of the fridge!"],
    sleepy: ["play… or nap… play… nap… zzz.", "I'll play in spirit."],
    curious: ["What does it do? Let me bat it. And again.", "New toy? I must study it thoroughly."],
    chatty: ["I love playtime! Did I tell you about the string?", "Play! Also, fun fact: I'm very fast."],
  },
  love: {
    cuddly: ["I love you too 🥰 Now come here.", "You said the magic words. Lap time."],
    playful: ["Aww! You're my favorite human-shaped toy!", "Love you! Let's celebrate with zoomies!"],
    sassy: ["Obviously. But it's nice to hear.", "You have excellent taste, I'll admit."],
    grumpy: ["…I tolerate you deeply. That's my love.", "Don't tell anyone, but… same."],
    chill: ["That's nice. I like you too.", "Cool. Same. Let's nap on it."],
    shy: ["oh! um. i… i like you too… 🫣", "that's really sweet… thank you…"],
    dramatic: ["You LOVE me?! I must sit down. I'm sitting.", "A confession! My heart! 💖"],
    foodie: ["I love you AND food. It's a tie. Sorry.", "You're almost as good as tuna. That's huge."],
    adventurous: ["Love is the greatest adventure! Let's go!", "You're my favorite co-explorer 💕"],
    sleepy: ["love you… zzz… love you…", "I dreamt about you. And snacks."],
    curious: ["Love? Tell me more about this feeling.", "I love you! What's that over there?"],
    chatty: ["I LOVE YOU! Okay I have to tell you everything now!", "You're the best! Wait, can I tell you a secret?"],
  },
  question: {
    cuddly: ["Hmm… yes. Probably. Can we decide while cuddling?", "I don't know, but I know I like you."],
    playful: ["Ooh a quiz! I pick the fun answer!", "Yes! No! Maybe! I forgot the question."],
    sassy: ["I don't answer questions before my nap.", "Ask me again when I'm being admired."],
    grumpy: ["No. …Fine, maybe.", "I'll allow one question per day."],
    chill: ["Hmm. Let me think about it. …Okay, done.", "Sure, why not."],
    shy: ["um… i think so? maybe?", "i'm not sure… what do you think?"],
    dramatic: ["A question! The plot thickens!", "I shall ponder this for three business days."],
    foodie: ["Does the answer involve food? Then yes.", "I can only answer on a full stomach."],
    adventurous: ["Only one way to find out — adventure!", "Yes, and let's find out together!"],
    sleepy: ["ask me… after my nap…", "hmm? sorry, I drifted off."],
    curious: ["Great question! I have seventeen follow-ups.", "Ooh, now I'm curious too!"],
    chatty: ["Okay so, the answer is long and has three parts—", "Yes! And that reminds me of a story!"],
  },
  sad: {
    cuddly: ["Come here. I'm making biscuits on your heart.", "I'll purr until you feel better. It's my job."],
    playful: ["No sad! I'll do a silly jump to fix it!", "Here, hold this crinkle ball. Better?"],
    sassy: ["Who upset you? I'll stare at them menacingly.", "Rude. You deserve better. Obviously."],
    grumpy: ["…Come sit. I'll be grumpy near you. Together.", "I don't do feelings. But I'll stay."],
    chill: ["That's rough. Let's just breathe for a bit.", "I'll sit with you. No talking needed."],
    shy: ["oh no… i'm here… quietly… 🫂", "that sounds hard… i'm sorry…"],
    dramatic: ["A tragedy! We shall mourn together!", "I feel your pain! Deeply! Dramatically!"],
    foodie: ["Bad days need snacks. I have a list.", "Here, I'll share my hidden treat stash."],
    adventurous: ["Every hero has a rough chapter. Onward!", "Let's go somewhere new, it helps!"],
    sleepy: ["come nap… things are better after naps…", "shh… rest… I'll keep watch."],
    curious: ["What happened? I'm listening. Truly.", "Tell me everything. I won't even get distracted."],
    chatty: ["Oh no! Okay, talk to me, I'm all ears!", "I'm here! Let's fix it with words!"],
  },
  goodbye: {
    cuddly: ["Nooo don't go! …Okay. Come back soon 🥺", "Bye bye! I'll be in your spot."],
    playful: ["Bye! One more game? Okay fine. Bye!", "Catch you later, alligator! 🐾"],
    sassy: ["Leaving? How dare you. Go on then.", "Fine. I'll be here. Being fabulous."],
    grumpy: ["Good. I mean… bye.", "Don't let the door hit you. Kidding. Bye."],
    chill: ["Later. Take it easy.", "Bye. I'll be napping."],
    shy: ["bye… come back? if you want…", "okay… bye… it was nice…"],
    dramatic: ["Parting is such sweet sorrow! Farewell!", "You leave me! I shall compose a ballad!"],
    foodie: ["Bye! …You're not taking the snacks, right?", "Farewell. Leave the tuna."],
    adventurous: ["Until our next adventure!", "Bye! I'm off to climb something!"],
    sleepy: ["bye… zzz… bye…", "mmbye…"],
    curious: ["Bye! Where are you going? Can I come?", "Okay! Bring back something interesting!"],
    chatty: ["Bye! Wait, one more thing! Okay, now bye!", "Bye! I'll miss talking to you!"],
  },
  compliment: {
    cuddly: ["Stoppp you're making me purr 🥰", "I'm blushing under all this fur."],
    playful: ["I know, right?! I'm amazing!", "Aww! You're pretty great yourself!"],
    sassy: ["I'm aware. But continue.", "Correct. Do go on."],
    grumpy: ["…Thank you. That was nice. Don't make it weird.", "Hmph. I suppose you have taste."],
    chill: ["Thanks. You're alright too.", "Appreciate that. Very cool of you."],
    shy: ["oh… thank you… now i'm hiding 🫣", "that's so nice… i don't know what to say…"],
    dramatic: ["I am MAGNIFICENT, aren't I?!", "A compliment! My ego grows!"],
    foodie: ["I am a snack, after all.", "Thanks! You're almost as lovely as salmon."],
    adventurous: ["Thanks! I did climb a mountain today.", "Appreciate it! Now watch this!"],
    sleepy: ["thank you… zzz… nice…", "mm… that's kind…"],
    curious: ["Thank you! Now, why do you think so?", "Oh! Interesting. Tell me more."],
    chatty: ["Thank you!! Okay now I have to compliment you back—", "I know right! Also here's my whole life story—"],
  },
  date: {
    cuddly: ["A date! I'll bring my softest purr.", "Yes! But can it be a nap date?"],
    playful: ["A date?! I'll plan a treasure hunt!", "Yes! Loser buys snacks!"],
    sassy: ["I accept. Pick somewhere worthy of me.", "A date. I'll need thirty minutes to look perfect."],
    grumpy: ["A date? Fine. But I choose the food.", "Okay. But I'm leaving if it's boring."],
    chill: ["Sounds nice. Somewhere sunny?", "Sure. Low-key is my vibe."],
    shy: ["a date…? okay… somewhere quiet, please…", "yes… but let's take it slow…"],
    dramatic: ["A DATE! I must prepare a monologue!", "The stage is set! When and where?!"],
    foodie: ["Only if there's a tasting menu.", "A date at a café? I'm already seated."],
    adventurous: ["A date! Let's make it an expedition!", "Yes! Sunrise hike? Rooftop picnic?"],
    sleepy: ["a nap date… ideal…", "date… after my nap… okay?"],
    curious: ["A date! Where? I have questions.", "Yes! I'll research the location first."],
    chatty: ["YES! Okay, I'll plan the whole conversation!", "A date! I have so much to tell you!"],
  },
  default: {
    cuddly: ["Mm, I like where this is going. Keep talking.", "Tell me more, I'm comfy and listening."],
    playful: ["Ooh! Then what? Then what?!", "Ha! You're fun. I like you."],
    sassy: ["Interesting. Go on, impress me.", "I'm listening. Mostly."],
    grumpy: ["Hm. Continue. I'm mildly intrigued.", "That's… acceptable. Tell me more."],
    chill: ["Yeah, I hear you. That's cool.", "Mm-hmm. I'm with you."],
    shy: ["oh… okay… i'm listening…", "that's nice… i like talking to you."],
    dramatic: ["And THEN what happened?!", "This is quite the tale! Continue!"],
    foodie: ["I agree, and also: what are we eating?", "Fascinating. Now, about dinner…"],
    adventurous: ["That sounds like an adventure!", "Say more, I'm packing my bag!"],
    sleepy: ["mm… i'm listening… mostly…", "that's nice… zzz… sorry, continue…"],
    curious: ["Really? Why? How? Tell me everything.", "Ooh, now I have three questions."],
    chatty: ["Oh totally! That reminds me of something!", "Yes! And you know what else? So much!"],
  },
};

function pick<T>(arr: T[], seed: number): T {
  const i = Math.abs(Math.trunc(seed)) % arr.length;
  return arr[i];
}

export function generateReply(
  cat: Cat,
  userText: string,
  messageCount: number
): { text: string; meow: string } {
  const intent = detectIntent(userText);
  const byTrait = REPLIES[intent];
  // Prefer the cat's strongest personality that has a reply pool.
  const primary =
    cat.personality.find((p) => byTrait[p] && byTrait[p].length) ?? "cuddly";
  const pool = byTrait[primary] ?? byTrait.cuddly;
  const seed = hash(`${cat.id}:${userText}:${messageCount}:${intent}`);
  let text = pick(pool, seed);
  const flair = pick(VOICE_FLAIR[cat.voice], seed >>> 3);
  // Add voice flair unless the reply already ends with an emoji or strong punctuation.
  const endsWithEmoji = /\p{Extended_Pictographic}\uFE0F?$/u.test(text);
  const endsWithPunct = /[!?…]$/.test(text);
  if (!endsWithEmoji && !endsWithPunct) {
    text = text.replace(/[.!?…\s]*$/, "") + flair;
  }
  return { text, meow: toMeow(text) };
}

export function generateGiftReaction(
  cat: Cat,
  giftId: GiftId
): { text: string; meow: string } {
  const gift = GIFTS.find((g) => g.id === giftId) ?? GIFTS[0];
  const reactions = [
    `A ${gift.label}?! For me?! You're my favorite.`,
    `Ohh, a ${gift.label}! I'm keeping this forever.`,
    `I have never been so honored. A whole ${gift.label}.`,
    `This ${gift.label} is mine now. You may watch me enjoy it.`,
  ];
  const seed = hash(`${cat.id}:${giftId}`);
  const text = pick(reactions, seed);
  return { text, meow: toMeow(text) };
}

export const DATE_ACTIVITIES: {
  id: string;
  label: string;
  emoji: string;
  story: (name: string) => string;
  reaction: string[];
}[] = [
  {
    id: "laser",
    label: "Laser Pointer Chase",
    emoji: "🔴",
    story: (n) =>
      `You and ${n} chase a rogue red dot across the living room. It escapes under the sofa. Nobody wins. Everyone had fun.`,
    reaction: ["I ALMOST had it!", "The red dot is my nemesis. Again next time?"],
  },
  {
    id: "nap",
    label: "Sunbeam Nap Together",
    emoji: "☀️",
    story: (n) =>
      `You and ${n} find the perfect sunbeam and fall asleep in a warm, purring pile. Time stops. It is perfect.`,
    reaction: ["Best. Date. Ever.", "I dreamt about you and also snacks."],
  },
  {
    id: "yarn",
    label: "Yarn Ball Mayhem",
    emoji: "🧶",
    story: (n) =>
      `${n} discovers the yarn ball and within seconds is completely tangled. You must rescue them. They pretend it was planned.`,
    reaction: ["I meant to do that.", "I was winning, actually."],
  },
  {
    id: "stargaze",
    label: "Stargazing on the Windowsill",
    emoji: "🌙",
    story: (n) =>
      `You and ${n} watch the night sky from the windowsill, tails twitching at every moth. ${n} names a star after you.`,
    reaction: ["That one's called 'Us'.", "You're my favorite constellation."],
  },
  {
    id: "cafe",
    label: "Cat Café Tasting Menu",
    emoji: "☕",
    story: (n) =>
      `${n} orders one of everything. You split a tiny salmon tartare. ${n} judges the plating. Verdict: acceptable.`,
    reaction: ["The service was slow but the company was excellent.", "We're coming back. Weekly."],
  },
  {
    id: "box",
    label: "Cardboard Box Expedition",
    emoji: "📦",
    story: (n) =>
      `You and ${n} discover a large empty box. ${n} climbs in immediately. There is no room for you. You are still invited to watch.`,
    reaction: ["It fits. Therefore I sits.", "This box is now our home."],
  },
];

export function planDate(cat: Cat, activityId: string): CatDate {
  const activity =
    DATE_ACTIVITIES.find((a) => a.id === activityId) ?? DATE_ACTIVITIES[0];
  const seed = hash(`${cat.id}:${activityId}`);
  return {
    activity: activity.label,
    emoji: activity.emoji,
    at: Date.now(),
    story: activity.story(cat.name),
    reaction: pick(activity.reaction, seed),
  };
}

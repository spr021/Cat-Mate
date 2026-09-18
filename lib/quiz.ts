import type { Personality } from "./types";

export interface QuizOption {
  label: string;
  emoji: string;
  traits: Personality[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    question: "It's 3 AM. Where are you?",
    options: [
      { label: "Under the blanket, asleep", emoji: "😴", traits: ["sleepy", "cuddly"] },
      { label: "Running laps across the house", emoji: "⚡", traits: ["playful", "adventurous"] },
      { label: "Staring at a wall, philosophically", emoji: "🌿", traits: ["chill", "curious"] },
      { label: "Screaming for no reason", emoji: "🎭", traits: ["dramatic", "chatty"] },
    ],
  },
  {
    id: "q2",
    question: "A new box appears. You…",
    options: [
      { label: "Get in immediately. Obviously.", emoji: "📦", traits: ["curious", "playful"] },
      { label: "Inspect it from a safe distance", emoji: "🫣", traits: ["shy", "curious"] },
      { label: "Ignore it. Boxes are beneath me.", emoji: "💅", traits: ["sassy", "grumpy"] },
      { label: "Nap on it instead of in it", emoji: "😴", traits: ["chill", "sleepy"] },
    ],
  },
  {
    id: "q3",
    question: "Your human is sad. You…",
    options: [
      { label: "Make biscuits on their heart", emoji: "🥰", traits: ["cuddly"] },
      { label: "Do a silly jump to cheer them up", emoji: "🤸", traits: ["playful", "chatty"] },
      { label: "Sit nearby, quietly present", emoji: "🫂", traits: ["shy", "chill"] },
      { label: "Bring them a leaf as a gift", emoji: "🍃", traits: ["curious", "cuddly"] },
    ],
  },
  {
    id: "q4",
    question: "Dinner is served. Your reaction?",
    options: [
      { label: "FINALLY. The best part of the day!", emoji: "🍣", traits: ["foodie", "dramatic"] },
      { label: "I'll eat it when I feel like it", emoji: "😒", traits: ["grumpy", "sassy"] },
      { label: "Is this the good pâté? I have standards.", emoji: "🧐", traits: ["sassy", "foodie"] },
      { label: "Food? I was busy climbing.", emoji: "🧗", traits: ["adventurous", "playful"] },
    ],
  },
  {
    id: "q5",
    question: "Your ideal first date is…",
    options: [
      { label: "A long nap in a sunbeam", emoji: "☀️", traits: ["sleepy", "cuddly"] },
      { label: "A rooftop adventure at dusk", emoji: "🌆", traits: ["adventurous", "curious"] },
      { label: "Deep conversation over snacks", emoji: "💬", traits: ["chatty", "foodie"] },
      { label: "Being admired from a distance", emoji: "👑", traits: ["sassy", "dramatic"] },
    ],
  },
];

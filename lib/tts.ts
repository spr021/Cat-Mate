"use client";

import { toMeow } from "./meow";

/** Pitch-shifted cat voice using the Web Speech API. */
export function canSpeak(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

export function speakMeow(humanText: string, meowText?: string) {
  if (!canSpeak()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      meowText && meowText.trim().length > 0 ? meowText : toMeow(humanText)
    );
    utterance.pitch = 1.9;
    utterance.rate = 0.92;
    utterance.volume = 0.9;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  } catch {
    /* speech is best-effort */
  }
}

export function stopSpeaking() {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
}

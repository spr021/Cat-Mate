"use client";

import { Volume2 } from "lucide-react";
import { cn } from "cn";
import type { Message } from "@/lib/types";
import { GIFTS } from "@/lib/mock/replies";
import { formatClock } from "@/lib/format";

export function TypingDots({ meow }: { meow: boolean }) {
  return (
    <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-md bg-card px-3.5 py-2.5 ring-1 ring-border">
      <span className="text-xs text-muted-foreground">
        {meow ? "meow" : "typing"}
      </span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-primary"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export function MessageBubble({
  message,
  meowMode,
  onSpeak,
  showReceipt,
}: {
  message: Message;
  meowMode: boolean;
  onSpeak?: (m: Message) => void;
  showReceipt?: boolean;
}) {
  const mine = message.sender === "me";
  const display = meowMode ? message.meow : message.text;

  if (message.kind === "system") {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-muted px-3 py-1 text-[0.7rem] text-muted-foreground">
          {message.text}
        </span>
      </div>
    );
  }

  if (message.kind === "date") {
    return (
      <div className="my-2 flex justify-center">
        <div className="w-full max-w-xs rounded-3xl border border-catnip/30 bg-catnip/8 p-4 text-center">
          <div className="text-3xl" aria-hidden>
            {message.sticker ?? "🌙"}
          </div>
          <p className="mt-1 font-heading text-sm font-semibold text-catnip">
            Cat Café date
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{message.text}</p>
          <p className="mt-2 text-[0.7rem] italic text-foreground/70">
            {message.meow}
          </p>
        </div>
      </div>
    );
  }

  if (message.kind === "sticker") {
    return (
      <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
        <span className="text-4xl" aria-label="sticker">
          {message.sticker}
        </span>
      </div>
    );
  }

  if (message.kind === "gift") {
    const gift = GIFTS.find((g) => g.id === message.gift);
    return (
      <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
        <div className="max-w-[80%] rounded-3xl border border-warning/40 bg-warning/12 px-4 py-2.5">
          <p className="text-sm font-medium">
            {gift?.emoji} {mine ? "You sent" : "Received"}{" "}
            {gift?.label ?? "a gift"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{display}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div className="max-w-[82%]">
        <div
          className={cn(
            "group relative rounded-3xl px-3.5 py-2.5 text-sm shadow-sm",
            mine
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-card text-card-foreground ring-1 ring-border"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{display}</p>
          {!mine && onSpeak && (
            <button
              type="button"
              aria-label="Hear it meowed"
              onClick={() => onSpeak(message)}
              className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-background text-muted-foreground opacity-0 ring-1 ring-border transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Volume2 className="size-3" />
            </button>
          )}
        </div>
        <div
          className={cn(
            "mt-0.5 flex items-center gap-1 px-1 text-[0.65rem] text-muted-foreground",
            mine ? "justify-end" : "justify-start"
          )}
        >
          <span>{formatClock(message.createdAt)}</span>
          {meowMode && <span className="opacity-70">· 🐱</span>}
          {mine && showReceipt && (
            <span className="text-primary">🐾🐾</span>
          )}
        </div>
      </div>
    </div>
  );
}

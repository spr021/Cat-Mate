"use client";

import { Heart, RotateCcw, Star, X } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

export function ActionButtons({
  onPass,
  onLike,
  onCatnip,
  onUndo,
  catnipTokens,
  canUndo,
  disabled,
}: {
  onPass: () => void;
  onLike: () => void;
  onCatnip: () => void;
  onUndo: () => void;
  catnipTokens: number;
  canUndo: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        aria-label="Undo last swipe"
        disabled={disabled || !canUndo}
        onClick={onUndo}
        className="size-11 rounded-full border-border bg-card text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="size-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        aria-label="Pass"
        disabled={disabled}
        onClick={onPass}
        className="size-16 rounded-full border-2 border-nope/40 bg-card text-nope transition-transform hover:scale-105 hover:bg-nope/10 active:scale-95"
      >
        <X className="size-8" />
      </Button>

      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          aria-label="Send Catnip super like"
          disabled={disabled || catnipTokens <= 0}
          onClick={onCatnip}
          className="size-12 rounded-full border-2 border-catnip/40 bg-card text-catnip transition-transform hover:scale-105 hover:bg-catnip/10 active:scale-95 disabled:opacity-40"
        >
          <Star className="size-6" />
        </Button>
        <span
          className={cn(
            "absolute -bottom-1 -right-1 grid min-w-5 place-items-center rounded-full px-1 text-[0.6rem] font-bold",
            catnipTokens > 0
              ? "bg-catnip text-catnip-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {catnipTokens}
        </span>
      </div>

      <Button
        size="icon"
        aria-label="Like"
        disabled={disabled}
        onClick={onLike}
        className="size-16 rounded-full border-2 border-like/50 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground transition-transform hover:scale-105 active:scale-95 fluffy-shadow-soft"
      >
        <Heart className="size-8 fill-current" />
      </Button>
    </div>
  );
}

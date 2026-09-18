"use client";

import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import type { Personality } from "@/lib/types";
import { PERSONALITY_META } from "@/lib/types";

export function PersonalityChips({
  traits,
  className,
  size = "default",
}: {
  traits: Personality[];
  className?: string;
  size?: "default" | "sm";
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {traits.map((t) => (
        <Badge
          key={t}
          variant="secondary"
          className={cn(
            "rounded-full border border-primary/15 bg-primary/10 text-primary",
            size === "sm" ? "h-5 px-1.5 text-[0.65rem]" : "h-6 px-2 text-xs"
          )}
        >
          <span aria-hidden>{PERSONALITY_META[t].emoji}</span>
          {PERSONALITY_META[t].label}
        </Badge>
      ))}
    </div>
  );
}

export function CompatibilityBadge({
  value,
  className,
  label = true,
}: {
  value: number;
  className?: string;
  label?: boolean;
}) {
  const tone =
    value >= 85
      ? "text-emerald-600 dark:text-emerald-400"
      : value >= 70
        ? "text-primary"
        : "text-amber-600 dark:text-amber-400";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-background/85 px-2 py-1 text-xs font-semibold shadow-sm backdrop-blur",
        tone,
        className
      )}
    >
      <span aria-hidden>💘</span>
      {value}%{label && <span className="font-normal opacity-80">match</span>}
    </span>
  );
}

export function EmptyState({
  emoji,
  title,
  description,
  action,
  className,
}: {
  emoji: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-3 text-5xl animate-float" aria-hidden>
        {emoji}
      </div>
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function InfoStat({
  label,
  value,
  emoji,
}: {
  label: string;
  value: React.ReactNode;
  emoji?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2.5 text-center">
      <div className="font-heading text-xl font-semibold">
        {emoji && <span className="mr-1 text-base">{emoji}</span>}
        {value}
      </div>
      <div className="text-[0.7rem] text-muted-foreground">{label}</div>
    </div>
  );
}

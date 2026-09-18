"use client";

import { useMemo, useState } from "react";
import { Heart, RotateCcw, Star, X } from "lucide-react";
import { cn } from "cn";
import { AppShell } from "@/components/catmate/AppShell";
import { CatAvatar } from "@/components/catmate/CatAvatar";
import { EmptyState } from "@/components/catmate/Bits";
import { Button } from "@/components/ui/button";
import { useCatMate } from "@/lib/store";
import { getCatById } from "@/lib/mock/cats";
import { avatarFromCat } from "@/lib/avatar";
import { timeAgo } from "@/lib/format";
import type { SwipeAction } from "@/lib/types";

const FILTERS: { id: "all" | SwipeAction; label: string; emoji: string }[] = [
  { id: "all", label: "All", emoji: "🐾" },
  { id: "like", label: "Meows", emoji: "💗" },
  { id: "catnip", label: "Catnip", emoji: "🌿" },
  { id: "pass", label: "Hisses", emoji: "😾" },
];

const ACTION_META: Record<
  SwipeAction,
  { label: string; emoji: string; className: string; Icon: typeof Heart }
> = {
  like: {
    label: "Meowed",
    emoji: "💗",
    className: "bg-primary/12 text-primary",
    Icon: Heart,
  },
  catnip: {
    label: "Catnip'd",
    emoji: "🌿",
    className: "bg-catnip/12 text-catnip",
    Icon: Star,
  },
  pass: {
    label: "Hissed",
    emoji: "😾",
    className: "bg-nope/12 text-nope",
    Icon: X,
  },
};

export default function PawPrintsPage() {
  const swipes = useCatMate((s) => s.swipes);
  const removeSwipe = useCatMate((s) => s.removeSwipe);
  const [filter, setFilter] = useState<"all" | SwipeAction>("all");

  const rows = useMemo(() => {
    return [...swipes]
      .reverse()
      .filter((s) => filter === "all" || s.action === filter)
      .map((s) => ({ swipe: s, cat: getCatById(s.catId) }))
      .filter((r) => r.cat);
  }, [swipes, filter]);

  return (
    <AppShell
      title="Paw prints"
      subtitle={`${swipes.length} swipe${swipes.length === 1 ? "" : "s"} so far`}
    >
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => {
            const count =
              f.id === "all"
                ? swipes.length
                : swipes.filter((s) => s.action === f.id).length;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === f.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="mr-1" aria-hidden>
                  {f.emoji}
                </span>
                {f.label} · {count}
              </button>
            );
          })}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            emoji="🐾"
            title="No paw prints yet"
            description="Every cat you swipe leaves a little paw print here."
          />
        ) : (
          <div className="grid gap-2.5">
            {rows.map(({ swipe, cat }) => {
              const c = cat!;
              const avatar = avatarFromCat(c);
              const meta = ACTION_META[swipe.action];
              return (
                <div
                  key={`${swipe.catId}-${swipe.at}`}
                  className="flex items-center gap-3 rounded-3xl border border-border bg-card p-3"
                >
                  <div className="size-12 shrink-0 overflow-hidden rounded-2xl ring-1 ring-border">
                    <CatAvatar
                      fur={avatar.fur}
                      pattern={avatar.pattern}
                      eyes={avatar.eyes}
                      accessory={avatar.accessory}
                      size={48}
                      className="h-full w-full"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-base font-semibold">
                      {c.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.breed} · {timeAgo(swipe.at)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[0.7rem] font-semibold",
                      meta.className
                    )}
                  >
                    <meta.Icon className="size-3" />
                    {meta.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Bring ${c.name} back`}
                    className="shrink-0 rounded-full text-muted-foreground"
                    onClick={() => removeSwipe(swipe.catId)}
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

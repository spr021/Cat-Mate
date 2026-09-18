"use client";

import { useEffect, useState } from "react";
import { Heart, Trophy } from "lucide-react";
import { cn } from "cn";
import { AppShell } from "@/components/catmate/AppShell";
import { CatAvatar } from "@/components/catmate/CatAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getCatById } from "@/lib/mock/cats";
import { avatarFromCat } from "@/lib/avatar";
import { compatibility } from "@/lib/compat";
import { fetchLeaderboard } from "@/lib/api";
import { useCatMate } from "@/lib/store";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const profile = useCatMate((s) => s.profile);
  const [rows, setRows] = useState<
    { catId: string; likes: number; rank: number }[] | null
  >(null);

  useEffect(() => {
    let active = true;
    fetchLeaderboard()
      .then((r) => active && setRows(r))
      .catch(() => active && setRows([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell
      title="Most eligible cats"
      subtitle="This week's neighborhood heartthrobs"
    >
      <div className="mb-4 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-primary/15 to-catnip/15 p-4">
        <Trophy className="size-8 text-primary" />
        <p className="text-sm text-muted-foreground">
          Ranked by how many cats and humans have meowed at them. Fame is
          temporary; fluff is forever.
        </p>
      </div>

      {!rows ? (
        <div className="grid gap-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-2.5">
          {rows.map((entry) => {
            const cat = getCatById(entry.catId);
            if (!cat) return null;
            const avatar = avatarFromCat(cat);
            const top3 = entry.rank <= 3;
            return (
              <div
                key={entry.catId}
                className={cn(
                  "flex items-center gap-3 rounded-3xl border bg-card p-3",
                  top3
                    ? "border-primary/40 fluffy-shadow-soft"
                    : "border-border"
                )}
              >
                <div className="w-8 shrink-0 text-center">
                  {top3 ? (
                    <span className="text-2xl">{MEDALS[entry.rank - 1]}</span>
                  ) : (
                    <span className="font-heading text-lg font-semibold text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>
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
                    {cat.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {cat.breed} · {cat.neighborhood}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    <Heart className="size-4 fill-current" />
                    {entry.likes.toLocaleString()}
                  </span>
                  <p className="text-[0.65rem] text-muted-foreground">
                    💘 {compatibility(profile, cat)}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

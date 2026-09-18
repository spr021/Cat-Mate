"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { cn } from "cn";
import { AppShell } from "@/components/catmate/AppShell";
import { CatAvatar } from "@/components/catmate/CatAvatar";
import { EmptyState } from "@/components/catmate/Bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatMate } from "@/lib/store";
import { getCatById } from "@/lib/mock/cats";
import { avatarFromCat } from "@/lib/avatar";
import { matchCompatibility, stageFor } from "@/lib/compat";
import { formatClock, timeAgo } from "@/lib/format";
import { STAGE_META } from "@/lib/types";

type SortKey = "recent" | "compatibility" | "stage";

export default function MatchesPage() {
  const matches = useCatMate((s) => s.matches);
  const profile = useCatMate((s) => s.profile);
  const hydrated = useCatMate((s) => s.hydrated);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  const rows = useMemo(() => {
    const list = matches
      .map((m) => ({ match: m, cat: getCatById(m.catId) }))
      .filter((r) => r.cat)
      .filter((r) =>
        query.trim()
          ? r.cat!.name.toLowerCase().includes(query.trim().toLowerCase())
          : true
      );

    list.sort((a, b) => {
      if (sort === "compatibility")
        return (
          matchCompatibility(profile, b.cat!) -
          matchCompatibility(profile, a.cat!)
        );
      if (sort === "stage")
        return b.match.messages.length - a.match.messages.length;
      const aTime =
        a.match.messages[a.match.messages.length - 1]?.createdAt ??
        a.match.matchedAt;
      const bTime =
        b.match.messages[b.match.messages.length - 1]?.createdAt ??
        b.match.matchedAt;
      return bTime - aTime;
    });
    return list;
  }, [matches, query, sort, profile]);

  return (
    <AppShell title="Your matches" subtitle={`${matches.length} purr-fect matches`}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your matches…"
              className="h-10 rounded-full pl-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-10 w-36 rounded-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="compatibility">Best match</SelectItem>
              <SelectItem value="stage">Closest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!hydrated ? (
          <div className="grid gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-3xl bg-card"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            emoji="💌"
            title={matches.length === 0 ? "No matches yet" : "No cats found"}
            description={
              matches.length === 0
                ? "Start swiping! When a cat meows back, they'll appear here."
                : "Try a different name."
            }
            action={
              matches.length === 0 ? (
                <Button asChild className="rounded-full">
                  <Link href="/">Go swipe</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-3">
            {rows.map(({ match, cat }) => {
              const c = cat!;
              const avatar = avatarFromCat(c);
              const stage = stageFor(match.messages.length);
              const last = match.messages[match.messages.length - 1];
              return (
                <Link
                  key={match.id}
                  href={`/chat/${match.id}`}
                  className={cn(
                    "group flex min-w-0 items-center gap-3 overflow-hidden rounded-3xl border border-border bg-card p-3 transition-all hover:border-primary/40 hover:fluffy-shadow-soft",
                    match.unread > 0 && "border-primary/40 bg-primary/5"
                  )}
                >
                  <div className="relative">
                    <div className="size-14 overflow-hidden rounded-2xl ring-2 ring-primary/20">
                      <CatAvatar
                        fur={avatar.fur}
                        pattern={avatar.pattern}
                        eyes={avatar.eyes}
                        accessory={avatar.accessory}
                        size={56}
                        className="h-full w-full"
                      />
                    </div>
                    {match.unread > 0 && (
                      <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground">
                        {match.unread}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-heading text-base font-semibold">
                        {c.name}
                        {match.superLike && (
                          <span className="ml-1 text-catnip" title="Catnip super like">
                            🌿
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-[0.7rem] text-muted-foreground">
                        {last ? formatClock(last.createdAt) : timeAgo(match.matchedAt)}
                      </span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {last
                        ? `${last.sender === "me" ? "You: " : ""}${last.text}`
                        : "Say meow to break the ice 🐾"}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[0.68rem]">
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 font-medium">
                        {STAGE_META[stage].emoji} {STAGE_META[stage].label}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-primary">
                        <Sparkles className="size-3" />
                        {matchCompatibility(profile, c, match.compatibility)}%
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

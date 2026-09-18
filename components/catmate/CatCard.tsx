"use client";

import { Info, MapPin } from "lucide-react";
import { cn } from "cn";
import type { Cat } from "@/lib/types";
import { archetypeOf } from "@/lib/archetypes";
import { formatAge, formatDistance } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CompatibilityBadge, PersonalityChips } from "./Bits";
import { CatImage } from "./CatImage";

function ChipList({
  title,
  emoji,
  items,
  tone,
}: {
  title: string;
  emoji: string;
  items: string[];
  tone: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
        <span aria-hidden>{emoji}</span>
        {title}
      </div>
      <div className="flex flex-wrap gap-1">
        {items.slice(0, 4).map((item) => (
          <span
            key={item}
            className={cn(
              "rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
              tone
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CatCard({
  cat,
  compatibility,
  onDetails,
  className,
}: {
  cat: Cat;
  compatibility: number;
  onDetails?: () => void;
  className?: string;
}) {
  const archetype = archetypeOf(cat.archetype);

  return (
    <div
      className={cn(
        "relative flex h-full w-full select-none flex-col overflow-hidden rounded-[2rem] bg-card ring-1 ring-border fluffy-shadow",
        className
      )}
    >
      <div className="relative h-[56%] shrink-0 overflow-hidden">
        <CatImage cat={cat} priority className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <CompatibilityBadge value={compatibility} />
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-background/85 px-2 py-1 text-xs font-semibold shadow-sm backdrop-blur">
            <span aria-hidden>{archetype.emoji}</span>
            <span className="max-w-[9rem] truncate">{archetype.name}</span>
          </span>
        </div>

        {onDetails && (
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label="View full profile"
            className="absolute right-3 top-3 rounded-full bg-background/85 backdrop-blur hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onDetails();
            }}
          >
            <Info className="size-4" />
          </Button>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="font-heading text-3xl font-semibold leading-none drop-shadow">
                {cat.name}
              </h2>
              <p className="mt-1 text-sm text-white/85">
                {cat.breed} · {formatAge(cat.ageMonths)}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/35 px-2 py-1 text-[0.7rem] font-medium backdrop-blur">
              <MapPin className="size-3" />
              {formatDistance(cat.distanceKm)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 p-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">{cat.bio}</p>
        <PersonalityChips traits={cat.personality} size="sm" />
        <div className="rounded-2xl bg-secondary/60 px-3 py-2">
          <p className="text-[0.62rem] font-semibold uppercase tracking-wide text-muted-foreground">
            💘 Looking for
          </p>
          <p className="line-clamp-2 text-xs">{cat.lookingFor}</p>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 pt-1">
          <ChipList
            title="Favorite toys"
            emoji="🧶"
            items={cat.favoriteToys}
            tone="bg-catnip/12 text-catnip"
          />
          <ChipList
            title="Favorite food"
            emoji="🐟"
            items={cat.favoriteFoods}
            tone="bg-warning/15 text-warning-foreground"
          />
        </div>
      </div>
    </div>
  );
}

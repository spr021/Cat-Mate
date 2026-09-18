"use client";

import { Heart, MapPin, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Cat } from "@/lib/types";
import { archetypeOf } from "@/lib/archetypes";
import { formatAge, formatDistance } from "@/lib/format";
import { CatImage } from "./CatImage";
import { CompatibilityBadge, PersonalityChips } from "./Bits";

export function CatDetailsDialog({
  cat,
  compatibility,
  open,
  onOpenChange,
  onLike,
  onPass,
}: {
  cat: Cat | null;
  compatibility: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLike: () => void;
  onPass: () => void;
}) {
  if (!cat) return null;
  const archetype = archetypeOf(cat.archetype);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90dvh] max-w-md overflow-y-auto rounded-[2rem] border-none p-0"
      >
        <DialogTitle className="sr-only">{cat.name}&apos;s profile</DialogTitle>
        <div className="relative h-64 shrink-0">
          <CatImage cat={cat} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <Button
            variant="secondary"
            size="icon-sm"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 rounded-full bg-background/85 backdrop-blur"
          >
            <X className="size-4" />
          </Button>
          <div className="absolute left-3 top-3">
            <CompatibilityBadge value={compatibility} />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <h2 className="font-heading text-3xl font-semibold leading-none">
              {cat.name}
            </h2>
            <p className="mt-1 text-sm text-white/85">
              {cat.breed} · {formatAge(cat.ageMonths)} ·{" "}
              {cat.gender === "male" ? "♂" : "♀"}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
              <MapPin className="size-3" />
              {formatDistance(cat.distanceKm)}
            </span>
            <span className="rounded-full bg-muted px-2 py-1">
              {cat.neighborhood}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-catnip/12 px-2 py-1 text-catnip">
              {archetype.emoji} {archetype.name}
            </span>
          </div>

          <p className="text-sm">{cat.bio}</p>

          <div>
            <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Personality
            </h4>
            <PersonalityChips traits={cat.personality} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                🧶 Favorite toys
              </h4>
              <ul className="space-y-1 text-sm">
                {cat.favoriteToys.map((t) => (
                  <li key={t} className="rounded-lg bg-muted/60 px-2 py-1">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                🐟 Favorite food
              </h4>
              <ul className="space-y-1 text-sm">
                {cat.favoriteFoods.map((f) => (
                  <li key={f} className="rounded-lg bg-muted/60 px-2 py-1">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/60 p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Looking for
            </h4>
            <p className="mt-0.5 text-sm">{cat.lookingFor}</p>
          </div>

          <div className="flex gap-2 pb-1">
            <Button
              variant="outline"
              onClick={() => {
                onPass();
                onOpenChange(false);
              }}
              className="h-11 flex-1 rounded-full border-2 border-nope/40 text-nope"
            >
              <X className="size-5" />
              Hiss
            </Button>
            <Button
              onClick={() => {
                onLike();
                onOpenChange(false);
              }}
              className="h-11 flex-1 rounded-full fluffy-shadow-soft"
            >
              <Heart className="size-5 fill-current" />
              Meow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

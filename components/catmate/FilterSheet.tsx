"use client";

import { Sparkles } from "lucide-react";
import { cn } from "cn";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatMate } from "@/lib/store";
import { CATS } from "@/lib/mock/cats";
import { PERSONALITIES, PERSONALITY_META } from "@/lib/types";
import type { Personality } from "@/lib/types";

const BREEDS = Array.from(new Set(CATS.map((c) => c.breed))).sort();

export function FilterSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const filters = useCatMate((s) => s.filters);
  const setFilters = useCatMate((s) => s.setFilters);

  const togglePersonality = (p: Personality) => {
    const has = filters.personalities.includes(p);
    setFilters({
      personalities: has
        ? filters.personalities.filter((x) => x !== p)
        : [...filters.personalities, p],
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-2xl rounded-t-[2rem] px-5 pb-8"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="flex items-center gap-2 font-heading text-xl">
            <Sparkles className="size-5 text-primary" />
            Fine-tune your whiskers
          </SheetTitle>
          <SheetDescription>
            Narrow the deck to cats you&apos;ll actually swoon over.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 pt-1">
          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
              Personality
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {PERSONALITIES.map((p) => {
                const active = filters.personalities.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={active}
                    onClick={() => togglePersonality(p)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
                      active
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="mr-1" aria-hidden>
                      {PERSONALITY_META[p].emoji}
                    </span>
                    {PERSONALITY_META[p].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Max distance
              </Label>
              <span className="text-sm font-semibold">
                {filters.maxDistance} km
              </span>
            </div>
            <Slider
              min={1}
              max={30}
              step={1}
              value={[filters.maxDistance]}
              onValueChange={([v]) => setFilters({ maxDistance: v })}
            />
          </div>

          <div>
            <Label className="mb-2 block text-xs uppercase tracking-wide text-muted-foreground">
              Breed
            </Label>
            <Select
              value={filters.breed ?? "all"}
              onValueChange={(v) =>
                setFilters({ breed: v === "all" ? null : v })
              }
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Any breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any breed</SelectItem>
                {BREEDS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() =>
                setFilters({ personalities: [], maxDistance: 30, breed: null })
              }
            >
              Reset
            </Button>
            <Button
              className="flex-1 rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Show me cats
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

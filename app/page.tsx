"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Leaf, SlidersHorizontal, Sparkles } from "lucide-react";
import { AppShell } from "@/components/catmate/AppShell";
import { SwipeDeck, type SwipeDeckHandle } from "@/components/catmate/SwipeDeck";
import { ActionButtons } from "@/components/catmate/ActionButtons";
import { MatchModal } from "@/components/catmate/MatchModal";
import { CatDetailsDialog } from "@/components/catmate/CatDetailsDialog";
import { FilterSheet } from "@/components/catmate/FilterSheet";
import { EmptyState } from "@/components/catmate/Bits";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatMate } from "@/lib/store";
import { compatibility, matchCompatibility } from "@/lib/compat";
import { fetchCats, fetchFacts, postSwipe } from "@/lib/api";
import { playHiss, playMatch, playMeow, playPurr } from "@/lib/sound";
import type { Cat, Match, SwipeAction } from "@/lib/types";
import Link from "next/link";

export default function DiscoverPage() {
  const router = useRouter();
  const hydrated = useCatMate((s) => s.hydrated);
  const profile = useCatMate((s) => s.profile);
  const swipes = useCatMate((s) => s.swipes);
  const matches = useCatMate((s) => s.matches);
  const filters = useCatMate((s) => s.filters);
  const catnipTokens = useCatMate((s) => s.catnipTokens);
  const recordSwipe = useCatMate((s) => s.recordSwipe);
  const undoLastSwipe = useCatMate((s) => s.undoLastSwipe);
  const consumeCatnip = useCatMate((s) => s.consumeCatnip);
  const addMatch = useCatMate((s) => s.addMatch);
  const setFilters = useCatMate((s) => s.setFilters);

  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [facts, setFacts] = useState<string[]>([]);
  const [matchState, setMatchState] = useState<Match | null>(null);
  const [detailsCat, setDetailsCat] = useState<Cat | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const deckRef = useRef<SwipeDeckHandle | null>(null);
  const swipeCounter = useRef(0);

  useEffect(() => {
    let active = true;
    Promise.all([fetchCats(), fetchFacts()])
      .then(([c, f]) => {
        if (!active) return;
        setCats(c);
        setFacts(f.map((x) => x.text));
      })
      .catch(() => toast.error("Couldn't fetch cats. Try again."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const swipedIds = useMemo(() => new Set(swipes.map((s) => s.catId)), [swipes]);
  const matchedIds = useMemo(
    () => new Set(matches.map((m) => m.catId)),
    [matches]
  );

  const remaining = useMemo(() => {
    return cats.filter((cat) => {
      if (swipedIds.has(cat.id) || matchedIds.has(cat.id)) return false;
      if (cat.distanceKm > filters.maxDistance) return false;
      if (filters.breed && cat.breed !== filters.breed) return false;
      if (
        filters.personalities.length > 0 &&
        !cat.personality.some((p) => filters.personalities.includes(p))
      )
        return false;
      return true;
    });
  }, [cats, swipedIds, matchedIds, filters]);

  const compatibilityFor = useCallback(
    (cat: Cat) => compatibility(profile, cat),
    [profile]
  );

  const matchedCat = useMemo(
    () => cats.find((c) => c.id === matchState?.catId) ?? null,
    [cats, matchState]
  );

  const showFact = useCallback(() => {
    if (facts.length === 0) return;
    const fact = facts[Math.floor(Math.random() * facts.length)];
    toast("Did you know? 🐱", { description: fact });
  }, [facts]);

  const handleSwipe = useCallback(
    async (cat: Cat, action: SwipeAction) => {
      if (action === "catnip" && !consumeCatnip()) {
        toast("Out of Catnip 🌿", {
          description: "Your catnip refills tomorrow. Try a regular Meow!",
        });
        return;
      }

      recordSwipe(cat.id, action);

      if (action === "like") playPurr();
      else if (action === "pass") playHiss();
      else playMeow();

      swipeCounter.current += 1;
      if (swipeCounter.current % 3 === 0) showFact();

      setBusy(true);
      try {
        const result = await postSwipe(cat.id, action);
        if (result.matched && result.match) {
          addMatch(result.match);
          setMatchState(result.match);
          playMatch();
        }
      } catch {
        toast.error("Couldn't send that meow. It's fine — cats are mysterious.");
      } finally {
        setBusy(false);
      }
    },
    [addMatch, recordSwipe, showFact, consumeCatnip]
  );

  const handleUndo = useCallback(() => {
    const last = undoLastSwipe();
    if (!last) {
      toast("Nothing to undo", { description: "You haven't swiped yet." });
      return;
    }
    toast("Paw-undo! 🐾", { description: "That cat is back in the deck." });
  }, [undoLastSwipe]);

  const activeFilterCount =
    filters.personalities.length +
    (filters.breed ? 1 : 0) +
    (filters.maxDistance < 30 ? 1 : 0);

  return (
    <AppShell
      subtitle="find your purr-fect match"
      right={
        <Button
          variant="ghost"
          size="icon"
          aria-label="Filters"
          className="relative rounded-full"
          onClick={() => setFilterOpen(true)}
        >
          <SlidersHorizontal className="size-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[0.6rem] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      }
    >
      <div className="flex min-h-[calc(100dvh-9.5rem)] flex-col gap-3">
        {!profile && hydrated && (
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/8 px-3 py-2.5">
            <span className="text-xl" aria-hidden>
              🎀
            </span>
            <p className="flex-1 text-xs text-muted-foreground">
              Create your cat to unlock accurate compatibility scores.
            </p>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/onboarding">Create</Link>
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="size-3.5 text-primary" />
            {remaining.length} cat{remaining.length === 1 ? "" : "s"} nearby
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-catnip/12 px-2 py-0.5 font-medium text-catnip">
            <Leaf className="size-3.5" />
            {catnipTokens} catnip
          </span>
        </div>

        <div className="relative min-h-0 flex-1">
          {!hydrated || loading ? (
            <Skeleton className="h-full min-h-[26rem] w-full rounded-[2rem]" />
          ) : remaining.length === 0 ? (
            <EmptyState
              emoji="😿"
              title={cats.length === 0 ? "No cats found" : "You've seen every cat!"}
              description={
                activeFilterCount > 0
                  ? "Your filters might be too strict. Try widening your whiskers."
                  : "You've swiped through the whole neighborhood. Paw-undo to revisit a cat, or check back later."
              }
              action={
                activeFilterCount > 0 ? (
                  <Button
                    className="rounded-full"
                    onClick={() =>
                      setFilters({
                        personalities: [],
                        maxDistance: 30,
                        breed: null,
                      })
                    }
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={handleUndo}
                  >
                    Paw-undo last swipe
                  </Button>
                )
              }
            />
          ) : (
            <SwipeDeck
              ref={deckRef}
              cats={remaining}
              compatibilityFor={compatibilityFor}
              onSwipe={handleSwipe}
              onDetails={setDetailsCat}
              disabled={busy}
              canCatnip={catnipTokens > 0}
              onCatnipEmpty={() =>
                toast("Out of Catnip 🌿", {
                  description:
                    "Your catnip refills tomorrow. Try a regular Meow!",
                })
              }
            />
          )}
        </div>

        {hydrated && !loading && remaining.length > 0 && (
          <div className="pt-1">
            <ActionButtons
              disabled={busy}
              catnipTokens={catnipTokens}
              canUndo={swipes.length > 0}
              onUndo={handleUndo}
              onPass={() => deckRef.current?.swipe("pass")}
              onLike={() => deckRef.current?.swipe("like")}
              onCatnip={() => deckRef.current?.swipe("catnip")}
            />
          </div>
        )}
      </div>

      <MatchModal
        open={Boolean(matchState)}
        match={matchState}
        cat={matchedCat}
        compatibility={
          matchedCat
            ? matchCompatibility(profile, matchedCat, matchState?.compatibility)
            : 0
        }
        onChat={() => {
          const id = matchState?.id;
          setMatchState(null);
          if (id) router.push(`/chat/${id}`);
        }}
        onClose={() => setMatchState(null)}
      />

      <CatDetailsDialog
        cat={detailsCat}
        compatibility={detailsCat ? compatibilityFor(detailsCat) : 0}
        open={Boolean(detailsCat)}
        onOpenChange={(v) => !v && setDetailsCat(null)}
        onLike={() => detailsCat && deckRef.current?.swipe("like")}
        onPass={() => detailsCat && deckRef.current?.swipe("pass")}
      />

      <FilterSheet open={filterOpen} onOpenChange={setFilterOpen} />
    </AppShell>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { useCatMate } from "@/lib/store";
import { setSoundEnabled, playAchievement } from "@/lib/sound";
import { fetchSeedMatches } from "@/lib/api";
import { evaluateAchievements } from "@/lib/achievements";
import { achievementById } from "@/lib/achievements";
import { stageFor } from "@/lib/compat";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrated = useCatMate((s) => s.hydrated);
  const setHydrated = useCatMate((s) => s.setHydrated);
  const theme = useCatMate((s) => s.theme);
  const soundEnabled = useCatMate((s) => s.soundEnabled);
  const seeded = useCatMate((s) => s.seeded);
  const seedMatches = useCatMate((s) => s.seedMatches);
  const refillCatnipIfNeeded = useCatMate((s) => s.refillCatnipIfNeeded);
  const setAchievements = useCatMate((s) => s.setAchievements);

  const seedStarted = useRef(false);

  // Hydration flag
  useEffect(() => {
    if (useCatMate.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useCatMate.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, [setHydrated]);

  // Theme -> <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "midnight");
    root.style.colorScheme = theme === "midnight" ? "dark" : "light";
  }, [theme]);

  // Sound engine
  useEffect(() => {
    setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Allow re-seeding after a data reset
  useEffect(() => {
    if (!seeded) seedStarted.current = false;
  }, [seeded]);

  // Seed starter matches once
  useEffect(() => {
    if (!hydrated || seeded || seedStarted.current) return;
    seedStarted.current = true;
    let active = true;
    fetchSeedMatches()
      .then((matches) => {
        if (active) seedMatches(matches);
      })
      .catch(() => {
        seedStarted.current = false;
      });
    return () => {
      active = false;
    };
  }, [hydrated, seeded, seedMatches]);

  // Daily catnip refill
  useEffect(() => {
    if (hydrated) refillCatnipIfNeeded();
  }, [hydrated, refillCatnipIfNeeded]);

  // Achievement evaluation
  const swipes = useCatMate((s) => s.swipes);
  const matches = useCatMate((s) => s.matches);
  const profile = useCatMate((s) => s.profile);
  const themesTried = useCatMate((s) => s.themesTried);
  const nightOwl = useCatMate((s) => s.nightOwl);
  const achievements = useCatMate((s) => s.achievements);

  useEffect(() => {
    if (!hydrated) return;
    const messages = matches.reduce((n, m) => n + m.messages.length, 0);
    const gifts = matches.reduce(
      (n, m) => n + m.messages.filter((x) => x.kind === "gift").length,
      0
    );
    const dates = matches.filter((m) => m.date).length;
    const soulmates = matches.filter((m) => stageFor(m.messages.length) === "soulmate").length;
    const catnips = swipes.filter((s) => s.action === "catnip").length;

    const unlocked = evaluateAchievements({
      profileCreated: Boolean(profile),
      swipes: swipes.length,
      likes: swipes.filter((s) => s.action !== "pass").length,
      matches: matches.length,
      messages,
      catnips,
      gifts,
      dates,
      themesTried: themesTried.length,
      nightOwl,
      soulmates,
    });

    const fresh = unlocked.filter((id) => !achievements.includes(id));
    if (fresh.length === 0) return;
    setAchievements(unlocked);
    playAchievement();
    fresh.forEach((id) => {
      const def = achievementById(id);
      if (def) {
        toast(`${def.emoji} Achievement unlocked!`, {
          description: `${def.name} — ${def.description}`,
        });
      }
    });
  }, [
    hydrated,
    swipes,
    matches,
    profile,
    themesTried,
    nightOwl,
    achievements,
    setAchievements,
  ]);

  return (
    <TooltipProvider delayDuration={200}>
      {children}
      <Toaster position="top-center" />
    </TooltipProvider>
  );
}

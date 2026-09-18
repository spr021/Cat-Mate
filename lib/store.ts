"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CatDate,
  Match,
  Message,
  SwipeAction,
  SwipeRecord,
  ThemeId,
  UserCat,
} from "./types";

export const CATNIP_PER_DAY = 3;

export interface Filters {
  personalities: string[];
  maxDistance: number;
  breed: string | null;
}

interface CatMateState {
  hydrated: boolean;
  theme: ThemeId;
  soundEnabled: boolean;
  themesTried: ThemeId[];
  profile: UserCat | null;
  quizDone: boolean;

  swipes: SwipeRecord[];
  catnipTokens: number;
  catnipResetAt: string;

  matches: Match[];
  achievements: string[];
  seeded: boolean;
  nightOwl: boolean;
  filters: Filters;

  setHydrated: (v: boolean) => void;
  setTheme: (t: ThemeId) => void;
  setSoundEnabled: (v: boolean) => void;
  setProfile: (p: UserCat) => void;
  setQuizDone: (v: boolean) => void;
  clearProfile: () => void;

  recordSwipe: (catId: string, action: SwipeAction) => void;
  undoLastSwipe: () => SwipeRecord | null;
  removeSwipe: (catId: string) => void;
  consumeCatnip: () => boolean;
  refillCatnipIfNeeded: () => void;

  addMatch: (match: Match) => void;
  removeMatch: (matchId: string) => void;
  seedMatches: (matches: Match[]) => void;
  appendMessage: (matchId: string, message: Message) => void;
  markRead: (matchId: string) => void;
  bumpAffection: (matchId: string, amount: number) => void;
  setMatchDate: (matchId: string, date: CatDate) => void;

  setAchievements: (ids: string[]) => void;
  setNightOwl: (v: boolean) => void;
  setFilters: (f: Partial<Filters>) => void;
  resetAll: () => void;
}

const today = () => {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

export const useCatMate = create<CatMateState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      theme: "bubblegum",
      soundEnabled: true,
      themesTried: ["bubblegum"],
      profile: null,
      quizDone: false,

      swipes: [],
      catnipTokens: CATNIP_PER_DAY,
      catnipResetAt: today(),

      matches: [],
      achievements: [],
      seeded: false,
      nightOwl: false,
      filters: { personalities: [], maxDistance: 30, breed: null },

      setHydrated: (v) => set({ hydrated: v }),

      setTheme: (t) =>
        set((s) => ({
          theme: t,
          themesTried: s.themesTried.includes(t)
            ? s.themesTried
            : [...s.themesTried, t],
        })),

      setSoundEnabled: (v) => set({ soundEnabled: v }),

      setProfile: (p) => set({ profile: p }),
      setQuizDone: (v) => set({ quizDone: v }),
      clearProfile: () => set({ profile: null, quizDone: false }),

      recordSwipe: (catId, action) =>
        set((s) => ({
          swipes: [
            ...s.swipes.filter((x) => x.catId !== catId),
            { catId, action, at: Date.now() },
          ],
        })),

      undoLastSwipe: () => {
        const { swipes } = get();
        if (swipes.length === 0) return null;
        const last = swipes[swipes.length - 1];
        set((s) => ({
          swipes: s.swipes.slice(0, -1),
          matches:
            last.action === "pass"
              ? s.matches
              : s.matches.filter((m) => m.catId !== last.catId),
        }));
        return last;
      },

      removeSwipe: (catId) =>
        set((s) => {
          const record = s.swipes.find((x) => x.catId === catId);
          return {
            swipes: s.swipes.filter((x) => x.catId !== catId),
            matches:
              !record || record.action === "pass"
                ? s.matches
                : s.matches.filter((m) => m.catId !== catId),
          };
        }),

      consumeCatnip: () => {
        const { catnipTokens } = get();
        if (catnipTokens <= 0) return false;
        set({ catnipTokens: catnipTokens - 1 });
        return true;
      },

      refillCatnipIfNeeded: () => {
        const { catnipResetAt } = get();
        if (catnipResetAt !== today()) {
          set({ catnipTokens: CATNIP_PER_DAY, catnipResetAt: today() });
        }
      },

      addMatch: (match) =>
        set((s) => {
          if (s.matches.some((m) => m.id === match.id)) return s;
          return { matches: [match, ...s.matches] };
        }),

      removeMatch: (matchId) =>
        set((s) => ({ matches: s.matches.filter((m) => m.id !== matchId) })),

      seedMatches: (matches) =>
        set((s) => {
          if (s.seeded) return s;
          const ids = new Set(s.matches.map((m) => m.id));
          const merged = [
            ...s.matches,
            ...matches.filter((m) => !ids.has(m.id)),
          ];
          return { matches: merged, seeded: true };
        }),

      appendMessage: (matchId, message) =>
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId
              ? { ...m, messages: [...m.messages, message] }
              : m
          ),
        })),

      markRead: (matchId) =>
        set((s) => {
          const target = s.matches.find((m) => m.id === matchId);
          if (!target) return s;
          const needsUpdate =
            target.unread > 0 || target.messages.some((msg) => !msg.read);
          if (!needsUpdate) return s;
          return {
            matches: s.matches.map((m) =>
              m.id === matchId
                ? {
                    ...m,
                    unread: 0,
                    messages: m.messages.map((msg) =>
                      msg.read ? msg : { ...msg, read: true }
                    ),
                  }
                : m
            ),
          };
        }),

      bumpAffection: (matchId, amount) =>
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId
              ? { ...m, affection: Math.max(0, Math.min(100, m.affection + amount)) }
              : m
          ),
        })),

      setMatchDate: (matchId, date) =>
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId ? { ...m, date } : m
          ),
        })),

      setAchievements: (ids) =>
        set((s) => {
          const merged = [...new Set([...s.achievements, ...ids])];
          return merged.length === s.achievements.length
            ? s
            : { achievements: merged };
        }),
      setNightOwl: (v) => set({ nightOwl: v }),
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),

      resetAll: () =>
        set({
          theme: "bubblegum",
          themesTried: ["bubblegum"],
          soundEnabled: true,
          profile: null,
          quizDone: false,
          swipes: [],
          catnipTokens: CATNIP_PER_DAY,
          catnipResetAt: today(),
          matches: [],
          achievements: [],
          seeded: false,
          nightOwl: false,
          filters: { personalities: [], maxDistance: 30, breed: null },
        }),
    }),
    {
      name: "catmate-store-v1",
      partialize: (s) => ({
        theme: s.theme,
        soundEnabled: s.soundEnabled,
        themesTried: s.themesTried,
        profile: s.profile,
        quizDone: s.quizDone,
        swipes: s.swipes,
        catnipTokens: s.catnipTokens,
        catnipResetAt: s.catnipResetAt,
        matches: s.matches,
        achievements: s.achievements,
        seeded: s.seeded,
        nightOwl: s.nightOwl,
        filters: s.filters,
      }),
    }
  )
);

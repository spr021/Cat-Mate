"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  Check,
  MessageCircle,
  Palette,
  Pencil,
  RotateCcw,
  Trash2,
  Volume2,
} from "lucide-react";
import { cn } from "cn";
import { AppShell } from "@/components/catmate/AppShell";
import { CatAvatar } from "@/components/catmate/CatAvatar";
import { EmptyState, InfoStat, PersonalityChips } from "@/components/catmate/Bits";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCatMate } from "@/lib/store";
import { archetypeOf } from "@/lib/archetypes";
import { formatAge } from "@/lib/format";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { THEME_META } from "@/lib/types";
import type { ThemeId } from "@/lib/types";
import { playPop, playPurr } from "@/lib/sound";

const THEMES = Object.entries(THEME_META) as [
  ThemeId,
  (typeof THEME_META)[ThemeId],
][];

export default function MePage() {
  const profile = useCatMate((s) => s.profile);
  const theme = useCatMate((s) => s.theme);
  const setTheme = useCatMate((s) => s.setTheme);
  const soundEnabled = useCatMate((s) => s.soundEnabled);
  const setSoundEnabled = useCatMate((s) => s.setSoundEnabled);
  const matches = useCatMate((s) => s.matches);
  const swipes = useCatMate((s) => s.swipes);
  const achievements = useCatMate((s) => s.achievements);
  const catnipTokens = useCatMate((s) => s.catnipTokens);
  const resetAll = useCatMate((s) => s.resetAll);

  const messages = matches.reduce((n, m) => n + m.messages.length, 0);
  const gifts = matches.reduce(
    (n, m) => n + m.messages.filter((x) => x.kind === "gift").length,
    0
  );
  const dates = matches.filter((m) => m.date).length;
  const archetype = profile ? archetypeOf(profile.archetype) : null;

  return (
    <AppShell title="Me" subtitle="your cat self, your settings">
      <div className="space-y-6">
        {/* Profile */}
        {profile && archetype ? (
          <div className="overflow-hidden rounded-3xl border border-border bg-card fluffy-shadow-soft">
            <div
              className="flex items-center gap-4 p-5"
              style={{
                background: `linear-gradient(120deg, ${archetype.gradient[0]}33, ${archetype.gradient[1]}22)`,
              }}
            >
              <CatAvatar
                fur={profile.avatar.fur}
                pattern={profile.avatar.pattern}
                eyes={profile.avatar.eyes}
                accessory={profile.avatar.accessory}
                size={96}
                className="shrink-0 drop-shadow-lg"
              />
              <div className="min-w-0">
                <h2 className="font-heading text-2xl font-bold">
                  {profile.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile.breed} · {formatAge(profile.ageMonths)} ·{" "}
                  {profile.gender === "male" ? "♂" : "♀"}
                </p>
                <span className="mt-1.5 inline-block rounded-full bg-background/70 px-2.5 py-0.5 text-xs font-semibold">
                  {archetype.emoji} {archetype.name}
                </span>
              </div>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
              <PersonalityChips traits={profile.personality} />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-muted/60 p-2.5">
                  <p className="font-semibold text-muted-foreground">
                    🧶 Toys
                  </p>
                  <p className="mt-0.5">{profile.favoriteToys.join(", ")}</p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-2.5">
                  <p className="font-semibold text-muted-foreground">
                    🐟 Food
                  </p>
                  <p className="mt-0.5">{profile.favoriteFoods.join(", ")}</p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full rounded-full">
                <Link href="/onboarding">
                  <Pencil className="size-4" />
                  Edit my cat
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            emoji="🐱"
            title="You haven't made a cat yet"
            description="Create your cat persona to unlock compatibility scoring, the quiz, and more."
            action={
              <Button asChild className="rounded-full">
                <Link href="/onboarding">Create my cat</Link>
              </Button>
            }
          />
        )}

        {/* Stats */}
        <section>
          <h3 className="mb-2 px-1 font-heading text-lg font-semibold">
            Your cat stats
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            <InfoStat label="Swipes" value={swipes.length} emoji="👆" />
            <InfoStat label="Matches" value={matches.length} emoji="💞" />
            <InfoStat label="Messages" value={messages} emoji="💬" />
            <InfoStat label="Gifts sent" value={gifts} emoji="🎁" />
            <InfoStat label="Dates" value={dates} emoji="🌙" />
            <InfoStat label="Catnip left" value={catnipTokens} emoji="🌿" />
          </div>
        </section>

        {/* Achievements */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="font-heading text-lg font-semibold">
              Trophy case
            </h3>
            <span className="text-xs text-muted-foreground">
              {achievements.length}/{ACHIEVEMENTS.length} unlocked
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = achievements.includes(a.id);
              return (
                <div
                  key={a.id}
                  title={a.description}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition-all",
                    unlocked
                      ? "border-primary/40 bg-primary/8"
                      : "border-border bg-card opacity-55 grayscale"
                  )}
                >
                  <span className="text-2xl">{unlocked ? a.emoji : "🔒"}</span>
                  <span className="text-[0.65rem] font-semibold leading-tight">
                    {a.name}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Themes */}
        <section>
          <h3 className="mb-2 flex items-center gap-2 px-1 font-heading text-lg font-semibold">
            <Palette className="size-5 text-primary" />
            Theme
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {THEMES.map(([id, meta]) => (
              <button
                key={id}
                type="button"
                aria-pressed={theme === id}
                onClick={() => {
                  setTheme(id);
                  playPop();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                  theme === id
                    ? "border-primary bg-primary/8 fluffy-shadow-soft"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <span
                  className="size-8 shrink-0 rounded-full ring-2 ring-background"
                  style={{
                    background: `linear-gradient(135deg, ${meta.swatch}, ${meta.swatch}99)`,
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium leading-tight">
                    {meta.emoji} {meta.label}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground">
                    {meta.dark ? "Dark" : "Light"}
                  </span>
                </span>
                {theme === id && (
                  <Check className="size-4 shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Settings */}
        <section>
          <h3 className="mb-2 px-1 font-heading text-lg font-semibold">
            Settings
          </h3>
          <div className="space-y-1 rounded-3xl border border-border bg-card p-2">
            <div className="flex items-center justify-between gap-3 px-2 py-2.5">
              <Label className="flex items-center gap-2 text-sm">
                <Volume2 className="size-4 text-primary" />
                Purr sounds
              </Label>
              <Switch
                checked={soundEnabled}
                onCheckedChange={(v) => {
                  setSoundEnabled(v);
                  if (v) playPurr();
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3 px-2 py-2.5">
              <Label className="flex items-center gap-2 text-sm">
                <MessageCircle className="size-4 text-primary" />
                Meow voice (text-to-speech)
              </Label>
              <span className="text-xs text-muted-foreground">
                Tap 🔊 on a chat bubble
              </span>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="pb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full rounded-full"
              >
                <Trash2 className="size-4" />
                Reset all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Start over?</AlertDialogTitle>
                <AlertDialogDescription>
                  This wipes your cat, matches, chats, and achievements. All the
                  cats will forget you. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-full">
                  Keep my cats
                </AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-full"
                  onClick={() => {
                    resetAll();
                    toast("Everything reset 🧹", {
                      description: "A fresh start awaits.",
                    });
                  }}
                >
                  <RotateCcw className="size-4" />
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
      </div>
    </AppShell>
  );
}

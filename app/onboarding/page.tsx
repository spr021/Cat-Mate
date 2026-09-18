"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, PawPrint, Sparkles } from "lucide-react";
import { cn } from "cn";
import { AppShell } from "@/components/catmate/AppShell";
import { CatAvatar } from "@/components/catmate/CatAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCatMate } from "@/lib/store";
import { archetypeFromPersonality, archetypeOf } from "@/lib/archetypes";
import {
  ACCESSORY_OPTIONS,
  EYE_OPTIONS,
  FUR_OPTIONS,
  PATTERN_OPTIONS,
  defaultAvatar,
} from "@/lib/avatar";
import { QUIZ } from "@/lib/quiz";
import { PERSONALITIES, PERSONALITY_META } from "@/lib/types";
import type { AvatarConfig, Gender, Personality, UserCat } from "@/lib/types";
import { CATS } from "@/lib/mock/cats";
import { playPop, playPurr } from "@/lib/sound";

const BREEDS = Array.from(new Set(CATS.map((c) => c.breed))).sort();
const NEIGHBORHOODS = [
  "Whisker Heights",
  "Purrside Park",
  "Meowntown",
  "Tabby Terrace",
  "Cuddle Cove",
  "Catnip Commons",
  "Fuzzfield",
  "Nuzzle Nest",
];
const TOY_PRESETS = [
  "feather wand",
  "laser pointer",
  "yarn ball",
  "cardboard box",
  "crinkle ball",
  "stuffed mouse",
  "tunnel",
  "ribbon",
  "bottle cap",
  "puzzle feeder",
  "ball track",
  "cat wheel",
];
const FOOD_PRESETS = [
  "tuna",
  "salmon",
  "chicken",
  "turkey",
  "prawns",
  "warm milk",
  "cat grass",
  "freeze-dried chicken",
  "pâté",
  "kibble",
  "cheese",
  "butter",
];

const STEPS = ["Basics", "Look", "Purr-sonality", "Favorites"];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-primary bg-primary/15 text-primary fluffy-shadow-soft"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const existing = useCatMate((s) => s.profile);
  const setProfile = useCatMate((s) => s.setProfile);
  const setQuizDone = useCatMate((s) => s.setQuizDone);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [breed, setBreed] = useState(BREEDS[0] ?? "Domestic Shorthair");
  const [ageMonths, setAgeMonths] = useState(24);
  const [gender, setGender] = useState<Gender>("female");
  const [neighborhood, setNeighborhood] = useState(NEIGHBORHOODS[0]);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<AvatarConfig>(defaultAvatar());
  const [traits, setTraits] = useState<Personality[]>([]);
  const [toys, setToys] = useState<string[]>([]);
  const [foods, setFoods] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // Prefill the wizard when editing an existing cat.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || !existing) return;
    prefilled.current = true;
    setName(existing.name);
    setBreed(existing.breed);
    setAgeMonths(existing.ageMonths);
    setGender(existing.gender);
    setNeighborhood(existing.neighborhood);
    setBio(existing.bio);
    setAvatar(existing.avatar);
    setTraits(existing.personality);
    setToys(existing.favoriteToys);
    setFoods(existing.favoriteFoods);
  }, [existing]);

  const quizComplete = QUIZ.every((q) => answers[q.id] !== undefined);

  const archetype = useMemo(() => {
    if (quizComplete) {
      const quizTraits = QUIZ.flatMap((q) => {
        const idx = answers[q.id];
        return idx === undefined ? [] : q.options[idx].traits;
      });
      return archetypeFromPersonality([...traits, ...quizTraits]);
    }
    return archetypeFromPersonality(traits);
  }, [quizComplete, answers, traits]);

  const archetypeInfo = archetypeOf(archetype);

  const canNext =
    step === 0
      ? name.trim().length >= 2
      : step === 2
        ? traits.length >= 2
        : step === 3
          ? toys.length >= 1 && foods.length >= 1
          : true;

  const toggle = <T,>(list: T[], value: T, setter: (v: T[]) => void) => {
    setter(
      list.includes(value) ? list.filter((x) => x !== value) : [...list, value]
    );
    playPop();
  };

  const finish = () => {
    const profile: UserCat = {
      name: name.trim(),
      breed,
      ageMonths,
      gender,
      bio:
        bio.trim() ||
        `Hi, I'm ${name.trim()}! I'm a ${archetypeInfo.name.toLowerCase()} looking for my purr-fect match.`,
      personality: traits,
      favoriteToys: toys,
      favoriteFoods: foods,
      archetype,
      avatar,
      neighborhood,
    };
    setProfile(profile);
    setQuizDone(quizComplete);
    playPurr();
    toast.success(`Welcome to CatMate, ${profile.name}! 🐾`, {
      description: `You're a ${archetypeInfo.name} ${archetypeInfo.emoji}`,
    });
    router.push("/");
  };

  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;

  return (
    <AppShell hideNav contentClassName="pb-8">
      <div className="mx-auto flex max-w-lg flex-col gap-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            className="rounded-full"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {STEPS[step]}
              </span>
              <span>
                {step + 1} / {STEPS.length}
              </span>
            </div>
            <Progress value={((step + 1) / STEPS.length) * 100} />
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-4 animate-pop">
            <div className="rounded-3xl bg-gradient-to-br from-secondary to-accent p-5 text-center">
              <div className="mb-1 text-5xl animate-wiggle">🐱</div>
              <h1 className="font-heading text-2xl font-bold">
                Create your cat
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                This is you in the cat world. Make it adorable.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Your cat&apos;s name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Whiskers, Biscuit, Mochi…"
                className="h-11 rounded-xl"
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <Label>Breed</Label>
              <Select value={breed} onValueChange={setBreed}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BREEDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Age</Label>
                <span className="text-sm font-medium">
                  {years > 0 ? `${years}y ` : ""}
                  {months}m
                </span>
              </div>
              <Slider
                min={2}
                max={180}
                step={1}
                value={[ageMonths]}
                onValueChange={([v]) => setAgeMonths(v)}
              />
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex gap-2">
                {(["female", "male"] as Gender[]).map((g) => (
                  <Chip
                    key={g}
                    active={gender === g}
                    onClick={() => setGender(g)}
                  >
                    {g === "female" ? "♀ Girl cat" : "♂ Boy cat"}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Neighborhood</Label>
              <Select value={neighborhood} onValueChange={setNeighborhood}>
                <SelectTrigger className="h-11 w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NEIGHBORHOODS.map((n) => (
                    <SelectItem key={n} value={n}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5 animate-pop">
            <div className="flex flex-col items-center">
              <CatAvatar
                fur={avatar.fur}
                pattern={avatar.pattern}
                eyes={avatar.eyes}
                accessory={avatar.accessory}
                size={170}
                className="drop-shadow-xl"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Looking fabulous, {name.trim() || "friend"}.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Fur color</Label>
              <div className="flex flex-wrap gap-2">
                {FUR_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-label={f.label}
                    aria-pressed={avatar.fur === f.main}
                    onClick={() => {
                      setAvatar((a) => ({ ...a, fur: f.main }));
                      playPop();
                    }}
                    className={cn(
                      "size-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform",
                      avatar.fur === f.main
                        ? "ring-primary scale-110"
                        : "ring-transparent"
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${f.main}, ${f.dark})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pattern</Label>
              <div className="flex flex-wrap gap-2">
                {PATTERN_OPTIONS.map((p) => (
                  <Chip
                    key={p.id}
                    active={avatar.pattern === p.id}
                    onClick={() =>
                      setAvatar((a) => ({ ...a, pattern: p.id }))
                    }
                  >
                    {p.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Eye color</Label>
              <div className="flex flex-wrap gap-2">
                {EYE_OPTIONS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    aria-label={e.label}
                    aria-pressed={avatar.eyes === e.id}
                    onClick={() => {
                      setAvatar((a) => ({ ...a, eyes: e.id }));
                      playPop();
                    }}
                    className={cn(
                      "size-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform",
                      avatar.eyes === e.id
                        ? "ring-primary scale-110"
                        : "ring-transparent"
                    )}
                    style={{ background: e.color }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Accessory</Label>
              <div className="flex flex-wrap gap-2">
                {ACCESSORY_OPTIONS.map((a) => (
                  <Chip
                    key={a.id}
                    active={avatar.accessory === a.id}
                    onClick={() =>
                      setAvatar((prev) => ({ ...prev, accessory: a.id }))
                    }
                  >
                    <span className="mr-1" aria-hidden>
                      {a.emoji}
                    </span>
                    {a.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-pop">
            <div className="rounded-3xl bg-gradient-to-br from-secondary to-accent p-5">
              <h2 className="font-heading text-xl font-bold">
                Pick your purr-sonality
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose at least 2. These shape who you match with.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PERSONALITIES.map((p) => (
                  <Chip
                    key={p}
                    active={traits.includes(p)}
                    onClick={() => toggle(traits, p, setTraits)}
                  >
                    <span className="mr-1" aria-hidden>
                      {PERSONALITY_META[p].emoji}
                    </span>
                    {PERSONALITY_META[p].label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <h2 className="font-heading text-lg font-bold">
                  Reveal your archetype
                </h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Answer 5 quick questions. Your answers + traits decide your cat
                archetype.
              </p>

              <div className="mt-4 space-y-4">
                {QUIZ.map((q, qi) => (
                  <div key={q.id}>
                    <p className="mb-2 text-sm font-medium">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.options.map((opt, oi) => {
                        const active = answers[q.id] === oi;
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => {
                              setAnswers((a) => ({ ...a, [q.id]: oi }));
                              playPop();
                            }}
                            className={cn(
                              "flex items-center gap-2 rounded-2xl border p-2.5 text-left text-xs transition-all",
                              active
                                ? "border-primary bg-primary/12 text-primary"
                                : "border-border bg-background hover:bg-muted/60"
                            )}
                          >
                            <span className="text-lg" aria-hidden>
                              {opt.emoji}
                            </span>
                            <span className="font-medium">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex items-center gap-3 rounded-3xl p-4 text-white fluffy-shadow-soft"
              style={{
                background: `linear-gradient(120deg, ${archetypeInfo.gradient[0]}, ${archetypeInfo.gradient[1]})`,
              }}
            >
              <span className="text-4xl" aria-hidden>
                {archetypeInfo.emoji}
              </span>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/80">
                  {quizComplete ? "Your archetype" : "Current archetype"}
                </p>
                <p className="font-heading text-lg font-bold">
                  {archetypeInfo.name}
                </p>
                <p className="text-xs text-white/90">{archetypeInfo.blurb}</p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-pop">
            <div className="rounded-3xl bg-gradient-to-br from-secondary to-accent p-5 text-center">
              <CatAvatar
                fur={avatar.fur}
                pattern={avatar.pattern}
                eyes={avatar.eyes}
                accessory={avatar.accessory}
                size={110}
                className="mx-auto drop-shadow-lg"
              />
              <h2 className="mt-2 font-heading text-xl font-bold">
                {name.trim() || "Your cat"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {breed} · {years > 0 ? `${years}y ` : ""}
                {months}m · {neighborhood}
              </p>
              <span className="mt-2 inline-block rounded-full bg-background/70 px-3 py-1 text-xs font-semibold">
                {archetypeInfo.emoji} {archetypeInfo.name}
              </span>
            </div>

            <div className="space-y-2">
              <Label>🧶 Favorite toys (pick a few)</Label>
              <div className="flex flex-wrap gap-2">
                {TOY_PRESETS.map((t) => (
                  <Chip
                    key={t}
                    active={toys.includes(t)}
                    onClick={() => toggle(toys, t, setToys)}
                  >
                    {t}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>🐟 Favorite food (pick a few)</Label>
              <div className="flex flex-wrap gap-2">
                {FOOD_PRESETS.map((f) => (
                  <Chip
                    key={f}
                    active={foods.includes(f)}
                    onClick={() => toggle(foods, f, setFoods)}
                  >
                    {f}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Short bio (optional)</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the cats of your neighborhood who you are…"
                className="min-h-20 rounded-xl"
                maxLength={180}
              />
            </div>
          </div>
        )}

        <div className="sticky bottom-0 flex gap-2 bg-background/80 py-3 backdrop-blur">
          {step > 0 && (
            <Button
              variant="outline"
              className="h-11 flex-1 rounded-full"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              className="h-11 flex-1 rounded-full fluffy-shadow-soft"
              disabled={!canNext}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              className="h-11 flex-1 rounded-full fluffy-shadow-soft"
              disabled={!canNext}
              onClick={finish}
            >
              <PawPrint className="size-4" />
              Start matching
            </Button>
          )}
        </div>

        {!canNext && step === 0 && (
          <p className="text-center text-xs text-muted-foreground">
            Give your cat a name to continue.
          </p>
        )}
        {!canNext && step === 2 && (
          <p className="text-center text-xs text-muted-foreground">
            Pick at least 2 personality traits.
          </p>
        )}
        {!canNext && step === 3 && (
          <p className="text-center text-xs text-muted-foreground">
            Pick at least one toy and one food.
          </p>
        )}
      </div>
    </AppShell>
  );
}

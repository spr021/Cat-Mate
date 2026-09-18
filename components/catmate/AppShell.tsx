"use client";

import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "cn";
import { useCatMate } from "@/lib/store";
import { playPurr } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { BottomNav } from "./BottomNav";

export function SoundToggle({ className }: { className?: string }) {
  const soundEnabled = useCatMate((s) => s.soundEnabled);
  const setSoundEnabled = useCatMate((s) => s.setSoundEnabled);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
      className={cn("rounded-full", className)}
      onClick={() => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        if (next) playPurr();
      }}
    >
      {soundEnabled ? (
        <Volume2 className="size-5" />
      ) : (
        <VolumeX className="size-5" />
      )}
    </Button>
  );
}

export function AppShell({
  children,
  title,
  subtitle,
  right,
  hideNav = false,
  contentClassName,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  hideNav?: boolean;
  contentClassName?: string;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-2xl bg-primary/12 text-lg fluffy-shadow-soft">
              🐱
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-heading text-lg font-semibold tracking-tight">
                Cat<span className="text-gradient">Mate</span>
              </span>
              {subtitle && (
                <span className="text-[0.7rem] text-muted-foreground">
                  {subtitle}
                </span>
              )}
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {right}
            <SoundToggle />
          </div>
        </div>
        {title && (
          <div className="mx-auto w-full max-w-2xl px-4 pb-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>
        )}
      </header>

      <main
        className={cn(
          "mx-auto w-full max-w-2xl flex-1 px-4 py-4",
          !hideNav && "pb-28",
          contentClassName
        )}
      >
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </div>
  );
}

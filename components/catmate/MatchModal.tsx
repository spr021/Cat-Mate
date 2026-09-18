"use client";

import { motion, useReducedMotion } from "motion/react";
import { Heart, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Cat, Match } from "@/lib/types";
import { CatImage } from "./CatImage";
import { CompatibilityBadge, PersonalityChips } from "./Bits";

const PARTICLES = ["💖", "🐾", "🐟", "✨", "💕", "🎀", "🐱", "💞"];

export function MatchModal({
  open,
  match,
  cat,
  compatibility,
  onChat,
  onClose,
}: {
  open: boolean;
  match: Match | null;
  cat: Cat | null;
  compatibility: number;
  onChat: () => void;
  onClose: () => void;
}) {
  const reduceMotion = useReducedMotion();
  if (!cat || !match) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-sm overflow-hidden rounded-[2rem] border-none bg-gradient-to-b from-secondary to-background p-0 text-center fluffy-shadow"
      >
        <DialogTitle className="sr-only">
          It&apos;s a purr-fect match with {cat.name}
        </DialogTitle>

        <div className="relative px-6 pb-6 pt-8">
          {/* particle burst (skipped for reduced motion) */}
          {!reduceMotion && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {PARTICLES.concat(PARTICLES).map((emoji, i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-24 text-2xl"
                  initial={{ opacity: 0, y: 0, x: 0, scale: 0.4 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -120 - (i % 5) * 26],
                    x: (i % 2 === 0 ? 1 : -1) * (30 + (i % 6) * 22),
                    scale: [0.4, 1.1, 0.7],
                    rotate: (i % 2 === 0 ? 1 : -1) * 30,
                  }}
                  transition={{
                    duration: 1.6,
                    delay: (i % 8) * 0.08,
                    repeat: Infinity,
                    repeatDelay: 1.2,
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          )}

          <motion.h2
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="relative font-heading text-3xl font-bold text-gradient"
          >
            It&apos;s a purr-fect match!
          </motion.h2>
          <p className="relative mt-1 text-sm text-muted-foreground">
            You and {cat.name} liked each other
          </p>

          <div className="relative mt-6 flex items-center justify-center">
            <motion.div
              initial={{ x: -40, opacity: 0, rotate: -8 }}
              animate={{ x: 0, opacity: 1, rotate: -6 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
              className="size-28 overflow-hidden rounded-3xl ring-4 ring-background fluffy-shadow-soft"
            >
              <CatImage cat={cat} className="h-full w-full" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 400, damping: 14 }}
              className="-mx-4 z-10 grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg"
            >
              <Heart className="size-6 fill-current" />
            </motion.div>
            <motion.div
              initial={{ x: 40, opacity: 0, rotate: 8 }}
              animate={{ x: 0, opacity: 1, rotate: 6 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
              className="grid size-28 place-items-center rounded-3xl bg-gradient-to-br from-primary/30 to-catnip/30 text-5xl ring-4 ring-background fluffy-shadow-soft"
            >
              🐱
            </motion.div>
          </div>

          <div className="relative mt-5 flex flex-col items-center gap-3">
            <CompatibilityBadge value={compatibility} />
            <PersonalityChips traits={cat.personality} size="sm" />
          </div>

          <div className="relative mt-6 flex flex-col gap-2">
            <Button
              onClick={onChat}
              className="h-11 rounded-full text-base fluffy-shadow-soft"
            >
              <MessageCircle className="size-5" />
              Send a Meow
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-10 rounded-full text-muted-foreground"
            >
              Keep swiping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

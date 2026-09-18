"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import type { Cat, SwipeAction } from "@/lib/types";
import { CatCard } from "./CatCard";

export interface SwipeDeckHandle {
  swipe: (action: SwipeAction) => void;
}

const THRESHOLD = 110;
const UP_THRESHOLD = 130;

const SwipeCard = forwardRef<
  SwipeDeckHandle,
  {
    cat: Cat;
    compatibility: number;
    onDecided: (cat: Cat, action: SwipeAction) => void;
    onDetails?: () => void;
    disabled?: boolean;
    canCatnip?: boolean;
    onCatnipEmpty?: () => void;
  }
>(function SwipeCard(
  {
    cat,
    compatibility,
    onDecided,
    onDetails,
    disabled,
    canCatnip = true,
    onCatnipEmpty,
  },
  ref
) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-320, 0, 320], [-16, 0, 16]);
  const likeOpacity = useTransform(x, [40, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -40], [1, 0]);
  const catnipOpacity = useTransform(y, [-150, -50], [1, 0]);
  const [busy, setBusy] = useState(false);

  const decide = useCallback(
    (action: SwipeAction) => {
      if (busy || disabled) return;
      if (action === "catnip" && !canCatnip) {
        onCatnipEmpty?.();
        return;
      }
      setBusy(true);
      const target =
        action === "like"
          ? { x: 620, y: -40 }
          : action === "pass"
            ? { x: -620, y: -40 }
            : { x: 0, y: -760 };
      animate(x, target.x, { duration: 0.32, ease: "easeOut" });
      animate(y, target.y, {
        duration: 0.32,
        ease: "easeOut",
        onComplete: () => onDecided(cat, action),
      });
    },
    [busy, disabled, canCatnip, onCatnipEmpty, x, y, onDecided, cat]
  );

  useImperativeHandle(ref, () => ({ swipe: decide }), [decide]);

  return (
    <motion.div
      className="absolute inset-0 touch-none"
      style={{ x, y, rotate }}
      drag={!disabled}
      dragSnapToOrigin
      dragElastic={0.7}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (info.offset.y < -UP_THRESHOLD && Math.abs(info.offset.x) < 90) {
          decide("catnip");
        } else if (info.offset.x > THRESHOLD) {
          decide("like");
        } else if (info.offset.x < -THRESHOLD) {
          decide("pass");
        }
      }}
    >
      <CatCard cat={cat} compatibility={compatibility} onDetails={onDetails} />

      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-6 top-8 -rotate-12 rounded-2xl border-4 border-emerald-500/80 px-4 py-1.5 font-heading text-3xl font-bold tracking-wider text-emerald-500/90"
      >
        MEOW!
      </motion.div>
      <motion.div
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-6 top-8 rotate-12 rounded-2xl border-4 border-nope/80 px-4 py-1.5 font-heading text-3xl font-bold tracking-wider text-nope"
      >
        HISS
      </motion.div>
      <motion.div
        style={{ opacity: catnipOpacity }}
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto w-fit rounded-2xl border-4 border-catnip/80 bg-background/70 px-4 py-1.5 font-heading text-2xl font-bold tracking-wider text-catnip backdrop-blur"
      >
        🌿 CATNIP
      </motion.div>
    </motion.div>
  );
});

export const SwipeDeck = forwardRef<
  SwipeDeckHandle,
  {
    cats: Cat[];
    compatibilityFor: (cat: Cat) => number;
    onSwipe: (cat: Cat, action: SwipeAction) => void;
    onDetails?: (cat: Cat) => void;
    disabled?: boolean;
    canCatnip?: boolean;
    onCatnipEmpty?: () => void;
  }
>(function SwipeDeck(
  {
    cats,
    compatibilityFor,
    onSwipe,
    onDetails,
    disabled,
    canCatnip = true,
    onCatnipEmpty,
  },
  ref
) {
  const cardRef = useRef<SwipeDeckHandle | null>(null);
  const top = cats[0];
  const preview = cats.slice(1, 3);

  useEffect(() => {
    if (!top) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      // Don't hijack arrows from sliders or while a dialog/sheet is open.
      if (target?.closest('[role="slider"]')) return;
      if (
        document.querySelector(
          '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [data-slot="sheet-content"][data-state="open"]'
        )
      )
        return;
      if (e.key === "ArrowRight") cardRef.current?.swipe("like");
      else if (e.key === "ArrowLeft") cardRef.current?.swipe("pass");
      else if (e.key === "ArrowUp") cardRef.current?.swipe("catnip");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [top]);

  useImperativeHandle(ref, () => ({
    swipe: (action: SwipeAction) => cardRef.current?.swipe(action),
  }));

  if (!top) return null;

  return (
    <div className="absolute inset-0">
      {preview.map((cat, i) => (
        <motion.div
          key={cat.id}
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{
            scale: 1 - (i + 1) * 0.045,
            y: (i + 1) * -16,
            opacity: 1 - (i + 1) * 0.25,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          style={{ zIndex: 10 - i }}
        >
          <CatCard cat={cat} compatibility={compatibilityFor(cat)} />
        </motion.div>
      ))}

      <div className="absolute inset-0" style={{ zIndex: 20 }}>
        <SwipeCard
          key={top.id}
          ref={cardRef}
          cat={top}
          compatibility={compatibilityFor(top)}
          disabled={disabled}
          canCatnip={canCatnip}
          onCatnipEmpty={onCatnipEmpty}
          onDecided={onSwipe}
          onDetails={onDetails ? () => onDetails(top) : undefined}
        />
      </div>
    </div>
  );
});

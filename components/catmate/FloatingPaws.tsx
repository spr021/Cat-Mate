"use client";

import { cn } from "cn";

const PAWS = [
  { top: "6%", left: "8%", size: 34, delay: "0s", rotate: "-12deg" },
  { top: "18%", left: "82%", size: 26, delay: "0.8s", rotate: "14deg" },
  { top: "44%", left: "4%", size: 22, delay: "1.6s", rotate: "8deg" },
  { top: "62%", left: "88%", size: 30, delay: "0.4s", rotate: "-16deg" },
  { top: "80%", left: "14%", size: 24, delay: "1.2s", rotate: "10deg" },
  { top: "88%", left: "72%", size: 20, delay: "2s", rotate: "-6deg" },
];

export function FloatingPaws({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden paw-bg",
        className
      )}
    >
      {PAWS.map((p, i) => (
        <span
          key={i}
          className="absolute animate-float text-primary/25"
          style={{
            top: p.top,
            left: p.left,
            fontSize: p.size,
            animationDelay: p.delay,
            transform: `rotate(${p.rotate})`,
          }}
        >
          🐾
        </span>
      ))}
    </div>
  );
}

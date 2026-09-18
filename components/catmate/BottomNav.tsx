"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import {
  Compass,
  Heart,
  PawPrint,
  Trophy,
  Cat,
} from "lucide-react";
import { useCatMate } from "@/lib/store";

const ITEMS = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/paw-prints", label: "Paw Prints", icon: PawPrint },
  { href: "/leaderboard", label: "Top Cats", icon: Trophy },
  { href: "/me", label: "Me", icon: Cat },
];

export function BottomNav() {
  const pathname = usePathname();
  const matches = useCatMate((s) => s.matches);
  const unread = matches.reduce((n, m) => n + m.unread, 0);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-stretch justify-between px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1.5">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[0.65rem] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "relative grid size-9 place-items-center rounded-full transition-all",
                  active && "bg-primary/12 fluffy-shadow-soft"
                )}
              >
                <Icon className={cn("size-5", active && "animate-pop")} />
                {item.href === "/matches" && unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-bold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

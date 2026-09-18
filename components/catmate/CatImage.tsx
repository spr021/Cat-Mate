"use client";

import { useState } from "react";
import { cn } from "cn";
import type { Cat } from "@/lib/types";
import { avatarFromCat } from "@/lib/avatar";
import { CatAvatar } from "./CatAvatar";

export function CatImage({
  cat,
  className,
  priority = false,
}: {
  cat: Cat;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const avatar = avatarFromCat(cat);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-secondary to-accent",
          className
        )}
      >
        <CatAvatar
          fur={avatar.fur}
          pattern={avatar.pattern}
          eyes={avatar.eyes}
          accessory={avatar.accessory}
          size={200}
          className="h-[70%] w-[70%] drop-shadow-lg"
        />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cat.image}
      alt={`${cat.name}, a ${cat.breed}`}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

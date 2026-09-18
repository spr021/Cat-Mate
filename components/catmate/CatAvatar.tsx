"use client";

import { cn } from "cn";
import type { AvatarConfig } from "@/lib/types";
import { eyeById, furById } from "@/lib/avatar";

function shade(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const num = parseInt(clean, 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (num & 255) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function resolveFur(fur: string) {
  if (fur.startsWith("#")) {
    return { main: fur, dark: shade(fur, -55) };
  }
  const option = furById(fur);
  return { main: option.main, dark: option.dark };
}

export interface CatAvatarProps {
  fur: string;
  pattern?: AvatarConfig["pattern"];
  eyes?: string;
  accessory?: AvatarConfig["accessory"];
  size?: number;
  className?: string;
  animate?: boolean;
}

export function CatAvatar({
  fur,
  pattern = "solid",
  eyes = "green",
  accessory = "none",
  size = 64,
  className,
  animate = false,
}: CatAvatarProps) {
  const { main, dark } = resolveFur(fur);
  const eye = eyeById(eyes).color;
  const uid = `${pattern}-${main.replace("#", "")}-${accessory}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={cn(animate && "animate-float", className)}
      role="img"
      aria-label="Cat avatar"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shade(main, 70)} />
          <stop offset="100%" stopColor={shade(main, -10)} />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="98" fill={`url(#bg-${uid})`} />

      {/* Ears */}
      <path d="M48 72 L58 26 L96 62 Z" fill={main} stroke={dark} strokeWidth="3" />
      <path d="M152 72 L142 26 L104 62 Z" fill={main} stroke={dark} strokeWidth="3" />
      <path d="M60 66 L66 40 L88 62 Z" fill="#ffb3c9" />
      <path d="M140 66 L134 40 L112 62 Z" fill="#ffb3c9" />

      {/* Head */}
      <ellipse cx="100" cy="112" rx="66" ry="58" fill={main} stroke={dark} strokeWidth="3" />

      {/* Pattern overlays */}
      {pattern === "tabby" && (
        <g stroke={dark} strokeWidth="6" strokeLinecap="round" opacity="0.6">
          <path d="M74 66 L80 84" />
          <path d="M92 60 L94 80" />
          <path d="M110 60 L108 80" />
          <path d="M126 66 L120 84" />
        </g>
      )}
      {pattern === "tuxedo" && (
        <path
          d="M100 118 C 70 128, 68 158, 100 166 C 132 158, 130 128, 100 118 Z"
          fill="#fbf7f2"
        />
      )}
      {pattern === "calico" && (
        <g opacity="0.85">
          <ellipse cx="66" cy="98" rx="18" ry="16" fill="#f0a95c" />
          <ellipse cx="138" cy="128" rx="16" ry="14" fill="#5b5560" />
        </g>
      )}
      {pattern === "spot" && (
        <g fill={dark} opacity="0.5">
          <circle cx="70" cy="140" r="9" />
          <circle cx="132" cy="96" r="7" />
          <circle cx="120" cy="150" r="6" />
        </g>
      )}

      {/* Cheeks */}
      <ellipse cx="66" cy="132" rx="14" ry="9" fill="#ff9ec7" opacity="0.45" />
      <ellipse cx="134" cy="132" rx="14" ry="9" fill="#ff9ec7" opacity="0.45" />

      {/* Eyes */}
      <g>
        <ellipse cx="78" cy="108" rx="13" ry="15" fill="#fff" />
        <ellipse cx="122" cy="108" rx="13" ry="15" fill="#fff" />
        <ellipse cx="78" cy="109" rx="9" ry="11" fill={eye} />
        <ellipse cx="122" cy="109" rx="9" ry="11" fill={eye} />
        <ellipse cx="78" cy="109" rx="3.6" ry="8.5" fill="#231a20" />
        <ellipse cx="122" cy="109" rx="3.6" ry="8.5" fill="#231a20" />
        <circle cx="74" cy="103" r="3" fill="#fff" />
        <circle cx="118" cy="103" r="3" fill="#fff" />
      </g>

      {/* Nose + mouth */}
      <path d="M100 126 L94 132 L106 132 Z" fill="#ff7aa8" />
      <path
        d="M100 132 C 100 142, 88 142, 84 136"
        fill="none"
        stroke={dark}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M100 132 C 100 142, 112 142, 116 136"
        fill="none"
        stroke={dark}
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Whiskers */}
      <g stroke={dark} strokeWidth="2.5" strokeLinecap="round" opacity="0.75">
        <path d="M40 118 L18 112" />
        <path d="M40 128 L16 128" />
        <path d="M160 118 L182 112" />
        <path d="M160 128 L184 128" />
      </g>

      {/* Accessories */}
      {accessory === "bowtie" && (
        <g transform="translate(100 170)">
          <path d="M-16 -8 L-2 0 L-16 8 Z" fill="#ff5c9d" />
          <path d="M16 -8 L2 0 L16 8 Z" fill="#ff5c9d" />
          <circle cx="0" cy="0" r="4" fill="#e63976" />
        </g>
      )}
      {accessory === "bandana" && (
        <path
          d="M62 150 C 80 168, 120 168, 138 150 L120 182 L80 182 Z"
          fill="#a06bff"
        />
      )}
      {accessory === "crown" && (
        <path
          d="M68 46 L78 24 L90 42 L100 18 L110 42 L122 24 L132 46 Z"
          fill="#ffd24d"
          stroke="#e0a800"
          strokeWidth="2"
        />
      )}
      {accessory === "flower" && (
        <g transform="translate(146 70)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-11"
              rx="6"
              ry="11"
              fill="#ff8fbe"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="5" fill="#ffd24d" />
        </g>
      )}
      {accessory === "glasses" && (
        <g stroke="#3a2f36" strokeWidth="4" fill="none">
          <circle cx="78" cy="108" r="20" />
          <circle cx="122" cy="108" r="20" />
          <path d="M98 108 L102 108" />
        </g>
      )}
    </svg>
  );
}

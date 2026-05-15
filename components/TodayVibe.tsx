"use client";

import type { TodayVibe } from "@/lib/today-vibe";

type TodayVibeProps = {
  vibe: TodayVibe;
};

export default function TodayVibeCard({ vibe }: TodayVibeProps) {
  return (
    <div
      className="card card-interactive animate-fade-in flex items-center gap-4 p-4 sm:p-5"
      style={{
        borderColor: `${vibe.accent}55`,
        background: `linear-gradient(90deg, ${vibe.accent}20, transparent 80%)`,
        boxShadow: `0 8px 24px ${vibe.accent}22`,
      }}
    >
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
        style={{
          background: `${vibe.accent}18`,
        }}
      >
        {vibe.emoji}
      </span>

      <div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">
          Сегодняшний вайб
        </p>

        <p className="mt-0.5 text-lg font-extrabold text-[var(--foreground)]">
          {vibe.title}
        </p>

        <p className="mt-0.5 text-sm font-medium text-[var(--muted)]">
          {vibe.subtitle}
        </p>
      </div>
    </div>
  );
}
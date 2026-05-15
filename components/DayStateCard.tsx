"use client";

import type { DayState } from "@/lib/dopamine-analytics";

type DayStateCardProps = {
  state: DayState;
};

export default function DayStateCard({ state }: DayStateCardProps) {
  return (
    <div
      className="card card-interactive animate-fade-in stagger-1 p-4 sm:p-5"
      style={{
        borderColor: `${state.color}88`,
        background: `linear-gradient(90deg, ${state.color}25, transparent 80%)`,
        boxShadow: `0 8px 24px ${state.color}33`,
      }}
    >
      <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">
        Состояние дня
      </p>

      <p
        className="mt-2 text-xl font-extrabold text-[var(--foreground)]"
      >
        {state.title}
      </p>

      <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
        {state.description}
      </p>
    </div>
  );
}
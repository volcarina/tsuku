"use client";

import type { DayState } from "@/lib/dopamine-analytics";

type DayStateCardProps = {
  state: DayState;
};

export default function DayStateCard({ state }: DayStateCardProps) {
  return (
    <div
      className="card card-interactive animate-fade-in p-5"
      style={{
        borderColor: `${state.color}55`,
        background: `linear-gradient(145deg, ${state.soft}, var(--card))`,
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Состояние дня
      </p>
      <p
        className="mt-2 text-xl font-bold"
        style={{ color: state.color }}
      >
        {state.title}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">{state.description}</p>
    </div>
  );
}

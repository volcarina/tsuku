"use client";

import type { OverloadMoment } from "@/lib/dopamine-analytics";

type OverloadMomentsProps = {
  moments: OverloadMoment[];
  formatAmount: (amountRub: number) => string;
};

export default function OverloadMoments({
  moments,
  formatAmount,
}: OverloadMomentsProps) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Момент перегруза
      </p>

      {moments.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Сегодня без плотных серий трат - спокойный ритм.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {moments.map((moment) => (
            <li
              key={`${moment.timeRange}-${moment.label}`}
              className="rounded-xl border px-4 py-3 transition duration-200 hover:scale-[1.01]"
              style={{
                borderColor: `${moment.accent}66`,
                background: `linear-gradient(90deg, ${moment.accent}22, transparent)`,
                boxShadow: `0 0 20px ${moment.accent}22`,
              }}
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {moment.timeRange} - {moment.label}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {moment.count} трат · {formatAmount(moment.total)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

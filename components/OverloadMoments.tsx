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
    <div className="card animate-fade-in stagger-3 p-4 sm:p-5">
      <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">
        Момент перегруза
      </p>

      {moments.length === 0 ? (
        <p className="mt-4 text-sm font-medium text-[var(--muted)]">
          Сегодня без плотных серий трат — спокойный ритм ✓
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {moments.map((moment, i) => (
            <li
              key={`${moment.timeRange}-${moment.label}`}
              className="animate-slide-in rounded-xl border-2 px-4 py-3 transition duration-200 hover:scale-[1.04]"
              style={{
                borderColor: `${moment.accent}88`,
                background: `linear-gradient(90deg, ${moment.accent}35, transparent 80%)`,
                boxShadow: `0 8px 24px ${moment.accent}44`,
                animationDelay: `${i * 0.08}s`,
              }}
            >
              <p className="text-sm font-extrabold text-[var(--foreground)]">
                {moment.timeRange} — {moment.label}
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                {moment.count} трат · {formatAmount(moment.total)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

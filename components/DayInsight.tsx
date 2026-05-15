"use client";

type DayInsightProps = {
  insight: string;
};

export default function DayInsight({ insight }: DayInsightProps) {
  return (
    <div
      className="card animate-fade-in p-5 sm:p-6"
      style={{
        borderColor: "rgba(185,167,255,0.5)",
        background: "linear-gradient(90deg, rgba(185,167,255,0.18), transparent 80%)",
        boxShadow: "0 8px 24px rgba(185,167,255,0.25)",
      }}
    >
      <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">
        Инсайт дня
      </p>

      <p className="mt-3 text-lg font-extrabold leading-snug text-[var(--foreground)]">
        {insight}
      </p>
    </div>
  );
}
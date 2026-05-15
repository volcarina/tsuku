"use client";

type DayInsightProps = {
  insight: string;
};

export default function DayInsight({ insight }: DayInsightProps) {
  return (
    <div
      className="card animate-fade-in p-6"
      style={{
        background:
          "linear-gradient(135deg, #F0EBFF 0%, #E8FAF3 50%, var(--card) 100%)",
        borderColor: "#B9A7FF55",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8B7AB8]">
        Инсайт дня
      </p>
      <p className="mt-3 text-lg font-semibold leading-snug text-[var(--foreground)]">
        {insight}
      </p>
    </div>
  );
}

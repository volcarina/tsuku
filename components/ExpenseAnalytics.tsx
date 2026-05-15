"use client";

import type { ExpenseAnalytics } from "@/lib/analytics";
import type { DisplayCurrency } from "@/lib/currency";
import { computeTagStats } from "@/lib/dopamine-analytics";
import { EMOTIONAL_TAGS, getTagMeta, type EmotionalTagId } from "@/lib/emotional-tags";
import { formatMonthLabel } from "@/lib/dates";

type ExpenseAnalyticsProps = {
  analytics: ExpenseAnalytics;
  monthKey: string;
  budget: number | null;
  onBudgetChange: (value: number | null) => void;
  formatAmount: (amountRub: number) => string;
  currency: DisplayCurrency;
  usdRate: number;
  tags: Record<number, EmotionalTagId>;
  monthExpenses: import("@/lib/schema").Expense[];
};

export default function ExpenseAnalytics({
  analytics,
  monthKey,
  budget,
  onBudgetChange,
  formatAmount,
  currency,
  usdRate,
  tags,
  monthExpenses,
}: ExpenseAnalyticsProps) {
  const remaining =
    budget !== null ? budget - analytics.spentThisMonth : null;

  const tagStats = computeTagStats(monthExpenses, tags);

  const topTagEntry = [...tagStats.entries()].sort(
    (a, b) => b[1].total - a[1].total,
  )[0];

  return (
    <section className="card p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Аналитика месяца
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {formatMonthLabel(monthKey)} · с учётом эмоциональных тегов
          </p>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Курс: 1 USD = {usdRate.toFixed(2)} ₽
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Топ категория"
          accent="#B9A7FF"
          value={
            analytics.topCategory === "—"
              ? "—"
              : `${analytics.topCategory} · ${formatAmount(analytics.topCategoryAmount)}`
          }
        />
        <StatCard
          label="Средний чек"
          accent="#7ED6B5"
          value={
            analytics.expenseCount === 0
              ? "—"
              : formatAmount(analytics.averageCheck)
          }
        />
        <StatCard
          label="Потрачено за месяц"
          accent="#FF6FAE"
          value={formatAmount(analytics.spentThisMonth)}
          highlight
        />
        <StatCard
          label="Топ эмо-тег"
          accent={topTagEntry ? getTagMeta(topTagEntry[0]).color : "#B9A7FF"}
          value={
            topTagEntry
              ? `${getTagMeta(topTagEntry[0]).label} · ${formatAmount(topTagEntry[1].total)}`
              : "—"
          }
        />
        <StatCard
          label="Самый крупный расход"
          accent="#F6B38A"
          value={
            analytics.largestExpense
              ? `${analytics.largestExpense.title} · ${formatAmount(analytics.largestExpense.amount)}`
              : "—"
          }
        />
        <StatCard
          label="Осталось бюджета"
          accent="#7ED6B5"
          value={
            remaining === null ? "—" : formatAmount(Math.max(remaining, 0))
          }
          sub={
            remaining !== null && remaining < 0
              ? `Превышение: ${formatAmount(Math.abs(remaining))}`
              : undefined
          }
        />
        <div
          className="rounded-2xl border p-4 sm:col-span-2 lg:col-span-3"
          style={{
            borderColor: "#B9A7FF55",
            background: "linear-gradient(135deg, #F0EBFF44, var(--card))",
          }}
        >
          <label
            htmlFor="budget"
            className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            Бюджет на месяц ({currency})
          </label>
          <input
            id="budget"
            type="number"
            min="0"
            step="100"
            value={budget ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onBudgetChange(raw === "" ? null : Number(raw));
            }}
            placeholder="Например, 50000"
            className="input mt-2 max-w-xs"
          />
        </div>
      </div>

      {tagStats.size > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Распределение по тегам
          </p>
          <div className="flex flex-wrap gap-2">
            {EMOTIONAL_TAGS.map((tag) => {
              const stat = tagStats.get(tag.id);
              if (!stat) return null;
              return (
                <span
                  key={tag.id}
                  className="chip"
                  style={{
                    backgroundColor: tag.soft,
                    color: "#4a4560",
                    border: `1px solid ${tag.color}55`,
                  }}
                >
                  {tag.label}: {stat.count} · {formatAmount(stat.total)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4 transition duration-200 hover:scale-[1.02]"
      style={{
        borderColor: `${accent}55`,
        background: highlight
          ? `linear-gradient(145deg, ${accent}22, var(--card))`
          : "var(--card)",
      }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-snug text-[var(--foreground)]">
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-xs font-semibold" style={{ color: "#FF6FAE" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

"use client";

import {
  type BudgetStatus,
  budgetProgressPercent,
} from "@/lib/dopamine-analytics";

type BudgetProgressProps = {
  spent: number;
  budget: number | null;
  status: BudgetStatus;
  formatAmount: (amountRub: number) => string;
};

const STATUS_LABELS: Record<Exclude<BudgetStatus, "NONE">, string> = {
  OK: "ОК",
  WARNING: "WARNING",
  OVERBUDGET: "OVERBUDGET",
};

const STATUS_COLORS: Record<Exclude<BudgetStatus, "NONE">, string> = {
  OK: "#7ED6B5",
  WARNING: "#FFE58A",
  OVERBUDGET: "#FF6FAE",
};

export default function BudgetProgress({
  spent,
  budget,
  status,
  formatAmount,
}: BudgetProgressProps) {
  const percent = budgetProgressPercent(spent, budget);
  const remaining = budget !== null ? budget - spent : null;

  const barClass =
    status === "OVERBUDGET"
      ? "budget-gradient-over"
      : status === "WARNING"
        ? "budget-gradient-warning"
        : "budget-gradient-ok";

  return (
    <div className="card p-5 transition duration-200"
      style={{
        borderColor:
          status !== "NONE" ? `${STATUS_COLORS[status]}66` : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          Бюджет месяца
        </p>
        {status !== "NONE" && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-bold"
            style={{
              backgroundColor: `${STATUS_COLORS[status]}33`,
              color: STATUS_COLORS[status],
            }}
          >
            {STATUS_LABELS[status]}
          </span>
        )}
      </div>

      {budget === null ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          Задайте бюджет в аналитике ниже
        </p>
      ) : (
        <>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--background)]">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${barClass}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-[var(--muted)]">
              Потрачено: {formatAmount(spent)}
            </span>
            <span className="font-semibold text-[var(--foreground)]">
              {remaining !== null && remaining >= 0
                ? `Осталось ${formatAmount(remaining)}`
                : remaining !== null
                  ? `−${formatAmount(Math.abs(remaining))}`
                  : "—"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

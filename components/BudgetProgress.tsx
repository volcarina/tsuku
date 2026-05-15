"use client";

import AnimatedNumber from "@/components/AnimatedNumber";
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
  OK: "OK",
  WARNING: "WARNING",
  OVERBUDGET: "OVERLIMIT",
};

const STATUS_COLORS: Record<Exclude<BudgetStatus, "NONE">, string> = {
  OK: "#4FD4A4",
  WARNING: "#FFD24D",
  OVERBUDGET: "#FF4D9A",
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

  const glowClass =
    status === "OVERBUDGET"
      ? "budget-bar-glow-over"
      : status === "WARNING"
        ? "budget-bar-glow-warning"
        : "";

  return (
    <div className="card card-interactive animate-fade-in stagger-2 p-4 transition-all duration-300 sm:p-5"
      style={{
        borderColor:
          status !== "NONE" ? `${STATUS_COLORS[status]}88` : undefined,
        boxShadow:
          status !== "NONE"
            ? `0 12px 36px ${STATUS_COLORS[status]}44, inset 0 1px 0 rgb(255 255 255 / 0.5)`
            : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--muted)]">
          Бюджет месяца
        </p>
        {status !== "NONE" && (
          <span
            className="rounded-full px-3 py-1 text-xs font-extrabold tracking-wide"
            style={{
              backgroundColor: `${STATUS_COLORS[status]}33`,
              color: STATUS_COLORS[status],
              boxShadow: `0 0 16px ${STATUS_COLORS[status]}55`,
            }}
          >
            {STATUS_LABELS[status]}
          </span>
        )}
      </div>

      {budget === null ? (
        <p className="mt-3 text-sm font-medium text-[var(--muted)]">
          Задайте бюджет в аналитике ниже
        </p>
      ) : (
        <>
          <div className="budget-track mt-4 h-4 overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${barClass} ${glowClass}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between gap-2 text-sm">
            <span className="font-medium text-[var(--muted)]">
              Потрачено:{" "}
              <AnimatedNumber
                value={spent}
                format={formatAmount}
                className="font-extrabold text-[var(--foreground)]"
              />
            </span>
            <span className="font-extrabold text-[var(--foreground)]">
              {remaining !== null && remaining >= 0 ? (
                <>
                  Осталось{" "}
                  <AnimatedNumber value={remaining} format={formatAmount} />
                </>
              ) : remaining !== null ? (
                <>−{formatAmount(Math.abs(remaining))}</>
              ) : (
                "—"
              )}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

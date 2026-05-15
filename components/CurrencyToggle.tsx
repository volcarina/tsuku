"use client";

import type { DisplayCurrency } from "@/lib/currency";

type CurrencyToggleProps = {
  currency: DisplayCurrency;
  usdRate: number;
  onCurrencyChange: (currency: DisplayCurrency) => void;
};

export default function CurrencyToggle({
  currency,
  usdRate,
  onCurrencyChange,
}: CurrencyToggleProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onCurrencyChange("RUB")}
        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition duration-200 hover:scale-105 ${
          currency === "RUB"
            ? "text-white shadow-md"
            : "text-[var(--muted)]"
        }`}
        style={
          currency === "RUB"
            ? { background: "linear-gradient(135deg, #FF6FAE, #ff9ec4)" }
            : undefined
        }
      >
        ₽ RUB
      </button>
      <button
        type="button"
        onClick={() => onCurrencyChange("USD")}
        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition duration-200 hover:scale-105 ${
          currency === "USD"
            ? "text-white shadow-md"
            : "text-[var(--muted)]"
        }`}
        style={
          currency === "USD"
            ? { background: "linear-gradient(135deg, #6C7CFF, #8b9aff)" }
            : undefined
        }
      >
        $ USD
      </button>
      <span className="hidden px-2 text-xs text-[var(--muted)] sm:inline">
        1$ = {usdRate.toFixed(2)} ₽
      </span>
    </div>
  );
}

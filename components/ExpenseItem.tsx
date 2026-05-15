"use client";

import EmotionalTagPicker from "@/components/EmotionalTagPicker";
import {
  getTagMeta,
  type EmotionalTagId,
} from "@/lib/emotional-tags";
import type { Expense } from "@/lib/schema";

type ExpenseItemProps = {
  expense: Expense;
  tag: EmotionalTagId;
  onTagChange: (id: number, tag: EmotionalTagId) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  formatAmount: (amountRub: number) => string;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function ExpenseItem({
  expense,
  tag,
  onTagChange,
  onDelete,
  isDeleting = false,
  formatAmount,
}: ExpenseItemProps) {
  const meta = getTagMeta(tag);

  return (
    <li
      className="rounded-2xl border px-4 py-3 shadow-sm transition duration-200 hover:scale-[1.01]"
      style={{
        borderColor: `${meta.color}88`,
        background: `linear-gradient(135deg, ${meta.soft}, var(--card))`,
        boxShadow: `0 8px 24px ${meta.color}22`,
      }}
    >
      <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--foreground)]">
            {expense.title}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">
            {formatDate(expense.createdAt)} · {expense.category}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ backgroundColor: meta.color, color: "#fff" }}
        >
          {meta.label}
        </span>
        <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--foreground)]">
          {formatAmount(expense.amount)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(expense.id)}
          disabled={isDeleting}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition duration-150 hover:bg-[#FDE8F0] disabled:opacity-50"
          style={{ color: "#FF6FAE" }}
          aria-label={`Удалить «${expense.title}»`}
        >
          {isDeleting ? "…" : "Удалить"}
        </button>
      </div>
      <div className="mt-3 border-t border-[var(--card-border)] pt-3">
        <EmotionalTagPicker
          compact
          value={tag}
          onChange={(next) => onTagChange(expense.id, next)}
        />
      </div>
    </li>
  );
}

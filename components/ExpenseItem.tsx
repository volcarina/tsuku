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
      className={`rounded-2xl border-2 px-4 py-3 transition-all duration-250 ${
        isDeleting ? "animate-shrink-fade" : ""
      }`}
      style={{
        borderColor: `${meta.color}99`,
        background: `linear-gradient(135deg, ${meta.soft} 0%, var(--card) 70%)`,
        boxShadow: isDeleting
          ? undefined
          : `0 8px 28px ${meta.color}40, inset 0 1px 0 rgb(255 255 255 / 0.5)`,
      }}
    >
      <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold text-[var(--foreground)]">
            {expense.title}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">
            {formatDate(expense.createdAt)} · {expense.category}
          </p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold shadow-md"
          style={{
            backgroundColor: meta.color,
            color: "#fff",
            boxShadow: `0 4px 12px ${meta.color}66`,
          }}
        >
          {meta.label}
        </span>
        <span className="shrink-0 text-base font-extrabold tabular-nums">
          {formatAmount(expense.amount)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(expense.id)}
          disabled={isDeleting}
          className="ripple shrink-0 rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition duration-200 hover:scale-105 disabled:opacity-50"
          style={{
            color: "#FF4D9A",
            borderColor: "#FF4D9A55",
            background: "#FFE0EC",
          }}
          aria-label={`Удалить «${expense.title}»`}
        >
          {isDeleting ? "…" : "✕"}
        </button>
      </div>
      <div className="mt-3 border-t-2 border-[var(--card-border)] pt-3">
        <EmotionalTagPicker
          compact
          value={tag}
          onChange={(next) => onTagChange(expense.id, next)}
        />
      </div>
    </li>
  );
}

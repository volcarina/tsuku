"use client";

import type { EmotionalTagId } from "@/lib/emotional-tags";
import type { Expense } from "@/lib/schema";
import ExpenseItem from "./ExpenseItem";

type ExpenseListProps = {
  expenses: Expense[];
  tags: Record<number, EmotionalTagId>;
  onTagChange: (id: number, tag: EmotionalTagId) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
  isLoading?: boolean;
  formatAmount: (amountRub: number) => string;
};

function formatExpenseCount(count: number) {
  if (count === 0) return "Расходов пока нет";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} расход`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} расхода`;
  }
  return `${count} расходов`;
}

export default function ExpenseList({
  expenses,
  tags,
  onTagChange,
  onDelete,
  deletingId,
  isLoading = false,
  formatAmount,
}: ExpenseListProps) {
  return (
    <section className="card p-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Расходы</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {formatExpenseCount(expenses.length)}
        </p>
      </div>

      {isLoading ? (
        <p className="mt-8 text-center text-sm text-[var(--muted)]">Загрузка…</p>
      ) : expenses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--card-border)] bg-[#F0EBFF]/40 px-6 py-12 text-center">
          <p className="text-sm font-medium">Расходы не найдены</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Измените фильтры или добавьте новый расход.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              tag={tags[expense.id] ?? "mindful"}
              onTagChange={onTagChange}
              onDelete={onDelete}
              isDeleting={deletingId === expense.id}
              formatAmount={formatAmount}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

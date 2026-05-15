"use client";

import { EXPENSE_CATEGORIES, type Expense } from "@/lib/schema";
import ExpenseItem from "./ExpenseItem";

type ExpenseListProps = {
  expenses: Expense[];
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
  isLoading?: boolean;
};

function formatExpenseCount(count: number) {
  if (count === 0) return "Расходов пока нет";

  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return `${count} расход`;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} расхода`;
  }

  return `${count} расходов`;
}

export default function ExpenseList({
  expenses,
  categoryFilter,
  onCategoryFilterChange,
  onDelete,
  deletingId,
  isLoading = false,
}: ExpenseListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Расходы</h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatExpenseCount(expenses.length)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter" className="text-sm font-medium text-slate-600">
            Фильтр
          </label>
          <select
            id="filter"
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">Все категории</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-8 text-center text-sm text-slate-500">Загрузка…</p>
      ) : expenses.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">Расходы не найдены</p>
          <p className="mt-1 text-sm text-slate-500">
            Добавьте первый расход через форму слева.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onDelete={onDelete}
              isDeleting={deletingId === expense.id}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

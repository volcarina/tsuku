"use client";

import { useState } from "react";
import {
  EXPENSE_CATEGORIES,
  type CreateExpenseInput,
  type ExpenseCategory,
} from "@/lib/schema";

type ExpenseFormProps = {
  onSubmit: (data: CreateExpenseInput) => Promise<void>;
};

const emptyForm: CreateExpenseInput = {
  title: "",
  amount: 0,
  category: "Еда",
};

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount),
      });
      setForm(emptyForm);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось добавить расход",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Добавить расход</h2>
      <p className="mt-1 text-sm text-slate-500">
        Зафиксируйте новую покупку или платёж.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="title"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Название
          </label>
          <input
            id="title"
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Например, продукты"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="amount"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Сумма
          </label>
          <input
            id="amount"
            type="number"
            required
            min="0.01"
            step="0.01"
            value={form.amount || ""}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.valueAsNumber || 0 })
            }
            placeholder="0,00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Категория
          </label>
          <select
            id="category"
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value as ExpenseCategory,
              })
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Добавление…" : "Добавить расход"}
      </button>
    </form>
  );
}

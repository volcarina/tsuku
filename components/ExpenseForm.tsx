"use client";

import { useState } from "react";
import EmotionalTagPicker from "@/components/EmotionalTagPicker";
import {
  DEFAULT_EMOTIONAL_TAG,
  type EmotionalTagId,
} from "@/lib/emotional-tags";
import {
  EXPENSE_CATEGORIES,
  type CreateExpenseInput,
  type ExpenseCategory,
} from "@/lib/schema";

type ExpenseFormProps = {
  onSubmit: (data: CreateExpenseInput, tag: EmotionalTagId) => Promise<void>;
  pulse?: boolean;
};

const emptyForm: CreateExpenseInput = {
  title: "",
  amount: 0,
  category: "Еда",
};

export default function ExpenseForm({ onSubmit, pulse = false }: ExpenseFormProps) {
  const [form, setForm] = useState(emptyForm);
  const [tag, setTag] = useState<EmotionalTagId>(DEFAULT_EMOTIONAL_TAG);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({ ...form, amount: Number(form.amount) }, tag);
      setForm(emptyForm);
      setTag(DEFAULT_EMOTIONAL_TAG);
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
      className={`card p-6 transition duration-200 ${pulse ? "animate-pulse-soft" : ""}`}
    >
      <h2 className="text-lg font-semibold text-[var(--foreground)]">
        Добавить расход
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Отметьте эмоцию — это влияет на аналитику дня.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
            Название
          </label>
          <input
            id="title"
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Например, кофе навынос"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="amount" className="mb-1.5 block text-sm font-medium">
            Сумма (₽)
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
            className="input"
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
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
            className="input"
          >
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Эмоциональный тег</p>
          <EmotionalTagPicker value={tag} onChange={setTag} />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-[#FDE8F0] px-3 py-2 text-sm text-[#C94B7A]">
          {error}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 w-full">
        {isSubmitting ? "Добавление…" : "Добавить расход"}
      </button>
    </form>
  );
}

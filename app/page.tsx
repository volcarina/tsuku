"use client";

import { useCallback, useEffect, useState } from "react";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import type { CreateExpenseInput, Expense } from "@/lib/schema";

type ExpensesResponse = {
  expenses: Expense[];
  total: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadExpenses = useCallback(async (category: string) => {
    setFetchError(null);
    setIsLoading(true);

    const params = category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
    const response = await fetch(`/api/expenses${params}`);

    if (!response.ok) {
      throw new Error("Не удалось загрузить расходы");
    }

    const data: ExpensesResponse = await response.json();
    setExpenses(data.expenses);
    setTotal(data.total);
  }, []);

  useEffect(() => {
    loadExpenses(categoryFilter)
      .catch(() =>
        setFetchError("Не удалось загрузить расходы. Обновите страницу."),
      )
      .finally(() => setIsLoading(false));
  }, [categoryFilter, loadExpenses]);

  async function handleAdd(data: CreateExpenseInput) {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message =
        payload?.issues?.fieldErrors?.title?.[0] ??
        payload?.issues?.fieldErrors?.amount?.[0] ??
        payload?.issues?.fieldErrors?.category?.[0] ??
        payload?.error ??
        "Не удалось добавить расход";
      throw new Error(message);
    }

    await loadExpenses(categoryFilter);
  }

  async function handleDelete(id: number) {
    setDeletingId(id);

    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Не удалось удалить расход");
      }

      await loadExpenses(categoryFilter);
    } catch {
      setFetchError("Не удалось удалить расход. Попробуйте ещё раз.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-medium text-indigo-600">Учёт расходов</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Панель управления
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Отслеживайте траты по категориям в одном месте.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 sm:text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Всего потрачено
            </p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {fetchError && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {fetchError}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,360px)_1fr]">
          <ExpenseForm onSubmit={handleAdd} />
          <ExpenseList
            expenses={expenses}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            onDelete={handleDelete}
            deletingId={deletingId}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}

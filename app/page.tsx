"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BudgetProgress from "@/components/BudgetProgress";
import CurrencyToggle from "@/components/CurrencyToggle";
import DayInsight from "@/components/DayInsight";
import DayStateCard from "@/components/DayStateCard";
import ExpenseAnalytics from "@/components/ExpenseAnalytics";
import ExpenseFiltersPanel from "@/components/ExpenseFilters";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import OverloadMoments from "@/components/OverloadMoments";
import ThemeToggle from "@/components/ThemeToggle";
import { computeAnalytics } from "@/lib/analytics";
import {
  DEFAULT_USD_RUB_RATE,
  fetchUsdRubRate,
  formatMoney,
  type DisplayCurrency,
} from "@/lib/currency";
import {
  computeBudgetStatus,
  computeDayInsight,
  computeDayState,
  computeOverloadMoments,
  filterTodayExpenses,
  filterYesterdayExpenses,
} from "@/lib/dopamine-analytics";
import { getMonthKey } from "@/lib/dates";
import {
  DEFAULT_EMOTIONAL_TAG,
  getAllExpenseTags,
  removeExpenseTag,
  setExpenseTag,
  type EmotionalTagId,
} from "@/lib/emotional-tags";
import {
  buildExpensesQuery,
  emptyFilters,
  type ExpenseFilters,
} from "@/lib/filters";
import type { CreateExpenseInput, Expense } from "@/lib/schema";
import {
  clearStoredBudget,
  getStoredBudget,
  getStoredCurrency,
  getStoredUsdRate,
  setStoredBudget,
  setStoredCurrency,
  setStoredUsdRate,
} from "@/lib/storage";

type ExpensesResponse = {
  expenses: Expense[];
  total: number;
};

function buildTagsMap(expenses: Expense[]): Record<number, EmotionalTagId> {
  const stored = getAllExpenseTags();
  const map: Record<number, EmotionalTagId> = {};

  for (const expense of expenses) {
    const key = String(expense.id);
    map[expense.id] = stored[key] ?? DEFAULT_EMOTIONAL_TAG;
  }

  return map;
}

const BUDGET_TINT: Record<string, string> = {
  OK: "#7ED6B522",
  WARNING: "#FFE58A33",
  OVERBUDGET: "#F7A8C444",
  NONE: "transparent",
};

export default function Home() {
  const monthKey = getMonthKey();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ExpenseFilters>(emptyFilters);
  const [tags, setTags] = useState<Record<number, EmotionalTagId>>({});
  const [budget, setBudget] = useState<number | null>(null);
  const [currency, setCurrency] = useState<DisplayCurrency>("RUB");
  const [usdRate, setUsdRate] = useState(DEFAULT_USD_RUB_RATE);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formPulse, setFormPulse] = useState(false);

  const formatAmount = useCallback(
    (amountRub: number) => formatMoney(amountRub, currency, usdRate),
    [currency, usdRate],
  );

  const analytics = useMemo(
    () => computeAnalytics(monthExpenses),
    [monthExpenses],
  );

  const todayExpenses = useMemo(
    () => filterTodayExpenses(monthExpenses),
    [monthExpenses],
  );

  const yesterdayExpenses = useMemo(
    () => filterYesterdayExpenses(monthExpenses),
    [monthExpenses],
  );

  const dayState = useMemo(
    () => computeDayState(todayExpenses, tags),
    [todayExpenses, tags],
  );

  const overloadMoments = useMemo(
    () => computeOverloadMoments(todayExpenses, tags),
    [todayExpenses, tags],
  );

  const dayInsight = useMemo(
    () => computeDayInsight(todayExpenses, yesterdayExpenses, tags),
    [todayExpenses, yesterdayExpenses, tags],
  );

  const budgetStatus = useMemo(
    () => computeBudgetStatus(analytics.spentThisMonth, budget),
    [analytics.spentThisMonth, budget],
  );

  useEffect(() => {
    setBudget(getStoredBudget(monthKey));
    setCurrency(getStoredCurrency() ?? "RUB");
    setUsdRate(getStoredUsdRate() ?? DEFAULT_USD_RUB_RATE);

    fetchUsdRubRate().then((rate) => {
      setUsdRate(rate);
      setStoredUsdRate(rate);
    });
  }, [monthKey]);

  const loadExpenses = useCallback(
    async (activeFilters: ExpenseFilters) => {
      setFetchError(null);
      setIsLoading(true);

      try {
        const listQuery = buildExpensesQuery(activeFilters);
        const monthQuery = buildExpensesQuery(emptyFilters, monthKey);

        const [listRes, monthRes] = await Promise.all([
          fetch(`/api/expenses${listQuery}`),
          fetch(`/api/expenses${monthQuery}`),
        ]);

        if (!listRes.ok || !monthRes.ok) {
          throw new Error("Не удалось загрузить расходы");
        }

        const listData: ExpensesResponse = await listRes.json();
        const monthData: ExpensesResponse = await monthRes.json();

        setExpenses(listData.expenses);
        setTotal(listData.total);
        setMonthExpenses(monthData.expenses);
        setTags(buildTagsMap([...listData.expenses, ...monthData.expenses]));
      } catch {
        setFetchError("Не удалось загрузить расходы");
        setExpenses([]);
        setMonthExpenses([]);
        setTotal(0);
      } finally {
        setIsLoading(false);
      }
    },
    [monthKey],
  );

  useEffect(() => {
    loadExpenses(filters).catch(() =>
      setFetchError("Не удалось загрузить расходы. Обновите страницу."),
    );
  }, [filters, loadExpenses]);

  function handleBudgetChange(value: number | null) {
    setBudget(value);
    if (value === null) {
      clearStoredBudget(monthKey);
      return;
    }
    setStoredBudget(value, monthKey);
  }

  function handleCurrencyChange(next: DisplayCurrency) {
    setCurrency(next);
    setStoredCurrency(next);
  }

  function handleTagChange(id: number, tag: EmotionalTagId) {
    setExpenseTag(id, tag);
    setTags((prev) => ({ ...prev, [id]: tag }));
  }

  async function handleAdd(data: CreateExpenseInput, tag: EmotionalTagId) {
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

    if (payload.expense?.id) {
      setExpenseTag(payload.expense.id, tag);
    }

    setFormPulse(true);
    setTimeout(() => setFormPulse(false), 700);

    await loadExpenses(filters);
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

      removeExpenseTag(id);
      await loadExpenses(filters);
    } catch {
      setFetchError("Не удалось удалить расход. Попробуйте ещё раз.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div
      className="min-h-full bg-[var(--background)] transition-colors duration-300"
      style={{
        backgroundImage: `linear-gradient(180deg, ${BUDGET_TINT[budgetStatus]} 0%, transparent 280px)`,
      }}
    >
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-bold" style={{ color: "#FF6FAE" }}>
              TSUKU · дофаминовый трекер
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Панель расходов
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Эмоции, ритм дня и бюджет в одном месте.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex flex-wrap items-center gap-2">
              <ThemeToggle />
              <CurrencyToggle
                currency={currency}
                usdRate={usdRate}
                onCurrencyChange={handleCurrencyChange}
              />
            </div>
            <div className="card card-interactive px-5 py-4 sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Итого по фильтрам
              </p>
              <p className="mt-1 text-3xl font-bold tabular-nums">
                {formatAmount(total)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {fetchError && (
          <p className="rounded-2xl bg-[#FDE8F0] px-4 py-3 text-sm text-[#C94B7A]">
            {fetchError}
          </p>
        )}

        <DayInsight insight={dayInsight} />

        <div className="grid gap-4 lg:grid-cols-3">
          <DayStateCard state={dayState} />
          <BudgetProgress
            spent={analytics.spentThisMonth}
            budget={budget}
            status={budgetStatus}
            formatAmount={formatAmount}
          />
          <OverloadMoments
            moments={overloadMoments}
            formatAmount={formatAmount}
          />
        </div>

        <ExpenseAnalytics
          analytics={analytics}
          monthKey={monthKey}
          budget={budget}
          onBudgetChange={handleBudgetChange}
          formatAmount={formatAmount}
          currency={currency}
          usdRate={usdRate}
          tags={tags}
          monthExpenses={monthExpenses}
        />

        <ExpenseFiltersPanel
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(emptyFilters)}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
          <ExpenseForm onSubmit={handleAdd} pulse={formPulse} />
          <ExpenseList
            expenses={expenses}
            tags={tags}
            onTagChange={handleTagChange}
            onDelete={handleDelete}
            deletingId={deletingId}
            isLoading={isLoading}
            formatAmount={formatAmount}
          />
        </div>
      </main>
    </div>
  );
}

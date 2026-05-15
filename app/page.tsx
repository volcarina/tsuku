"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AnimatedNumber from "@/components/AnimatedNumber";
import BudgetProgress from "@/components/BudgetProgress";
import CurrencyToggle from "@/components/CurrencyToggle";
import DayInsight from "@/components/DayInsight";
import DayStateCard from "@/components/DayStateCard";
import ExpenseAnalytics from "@/components/ExpenseAnalytics";
import ExpenseFiltersPanel from "@/components/ExpenseFilters";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import OverloadMoments from "@/components/OverloadMoments";
import StickyActionBar from "@/components/StickyActionBar";
import ThemeToggle from "@/components/ThemeToggle";
import TodayVibeCard from "@/components/TodayVibe";
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
import { computeTodayVibe } from "@/lib/today-vibe";

type ExpensesResponse = {
  expenses: Expense[];
  total: number;
};

function buildTagsMap(expenses: Expense[]): Record<number, EmotionalTagId> {
  const stored = getAllExpenseTags();
  const map: Record<number, EmotionalTagId> = {};

  for (const expense of expenses) {
    map[expense.id] = stored[String(expense.id)] ?? DEFAULT_EMOTIONAL_TAG;
  }

  return map;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

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
  const [uiPulse, setUiPulse] = useState(false);

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

  const todayVibe = useMemo(
    () => computeTodayVibe(dayState, budgetStatus, todayExpenses.length),
    [dayState, budgetStatus, todayExpenses.length],
  );

  const mood =
    budgetStatus === "OVERBUDGET"
      ? "overlimit"
      : budgetStatus === "WARNING"
        ? "warning"
        : "ok";

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
    setUiPulse(true);
    setTimeout(() => setUiPulse(false), 500);
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
    setUiPulse(true);
    setTimeout(() => {
      setFormPulse(false);
      setUiPulse(false);
    }, 800);

    await loadExpenses(filters);
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    await new Promise((resolve) => setTimeout(resolve, 320));

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
      className={`app-shell min-h-full transition-all duration-300 ${uiPulse ? "animate-pulse-soft" : ""}`}
      data-mood={mood}
    >
      <div className="app-content pb-28">
        <header className="border-b-2 border-[var(--card-border)] bg-[var(--card)]/95 shadow-lg backdrop-blur-md">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:px-5">
            <div>
              <p
                className="text-sm font-extrabold tracking-wide"
                style={{ color: "#FF4D9A" }}
              >
                TSUKU · дофаминовый трекер
              </p>
              <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Панель расходов
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <ThemeToggle />
              <CurrencyToggle
                currency={currency}
                usdRate={usdRate}
                onCurrencyChange={handleCurrencyChange}
              />
              <div className="card card-interactive min-w-[140px] px-4 py-3 sm:text-right">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)]">
                  Итого
                </p>
                <p className="text-2xl font-extrabold tabular-nums">
                  <AnimatedNumber value={total} format={formatAmount} />
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1400px] space-y-4 px-3 py-4 sm:px-4 lg:px-5">
          {fetchError && (
            <p className="animate-fade-in rounded-2xl border-2 border-[#FF4D9A55] bg-[#FFE0EC] px-4 py-3 text-sm font-semibold text-[#C94B7A]">
              {fetchError}
            </p>
          )}

          <section className="section-zone space-y-3">
            <TodayVibeCard vibe={todayVibe} />
            <DayInsight insight={dayInsight} />
          </section>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          </section>

          <section id="analytics" className="scroll-mt-20">
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
          </section>

          <section id="filters" className="scroll-mt-20">
            <ExpenseFiltersPanel
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(emptyFilters)}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,400px)_1fr]">
            <div id="add-expense" className="scroll-mt-24">
              <ExpenseForm onSubmit={handleAdd} pulse={formPulse} />
            </div>
            <ExpenseList
              expenses={expenses}
              tags={tags}
              onTagChange={handleTagChange}
              onDelete={handleDelete}
              deletingId={deletingId}
              isLoading={isLoading}
              formatAmount={formatAmount}
            />
          </section>
        </main>
      </div>

      <StickyActionBar
        onAdd={() => scrollToSection("add-expense")}
        onFilters={() => scrollToSection("filters")}
        onAnalytics={() => scrollToSection("analytics")}
      />
    </div>
  );
}

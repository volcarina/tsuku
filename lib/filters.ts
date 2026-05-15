import type { Expense } from "@/lib/schema";
import { endOfDay, isInMonth, startOfDay } from "@/lib/dates";

export type ExpenseFilters = {
  category: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
};

export const emptyFilters: ExpenseFilters = {
  category: "all",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
};

export function buildExpensesQuery(filters: ExpenseFilters, monthKey?: string) {
  const params = new URLSearchParams();

  if (filters.category !== "all") {
    params.set("category", filters.category);
  }
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.minAmount) params.set("minAmount", filters.minAmount);
  if (filters.maxAmount) params.set("maxAmount", filters.maxAmount);
  if (monthKey) params.set("month", monthKey);

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function filterExpensesClient(
  expenses: Expense[],
  filters: ExpenseFilters,
): Expense[] {
  let result = expenses;

  if (filters.category !== "all") {
    result = result.filter((e) => e.category === filters.category);
  }

  if (filters.dateFrom) {
    const from = startOfDay(filters.dateFrom);
    result = result.filter((e) => new Date(e.createdAt) >= from);
  }

  if (filters.dateTo) {
    const to = endOfDay(filters.dateTo);
    result = result.filter((e) => new Date(e.createdAt) <= to);
  }

  if (filters.minAmount) {
    const min = Number(filters.minAmount);
    if (!Number.isNaN(min)) {
      result = result.filter((e) => e.amount >= min);
    }
  }

  if (filters.maxAmount) {
    const max = Number(filters.maxAmount);
    if (!Number.isNaN(max)) {
      result = result.filter((e) => e.amount <= max);
    }
  }

  return result;
}

export function filterByMonth(expenses: Expense[], monthKey: string) {
  return expenses.filter((e) => isInMonth(e.createdAt, monthKey));
}

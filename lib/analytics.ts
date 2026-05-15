import type { Expense } from "@/lib/schema";

export type ExpenseAnalytics = {
  topCategory: string;
  topCategoryAmount: number;
  averageCheck: number;
  spentThisMonth: number;
  largestExpense: Expense | null;
  expenseCount: number;
};

export function computeAnalytics(expenses: Expense[]): ExpenseAnalytics {
  if (expenses.length === 0) {
    return {
      topCategory: "—",
      topCategoryAmount: 0,
      averageCheck: 0,
      spentThisMonth: 0,
      largestExpense: null,
      expenseCount: 0,
    };
  }

  const spentThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = new Map<string, number>();

  for (const expense of expenses) {
    byCategory.set(
      expense.category,
      (byCategory.get(expense.category) ?? 0) + expense.amount,
    );
  }

  let topCategory = "—";
  let topCategoryAmount = 0;

  for (const [category, amount] of byCategory) {
    if (amount > topCategoryAmount) {
      topCategory = category;
      topCategoryAmount = amount;
    }
  }

  const largestExpense = expenses.reduce((max, e) =>
    e.amount > max.amount ? e : max,
  );

  return {
    topCategory,
    topCategoryAmount,
    averageCheck: spentThisMonth / expenses.length,
    spentThisMonth,
    largestExpense,
    expenseCount: expenses.length,
  };
}

import { getMonthKey } from "@/lib/dates";
import type { DisplayCurrency } from "@/lib/currency";

const THEME_KEY = "expense-tracker-theme";
const BUDGET_PREFIX = "expense-tracker-budget-";
const CURRENCY_KEY = "expense-tracker-currency";
const RATE_KEY = "expense-tracker-usd-rate";

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(THEME_KEY);
  return value === "light" || value === "dark" ? value : null;
}

export function setStoredTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function getStoredBudget(monthKey = getMonthKey()): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${BUDGET_PREFIX}${monthKey}`);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export function setStoredBudget(amount: number, monthKey = getMonthKey()) {
  localStorage.setItem(`${BUDGET_PREFIX}${monthKey}`, String(amount));
}

export function clearStoredBudget(monthKey = getMonthKey()) {
  localStorage.removeItem(`${BUDGET_PREFIX}${monthKey}`);
}

export function getStoredCurrency(): DisplayCurrency | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CURRENCY_KEY);
  return value === "RUB" || value === "USD" ? value : null;
}

export function setStoredCurrency(currency: DisplayCurrency) {
  localStorage.setItem(CURRENCY_KEY, currency);
}

export function getStoredUsdRate(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(RATE_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function setStoredUsdRate(rate: number) {
  localStorage.setItem(RATE_KEY, String(rate));
}

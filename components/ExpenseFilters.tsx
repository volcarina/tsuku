"use client";

import { EXPENSE_CATEGORIES } from "@/lib/schema";
import type { ExpenseFilters } from "@/lib/filters";

type ExpenseFiltersProps = {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
  onReset: () => void;
};

export default function ExpenseFiltersPanel({
  filters,
  onChange,
  onReset,
}: ExpenseFiltersProps) {
  function update<K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Фильтры</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold transition duration-150 hover:underline"
          style={{ color: "#6C7CFF" }}
        >
          Сбросить
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label htmlFor="filter-category" className="mb-1 block text-xs text-[var(--muted)]">
            Категория
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => update("category", e.target.value)}
            className="input"
          >
            <option value="all">Все категории</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-date-from" className="mb-1 block text-xs text-[var(--muted)]">
            Дата от
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update("dateFrom", e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="filter-date-to" className="mb-1 block text-xs text-[var(--muted)]">
            Дата до
          </label>
          <input
            id="filter-date-to"
            type="date"
            value={filters.dateTo}
            onChange={(e) => update("dateTo", e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="filter-min" className="mb-1 block text-xs text-[var(--muted)]">
            Сумма от (₽)
          </label>
          <input
            id="filter-min"
            type="number"
            min="0"
            step="0.01"
            value={filters.minAmount}
            onChange={(e) => update("minAmount", e.target.value)}
            placeholder="0"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="filter-max" className="mb-1 block text-xs text-[var(--muted)]">
            Сумма до (₽)
          </label>
          <input
            id="filter-max"
            type="number"
            min="0"
            step="0.01"
            value={filters.maxAmount}
            onChange={(e) => update("maxAmount", e.target.value)}
            placeholder="∞"
            className="input"
          />
        </div>
      </div>
    </div>
  );
}


import type { Expense } from "@/lib/schema";

type ExpenseItemProps = {
  expense: Expense;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
};

const categoryColors: Record<string, string> = {
  Еда: "bg-amber-100 text-amber-800",
  Транспорт: "bg-sky-100 text-sky-800",
  Жильё: "bg-violet-100 text-violet-800",
  Развлечения: "bg-pink-100 text-pink-800",
  Покупки: "bg-slate-100 text-slate-700",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(amount);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export default function ExpenseItem({
  expense,
  onDelete,
  isDeleting = false,
}: ExpenseItemProps) {
  const badgeClass =
    categoryColors[expense.category] ?? categoryColors.Покупки;

  return (
    <li className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900">{expense.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatDate(expense.createdAt)}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}
      >
        {expense.category}
      </span>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">
        {formatCurrency(expense.amount)}
      </span>
      <button
        type="button"
        onClick={() => onDelete(expense.id)}
        disabled={isDeleting}
        className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Удалить «${expense.title}»`}
      >
        {isDeleting ? "…" : "Удалить"}
      </button>
    </li>
  );
}

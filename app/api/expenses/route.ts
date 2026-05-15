import type { NextRequest } from "next/server";
import {
  createExpenseSchema,
  type Expense,
} from "@/lib/schema";
import { endOfDay, startOfDay } from "@/lib/dates";

const expenses: Expense[] = [];
let nextId = 1;

function getTotal(list: Expense[]) {
  return list.reduce((sum, expense) => sum + expense.amount, 0);
}

function getMonthKeyFromIso(iso: string) {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function applyFilters(list: Expense[], searchParams: URLSearchParams) {
  let filtered = list;

  const category = searchParams.get("category");
  if (category && category !== "all") {
    filtered = filtered.filter((expense) => expense.category === category);
  }

  const month = searchParams.get("month");
  if (month) {
    filtered = filtered.filter(
      (expense) => getMonthKeyFromIso(expense.createdAt) === month,
    );
  }

  const dateFrom = searchParams.get("dateFrom");
  if (dateFrom) {
    const from = startOfDay(dateFrom);
    filtered = filtered.filter(
      (expense) => new Date(expense.createdAt) >= from,
    );
  }

  const dateTo = searchParams.get("dateTo");
  if (dateTo) {
    const to = endOfDay(dateTo);
    filtered = filtered.filter((expense) => new Date(expense.createdAt) <= to);
  }

  const minAmount = searchParams.get("minAmount");
  if (minAmount) {
    const min = Number(minAmount);
    if (!Number.isNaN(min)) {
      filtered = filtered.filter((expense) => expense.amount >= min);
    }
  }

  const maxAmount = searchParams.get("maxAmount");
  if (maxAmount) {
    const max = Number(maxAmount);
    if (!Number.isNaN(max)) {
      filtered = filtered.filter((expense) => expense.amount <= max);
    }
  }

  return filtered;
}

export async function GET(request: NextRequest) {
  const filtered = applyFilters(expenses, request.nextUrl.searchParams);

  return Response.json({
    expenses: filtered,
    total: getTotal(filtered),
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некорректное тело запроса" }, { status: 400 });
  }

  const parsed = createExpenseSchema.safeParse(body);

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    // Zod v4: flat.fieldErrors (v3) was renamed to flat.fields (v4) — normalise both
    const fieldErrors = (flat as Record<string, unknown>).fieldErrors ?? (flat as Record<string, unknown>).fields ?? {};
    return Response.json(
      { error: "Ошибка валидации", issues: { fieldErrors } },
      { status: 400 },
    );
  }

  const expense: Expense = {
    ...parsed.data,
    id: nextId++,
    createdAt: new Date().toISOString(),
  };

  expenses.unshift(expense);

  return Response.json({ expense }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const idParam = request.nextUrl.searchParams.get("id");
  const id = Number(idParam);

  if (!idParam || Number.isNaN(id)) {
    return Response.json({ error: "Укажите корректный id" }, { status: 400 });
  }

  const index = expenses.findIndex((expense) => expense.id === id);

  if (index === -1) {
    return Response.json({ error: "Расход не найден" }, { status: 404 });
  }

  const [removed] = expenses.splice(index, 1);

  return Response.json({ expense: removed });
}

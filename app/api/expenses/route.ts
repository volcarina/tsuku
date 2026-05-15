import type { NextRequest } from "next/server";
import {
  createExpenseSchema,
  type Expense,
} from "@/lib/schema";

const expenses: Expense[] = [];
let nextId = 1;

function getTotal(list: Expense[]) {
  return list.reduce((sum, expense) => sum + expense.amount, 0);
}

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category");

  const filtered =
    category && category !== "all"
      ? expenses.filter((expense) => expense.category === category)
      : expenses;

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
    return Response.json(
      { error: "Ошибка валидации", issues: parsed.error.flatten() },
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

import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "Еда",
  "Транспорт",
  "Жильё",
  "Развлечения",
  "Покупки",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "Укажите название"),
  amount: z.coerce.number().refine((v) => v > 0, "Сумма должна быть больше 0"),
  category: z.enum(EXPENSE_CATEGORIES),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export type Expense = CreateExpenseInput & {
  id: number;
  createdAt: string;
};

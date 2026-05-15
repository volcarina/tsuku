import type { Expense } from "@/lib/schema";
import {
  type EmotionalTagId,
  getExpenseTag,
  isControlTag,
  isImpulseTag,
} from "@/lib/emotional-tags";

export type DayStateId =
  | "stable"
  | "control"
  | "emotional"
  | "overload"
  | "chaos";

export type DayState = {
  id: DayStateId;
  title: string;
  description: string;
  color: string;
  soft: string;
};

export type OverloadMoment = {
  label: string;
  timeRange: string;
  count: number;
  total: number;
  accent: string;
};

export type BudgetStatus = "OK" | "WARNING" | "OVERBUDGET" | "NONE";

const DAY_STATES: Record<DayStateId, Omit<DayState, "id">> = {
  stable: {
    title: "Стабильный день",
    description: "Траты ровные, без резких всплесков",
    color: "#7ED6B5",
    soft: "#E8FAF3",
  },
  control: {
    title: "Контроль",
    description: "Больше осознанных и нужных покупок",
    color: "#7ED6B5",
    soft: "#E8FAF3",
  },
  emotional: {
    title: "Эмоциональные траты",
    description: "Много импульсных решений сегодня",
    color: "#F7A8C4",
    soft: "#FDE8F0",
  },
  overload: {
    title: "Перегруз",
    description: "Серия трат за короткий промежуток",
    color: "#B9A7FF",
    soft: "#F0EBFF",
  },
  chaos: {
    title: "Хаос трат",
    description: "Смешение импульса и перерасхода",
    color: "#FFE58A",
    soft: "#FFF8DC",
  },
};

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfYesterday() {
  const today = startOfToday();
  return new Date(today.getTime() - 86_400_000);
}

export function filterTodayExpenses(expenses: Expense[]) {
  const start = startOfToday();
  return expenses.filter((e) => new Date(e.createdAt) >= start);
}

export function filterYesterdayExpenses(expenses: Expense[]) {
  const start = startOfYesterday();
  const end = startOfToday();
  return expenses.filter((e) => {
    const date = new Date(e.createdAt);
    return date >= start && date < end;
  });
}

function getTag(expenseId: number, tags?: Record<number, EmotionalTagId>) {
  return tags?.[expenseId] ?? getExpenseTag(expenseId);
}

function impulseRatio(
  list: Expense[],
  tags?: Record<number, EmotionalTagId>,
) {
  if (list.length === 0) return 0;
  const impulse = list.filter((e) => isImpulseTag(getTag(e.id, tags))).length;
  return impulse / list.length;
}

function slippedCount(list: Expense[], tags?: Record<number, EmotionalTagId>) {
  return list.filter((e) => getTag(e.id, tags) === "slipped").length;
}

function hasBurstWindow(list: Expense[], windowMs = 30 * 60 * 1000) {
  if (list.length < 2) return false;

  const sorted = [...list].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  for (let i = 0; i < sorted.length; i++) {
    const start = new Date(sorted[i].createdAt).getTime();
    const window = sorted.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= start && t <= start + windowMs;
    });
    if (window.length >= 3) return true;
  }

  return false;
}

export function computeDayState(
  todayExpenses: Expense[],
  tags?: Record<number, EmotionalTagId>,
): DayState {
  const base = { id: "stable" as DayStateId, ...DAY_STATES.stable };

  if (todayExpenses.length === 0) {
    return { id: "stable", ...DAY_STATES.stable };
  }

  const impulse = impulseRatio(todayExpenses, tags);
  const slipped = slippedCount(todayExpenses, tags);
  const controlShare =
    todayExpenses.filter((e) => isControlTag(getTag(e.id, tags))).length /
    todayExpenses.length;

  if (slipped >= 2 || (slipped >= 1 && impulse >= 0.5)) {
    return { id: "chaos", ...DAY_STATES.chaos };
  }

  if (hasBurstWindow(todayExpenses)) {
    return { id: "overload", ...DAY_STATES.overload };
  }

  if (impulse >= 0.45) {
    return { id: "emotional", ...DAY_STATES.emotional };
  }

  if (controlShare >= 0.55) {
    return { id: "control", ...DAY_STATES.control };
  }

  return base;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function computeOverloadMoments(
  todayExpenses: Expense[],
  tags?: Record<number, EmotionalTagId>,
): OverloadMoment[] {
  if (todayExpenses.length < 2) return [];

  const sorted = [...todayExpenses].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const windowMs = 30 * 60 * 1000;
  const moments: OverloadMoment[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const anchor = new Date(sorted[i].createdAt).getTime();
    const window = sorted.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= anchor && t <= anchor + windowMs;
    });

    if (window.length < 2) continue;

    const impulseCount = window.filter((e) =>
      isImpulseTag(getTag(e.id, tags)),
    ).length;
    const total = window.reduce((sum, e) => sum + e.amount, 0);
    const start = new Date(window[0].createdAt);
    const end = new Date(window[window.length - 1].createdAt);

    const hour = start.getHours();
    let label = "Серия трат";

    if (impulseCount / window.length >= 0.5) {
      label = "Серия импульсных трат";
    } else if (hour >= 6 && hour < 12) {
      label = "Утренний всплеск расходов";
    } else if (hour >= 18) {
      label = "Вечерний всплеск расходов";
    }

    const timeRange = `${formatTime(start)}–${formatTime(end)}`;

    if (
      !moments.some(
        (m) => m.timeRange === timeRange && m.label === label,
      )
    ) {
      moments.push({
        label,
        timeRange,
        count: window.length,
        total,
        accent: impulseCount >= 2 ? "#F7A8C4" : "#B9A7FF",
      });
    }
  }

  return moments
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
}

export function computeDayInsight(
  todayExpenses: Expense[],
  yesterdayExpenses: Expense[],
  tags?: Record<number, EmotionalTagId>,
): string {
  if (todayExpenses.length === 0) {
    return "Сегодня трат пока нет — хороший момент для спокойного планирования.";
  }

  const todayImpulse = impulseRatio(todayExpenses, tags);
  const yesterdayImpulse = impulseRatio(yesterdayExpenses, tags);

  if (yesterdayExpenses.length > 0 && todayImpulse < yesterdayImpulse - 0.15) {
    return "Расходы стабильнее, чем вчера — импульсных тегов меньше.";
  }

  if (todayImpulse >= 0.5) {
    return "Сегодня ты чаще выбирал быстрые траты.";
  }

  const eveningTotal = todayExpenses
    .filter((e) => new Date(e.createdAt).getHours() >= 18)
    .reduce((sum, e) => sum + e.amount, 0);
  const dayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (dayTotal > 0 && eveningTotal / dayTotal >= 0.6) {
    return "Основные траты приходятся на вечер.";
  }

  const controlShare =
    todayExpenses.filter((e) => isControlTag(getTag(e.id, tags))).length /
    todayExpenses.length;

  if (controlShare >= 0.5) {
    return "Баланс лучше, чем в прошлые дни — больше осознанных решений.";
  }

  return "День в процессе — следи за тегами, чтобы увидеть паттерн.";
}

export function computeBudgetStatus(
  spent: number,
  budget: number | null,
): BudgetStatus {
  if (budget === null || budget <= 0) return "NONE";
  const ratio = spent / budget;
  if (ratio > 1) return "OVERBUDGET";
  if (ratio >= 0.7) return "WARNING";
  return "OK";
}

export function budgetProgressPercent(spent: number, budget: number | null) {
  if (budget === null || budget <= 0) return 0;
  return Math.min((spent / budget) * 100, 120);
}

export function computeTagStats(
  expenses: Expense[],
  tags?: Record<number, EmotionalTagId>,
) {
  const stats = new Map<EmotionalTagId, { count: number; total: number }>();

  for (const expense of expenses) {
    const tag = getTag(expense.id, tags);
    const current = stats.get(tag) ?? { count: 0, total: 0 };
    stats.set(tag, {
      count: current.count + 1,
      total: current.total + expense.amount,
    });
  }

  return stats;
}

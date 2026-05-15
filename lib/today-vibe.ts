import type { BudgetStatus, DayState } from "@/lib/dopamine-analytics";

export type TodayVibe = {
  emoji: string;
  title: string;
  subtitle: string;
  gradient: string;
  accent: string;
};

export function computeTodayVibe(
  dayState: DayState,
  budgetStatus: BudgetStatus,
  todayExpenseCount: number,
): TodayVibe {
  if (budgetStatus === "OVERBUDGET") {
    return {
      emoji: "🔥",
      title: "Береги баланс",
      subtitle: "Бюджет на пределе — сегодня лучше замедлиться",
      gradient: "linear-gradient(135deg, #FFE0EC, #FFD4E8, #FFF5F8)",
      accent: "#FF4D9A",
    };
  }

  if (budgetStatus === "WARNING") {
    return {
      emoji: "⚡",
      title: "На грани",
      subtitle: "Траты набирают обороты — держи ритм",
      gradient: "linear-gradient(135deg, #FFF4D4, #FFE8C8, #FFFAF0)",
      accent: "#FFD24D",
    };
  }

  if (dayState.id === "chaos" || dayState.id === "overload") {
    return {
      emoji: "🌪️",
      title: "День-качели",
      subtitle: "Много импульса — попробуй паузу перед следующей тратой",
      gradient: "linear-gradient(135deg, #F0EBFF, #FDE8F0, #FFF8DC)",
      accent: "#B49CFF",
    };
  }

  if (dayState.id === "emotional") {
    return {
      emoji: "💫",
      title: "Эмо-шопинг",
      subtitle: "Сегодня чаще «хочу сейчас» — осознанность спасёт",
      gradient: "linear-gradient(135deg, #FDE8F0, #F0EBFF, #FFF5FA)",
      accent: "#FF8FBE",
    };
  }

  if (dayState.id === "control" || todayExpenseCount === 0) {
    return {
      emoji: "✨",
      title: "Чилл-режим",
      subtitle: "Спокойный ритм трат — так держать",
      gradient: "linear-gradient(135deg, #E0FFF4, #E8FAF3, #F0FFFA)",
      accent: "#4FD4A4",
    };
  }

  return {
    emoji: "🎯",
    title: "В потоке",
    subtitle: "Стабильный день — траты под контролем",
    gradient: "linear-gradient(135deg, #EEF1FF, #E8FAF3, #F8F9FF)",
    accent: "#5568FF",
  };
}

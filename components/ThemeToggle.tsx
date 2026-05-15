"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)]"
      >
        <span>◐</span>
        <span>Тема</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm font-semibold transition duration-200 hover:scale-105 hover:border-[var(--active)]"
    >
      <span>{theme === "light" ? "🌙" : "☀️"}</span>
      <span>{theme === "light" ? "Тёмная" : "Светлая"}</span>
    </button>
  );
}

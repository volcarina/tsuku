"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="btn-ghost px-3 py-2 text-[var(--muted)]"
      >
        ◐ Тема
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-ghost ripple flex items-center gap-2 px-3 py-2"
    >
      <span>{theme === "light" ? "🌙" : "☀️"}</span>
      <span className="font-extrabold">
        {theme === "light" ? "Тёмная" : "Светлая"}
      </span>
    </button>
  );
}

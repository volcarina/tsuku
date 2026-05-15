"use client";

type StickyActionBarProps = {
  onAdd: () => void;
  onFilters: () => void;
  onAnalytics: () => void;
};

export default function StickyActionBar({
  onAdd,
  onFilters,
  onAnalytics,
}: StickyActionBarProps) {
  return (
    <nav className="sticky-bar fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-2 sm:px-4">
      <div className="mx-auto flex max-w-[1400px] gap-6">
        <button
          type="button"
          onClick={onAdd}
          className="btn-primary ripple flex flex-1 items-center justify-center gap-2 py-3"
          
        >
          <span aria-hidden>＋</span>
          <span>Расход</span>
        </button>
        <button
          type="button"
          onClick={onFilters}
          className="btn-ghost ripple flex items-center gap-1.5 px-4 py-3"
        >
          <span aria-hidden>◎</span>
          <span className="hidden sm:inline">Фильтры</span>
        </button>
        <button
          type="button"
          onClick={onAnalytics}
          className="btn-ghost ripple flex items-center gap-1.5 px-4 py-3"
          style={{
            borderColor: "#B49CFF88",
            background: "linear-gradient(135deg, #F0EBFF, var(--card))",
          }}
        >
          <span aria-hidden>◆</span>
          <span className="hidden sm:inline">Аналитика</span>
        </button>
      </div>
    </nav>
  );
}

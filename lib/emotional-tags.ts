export type EmotionalTagId =
  | "auto"
  | "want_now"
  | "necessary"
  | "treat"
  | "slipped"
  | "mindful";

export type EmotionalTagMeta = {
  id: EmotionalTagId;
  label: string;
  color: string;
  soft: string;
  group: "impulse" | "control" | "neutral";
};

export const EMOTIONAL_TAGS: EmotionalTagMeta[] = [
  {
    id: "auto",
    label: "на автомате",
    color: "#F7A8C4",
    soft: "#FDE8F0",
    group: "impulse",
  },
  {
    id: "want_now",
    label: "хочу сейчас",
    color: "#F7A8C4",
    soft: "#FDE8F0",
    group: "impulse",
  },
  {
    id: "necessary",
    label: "надо было",
    color: "#7ED6B5",
    soft: "#E8FAF3",
    group: "control",
  },
  {
    id: "treat",
    label: "баловство",
    color: "#F6B38A",
    soft: "#FFF0E6",
    group: "neutral",
  },
  {
    id: "slipped",
    label: "сорвался",
    color: "#FFE58A",
    soft: "#FFF8DC",
    group: "impulse",
  },
  {
    id: "mindful",
    label: "осознанно",
    color: "#7ED6B5",
    soft: "#E8FAF3",
    group: "control",
  },
];

const TAGS_STORAGE_KEY = "expense-tracker-emotional-tags";

export const DEFAULT_EMOTIONAL_TAG: EmotionalTagId = "mindful";

export function getTagMeta(id: EmotionalTagId): EmotionalTagMeta {
  return EMOTIONAL_TAGS.find((tag) => tag.id === id) ?? EMOTIONAL_TAGS[5];
}

export function getAllExpenseTags(): Record<string, EmotionalTagId> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(TAGS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, EmotionalTagId>;
  } catch {
    return {};
  }
}

export function getExpenseTag(expenseId: number): EmotionalTagId {
  const tags = getAllExpenseTags();
  return tags[String(expenseId)] ?? DEFAULT_EMOTIONAL_TAG;
}

export function setExpenseTag(expenseId: number, tag: EmotionalTagId) {
  const tags = getAllExpenseTags();
  tags[String(expenseId)] = tag;
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
}

export function removeExpenseTag(expenseId: number) {
  const tags = getAllExpenseTags();
  delete tags[String(expenseId)];
  localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(tags));
}

export function isImpulseTag(tag: EmotionalTagId) {
  const meta = getTagMeta(tag);
  return meta.group === "impulse";
}

export function isControlTag(tag: EmotionalTagId) {
  const meta = getTagMeta(tag);
  return meta.group === "control";
}

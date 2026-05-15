"use client";

import {
  EMOTIONAL_TAGS,
  type EmotionalTagId,
} from "@/lib/emotional-tags";

type EmotionalTagPickerProps = {
  value: EmotionalTagId;
  onChange: (tag: EmotionalTagId) => void;
  compact?: boolean;
};

export default function EmotionalTagPicker({
  value,
  onChange,
  compact = false,
}: EmotionalTagPickerProps) {
  return (
    <div className={compact ? "flex flex-wrap gap-1.5" : "flex flex-wrap gap-2"}>
      {EMOTIONAL_TAGS.map((tag) => {
        const active = value === tag.id;
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onChange(tag.id)}
            className={`chip ${active ? "chip-active" : ""}`}
            style={{
              backgroundColor: active ? tag.color : tag.soft,
              color: active ? "#fff" : "#4a4560",
              border: `1px solid ${active ? tag.color : "transparent"}`,
            }}
          >
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}

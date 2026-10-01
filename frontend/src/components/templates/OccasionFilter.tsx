"use client";
import type { Occasion } from "@/types/models";
import { occasionLabels } from "@/lib/constants";
export function OccasionFilter({
  value,
  onChange,
}: {
  value?: Occasion;
  onChange: (value?: Occasion) => void;
}) {
  return (
    <div className="filters" role="group" aria-label="উপলক্ষ">
      <button aria-pressed={!value} onClick={() => onChange(undefined)}>
        সব টেমপ্লেট
      </button>
      {(Object.entries(occasionLabels) as [Occasion, string][]).map(
        ([key, label]) => (
          <button
            key={key}
            aria-pressed={value === key}
            onClick={() => onChange(key)}
          >
            {label}
          </button>
        ),
      )}
    </div>
  );
}

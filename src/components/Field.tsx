import { useState } from "react";

type Props = {
  label: string;
  value: number;
  onChange?: (n: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  hint?: string;
  readOnly?: boolean;
  autoBadge?: boolean;
  tone?: "before" | "after" | "shared";
  compact?: boolean;
};

export default function Field({
  label,
  value,
  onChange,
  unit,
  step = 1,
  min,
  max,
  hint,
  readOnly = false,
  autoBadge = false,
  tone = "shared",
  compact = true,
}: Props) {
  const [showHint, setShowHint] = useState(false);

  const ring =
    tone === "after"
      ? "focus-within:ring-kramp-red/40"
      : "focus-within:ring-kramp-blue/30";

  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-kramp-blue/70 mb-0.5">
        <span className="flex-1 truncate">{label}</span>
        {autoBadge && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-kramp-red/80 bg-white/70 px-1 py-px rounded">
            auto
          </span>
        )}
        {hint && (
          <button
            type="button"
            onClick={() => setShowHint((s) => !s)}
            className="w-4 h-4 flex items-center justify-center rounded-full bg-kramp-blue/10 text-kramp-blue/60 text-[10px] font-bold hover:bg-kramp-blue/15"
            aria-label="More info"
          >
            i
          </button>
        )}
      </span>
      <div
        className={[
          "flex items-center gap-2 rounded-lg bg-white border px-3 transition-shadow",
          compact ? "h-10" : "h-11",
          readOnly
            ? "border-kramp-blue/10 bg-kramp-blue/[0.025]"
            : "border-kramp-blue/15 ring-2 ring-transparent",
          !readOnly && ring,
        ].join(" ")}
      >
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          readOnly={readOnly}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            if (!onChange) return;
            const n = parseFloat(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          className={[
            "w-full bg-transparent outline-none text-[15px] font-semibold text-kramp-blue tabular-nums",
            readOnly ? "cursor-default" : "",
          ].join(" ")}
        />
        {unit && (
          <span className="text-[12px] font-medium text-kramp-blue/50 select-none">
            {unit}
          </span>
        )}
      </div>
      {hint && showHint && (
        <p className="mt-1 text-[11px] leading-snug text-kramp-blue/60 animate-fade-in">
          {hint}
        </p>
      )}
    </label>
  );
}

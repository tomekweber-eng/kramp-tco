type BarItem = {
  label: string;
  value: number;
  tone: "revenue" | "savings";
};

export function ImpactBars({ items }: { items: BarItem[] }) {
  const max = Math.max(1, ...items.map((i) => Math.abs(i.value)));
  return (
    <div className="grid gap-2">
      {items.map((it, idx) => {
        const pct = (Math.abs(it.value) / max) * 100;
        const colour =
          it.tone === "revenue" ? "var(--color-kramp-red)" : "var(--color-kramp-success)";
        return (
          <div key={idx} className="grid gap-1">
            <div className="flex items-baseline justify-between gap-2 text-[11.5px]">
              <span className="font-semibold text-kramp-blue truncate">
                {it.label}
              </span>
              <span
                className="font-display font-bold tabular-nums"
                style={{ color: colour }}
              >
                {fmt(it.value)}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-kramp-blue/[0.07] overflow-hidden">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${pct}%`, background: colour }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function RevSavDonut({
  revenue,
  savings,
}: {
  revenue: number;
  savings: number;
}) {
  const total = Math.max(1, revenue + savings);
  const r = 36;
  const c = 2 * Math.PI * r;
  const revPart = (revenue / total) * c;
  const savPart = (savings / total) * c;

  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 90 90" className="w-[88px] h-[88px] flex-none">
        <circle
          cx="45"
          cy="45"
          r={r}
          stroke="var(--color-kramp-blue)"
          strokeOpacity="0.07"
          strokeWidth="13"
          fill="none"
        />
        {/* Revenue arc — red */}
        <circle
          cx="45"
          cy="45"
          r={r}
          stroke="var(--color-kramp-red)"
          strokeWidth="13"
          fill="none"
          strokeDasharray={`${revPart} ${c - revPart}`}
          strokeDashoffset="0"
          transform="rotate(-90 45 45)"
          strokeLinecap="butt"
        />
        {/* Savings arc — turquoise / success */}
        <circle
          cx="45"
          cy="45"
          r={r}
          stroke="var(--color-kramp-success)"
          strokeWidth="13"
          fill="none"
          strokeDasharray={`${savPart} ${c - savPart}`}
          strokeDashoffset={-revPart}
          transform="rotate(-90 45 45)"
          strokeLinecap="butt"
        />
      </svg>
      <div className="grid gap-1.5 min-w-0 flex-1">
        <Legend
          color="var(--color-kramp-red)"
          label="Dodatkowy przychód"
          value={revenue}
          pct={(revenue / total) * 100}
        />
        <Legend
          color="var(--color-kramp-success)"
          label="Oszczędności kosztów"
          value={savings}
          pct={(savings / total) * 100}
        />
      </div>
    </div>
  );
}

function Legend({
  color,
  label,
  value,
  pct,
}: {
  color: string;
  label: string;
  value: number;
  pct: number;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        aria-hidden
        className="flex-none w-3 h-3 rounded-sm"
        style={{ background: color }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-kramp-blue/65 leading-tight truncate">
          {label}
        </div>
        <div className="text-[12.5px] font-semibold text-kramp-blue tabular-nums leading-tight">
          {fmt(value)}{" "}
          <span className="text-kramp-blue/45 font-medium">
            · {pct.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function HoursSavedBar({
  m1Hours,
  m2Hours,
}: {
  m1Hours: number;
  m2Hours: number;
}) {
  const total = m1Hours + m2Hours;
  if (total <= 0) return null;
  const pct1 = (m1Hours / total) * 100;
  return (
    <div className="rounded-xl bg-kramp-blue/[0.04] border border-kramp-blue/10 px-3 py-2.5">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[10.5px] font-bold uppercase tracking-wider text-kramp-blue/65">
          Zaoszczędzone godziny rocznie
        </span>
        <span className="font-display text-[15px] font-bold tabular-nums text-kramp-blue">
          {total.toFixed(1).replace(".", ",")} godz.
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden flex bg-kramp-blue/[0.06]">
        <div
          className="h-full bg-kramp-red"
          style={{ width: `${pct1}%` }}
          title={`Spotkania — ${m1Hours.toFixed(1).replace(".", ",")} godz.`}
        />
        <div
          className="h-full bg-kramp-blue"
          style={{ width: `${100 - pct1}%` }}
          title={`Proces zamówień — ${m2Hours.toFixed(1).replace(".", ",")} godz.`}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-kramp-blue/55">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-kramp-red" /> Spotkania{" "}
          {m1Hours.toFixed(1).replace(".", ",")} godz.
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-kramp-blue" /> Zamówienia{" "}
          {m2Hours.toFixed(1).replace(".", ",")} godz.
        </span>
      </div>
    </div>
  );
}

function fmt(n: number) {
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 0,
  }).format(Math.round(abs));
  return `${formatted} €`;
}

import { hours, money } from "../lib/format";
import type { Results } from "../lib/compute";
import type { Customer } from "../types";
import { HoursSavedBar, ImpactBars, RevSavDonut } from "./Charts";

type Props = {
  results: Results;
  customer: Customer;
};

export default function SummarySlide({ results, customer }: Props) {
  const today = new Date().toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Brand header */}
      <div className="flex-none bg-kramp-red text-white px-4 py-2.5 flex items-center gap-2">
        <span className="inline-flex h-5 px-2 items-center rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
          Podsumowanie
        </span>
        <span className="text-[11px] opacity-90 truncate">To takie proste.</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
        {/* Customer + date */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-kramp-blue/55">
              Przygotowano dla
            </div>
            <div className="font-display text-[17px] font-bold text-kramp-blue truncate leading-tight">
              {customer.name || "—"}
            </div>
            <div className="text-[10.5px] text-kramp-blue/55 truncate">
              {customer.email}
              {customer.postalCode ? ` · ${customer.postalCode}` : ""}
            </div>
          </div>
          <div className="text-[10px] text-kramp-blue/45 whitespace-nowrap">
            {today}
          </div>
        </div>

        {/* Hero total */}
        <div className="rounded-2xl bg-kramp-red text-white px-4 py-3 shadow-md">
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-85">
            Roczna korzyść netto
          </div>
          <div className="font-display text-[36px] font-bold tabular-nums leading-[1] mt-0.5">
            {money(results.net_benefit)}
          </div>
          <div className="text-[10.5px] opacity-85 mt-1">
            Rocznie, przy pokazanym modelu konsolidacji
          </div>
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl bg-white border border-kramp-blue/10 px-3 py-2.5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-kramp-blue/55 mb-2">
            Skąd pochodzi korzyść
          </div>
          <RevSavDonut
            revenue={Math.max(0, results.total_revenue)}
            savings={Math.max(0, results.total_savings)}
          />
        </div>

        {/* Per-module bars */}
        <div className="rounded-2xl bg-white border border-kramp-blue/10 px-3 py-2.5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-kramp-blue/55 mb-2.5">
            Wpływ wg modułu
          </div>
          <ImpactBars
            items={[
              {
                label: "1. Spotkania z dostawcami",
                value: results.m1.revenue,
                tone: "revenue",
              },
              {
                label: "2. Proces zamówień",
                value: results.m2.revenue,
                tone: "revenue",
              },
              {
                label: "3. Amortyzacja zapasów",
                value: results.m3.savings,
                tone: "savings",
              },
              {
                label: "4. Transport",
                value: results.m4.savings,
                tone: "savings",
              },
            ]}
          />
        </div>

        {/* Hours saved bar */}
        <HoursSavedBar
          m1Hours={results.m1.hours_saved}
          m2Hours={results.m2.hours_saved}
        />

        {/* Per-module breakdown */}
        <div className="grid gap-1.5">
          <Row
            label="1. Spotkania z dostawcami"
            sub={`Zaoszczędzono ${hours(results.m1.hours_saved)}`}
            value={money(results.m1.revenue)}
            tone="revenue"
          />
          <Row
            label="2. Proces zamówień"
            sub={`Zaoszczędzono ${hours(results.m2.hours_saved)}`}
            value={money(results.m2.revenue)}
            tone="revenue"
          />
          <Row
            label="3. Amortyzacja zapasów"
            sub="Niższe odpisy zapasów"
            value={money(Math.abs(results.m3.savings))}
            tone={results.m3.savings >= 0 ? "savings" : "neutral"}
          />
          <Row
            label="4. Transport"
            sub="Skonsolidowany fracht"
            value={money(Math.abs(results.m4.savings))}
            tone={results.m4.savings >= 0 ? "savings" : "neutral"}
          />
        </div>

        <p className="text-[10.5px] leading-relaxed text-kramp-blue/55">
          Wartości orientacyjne na podstawie wprowadzonych danych. Ostateczne
          korzyści zależą od zakresu konsolidacji uzgodnionego z Kramp.
        </p>

        <button
          type="button"
          onClick={() => window.print()}
          className="no-print w-full h-11 rounded-xl bg-kramp-blue text-white font-display font-bold uppercase tracking-wide text-[14px] hover:bg-kramp-blue/90 active:scale-[0.99]"
        >
          Drukuj podsumowanie
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  sub,
  value,
  tone,
}: {
  label: string;
  sub: string;
  value: string;
  tone: "revenue" | "savings" | "neutral";
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white border border-kramp-blue/10 px-3 py-2">
      <div className="min-w-0">
        <div className="font-semibold text-kramp-blue text-[13px] truncate">
          {label}
        </div>
        <div className="text-[10.5px] text-kramp-blue/55 truncate">{sub}</div>
      </div>
      <div
        className={[
          "font-display text-[15px] font-bold tabular-nums whitespace-nowrap",
          tone === "savings"
            ? "text-kramp-success"
            : tone === "revenue"
              ? "text-kramp-red"
              : "text-kramp-blue",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

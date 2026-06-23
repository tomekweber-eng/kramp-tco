import { useState } from "react";
import { money } from "../lib/format";
import type { Inputs, Results } from "../lib/compute";
import type { Customer } from "../types";
import { HoursSavedBar, ImpactBars, RevSavDonut } from "./Charts";

type Props = {
  results: Results;
  customer: Customer;
  inputs: Inputs;
};

export default function SummarySlide({ results, customer, inputs }: Props) {
  const [downloading, setDownloading] = useState(false);

  // Render the 3-page PDF server-side, then open it (display) and download it.
  // Falls back to the browser print dialog when /api is unavailable (plain
  // Vite dev), so the demo never dead-ends on this button.
  async function downloadPdf() {
    if (downloading) return;
    setDownloading(true);
    try {
      const resp = await fetch("/api/report-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, inputs, results }),
      });
      if (!resp.ok) throw new Error(`status ${resp.status}`);
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      // Trigger a download (reliable across browsers)…
      const a = document.createElement("a");
      a.href = url;
      a.download = "raport-kramp.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      // …and open it in a new tab for immediate viewing.
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      // No backend (e.g. `npm run dev`): fall back to printing the summary.
      window.print();
    } finally {
      setDownloading(false);
    }
  }

  const today = new Date().toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  // Highlight the module that contributes the most.
  const levers = [
    { name: "Spotkania z dostawcami", value: results.m1.revenue },
    { name: "Proces zamawiania", value: results.m2.revenue },
    { name: "Amortyzacja zapasów", value: results.m3.savings },
    { name: "Transport", value: results.m4.savings },
  ];
  const topLever = levers.reduce((a, b) => (b.value > a.value ? b : a));

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
              Przygotowane dla
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
            Szacowany potencjał biznesowy
          </div>
          <div className="font-display text-[36px] font-bold tabular-nums leading-[1] mt-0.5">
            {money(results.net_benefit)}
          </div>
          <div className="text-[10.5px] opacity-85 mt-1">
            Potencjał z odzyskanego czasu i ograniczenia kosztów
          </div>
        </div>

        {/* Biggest lever */}
        <div className="rounded-2xl bg-kramp-turquoise-tint border border-kramp-turquoise/30 px-3.5 py-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-kramp-blue/55">
              Największy potencjał
            </div>
            <div className="font-display text-[15px] font-bold text-kramp-blue truncate leading-tight">
              {topLever.name}
            </div>
          </div>
          <div className="font-display text-[15px] font-bold tabular-nums text-kramp-blue whitespace-nowrap">
            {money(Math.abs(topLever.value))}
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
                label: "2. Proces zamawiania",
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

        <p className="text-[10.5px] leading-relaxed text-kramp-blue/55">
          Wartości orientacyjne na podstawie wprowadzonych danych. Ostateczna
          korzyść zależy od zakresu konsolidacji ustalonego z Kramp.
        </p>

        <div className="no-print grid gap-2">
          {/* TODO: docelowy URL umawiania rozmowy z doradcą Kramp */}
          <a
            href="https://www.kramp.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-xl bg-kramp-red text-white font-display font-bold uppercase tracking-wide text-[14px] hover:bg-kramp-red-dark active:scale-[0.99] flex items-center justify-center gap-2"
          >
            Umów rozmowę z doradcą
            <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none">
              <path
                d="M5 10h10m-4-4 4 4-4 4"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="w-full h-11 rounded-xl bg-kramp-blue text-white font-display font-bold uppercase tracking-wide text-[14px] hover:bg-kramp-blue/90 active:scale-[0.99] disabled:opacity-60"
          >
            {downloading ? "Generowanie…" : "Pobierz raport PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}


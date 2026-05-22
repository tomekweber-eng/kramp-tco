import { useMemo, useRef, useState } from "react";
import { compute, DEFAULTS, type Inputs } from "./lib/compute";
import { hours, money } from "./lib/format";
import BeforeCard from "./components/BeforeCard";
import AfterCard from "./components/AfterCard";
import Field from "./components/Field";
import ModuleSlide from "./components/ModuleSlide";
import { Pager, PagerNav, type PagerHandle } from "./components/Pager";
import HeroSlide from "./components/HeroSlide";
import CustomerForm from "./components/CustomerForm";
import SummarySlide from "./components/SummarySlide";
import { isCustomerValid, type Customer } from "./types";

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    email: "",
    postalCode: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [active, setActive] = useState(0);
  const pagerRef = useRef<PagerHandle>(null);

  const r = useMemo(() => compute(inputs), [inputs]);
  const customerOK = isCustomerValid(customer);
  const unlocked = submitted && customerOK;

  const set =
    <K extends keyof Inputs>(k: K) =>
    (v: number) =>
      setInputs((i) => ({ ...i, [k]: v }));

  const reset = () => {
    if (window.confirm("Zresetować wszystkie dane i zacząć od nowa?")) {
      setInputs(DEFAULTS);
      setCustomer({ name: "", email: "", postalCode: "" });
      setSubmitted(false);
      pagerRef.current?.goTo(0);
    }
  };

  // Slide layout:
  //   0       hero / welcome
  //   1..4    modules
  //   5       customer form (gate)
  //   6       summary (only after submit)
  const slides = [
    <HeroSlide key="hero" onStart={() => pagerRef.current?.next()} />,

    <ModuleSlide
      key="m1"
      index={1}
      title="Spotkania z dostawcami"
      subtitle="Czas spotkań z dostawcami w roku"
      hoursSaved={r.m1.hours_saved}
      impact={r.m1.revenue}
      impactLabel="Dodatkowy przychód / rok"
    >
      <BeforeCard>
        <Field
          label="Dostawcy"
          value={inputs.b_suppliers}
          onChange={set("b_suppliers")}
          min={1}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Spotkania / rok"
            value={inputs.b_meetings}
            onChange={set("b_meetings")}
            min={0}
          />
          <Field
            label="Spotkanie"
            value={inputs.b_duration}
            onChange={set("b_duration")}
            unit="h"
            step={0.5}
            min={0}
          />
        </div>
      </BeforeCard>
      <AfterCard>
        <Field
          label="Dostawcy"
          value={inputs.a_suppliers}
          onChange={set("a_suppliers")}
          min={0}
          tone="after"
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Spotkania / rok"
            value={inputs.a_meetings}
            onChange={set("a_meetings")}
            min={0}
            tone="after"
          />
          <Field
            label="Spotkanie"
            value={inputs.a_duration}
            onChange={set("a_duration")}
            unit="h"
            step={0.5}
            min={0}
            tone="after"
          />
        </div>
      </AfterCard>
      <Shared>
        <Field
          label="Przychód / h pracownika"
          value={inputs.turnover_per_hour}
          onChange={set("turnover_per_hour")}
          unit="€/h"
          min={0}
          hint="Całkowity obrót sklepu ÷ roczny czas pracy zespołu."
        />
      </Shared>
    </ModuleSlide>,

    <ModuleSlide
      key="m2"
      index={2}
      title="Proces zamawiania"
      subtitle="Wyszukiwanie produktów i przyjmowanie dostaw"
      hoursSaved={r.m2.hours_saved}
      impact={r.m2.revenue}
      impactLabel="Dodatkowy przychód / rok"
    >
      <Shared>
        <Field
          label="Zamówienia / rok"
          value={inputs.orders_per_year}
          onChange={set("orders_per_year")}
          min={0}
          hint="≈ 25 zamówień/tydzień × 47 tygodni na stałego dostawcę."
        />
      </Shared>
      <BeforeCard>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Znajdź produkt"
            value={inputs.b_time_find}
            onChange={set("b_time_find")}
            unit="min"
            step={0.5}
            min={0}
          />
          <Field
            label="Przyjęcie i ułożenie"
            value={inputs.b_time_treat}
            onChange={set("b_time_treat")}
            unit="min"
            step={0.5}
            min={0}
          />
        </div>
        <Stat label="Czas / rok" value={hours(r.m2.before_h)} />
      </BeforeCard>
      <AfterCard>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Znajdź produkt"
            value={r.m2.a_time_find}
            unit="min"
            readOnly
            autoBadge
            tone="after"
          />
          <Field
            label="Przyjęcie i ułożenie"
            value={r.m2.a_time_treat}
            unit="min"
            readOnly
            autoBadge
            tone="after"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label="Zamówienia / rok"
            value={`${Math.round(r.m2.after_orders)}`}
            sub="auto"
          />
          <Stat label="Czas / rok" value={hours(r.m2.after_h)} />
        </div>
      </AfterCard>
    </ModuleSlide>,

    <ModuleSlide
      key="m3"
      index={3}
      title="Amortyzacja zapasów"
      subtitle="Mniej towaru na półce, mniej odpisów"
      impact={r.m3.savings}
      impactLabel="Roczne oszczędności"
    >
      <BeforeCard>
        <Field
          label="Średnia wartość zapasów"
          value={inputs.b_stock_value}
          onChange={set("b_stock_value")}
          unit="€"
          step={1000}
          min={0}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="% do amortyzacji"
            value={inputs.b_pct_depr}
            onChange={set("b_pct_depr")}
            unit="%"
            min={0}
            max={100}
          />
          <Field
            label="Poziom amort."
            value={inputs.b_depr_level}
            onChange={set("b_depr_level")}
            unit="%"
            min={0}
            max={100}
          />
        </div>
        <Stat label="Roczny odpis" value={money(r.m3.before_depr)} />
      </BeforeCard>
      <AfterCard>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Redukcja zapasów"
            value={inputs.stock_reduction}
            onChange={set("stock_reduction")}
            unit="%"
            min={0}
            max={100}
            tone="after"
          />
          <Field
            label="% do amortyzacji"
            value={inputs.a_pct_depr}
            onChange={set("a_pct_depr")}
            unit="%"
            min={0}
            max={100}
            tone="after"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat
            label="Nowe zapasy"
            value={money(r.m3.a_stock_value)}
            sub="auto"
          />
          <Stat label="Odpis" value={money(r.m3.after_depr)} />
        </div>
      </AfterCard>
    </ModuleSlide>,

    <ModuleSlide
      key="m4"
      index={4}
      title="Transport"
      subtitle="Koszt frachtu we wszystkich zamówieniach"
      impact={r.m4.savings}
      impactLabel="Roczne oszczędności"
    >
      <BeforeCard>
        <Field
          label="Koszt transportu / rok"
          value={inputs.b_transport_cost}
          onChange={set("b_transport_cost")}
          unit="€"
          step={500}
          min={0}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="% przez Kramp"
            value={inputs.b_pct_kramp}
            onChange={set("b_pct_kramp")}
            unit="%"
            min={0}
            max={100}
          />
          <Stat
            label="Średni fracht (inni)"
            value={money(r.m4.avg_carriage_before)}
          />
        </div>
      </BeforeCard>
      <AfterCard>
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="% przez Kramp"
            value={inputs.a_pct_kramp}
            onChange={set("a_pct_kramp")}
            unit="%"
            min={0}
            max={100}
            tone="after"
          />
          <Field
            label="Fracht Kramp"
            value={inputs.kramp_freight}
            onChange={set("kramp_freight")}
            unit="€"
            min={0}
            tone="after"
            hint="0 € gdy wartość zamówienia przekracza 300 €."
          />
        </div>
        <Field
          label="Średni fracht (pozostali dostawcy)"
          value={inputs.a_avg_carriage_other}
          onChange={set("a_avg_carriage_other")}
          unit="€"
          step={0.5}
          min={0}
          tone="after"
        />
        <Stat label="Łączny koszt frachtu" value={money(r.m4.cost_after)} />
      </AfterCard>
    </ModuleSlide>,

    <CustomerForm
      key="customer"
      customer={customer}
      onChange={setCustomer}
      onSubmit={() => {
        setSubmitted(true);
        // Defer to allow the new summary slide to render before scrolling.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => pagerRef.current?.next()),
        );
      }}
      isValid={customerOK}
    />,
  ];

  if (unlocked) {
    slides.push(
      <SummarySlide key="summary" results={r} customer={customer} />,
    );
  }

  const summaryIndex = unlocked ? slides.length - 1 : -1;
  const onHero = active === 0;

  return (
    <div className="h-dvh flex flex-col bg-zinc-100 overflow-hidden">
      <div className="mx-auto w-full max-w-[460px] h-full flex flex-col bg-zinc-50 sm:my-3 sm:rounded-3xl sm:overflow-hidden sm:shadow-xl sm:h-[calc(100dvh-1.5rem)]">
        {!onHero && (
          <TopBar
            onReset={reset}
            step={active + 1}
            total={slides.length}
            customerName={unlocked ? customer.name : null}
          />
        )}

        <Pager ref={pagerRef} onIndexChange={setActive} children={slides} />

        <nav className="no-print flex-none border-t border-kramp-blue/10 bg-white">
          <PagerNav
            count={slides.length}
            active={active}
            onJump={(i) => pagerRef.current?.goTo(i)}
            onPrev={() => pagerRef.current?.prev()}
            onNext={() => pagerRef.current?.next()}
            highlight={summaryIndex}
          />

          {unlocked && active !== summaryIndex && (
            <button
              type="button"
              onClick={() => pagerRef.current?.goTo(summaryIndex)}
              className="w-full bg-kramp-red text-white px-4 py-2 active:bg-kramp-red-dark transition-colors"
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom, 0px) + 8px)",
              }}
            >
              <div className="grid grid-cols-3 gap-1 text-left">
                <Cell label="Przychód / rok" value={money(r.total_revenue)} />
                <Cell label="Oszczędności / rok" value={money(r.total_savings)} />
                <Cell
                  label="Netto / rok"
                  value={money(r.net_benefit)}
                  highlight
                />
              </div>
              <div className="text-center text-[9.5px] uppercase tracking-[0.18em] font-bold opacity-85 mt-1">
                Dotknij, aby zobaczyć podsumowanie →
              </div>
            </button>
          )}

          {!unlocked && active !== 0 && (
            <div
              className="px-4 pt-1 pb-2 text-center text-[10.5px] text-kramp-blue/50 leading-snug"
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom, 0px) + 6px)",
              }}
            >
              {active < 5
                ? "Przesuwaj moduły — pełny raport na końcu."
                : "Uzupełnij dane, aby odblokować podsumowanie."}
            </div>
          )}

          {!unlocked && active === 0 && (
            <div
              style={{
                paddingBottom:
                  "calc(env(safe-area-inset-bottom, 0px) + 4px)",
              }}
            />
          )}
        </nav>
      </div>
    </div>
  );
}

function TopBar({
  onReset,
  step,
  total,
  customerName,
}: {
  onReset: () => void;
  step: number;
  total: number;
  customerName: string | null;
}) {
  return (
    <header
      className="no-print flex-none bg-kramp-red text-white shadow-md"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="px-3 py-2 flex items-center gap-2.5">
        <KrampMark />
        <div className="min-w-0 flex-1 leading-none">
          <div className="font-display text-[15px] font-bold uppercase tracking-tight">
            TCO Calculator
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] font-semibold opacity-80 mt-0.5 truncate">
            {customerName ? customerName : "To takie proste."}
          </div>
        </div>
        <div className="text-[10px] uppercase tracking-wider font-bold opacity-85 tabular-nums whitespace-nowrap">
          {step}/{total}
        </div>
        <button
          type="button"
          onClick={onReset}
          aria-label="Resetuj do wartości domyślnych"
          className="flex-none w-8 h-8 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-[16px] h-[16px]" fill="none">
            <path
              d="M4 4v6h6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66L20 9"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}

function KrampMark() {
  return (
    <div className="flex-none w-9 h-6 grid place-items-center bg-white/10 rounded">
      <svg viewBox="0 0 56 36" className="w-7 h-4" aria-label="Kramp">
        <rect x="2" y="4" width="40" height="4" fill="#fff" />
        <rect x="2" y="14" width="32" height="4" fill="#fff" />
        <rect x="2" y="24" width="40" height="4" fill="#fff" />
        <polygon points="36,4 48,16 36,28 30,28 42,16 30,4" fill="#fff" />
      </svg>
    </div>
  );
}

function Shared({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-kramp-turquoise-tint border border-kramp-turquoise/30 px-3 py-2.5">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="inline-flex h-5 px-2 items-center rounded-full bg-kramp-turquoise text-[10px] font-bold uppercase tracking-wider text-white">
          Wspólne
        </span>
      </div>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white/60 px-2.5 py-1.5">
      <span className="text-[10px] text-kramp-blue/60 font-bold uppercase tracking-wider truncate">
        {label}
      </span>
      <span className="font-display text-[13.5px] font-bold tabular-nums text-kramp-blue flex items-baseline gap-1.5 whitespace-nowrap">
        {value}
        {sub && (
          <span className="text-[9px] font-bold uppercase tracking-wider text-kramp-red/80 bg-kramp-red-tint px-1 py-px rounded">
            {sub}
          </span>
        )}
      </span>
    </div>
  );
}

function Cell({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 px-1">
      <div className="text-[8.5px] uppercase tracking-wider font-bold opacity-75 leading-tight mb-0.5 truncate">
        {label}
      </div>
      <div
        className={[
          "font-display font-bold tabular-nums leading-none truncate",
          highlight ? "text-[16px]" : "text-[13px] opacity-95",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}
